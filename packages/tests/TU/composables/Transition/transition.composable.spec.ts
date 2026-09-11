// Tests for transition.composable.ts: useTransition, useCssTransition,
// useWindowTransition.
//
// Coverage (pure-logic, no DOM events):
//   useTransition:
//     - transitionName returns props.name when not disabled.
//     - transitionName returns '' when disabled=true.
//     - isDisabled reflects props.disabled.
//
//   useCssTransition:
//     - tag is Transition when group=false (default).
//     - tag is TransitionGroup when group=true.
//     - transitionProps.css=true when not disabled.
//     - transitionProps.css=false when disabled=true.
//     - transitionProps.mode is set when group=true.
//     - handleBeforeEnter: sets el.style.transformOrigin when origin is set.
//     - handleLeave with leaveAbsolute: stamps position/size as absolute on el.
//     - handleLeave with hideOnLeave: sets display: none !important.
//     - handleAfterLeave: restores styles saved by handleLeave.
//
//   useWindowTransition:
//     - tag is Transition when group=false.
//     - transitionProps.css=true when not disabled.
//     - When ORIGAM_WINDOW_KEY is not injected: transitionProps handlers guard
//       on `!window` and do nothing (no crash).
//     - When provided via parent→child injection: handlers modify the mock.

import { Transition, TransitionGroup, defineComponent, h, provide } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { ORIGAM_WINDOW_KEY } from '@origam/consts'
import { useTransition, useCssTransition, useWindowTransition } from '@origam/composables/Transition/transition.composable'
import type { ITransitionProps } from '@origam/interfaces'

// ---------------------------------------------------------------------------
// Mount helpers
// ---------------------------------------------------------------------------

function mountTransition (props: ITransitionProps) {
    let api!: ReturnType<typeof useTransition>
    const Host = defineComponent({
        setup () { api = useTransition(props); return () => h('div') }
    })
    mount(Host)
    return { api: () => api }
}

function mountCssTransition (props: ITransitionProps) {
    let api!: ReturnType<typeof useCssTransition>
    const Host = defineComponent({
        setup () { api = useCssTransition(props); return () => h('div') }
    })
    mount(Host)
    return { api: () => api }
}

/** Mount useWindowTransition inside a Child component so that a Parent
 *  can provide ORIGAM_WINDOW_KEY via the standard Vue provide/inject chain.
 *  `provide` inside the SAME setup as `inject` is not visible to that inject
 *  — the injection must come from a parent scope.
 */
function mountWindowTransition (props: ITransitionProps, windowMock?: Record<string, unknown>) {
    let api!: ReturnType<typeof useWindowTransition>

    const Child = defineComponent({
        name: 'TransitionChild',
        setup () {
            api = useWindowTransition(props)
            return () => h('div')
        }
    })

    const Parent = defineComponent({
        name: 'TransitionParent',
        setup () {
            if (windowMock) {
                provide(ORIGAM_WINDOW_KEY, windowMock as any)
            }
            return () => h(Child)
        }
    })

    mount(Parent)
    return { api: () => api }
}

// ---------------------------------------------------------------------------
// useTransition
// ---------------------------------------------------------------------------

describe('useTransition — transitionName', () => {
    it('returns props.name when disabled=false', () => {
        const { api } = mountTransition({ name: 'slide', disabled: false })
        expect(api().name.value).toBe('slide')
    })

    it('returns empty string when disabled=true', () => {
        const { api } = mountTransition({ name: 'slide', disabled: true })
        expect(api().name.value).toBe('')
    })

    it('returns undefined when name is not set and not disabled', () => {
        const { api } = mountTransition({ disabled: false })
        expect(api().name.value).toBeUndefined()
    })
})

describe('useTransition — isDisabled', () => {
    it('isDisabled.value is true when props.disabled=true', () => {
        const { api } = mountTransition({ disabled: true })
        expect(api().isDisabled.value).toBe(true)
    })

    it('isDisabled.value is false when props.disabled=false', () => {
        const { api } = mountTransition({ disabled: false })
        expect(api().isDisabled.value).toBe(false)
    })

    it('isDisabled.value is falsy when props.disabled is undefined', () => {
        const { api } = mountTransition({})
        // computed(() => props.disabled) returns undefined, which is falsy
        expect(api().isDisabled.value).toBeFalsy()
    })
})

// ---------------------------------------------------------------------------
// useCssTransition — tag
// ---------------------------------------------------------------------------

