import type { IHoverDirectiveBinding, IHoverHtmlElement } from '../../interfaces/Commons/hover.interface'

import { getCurrentInstanceName } from '../../utils/Commons/getCurrentInstance.util'
import { hoverRemoveListeners, isHoverEnabled, updateHover } from '../../utils/Commons/hover.util'

export const Hover = {
    mounted: (el: IHoverHtmlElement, binding: IHoverDirectiveBinding, name = getCurrentInstanceName()) => {
        updateHover(el, binding, false, name)
    },
    unmounted: (el: IHoverHtmlElement) => {
        delete el._hover
        hoverRemoveListeners(el)
    },
    updated: (el: IHoverHtmlElement, binding: IHoverDirectiveBinding, name = getCurrentInstanceName()) => {
        if (binding.value === binding.oldValue) {
            return
        }

        const wasEnabled = isHoverEnabled(binding.oldValue)

        updateHover(el, binding, wasEnabled, name)
    }
}

export default Hover
