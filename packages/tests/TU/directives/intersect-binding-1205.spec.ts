// #1205 — `v-intersect` bound with the `withDirectives` TUPLE as its value.
//
// `OrigamTextField`, `OrigamTextareaField`, `OrigamPasswordField` and
// `OrigamLazy` bound `[{ handler, options }, null, ['once']]` as the binding
// VALUE. The directive reads `.handler` / `.options` off the value: on an
// array both are `undefined`, so no intersection ever called the handler, the
// `once` was never read (it is a MODIFIER, not a tuple slot) and the
// consumer's `options` never reached the IntersectionObserver.
//
// The IntersectionObserver is CONTROLLED here: each instance records its
// callback, options and observed element, so a test fires an intersection by
// hand and asserts what the component did with it.

import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import OrigamLazy from '@origam/components/Lazy/OrigamLazy.vue'
import OrigamPasswordField from '@origam/components/PasswordField/OrigamPasswordField.vue'
import OrigamTextField from '@origam/components/TextField/OrigamTextField.vue'
import OrigamTextareaField from '@origam/components/TextareaField/OrigamTextareaField.vue'
import Intersect from '@origam/directives/Intersect/intersect.directive'
import { createOrigam } from '@origam/origam'

interface IFakeObserver {
    cb: IntersectionObserverCallback
    options?: IntersectionObserverInit
    observed: Element[]
    unobserve: ReturnType<typeof vi.fn>
}

let observers: IFakeObserver[] = []

const observerOf = (el: Element) => observers.find(o => o.observed.includes(el))

const fire = (el: Element, isIntersecting: boolean) => {
    const o = observerOf(el)

    expect(o, 'no IntersectionObserver observes this element').toBeTruthy()
    o!.cb([{ isIntersecting, target: el } as unknown as IntersectionObserverEntry], {} as IntersectionObserver)
}

beforeEach(() => {
    observers = []
    global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never
    global.IntersectionObserver = (class {
        record: IFakeObserver
        constructor (cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
            this.record = { cb, options, observed: [], unobserve: vi.fn() }
            observers.push(this.record)
        }
        observe (el: Element) { this.record.observed.push(el) }
        unobserve (el: Element) { this.record.unobserve(el) }
        disconnect () { /* no-op */ }
    }) as never
})

afterEach(() => {
    vi.restoreAllMocks()
})

describe.each([
    ['OrigamTextField', OrigamTextField, 'input'],
    ['OrigamTextareaField', OrigamTextareaField, 'textarea'],
    ['OrigamPasswordField', OrigamPasswordField, 'input']
])('%s — autofocus through v-intersect.once (#1205)', (_name, component, selector) => {
    it('focuses the control when it scrolls into view, and only once', async () => {
        const focus = vi.spyOn(HTMLElement.prototype, 'focus')
        const wrapper = mount(component as never, {
            props: { autofocus: true } as never,
            global: { plugins: [createOrigam()] },
            attachTo: document.body
        })

        await nextTick()
        await nextTick()

        const control = wrapper.find(selector).element

        fire(control, true)

        expect(focus).toHaveBeenCalledTimes(1)
        expect(focus.mock.contexts[0]).toBe(control)
        expect(observerOf(control)!.unobserve).toHaveBeenCalledWith(control)

        wrapper.unmount()
    })

    it('does not focus without autofocus', async () => {
        const focus = vi.spyOn(HTMLElement.prototype, 'focus')
        const wrapper = mount(component as never, {
            global: { plugins: [createOrigam()] },
            attachTo: document.body
        })

        await nextTick()
        await nextTick()

        fire(wrapper.find(selector).element, true)

        expect(focus).not.toHaveBeenCalled()

        wrapper.unmount()
    })
})

describe('OrigamLazy — activation through v-intersect.once (#1205)', () => {
    const mountLazy = (props: Record<string, unknown> = {}) => mount(OrigamLazy, {
        props: { height: 100, ...props } as never,
        slots: { default: () => 'LAZY CONTENT' },
        global: { plugins: [createOrigam()] },
        attachTo: document.body
    })

    it('stays empty until the element intersects, then renders and stops observing', async () => {
        const wrapper = mountLazy()

        await nextTick()

        expect(wrapper.text()).not.toContain('LAZY CONTENT')

        fire(wrapper.element, true)
        await nextTick()
        await nextTick()

        expect(wrapper.text()).toContain('LAZY CONTENT')
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
        expect(observerOf(wrapper.element)!.unobserve).toHaveBeenCalledWith(wrapper.element)

        wrapper.unmount()
    })

    it('hands the consumer `options` to the IntersectionObserver', async () => {
        const wrapper = mountLazy({ options: { rootMargin: '40px', threshold: 0.5 } })

        await nextTick()

        expect(observerOf(wrapper.element)!.options).toEqual({ rootMargin: '40px', threshold: 0.5 })

        wrapper.unmount()
    })

    it('an already active Lazy ignores later intersections', async () => {
        const wrapper = mountLazy({ modelValue: true })

        await nextTick()
        fire(wrapper.element, true)
        await nextTick()

        expect(wrapper.emitted('update:modelValue')).toBeUndefined()

        wrapper.unmount()
    })
})

describe('v-intersect — dev warning on an array binding (#1205)', () => {
    const bind = (el: HTMLElement, value: unknown) => Intersect.mounted(el, {
        value,
        modifiers: {},
        instance: { $: { uid: 1 } }
    } as never)

    it('warns when the value is the withDirectives tuple, and says what to write', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const el = document.createElement('section')

        bind(el, [{ handler: () => {} }, null, ['once']])

        expect(warn).toHaveBeenCalledTimes(1)
        expect(String(warn.mock.calls[0][0])).toContain('v-intersect.once="{ handler, options }"')
        expect(String(warn.mock.calls[0][0])).toContain('<section>')
    })

    it('warns once per tag, not once per element', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

        bind(document.createElement('aside'), [{ handler: () => {} }])
        bind(document.createElement('aside'), [{ handler: () => {} }])

        expect(warn).toHaveBeenCalledTimes(1)
    })

    it('stays silent for a function and for { handler, options }', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

        bind(document.createElement('main'), () => {})
        bind(document.createElement('nav'), { handler: () => {}, options: { threshold: 1 } })

        expect(warn).not.toHaveBeenCalled()
    })
})
