/**
 * GET /api/reference/:kind
 *
 * Returns the lightweight catalog for one entity family. Replaces the static
 * *_CATALOG constants and the import.meta.glob index patterns used by the
 * pages index.vue files.
 *
 * Validation: :kind must be one of the 8 DOC_KINDS (400 otherwise).
 *
 * Query params:
 *   ?category=<string>        filter by category/domain (all if omitted)
 *   ?limit=<number>           cap the number of entries returned (all if omitted)
 *   ?orphaned=1               include orphaned entries (excluded by default)
 *   ?includePropSurface=1     (component only) include props[] + playground in each entry
 *   ?locale=<string>          locale for descriptionFallback resolution (ADR #325).
 *                             Validated against I18N_LOCALE_CODES; missing/unknown
 *                             values silently fall back to DEFAULT_LOCALE — never a 4xx.
 *                             Reaches reference-mappers.ts (signature only for now —
 *                             resolving the translated value is ticket 4, not this one).
 *
 * Response shape per kind:
 *   component  - IComponentEntry[]   (includes family members via batch relation query)
 *                with ?includePropSurface=1: IComponentThemeSurface[] (props + playground)
 *   composable - IComposableEntry[]  (includes related slugs)
 *   const      - IConstEntry[]
 *   directive  - catalog entry (slug, name, icon, category, descriptionKey, descriptionFallback)
 *   enum       - IEnumEntry[]
 *   interface  - IInterfaceEntry[]
 *   type       - ITypeEntry[]        (includes kind: type or enum from kind_extra)
 *   util       - IUtilEntry[]        (includes related slugs)
 *
 * Cache: 5 min per kind + filter + LOCALE combination — the locale is part of the
 * cache key precisely because it changes the response content (descriptionFallback),
 * so caching without it would serve one locale's text to every other locale (ADR #325).
 * Invalidate on re-sync / backoffice edit (ticket E clears the storage keys).
 */

import { DocEntry, DocProp, DocRelation } from '../../db/entities'
import { resolveLocale } from '../../utils/reference-locale'
import type { TLocaleCode } from '../../../src/types/i18n.type'

/** Inline type to avoid cross-directory import type issues with Nitro esbuild. */
type DescMap = Map<string, { description_key: string | null; description_fallback: string | null }>

const CACHE_TTL_SECONDS = 300

export default defineCachedEventHandler(
    async (event) => {
        const kind = getRouterParam(event, 'kind') ?? ''
        assertKind(kind)

        const query = getQuery(event)
        const locale = resolveLocale(query.locale)
        const categoryFilter = typeof query.category === 'string' && query.category
            ? query.category
            : undefined
        const limitRaw = typeof query.limit === 'string' ? parseInt(query.limit, 10) : undefined
        const limit = limitRaw && Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : undefined
        const includeOrphaned = query.orphaned === '1'
        const includePropSurface = query.includePropSurface === '1' && kind === 'component'

        const db = await useDb()
        const entryRepo = db.getRepository(DocEntry)

        let qb = entryRepo
            .createQueryBuilder('e')
            .where('e.kind = :kind', { kind })
            .orderBy('e.name', 'ASC')

        if (!includeOrphaned) {
            qb = qb.andWhere('e.orphaned_at IS NULL')
        }
        if (categoryFilter) {
            qb = qb.andWhere('e.category = :cat', { cat: categoryFilter })
        }
        if (limit) {
            qb = qb.limit(limit)
        }

        const entries: any[] = await qb.getMany()

        if (entries.length === 0) return []

        // ─── Kinds with relation data in the catalog ───────────────────────

        if (kind === 'component') {
            if (includePropSurface) {
                return buildComponentThemeCatalog(db, entries)
            }
            return buildComponentCatalog(db, entries, locale)
        }
        if (kind === 'composable') {
            return buildRelatedCatalog(db, entries, mapComposableEntry, locale)
        }
        if (kind === 'util') {
            return buildRelatedCatalog(db, entries, mapUtilEntry, locale)
        }

        // ─── Kinds without relation data in the catalog ────────────────────

        return entries.map((e: any) => {
            switch (kind) {
                case 'const': return mapConstEntry(e, locale)
                case 'directive': return mapDirectiveCatalogEntry(e, locale)
                case 'enum': return mapEnumEntry(e, locale)
                case 'interface': return mapInterfaceEntry(e, locale)
                case 'type': return mapTypeEntry(e, locale)
                default: return { slug: e.slug, name: e.name }
            }
        })
    },
    {
        maxAge: CACHE_TTL_SECONDS,
        name: 'reference-catalog',
        getKey: (event) => {
            const kind = getRouterParam(event, 'kind') ?? ''
            const q = getQuery(event)
            const ps = q.includePropSurface === '1' ? ':props' : ''
            const locale = resolveLocale(q.locale)
            return `catalog:${kind}${ps}:${q.category ?? ''}:${q.limit ?? ''}:${q.orphaned ?? ''}:${locale}`
        },
    },
)

