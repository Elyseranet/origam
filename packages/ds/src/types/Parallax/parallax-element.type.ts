import { OrigamParallaxElement } from "../../components"
import { PARALLAX_ELEMENT_TYPE } from '../../enums'

export type TParallaxElementType = `${PARALLAX_ELEMENT_TYPE}`

export type TOrigamParallaxElement = InstanceType<typeof OrigamParallaxElement>
