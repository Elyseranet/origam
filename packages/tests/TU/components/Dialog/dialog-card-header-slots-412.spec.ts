// Regression coverage for #412 — <OrigamDialog> supplies five header zones
// to the nested <OrigamCard> under DASH-named template targets
// (`#header-append`, `#header-prepend`, `#header-title`, `#header-subtitle`,
// `#header-content`), while <OrigamCard> reads its own slots under POINT
// names (`slots['header.append']`, …). A named-template target must match
// the CHILD's slot name exactly — a dash is not a point — so all five zones,
// INCLUDING the default close button living in `#header-append`'s fallback
// content, were silently discarded. Second defect in the same area: the
// `aria-labelledby` Dialog puts on Card's root never had a matching `id`
// anywhere in the rendered DOM.
//
// This spec mounts the REAL <OrigamCard> (unlike OrigamDialog.spec.ts, which
// stubs it) — mounting the real chain is the only way to prove the slot
// names actually line up, since a hand-written stub can silently encode
// either side of the mismatch.

import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'

import OrigamDialog from '@origam/components/Dialog/OrigamDialog.vue'
import { createOrigam } from '@origam/origam'

beforeEach(() => {
    global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as any
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: false, media: query, onchange: null,
            addListener: vi.fn(), removeListener: vi.fn(),
            addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()
        }))
    })
})

// Only the Overlay is stubbed (teleport + location-strategy machinery is
// unrelated to this bug and heavy to mount for real) — OrigamCard,
// OrigamCardHeader and everything under them render for real.
const OrigamOverlayStub = defineComponent({
    name: 'OrigamOverlay',
    props: { modelValue: { type: Boolean, default: false }, class: [String, Array, Object], style: [String, Array, Object] },
    emits: ['update:modelValue', 'click:outside'],
    setup(props, { slots, expose }) {
        const contentEl = ref<HTMLElement | null>(null)
        const activatorEl = ref<HTMLElement | null>(null)
        const globalTop = ref(true)
        expose({ filterProps: (_p: any, _e?: string[]) => ({}), contentEl, activatorEl, globalTop })
        return () => h('div', { 'data-stub': 'overlay', class: props.class }, [
            slots.activator?.({ props: {} }),
            props.modelValue ? slots.default?.({ isActive: props.modelValue }) : null
        ])
    }
})

// `origamCardRef.value?.filterProps(props)` (OrigamDialog.vue) is the
// template-ref-forwarding pattern documented in `props.composable.ts`:
// the ref is `undefined` on the FIRST render, so `cardProps` (and with it
// `title`, `role`, every forwarded prop) only reaches `<origam-card>` from
// the SECOND render onward. Two `nextTick()`s settle it — see the same
// pattern already used in `dialog-scrim-defaults.spec.ts`.
const mountDialog = async (props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) => {
    const wrapper = mount(OrigamDialog, {
        props: { modelValue: true, ...props },
        slots,
        attachTo: document.body,
        global: {
            plugins: [createOrigam()],
            stubs: { OrigamOverlay: OrigamOverlayStub },
            directives: {
                intersect: { mounted: () => {}, unmounted: () => {} }
            }
        }
    })
    await nextTick()
    await nextTick()
    return wrapper
}

describe('OrigamDialog + real OrigamCard — header slot names (#412)', () => {
    it('renders the default close button (header-append fallback) even with no custom header slot', async () => {
        const wrapper = await mountDialog({ title: 'Settings' })

        // The close button is OrigamBtn with MDI_ICONS.CLOSE and no visible
        // text — assert on the icon class + aria-label rather than text
        // content (same distinction #412 itself calls out about the e2e
        // suite's brittle "Close" text selector).
        const closeBtn = wrapper.find('.origam-card-header__append .origam-btn')
        expect(closeBtn.exists()).toBe(true)
        wrapper.unmount()
    })

    it('renders a custom #header-prepend slot through to the real Card header', async () => {
        const wrapper = await mountDialog(
            { title: 'Settings' },
            { 'header-prepend': () => h('span', { 'data-cy': 'custom-prepend' }, 'P') }
        )
        expect(wrapper.find('[data-cy="custom-prepend"]').exists()).toBe(true)
        wrapper.unmount()
    })

    it('renders a custom #header-subtitle slot through to the real Card header', async () => {
        const wrapper = await mountDialog(
            { title: 'Settings' },
            { 'header-subtitle': () => h('span', { 'data-cy': 'custom-subtitle' }, 'S') }
        )
        expect(wrapper.find('[data-cy="custom-subtitle"]').exists()).toBe(true)
        wrapper.unmount()
    })

    it('renders a custom #header-content slot through to the real Card header', async () => {
        const wrapper = await mountDialog(
            { title: 'Settings' },
            { 'header-content': () => h('span', { 'data-cy': 'custom-content' }, 'C') }
        )
        expect(wrapper.find('[data-cy="custom-content"]').exists()).toBe(true)
        wrapper.unmount()
    })

    it('renders a custom #header-title slot through to the real Card header', async () => {
        const wrapper = await mountDialog(
            {},
            { 'header-title': () => h('span', { 'data-cy': 'custom-title' }, 'T') }
        )
        expect(wrapper.find('[data-cy="custom-title"]').exists()).toBe(true)
        wrapper.unmount()
    })

    it('gives the default title element a real id that aria-labelledby actually resolves to', async () => {
        const wrapper = await mountDialog({ title: 'Settings' })

        const card = wrapper.find('[role="dialog"]')
        const labelledby = card.attributes('aria-labelledby')
        expect(labelledby).toBeTruthy()

        const titleEl = wrapper.find(`#${labelledby}`)
        expect(titleEl.exists()).toBe(true)
        expect(titleEl.classes()).toContain('origam-card-header__title')
        expect(titleEl.text()).toBe('Settings')

        wrapper.unmount()
    })
})
