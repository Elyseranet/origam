import type { TReferenceKind } from './api-reference.type'

/** Filtre de famille de la palette ⌘K : une des 8 familles, ou toutes. */
export type TGlobalSearchFamily = TReferenceKind | 'all'

/** Signature de `t()` (composable `useT`) telle que reçue par les fonctions pures de la palette. */
export type TTranslate = (key: string, fallback?: string) => string
