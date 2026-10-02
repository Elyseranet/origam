/**
 * GET /api/reference/counts
 *
 * Dénombrements du catalogue, les 8 familles en un seul appel.
 *
 * ⛔ POURQUOI CETTE ROUTE EXISTE. Le rail de navigation (#1032) doit, sur
 * CHAQUE page du site, afficher le nombre d'entrées par famille et décider de
 * la forme du panneau (groupé par catégorie, ou recherche d'abord). Les deux
 * informations sont des MÉTA-données du catalogue — et les obtenir en appelant
 * `/api/reference/:kind` pour les 8 familles coûterait, mesuré le 2026-10-02
 * sur cette base :
 *
 *   component 163 Ko · composable 62 · directive 2 · interface 322 ·
 *   type 105 · enum 35 · const 134 · util 163   →  **986 Ko au chargement**
 *
 * Cette route rend les mêmes informations en **moins d'un kilo-octet**. Le
 * chargement paresseux par famille (arbitrage du propriétaire) reste entier :
 * `/api/reference/:kind` n'est appelé qu'à l'ouverture du panneau concerné.
 *
 * `navigable` vs `total` : seuls les composants ont une hiérarchie
 * (`parent_slug` renseigné sur 124 des 218 entrées ; zéro sur les 7 autres
 * familles — vérifié). Un membre de famille n'a pas de page à lui, donc il
 * n'est pas une cible de navigation : le rail affiche `navigable`, et c'est
 * pour ça que la pastille des composants dit 94 et non 218.
 *
 * `categories` compte les catégories DES ENTRÉES NAVIGABLES, pour la même
 * raison : grouper sur des catégories qu'on n'affiche pas serait faux.
 *
 * Réponse : Record<kind, { total, navigable, categories }> — les 8 familles
 * toujours présentes, à zéro si la base est vide, jamais absentes : le client
 * n'a pas à distinguer « famille vide » de « famille manquante ».
 *
 * Pas de `?locale=` : trois entiers par famille, rien de traduisible. Ajouter
 * la locale à la clé de cache diviserait le cache par le nombre de langues
 * sans changer une seule valeur.
 *
 * Cache : 5 min, comme les deux autres routes /api/reference/**.
 */

// DOC_KINDS is the single source of truth for the 8 families — the same module
// `assertKind` reads, so this route can never drift from the others.
import { DOC_KINDS } from '../../db/db.const.mjs'

const CACHE_TTL_SECONDS = 300

interface ICountRow {
    kind: string
    total: string | number
    navigable: string | number
    categories: string | number
}

export default defineCachedEventHandler(
    async (): Promise<Record<string, { total: number; navigable: number; categories: number }>> => {
        const db = await useDb()

        const rows: ICountRow[] = await db.query(
            `SELECT kind,
                    count(*)                                          AS total,
                    count(*) FILTER (WHERE parent_slug IS NULL)       AS navigable,
                    count(DISTINCT category) FILTER (
                        WHERE parent_slug IS NULL
                          AND category IS NOT NULL
                          AND category <> ''
                    )                                                 AS categories
             FROM public.doc_entry
             WHERE orphaned_at IS NULL
             GROUP BY kind`,
        )

        // Seed every known kind at zero FIRST, then overlay what the base
        // actually holds: a family the pipeline has not yet synced reads 0
        // rather than `undefined`, so no consumer needs a null guard.
        const out: Record<string, { total: number; navigable: number; categories: number }> = {}

        for (const kind of DOC_KINDS) {
            out[kind] = { total: 0, navigable: 0, categories: 0 }
        }

        for (const row of rows) {
            if (!(row.kind in out)) continue

            // `count()` comes back as a STRING from node-postgres (bigint is not
            // safely representable as a JS number, so pg never casts it). Left
            // as-is it would serialise to `"94"` and every arithmetic comparison
            // on the client would be a string comparison — `"972" < "94"` is
            // true. Coerced here, once, at the boundary.
            out[row.kind] = {
                total: Number(row.total),
                navigable: Number(row.navigable),
                categories: Number(row.categories),
            }
        }

        return out
    },
    {
        maxAge: CACHE_TTL_SECONDS,
        name: 'reference-counts',
        getKey: () => 'counts:all',
    },
)
