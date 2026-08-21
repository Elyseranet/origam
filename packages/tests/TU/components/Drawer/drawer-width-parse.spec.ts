// Regression for #384 (Drawer form, confirmed at runtime — the ticket
// listed this as "same form, unconfirmed" for Drawer/railWidth). Unlike
// OrigamBottomNav, OrigamDrawer has NO `useDimension()` fallback: the
// internal `width` computed (`Number(props.width)`) is the ONLY source
// feeding the rendered CSS width (via `useLayoutItem`'s `elementSize` for a
// horizontal drawer). A CSS-length string therefore doesn't just fail to
// override a correct default — it replaces a WORKING rendered width with
// the literal invalid declaration `width: NaN`.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { OrigamDrawer, OrigamLayout } from '@origam/components'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

afterEach(() => {
    document.body.innerHTML = ''
    document.head.querySelectorAll('style').forEach(el => el.remove())
})

const injectedRuleFor = (id: string): string => {
    for (const styleEl of Array.from(document.head.querySelectorAll('style'))) {
        if (styleEl.textContent?.includes(`#${id}`)) return styleEl.textContent
    }
    return ''
}

// `OrigamDrawer` has no `useDimension()` fallback: its rendered width comes
// ENTIRELY from `useLayoutItem`'s `elementSize`, which is inert (empty
// styles) without an `<OrigamLayout>` ancestor — mount inside one, same as
// the #383 BottomNav/SystemBar specs.
function mountDrawer (props: Record<string, unknown> = {}) {
    const Host = defineComponent({
        setup () {
            return () => h(OrigamLayout, null, {
                default: () => h(OrigamDrawer, { modelValue: true, ...props })
            })
        }
    })
    return mount(Host, {
        attachTo: document.body,
        global: { plugins: [createOrigam()] }
    })
}

describe('OrigamDrawer — width parses a CSS-length string instead of producing NaN (#384)', () => {
    it('width="256px" (a string) renders 256px, not the literal "NaN"', async () => {
        const wrapper = mountDrawer({ width: '256px' })
        await nextTick()
        await nextTick()

        const drawer = document.body.querySelector('.origam-drawer')
        expect(drawer).not.toBeNull()
        const id = drawer?.id ?? ''
        const rule = injectedRuleFor(id)

        expect(rule).not.toContain('NaN')
        expect(rule).toContain('width: 256px')
        wrapper.unmount()
    })

    it('rail + expandOnHover + railWidth="72px" (a string) renders 72px, not "NaN"', async () => {
        const wrapper = mountDrawer({ rail: true, expandOnHover: true, railWidth: '72px' })
        await nextTick()
        await nextTick()

        const drawer = document.body.querySelector('.origam-drawer')
        expect(drawer).not.toBeNull()
        const id = drawer?.id ?? ''
        const rule = injectedRuleFor(id)

        expect(rule).not.toContain('NaN')
        expect(rule).toContain('width: 72px')
        wrapper.unmount()
    })

    it('a bare numeric width (already worked before the fix) still works: width=256 -> 256px', async () => {
        const wrapper = mountDrawer({ width: 256 })
        await nextTick()
        await nextTick()

        const drawer = document.body.querySelector('.origam-drawer')
        expect(drawer).not.toBeNull()
        const id = drawer?.id ?? ''
        const rule = injectedRuleFor(id)
        expect(rule).toContain('width: 256px')
        wrapper.unmount()
    })
})
