// Playground lot D (#1144) — the scene-tree operations and the snippets.
//
// Three surfaces, each pinned where it lives:
//   - `useSceneEditor`: select / addChild / removeInstance / loadSnippet —
//     ids stay STABLE (never positional), writes stay immutable, a removed
//     selection moves to the parent;
//   - `scene-instance.util`: re-identification on instantiate, deep copy of
//     prop values, `attachSnippets`, the tree projection;
//   - `createDefaultSnippets`: every component and every prop it writes is
//     REAL — checked against the generated host seed (source A + B), so a
//     snippet that invents a prop fails here, not in a user's browser.

import { describe, expect, it } from 'vitest'
import { ref } from 'vue'

import { useSceneEditor } from '../../../playground/src/composables/Commons/sceneEditor.composable'
import { createDefaultSnippets, SNIPPET_PARENT_OF } from '../../../playground/src/consts/Commons/snippets.const'
import { HOST_CATALOG_SEED } from '../../../playground/src/host/catalogSeed.const'
import {
    acceptsDefaultSlot,
    attachSnippets,
    cloneWithFreshIds,
    collectParentIds,
    countInstances,
    createInstanceFor,
    findParentId,
    instanceHint,
    instantiateSnippet,
    toTreeNodes
} from '../../../playground/src/utils/Commons/scene-instance.util'
import type { IComponentSnippet } from '../../../playground/src/interfaces/Catalog/component-snippet.interface'
import type { IPlaygroundInstance } from '../../../playground/src/interfaces/Scene/playground-instance.interface'
import type { IPlaygroundScene } from '../../../playground/src/interfaces/Scene/playground-scene.interface'

const makeScene = (): IPlaygroundScene => ({
    version: 1,
    selectedInstanceId: 'tabs',
    roots: [
        {
            id: 'tabs',
            componentName: 'OrigamTabs',
            props: {},
            children: {
                default: [
                    { id: 'tab-a', componentName: 'OrigamTab', props: { text: 'A' } },
                    { id: 'tab-b', componentName: 'OrigamTab', props: { text: 'B' } }
                ]
            }
        },
        { id: 'btn', componentName: 'OrigamBtn', props: { text: 'Go' } }
    ]
})

const counter = () => {
    let n = 0

    return () => `id-${++n}`
}

const translate = (_key: string, fallback?: string, named?: Record<string, string | number>) => {
    let out = fallback ?? ''

    for (const [name, value] of Object.entries(named ?? {})) out = out.replaceAll(`{${name}}`, String(value))

    return out
}

describe('useSceneEditor — selection (#1144)', () => {
    it('selects a nested instance by id', () => {
        const scene = ref(makeScene())
        const editor = useSceneEditor(scene)

        editor.selectInstance('tab-b')

        expect(scene.value.selectedInstanceId).toBe('tab-b')
        expect(editor.selectedInstance.value?.id).toBe('tab-b')
    })

    it('ignores an id that names nothing — the selection never points into the void', () => {
        const scene = ref(makeScene())
        const before = scene.value
        const editor = useSceneEditor(scene)

        editor.selectInstance('ghost')

        expect(scene.value).toBe(before)
    })
})

describe('useSceneEditor — add a child (#1144)', () => {
    it('appends to the default slot, keeps every sibling id, and selects the new child', () => {
        const scene = ref(makeScene())
        const editor = useSceneEditor(scene)

        editor.addChild('tabs', { id: 'tab-c', componentName: 'OrigamTab', props: {} })

        expect(scene.value.roots[0].children?.default.map(child => child.id)).toEqual(['tab-a', 'tab-b', 'tab-c'])
        expect(scene.value.selectedInstanceId).toBe('tab-c')
    })

    it('creates the slot on an instance that had no children', () => {
        const scene = ref(makeScene())
        const editor = useSceneEditor(scene)

        editor.addChild('btn', { id: 'icon', componentName: 'OrigamIcon', props: {} })

        expect(scene.value.roots[1].children).toEqual({ default: [{ id: 'icon', componentName: 'OrigamIcon', props: {} }] })
    })

    it('targets a named slot when asked', () => {
        const scene = ref(makeScene())
        const editor = useSceneEditor(scene)

        editor.addChild('tabs', { id: 'x', componentName: 'OrigamBtn', props: {} }, 'append')

        expect(scene.value.roots[0].children?.append.map(child => child.id)).toEqual(['x'])
        expect(scene.value.roots[0].children?.default).toHaveLength(2)
    })

    it('is immutable along the edited path and leaves other branches by reference', () => {
        const scene = ref(makeScene())
        const before = scene.value
        const editor = useSceneEditor(scene)

        editor.addChild('tabs', { id: 'tab-c', componentName: 'OrigamTab', props: {} })

        expect(scene.value).not.toBe(before)
        expect(scene.value.roots[0]).not.toBe(before.roots[0])
        expect(before.roots[0].children?.default).toHaveLength(2)
        expect(scene.value.roots[1]).toBe(before.roots[1])
    })

    it('an unknown parent is a no-op, never a silent new root', () => {
        const scene = ref(makeScene())
        const before = scene.value
        const editor = useSceneEditor(scene)

        editor.addChild('ghost', { id: 'x', componentName: 'OrigamBtn', props: {} })

        expect(scene.value).toBe(before)
    })
})

