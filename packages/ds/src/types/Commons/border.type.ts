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
