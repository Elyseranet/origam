import type { TPropValue } from './prop-value.type'

/*********************************************************
 * TCoercionResult
 *
 * @description
 * The outcome of turning a control's text into a prop value. A refusal is a
 * value, not an exception: typing `abc` in a NUMBER field is the normal
 * middle of an edit, and the control must keep the previous prop value
 * untouched (never write `NaN`) while it shows the refusal.
 ********************************************************/
export type TCoercionResult =
    | { ok: true, value: TPropValue }
    | { ok: false }
