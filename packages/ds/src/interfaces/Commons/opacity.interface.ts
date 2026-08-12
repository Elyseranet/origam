import type { TOpacity } from '../../types'

/**
 * Opacity prop surface — `opacity: N` expressed as a prop instead of
 * component-local CSS (ADR-005, D6: `OrigamBtn`'s `plain` variant needed
 * this and no Commons interface covered it — `grep`ing the 56 Commons
 * interfaces at the time found `opacity` only as a component-local prop on
 * `Chart/chart-plot-band` and `Watermark`).
 *
 * Named `IOpacityProps` / `opacity`, consumed via `useOpacity`
 * (`src/composables/Commons/opacity.composable.ts`). Deliberately generic
 * (not Btn-specific) — any component that needs a themeable resting/hover
 * fade reuses this instead of hand-rolling its own opacity CSS var, and it
 * doubles as the `opacity` axis on `IStateEffectConfig` (`hover.opacity`,
 * `active.opacity`).
 */
export interface IOpacityProps {
    opacity?: TOpacity
}
