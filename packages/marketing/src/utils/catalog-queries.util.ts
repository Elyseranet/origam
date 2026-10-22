/**
 * catalog-queries.ts — lectures de base partagées par les routes
 * /api/reference/** qui ordonnent ou relient le catalogue (#1032).
 *
 * Tout passe par TypeORM (`useDb()`), jamais par un client SQL à part.
 */

import { DocEntry, DocRelation } from '../../server/db/entities'
import { CROSS_FAMILY_REL_TYPES, SOURCE_BASENAME_SQL } from '../consts/catalog-neighbours.const'
import { DOC_KINDS } from '../consts/db.const'
import type {
    ICatalogNeighbourLink,
    ICatalogRelatedGroup,
    ICatalogSequenceRow,
    IResolvedTarget,
} from '../interfaces/catalog-neighbours.interface'
import type { TReferenceKind } from '../types/api-reference.type'

/**
 * Catégories d'une famille, dans l'ordre de Postgres — la requête EXACTE que
 * sert `/api/reference/categories/:kind`, extraite ici pour que l'index et la
 * navigation prev / next lisent le même ordre.
 */
export async function fetchCategoryOrder (db: any, kind: string): Promise<string[]> {
    const rows: Array<{ category: string }> = await db.query(
        `SELECT DISTINCT category
         FROM public.doc_entry
         WHERE kind = $1
           AND category IS NOT NULL
           AND category <> ''
           AND orphaned_at IS NULL
         ORDER BY category ASC`,
        [kind],
    )

    return rows.map(r => r.category)
}

/** Lignes d'une famille, dans l'ordre du catalogue (`ORDER BY name`). */
export async function fetchCatalogRows (db: any, kind: string): Promise<ICatalogSequenceRow[]> {
    return db
        .getRepository(DocEntry)
        .createQueryBuilder('e')
        .select(['e.slug', 'e.name', 'e.category', 'e.domain', 'e.parent_slug'])
        .where('e.kind = :kind', { kind })
        .andWhere('e.orphaned_at IS NULL')
        .orderBy('e.name', 'ASC')
        .getMany()
}

/** Slugs des membres de famille d'un composant, dans l'ordre `position`. */
export async function fetchFamilyOrder (db: any, parentSlug: string): Promise<string[]> {
    const rels: Array<{ to_slug: string | null }> = await db
        .getRepository(DocRelation)
        .createQueryBuilder('r')
        .innerJoin(DocEntry, 'p', 'p.id = r.entry_id')
        .where('p.kind = :kind AND p.slug = :slug', { kind: 'component', slug: parentSlug })
        .andWhere('r.rel_type = :rt', { rt: 'family' })
        .andWhere('r.orphaned_at IS NULL')
        .orderBy('r.position', 'ASC')
        .getMany()

    return rels.map(r => r.to_slug).filter((s): s is string => !!s)
}

/**
 * Résout des noms de relation (`OrigamBtn`, `useColor`, `date.util`) vers une
 * entrée, de façon EXACTE : le nom doit égaler le `name` de l'entrée OU le nom
 * de son fichier source sans extension. Une correspondance multiple est une
 * ambiguïté : on ne résout pas (jamais de lien deviné).
 */
async function resolveNames (db: any, names: string[]): Promise<Map<string, IResolvedTarget>> {
    const out = new Map<string, IResolvedTarget>()

    if (names.length === 0) return out

    const rows: Array<IResolvedTarget & { ident: string }> = await db.query(
        `SELECT e.kind, e.slug, e.name, e.name AS ident
         FROM public.doc_entry e
         WHERE e.orphaned_at IS NULL AND e.name = ANY($1)
         UNION
         SELECT e.kind, e.slug, e.name, ${SOURCE_BASENAME_SQL} AS ident
         FROM public.doc_entry e
         WHERE e.orphaned_at IS NULL AND e.source_file IS NOT NULL
           AND ${SOURCE_BASENAME_SQL} = ANY($1)`,
        [names],
    )

    const byIdent = new Map<string, IResolvedTarget[]>()

    for (const row of rows) {
        const list = byIdent.get(row.ident) ?? []

        if (!list.some(t => t.kind === row.kind && t.slug === row.slug)) {
            list.push({ kind: row.kind, slug: row.slug, name: row.name })
        }

        byIdent.set(row.ident, list)
    }

    for (const [ident, list] of byIdent) {
        const only = list[0]

        if (list.length === 1 && only) out.set(ident, only)
    }

    return out
}