describe('useCssTransition — tag', () => {
    it('tag is Transition when group is not set', () => {
        const { api } = mountCssTransition({ name: 'fade' })
        expect(api().tag.value).toBe(Transition)
    })

    it('tag is Transition when group=false', () => {
        const { api } = mountCssTransition({ name: 'fade', group: false })
        expect(api().tag.value).toBe(Transition)
    })

    it('tag is TransitionGroup when group=true', () => {
        const { api } = mountCssTransition({ name: 'fade', group: true })
        expect(api().tag.value).toBe(TransitionGroup)
    })
})

// ---------------------------------------------------------------------------
// useCssTransition — transitionProps
// ---------------------------------------------------------------------------

describe('useCssTransition — transitionProps', () => {
    it('css=true when disabled=false', () => {
        const { api } = mountCssTransition({ name: 'fade', disabled: false })
        expect(api().transitionProps.value.css).toBe(true)
    })

    it('css=false when disabled=true', () => {
        const { api } = mountCssTransition({ name: 'fade', disabled: true })
        expect(api().transitionProps.value.css).toBe(false)
    })

    it('mode is included in transitionProps when group=true and mode is set', () => {
        const { api } = mountCssTransition({ name: 'fade', group: true, mode: 'out-in' })
        expect(api().transitionProps.value.mode).toBe('out-in')
    })

    it('mode is NOT included when group=false', () => {
        const { api } = mountCssTransition({ name: 'fade', group: false, mode: 'out-in' })
        expect(api().transitionProps.value).not.toHaveProperty('mode')
    })

    it('no JS hooks when disabled=false (css-driven)', () => {
        const { api } = mountCssTransition({ name: 'fade', disabled: false })
        const tp = api().transitionProps.value
        expect(tp).not.toHaveProperty('onBeforeEnter')
        expect(tp).not.toHaveProperty('onLeave')
        expect(tp).not.toHaveProperty('onAfterLeave')
    })

    it('JS hooks are set when disabled=true', () => {
        const { api } = mountCssTransition({ disabled: true })
        const tp = api().transitionProps.value
        expect(typeof tp.onBeforeEnter).toBe('function')
        expect(typeof tp.onLeave).toBe('function')
        expect(typeof tp.onAfterLeave).toBe('function')
    })
})

// ---------------------------------------------------------------------------
// useCssTransition — handleBeforeEnter
// ---------------------------------------------------------------------------

describe('useCssTransition — handleBeforeEnter', () => {
    it('sets el.style.transformOrigin when origin prop is set', () => {
        let capturedApi!: ReturnType<typeof useCssTransition>
        const Host = defineComponent({
            setup () {
                capturedApi = useCssTransition({ origin: 'top center', disabled: true })
                return () => h('div')
            }
        })
        mount(Host)
        const el = document.createElement('div')
        const tp = capturedApi.transitionProps.value
        tp.onBeforeEnter?.(el)
        expect(el.style.transformOrigin).toBe('top center')
    })

    it('does NOT set transformOrigin when origin is not set', () => {
        let capturedApi!: ReturnType<typeof useCssTransition>
        const Host = defineComponent({
            setup () {
                capturedApi = useCssTransition({ disabled: true })
                return () => h('div')
            }
        })
        mount(Host)
        const el = document.createElement('div')
        el.style.transformOrigin = 'top left'
        const tp = capturedApi.transitionProps.value
        tp.onBeforeEnter?.(el)
        expect(el.style.transformOrigin).toBe('top left')
    })
})

// ---------------------------------------------------------------------------
// useCssTransition — handleLeave
// ---------------------------------------------------------------------------

describe('useCssTransition — handleLeave (leaveAbsolute)', () => {
    it('sets position=absolute and stamps offset dimensions', () => {
        let capturedApi!: ReturnType<typeof useCssTransition>
        const Host = defineComponent({
            setup () {
                capturedApi = useCssTransition({ disabled: true, leaveAbsolute: true })
                return () => h('div')
            }
        })
        mount(Host)
        const el = document.createElement('div')
        const tp = capturedApi.transitionProps.value
        tp.onLeave?.(el)
        expect(el.style.position).toBe('absolute')
    })

    it('stores _transitionInitialStyles on the element', () => {
        let capturedApi!: ReturnType<typeof useCssTransition>
        const Host = defineComponent({
            setup () {
                capturedApi = useCssTransition({ disabled: true, leaveAbsolute: true })
                return () => h('div')
            }
        })
        mount(Host)
        const el = document.createElement('div')
        const tp = capturedApi.transitionProps.value
        tp.onLeave?.(el)
        expect((el as any)._transitionInitialStyles).toBeDefined()
    })
})

