// #1338 — OrigamStepperItem `prepend` / `append` and the OrigamStepper
// `item-prepend` / `item-append` forwarding (connectors are kept).
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import OrigamStepper from '@origam/components/Stepper/OrigamStepper.vue'
import OrigamStepperItem from '@origam/components/Stepper/OrigamStepperItem.vue'
import { createOrigam } from '@origam/origam'

const items = [{ title: 'A' }, { title: 'B' }, { title: 'C' }]
const global = { plugins: [createOrigam()] }

describe('OrigamStepperItem slots', () => {
    it('renders prepend and append with index and status', () => {
        const wrapper = mount(OrigamStepperItem, {
            props: { index: 1, title: 'B' },
            slots: {
                prepend: '<i class="pre">{{ params.index }}-{{ params.status }}</i>',
                append: '<b class="app">{{ params.status }}</b>'
            },
            global
        })
        expect(wrapper.find('.pre').text()).toBe('1-pending')
        expect(wrapper.find('.app').text()).toBe('pending')
    })

    it('renders nothing extra without slot', () => {
        const wrapper = mount(OrigamStepperItem, { props: { title: 'B' }, global })
        expect(wrapper.element.children.length).toBe(2)
    })
})

describe('OrigamStepper item-prepend / item-append', () => {
    it('forwards to every item and keeps the connectors', () => {
        const wrapper = mount(OrigamStepper, {
            props: { items, modelValue: 1 },
            slots: { 'item-append': '<b class="app">{{ params.item.title }}:{{ params.status }}</b>' },
            global
        })
        expect(wrapper.findAll('.app').map(n => n.text())).toEqual(['A:done', 'B:active', 'C:pending'])
        expect(wrapper.findAll('.origam-stepper__connector')).toHaveLength(2)
    })

    it('adds no extra child when no item slot is given', () => {
        const wrapper = mount(OrigamStepper, { props: { items }, global })
        expect(wrapper.find('.origam-stepper-item').element.children.length).toBe(2)
    })
})
