/**
 * catalog-neighbours.ts — l'ordre de l'INDEX d'une famille, calculé en UN seul
 * endroit, et le voisinage prev / next qui en découle (#1032).
 *
 * ⛔ Pourquoi ce n'est pas un simple `ORDER BY name`. L'index que le visiteur
 * lit n'est pas trié par nom : il est GROUPÉ.
 *   - component / interface / type / enum / const / util : groupes dans l'ordre
 *     de `SELECT DISTINCT category … ORDER BY category` (collation Postgres),
 *     entrées de chaque groupe dans l'ordre de `ORDER BY name` (même collation);
 *   - composable : groupes = `domain`, triés par `Array.prototype.sort()` en
 *     JAVASCRIPT (`composables/index.vue`) — un ordre de code-points qui peut
 *     différer de celui de Postgres. On le reproduit tel quel plutôt que de le
 *     « corriger » : prev/next doit suivre ce qui est AFFICHÉ;
 *   - directive : liste plate par nom.
 *
 * Les lignes arrivent DÉJÀ triées par nom (la requête du catalogue). Ce module
 * ne trie donc jamais les noms lui-même : il ne fait que grouper.
 */

import { DOMAIN_GROUPED_KINDS, FLAT_KINDS } from '../consts/catalog-neighbours.const'
import type { ICatalogNeighbourLink, ICatalogSequenceRow } from '../interfaces/catalog-neighbours.interface'
import type { TReferenceKind } from '../types/api-reference.type'

/**
 * Ordre de lecture de l'index d'une famille.
 *
 * @param rows          lignes déjà triées par nom (ordre du catalogue)
 * @param categoryOrder résultat de `fetchCategoryOrder` (ordre Postgres)
 *
 * Les composants membres de famille (`parent_slug`) n'ont pas de place dans
 * l'index : ils sont exclus ici et traités par `orderSiblings`.
 */
export function orderCatalogSequence (
    kind: TReferenceKind,
    rows: ICatalogSequenceRow[],
    categoryOrder: string[],
): ICatalogSequenceRow[] {
    const top = rows.filter(r => !r.parent_slug)

    if (FLAT_KINDS.includes(kind)) return top

    const isDomain = DOMAIN_GROUPED_KINDS.includes(kind)
    const keyOf = (r: ICatalogSequenceRow) => (isDomain ? r.domain : r.category) ?? ''

    const groups: string[] = isDomain
        ? [...new Set(top.map(keyOf))].sort()
        : categoryOrder

    const placed = new Set<string>()
    const out: ICatalogSequenceRow[] = []

    for (const group of groups) {
        for (const row of top) {
            if (keyOf(row) === group) {
                out.push(row)
                placed.add(row.slug)
            }
        }
    }

    // Entrées sans catégorie : absentes de l'index, mais elles ont une fiche.
    // On les met en queue, dans l'ordre du catalogue, plutôt que de les perdre.
    for (const row of top) {
        if (!placed.has(row.slug)) out.push(row)
    }

    return out
}

/**
 * Frères d'un composant membre de famille : ceux qui partagent son parent.
 * Ordre = ordre des relations `family` du parent (celui des puces de la carte
 * du catalogue), les frères non listés suivant dans l'ordre du catalogue.
 */
export function orderSiblings (
    rows: ICatalogSequenceRow[],
    parentSlug: string,
    familyOrder: string[],
): ICatalogSequenceRow[] {
    const siblings = rows.filter(r => r.parent_slug === parentSlug)
    const rank = (slug: string) => {
        const i = familyOrder.indexOf(slug)

        return i < 0 ? Number.MAX_SAFE_INTEGER : i
    }

    // `sort` est stable : à rang égal, l'ordre du catalogue est conservé.
    return [...siblings].sort((a, b) => rank(a.slug) - rank(b.slug))
}

const toLink = (row: ICatalogSequenceRow): ICatalogNeighbourLink => ({ slug: row.slug, name: row.name })

/** Voisins immédiats de `slug` dans une séquence ordonnée. */
export function neighboursIn (
    sequence: ICatalogSequenceRow[],
    slug: string,
): { prev: ICatalogNeighbourLink | null; next: ICatalogNeighbourLink | null } {
    const at = sequence.findIndex(r => r.slug === slug)

    if (at < 0) return { prev: null, next: null }

    const before = sequence[at - 1]
    const after = sequence[at + 1]

    return {
        prev: before ? toLink(before) : null,
        next: after ? toLink(after) : null,
    }
}
