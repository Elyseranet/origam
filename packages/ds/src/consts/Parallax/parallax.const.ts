import type { IParallaxProvide } from '../../interfaces/Parallax/parallax.interface'
import type { InjectionKey } from 'vue'

export const ORIGAM_PARALLAX_KEY: InjectionKey<IParallaxProvide> = Symbol.for('origam:parallax')

/*********************************************************
 * PARALLAX_MOUSE_AMPLITUDE_FACTOR
 *
 * @description
 * Share of the host width the mouse-ratio contributes on the X axis when
 * `direction === 'both'`. Half-width at the extreme edge — a full-width
 * drift reads as a glitch rather than as parallax.
 ********************************************************/
export const PARALLAX_MOUSE_AMPLITUDE_FACTOR = 0.5

/*********************************************************
 * PARALLAX_SPRING_DAMPING
 *
 * @description
 * Lerp factor of the `spring` easing: the fraction of the remaining
 * distance travelled on each frame. Tighter = faster spring; 0.08-0.15
 * is the band that reads as natural.
 ********************************************************/
export const PARALLAX_SPRING_DAMPING = 0.12

/*********************************************************
 * PARALLAX_TRANSFORM_PRECISION
 *
 * @description
 * Decimal places kept when serialising a `translate3d()` distance.
 * Sub-hundredth-of-a-pixel precision is invisible and only inflates the
 * style string rewritten on every frame.
 ********************************************************/
export const PARALLAX_TRANSFORM_PRECISION = 2

/*********************************************************
 * PARALLAX_MOUSE_SMOOTHING
 *
 * @description
 * Duration (ms) of the CSS `transition` that smooths the pointer-driven
 * `translate` of a layer. The browser interpolates — no JS timer, no rAF.
 ********************************************************/
export const PARALLAX_MOUSE_SMOOTHING = 400

/*********************************************************
 * PARALLAX_FINE_POINTER_QUERY
 *
 * @description
 * Pointer-driven movement is only wired on devices with a hover-capable
 * fine pointer; touch devices keep the scroll-only behaviour.
 ********************************************************/
export const PARALLAX_FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)'
