/**
 * GET /api/reference/:kind/:slug
 *
 * Returns the full documentation object for one entity. Replaces the per-family
 * import.meta.glob patterns in pages/[slug].vue files.
 *
 * The response is mapped to the exact *Doc interface (IComponentDoc, IComposableDoc,
 * IConstDoc, IDirectiveDoc, IEnumDoc, IInterfaceDoc, ITypeDoc, IUtilDoc) so
 * ticket D can rebind pages without touching the template.
 *
 * Validation:
 *   - :kind must be one of the 8 DOC_KINDS (400 if invalid)
 *   - :slug must match kebab-case (400 if invalid)
 *   - entry not found (404)
 *
 * Query params:
 *   ?limit=<number>   cap the values array for consts/enums/types with very
 *                     large value lists (e.g. mdi-icons: 7297 values). All values
 *                     are returned when the parameter is omitted.
 *   ?locale=<string>  locale for descriptionFallback resolution (ADR #325).
 *                     Validated against I18N_LOCALE_CODES; missing/unknown
 *                     values silently fall back to DEFAULT_LOCALE — never a 4xx.
 *                     Reaches reference-mappers.ts (signature only for now —
 *                     resolving the translated value is ticket 4, not this one).
 *
 * Cache: 5 min per kind:slug:LOCALE combination — the locale is part of the cache
 * key precisely because it changes the response content (descriptionFallback), so
 * caching without it would serve one locale's text to every other locale (ADR #325).
 * The key carries REFERENCE_CACHE_FORMAT_VERSION (src/consts/cache.const.ts, #1063):
 * bump it whenever this response's shape changes. A backoffice edit invalidates every
 * limit/locale variant of the entry (src/utils/reference-cache.util.ts).
 */

import {
    DocEntry, DocProp, DocEmit, DocSlot, DocExample, DocValue,
    DocParam, DocReturn, DocDirectiveArg, DocDirectiveModifier, DocRelation,
} from '../../../db/entities'
import { REFERENCE_CACHE_NAMES, REFERENCE_CACHE_TTL_SECONDS } from '../../../../consts/cache.const'
import { referenceDocCacheKey } from '../../../../utils/reference-cache.util'
import { resolveLocale } from '../../../../utils/reference-locale.util'
import { mapComponentDoc, mapComposableDoc, mapConstDoc, mapDirectiveDoc, mapEnumDoc, mapInterfaceDoc, mapTypeDoc, mapUtilDoc } from '../../../../utils/reference-mappers.util'
import type { IComponentChildren, IComposableChildren, IConstChildren, IDirectiveChildren, IEnumChildren, IInterfaceChildren, ITypeChildren, IUtilChildren } from '../../../../interfaces/reference-mappers.interface'
import type { TDescriptionsBySlug } from '../../../../types/api-reference.type'
import type { TLocaleCode } from '../../../../types/i18n.type'

import { useDb } from '../../../../utils/db.util'
import { assertKind, assertSlug } from '../../../../utils/reference-validation.util'
export default defineCachedEventHandler(
    async (event) => {
        const kind = getRouterParam(event, 'kind') ?? ''
        const slug = getRouterParam(event, 'slug') ?? ''
        assertKind(kind)
        assertSlug(slug)

        const query = getQuery(event)
        const locale = resolveLocale(query.locale)
        const limitRaw = typeof query.limit === 'string' ? parseInt(query.limit, 10) : undefined
        const valuesLimit = limitRaw && Number.isFinite(limitRaw) && limitRaw > 0
            ? limitRaw
            : undefined

        const db = await useDb()

        // ─── 1. Fetch the root entry ─────────────────────────────────────

        const entry: any = await db
            .getRepository(DocEntry)
            .createQueryBuilder('e')
            .where('e.kind = :kind AND e.slug = :slug', { kind, slug })
            .getOne()

        if (!entry) {
            throw createError({ statusCode: 404, statusMessage: `${kind} '${slug}' not found` })
        }

        const entryId = entry.id

        // ─── 2. Fetch child tables in parallel based on kind ─────────────

        switch (kind) {
            case 'component': return buildComponentDoc(db, entry, entryId, locale)
            case 'composable': return buildComposableDoc(db, entry, entryId, locale)
            case 'const': return buildConstDoc(db, entry, entryId, valuesLimit, locale)
            case 'directive': return buildDirectiveDoc(db, entry, entryId, locale)
            case 'enum': return buildEnumDoc(db, entry, entryId, valuesLimit, locale)
            case 'interface': return buildInterfaceDoc(db, entry, entryId, locale)
            case 'type': return buildTypeDoc(db, entry, entryId, valuesLimit, locale)
            case 'util': return buildUtilDoc(db, entry, entryId, locale)
            default:
                throw createError({ statusCode: 500, statusMessage: 'Unhandled kind' })
        }
    },
    {
        maxAge: REFERENCE_CACHE_TTL_SECONDS,
        name: REFERENCE_CACHE_NAMES.doc,
        getKey: (event) => {
            const q = getQuery(event)
            return referenceDocCacheKey({
                kind: getRouterParam(event, 'kind') ?? '',
                slug: getRouterParam(event, 'slug') ?? '',
                limit: q.limit,
                locale: resolveLocale(q.locale),
            })
        },
    },
)

