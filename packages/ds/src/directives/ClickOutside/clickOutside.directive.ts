import type { IClickOutsideDirectiveBinding } from '../../interfaces/Commons/clickOutside.interface'
import { checkEvent, directive, handleShadow } from '../../utils/Commons/clickOutside.util'

export const ClickOutside = {
    // [data-app] may not be found
    // if using bind, inserted makes
    // sure that the root element is
    // available, iOS does not support
    // clicks on body
    /*********************************************************
     * mounted
     *
     * @description
     * ⛔ Les deux closures NE capturent PAS `binding`. Vue construit un
     * NOUVEL objet binding a chaque mise a jour : une closure qui retient
     * celui du montage lit un `binding.value` fige, et changer le handler
     * lie n'a plus aucun effet. Elles lisent donc l'entree stockee sur
     * l'element, que le hook `updated` ci-dessous rafraichit — ce qui evite
     * de desenregistrer/reenregistrer les ecouteurs a chaque rendu.
     ********************************************************/
    mounted (el: HTMLElement, binding: IClickOutsideDirectiveBinding) {
        const uid = binding.instance!.$.uid
        const current = () => el._clickOutside?.[uid]?.binding ?? binding

        const handleClick = (e: Event) => directive(e as MouseEvent, el, current())
        const handleMousedown = (e: Event) => {
            el._clickOutside!.lastMousedownWasOutside = checkEvent(e as MouseEvent, el, current())
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

        el._clickOutside[uid] = {
            onClick: handleClick,
            onMousedown: handleMousedown,
            binding
        }
    },

    /*********************************************************
     * updated — rafraichit le binding lu par les closures.
     *
     * @description
     * Le hook manquait entierement : le handler etait fige au montage
     * (classeur, critere C3). On ne touche PAS aux ecouteurs, seulement a
     * la reference que `current()` relit a chaque evenement.
     ********************************************************/
    updated (el: HTMLElement, binding: IClickOutsideDirectiveBinding) {
        const entry = el._clickOutside?.[binding.instance!.$.uid]

        if (entry) entry.binding = binding
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
