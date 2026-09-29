import type { TSemanticLeaf } from "../../types";

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