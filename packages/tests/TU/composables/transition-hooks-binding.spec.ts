// #549 — la liaison des hooks JS des transitions etait INVERSEE.
//
// `useCssTransition` et `useWindowTransition` construisent l'objet de props
// passe au `<Transition>` de Vue. Les deux ecrivaient :
//
//     css: !isDisabled.value          // desactive -> pas de CSS
//     if (isDisabled.value) {         // ...et les hooks ne se lient QUE la
//         bind.onBeforeEnter = …      // origin
//         bind.onLeave = …            // leaveAbsolute, hideOnLeave
//         bind.onAfterLeave = …
//     }
//
// ⛔ En usage normal — transition ACTIVE — les hooks ne se liaient donc
// JAMAIS. Ils ne s'attachaient que lorsque la transition etait desactivee,
// c'est-a-dire quand il n'y a plus rien a animer. Les props `origin`,
// `leaveAbsolute` et `hideOnLeave` etaient mortes par construction, et c'est
// ce qui les faisait apparaitre dans la baseline `unconsumed-props`.
//
// La condition externe n'apportait aucune protection : chaque hook garde deja
// sa PROPRE prop en interne (`if (props.origin)`, `if (props.leaveAbsolute)`,
// `if (props.hideOnLeave)`). Elle ne faisait qu'inverser le contrat.
//
// Le correctif est purement additif : le chemin desactive garde exactement le
// comportement qu'il avait, c'est le chemin ACTIF qui cesse d'ignorer ses props.

import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'

import { useCssTransition } from '@origam/composables/Transition/cssTransition.composable'
import { useWindowTransition } from '@origam/composables/Transition/windowTransition.composable'

/** Monte le composable et rend l'objet de props qu'il destine a `<Transition>`. */
const bindOf = (composable: (p: never) => { transitionProps: { value: Record<string, unknown> } }, props: Record<string, unknown>) => {
    let bind: Record<string, unknown> = {}

    mount(defineComponent({
        props: { disabled: Boolean, group: Boolean, mode: String, origin: String, hideOnLeave: Boolean, leaveAbsolute: Boolean },
        setup (componentProps) {
            bind = composable(componentProps as never).transitionProps.value

            return () => h('div')
        }
    }), { props })

    return bind
}

describe('useCssTransition — liaison des hooks JS (#549)', () => {
    it('⛔ transition ACTIVE : les trois hooks sont lies', () => {
        const bind = bindOf(useCssTransition as never, { disabled: false })

        // C'est l'assertion qui echoue sur le code d'avant #549 : les trois
        // etaient absents des que la transition etait active.
        expect(bind.onBeforeEnter).toBeTypeOf('function')
        expect(bind.onLeave).toBeTypeOf('function')
        expect(bind.onAfterLeave).toBeTypeOf('function')
    })

    it('transition DESACTIVEE : les hooks restent lies, le CSS est coupe', () => {
        const bind = bindOf(useCssTransition as never, { disabled: true })

        expect(bind.css).toBe(false)
        expect(bind.onBeforeEnter).toBeTypeOf('function')
        expect(bind.onLeave).toBeTypeOf('function')
    })

    it('le CSS reste actif quand la transition ne l\'est pas', () => {
        expect(bindOf(useCssTransition as never, { disabled: false }).css).toBe(true)
    })

    it('origin est applique par onBeforeEnter en usage normal', () => {
        const bind = bindOf(useCssTransition as never, { disabled: false, origin: 'top left' })
        const el = document.createElement('div')

        ;(bind.onBeforeEnter as (e: HTMLElement) => void)(el)

        expect(el.style.transformOrigin).toBe('top left')
    })

    it('hideOnLeave est applique par onLeave en usage normal', () => {
        const bind = bindOf(useCssTransition as never, { disabled: false, hideOnLeave: true })
        const el = document.createElement('div')

        ;(bind.onLeave as (e: HTMLElement) => void)(el)

        expect(el.style.display).toBe('none')
    })

    it('sans la prop, le hook ne fait rien — la garde interne suffit', () => {
        const bind = bindOf(useCssTransition as never, { disabled: false })
        const el = document.createElement('div')

        ;(bind.onBeforeEnter as (e: HTMLElement) => void)(el)
        ;(bind.onLeave as (e: HTMLElement) => void)(el)

        expect(el.style.transformOrigin).toBe('')
        expect(el.style.display).toBe('')
    })
})

describe('useWindowTransition — liaison des hooks JS (#549)', () => {
    it('⛔ transition ACTIVE : les sept hooks sont lies', () => {
        const bind = bindOf(useWindowTransition as never, { disabled: false })

        for (const hook of [ 'onBeforeEnter', 'onAfterEnter', 'onEnterCancelled', 'onBeforeLeave', 'onAfterLeave', 'onLeaveCancelled', 'onEnter' ]) {
            expect(bind[hook], hook).toBeTypeOf('function')
        }
    })

    it('transition DESACTIVEE : les hooks restent lies', () => {
        const bind = bindOf(useWindowTransition as never, { disabled: true })

        expect(bind.css).toBe(false)
        expect(bind.onEnter).toBeTypeOf('function')
    })
})
