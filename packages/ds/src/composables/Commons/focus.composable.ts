import { computed } from 'vue'
import { useVModel } from './vModel.composable'
import type { IFocusProps } from '../../interfaces/Commons/focus.interface'

import { getCurrentInstanceName } from '../../utils/Commons/getCurrentInstance.util'

/*********************************************************
 * useFocus
 ********************************************************/
export function useFocus (props: IFocusProps, name = getCurrentInstanceName()) {
    const isFocused = useVModel(props, 'focused', false as unknown as IFocusProps['focused'])
    const focusClasses = computed(() => {
        return ({
            [`${name}--focused`]: isFocused.value
        })
    })

    const onFocus = () => {
        isFocused.value = true
    }
    const onBlur = () => {
        isFocused.value = false
    }

    return {focusClasses, isFocused, onFocus, onBlur}
}
