// Tests for `useNested` / `useNestedItem` / `useNestedGroupActivator`.
// The composables use provide/inject and getCurrentInstance, which requires
// a real component tree. Tests mount Parent (useNested) + Child (useNestedItem).
//
// NOTE: Open/select strategies (LIST_OPEN_STRATEGY, SINGLE_OPEN_STRATEGY,
// MULTIPLE_OPEN_STRATEGY) involve emit calls that require a real vm with
// emits declared. Testing those exhaustively is an integration concern —
// unit scope is limited to the public API shape, register/unregister,
// isOpen / isSelected / isLeaf computeds, and the EMPTY_NESTED fallback.

import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { INestedProps } from '@origam/interfaces'

import { useNested, useNestedItem } from '@origam/composables/Commons/nested.composable'
import { SELECT_STRATEGY } from '@origam/enums'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type NestedRoot = ReturnType<typeof useNested>
type NestedItem = ReturnType<typeof useNestedItem>

function mountNestedTree (
    nestedProps: Partial<INestedProps> = {},
    itemId = 'item-a',
    isGroup = false
) {
    let root!: NestedRoot
    let item!: NestedItem

    const Child = defineComponent({
        name: 'OrigamNestedChild',
        emits: ['update:selected', 'update:opened', 'click:open', 'click:select'],
        setup () {
            item = useNestedItem(ref(itemId), isGroup)
            return () => h('div')
        }
    })

    const Parent = defineComponent({
        name: 'OrigamNestedParent',
        emits: ['update:selected', 'update:opened', 'click:open', 'click:select'],
        setup () {
            root = useNested(nestedProps as INestedProps)
            return () => h(Child)
        }
    })

    mount(Parent)
    return { root: () => root, item: () => item }
}

// ---------------------------------------------------------------------------
// useNested — API shape
// ---------------------------------------------------------------------------

describe('useNested — returns the expected root API', () => {
    it('exposes opened, selected, selectedValues, register, unregister, open, select, children, parents', () => {
        const { root } = mountNestedTree()
        const r = root()
        expect(r).toHaveProperty('opened')
        expect(r).toHaveProperty('selected')
        expect(r).toHaveProperty('selectedValues')
        expect(r).toHaveProperty('register')
        expect(r).toHaveProperty('unregister')
        expect(r).toHaveProperty('open')
        expect(r).toHaveProperty('select')
        expect(r).toHaveProperty('children')
        expect(r).toHaveProperty('parents')
    })
})

describe('useNested — initial state', () => {
    it('opened is empty by default', () => {
        const { root } = mountNestedTree()
        expect(root().opened.value.size).toBe(0)
    })

    it('selected is an empty Map by default', () => {
        const { root } = mountNestedTree()
        expect(root().selected.value.size).toBe(0)
    })

    it('selectedValues is empty by default', () => {
        const { root } = mountNestedTree()
        expect(root().selectedValues.value).toEqual([])
    })

    it('props.opened seeds the opened Set', () => {
        const { root } = mountNestedTree({ opened: ['a', 'b'] })
        expect(root().opened.value.has('a')).toBe(true)
        expect(root().opened.value.has('b')).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// useNested — register/unregister
// ---------------------------------------------------------------------------

describe('useNested — register/unregister', () => {
    it('register adds the item id to children under its parent', () => {
        const { root } = mountNestedTree()
        root().register('child-1', 'parent-1', false)
        expect(root().children.value.get('parent-1')).toContain('child-1')
    })

    it('register sets the parent mapping', () => {
        const { root } = mountNestedTree()
        root().register('child-1', 'parent-1', false)
        expect(root().parents.value.get('child-1')).toBe('parent-1')
    })

    it('register with isGroup=true creates an empty children array for that id', () => {
        const { root } = mountNestedTree()
        root().register('group-1', undefined, true)
        expect(root().children.value.has('group-1')).toBe(true)
    })

    it('unregister removes the id from children and parents', () => {
        const { root } = mountNestedTree()
        root().register('child-1', 'parent-1', false)
        root().unregister('child-1')
        expect(root().parents.value.has('child-1')).toBe(false)
    })

    it('unregister removes child from parent children array', () => {
        const { root } = mountNestedTree()
        root().register('child-1', 'parent-1', false)
        root().unregister('child-1')
        const siblings = root().children.value.get('parent-1') ?? []
        expect(siblings).not.toContain('child-1')
    })
})

// ---------------------------------------------------------------------------
// useNestedItem — via parent tree
// ---------------------------------------------------------------------------

describe('useNestedItem — state computeds', () => {
    it('isOpen=false before any open call', () => {
        const { item } = mountNestedTree({}, 'item-a')
        expect(item().isOpen.value).toBe(false)
    })

    it('isSelected=false before any select call', () => {
        const { item } = mountNestedTree({}, 'item-a')
        expect(item().isSelected.value).toBe(false)
    })

    it('isLeaf=true when item has no registered children (leaf node)', () => {
        const { item } = mountNestedTree({}, 'item-a', false)
        // leaf: not a group → children map has no entry for this id
        expect(item().isLeaf.value).toBe(true)
    })

    it('isLeaf=false when item is registered as a group (has children entry)', () => {
        const { item } = mountNestedTree({}, 'group-a', true)
        expect(item().isLeaf.value).toBe(false)
    })
})

describe('useNestedItem — ID assignment', () => {
    it('computedId equals the provided id ref value', () => {
        const { item } = mountNestedTree({}, 'my-id')
        expect(item().id.value).toBe('my-id')
    })
})

// ---------------------------------------------------------------------------
// useNested — selectStrategy enum smoke
// ---------------------------------------------------------------------------

describe('useNested — selectStrategy enum resolution', () => {
    it.each([
        SELECT_STRATEGY.CLASSIC,
        SELECT_STRATEGY.INDEPENDENT,
        SELECT_STRATEGY.SINGLE_INDEPENDENT,
        SELECT_STRATEGY.LEAF,
        SELECT_STRATEGY.SINGLE_LEAF
    ])('strategy "%s" resolves without throwing', (strategy) => {
        expect(() => mountNestedTree({ selectStrategy: strategy })).not.toThrow()
    })
})

// ---------------------------------------------------------------------------
// EMPTY_NESTED — fallback when no parent is present
// ---------------------------------------------------------------------------

describe('useNestedItem — without a parent (EMPTY_NESTED fallback)', () => {
    it('mounts without throwing when there is no parent useNested', () => {
        let item!: ReturnType<typeof useNestedItem>

        const Solo = defineComponent({
            name: 'OrigamSoloItem',
            setup () {
                item = useNestedItem(ref('solo-id'), false)
                return () => h('div')
            }
        })

        expect(() => mount(Solo)).not.toThrow()
        expect(item.isOpen.value).toBe(false)
        expect(item.isSelected.value).toBe(false)
    })
})