// ─── Catalog builders with batch relation queries ──────────────────────────

/**
 * Component catalog: includes IComponentFamilyMember[] for each entry.
 * Two extra queries: family relations + family member descriptions.
 */
async function buildComponentCatalog (db: any, entries: any[], locale: TLocaleCode) {
    const ids = entries.map((e: any) => e.id as string)

    const familyRels: any[] = ids.length > 0
        ? await db
            .getRepository(DocRelation)
            .createQueryBuilder('r')
            .where('r.entry_id IN (:...ids)', { ids })
            .andWhere('r.rel_type = :rt', { rt: 'family' })
            .orderBy('r.position', 'ASC')
            .getMany()
        : []

    // Batch-fetch descriptions for family member entries.
    const descMap: DescMap = new Map()
    const familySlugs = [...new Set(familyRels.map((r: any) => r.to_slug).filter(Boolean))]
    if (familySlugs.length > 0) {
        const descRows: any[] = await db
            .getRepository(DocEntry)
            .createQueryBuilder('fe')
            .where('fe.kind = :k AND fe.slug IN (:...slugs)', { k: 'component', slugs: familySlugs })
            .getMany()
        for (const row of descRows) {
            descMap.set(row.slug, {
                description_key: row.description_key,
                description_fallback: row.description_fallback,
            })
        }
    }

    // Group family members by parent entry_id.
    const familyByEntryId = new Map<string, ReturnType<typeof mapComponentEntry>['family']>()
    for (const rel of familyRels) {
        const list = familyByEntryId.get(rel.entry_id) ?? []
        const desc = descMap.get(rel.to_slug) ?? { description_key: null, description_fallback: null }
        list.push({
            slug: rel.to_slug ?? '',
            name: rel.to_name ?? '',
            descriptionKey: rel.description_key || desc.description_key || '',
            descriptionFallback: rel.description_fallback || desc.description_fallback || '',
        })
        familyByEntryId.set(rel.entry_id, list)
    }

    return entries.map((e: any) =>
        mapComponentEntry(e, familyByEntryId.get(e.id) ?? [], locale),
    )
}

/**
 * Component catalog with full prop surface — used by the /theming builder.
 *
 * Returns a flat array of IComponentThemeSurface objects (no family relation
 * data, but includes `props[]` and `playground` for every component).
 * Consumed by useThemeBuilderCatalog via ?includePropSurface=1.
 */
async function buildComponentThemeCatalog (db: any, entries: any[]) {
    const ids = entries.map((e: any) => e.id as string)

    const propRows: any[] = ids.length > 0
        ? await db
            .getRepository(DocProp)
            .createQueryBuilder('p')
            .where('p.entry_id IN (:...ids)', { ids })
            .andWhere('p.orphaned_at IS NULL')
            .orderBy('p.entry_id', 'ASC')
            .addOrderBy('p.position', 'ASC')
            .getMany()
        : []

    const propsByEntryId = new Map<string, any[]>()
    for (const p of propRows) {
        const bucket = propsByEntryId.get(p.entry_id) ?? []
        bucket.push(p)
        propsByEntryId.set(p.entry_id, bucket)
    }

    return entries.map((e: any) => ({
        slug: e.slug,
        name: e.name,
        icon: e.icon ?? '',
        category: e.category ?? '',
        parentSlug: e.parent_slug ?? null,
        descriptionFallback: e.description_fallback ?? '',
        descriptionKey: e.description_key ?? '',
        playground: (e.kind_extra as any)?.playground ?? null,
        props: (propsByEntryId.get(e.id) ?? []).map((p: any) => ({
            name: p.name,
            type: {
                label: p.type_label ?? '',
                slug: p.type_slug ?? null,
                kind: p.type_kind ?? null,
            },
            required: p.required ?? false,
            defaultValue: p.default_value ?? '',
        })),
    }))
}

/**
 * Generic "related slugs" catalog builder — used for composable and util.
 * Accepts the entry-level mapper so the shape stays kind-specific.
 */
async function buildRelatedCatalog (
    db: any,
    entries: any[],
    mapper: (row: any, related: string[], locale: TLocaleCode) => unknown,
    locale: TLocaleCode,
) {
    const ids = entries.map((e: any) => e.id as string)

    const relRels: any[] = ids.length > 0
        ? await db
            .getRepository(DocRelation)
            .createQueryBuilder('r')
            .where('r.entry_id IN (:...ids)', { ids })
            .andWhere('r.rel_type = :rt', { rt: 'related' })
            .getMany()
        : []

    const relatedByEntryId = new Map<string, string[]>()
    for (const rel of relRels) {
        const list = relatedByEntryId.get(rel.entry_id) ?? []
        if (rel.to_slug) list.push(rel.to_slug)
        relatedByEntryId.set(rel.entry_id, list)
    }

    return entries.map((e: any) => mapper(e, relatedByEntryId.get(e.id) ?? [], locale))
}