describe('useSceneEditor — remove (#1144)', () => {
    it('removes the instance, keeps the siblings with their ids', () => {
        const scene = ref(makeScene())
        const editor = useSceneEditor(scene)

        editor.removeInstance('tab-a')

        expect(scene.value.roots[0].children?.default.map(child => child.id)).toEqual(['tab-b'])
    })

    it('a removed selection moves to the parent', () => {
        const scene = ref({ ...makeScene(), selectedInstanceId: 'tab-a' })
        const editor = useSceneEditor(scene)

        editor.removeInstance('tab-a')

        expect(scene.value.selectedInstanceId).toBe('tabs')
    })

    it('removing a root takes its subtree, and a selection inside it is cleared', () => {
        const scene = ref({ ...makeScene(), selectedInstanceId: 'tab-b' })
        const editor = useSceneEditor(scene)

        editor.removeInstance('tabs')

        expect(scene.value.roots.map(root => root.id)).toEqual(['btn'])
        expect(scene.value.selectedInstanceId).toBeNull()
        expect(editor.selectedInstance.value?.id).toBe('btn')
    })

    it('a selection OUTSIDE the removed subtree is kept', () => {
        const scene = ref({ ...makeScene(), selectedInstanceId: 'btn' })
        const editor = useSceneEditor(scene)

        editor.removeInstance('tab-a')

        expect(scene.value.selectedInstanceId).toBe('btn')
    })
})

describe('useSceneEditor — load a snippet (#1144)', () => {
    const snippet: IComponentSnippet = {
        id: 's',
        label: 'S',
        instances: [{ id: 'root', componentName: 'OrigamTabs', props: {}, children: { default: [{ id: 'child', componentName: 'OrigamTab', props: { text: 'T' } }] } }]
    }

    it('replaces the roots with a FRESHLY identified copy and selects the first root', () => {
        const scene = ref(makeScene())
        const editor = useSceneEditor(scene)

        editor.loadSnippet(snippet, s => instantiateSnippet(s, counter()))

        expect(scene.value.roots.map(root => root.id)).toEqual(['id-1'])
        expect(scene.value.roots[0].children?.default[0].id).toBe('id-2')
        expect(scene.value.selectedInstanceId).toBe('id-1')
    })

    it('loading the same snippet twice never yields the same ids (default identity source)', () => {
        const scene = ref(makeScene())
        const editor = useSceneEditor(scene)

        editor.loadSnippet(snippet)
        const first = scene.value.roots[0].id
        editor.loadSnippet(snippet)

        expect(scene.value.roots[0].id).not.toBe(first)
        expect(scene.value.roots[0].id).not.toBe('root')
    })

    it('leaves the snippet itself untouched', () => {
        const scene = ref(makeScene())
        const editor = useSceneEditor(scene)

        editor.loadSnippet(snippet)
        editor.setProp(scene.value.roots[0].children!.default[0].id, 'text', 'edited')

        expect(snippet.instances[0].children?.default[0].props.text).toBe('T')
    })
})

describe('scene-instance.util (#1144)', () => {
    it('cloneWithFreshIds deep-copies prop values — editing the copy never edits the source', () => {
        const source: IPlaygroundInstance = { id: 'a', componentName: 'OrigamDataTable', props: { items: [{ name: 'x' }] }, slotContent: 'hi' }
        const copy = cloneWithFreshIds(source, counter())

        expect(copy).toEqual({ ...source, id: 'id-1' })
        expect(copy.props.items).not.toBe(source.props.items)
        expect((copy.props.items as { name: string }[])[0]).not.toBe((source.props.items as { name: string }[])[0])
    })

    it('findParentId: parent id, null for a root, undefined when absent', () => {
        const { roots } = makeScene()

        expect(findParentId(roots, 'tab-b')).toBe('tabs')
        expect(findParentId(roots, 'btn')).toBeNull()
        expect(findParentId(roots, 'ghost')).toBeUndefined()
    })

    it('countInstances counts children', () => {
        expect(countInstances(makeScene().roots)).toBe(4)
    })

    it('toTreeNodes keeps instance ids and passes the slot to the labeller', () => {
        const roots: IPlaygroundInstance[] = [{
            id: 't',
            componentName: 'OrigamDataTable',
            props: {},
            children: { 'item.actions': [{ id: 'b', componentName: 'OrigamBtn', props: {} }] }
        }]

        expect(toTreeNodes(roots, (instance, slot) => `${instance.componentName}@${slot}`)).toEqual([
            { id: 't', label: 'OrigamDataTable@default', children: [{ id: 'b', label: 'OrigamBtn@item.actions' }] }
        ])
        expect(collectParentIds(roots)).toEqual(['t'])
    })

    it('instanceHint reads the first non-empty text prop, then slotContent', () => {
        expect(instanceHint({ id: 'a', componentName: 'X', props: { title: 'T', text: '' } }, ['text', 'title'])).toBe('T')
        expect(instanceHint({ id: 'a', componentName: 'X', props: {}, slotContent: 'S' }, ['text'])).toBe('S')
    })

    it('createInstanceFor uses the default snippet when it seeds ONE root, a blank instance otherwise', () => {
        const definitions = attachSnippets(HOST_CATALOG_SEED, createDefaultSnippets(translate), SNIPPET_PARENT_OF)
        const btn = definitions.find(definition => definition.name === 'OrigamBtn')!
        const chip = definitions.find(definition => definition.name === 'OrigamChip')!

        expect(createInstanceFor(btn, counter())).toEqual({ id: 'id-1', componentName: 'OrigamBtn', props: { text: 'Button' } })
        expect(createInstanceFor(chip, counter())).toEqual({ id: 'id-1', componentName: 'OrigamChip', props: {} })
    })
})

