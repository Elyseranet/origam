// Regression test for issue #500 — `<OrigamProgressCircular>` and
// `<OrigamProgressLinear>` carry ZERO ARIA semantics of their own
// (`grep -cE 'role=|aria-' …` returns 0 for both). All of it lived in the
// `<OrigamProgress>` wrapper, so a consumer who mounts either concrete
// component STANDALONE — which nothing prevents, both are exported
// publicly and documented separately — ships a progress indicator that is
// entirely invisible to assistive technology: no `role`, no announcement;
// no `aria-valuenow`, no value.
//
// Decision (see GH issue #500): `OrigamProgressCircular` and
// `OrigamProgressLinear` each own their ARIA semantics. `OrigamProgress`
// stops duplicating it and goes back to being a layout-only dispatcher —
// otherwise a naive fix would produce two conflicting `role="progressbar"`
// declarations on the same rendered node (worse than zero for a screen
// reader), since `<OrigamProgress>` delegates its ENTIRE render to
// whichever concrete component `type` selects via `<component :is="…">`
// (single root — no extra wrapping DOM node is ever produced).
//
// Cases covered: standalone circular, standalone linear, indeterminate
// mode on both (aria-valuenow MUST be absent, not "0" — ARIA spec), the
// wrapper still exposing exactly one `role="progressbar"` (anti-duplication
// guard), and the `active` default (#434) still holding through the moved
// `aria-hidden`.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamProgress from '@origam/components/Progress/OrigamProgress.vue'
import OrigamProgressCircular from '@origam/components/Progress/OrigamProgressCircular.vue'
import OrigamProgressLinear from '@origam/components/Progress/OrigamProgressLinear.vue'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
}) as never

function mountStandalone (component: typeof OrigamProgressCircular | typeof OrigamProgressLinear, props: Record<string, unknown>) {
    return mount(component, {
        props: props as never,
        global: {plugins: [createOrigam()]}
    })
}

describe('OrigamProgressCircular — standalone ARIA semantics (#500)', () => {
    it('carries role="progressbar" without any wrapper', () => {
        const wrapper = mountStandalone(OrigamProgressCircular, {modelValue: 42})

        expect(wrapper.attributes('role')).toBe('progressbar')
    })

    it('reports aria-valuemin=0, aria-valuemax=max and aria-valuenow=value in determinate mode', () => {
        const wrapper = mountStandalone(OrigamProgressCircular, {modelValue: 42, max: 100})

        expect(wrapper.attributes('aria-valuemin')).toBe('0')
        expect(wrapper.attributes('aria-valuemax')).toBe('100')
        expect(wrapper.attributes('aria-valuenow')).toBe('42')
    })

    it('omits aria-valuenow entirely in indeterminate mode (not "0")', () => {
        const wrapper = mountStandalone(OrigamProgressCircular, {indeterminate: true})

        expect(wrapper.attributes('aria-valuenow')).toBeUndefined()
        expect(wrapper.attributes('aria-busy')).toBe('true')
        expect(wrapper.attributes('role')).toBe('progressbar')
    })

    it('exposes an aria-label resolved through t() even with no wrapper around it', () => {
        const wrapper = mountStandalone(OrigamProgressCircular, {modelValue: 10})

        expect(wrapper.attributes('aria-label')).toBeTruthy()
    })

    it('is NOT aria-hidden by default (active defaults to true, #434)', () => {
        const wrapper = mountStandalone(OrigamProgressCircular, {modelValue: 10})

        expect(wrapper.attributes('aria-hidden')).not.toBe('true')
    })

    it('is aria-hidden when the consumer explicitly sets active=false', () => {
        const wrapper = mountStandalone(OrigamProgressCircular, {modelValue: 10, active: false})

        expect(wrapper.attributes('aria-hidden')).toBe('true')
    })
})

describe('OrigamProgressLinear — standalone ARIA semantics (#500)', () => {
    it('carries role="progressbar" without any wrapper', () => {
        const wrapper = mountStandalone(OrigamProgressLinear, {modelValue: 42})

        expect(wrapper.attributes('role')).toBe('progressbar')
    })

    it('reports aria-valuemin=0, aria-valuemax=max and aria-valuenow=value in determinate mode', () => {
        const wrapper = mountStandalone(OrigamProgressLinear, {modelValue: 42, max: 100})

        expect(wrapper.attributes('aria-valuemin')).toBe('0')
        expect(wrapper.attributes('aria-valuemax')).toBe('100')
        expect(wrapper.attributes('aria-valuenow')).toBe('42')
    })

    it('omits aria-valuenow entirely in indeterminate mode (not "0")', () => {
        const wrapper = mountStandalone(OrigamProgressLinear, {indeterminate: true})

        expect(wrapper.attributes('aria-valuenow')).toBeUndefined()
        expect(wrapper.attributes('aria-busy')).toBe('true')
        expect(wrapper.attributes('role')).toBe('progressbar')
    })

    it('exposes an aria-label resolved through t() even with no wrapper around it', () => {
        const wrapper = mountStandalone(OrigamProgressLinear, {modelValue: 10})

        expect(wrapper.attributes('aria-label')).toBeTruthy()
    })

    it('is NOT aria-hidden by default (active defaults to true, #434)', () => {
        const wrapper = mountStandalone(OrigamProgressLinear, {modelValue: 10})

        expect(wrapper.attributes('aria-hidden')).not.toBe('true')
    })

    it('is aria-hidden when the consumer explicitly sets active=false', () => {
        const wrapper = mountStandalone(OrigamProgressLinear, {modelValue: 10, active: false})

        expect(wrapper.attributes('aria-hidden')).toBe('true')
    })
})

describe('OrigamProgress — wrapper stops duplicating ARIA (#500)', () => {
    function mountWrapped (props: Record<string, unknown>) {
        return mount(OrigamProgress, {
            props: props as never,
            global: {plugins: [createOrigam()]}
        })
    }

    it('still exposes exactly one role="progressbar" for the linear dispatch', () => {
        const wrapper = mountWrapped({type: 'linear', modelValue: 42})

        const bars = wrapper.findAll('[role="progressbar"]')
        expect(bars).toHaveLength(1)
    })

    it('still exposes exactly one role="progressbar" for the circular dispatch', () => {
        const wrapper = mountWrapped({type: 'circular', modelValue: 42})

        const bars = wrapper.findAll('[role="progressbar"]')
        expect(bars).toHaveLength(1)
    })

    it('the single role="progressbar" still carries a correct aria-valuenow', () => {
        const wrapper = mountWrapped({type: 'linear', modelValue: 65, max: 100})

        const bar = wrapper.find('[role="progressbar"]')
        expect(bar.attributes('aria-valuenow')).toBe('65')
    })

    it('the wrapper itself declares no role attribute of its own (delegates entirely)', () => {
        const wrapper = mountWrapped({type: 'linear', modelValue: 42})

        // The rendered root IS the delegated OrigamProgressLinear (single
        // root via <component :is>) — so this assertion is really about
        // OrigamProgress.vue's own template never declaring a second,
        // independent `role` binding that could conflict with the one now
        // owned by the concrete component.
        expect(wrapper.findAll('[role]')).toHaveLength(1)
    })
})
