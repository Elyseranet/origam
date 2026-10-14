import type { TLocaleCode } from '../../src/types/i18n.type'

/** Les paramètres qui entrent dans la clé de cache de `GET /api/reference/:kind/:slug`. */
export interface IReferenceDocCacheKeyParts {
    kind: string
    slug: string
    /** Valeur brute de `?limit=` (`undefined` quand absent). */
    limit?: unknown
    locale: TLocaleCode
}

/** Les paramètres qui entrent dans la clé de cache de `GET /api/reference/:kind`. */
export interface IReferenceCatalogCacheKeyParts {
    kind: string
    /** `?includePropSurface=1` */
    includePropSurface: boolean
    category?: unknown
    limit?: unknown
    orphaned?: unknown
    locale: TLocaleCode
}

/** Le sous-ensemble d'unstorage dont l'invalidation a besoin — injecté, pour être testable sans Nitro. */
export interface IReferenceCacheStorage {
    getKeys (base?: string): Promise<string[]>
    removeItem (key: string): Promise<void>
}
