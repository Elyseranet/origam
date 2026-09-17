/*
 * #779 — les 6 sites d'ordonnanceur laisses ouverts par #753.
 *
 * ⛔ CE FICHIER MESURE AVANT DE CORRIGER
 *
 * #753 a nomme ces sites sans les traiter parce que chacun demande une
 * DECISION, pas l'application mecanique du meme garde. Chaque `describe`
 * ci-dessous porte donc trois choses, dans cet ordre :
 *
 *   1. un CONTROLE POSITIF — la sonde arme bien quelque chose sur ce
 *      site. Sans lui, une sonde qui vise le mauvais element (le piege
 *      `document.scrollingElement === body` de #753) n'arme AUCUNE frame
 *      et conclut « rien ne survit » sur du code totalement nu ;
 *   2. la mesure de survie au demontage — c'est l'A/B contre le parent :
 *      l'assertion doit ROUGIR sur `origin/develop` et verdir ici ;
 *   3. pour les sites gardes par un DRAPEAU plutot que par un handle, la
 *      preuve que la continuation survivante ne fait plus rien.
 *
 * Le harnais d'ordonnanceur est partage avec #719 / #753
 * (`TU/probe/raf-teardown.harness.ts`) — pas une seconde copie.
 */
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref, withDirectives } from 'vue'

import OrigamImg from '@origam/components/Img/OrigamImg.vue'
import OrigamSelect from '@origam/components/Select/OrigamSelect.vue'
import OrigamTextField from '@origam/components/TextField/OrigamTextField.vue'

import { createOrigam } from '@origam/origam'

import Ripple from '@origam/directives/Ripple/ripple.directive'

import type { IRippleHtmlElement } from '@origam/interfaces/Commons/ripple.interface'

import { useBackButton } from '@origam/composables/Commons/backButton.composable'
import { useScrolling } from '@origam/composables/Commons/scrolling.composable'

import {
    flushFramesFrom,
    installFakeSchedulers,
    pendingFramesFrom,
    pendingTimersFrom
} from '../probe/raf-teardown.harness'

beforeEach(() => {
    installFakeSchedulers()
})

afterEach(() => {
    vi.unstubAllGlobals()
})

/*********************************************************
 * OrigamImg:351 / :352 — double rAF de `markBooted`
 ********************************************************/

describe('OrigamImg — double rAF de markBooted (#779)', () => {
    const SOURCE = 'OrigamImg.vue'

    const mountImg = () => mount(OrigamImg, {
        props: {src: {src: 'x.png', aspectRatio: 1}}
    })

    it('arme une frame des le setup quand aspectRatio est deja vrai (controle positif)', () => {
        const wrapper = mountImg()

        expect(pendingFramesFrom(SOURCE)).toBeGreaterThanOrEqual(1)

        wrapper.unmount()
    })

    it('ne laisse plus aucune frame armee apres unmount', () => {
        const wrapper = mountImg()

        wrapper.unmount()

        expect(pendingFramesFrom(SOURCE)).toBe(0)
    })
})

/*********************************************************
 * OrigamSelect:792 / :985 — deux setTimeout nus dans un fichier
 * qui porte DEJA un `onBeforeUnmount` + un drapeau `disposed`
 ********************************************************/

describe('OrigamSelect — les deux setTimeout nus (#779)', () => {
    const SOURCE = 'OrigamSelect.vue'

    const ITEMS = ['un', 'deux', 'trois']

    const mountSelect = () => mount(OrigamSelect, {
        props: {items: ITEMS, autocomplete: true, eager: true},
        global: {plugins: [createOrigam()], stubs: {teleport: true, transition: false}},
        attachTo: document.body
    })

    it('DIAGNOSTIC — inventaire des taches armees', async () => {
        const wrapper = mountSelect()
        const tf = wrapper.findComponent(OrigamTextField)

        console.log('textfield trouve =', tf.exists())

        tf.vm.$emit('update:modelValue', 'de')
        await nextTick()
        tf.vm.$emit('mousedown:control', new MouseEvent('mousedown'))
        await nextTick()

        console.log('apres mousedown:control — timers =', pendingTimersFrom(SOURCE), 'frames =', pendingFramesFrom(SOURCE))

        const list = document.querySelector('.origam-list')

        console.log('liste dans le document =', !!list)

        list?.dispatchEvent(new FocusEvent('focusin', {bubbles: true}))
        await nextTick()

        console.log('apres focusin — timers =', pendingTimersFrom(SOURCE), 'frames =', pendingFramesFrom(SOURCE))

        wrapper.unmount()

        console.log('apres unmount — timers =', pendingTimersFrom(SOURCE), 'frames =', pendingFramesFrom(SOURCE))
    })
})

