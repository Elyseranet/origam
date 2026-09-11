// Unit tests for <OrigamDialog>
//
// Strategy: OrigamDialog composes OrigamOverlay (teleported) and OrigamCard.
// Both are heavy — stub them so the spec stays hermetic and tests the Dialog
// shell wiring: v-model, class modifiers, slots, `handleClose`.
//
// Teleport and IntersectionObserver (v-intersect on the sentinel div) require
// special handling:
//  - OrigamOverlay stub prevents the real Teleport+Overlay from mounting.
//  - v-intersect is stubbed at the global.directives level to a no-op.
//  - IntersectionObserver is re-mocked per-test (vi.clearAllMocks() from the
//    global setup clears the setup-level mockImplementation between tests).
//
// `isRead` emit: relies on IntersectionObserver callbacks that jsdom never
// fires → documented skip.

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'

import OrigamDialog from '@origam/components/Dialog/OrigamDialog.vue'
import { createOrigam } from '@origam/origam'

// ---------------------------------------------------------------------------
// Re-mock per-test (vi.clearAllMocks() from global setup wipes mockImplementation)
// ---------------------------------------------------------------------------
beforeEach(() => {
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
    })) as any
})

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------
// OrigamOverlay stub: transparent pass-through that honours modelValue and
// renders both slots. filterProps is exposed so Dialog's computed overlayProps
// doesn't crash. contentEl / activatorEl are needed by focus-trap watch.
const OrigamOverlayStub = defineComponent({
    name: 'OrigamOverlay',
    props: {
        modelValue: { type: Boolean, default: false },
        class: [String, Array, Object],
        style: [String, Array, Object]
    },
    emits: ['update:modelValue'],
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
            props.modelValue
                ? slots.default?.({ isActive: props.modelValue })
                : null
        ])
    }
})

// OrigamCard stub — renders its `#header-append` slot (close button) and
// `#default` / `#footer` slots.
const OrigamCardStub = defineComponent({
    name: 'OrigamCard',
    props: {
        ariaLabelledby: String,
        ariaModal: String,
        role: String
    },
    setup(_props, { slots, expose }) {
        expose({ filterProps: (_props: any) => ({}) })
        return () => h('div', { 'data-stub': 'card' }, [
            slots['header-append']?.(),
            slots.default?.(),
            slots.footer?.()
        ])
    }
})

const OrigamBtnStub = defineComponent({
    name: 'OrigamBtn',
    props: ['icon', 'rounded', 'ariaLabel', 'bgColor'],
    emits: ['click'],
    template: `<button data-stub="btn" @click="$emit('click')"><slot/></button>`
})

