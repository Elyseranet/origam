import type { IGradient } from '../../interfaces/Commons/gradient.interface'

/**
 * Accepted shapes for the `color` / `bgColor` / `textColor` props.
 *
 * Three input families, all supported transparently:
 *
 *   1. `string` — a {@link TIntent} (`'primary'`, `'success'`, …),
 *      a raw CSS color (`'#ff00aa'`, `'rgb(…)'`, `'transparent'`),
 *      a full CSS gradient (`'linear-gradient(…)'`, `'radial-gradient(…)'`,
 *      `'conic-gradient(…)'`), or a preset name prefixed with
 *      `gradient-` (e.g. `'gradient-sunset'`).
 *   2. {@link IGradient} — structured gradient descriptor. The composable
 *      resolves it to an inline `background-image: linear-gradient(…)` (or
 *      radial / conic) declaration, with intent stops translated to their
 *      respective design-token CSS variables.
 *   3. `false | null | undefined` — opt-out (no color applied).
 */
export type TColor = string | IGradient | false | null | undefined

export type TXYZ = [number, number, number]
export type TLAB = [number, number, number]
export type THSVA = { h: number, s: number, v: number, a?: number }
export type TRGBA = { r: number, g: number, b: number, a?: number }
export type THSLA = { h: number, s: number, l: number, a?: number }
export type THex = string & { __hexBrand: never }

export type TColorType = string | number | THSVA | TRGBA | THSLA

/**
 * Interaction role for state-aware color resolution.
 *
 * Used by `useColorEffect` (and its helpers) to pick the right token
 * rung / math-derivation for a given visual state:
 *
 *   • `default`  → resting bgColor (no transformation)
 *   • `hover`    → cascading `var(bgHover, color-mix(bg, black 20%))`
 *   • `active`   → cascading `var(bgActive, color-mix(bg, black 30%))`
 *   • `disabled` → resting `bgDisabled` token (per-intent)
 */
export type TBgFgRole = 'default' | 'hover' | 'active' | 'disabled'