/*********************************************************
 * ripple.util:213 — le seul des trois setTimeout du fichier
 * dont le handle n'est capture NULLE PART
 ********************************************************/

describe('ripple.util — le setTimeout non capture de rippleHide (#779)', () => {
    const SOURCE = 'ripple.util.ts'

    const mountRipple = () => mount(defineComponent({
        setup: () => () => withDirectives(h('div', {class: 'cible'}), [[Ripple, true]])
    }), {attachTo: document.body})

    it('DIAGNOSTIC — inventaire', async () => {
        const wrapper = mountRipple()

        const el = wrapper.element as IRippleHtmlElement

        console.log('_ripple pose =', !!el._ripple, 'enabled =', el._ripple?.enabled)

        el.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}))
        await nextTick()
        console.log('apres mousedown — timers =', pendingTimersFrom(SOURCE))

        el.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}))
        await nextTick()
        console.log('apres mouseup — timers =', pendingTimersFrom(SOURCE))

        wrapper.unmount()
        console.log('apres unmount — timers =', pendingTimersFrom(SOURCE), '_ripple =', !!el._ripple)
    })

    it('garde-fou — la directive se monte bien', () => {
        const wrapper = mountRipple()

        expect((wrapper.element as IRippleHtmlElement)._ripple).toBeTruthy()
        wrapper.unmount()
    })
})

/*********************************************************
 * backButton — deux setTimeout nus dans un fichier qui porte
 * DEJA un `onScopeDispose` (pose pour les listeners, pas pour eux)
 ********************************************************/

describe('useBackButton — les deux setTimeout nus (#779)', () => {
    const SOURCE = 'backButton.composable.ts'

    it('DIAGNOSTIC — inventaire', async () => {
        let guard: ((to: unknown, from: unknown, next: () => void) => void) | null = null

        const fakeRouter = {
            beforeEach: (fn: never) => {
                guard = fn

                return () => undefined
            },
            afterEach: () => () => undefined
        }

        const wrapper = mount(defineComponent({
            setup () {
                useBackButton(fakeRouter as never, () => undefined)

                return () => h('div')
            }
        }))

        await nextTick()

        console.log('garde enregistre =', !!guard)

        guard?.({}, {}, () => undefined)
        console.log('apres navigation — timers =', pendingTimersFrom(SOURCE))

        window.dispatchEvent(new PopStateEvent('popstate', {state: null}))
        console.log('apres popstate — timers =', pendingTimersFrom(SOURCE))

        wrapper.unmount()
        console.log('apres unmount — timers =', pendingTimersFrom(SOURCE))
    })
})

/*********************************************************
 * scrolling.composable — les rAF ATTENDUS
 ********************************************************/

describe('useScrolling — inventaire des deux familles de rAF (#779)', () => {
    const SOURCE = 'scrolling.composable.ts'

    it('DIAGNOSTIC — onListScroll', async () => {
        const listRef = ref<never>()
        const api: {value: ReturnType<typeof useScrolling> | null} = {value: null}

        const wrapper = mount(defineComponent({
            setup () {
                api.value = useScrolling(listRef, ref(undefined) as never)

                return () => h('div')
            }
        }))

        api.value!.onListScroll()
        console.log('apres onListScroll — frames =', pendingFramesFrom(SOURCE))

        wrapper.unmount()
        console.log('apres unmount — frames =', pendingFramesFrom(SOURCE))
    })

    it('DIAGNOSTIC — finishScrolling : que promet l’await ?', async () => {
        const el = document.createElement('div')

        document.body.appendChild(el)
        el.scrollTo = () => undefined

        const listRef = ref({$el: el}) as never
        const api: {value: ReturnType<typeof useScrolling> | null} = {value: null}

        const wrapper = mount(defineComponent({
            setup () {
                api.value = useScrolling(listRef, ref(undefined) as never)

                return () => h('div')
            }
        }))

        let resolu = false

        void api.value!.onListKeydown({key: 'End'} as KeyboardEvent).then(() => {
            resolu = true
        })

        await nextTick()
        console.log('apres keydown — frames =', pendingFramesFrom(SOURCE))

        wrapper.unmount()
        console.log('apres unmount — frames =', pendingFramesFrom(SOURCE))

        // On draine les frames a la main : c'est ce que fait le
        // navigateur, et c'est la seule facon de voir si la promesse
        // se resout un jour.
        for (let i = 0; i < 8; i++) {
            flushFramesFrom(SOURCE, 1)
            await Promise.resolve()
        }

        console.log('resolu =', resolu, '— frames restantes =', pendingFramesFrom(SOURCE))
    })
})