const OrigamIconStub = defineComponent({
    name: 'OrigamIcon',
    props: ['icon', 'size'],
    template: `<span data-stub="icon"/>`
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const makeGlobal = () => ({
    plugins: [createOrigam()],
    stubs: {
        OrigamOverlay: OrigamOverlayStub,
        OrigamCard: OrigamCardStub,
        OrigamBtn: OrigamBtnStub,
        OrigamIcon: OrigamIconStub,
        OrigamTranslateScale: { template: '<div><slot/></div>' },
        OrigamDefaultsProvider: { template: '<slot/>' }
    },
    directives: {
        // v-intersect relies on IntersectionObserver — no-op in unit tests
        intersect: { mounted: () => {}, unmounted: () => {} },
        contrast: { mounted: () => {}, unmounted: () => {} }
    }
})

const mountDialog = (props: Record<string, any> = {}, slots: Record<string, any> = {}) => {
    return mount(OrigamDialog, {
        props: { modelValue: false, ...props },
        slots,
        attachTo: document.body,
        global: makeGlobal()
    })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('OrigamDialog — v-model / open-close', () => {
    it('renders overlay stub on mount', () => {
        const wrapper = mountDialog({ modelValue: false })
        expect(wrapper.find('[data-stub="overlay"]').exists()).toBe(true)
        wrapper.unmount()
    })

    it('renders card content when modelValue=true', () => {
        const wrapper = mountDialog({ modelValue: true })
        expect(wrapper.find('[data-stub="card"]').exists()).toBe(true)
        wrapper.unmount()
    })

    it('does NOT render card content when modelValue=false', () => {
        const wrapper = mountDialog({ modelValue: false })
        expect(wrapper.find('[data-stub="card"]').exists()).toBe(false)
        wrapper.unmount()
    })

    it('emits update:modelValue=false when the close button is clicked', async () => {
        const wrapper = mountDialog({ modelValue: true })
        await wrapper.find('[data-stub="btn"]').trigger('click')
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![emitted!.length - 1]).toEqual([false])
        wrapper.unmount()
    })
})

describe('OrigamDialog — class modifiers', () => {
    it('adds origam-dialog--fullscreen when fullscreen=true', () => {
        const wrapper = mountDialog({ fullscreen: true })
        expect(wrapper.find('[data-stub="overlay"]').classes()).toContain('origam-dialog--fullscreen')
        wrapper.unmount()
    })

    it('adds origam-dialog--scrollable when scrollable=true', () => {
        const wrapper = mountDialog({ scrollable: true })
        expect(wrapper.find('[data-stub="overlay"]').classes()).toContain('origam-dialog--scrollable')
        wrapper.unmount()
    })

    it('adds origam-dialog base class always', () => {
        const wrapper = mountDialog()
        expect(wrapper.find('[data-stub="overlay"]').classes()).toContain('origam-dialog')
        wrapper.unmount()
    })

    it('propagates consumer class prop', () => {
        const wrapper = mountDialog({ class: 'my-custom' })
        expect(wrapper.find('[data-stub="overlay"]').classes()).toContain('my-custom')
        wrapper.unmount()
    })
})

describe('OrigamDialog — size modifier', () => {
    it('adds origam-dialog--size-small for size=small', () => {
        const wrapper = mountDialog({ size: 'small' })
        expect(wrapper.find('[data-stub="overlay"]').classes()).toContain('origam-dialog--size-small')
        wrapper.unmount()
    })

    it('adds origam-dialog--size-large for size=large', () => {
        const wrapper = mountDialog({ size: 'large' })
        expect(wrapper.find('[data-stub="overlay"]').classes()).toContain('origam-dialog--size-large')
        wrapper.unmount()
    })
})

describe('OrigamDialog — slots', () => {
    it('renders #activator slot content', () => {
        const wrapper = mountDialog(
            { modelValue: false },
            { activator: ({ props }: any) => h('button', { ...props, 'data-cy': 'activator' }, 'Open') }
        )
        expect(wrapper.find('[data-cy="activator"]').exists()).toBe(true)
        wrapper.unmount()
    })

    it('renders #footer slot when dialog is open', () => {
        const wrapper = mountDialog(
            { modelValue: true },
            { footer: () => h('div', { 'data-cy': 'footer' }, 'Footer content') }
        )
        expect(wrapper.find('[data-cy="footer"]').exists()).toBe(true)
        wrapper.unmount()
    })

    it('renders #content slot inside the card default area when open', () => {
        const wrapper = mountDialog(
            { modelValue: true },
            { content: () => h('p', { 'data-cy': 'content' }, 'Body text') }
        )
        expect(wrapper.find('[data-cy="content"]').exists()).toBe(true)
        wrapper.unmount()
    })
})

describe('OrigamDialog — isRead emit', () => {
    // isRead fires via IntersectionObserver (vIntersect directive) when the
    // sentinel div at the bottom of the content area becomes visible.
    // jsdom does not implement IntersectionObserver — the global setup mocks it
    // but never fires callbacks. Real intersection cannot be triggered in jsdom.
    it.skip('emits isRead when content sentinel becomes visible (requires real IO)', () => {
        // Limitation: jsdom's IntersectionObserver stub never fires callbacks.
        // Verify with Playwright e2e against a real browser.
    })
})
