import OrigamParallaxElement from '../../components/Parallax/OrigamParallaxElement.vue'
import { PARALLAX_ELEMENT_TYPE } from '../../enums/Parallax/parallax-element.enum'

export type TParallaxElementType = `${PARALLAX_ELEMENT_TYPE}`

export type TOrigamParallaxElement = InstanceType<typeof OrigamParallaxElement>
