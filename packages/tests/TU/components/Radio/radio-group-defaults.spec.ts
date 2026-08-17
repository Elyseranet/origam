import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { OrigamDefaultsProvider, OrigamRadioGroup } from '@origam/components'
import { createOrigam } from '@origam/origam'

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach(el => el.remove())
})

const ITEMS = [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]

// Regression coverage for #263, applied to `<origam-radio-group>`.
//
// The group pushes its own visual-token props into the `'origam-radio'` slot
// defaults it provides to the radios it renders. Forwarding a prop the
// consumer never set is not harmless: `mergeDeep` copies it unconditionally
// and silently overwrites an ancestor/theme `'origam-radio'` entry.
//
// `color` / `bgColor` are `TColor`, which includes `false`, so Vue's
// boolean-prop coercion resolves each UNSET prop to the concrete value
// `false` — a plain `undefined` filter cannot see it. `density` additionally
// carries the group's OWN `withDefaults` value (`'default'`), which is not
// the consumer's intent either and must not win over a theme.
//
// NB — deliberately asserted on the forwarded defaults MAP rather than on
// rendered output: none of the four forwarded props (`color`, `bgColor`,
// `density`, `size`) currently produces any observable class or inline style
// on `<origam-radio>`, whether the radio is standalone or grouped (measured,
// not assumed). The clobbering is therefore real at the defaults layer but
// invisible at the render layer today; a render-level assertion would pass
// for the wrong reason and would not protect the contract.

const forwardedRadioDefaults = (props: Record<string, unknown> = {}): Record<string, unknown> => {
    const wrapper = mount(OrigamRadioGroup, {
        props: { items: ITEMS, ...props } as never,
        global: { plugins: [createOrigam()] }
    })
    const provider = wrapper.findAllComponents(OrigamDefaultsProvider)
        .find(p => 'origam-radio' in ((p.props('defaults') ?? {}) as object))

    return ((provider?.props('defaults') ?? {}) as Record<string, Record<string, unknown>>)['origam-radio'] ?? {}
}

describe('OrigamRadioGroup — does NOT clobber ancestor/theme radio defaults (#263)', () => {
    it('forwards no key the consumer never passed', () => {
        const forwarded = forwardedRadioDefaults()
        expect(Object.keys(forwarded), JSON.stringify(forwarded)).toEqual([])
    })

    it('never forwards a coerced `false` for the TColor props', () => {
        const forwarded = forwardedRadioDefaults()
        expect(forwarded.color, JSON.stringify(forwarded)).toBeUndefined()
        expect(forwarded.bgColor, JSON.stringify(forwarded)).toBeUndefined()
    })

    it('never forwards its own `withDefaults` density over a theme entry', () => {
        const forwarded = forwardedRadioDefaults()
        expect(forwarded.density, JSON.stringify(forwarded)).toBeUndefined()
    })

    it('still forwards a prop the consumer DID pass', () => {
        const forwarded = forwardedRadioDefaults({ color: 'success' })
        expect(forwarded.color, JSON.stringify(forwarded)).toBe('success')
    })

    it('an EXPLICIT `color={false}` from the consumer is still forwarded', () => {
        const forwarded = forwardedRadioDefaults({ color: false })
        expect(forwarded, JSON.stringify(forwarded)).toHaveProperty('color', false)
    })
})
