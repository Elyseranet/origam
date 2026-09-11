// Spot-check (blast-radius verification) for borderBlock / borderInline on
// a SECOND `useStateEffect` consumer, distinct from OrigamCard — proves the
// stateEffect.composable.ts fix isn't Card-specific. See
// OrigamCard.border-axis.spec.ts for the full rationale.
//
// Unlike OrigamCard (inline `:style="cardStyles"`), OrigamBtn renders its
// border/padding/color/... styles through `useStyle()` — a per-instance
// CSS-in-JS stylesheet injected into `<head>` as `#origam-btn-N { … }`
// rather than an inline `style` attribute (packages/ds/src/components/Btn/
// OrigamBtn.vue, `useStyle(btnStyles, () => props.id)`). Asserting on
// `el.style` would therefore always read empty regardless of the fix —
// the test instead asserts on `getComputedStyle`, which reflects the
// cascade from the injected stylesheet once the element is attached to
// `document.body` (required for jsdom to apply non-inline CSS rules).

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamBtn from '@origam/components/Btn/OrigamBtn.vue'

describe('OrigamBtn — borderBlock / borderInline spot-check (useStateEffect consumer)', () => {
    it('borderBlock paints border-block-* via the injected per-instance stylesheet', () => {
        const wrapper = mount(OrigamBtn, { props: { borderBlock: 3 }, attachTo: document.body })
        const computed = getComputedStyle(wrapper.element)

        expect(computed.getPropertyValue('border-block-width')).toBe('3px')
        expect(computed.getPropertyValue('border-block-style')).toBe('solid')

        wrapper.unmount()
    })

    it('borderInline paints border-inline-* via the injected per-instance stylesheet', () => {
        const wrapper = mount(OrigamBtn, { props: { borderInline: '1px dotted blue' }, attachTo: document.body })
        const computed = getComputedStyle(wrapper.element)

        expect(computed.getPropertyValue('border-inline-width')).toBe('1px')
        expect(computed.getPropertyValue('border-inline-style')).toBe('dotted')
        expect(computed.getPropertyValue('border-inline-color')).toBe('blue')

        wrapper.unmount()
    })
})
