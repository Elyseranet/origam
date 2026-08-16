// Spot-check (blast-radius verification) for the directional spacing /
// corner props on a SECOND `useStateEffect` consumer, distinct from
// OrigamCard — proves the stateEffect.composable.ts forwarding fix isn't
// Card-specific. See OrigamCard.directional-props.spec.ts for the full
// rationale, and OrigamBtn.border-axis.spot-check.spec.ts for the prior
// instance of this same bug shape.
//
// Like the border-axis spot-check, OrigamBtn renders its styles through
// `useStyle()` (a per-instance stylesheet injected into <head>), not an
// inline `style` attribute — hence `getComputedStyle` on an attached
// element rather than `el.style`.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamBtn from '@origam/components/Btn/OrigamBtn.vue'

function read (props: Record<string, unknown>, cssProp: string) {
    const wrapper = mount(OrigamBtn, { props, attachTo: document.body })
    const value = getComputedStyle(wrapper.element).getPropertyValue(cssProp)

    wrapper.unmount()
    return value
}

describe('OrigamBtn — directional props spot-check (useStateEffect consumer)', () => {
    it('paddingInline reaches the injected stylesheet', () => {
        expect(read({ paddingInline: '22px' }, 'padding-inline')).toBe('22px')
        expect(read({ paddingInline: '44px' }, 'padding-inline')).toBe('44px')
    })

    it('paddingTop reaches the injected stylesheet', () => {
        expect(read({ paddingTop: '13px' }, 'padding-top')).toBe('13px')
    })

    it('marginBlock reaches the injected stylesheet', () => {
        expect(read({ marginBlock: '7px' }, 'margin-block')).toBe('7px')
    })

    it('marginRight reaches the injected stylesheet', () => {
        expect(read({ marginRight: '5px' }, 'margin-right')).toBe('5px')
    })

    it('roundedBottomRight reaches the injected stylesheet', () => {
        expect(read({ roundedBottomRight: '11px' }, 'border-bottom-right-radius')).toBe('11px')
    })

    it('a per-side value beats the shorthand for that side only', () => {
        expect(read({ padding: '2px', paddingTop: '30px' }, 'padding-top')).toBe('30px')
    })
})
