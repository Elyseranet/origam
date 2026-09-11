import { PARALLAX_DIRECTION, PARALLAX_EASING } from '../../enums/Parallax/parallax.enum'
import OrigamParallax from '../../components/Parallax/OrigamParallax.vue'
import { PARALLAX_EVENT } from '../../enums/Parallax/parallax.enum'

export type TParallaxDirection = `${PARALLAX_DIRECTION}`

export type TParallaxEasing = `${PARALLAX_EASING}`

export type TParallaxEvent = `${PARALLAX_EVENT}`

export type TOrigamParallax = InstanceType<typeof OrigamParallax>
