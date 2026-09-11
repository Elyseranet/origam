// Regression coverage for #416 — declaring `click:outside` as one of
// `<OrigamDialog>`'s own emits (`IDialogEmits extends IClickOutsideEmits`)
// strips any `onClick:outside` LISTENER out of `$attrs` before the
// fallthrough merge (Vue does this deliberately so the same event can't
// fire twice). Since Dialog's template never called
// `emits('click:outside', …)` itself, the only channel that used to carry
// the event — attrs fallthrough onto the single-root `<origam-overlay>`,
// which DOES emit it (`OrigamOverlay.vue`, `handleClickOutside`) — was cut
// the moment the emit got declared "for typing".
//
// Reproduction matches the one described in the issue: a stub Overlay that
// emits `click:outside` exactly like the real one, with a counter on
// `<origam-dialog>`.

import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'

import OrigamDialog from '@origam/components/Dialog/OrigamDialog.vue'
import { createOrigam } from '@origam/origam'

beforeEach(() => {
    global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as any
})

// Mirrors the real OrigamOverlay's public surface just enough to drive the
// Dialog around it: v-model, filterProps, and a `click:outside` emit fired
// exactly like `handleClickOutside` does in the real component.
const OrigamOverlayStub = defineComponent({
    name: 'OrigamOverlay',
    props: {
        modelValue: { type: Boolean, default: false },
        class: [String, Array, Object],
        style: [String, Array, Object]
    },
    emits: ['update:modelValue', 'click:outside'],
    setup(props, { slots, expose }) {
        const contentEl = ref<HTMLElement | null>(null)
        const activatorEl = ref<HTMLElement | null>(null)
        const globalTop = ref(true)
        expose({
            filterProps: (_props: any, _excludes?: string[]) => ({}),
            contentEl,
            activatorEl,
            globalTop
        })
        return () => h('div', { 'data-stub': 'overlay', class: props.class }, [
            slots.activator?.({ props: {} }),
            props.modelValue ? slots.default?.({ isActive: props.modelValue }) : null
        ])
    }
})

const OrigamCardStub = defineComponent({
    name: 'OrigamCard',
    props: { ariaLabelledby: String, ariaModal: String, role: String, titleId: String },
    setup(_props, { slots, expose }) {
        expose({ filterProps: (_p: any) => ({}) })
        return () => h('div', { 'data-stub': 'card' }, [
            slots['header.append']?.(),
            slots.default?.(),
            slots.footer?.()
        ])
    }
})

const makeGlobal = () => ({
    plugins: [createOrigam()],
    stubs: {
        OrigamOverlay: OrigamOverlayStub,
        OrigamCard: OrigamCardStub,
        OrigamBtn: { template: '<button data-stub="btn"/>' },
        OrigamIcon: { template: '<span/>' },
        OrigamTranslateScale: { template: '<div><slot/></div>' },
        OrigamDefaultsProvider: { template: '<slot/>' }
    },
    directives: {
        intersect: { mounted: () => {}, unmounted: () => {} },
        contrast: { mounted: () => {}, unmounted: () => {} }
    }
})

describe('OrigamDialog — click:outside relay (#416)', () => {
    it('reaches the consumer when the overlay emits it', async () => {
        const wrapper = mount(OrigamDialog, {
            props: { modelValue: true },
            attachTo: document.body,
            global: makeGlobal()
        })

        const overlay = wrapper.findComponent({ name: 'OrigamOverlay' })
        const event = new MouseEvent('click')
        overlay.vm.$emit('click:outside', event)
        await nextTick()

        const emitted = wrapper.emitted('click:outside')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe(event)

        wrapper.unmount()
    })

    it('fires exactly once per outside click — no double emission', async () => {
        const wrapper = mount(OrigamDialog, {
            props: { modelValue: true },
            attachTo: document.body,
            global: makeGlobal()
        })

        const overlay = wrapper.findComponent({ name: 'OrigamOverlay' })
        overlay.vm.$emit('click:outside', new MouseEvent('click'))
        await nextTick()

        expect(wrapper.emitted('click:outside')).toHaveLength(1)

        wrapper.unmount()
    })
})
