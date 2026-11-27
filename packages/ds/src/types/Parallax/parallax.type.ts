import { PARALLAX_DIRECTION, PARALLAX_EASING, PARALLAX_EVENT, PARALLAX_ORIGIN } from '../../enums/Parallax/parallax.enum'
import OrigamParallax from '../../components/Parallax/OrigamParallax.vue'

export type TParallaxDirection = `${PARALLAX_DIRECTION}`

export type TParallaxEasing = `${PARALLAX_EASING}`

export type TParallaxOrigin = `${PARALLAX_ORIGIN}`

export type TParallaxEvent = `${PARALLAX_EVENT}`

export type TOrigamParallax = InstanceType<typeof OrigamParallax>
