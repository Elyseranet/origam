/**
 * Plain, hand-authored semantic tree — the NORMAL way to write an origam theme
 * (ADR-004 DX). A node is either a bare value (`string | number`) or a nested
 * group of further nodes. No DTCG `$value` ceremony, no `--origam-*` prefixes:
 * you write intentions (`surface.default`, `text.secondary`, `action.primary.bg`)
 * and the DS resolves each leaf path to its `--origam-*` CSS variable through the
 * shared `tokenPathToCssVar` naming grammar.
 *
 * A leaf VALUE is free-form CSS for its slot:
 *   - a color slot accepts any CSS color OR a gradient
 *     (`'#171717'`, `'rgb(23,23,23)'`, `'hsl(...)'`, `'linear-gradient(...)'`),
 *   - a dimension slot accepts any CSS length (`'0.5rem'`, `'8px'`, `0`),
 *   - a duration/easing slot accepts the matching CSS value (`'200ms'`,
 *     `'cubic-bezier(.4,0,.2,1)'`).
 *
 * Everything is plain JSON — fully serialisable, so a Theme Builder export can
 * round-trip it without losing fidelity.
 */
export type TSemanticLeaf = string | number

export interface ISemanticTree {
    [key: string]: TSemanticLeaf | ISemanticTree
}

/**
 * Structured token-configuration bucket — THE way to author a theme's global
 * design tokens (the JSON that generates every global `--origam-*` variable).
 *
 * Each key is a friendly token GROUP whose nested tree resolves to the matching
 * `--origam-*` namespace through the shared naming grammar:
 *   - `color`   → `--origam-color-*`   (`color.surface.default`, `color.text.primary`, `color.action.primary.bg`, …)
 *   - `rounded` → `--origam-radius-*`  (`rounded.sm`, `rounded.md`, `rounded.lg`, …)
 *   - `border`  → `--origam-border-*`  (`border.width.thin`, …)
 *   - `typo`    → `--origam-font-*`    (`typo.family.sans`, `typo.size.md`, `typo.weight.bold`, …)
 *   - `shadow`  → `--origam-shadow-*`  (`shadow.sm`, `shadow.md`, …)
 *   - `spacing` → `--origam-space-*`   (`spacing.4`, `spacing.12`, …)
 *   - `motion`  → `--origam-motion-*`  (`motion.duration.fast`, `motion.easing.standard`, …)
 *
 * A leaf value is free-form CSS for its slot (a color slot also accepts a
 * gradient). Plain JSON — fully serialisable for Theme-Builder round-trips.
 */
export interface IThemeVars {
    color?: ISemanticTree
    rounded?: ISemanticTree
    border?: ISemanticTree
    typo?: ISemanticTree
    shadow?: ISemanticTree
    spacing?: ISemanticTree
    motion?: ISemanticTree
}