describe('snippets — authored data checked against the extracted catalogue (#1144)', () => {
    const snippets = createDefaultSnippets(translate)
    const byName = new Map(HOST_CATALOG_SEED.map(definition => [definition.name, definition]))
    const walk = (instances: IPlaygroundInstance[]): IPlaygroundInstance[] => instances.flatMap(instance => [instance, ...walk(Object.values(instance.children ?? {}).flat())])

    it('covers the families that render empty, and the Btn', () => {
        for (const name of ['OrigamDataTable', 'OrigamChart', 'OrigamTabs', 'OrigamWindow', 'OrigamList', 'OrigamSelect', 'OrigamBtn']) {
            expect(snippets[name]?.length, name).toBeGreaterThan(0)
        }

        expect(snippets.OrigamSelect.some(snippet => snippet.instances[0].props.autocomplete === true)).toBe(true)
    })

    it('every instance names a catalogued component, and every prop it sets is a REAL prop of that component', () => {
        const unknown: string[] = []

        for (const list of Object.values(snippets)) {
            for (const snippet of list) {
                for (const instance of walk(snippet.instances)) {
                    const definition = byName.get(instance.componentName)

                    if (!definition) {
                        unknown.push(`${snippet.id}: ${instance.componentName}`)
                        continue
                    }

                    const declared = new Set(definition.props.map(prop => prop.name))

                    for (const key of Object.keys(instance.props)) {
                        // An `aria-*` key is a fall-through ATTRIBUTE, by design (Window, List).
                        if (!key.startsWith('aria-') && !declared.has(key)) unknown.push(`${snippet.id}: ${instance.componentName}.${key}`)
                    }
                }
            }
        }

        expect(unknown).toEqual([])
    })

    it('every child sits in a slot its parent declares, or in a DataTable `item.{key}` column slot', () => {
        const wrong: string[] = []

        for (const list of Object.values(snippets)) {
            for (const snippet of list) {
                for (const instance of walk(snippet.instances)) {
                    const slots = new Set(byName.get(instance.componentName)?.slots.map(slot => slot.name))

                    for (const slot of Object.keys(instance.children ?? {})) {
                        if (!slots.has(slot) && !slot.startsWith('item.')) wrong.push(`${snippet.id}: ${instance.componentName}#${slot}`)
                    }
                }
            }
        }

        expect(wrong).toEqual([])
    })

    it('snippet ids are unique per component, and template ids unique per snippet', () => {
        for (const [name, list] of Object.entries(snippets)) {
            expect(new Set(list.map(snippet => snippet.id)).size, name).toBe(list.length)

            for (const snippet of list) {
                const ids = walk(snippet.instances).map(instance => instance.id)

                expect(new Set(ids).size, snippet.id).toBe(ids.length)
            }
        }
    })

    it('every visible demo text goes through the translator', () => {
        const keys: string[] = []

        createDefaultSnippets((key, fallback) => {
            keys.push(key)

            return fallback ?? key
        })

        expect(keys.length).toBeGreaterThan(30)
        expect(keys.every(key => key.startsWith('playground.snippet.'))).toBe(true)
    })

    it('requiresParent is AUTHORED by SNIPPET_PARENT_OF and copied onto the definitions', () => {
        const definitions = attachSnippets(HOST_CATALOG_SEED, snippets, SNIPPET_PARENT_OF)
        const requiring = definitions.filter(definition => definition.requiresParent).map(definition => definition.name).sort()

        expect(requiring).toEqual(['OrigamTab', 'OrigamWindowItem'])
        expect(HOST_CATALOG_SEED.every(definition => definition.requiresParent === false)).toBe(true)
        expect(HOST_CATALOG_SEED.every(definition => definition.snippets.length === 0)).toBe(true)
    })

    it('acceptsDefaultSlot reads the slot list of source B', () => {
        expect(acceptsDefaultSlot(byName.get('OrigamTabs'))).toBe(true)
        expect(acceptsDefaultSlot(byName.get('OrigamChart'))).toBe(false)
        expect(acceptsDefaultSlot(undefined)).toBe(false)
    })
})
