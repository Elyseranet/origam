import type { TOpacity } from '../../types/Commons/opacity.type'

/*********************************************************
 * IOpacityProps
 *
 * @description
 * Opacity surface. Single scalar — there is no per-side or per-axis form,
 * `opacity` being a whole-element property.
 *
 * @description
 * ⛔ REUSE NOTE — this interface does NOT bring a token group with it. The
 * primitive ladder it resolves against already existed before the
 * interface did: `--origam-opacity---{0,12,26,32,50,60,70,87,100}`,
 * declared in `assets/css/tokens/primitive.css` and its SCSS twin, and
 * already read by `OrigamBtn`'s `--variant-plain` rule
 * (`opacity: var(--origam-btn---opacity-plain, var(--origam-opacity---70))`).
 * ADR-005's D6 proposed "add `IOpacityProps` + a token group"; only the
 * first half was missing. Declaring a second ladder would have been the
 * duplication the repo's reuse rule exists to prevent.
 *
 * @description
 * Consumed via `useOpacity(props)` -> `{ opacityClasses, opacityStyles }`,
 * both bound in parallel (strategy A) exactly as `useElevation` does.
 ********************************************************/
export interface IOpacityProps {
    /*********************************************************
     * opacity
     *
     * @description
     * Element opacity. A number `<= 1` is a CSS fraction (`0.7`); a number
     * `> 1` is a 0..100 percentage naming a token rung (`70`). Any other
     * string passes through verbatim (`'50%'`, `'var(...)'`, `'calc(...)'`).
     *
     * @description
     * See {@link TOpacity} for why the fraction/percent split sits at 1.
     ********************************************************/
    opacity?: TOpacity
}