// ─── Helpers: ordered child-table queries ──────────────────────────────────

async function fetchProps (db: any, entryId: string) {
    return db
        .getRepository(DocProp)
        .createQueryBuilder('r')
        .where('r.entry_id = :id', { id: entryId })
        .orderBy('r.position', 'ASC')
        .getMany()
}

async function fetchEmits (db: any, entryId: string) {
    return db
        .getRepository(DocEmit)
        .createQueryBuilder('r')
        .where('r.entry_id = :id', { id: entryId })
        .orderBy('r.position', 'ASC')
        .getMany()
}

async function fetchSlots (db: any, entryId: string) {
    return db
        .getRepository(DocSlot)
        .createQueryBuilder('r')
        .where('r.entry_id = :id', { id: entryId })
        .orderBy('r.position', 'ASC')
        .getMany()
}

async function fetchExamples (db: any, entryId: string) {
    return db
        .getRepository(DocExample)
        .createQueryBuilder('r')
        .where('r.entry_id = :id', { id: entryId })
        .orderBy('r.position', 'ASC')
        .getMany()
}

async function fetchValues (db: any, entryId: string, limit?: number) {
    let qb = db
        .getRepository(DocValue)
        .createQueryBuilder('r')
        .where('r.entry_id = :id', { id: entryId })
        .orderBy('r.position', 'ASC')
    if (limit) qb = qb.limit(limit)
    return qb.getMany()
}

async function fetchParams (db: any, entryId: string) {
    return db
        .getRepository(DocParam)
        .createQueryBuilder('r')
        .where('r.entry_id = :id', { id: entryId })
        .orderBy('r.position', 'ASC')
        .getMany()
}

async function fetchReturns (db: any, entryId: string) {
    return db
        .getRepository(DocReturn)
        .createQueryBuilder('r')
        .where('r.entry_id = :id', { id: entryId })
        .orderBy('r.position', 'ASC')
        .getMany()
}

async function fetchRelations (db: any, entryId: string) {
    return db
        .getRepository(DocRelation)
        .createQueryBuilder('r')
        .where('r.entry_id = :id', { id: entryId })
        .andWhere('r.orphaned_at IS NULL')
        .orderBy('r.position', 'ASC')
        .getMany()
}

async function fetchDirectiveArgs (db: any, entryId: string) {
    return db
        .getRepository(DocDirectiveArg)
        .createQueryBuilder('r')
        .where('r.entry_id = :id', { id: entryId })
        .orderBy('r.position', 'ASC')
        .getMany()
}

async function fetchDirectiveModifiers (db: any, entryId: string) {
    return db
        .getRepository(DocDirectiveModifier)
        .createQueryBuilder('r')
        .where('r.entry_id = :id', { id: entryId })
        .orderBy('r.position', 'ASC')
        .getMany()
}

/**
 * Batch-fetches descriptions for a list of slugs of a given kind.
 * Used to enrich family/related relations with the target entry's descriptions.
 */
async function fetchDescriptionsBySlug (
    db: any,
    kind: string,
    slugs: string[],
): Promise<TDescriptionsBySlug> {
    const map: TDescriptionsBySlug = new Map()
    if (slugs.length === 0) return map
    const rows: any[] = await db
        .getRepository(DocEntry)
        .createQueryBuilder('e')
        .where('e.kind = :kind AND e.slug IN (:...slugs)', { kind, slugs })
        .getMany()
    for (const row of rows) {
        map.set(row.slug, {
            description_key: row.description_key,
            description_fallback: row.description_fallback,
        })
    }
    return map
}

