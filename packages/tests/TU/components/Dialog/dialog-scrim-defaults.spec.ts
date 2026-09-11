// Regression coverage for #279 — `<OrigamDialog>` never declared `scrim` in
// its own `withDefaults()`. `scrim?: boolean | string` (IOverlayScrimProps)
// includes a boolean in its type union, so Vue's compiler infers a runtime
// prop type that includes `Boolean` for the FORWARDED prop on the child
// Overlay's own declaration surface — but the bug here is upstream of that:
// Dialog's OWN resolved `props.scrim` is the one that matters, because
// Dialog explicitly forwards it via `filterProps(props, [...])` into
// `overlayProps`. Since Dialog's `withDefaults()` never set a default for
// `scrim`, and the prop was never explicitly passed by a consumer, Vue
// resolves Dialog's own `props.scrim` to the concrete value `false`
// (boolean-inclusive type + absent attribute + no default => coerced,
// never `undefined`). That explicit `false` then gets forwarded to
// OrigamOverlay and WINS over Overlay's own `withDefaults({ scrim: true })`
// — the scrim never renders. Exact same class of bug already fixed once
// in this file for `openOnClick` (see the comment above Dialog's own
// `withDefaults()`), just never replicated for `scrim`.
//
// This spec proves the forwarding chain directly: a stub Overlay declares
// `scrim` with a REAL pick-based `filterProps` (mirrors the DS's own
// `useProps().filterProps` picking logic) so we can observe exactly what
// Dialog forwards, without fighting the real OrigamOverlay's teleport /
// location-strategy machinery (which the existing OrigamDialog.spec.ts
// deliberately stubs out entirely for the same reason).

import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'

import OrigamDialog from '@origam/components/Dialog/OrigamDialog.vue'
import { createOrigam } from '@origam/origam'

beforeEach(() => {
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
    })) as any
})

// Mirrors `pick()` from src/utils/Commons/commons.util.ts: only forwards
// keys that are BOTH declared on the stub AND present (non-undefined)
// on the source `properties` object — same semantics as the real
// `useProps().filterProps`.
const pick = (obj: Record<string, unknown>, keys: string[]) => {
    const out: Record<string, unknown> = {}
    for (const k of keys) {
        if (k in obj && obj[k] !== undefined) out[k] = obj[k]
    }
    return out
}

const OrigamOverlayStub = defineComponent({
    name: 'OrigamOverlay',
    props: {
        modelValue: { type: Boolean, default: false },
        scrim: { type: [Boolean, String], default: true },
        class: [String, Array, Object],
        style: [String, Array, Object]
    },
    emits: ['update:modelValue'],
    setup (props, { slots, expose }) {
        const contentEl = ref<HTMLElement | null>(null)
        const activatorEl = ref<HTMLElement | null>(null)
        const globalTop = ref(true)
        expose({
            filterProps: (properties: Record<string, unknown>, excludes: string[] = []) =>
                pick(properties, ['scrim'].filter(k => !excludes.includes(k))),
            contentEl,
            activatorEl,
            globalTop
        })
        return () => h('div', { 'data-stub': 'overlay', 'data-scrim': String(props.scrim), class: props.class }, [
            slots.activator?.({ props: {} }),
            props.modelValue ? slots.default?.({ isActive: props.modelValue }) : null
        ])
    }
})

const OrigamCardStub = defineComponent({
    name: 'OrigamCard',
    setup (_props, { slots, expose }) {
        expose({ filterProps: (_p: any) => ({}) })
        return () => h('div', { 'data-stub': 'card' }, [slots.default?.()])
    }
})

const mountDialog = (props: Record<string, unknown> = {}) => {
    return mount(OrigamDialog, {
        attachTo: document.body,
        props: { modelValue: true, ...props },
        global: {
            plugins: [createOrigam()],
            stubs: {
                OrigamOverlay: OrigamOverlayStub,
                OrigamCard: OrigamCardStub,
                OrigamBtn: { template: '<button/>' },
                OrigamIcon: { template: '<span/>' },
                OrigamTranslateScale: { template: '<div><slot/></div>' },
                OrigamDefaultsProvider: { template: '<slot/>' }
            },
            directives: {
                intersect: { mounted: () => {}, unmounted: () => {} },
                contrast: { mounted: () => {}, unmounted: () => {} }
            }
        }
    })
}

describe('OrigamDialog — scrim forwarding (#279)', () => {
    it('forwards scrim=true to the overlay by default (consumer passes nothing)', async () => {
        const wrapper = mountDialog()
        await nextTick()
        await nextTick()
        const overlay = wrapper.find('[data-stub="overlay"]')
        expect(overlay.attributes('data-scrim')).toBe('true')
        wrapper.unmount()
    })

    it('forwards an explicit scrim=false when the consumer sets it', async () => {
        const wrapper = mountDialog({ scrim: false })
        await nextTick()
        await nextTick()
        const overlay = wrapper.find('[data-stub="overlay"]')
        expect(overlay.attributes('data-scrim')).toBe('false')
        wrapper.unmount()
    })

    it('forwards a custom scrim color string unchanged', async () => {
        const wrapper = mountDialog({ scrim: 'rgb(1, 2, 3)' })
        await nextTick()
        await nextTick()
        const overlay = wrapper.find('[data-stub="overlay"]')
        expect(overlay.attributes('data-scrim')).toBe('rgb(1, 2, 3)')
        wrapper.unmount()
    })
})
