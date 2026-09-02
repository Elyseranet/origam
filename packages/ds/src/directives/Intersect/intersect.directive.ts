import { SUPPORTS_INTERSECTION } from '../../consts/Commons/commons.const'
import type { IIntersectDirectiveBinding, IIntersectHtmlElement } from '../../interfaces/Commons/intersect.interface'
import { unmountIntersect } from '../../utils/Commons/intersect.util'

export const Intersect = {
    mounted (el: IIntersectHtmlElement, binding: IIntersectDirectiveBinding) {
        if (!SUPPORTS_INTERSECTION) return

        /*********************************************************
         * ⛔ `handler` et `modifiers` sont relus a CHAQUE intersection,
         * jamais captures au montage (classeur, critere C3).
         *
         * @description
         * Vue construit un NOUVEL objet binding a chaque mise a jour. Une
         * closure qui retient celui du montage appelle indefiniment le
         * premier handler : changer la valeur liee n'avait aucun effet. Le
         * hook `updated` plus bas rafraichit l'entree, et `read()` la relit.
         *
         * @description
         * ⚠️ `options` fait EXCEPTION et reste fige : il est passe au
         * constructeur de l'IntersectionObserver. Le changer exigerait de
         * detruire et recreer l'observer — un cout et un risque de perte
         * d'evenement que ce correctif n'engage pas. Documenter la limite
         * vaut mieux que la masquer.
         ********************************************************/
        const read = () => {
            const b = el._observe?.[binding.instance!.$.uid]?.binding ?? binding
            const v = b.value

            return typeof v === 'object'
                ? { handler: v.handler, modifiers: b.modifiers || {} }
                : { handler: v, modifiers: b.modifiers || {} }
        }

        const value = binding.value
        const {options = {threshold: 0.1}} = typeof value === 'object'
            ? value
            : {options: {threshold: 0.1}}

        const observer = new IntersectionObserver((
            entries: Array<IntersectionObserverEntry> = [],
            observer: IntersectionObserver
        ) => {
            const _observe = el._observe?.[binding.instance!.$.uid]
            if (!_observe) return // Just in case, should never fire

            const isIntersecting = entries.some(entry => entry.isIntersecting)
            const {handler, modifiers} = read()

            // If is not quiet or has already been
            // initted, invoke the user callback
            if (
                handler && (
                    !modifiers.quiet ||
                    _observe.init
                ) && (
                    !modifiers.once ||
                    isIntersecting ||
                    _observe.init
                )
            ) {
                handler(isIntersecting, entries, observer)
            }

            if (isIntersecting && modifiers.once) unmountIntersect(el, binding)
            else _observe.init = true
        }, options)

        el._observe = Object(el._observe)
        el._observe![binding.instance!.$.uid] = {init: false, observer, binding}

        observer.observe(el)
    },
    /*********************************************************
     * updated — rafraichit le binding relu par `read()`.
     *
     * @description
     * Le hook manquait entierement. On ne touche NI a l'observer NI a
     * l'element observe : seule la reference relue a chaque intersection
     * change.
     ********************************************************/
    updated (el: IIntersectHtmlElement, binding: IIntersectDirectiveBinding) {
        const entry = el._observe?.[binding.instance!.$.uid]

        if (entry) entry.binding = binding
    },
    unmounted (el: HTMLElement, binding: IIntersectDirectiveBinding) {
        unmountIntersect(el, binding)
    }
}

export default Intersect
