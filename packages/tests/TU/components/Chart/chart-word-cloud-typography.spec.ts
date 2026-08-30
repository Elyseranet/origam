// #426 — OrigamChartWordCloud typed `fontSize`/`fontWeight` (inherited
// from IChartBaseProps) but never called `useChartHeaderTypography`, the
// composable every OTHER Chart component uses to route those two props
// into the `--origam-chart__title---font-size` / `---font-weight` CSS
// vars its own SCSS reads. Passing `fontSize` had no effect at all.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamChartWordCloud from '@origam/components/Chart/OrigamChartWordCloud.vue'
import { createOrigam } from '@origam/origam'

const series = [{name: 'S', data: [{text: 'hello', value: 10}, {text: 'world', value: 5}]}]

describe('OrigamChartWordCloud — fontSize/fontWeight reach the root style (#426)', () => {
    it('routes fontSize into --origam-chart__title---font-size (was completely absent pre-fix)', () => {
        const wrapper = mount(OrigamChartWordCloud, {
            props: {series, title: 'My Cloud', fontSize: '2rem'} as never,
            global: {plugins: [createOrigam()]}
        })

        expect(wrapper.attributes('style')).toContain('--origam-chart__title---font-size: var(--origam-font__size---2rem)')
    })

    it('routes fontWeight into --origam-chart__title---font-weight, and the value actually changes with the prop', () => {
        const wrapper600 = mount(OrigamChartWordCloud, {
            props: {series, title: 'My Cloud'} as never,
            global: {plugins: [createOrigam()]}
        })
        const wrapper800 = mount(OrigamChartWordCloud, {
            props: {series, title: 'My Cloud', fontWeight: 800} as never,
            global: {plugins: [createOrigam()]}
        })

        expect(wrapper600.attributes('style')).toContain('--origam-font__weight---600')
        expect(wrapper800.attributes('style')).toContain('--origam-font__weight---800')
        expect(wrapper600.attributes('style')).not.toBe(wrapper800.attributes('style'))
    })
})
