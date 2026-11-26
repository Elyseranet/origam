// #1161 — the scene tree keeps a selection: re-clicking the selected row must
// not clear it (the inspector keeps the instance, the tree must show it).

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { createOrigam } from '@origam/origam'

import PlaygroundSceneTree from '../../../playground/src/components/Playground/PlaygroundSceneTree.vue'
import { useComponentRegistry } from '../../../playground/src/composables/Registry/registry.composable'
import { HOST_CATALOG_SEED } from '../../../playground/src/host/catalogSeed.const'
import type { IPlaygroundScene } from '../../../playground/src/interfaces/Scene/playground-scene.interface'

const scene: IPlaygroundScene = {
    version: 1,
    selectedInstanceId: 'a',
    roots: [
        { id: 'a', componentName: 'OrigamBtn', props: { text: 'A' } },
        { id: 'b', componentName: 'OrigamBtn', props: { text: 'B' } }
    ]
}

const registry = useComponentRegistry({ definitions: HOST_CATALOG_SEED, loaders: {} })

describe('PlaygroundSceneTree — selection never empties (#1161)', () => {
    it('re-clicking the selected row keeps it selected; another row still moves it', async () => {
        const wrapper = mount(PlaygroundSceneTree, {
            props: { scene, registry, selectedId: 'a' },
            global: { plugins: [createOrigam()] },
            attachTo: document.body
        })
        const row = (id: string) => wrapper.find(`[data-cy="treeview-row-${id}"]`)

        expect(row('a').attributes('aria-selected')).toBe('true')

        await row('a').trigger('click')
        expect(row('a').attributes('aria-selected')).toBe('true')

        await row('b').trigger('click')
        expect(row('b').attributes('aria-selected')).toBe('true')
        wrapper.unmount()
    })
})
