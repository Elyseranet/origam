// #1128 — `text` is optional on OrigamDataTitle / OrigamDataText when the
// default slot carries the content. Vue reports a required prop that is
// missing through console.warn, so the absence of that warning is the signal.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { OrigamDataText, OrigamDataTitle } from '@origam/components'
import { createOrigam } from '@origam/origam'

const globalConfig = { plugins: [createOrigam()], directives: { contrast: {} } }

afterEach(() => vi.restoreAllMocks())

describe.each([
    ['OrigamDataTitle', OrigamDataTitle, 'dt'],
    ['OrigamDataText', OrigamDataText, 'dd']
] as const)('%s — slot-only usage (#1128)', (_name, component, tag) => {
    it('renders the slot with no `text` and no missing-prop warning', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const wrapper = mount(component as never, { slots: { default: 'Slot content' }, global: globalConfig })
        expect(wrapper.element.tagName.toLowerCase()).toBe(tag)
        expect(wrapper.text()).toBe('Slot content')
        const missing = warn.mock.calls.filter(c => String(c[0]).includes('Missing required prop'))
        expect(missing).toEqual([])
    })
})
