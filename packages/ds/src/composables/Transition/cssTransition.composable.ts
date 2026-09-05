import type { Component } from 'vue'
import { computed, Transition, TransitionGroup } from 'vue'
import type { ITransitionProps } from '../../interfaces/Transition/transition.interface'
import { useTransition } from './transition.composable'

/*********************************************************
 * useCssTransition
 *
 * @description
 * CSS-driven transition wiring (leaveAbsolute / hideOnLeave / origin
 * hooks) for a plain `<transition>` / `<transition-group>` — delegates
 * the disabled/name resolution to `useTransition` rather than
 * duplicating it. `useWindowTransition` is the height-tracking sibling
 * of this hook and lives in its own file.
 ********************************************************/
export function useCssTransition (props: ITransitionProps) {

    const {name, isDisabled} = useTransition(props)

    const tag = computed<Component>(() => props.group ? TransitionGroup : Transition)

    const handleBeforeEnter = (el: HTMLElement) => {
        if (props.origin) {
            el.style.transformOrigin = props.origin
        }
    }
    const handleLeave = (el: HTMLElement) => {
        if (props.leaveAbsolute) {
            const {offsetTop, offsetLeft, offsetWidth, offsetHeight} = el
            el._transitionInitialStyles = {
                position: el.style.position,
                top: el.style.top,
                left: el.style.left,
                width: el.style.width,
                height: el.style.height
            }
            el.style.position = 'absolute'
            el.style.top = `${offsetTop}px`
            el.style.left = `${offsetLeft}px`
            el.style.width = `${offsetWidth}px`
            el.style.height = `${offsetHeight}px`
        }

        if (props.hideOnLeave) {
            el.style.setProperty('display', 'none', 'important')
        }
    }
    const handleAfterLeave = (el: HTMLElement) => {
        if (props.leaveAbsolute && el?._transitionInitialStyles) {
            const {position, top, left, width, height} = el._transitionInitialStyles
            delete el._transitionInitialStyles
            el.style.position = position || ''
            el.style.top = top || ''
            el.style.left = left || ''
            el.style.width = width || ''
            el.style.height = height || ''
        }
    }

    const transitionProps = computed(() => {
        const bind: { [key: string]: unknown } = {
            css: !isDisabled.value
        }

        if (props.group) {
            bind.mode = props.mode
        }

        /*********************************************************
         * Liaison des hooks JS
         *
         * @description
         * ⛔ Cette liaison etait gardee par `if (isDisabled.value)` — donc les
         * hooks ne s'attachaient QUE lorsque la transition etait DESACTIVEE,
         * c'est-a-dire quand il n'y a plus rien a animer. En usage normal ils
         * ne partaient jamais, et les props qu'ils consomment etaient mortes.
         *
         * @description
         * Chaque hook garde deja sa PROPRE prop en interne (`if (props.origin)`,
         * `if (props.leaveAbsolute)`, `if (props.hideOnLeave)`) : la condition
         * externe n'ajoutait aucune protection, elle inversait le contrat.
         *
         * @description
         * La liaison est donc inconditionnelle. Le chemin desactive garde
         * exactement le comportement qu'il avait — c'est le chemin ACTIF qui
         * cesse d'ignorer ses props. Issue #549.
         ********************************************************/
        bind.onBeforeEnter = handleBeforeEnter
        bind.onLeave = handleLeave
        bind.onAfterLeave = handleAfterLeave

        return bind
    })

    return {tag, name, isDisabled, transitionProps}
}
