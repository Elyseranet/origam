/**
 * GET /api/reference/categories/:kind
 *
 * Returns the list of category names for one entity family, DÉRIVÉES des
 * entrées réelles (`SELECT DISTINCT category FROM doc_entry`). Les pages index
 * groupent par catégorie (`entry.category === category`) → cet endpoint doit
 * renvoyer des chaînes qui matchent `entry.category`.
 *
 * NB : la table `doc_category` (ordre/labels curatés) n'est pas peuplée par le
 * pipeline ; on dérive donc directement des entrées pour que la grille ne soit
 * jamais vide. Ordre alphabétique (l'ordre curaté pourra venir de doc_category
 * plus tard, en fallback sur ce dérivé).
 *
 * Validation : :kind ∈ 8 DOC_KINDS (400 sinon).
 * Réponse : string[] (noms de catégories, triés).
 *
 * ?locale= (ADR #325, task 3) : accepté et validé (via resolveLocale) pour
 * rester cohérent avec les deux autres routes /api/reference/**, mais NON
 * inclus dans la clé de cache — `doc_entry.category` est une valeur brute
 * (ex. "Layout", "Forms"), jamais un couple *_key/*_fallback traduit. Il n'y a
 * donc rien de locale-dépendant à mettre en cache séparément ici. Si
 * `category` devient traduisible un jour, ce cache devra être revu en même
 * temps (cf. tâche 4 de l'ADR).
 *
 * Cache : 5 min par kind.
 */

import { REFERENCE_CACHE_NAMES, REFERENCE_CACHE_TTL_SECONDS } from '../../../../src/consts/cache.const'
import { referenceCategoriesCacheKey } from '../../../../src/utils/reference-cache.util'
import { resolveLocale } from '../../../../src/utils/reference-locale.util'

import { useDb } from '../../../../src/utils/db.util'
import { assertKind } from '../../../../src/utils/reference-validation.util'
export default defineCachedEventHandler(
    async (event): Promise<string[]> => {
        const kind = getRouterParam(event, 'kind') ?? ''
        assertKind(kind)
        // Validated for consistency with the other /api/reference/** routes —
        // intentionally unused: see the cache-key note above.
        resolveLocale(getQuery(event).locale)

        const db = await useDb()

        return fetchCategoryOrder(db, kind)
    },
    {
        maxAge: REFERENCE_CACHE_TTL_SECONDS,
        name: REFERENCE_CACHE_NAMES.categories,
        getKey: event => referenceCategoriesCacheKey(getRouterParam(event, 'kind') ?? ''),
    },
)
