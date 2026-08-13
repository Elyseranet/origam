import { PARALLAX_DIRECTION, PARALLAX_EASING } from '../../enums'
import { OrigamParallax } from "../../components"
import { PARALLAX_EVENT } from '../../enums'

export type TParallaxDirection = `${PARALLAX_DIRECTION}`

export type TParallaxEasing = `${PARALLAX_EASING}`

export type TParallaxEvent = `${PARALLAX_EVENT}`

export type TOrigamParallax = InstanceType<typeof OrigamParallax>
