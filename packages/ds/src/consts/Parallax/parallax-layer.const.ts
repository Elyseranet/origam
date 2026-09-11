import type { IParallaxLayerProvide } from '../../interfaces'

import type { InjectionKey } from 'vue'

export const ORIGAM_PARALLAX_LAYER_KEY: InjectionKey<IParallaxLayerProvide> = Symbol.for('origam:parallax-layer')
