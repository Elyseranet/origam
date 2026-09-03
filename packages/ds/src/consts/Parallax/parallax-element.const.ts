/*********************************************************
 * parallax-element.const
 *
 * @description
 * Movement constants of `useParallaxTransform` — the mouse-driven
 * transform builder behind `<OrigamParallaxElement>`.
 *
 * @description
 * `strength` is the only consumer-facing knob; everything below shapes
 * how that knob is converted into a CSS transform.
 ********************************************************/

/*********************************************************
 * PARALLAX_ELEMENT_DEFAULT_STRENGTH
 *
 * @description
 * Default `strength` when the consumer leaves the prop unset. Mirrored
 * verbatim in `<OrigamParallaxElement>`'s `withDefaults(...)` block per
 * the CLAUDE.md "inline literals only" rule — the constant exists so
 * the composable (which receives already-resolved props, but also runs
 * standalone in tests) does not restate the number.
 ********************************************************/
export const PARALLAX_ELEMENT_DEFAULT_STRENGTH = 10

/*********************************************************
 * PARALLAX_ELEMENT_MOVEMENT_DIVISOR
 *
 * @description
 * Divisor applied to `strength × pointer-offset` before it becomes a
 * px / deg amount. Keeps the default strength of 10 at a 1:1 ratio with
 * the pointer offset.
 ********************************************************/
export const PARALLAX_ELEMENT_MOVEMENT_DIVISOR = 10

/*********************************************************
 * PARALLAX_ELEMENT_MOVEMENT_BASE
 *
 * @description
 * Constant term added to every computed movement, so a pointer sitting
 * exactly at the origin still yields a non-zero (1px / 1deg / scale 1)
 * transform rather than collapsing the element.
 ********************************************************/
export const PARALLAX_ELEMENT_MOVEMENT_BASE = 1

/*********************************************************
 * PARALLAX_ELEMENT_DEPTH_TRANSLATE_FACTOR
 *
 * @description
 * Z-axis multiplier of the `depth` / `depth_inv` types: the element is
 * pushed `strength × 2` px towards the viewer, which is the amount that
 * makes the rotation read as depth at the default perspective.
 ********************************************************/
export const PARALLAX_ELEMENT_DEPTH_TRANSLATE_FACTOR = 2
