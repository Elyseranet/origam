import type { TColor } from "../../types"

/**
 * Foreground-only color contract.
 *
 * Use this interface on components whose only colour-related concern is
 * the **text** / icon (`color`). Pure typographic components (Title,
 * Caption, Subtitle, Tooltip text, …) and any chrome that doesn't paint
 * its own surface should extend this interface — NOT the combined
 * version below.
 *
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │  IF the component paints a background → also extend          │
 *   │     IBgColorProps                                            │
 *   │  ELSE → keep IColorProps only.                               │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * State-aware overrides (`hoverColor`, `activeColor`) have been folded
 * into the `hover` / `active` object props of `IHoverProps` /
 * `IActiveProps`:
 *
 *     <Btn :hover="{ color: 'success' }" />          (was hover-color)
 *     <Btn :active="{ color: 'success' }" />         (was active-color)
 */
export interface IColorProps {
    color?: TColor
}

/**
 * Background-only color contract.
 *
 * Combine with {@link IColorProps} on components that own a surface
 * (Btn, Card, Badge, Alert, Pagination, …). The two interfaces stay
 * orthogonal so a component can opt into one axis without inheriting
 * unused props on the other.
 *
 *   // Btn paints both surface and text.
 *   interface IBtnProps extends IColorProps, IBgColorProps { … }
 *
 *   // Title only paints text.
 *   interface ITitleProps extends IColorProps { … }
 *
 * State-aware bg overrides (`hoverBgColor`, `activeBgColor`) have been
 * folded into the `hover` / `active` object props:
 *
 *     <Card :hover="{ bgColor: 'success' }" />       (was hover-bg-color)
 *     <Card :active="{ bgColor: 'success' }" />      (was active-bg-color)
 */
export interface IBgColorProps {
    bgColor?: TColor
}

/**
 * Accent-only color contract.
 *
 * Combine with {@link IColorProps} on components that paint a
 * **decorative accent** — a border bar, a background glyph, a pull-rule
 * — rather than their own surface fill. `accentColor` is the canonical
 * name for that axis (see ROADMAP.md — "Renommer `bgColor` →
 * `accentColor`"). Do NOT reach for this on surface-fill components
 * (Btn, Card, Chip, Badge, Alert, Pagination, …) — those keep
 * {@link IBgColorProps}, whose `bgColor` paints a real
 * `background-color`. Mixing the two meanings under the same prop name
 * is exactly the confusion this interface exists to avoid.
 *
 *   // Blockquote paints text (color) + a decorative accent (accentColor).
 *   interface IBlockquoteProps extends IColorProps, IAccentColorProps { … }
 *
 * `bgColor` remains a **deprecated alias** on components that migrate to
 * `accentColor` — resolve it as `accentColor ?? bgColor` (accentColor
 * wins) and warn once via `warnDeprecatedProp` from
 * `src/utils/Commons/color.util.ts`. Removal targeted for v3.0.0.
 */
export interface IAccentColorProps {
    accentColor?: TColor
}
