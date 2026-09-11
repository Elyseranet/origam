import type { IClickOutsideDirectiveBinding } from '../../interfaces'
import { checkEvent, directive, handleShadow } from '../../utils'

export const ClickOutside = {
    // [data-app] may not be found
    // if using bind, inserted makes
    // sure that the root element is
    // available, iOS does not support
    // clicks on body
    mounted (el: HTMLElement, binding: IClickOutsideDirectiveBinding) {
        const handleClick = (e: Event) => directive(e as MouseEvent, el, binding)
        const handleMousedown = (e: Event) => {
            el._clickOutside!.lastMousedownWasOutside = checkEvent(e as MouseEvent, el, binding)
        }

        handleShadow(el, (app: Document | ShadowRoot) => {
            app.addEventListener('click', handleClick, true)
            app.addEventListener('mousedown', handleMousedown, true)
        })

        if (!el._clickOutside) {
            el._clickOutside = {
                lastMousedownWasOutside: false
            }
        }

        el._clickOutside[binding.instance!.$.uid] = {
            onClick: handleClick,
            onMousedown: handleMousedown
        }
    },

    unmounted (el: HTMLElement, binding: IClickOutsideDirectiveBinding) {
        if (!el._clickOutside) return

        handleShadow(el, (app: Document | ShadowRoot) => {
            if (!app || !el._clickOutside?.[binding.instance!.$.uid]) return

            const {onClick, onMousedown} = el._clickOutside[binding.instance!.$.uid]!

            app.removeEventListener('click', onClick, true)
            app.removeEventListener('mousedown', onMousedown, true)
        })

        delete el._clickOutside[binding.instance!.$.uid]
    }
}

export default ClickOutside
