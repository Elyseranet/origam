import { computed } from 'vue'
import { DIMENSIONS_ARRAY } from '../../consts/Commons/dimension.const'

import type { IDimensionProps } from '../../interfaces/Commons/dimension.interface'

import { convertToUnit, toKebabCase } from '../../utils/Commons/commons.util'

/*********************************************************
 * useDimension
 ********************************************************/
export function useDimension (props: IDimensionProps) {
    const dimensionStyles = computed(() => {
        const dimensions: Array<string> = []

        DIMENSIONS_ARRAY.forEach((dimension) => {
            if (props[dimension]) {
                dimensions.push(`${toKebabCase(dimension)}: ${convertToUnit(props[dimension])}`)
            }
        })

        return dimensions
    })

    return {dimensionStyles}
}
