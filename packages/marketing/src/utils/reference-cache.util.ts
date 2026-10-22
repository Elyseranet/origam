/**
 * reference-cache.ts — construction des clés de cache des handlers
 * `server/api/reference/**` et invalidation de la fiche détail (#1063).
 *
 * ⛔ UN SEUL endroit construit la clé de `reference-doc` : `referenceDocCacheKey`.
 * Le `getKey` du handler ET l'invalidation admin en dérivent — c'est ce qui
 * manquait : l'invalidation reconstruisait la clé à la main, sans la locale,
 * dans un espace de stockage (`nitro:handlers`) qui n'est pas celui où Nitro
 * écrit (`cache:nitro:handlers`), et ne supprimait donc rien.
 *
 * Chaque clé commence par `REFERENCE_CACHE_FORMAT_VERSION` : voir la
 * constante pour QUAND l'incrémenter.
 */

import {
    NITRO_HANDLERS_CACHE_STORAGE_BASE,
    REFERENCE_CACHE_FORMAT_VERSION,
    REFERENCE_CACHE_NAMES
} from '../consts/cache.const'
import { I18N_LOCALE_CODES } from '../consts/i18n-codes.const'
import type {
    IReferenceCacheStorage,
    IReferenceCatalogCacheKeyParts,
    IReferenceDocCacheKeyParts
} from '../interfaces/reference-cache.interface'

/**
 * Reproduit l'`escapeKey` de `defineCachedEventHandler`
 * (`nitropack/dist/runtime/internal/cache.mjs`) : toute clé fournie par
 * `getKey` y est dépouillée de ses caractères non-mot (`:`, `-`, …) avant
 * d'être écrite — `doc:component:alert::en` devient `doccomponentalerten`.
 * Épinglé par `reference-cache.spec.ts` ; à revérifier à chaque montée de
 * `nitropack`.
 */
export function escapeNitroCacheKey (key: string): string {
    return String(key).replace(/\W/g, '')
}

/** Clé (avant échappement Nitro) de `reference-doc`. */
export function referenceDocCacheKey ({ kind, slug, limit, locale }: IReferenceDocCacheKeyParts): string {
    return `${REFERENCE_CACHE_FORMAT_VERSION}:doc:${kind}:${slug}:${limit ?? ''}:${locale}`
}

/** Clé de `reference-catalog`. */
export function referenceCatalogCacheKey (p: IReferenceCatalogCacheKeyParts): string {
    const ps = p.includePropSurface ? ':props' : ''
    return `${REFERENCE_CACHE_FORMAT_VERSION}:catalog:${p.kind}${ps}:${p.category ?? ''}:${p.limit ?? ''}:${p.orphaned ?? ''}:${p.locale}`
}

/** Clé de `reference-categories`. */
export function referenceCategoriesCacheKey (kind: string): string {
    return `${REFERENCE_CACHE_FORMAT_VERSION}:categories:${kind}`
}

/** Clé de `reference-neighbours`. */
export function referenceNeighboursCacheKey (kind: string, slug: string): string {
    return `${REFERENCE_CACHE_FORMAT_VERSION}:neighbours:${kind}:${slug}`
}

/**
 * Supprime TOUTES les variantes en cache (`limit` × locale) de la fiche
 * `kind`/`slug`.
 *
 * La clé stockée est échappée par Nitro, donc `limit` et `locale` ne se
 * séparent plus du slug : on liste les clés du dossier `reference-doc` et on
 * retient celles qui commencent par l'échappement de `v1:doc:<kind>:<slug>:`
 * et se terminent par une locale connue. Une fiche voisine dont le slug
 * prolonge celui-ci (`btn` / `btngroup`) peut être purgée au passage : un
 * cache évincé en trop se recalcule, un cache oublié sert une édition périmée.
 *
 * Non bloquante : toute erreur de stockage est journalisée, jamais relancée —
 * l'édition est déjà en base, le TTL reste le filet. Renvoie le nombre
 * d'entrées supprimées.
 */
export async function invalidateReferenceDoc (
    storage: IReferenceCacheStorage,
    kind: string,
    slug: string
): Promise<number> {
    const folder = `${NITRO_HANDLERS_CACHE_STORAGE_BASE}:${REFERENCE_CACHE_NAMES.doc}`
    const prefix = escapeNitroCacheKey(`${REFERENCE_CACHE_FORMAT_VERSION}:doc:${kind}:${slug}:`)
    const localeSuffixes = I18N_LOCALE_CODES.map(l => `${escapeNitroCacheKey(l)}.json`)
    let removed = 0

    try {
        const keys = await storage.getKeys(folder)
        for (const key of keys) {
            const file = key.slice(folder.length + 1)
            if (!key.startsWith(`${folder}:`) || !file.startsWith(prefix)) continue
            if (!localeSuffixes.some(s => file.endsWith(s))) continue
            await storage.removeItem(key)
            removed++
        }
    } catch (error) {
        console.error(
            `[reference-cache] invalidation de ${kind}/${slug} échouée — l'entrée expirera au TTL`,
            error
        )
    }
    return removed
}
