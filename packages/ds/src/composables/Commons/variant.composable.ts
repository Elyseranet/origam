import type { IVariantProps } from '../../interfaces'
import type { TVariant, TVariantInput } from '../../types'
import { getCurrentInstanceName } from '../../utils'

import { computed, isRef, Ref } from 'vue'

/*********************************************************
 * useVariant
 ********************************************************/
export function useVariant (props: IVariantProps | Ref<TVariant | TVariantInput | string | undefined>, name = getCurrentInstanceName()) {
    const variantClasses = computed(() => {
        const variant = isRef(props) ? props.value : props.variant
        const classes: Array<string> = []

        if (variant == null) return classes

        if (variant) {
            classes.push(`${name}--variant-${variant}`)
        }

        return classes
    })

    return { variantClasses }
}
