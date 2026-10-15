/*********************************************************
 * TPropGroupId
 *
 * @description
 * The 13 groups a prop can be bucketed into for display in the inspector.
 * Carries NO i18n key and NO icon name: those are HOST concerns (see
 * `IPropDefinition`'s own "why this is not IReferenceRow" note for the same
 * argument applied to a prop row). A host that wants a label/icon per group
 * maps this id onto its own meta — `packages/marketing`'s
 * `THEME_BUILDER_PROP_GROUPS` is exactly that, a `Record<TPropGroupId, …>` of
 * label + icon keyed on this union.
 *
 * @description
 * ⛔ This union, the tables in `consts/Commons/prop-group.const.ts` and
 * `classifyPropGroup` in `utils/Commons/prop-group.util.ts` are the ONE
 * classification in the monorepo. `packages/marketing` used to carry a second
 * copy in `src/consts/theme-builder-groups.const.ts` (its own
 * `TThemeBuilderGroupId` / `PROP_GROUP_EXACT` / `PROP_GROUP_PREFIX` /
 * `classifyPropGroup`); it now imports from here instead, and that copy is
 * gone. `marketing` is a HOST of `@origam/playground`, so `marketing →
 * playground` is the correct direction — it is the reverse that would invert
 * the dependency. Measured before the merge, over the RESOLVED props
 * descriptors of `OrigamBtn` (106) and `OrigamSelect` (161): the two
 * implementations agreed on all 267 props, so nothing moved group.
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