// ─── Kind-specific doc builders ────────────────────────────────────────────

async function buildComponentDoc (db: any, entry: any, entryId: string, locale: TLocaleCode) {
    const [props, emits, slots, examples, relations] = await Promise.all([
        fetchProps(db, entryId),
        fetchEmits(db, entryId),
        fetchSlots(db, entryId),
        fetchExamples(db, entryId),
        fetchRelations(db, entryId),
    ])

    // Collect slugs of family/related entries for description enrichment.
    const slugsToFetch = [
        ...relations
            .filter((r: any) => r.rel_type === 'family' || r.rel_type === 'related')
            .map((r: any) => r.to_slug)
            .filter(Boolean),
    ]
    const descriptionsBySlug = await fetchDescriptionsBySlug(
        db,
        'component',
        [...new Set(slugsToFetch)],
    )

    const ch: IComponentChildren = { props, emits, slots, examples, relations, descriptionsBySlug }
    return mapComponentDoc(entry, ch, locale)
}

async function buildComposableDoc (db: any, entry: any, entryId: string, locale: TLocaleCode) {
    const [params, returns, examples, relations] = await Promise.all([
        fetchParams(db, entryId),
        fetchReturns(db, entryId),
        fetchExamples(db, entryId),
        fetchRelations(db, entryId),
    ])
    const ch: IComposableChildren = { params, returns, examples, relations }
    return mapComposableDoc(entry, ch, locale)
}

async function buildConstDoc (db: any, entry: any, entryId: string, valuesLimit: number | undefined, locale: TLocaleCode) {
    const [values, examples, relations] = await Promise.all([
        fetchValues(db, entryId, valuesLimit),
        fetchExamples(db, entryId),
        fetchRelations(db, entryId),
    ])
    const ch: IConstChildren = { values, examples, relations }
    return mapConstDoc(entry, ch, locale)
}

async function buildDirectiveDoc (db: any, entry: any, entryId: string, locale: TLocaleCode) {
    const [args, modifiers, examples, relations] = await Promise.all([
        fetchDirectiveArgs(db, entryId),
        fetchDirectiveModifiers(db, entryId),
        fetchExamples(db, entryId),
        fetchRelations(db, entryId),
    ])

    const relatedSlugs = relations
        .filter((r: any) => r.rel_type === 'related')
        .map((r: any) => r.to_slug)
        .filter(Boolean)
    const descriptionsBySlug = await fetchDescriptionsBySlug(
        db,
        'component',
        [...new Set(relatedSlugs)],
    )

    const ch: IDirectiveChildren = { args, modifiers, examples, relations, descriptionsBySlug }
    return mapDirectiveDoc(entry, ch, locale)
}

async function buildEnumDoc (db: any, entry: any, entryId: string, valuesLimit: number | undefined, locale: TLocaleCode) {
    const [values, examples, relations] = await Promise.all([
        fetchValues(db, entryId, valuesLimit),
        fetchExamples(db, entryId),
        fetchRelations(db, entryId),
    ])
    const ch: IEnumChildren = { values, examples, relations }
    return mapEnumDoc(entry, ch, locale)
}

async function buildInterfaceDoc (db: any, entry: any, entryId: string, locale: TLocaleCode) {
    const [props, examples, relations] = await Promise.all([
        fetchProps(db, entryId),
        fetchExamples(db, entryId),
        fetchRelations(db, entryId),
    ])
    const ch: IInterfaceChildren = { props, examples, relations }
    return mapInterfaceDoc(entry, ch, locale)
}

async function buildTypeDoc (db: any, entry: any, entryId: string, valuesLimit: number | undefined, locale: TLocaleCode) {
    const [values, examples, relations] = await Promise.all([
        fetchValues(db, entryId, valuesLimit),
        fetchExamples(db, entryId),
        fetchRelations(db, entryId),
    ])
    const ch: ITypeChildren = { values, examples, relations }
    return mapTypeDoc(entry, ch, locale)
}

async function buildUtilDoc (db: any, entry: any, entryId: string, locale: TLocaleCode) {
    const [params, returns, examples, relations] = await Promise.all([
        fetchParams(db, entryId),
        fetchReturns(db, entryId),
        fetchExamples(db, entryId),
        fetchRelations(db, entryId),
    ])
    const ch: IUtilChildren = { params, returns, examples, relations }
    return mapUtilDoc(entry, ch, locale)
}
