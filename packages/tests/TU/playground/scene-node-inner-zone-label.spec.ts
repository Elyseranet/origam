// #1156 — the preview listens to every declared emit; a listener on an inner
// zone needs an accessible name or the DS warns. The node sets a default one,
// for the PREVIEW only, and a name already on the instance wins.

import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'

import { createOrigam } from '@origam/origam'

import PlaygroundSceneNode from '../../../playground/src/components/Playground/PlaygroundSceneNode.vue'

const Probe = defineComponent({
    name: 'Probe',
    inheritAttrs: false,
    setup: (_, { attrs }) => () => h('div', { 'data-attrs': JSON.stringify(attrs) })
})

const mountNode = async (events: string[], props: Record<string, unknown>) => {
    const instance = { id: 'i1', componentName: 'OrigamSelect', props }
    const registry = {
        getComponentMetadata: () => ({ events: events.map(name => ({ name })) }),
        getComponent: async () => Probe
    }
    const wrapper = mount(PlaygroundSceneNode, {
        props: { instance, registry } as never,
        global: { plugins: [createOrigam()] }
    })
    await flushPromises()

    return { wrapper, instance, attrs: JSON.parse(wrapper.find('[data-attrs]').attributes('data-attrs')!) }
}

describe('PlaygroundSceneNode — inner zone default label (#1156)', () => {
    it('names both zones when the preview listens to both emits', async () => {
        const { attrs } = await mountNode(['click:appendInner', 'click:prependInner'], {})
        expect(attrs.appendInnerAriaLabel).toBe('End icon')
        expect(attrs.prependInnerAriaLabel).toBe('Start icon')
    })

    it('adds nothing when the component does not declare the emit', async () => {
        const { attrs } = await mountNode(['click'], {})
        expect(attrs.appendInnerAriaLabel).toBeUndefined()
        expect(attrs.prependInnerAriaLabel).toBeUndefined()
    })

    it('a label set on the instance always wins', async () => {
        const { attrs } = await mountNode(['click:appendInner'], { appendInnerAriaLabel: 'Mine' })
        expect(attrs.appendInnerAriaLabel).toBe('Mine')
    })

    it('never writes the label into the scene (generated code stays untouched)', async () => {
        const { instance } = await mountNode(['click:appendInner', 'click:prependInner'], { label: 'x' })
        expect(instance.props).toEqual({ label: 'x' })
    })
})
