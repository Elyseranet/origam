import type { IParallaxLayerProvide } from '../../interfaces/Parallax/parallax.interface'

import type { InjectionKey } from 'vue'

export const ORIGAM_PARALLAX_LAYER_KEY: InjectionKey<IParallaxLayerProvide> = Symbol.for('origam:parallax-layer')

/*********************************************************
 * PARALLAX_LAYER_VAR_SPEED / PARALLAX_LAYER_VAR_OFFSET_X /
 * PARALLAX_LAYER_VAR_OFFSET_Y
 *
 * @description
 * Per-layer custom properties published by `useParallaxRuntime` on the
 * CSS scroll-driven path (`startCss` / `update`). `OrigamParallaxLayer`'s
 * scoped SCSS reads the same three names from its `@keyframes`, so the
 * spelling is a contract between the runtime and the stylesheet — hence
 * a shared constant rather than two independent literals.
 ********************************************************/
export const PARALLAX_LAYER_VAR_SPEED = '--origam-parallax__layer---speed'
export const PARALLAX_LAYER_VAR_OFFSET_X = '--origam-parallax__layer---offset-x'
export const PARALLAX_LAYER_VAR_OFFSET_Y = '--origam-parallax__layer---offset-y'