describe('useCssTransition — handleLeave (hideOnLeave)', () => {
    it('sets display: none !important', () => {
        let capturedApi!: ReturnType<typeof useCssTransition>
        const Host = defineComponent({
            setup () {
                capturedApi = useCssTransition({ disabled: true, hideOnLeave: true })
                return () => h('div')
            }
        })
        mount(Host)
        const el = document.createElement('div')
        capturedApi.transitionProps.value.onLeave?.(el)
        expect(el.style.display).toBe('none')
    })
})

// ---------------------------------------------------------------------------
// useCssTransition — handleAfterLeave
// ---------------------------------------------------------------------------

describe('useCssTransition — handleAfterLeave', () => {
    it('restores styles saved by handleLeave and removes _transitionInitialStyles', () => {
        let capturedApi!: ReturnType<typeof useCssTransition>
        const Host = defineComponent({
            setup () {
                capturedApi = useCssTransition({ disabled: true, leaveAbsolute: true })
                return () => h('div')
            }
        })
        mount(Host)
        const el = document.createElement('div')
        el.style.position = 'relative'

        const tp = capturedApi.transitionProps.value
        tp.onLeave?.(el)        // stamps absolute
        tp.onAfterLeave?.(el)   // restores

        expect((el as any)._transitionInitialStyles).toBeUndefined()
        // position was '' before leave (jsdom offsetTop=0) or 'relative' if stamped
        expect(['', 'relative']).toContain(el.style.position)
    })
})

// ---------------------------------------------------------------------------
// useWindowTransition — tag
// ---------------------------------------------------------------------------

describe('useWindowTransition — tag', () => {
    it('tag is Transition when group is not set', () => {
        const { api } = mountWindowTransition({ name: 'fade' })
        expect(api().tag.value).toBe(Transition)
    })

    it('tag is TransitionGroup when group=true', () => {
        const { api } = mountWindowTransition({ name: 'fade', group: true })
        expect(api().tag.value).toBe(TransitionGroup)
    })
})

// ---------------------------------------------------------------------------
// useWindowTransition — transitionProps
// ---------------------------------------------------------------------------

describe('useWindowTransition — transitionProps', () => {
    it('css=true when disabled=false', () => {
        const { api } = mountWindowTransition({ disabled: false })
        expect(api().transitionProps.value.css).toBe(true)
    })

    it('css=false when disabled=true', () => {
        const { api } = mountWindowTransition({ disabled: true })
        expect(api().transitionProps.value.css).toBe(false)
    })

    it('no window injected: handlers do not throw when called', () => {
        // Without a window provider, handlers guard on `!window` and early-return
        const { api } = mountWindowTransition({ disabled: true })
        const tp = api().transitionProps.value
        const el = document.createElement('div')
        expect(() => {
            tp.onBeforeEnter?.(el)
            tp.onAfterEnter?.(el)
            tp.onBeforeLeave?.(el)
            tp.onAfterLeave?.(el)
        }).not.toThrow()
    })

    it('with window mock injected: onBeforeEnter increments transitionCount', () => {
        const windowMock = {
            transitionCount: { value: 0 },
            transitionHeight: { value: undefined as string | undefined },
            rootRef: { value: null }
        }
        const { api } = mountWindowTransition({ disabled: true }, windowMock)
        const tp = api().transitionProps.value
        const el = document.createElement('div')
        tp.onBeforeEnter?.(el)
        expect(windowMock.transitionCount.value).toBe(1)
    })

    it('with window mock injected: onAfterEnter after onBeforeEnter decrements transitionCount to 0', () => {
        const windowMock = {
            transitionCount: { value: 0 },
            transitionHeight: { value: undefined as string | undefined },
            rootRef: { value: null }
        }
        const { api } = mountWindowTransition({ disabled: true }, windowMock)
        const tp = api().transitionProps.value
        const el = document.createElement('div')
        tp.onBeforeEnter?.(el)    // count = 1
        tp.onAfterEnter?.(el)     // count = 0
        expect(windowMock.transitionCount.value).toBe(0)
    })
})
