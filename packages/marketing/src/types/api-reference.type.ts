/** Familles d'entités supportées par l'API Reference. */
export type TReferenceKind =
    | 'component'
    | 'composable'
    | 'const'
    | 'directive'
    | 'enum'
    | 'interface'
    | 'type'
    | 'util'

/** Sibling-slug → description lookup, used to enrich family/related entries. */
export type TDescriptionsBySlug = Map<string, { description_key: string | null; description_fallback: string | null }>
