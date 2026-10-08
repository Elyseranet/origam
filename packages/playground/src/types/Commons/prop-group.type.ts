/*********************************************************
 * TPropGroupId
 *
 * @description
 * The 13 groups a prop can be bucketed into for display in the inspector.
 * Mirrors `packages/marketing`'s `TThemeBuilderGroupId` ids exactly — same
 * classifier, same ids — but carries NO i18n key and NO icon name: those are
 * HOST concerns (see `IPropDefinition`'s own "why this is not IReferenceRow"
 * note for the same argument applied to a prop row). A host that wants a
 * label/icon per group maps this id onto its own meta.
 *
 * @description
 * ⛔ Lot 2 duplicates marketing's classification data on purpose rather than
 * importing it — `packages/marketing` is a HOST of `@origam/playground`, so
 * importing from it here would invert the dependency. The owner-facing PR for
 * this lot documents the blast radius of migrating marketing to consume this
 * module instead (one call site, `useThemeBuilderCatalog.ts`) as a follow-up;
 * doing it inside this lot would touch an unrelated, already-shipped screen
 * (`/theming`) outside this ticket's critical path.
 ********************************************************/
export type TPropGroupId =
    | 'color'
    | 'size'
    | 'shape'
    | 'border'
    | 'elevation'
    | 'dimension'
    | 'spacing'
    | 'state'
    | 'icon'
    | 'link'
    | 'layout'
    | 'content'
    | 'other'
