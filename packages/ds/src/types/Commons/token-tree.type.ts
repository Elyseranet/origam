/**
 * A fully-resolved theme variable map: CSS custom-property name → value.
 * This is what `resolveThemeVars` produces and what the `cssVars` escape hatch
 * accepts. Keys may be supplied with or without the leading `--`; `createOrigam`
 * normalises them.
 *
 *   { '--origam-color__action--primary---bg': '#7c3aed' }
 *   { 'origam-radius---md': '0.5rem' }
 */
export type TThemeVars = Record<string, string | number>
