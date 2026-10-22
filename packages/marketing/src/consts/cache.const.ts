/**
 * cache.const.ts — constantes du cache Nitro des handlers `defineCachedEventHandler`
 * (#1063). Elles vivent ici, jamais en ligne dans un handler : une valeur
 * redéclarée dans chaque fichier dérive, et la version de format ci-dessous
 * n'a de sens que si elle est UNIQUE.
 */

/** Durée de vie (s) d'une entrée de cache des handlers `server/api/reference/**`. */
export const REFERENCE_CACHE_TTL_SECONDS = 300

/** Durée de vie (s) d'une entrée de cache des handlers qui interrogent un service externe (GitHub, npm). */
export const EXTERNAL_CACHE_TTL_SECONDS = 3600

/**
 * Version de FORMAT des réponses des 4 handlers `server/api/reference/**`
 * (`reference-catalog`, `reference-doc`, `reference-categories`,
 * `reference-neighbours`). Elle préfixe la clé de cache de chacun
 * (`src/utils/reference-cache.util.ts`).
 *
 * ⛔ À INCRÉMENTER (`v1` -> `v2`, ...) dans le MÊME commit que tout changement
 * de FORME de la réponse d'un de ces handlers : champ renommé (`name` ->
 * `label`, #1046), ajouté, retiré, ou de type modifié.
 *
 * Pourquoi : `defineCachedEventHandler` est en `swr: true` par défaut
 * (`nitropack/dist/runtime/internal/cache.mjs`). Une entrée expirée — ou dont
 * l'`integrity` ne correspond plus — est SERVIE TELLE QUELLE pendant que la
 * revalidation tourne ; si la revalidation échoue (base absente, erreur), elle
 * l'est indéfiniment. Sans version dans la clé, une entrée d'ancienne forme
 * est donc rendue au code qui attend la nouvelle (500 au SSR de
 * `/components/alert` après #1046). Avec une nouvelle version, la clé change :
 * l'ancienne entrée n'est plus lue et la requête recalcule la réponse.
 *
 * Inutile en revanche pour un changement qui ne modifie pas la forme (valeur
 * corrigée, requête optimisée) : le TTL suffit.
 */
export const REFERENCE_CACHE_FORMAT_VERSION = 'v1'

/**
 * Préfixe de stockage (unstorage) sous lequel Nitro écrit les entrées des
 * handlers en cache : `<base>:<group>:<name>:<clé>.json`, avec les valeurs par
 * défaut `base = /cache` et `group = nitro/handlers` de
 * `defineCachedEventHandler`, que les handlers ne surchargent pas. Mesuré en
 * dev : `.nuxt/cache/nitro/handlers/reference-doc/<clé>.json`.
 *
 * ⚠️ `useStorage('nitro:handlers')` (sans `cache:`) ne désigne PAS cet espace :
 * c'était la cause de l'invalidation admin sans effet (#1063).
 */
export const NITRO_HANDLERS_CACHE_STORAGE_BASE = 'cache:nitro:handlers'

/** Valeurs de l'option `name` des 4 handlers de référence — répertoire de leurs entrées dans le stockage. */
export const REFERENCE_CACHE_NAMES = {
    catalog: 'reference-catalog',
    doc: 'reference-doc',
    categories: 'reference-categories',
    neighbours: 'reference-neighbours'
} as const
