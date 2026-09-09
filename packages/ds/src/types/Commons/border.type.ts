import { BORDER_LOGICAL_AXIS, BORDER_STYLE } from '../../enums/Commons/border.enum'

export type TBorderStyle = `${BORDER_STYLE}`

/**
 * CSS logical border axes (`border-block` / `border-inline`), as opposed
 * to the PHYSICAL per-side directions (`TDirectionBoth` = top/bottom/
 * left/right). Used to drive `borderBlock` / `borderInline` on
 * `IBorderProps` — these resolve to the native CSS logical properties
 * `border-block-*` / `border-inline-*`, which the browser itself maps to
 * the correct physical edges per the current writing mode (no manual
 * LTR/RTL translation needed on our side).
 */
export type TBorderLogicalAxis = `${BORDER_LOGICAL_AXIS}`

/*********************************************************
 * TBorderWidthKeyword
 *
 * @description
 * The three border WIDTH keywords that have a matching global utility
 * class (`.origam--border-none` / `-thin` / `-thick` in
 * `assets/css/tokens/origam-utilities.css`).
 *
 * @description
 * ⛔ Kept as a narrow literal union ON PURPOSE (#391). The membership
 * guard in `useBorder` used to be typed `value is string`, which made
 * TypeScript subtract EVERY string in the `else` branch — directions
 * (`border="top"`) and free-form values (`border="2px dashed"`) included,
 * even though both reach that branch at runtime. Narrowing the guard to
 * this union is what keeps the remaining branches type-reachable instead
 * of forcing a cast that the compiler correctly rejects (TS2352/TS2367).
 ********************************************************/
export type TBorderWidthKeyword = 'none' | 'thin' | 'thick'
