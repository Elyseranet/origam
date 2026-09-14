// Regression for #384 — `OrigamProgressCircular` listed as "same form,
// unconfirmed" for `size` (line 139). Confirmed at runtime, and it is
// actually MORE severe than BottomNav/Drawer: `size` here isn't a CSS
// declaration silently dropped on an invalid value, it feeds SVG geometry
// math (`diameter`, `strokeWidth`, `svgViewBox`) — `Number('48px')` === NaN
// poisons all three, producing an invalid `viewBox="0 0 NaN NaN"` and an
// invalid `stroke-width="NaN"`, which breaks the whole SVG render, not just
// one declaration.
//
// A second, independent instance of the exact same form was found in the
// same file while confirming the ticket's line 139 — NOT listed in the
// ticket, but the identical bug shape one function down: `svgStyles`
// (line ~200) does `Number(props.rotate)` UNCONDITIONALLY (no `if` guard,
// no default in `withDefaults`), so every ProgressCircular that doesn't
// explicitly pass `rotate` renders `transform: rotate(calc(-90deg +
// NaNdeg))` — an invalid declaration the browser drops entirely, silently
// losing the intended "no extra rotation" default (`rotate="0"` in the
// docs/story is treated as equivalent to omitting the prop, but omitting it
// is NOT the same at runtime pre-fix).

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamProgressCircular from '@origam/components/Progress/OrigamProgressCircular.vue'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

function mountCircular (props: Record<string, unknown> = {}) {
    return mount(OrigamProgressCircular, {
        props: { modelValue: 33, ...props } as never,
        global: { plugins: [createOrigam()] }
    })
}

describe('OrigamProgressCircular — size/rotate parse a CSS-length / numeric string instead of producing NaN (#384)', () => {
    it('size="48px" (a custom CSS-length string) renders a valid numeric viewBox, not "NaN"', async () => {
        const wrapper = mountCircular({ size: '48px' })
        await nextTick()

        const svg = wrapper.find('svg')
        expect(svg.attributes('viewBox')).not.toContain('NaN')

        const overlay = wrapper.find('.origam-progress__overlay')
        expect(overlay.attributes('stroke-width')).not.toBe('NaN')
    })

    it('size=48 (a bare number, already worked before the fix) still renders a valid viewBox', async () => {
        const wrapper = mountCircular({ size: 48 })
        await nextTick()

        const svg = wrapper.find('svg')
        expect(svg.attributes('viewBox')).not.toContain('NaN')
    })

    it('no `rotate` prop passed renders the base -90deg transform, not a NaN-poisoned one', async () => {
        const wrapper = mountCircular()
        await nextTick()

        const svg = wrapper.find('svg')
        const style = svg.attributes('style') ?? ''
        expect(style).not.toContain('NaN')
        expect(style).toContain('-90deg')
    })

    it('rotate="90" (a numeric string) still shifts the start angle by 90deg', async () => {
        const wrapper = mountCircular({ rotate: '90' })
        await nextTick()

        const svg = wrapper.find('svg')
        const style = svg.attributes('style') ?? ''
        expect(style).not.toContain('NaN')
        expect(style).toContain('-90deg + 90deg')
    })
})