/**
 * Entrées des AUTRES familles reliées à la fiche, depuis les relations
 * STOCKÉES seulement — dans les deux sens :
 *   - direct  : les relations de la fiche (interface → composants qu'elle sert);
 *   - inverse : les relations des autres fiches qui la visent (composant ←
 *     interfaces / types / enums / constantes / directives qui le servent).
 * Une relation sans cible résoluble est ignorée : pas de lien, pas d'invention.
 */
export async function fetchRelatedGroups (
    db: any,
    kind: TReferenceKind,
    entry: { id: string; slug: string; name: string; source_file: string | null },
): Promise<ICatalogRelatedGroup[]> {
    const relRepo = db.getRepository(DocRelation)
    const found = new Map<string, ICatalogNeighbourLink & { kind: string }>()

    const add = (target: { kind: string; slug: string; name: string }) => {
        if (target.kind === kind) return
        found.set(`${target.kind}:${target.slug}`, target)
    }

    // ── Sens direct ───────────────────────────────────────────────────────
    const direct: any[] = await relRepo
        .createQueryBuilder('r')
        .where('r.entry_id = :id', { id: entry.id })
        .andWhere('r.rel_type IN (:...types)', { types: CROSS_FAMILY_REL_TYPES })
        .andWhere('r.orphaned_at IS NULL')
        .getMany()

    const unresolved = [...new Set(direct.filter(r => !r.to_kind && r.to_name).map(r => r.to_name as string))]
    const byName = await resolveNames(db, unresolved)

    const typed = direct.filter(r => r.to_kind && r.to_slug)
    const typedEntries: any[] = typed.length > 0
        ? await db
            .getRepository(DocEntry)
            .createQueryBuilder('e')
            .select(['e.kind', 'e.slug', 'e.name'])
            .where('e.orphaned_at IS NULL')
            .andWhere('e.slug IN (:...slugs)', { slugs: [...new Set(typed.map(r => r.to_slug))] })
            .getMany()
        : []
    const typedIndex = new Map(typedEntries.map(e => [`${e.kind}:${e.slug}`, e]))

    for (const rel of direct) {
        if (rel.to_kind && rel.to_slug) {
            const hit = typedIndex.get(`${rel.to_kind}:${rel.to_slug}`)

            if (hit) add(hit)
        } else if (rel.to_name) {
            const hit = byName.get(rel.to_name)

            if (hit) add(hit)
        }
    }

    // ── Sens inverse ──────────────────────────────────────────────────────
    const identifiers = [entry.name]
    const basename = entry.source_file?.split('/').pop()?.replace(/\.[^./]+$/, '')

    if (basename) identifiers.push(basename)

    const inverse: any[] = await relRepo
        .createQueryBuilder('r')
        .innerJoin(DocEntry, 's', 's.id = r.entry_id AND s.orphaned_at IS NULL')
        .addSelect(['s.kind', 's.slug', 's.name'])
        .where('r.rel_type IN (:...types)', { types: CROSS_FAMILY_REL_TYPES })
        .andWhere('r.orphaned_at IS NULL')
        .andWhere('s.kind <> :own', { own: kind })
        .andWhere(
            '((r.to_kind = :kind AND r.to_slug = :slug) OR (r.to_kind IS NULL AND r.to_name IN (:...idents)))',
            { kind, slug: entry.slug, idents: identifiers },
        )
        .getRawMany()

    const nameCandidates = [...new Set(inverse.filter(r => !r.r_to_kind).map(r => r.r_to_name as string))]
    const resolvedInverse = await resolveNames(db, nameCandidates)

    for (const row of inverse) {
        if (!row.r_to_kind) {
            const target = resolvedInverse.get(row.r_to_name)

            if (!target || target.kind !== kind || target.slug !== entry.slug) continue
        }

        add({ kind: row.s_kind, slug: row.s_slug, name: row.s_name })
    }

    // ── Regroupement par famille, dans l'ordre canonique des familles ─────
    const groups: ICatalogRelatedGroup[] = []

    for (const family of DOC_KINDS as ReadonlyArray<TReferenceKind>) {
        const entries = [...found.values()]
            .filter(t => t.kind === family)
            .map(t => ({ slug: t.slug, name: t.name }))
            .sort((a, b) => a.name.localeCompare(b.name))

        if (entries.length > 0) groups.push({ kind: family, entries })
    }

    return groups
}
