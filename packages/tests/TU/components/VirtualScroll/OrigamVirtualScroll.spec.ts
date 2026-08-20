// Regression test for issue #437 — the renderless bottom spacer's `style`
// attribute was written WITHOUT the leading `:` (`style="{ … }"` instead of
// `:style="{ … }"`). Vue's SFC compiler treats an un-prefixed `style` as a
// STATIC attribute: it parses the literal source text as CSS at compile
// time (`{ 'padding-bottom': convertToUnit(paddingBottom) }` is not valid
// `property: value` syntax), the parse yields nothing, and the `style`
// attribute is dropped from the render altogether — verified via
// `wrapper.html()`, the rendered spacer has NO `style` attribute at all.
// `convertToUnit` / `paddingBottom` are therefore never evaluated. The
// `padding-bottom` that is meant to compensate for the rows above `last`
// that aren't rendered is never applied, `scrollHeight` under-reports, and
// scrolling past the last rendered row breaks.
//
// The top spacer (`:style="{ 'padding-top': convertToUnit(paddingTop) }"`)
// has always had the correct binding and is used here as the control: after
// the fix, the bottom spacer must render the same way — a real, interpolated
// `padding-bottom: <value>px;` declaration.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamVirtualScroll from '@origam/components/VirtualScroll/OrigamVirtualScroll.vue'
import { createOrigam } from '@origam/origam'

function mountRenderless (itemCount: number) {
    return mount(OrigamVirtualScroll, {
        props: {
            renderless: true,
            items: Array.from({length: itemCount}, (_, i) => `item-${i}`),
            itemHeight: 50,
            height: 200
        } as never,
        slots: {
            'item.renderless': '<div>{{ params.item }}</div>'
        },
        global: {plugins: [createOrigam()]}
    })
}

describe('OrigamVirtualScroll — renderless bottom spacer style binding (#437)', () => {
    it('renders the bottom spacer with a real, interpolated padding-bottom declaration', () => {
        const wrapper = mountRenderless(50)

        const spacers = wrapper.findAll('.origam-virtual-scroll__spacer')
        expect(spacers).toHaveLength(2)

        const bottomSpacer = spacers[1]
        const style = bottomSpacer.attributes('style') ?? ''

        // The bug: the static (un-evaluated) attribute fails to parse as
        // CSS and Vue drops it entirely — no style attribute at all.
        expect(style).not.toContain('convertToUnit')
        expect(style).not.toContain('paddingBottom')

        // The fix: a real, interpolated CSS declaration, matching the top
        // spacer's shape.
        expect(style).toMatch(/padding-bottom:\s*-?\d+(\.\d+)?px/)
    })

    it('binds the bottom spacer the same way the top spacer already does', () => {
        const wrapper = mountRenderless(50)

        const spacers = wrapper.findAll('.origam-virtual-scroll__spacer')
        const topStyle = spacers[0].attributes('style') ?? ''
        const bottomStyle = spacers[1].attributes('style') ?? ''

        expect(topStyle).toMatch(/padding-top:\s*-?\d+(\.\d+)?px/)
        // Same binding mechanism → same shape of rendered attribute (a real
        // CSS declaration), not a literal template-string artefact.
        expect(bottomStyle.startsWith('{')).toBe(false)
    })
})
