// Unit tests for <OrigamSelect> — useDefaults wiring (issue #242)
//
// Strategy: mount with createOrigam() plugin under a custom theme.
// OrigamSelect did not call useDefaults() so any theme config targeting
// `origam-select` (rounded, border, density, …) was a silent no-op — the
// component kept its own hardcoded `rounded: true` / `border: true`
// legacy-boolean defaults, which resolve to the `rounded-md` fallback
// instead of the theme's radius. This is the exact regression a sibling
// text-field did NOT have (OrigamTextField already called useDefaults),
// producing a visible radius mismatch between an <origam-select> trigger
// and an <origam-text-field> under the same theme (cartoon: 14px vs 20px).
//
// Select forwards its resolved `rounded` prop down through
// OrigamTextField -> OrigamField (both already wired), via a
// template-ref-gated `filterProps` computed — the very first render pass
// runs before the ref populates, so assertions must `await nextTick()`
// (mirrors real browser behaviour: Vue flushes the scheduled update
// before paint, well before any user-visible frame).

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamSelect from '@origam/components/Select/OrigamSelect.vue'
import { createOrigam } from '@origam/origam'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

// jsdom does not provide a working IntersectionObserver — `new
// IntersectionObserver().observe()` throws ("observe is not a function") once
// Select's internal virtual-scroll list mounts its `v-intersect` sentinel.
// Same stub as OrigamInfiniteScroll.spec.ts / OrigamTextField.spec.ts.
class IntersectionObserverMock {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn(() => [])
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

async function mountSelectThemed(componentDefaults: Record<string, unknown>, props: Record<string, unknown> = {}) {
    const theme = { name: 'brandx', mode: 'light' as const, components: { 'origam-select': componentDefaults }, vars: {} }
    const origam = createOrigam({ themes: [theme] })
    origam._defaultsRef.value = origam._activeDefaultsFor('brandx', 'light')
    const wrapper = mount(OrigamSelect, { props: props as never, global: { plugins: [origam] } })
    await nextTick()
    await nextTick()
    return wrapper
}

describe('OrigamSelect — useDefaults (theme components wiring)', () => {
    it('renders with class origam-select', async () => {
        const wrapper = await mountSelectThemed({})
        expect(wrapper.classes()).toContain('origam-select')
    })

    it('resolves rounded="lg" from theme.components[\'origam-select\'] on the forwarded field surface (parity with a themed text-field)', async () => {
        const wrapper = await mountSelectThemed({ rounded: 'lg' })
        const field = wrapper.find('.origam-field')
        expect(field.classes()).toContain('origam--rounded-lg')
        expect(field.attributes('style') || '').toContain('border-radius: var(--origam-radius---lg, 12px)')
    })

    it('without a theme override, the field falls back to the component\'s own legacy rounded=true (rounded-md chrome) — NOT silently ignored', async () => {
        const wrapper = await mountSelectThemed({})
        const field = wrapper.find('.origam-field')
        expect(field.classes()).toContain('origam--rounded-md')
    })

    it('an explicitly passed rounded prop overrides the theme default', async () => {
        const wrapper = await mountSelectThemed({ rounded: 'lg' }, { rounded: 'sm' })
        const field = wrapper.find('.origam-field')
        expect(field.classes()).toContain('origam--rounded-sm')
        expect(field.classes()).not.toContain('origam--rounded-lg')
    })
})

// ---------------------------------------------------------------------------
// #456 — click:control / mousedown:control were declared in ISelectEmits but
// never fired: `defineEmits<ISelectEmits>()`'s return value was never
// captured (no `emit(...)` call existed anywhere in the file). Regression
// tests below mount the component directly (no theme) and assert the
// control surface fires both.
// ---------------------------------------------------------------------------
describe('OrigamSelect — click:control / mousedown:control (#456)', () => {
    it('emits click:control when the field control is clicked', async () => {
        const wrapper = await mountSelectThemed({}, {items: ['a', 'b']})

        await wrapper.find('.origam-field').trigger('click')

        expect(wrapper.emitted('click:control')).toBeTruthy()
        expect(wrapper.emitted('click:control')?.[0]?.[0]).toBeInstanceOf(MouseEvent)
    })

    it('emits mousedown:control when the field control receives a mousedown', async () => {
        const wrapper = await mountSelectThemed({}, {items: ['a', 'b']})

        await wrapper.find('.origam-field').trigger('mousedown')

        expect(wrapper.emitted('mousedown:control')).toBeTruthy()
        expect(wrapper.emitted('mousedown:control')?.[0]?.[0]).toBeInstanceOf(MouseEvent)
    })
})

// ---------------------------------------------------------------------------
// #456 — the `chips` mode default chip carried hardcoded RGB literals
// (`bgColor: 'rgba(168, 168, 168, 1)'`, `color: 'rgb(255, 255, 255)'`),
// bypassing the theme regardless of which theme was active. `chipSlotProps`
// now omits both so `<OrigamChip>` resolves its own themed default
// (`--origam-chip---background-color` / `--origam-chip---color`, both
// emitted by the token pipeline).
// ---------------------------------------------------------------------------
describe('OrigamSelect — chip default color is theme-driven, not hardcoded (#456)', () => {
    it('does not force an inline background-color / color on the default chip', async () => {
        const wrapper = await mountSelectThemed({}, {
            items: ['a', 'b'],
            multiple: true,
            chips: true,
            modelValue: ['a']
        })

        const chip = wrapper.find('.origam-chip')
        expect(chip.exists()).toBe(true)

        const style = chip.attributes('style') ?? ''
        expect(style).not.toContain('168, 168, 168')
        expect(style).not.toContain('255, 255, 255')
    })
})
