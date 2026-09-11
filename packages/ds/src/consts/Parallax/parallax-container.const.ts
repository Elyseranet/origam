import type { IParallaxProvide } from '../../interfaces'

import type { InjectionKey } from 'vue'

export const ORIGAM_PARALLAX_KEY: InjectionKey<IParallaxProvide> = Symbol.for('origam:parallax')
