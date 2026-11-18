import type { TReferenceKind } from '../types/api-reference.type'

/** Familles dont l'index regroupe par `domain` plutôt que par `category`. */
export const DOMAIN_GROUPED_KINDS: ReadonlyArray<TReferenceKind> = ['composable']

/** Familles dont l'index est une liste plate, sans groupe. */
export const FLAT_KINDS: ReadonlyArray<TReferenceKind> = ['directive']

/**
 * Types de relation qui relient DEUX familles. `extends` (bruit : « extends
 * Pick ») et `family` (même famille) sont exclus par construction.
 */
export const CROSS_FAMILY_REL_TYPES = ['used_by', 'related']

/** Identifiant exact d'une entrée : le nom de fichier source sans extension. */
export const SOURCE_BASENAME_SQL = `regexp_replace(e.source_file, '^.*/([^/]+?)(\\.[^./]+)?$', '\\1')`
