import { computed } from 'vue'
import { useVModel } from './vModel.composable'
import type { IFocusProps } from '../../interfaces/Commons/focus.interface'

import { getCurrentInstanceName } from '../../utils/Commons/getCurrentInstance.util'

/*********************************************************
 * useFocus
 *
 * @description
 * Etat de focus v-modelisable (`props.focused`, via `useVModel` — donc
 * `update:focused` remonte au parent) plus une classe `{name}--focused`
 * et deux handlers `onFocus`/`onBlur` prets a poser sur un `@focus`/`@blur`
 * de template. `name` par defaut le nom kebab-case du composant courant.
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
