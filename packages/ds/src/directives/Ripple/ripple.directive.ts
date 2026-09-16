import type { IRippleDirectiveBinding, IRippleHtmlElement } from '../../interfaces/Commons/ripple.interface'

import { isRippleEnabled, rippleRemoveListeners, updateRipple } from '../../utils/Commons/ripple.util'

export const Ripple = {
    mounted: (el: IRippleHtmlElement, binding: IRippleDirectiveBinding) => {
        updateRipple(el, binding, false)
    },
    unmounted: (el: IRippleHtmlElement) => {
        /*********************************************************
         * Purger les timers d'animation AVANT de perdre leur reference
         * (#753)
         *
         * @description
         * Les trois `setTimeout` des phases du ripple sont ranges sur
         * `el._ripple`. L'ordre compte : `delete el._ripple` d'abord et
         * les handles deviennent inatteignables — les timers tourneraient
         * quand meme, sans que plus rien ne puisse les annuler. La cadence
         * la plus longue (250 ms d'attente + 300 ms de sortie) survit
         * largement a un bouton qui disparait sur son propre clic.
         ********************************************************/
        for (const id of el._ripple?.timers ?? []) clearTimeout(id)
        el._ripple?.timers?.clear()

        delete el._ripple
        rippleRemoveListeners(el)
    },
    updated: (el: IRippleHtmlElement, binding: IRippleDirectiveBinding) => {
        if (binding.value === binding.oldValue) {
            return
        }

        const wasEnabled = isRippleEnabled(binding.oldValue)
        updateRipple(el, binding, wasEnabled)
    }
}

export default Ripple
