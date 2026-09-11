// #486 — `useNested` seeded `opened` from `props.opened` exactly once, at
// `setup()` time (`const opened = ref(new Set(props.opened))`), and never
// watched `props.opened` afterwards — unlike `selected`, which goes through
// `useVModel` and reacts correctly. A consumer driving `opened` as an
// external v-model and changing it from OUTSIDE the tree (not via a node
// click routed through `open()`) never reached `opened.value`.
//
// Proof: mount `useNested` behind a REAL reactive `props.opened` (a genuine
// component prop, not a plain captured object as the existing API-shape
// spec uses), change it via `wrapper.setProps()`, and assert the new set
// is the one `opened` reflects.

import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { INestedProps } from '@origam/interfaces'

import { useNested } from '@origam/composables/Commons/nested.composable'

type NestedRoot = ReturnType<typeof useNested>

function mountReactiveNestedTree (initialOpened: Array<unknown> = []) {
    let root!: NestedRoot

    const Parent = defineComponent({
        name: 'OrigamNestedReactiveParent',
        props: {
            opened: { type: Array, default: () => [] }
        },
        emits: ['update:selected', 'update:opened', 'click:open', 'click:select'],
        setup (props) {
            root = useNested(props as unknown as INestedProps)
            return () => h('div')
        }
    })

    const wrapper = mount(Parent, { props: { opened: initialOpened } })
    return { root: () => root, wrapper }
}

describe('useNested — opened must track an external props.opened change after mount (#486)', () => {
    it('seeds opened from the initial props.opened', () => {
        const { root } = mountReactiveNestedTree(['a'])
        expect(root().opened.value.has('a')).toBe(true)
    })

    it('reflects a NEW props.opened set from outside the tree', async () => {
        const { root, wrapper } = mountReactiveNestedTree(['a'])

        await wrapper.setProps({ opened: ['b'] })
        await nextTick()

        expect(root().opened.value.has('b')).toBe(true)
        expect(root().opened.value.has('a')).toBe(false)
    })

    it('reflects props.opened cleared to empty from outside the tree', async () => {
        const { root, wrapper } = mountReactiveNestedTree(['a', 'b'])
        expect(root().opened.value.size).toBe(2)

        await wrapper.setProps({ opened: [] })
        await nextTick()

        expect(root().opened.value.size).toBe(0)
    })
})
