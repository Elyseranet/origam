// Unit tests for <OrigamWindow> — hoverClass/activeClass forwarding to the
// prev/next navigation <origam-btn>s.
//
// Both `hoverClass` and `activeClass` are declared on IWindowProps (via
// IHoverProps/IActiveProps) but were never bound in the template — declared,
// type-checked, silently doing nothing (the exact "half-implemented surface"
// bug class the unconsumed-props guard exists for). `hoverClass` was
// forwarded first; this spec covers `activeClass`, wired the same way once
// OrigamBtn gained support for it (IBtnProps now `extends IActiveProps`).
//
// ⛔ MEASURED, NOT ASSUMED: `hoverClass` forwarding is verified at the PROP
// boundary only (`OrigamBtn.props('hoverClass')`), not on the rendered class.
// OrigamBtn declares `hoverClass` (via IHoverProps) but — same root cause as
// the pre-fix `activeClass` — never applies it to its own `btnClasses`; the
// prop reaches the button and dies there. `activeClass` is asserted on the
// RENDERED class because OrigamBtn genuinely consumes it now (this session's
// fix). Wiring OrigamBtn's own hoverClass was out of scope here — flagged to
// the user, not silently fixed.
//
// `continuous: true` makes canMoveBack/canMoveForward unconditionally true
// (see OrigamWindow.vue), so both nav buttons render without needing any
// slotted <origam-window-item> children.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamBtn from '@origam/components/Btn/OrigamBtn.vue'
import OrigamWindow from '@origam/components/Window/OrigamWindow.vue'
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

function mountWindow (props: Record<string, unknown> = {}) {
    return mount(OrigamWindow, {
        props: { continuous: true, ...props } as never,
        global: { plugins: [createOrigam()] }
    })
}

describe('OrigamWindow — hoverClass / activeClass forwarding to nav buttons', () => {
    it('renders both prev and next nav buttons when continuous=true', () => {
        const wrapper = mountWindow()
        expect(wrapper.findAll('button.origam-btn')).toHaveLength(2)
    })

    it('forwards the hoverClass PROP to both nav buttons (rendered-class effect is a separate, pre-existing OrigamBtn gap)', () => {
        const wrapper = mountWindow({ hover: true, hoverClass: 'my-window-hover' })
        const btns = wrapper.findAllComponents(OrigamBtn)
        expect(btns).toHaveLength(2)
        for (const btn of btns) expect(btn.props('hoverClass')).toBe('my-window-hover')
    })

    it('forwards activeClass to both nav buttons', () => {
        const wrapper = mountWindow({ active: true, activeClass: 'my-window-active' })
        const buttons = wrapper.findAll('button.origam-btn')
        expect(buttons).toHaveLength(2)
        for (const btn of buttons) expect(btn.classes()).toContain('my-window-active')
    })

    it('does not forward activeClass when active is unset', () => {
        const wrapper = mountWindow({ activeClass: 'my-window-active' })
        for (const btn of wrapper.findAll('button.origam-btn')) {
            expect(btn.classes()).not.toContain('my-window-active')
        }
    })
})
