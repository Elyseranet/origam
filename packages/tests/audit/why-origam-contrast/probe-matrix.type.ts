/*********************************************************
 * probe-matrix.type — why-origam-contrast
 *
 * @description
 * `'origam'` is the DS's own zero-config identity — no `data-theme`
 * attribute, `origamTheme` (light+dark) is the only theme `createOrigam()`
 * would need for it to render. It is NOT marketing's own named `origam`
 * theme object (`marketing/src/themes/origam.theme.ts`), which carries the
 * generated `ORIGAM_COMPONENT_RESET_*` re-declaration and would mask the
 * very defects this measurement looks for (see CLAUDE.md, dark-contrast
 * harness header, and the #871 investigation it replays).
 ********************************************************/
export type TProbeIdentity =
        'origam'
        | 'apple'
        | 'cartoon'
        | 'ecom'
        | 'editorial'
        | 'geek'
        | 'glass'
        | 'material'

export type TProbeMode = 'light' | 'dark'
