/*********************************************************
 * TPropGroupId
 *
 * @description
 * The 13 groups a prop can be bucketed into for display in the inspector.
 * Carries NO i18n key and NO icon name: those are HOST concerns (see
 * `IPropDefinition`'s own "why this is not IReferenceRow" note for the same
 * argument applied to a prop row). A host that wants a label/icon per group
 * maps this id onto its own meta — `packages/marketing`'s
 * `THEME_BUILDER_PROP_GROUP_DISPLAY` is exactly that, a
 * `Record<TPropGroupId, …>` of label + icon keyed on this union.
 *
 * @description
 * ⛔ This union, the tables in `consts/Commons/prop-group.const.ts` and
 * `classifyPropGroup` in `utils/Commons/prop-group.util.ts` are the ONE
 * classification in the monorepo. Until #1141, `packages/marketing` carried a
 * second copy in `src/consts/theme-builder-groups.const.ts` (its own
 * `TThemeBuilderGroupId` / `PROP_GROUP_EXACT` / `PROP_GROUP_PREFIX` /
 * `classifyPropGroup`). It now imports `TPropGroupId`, `PROP_GROUP_IDS` and
 * `classifyPropGroup` from `@origam/playground/{types,consts,utils}`, and
 * that copy is gone. `marketing` is a HOST of `@origam/playground`, so
 * `marketing → playground` is the correct direction — the reverse would
 * invert the dependency. Before the merge the two tables were identical
 * entry for entry (76 exact names + 8 prefixes, same prefix order), and `/theming` was measured
 * in Chromium before and after on `btn`, `select`, `card` and `text-field`:
 * same groups, same controls, same order.
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
