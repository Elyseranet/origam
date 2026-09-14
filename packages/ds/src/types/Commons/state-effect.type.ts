import type { IBgColorProps, IColorProps } from '../../interfaces/Commons/color.interface'
import type { IBorderProps } from '../../interfaces/Commons/border.interface'
import type { IElevationProps } from '../../interfaces/Commons/elevation.interface'
import type { IMarginProps } from '../../interfaces/Commons/margin.interface'
import type { IPaddingProps } from '../../interfaces/Commons/padding.interface'
import type { IRoundedProps } from '../../interfaces/Commons/rounded.interface'

/**
 * The prop bag `useStateEffect` reads from.
 *
 * It is deliberately an INTERSECTION of the existing Commons prop
 * interfaces rather than a fresh list of properties: `useStateEffect`
 * delegates each axis to the matching per-axis composable
 * (`useBorder`, `useRounded`, `useElevation`, `usePadding`,
 * `useMargin`, `useColor`), so its accepted input is by definition the
 * union of what those composables accept. Restating the properties
 * here would let the two drift the moment one of the Commons
 * interfaces gains a prop.
 *
 * `gap` is the one axis with no Commons interface of its own — it is
 * an ad-hoc flex/grid property that only a handful of layout
 * components expose — so it is spelled inline.
 *
 * Sibling type: {@link IStateEffectConfig} in
 * `src/interfaces/Commons/state-effect.interface.ts` describes the
 * OVERRIDE object a consumer passes to `hover` / `active`. This type
 * describes the RESTING props those overrides are layered on top of.
 */
export type TStateEffectProps =
    & IColorProps
    & IBgColorProps
    & IBorderProps
    & IRoundedProps
    & IElevationProps
    & IPaddingProps
    & IMarginProps
    & { gap?: boolean | number | string }
