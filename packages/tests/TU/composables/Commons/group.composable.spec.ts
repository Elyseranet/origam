// Tests for `useGroup` and `useGroupItem`.
// Both composables are tightly coupled via a provide/inject key, so every test
// mounts a Group (parent) + at least one Item (child) in a real component tree.
//
// skip note: `useGroupItem` throws when called outside a setup function
// (getCurrentInstance check). This is tested with a try/catch instead of .skip.

import { defineComponent, h, InjectionKey } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { IGroupProps, IGroupItemProps, IGroupProvide } from '@origam/interfaces'

import { useGroup, useGroupItem } from '@origam/composables/Commons/group.composable'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Unique injection key per test to avoid cross-test state leakage.
function makeKey (): InjectionKey<IGroupProvide> {
    return Symbol('test:group') as InjectionKey<IGroupProvide>
}

type GroupState = ReturnType<typeof useGroup>
type ItemState = NonNullable<ReturnType<typeof useGroupItem>>

function mountGroupWithItems (
    groupProps: Partial<IGroupProps>,
    itemsPropsList: Array<Partial<IGroupItemProps>>,
    key: InjectionKey<IGroupProvide>
) {
    let groupState!: GroupState
    const itemStates: ItemState[] = []

    const makeItem = (itemProps: Partial<IGroupItemProps>, idx: number) =>
        defineComponent({
            name: `OrigamGroupItem${idx}`,
            emits: ['group:selected'],
            setup () {
                const item = useGroupItem(itemProps as IGroupItemProps, key)
                if (item) itemStates.push(item)
                return () => h('div', `item-${idx}`)
            }
        })

    const Group = defineComponent({
        name: 'OrigamGroup',
        setup () {
            groupState = useGroup(groupProps as IGroupProps, key)
            return () => h('div',
                itemsPropsList.map((p, i) => h(makeItem(p, i)))
            )
        }
    })

    mount(Group)
    return { group: () => groupState, items: () => itemStates }
}

// ---------------------------------------------------------------------------
// useGroup — basic state
// ---------------------------------------------------------------------------

describe('useGroup — initial state', () => {
    it('exposes register, unregister, select, selected, isSelected, next, prev, items', () => {
        const key = makeKey()
        const { group } = mountGroupWithItems({}, [], key)
        const g = group()
        expect(g).toHaveProperty('register')
        expect(g).toHaveProperty('unregister')
        expect(g).toHaveProperty('select')
        expect(g).toHaveProperty('selected')
        expect(g).toHaveProperty('isSelected')
        expect(g).toHaveProperty('next')
        expect(g).toHaveProperty('prev')
        expect(g).toHaveProperty('items')
    })

    it('selected is empty by default', () => {
        const key = makeKey()
        const { group } = mountGroupWithItems({}, [{}], key)
        expect(group().selected.value).toEqual([])
    })
})

// ---------------------------------------------------------------------------
// useGroup — select / isSelected
// ---------------------------------------------------------------------------

describe('useGroup — select / isSelected', () => {
    it('select(id, true) marks the item as selected', () => {
        const key = makeKey()
        const { group, items } = mountGroupWithItems({}, [{}], key)
        const id = items()[0].id
        group().select(id, true)
        expect(group().isSelected(id)).toBe(true)
        expect(group().selected.value).toContain(id)
    })

    it('select(id, false) deselects the item', () => {
        const key = makeKey()
        const { group, items } = mountGroupWithItems({}, [{}], key)
        const id = items()[0].id
        group().select(id, true)
        group().select(id, false)
        expect(group().isSelected(id)).toBe(false)
    })

    it('isSelected returns false for an unknown id', () => {
        const key = makeKey()
        const { group } = mountGroupWithItems({}, [{}], key)
        expect(group().isSelected(9999)).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// useGroup — multiple
// ---------------------------------------------------------------------------

describe('useGroup — multiple=true', () => {
    it('allows multiple items to be selected simultaneously', () => {
        const key = makeKey()
        const { group, items } = mountGroupWithItems(
            { multiple: true },
            [{}, {}],
            key
        )
        const [id0, id1] = items().map(i => i.id)
        group().select(id0, true)
        group().select(id1, true)
        expect(group().isSelected(id0)).toBe(true)
        expect(group().isSelected(id1)).toBe(true)
    })

    it('respects max constraint', () => {
        const key = makeKey()
        const { group, items } = mountGroupWithItems(
            { multiple: true, max: 1 },
            [{}, {}],
            key
        )
        const [id0, id1] = items().map(i => i.id)
        group().select(id0, true)
        group().select(id1, true) // should be rejected (max=1)
        expect(group().isSelected(id0)).toBe(true)
        expect(group().isSelected(id1)).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// useGroup — mandatory
// ---------------------------------------------------------------------------

describe('useGroup — mandatory', () => {
    it('mandatory=true cannot deselect the last selected item', () => {
        const key = makeKey()
        const { group, items } = mountGroupWithItems(
            { mandatory: true },
            [{}],
            key
        )
        const id = items()[0].id
        // mandatory forces a selection after mount
        group().select(id, true)
        expect(group().isSelected(id)).toBe(true)
        // try to deselect the only selected item
        group().select(id, false)
        // must still be selected (mandatory)
        expect(group().isSelected(id)).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// useGroup — next / prev
// ---------------------------------------------------------------------------

describe('useGroup — next / prev navigation', () => {
    it('next() selects the next enabled item', () => {
        const key = makeKey()
        const { group, items } = mountGroupWithItems({}, [{}, {}], key)
        const [id0, id1] = items().map(i => i.id)
        group().select(id0, true)
        group().next()
        expect(group().isSelected(id1)).toBe(true)
        expect(group().isSelected(id0)).toBe(false)
    })

    it('prev() selects the previous enabled item', () => {
        const key = makeKey()
        const { group, items } = mountGroupWithItems({}, [{}, {}], key)
        const [id0, id1] = items().map(i => i.id)
        group().select(id1, true)
        group().prev()
        expect(group().isSelected(id0)).toBe(true)
        expect(group().isSelected(id1)).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// useGroupItem — state computed via group
// ---------------------------------------------------------------------------

describe('useGroupItem — isSelected, toggle, select', () => {
    it('isSelected=false initially', () => {
        const key = makeKey()
        const { items } = mountGroupWithItems({}, [{}], key)
        expect(items()[0].isSelected.value).toBe(false)
    })

    it('toggle() flips isSelected from false to true', () => {
        const key = makeKey()
        const { items } = mountGroupWithItems({}, [{}], key)
        items()[0].toggle()
        expect(items()[0].isSelected.value).toBe(true)
    })

    it('select(true) marks the item selected', () => {
        const key = makeKey()
        const { items } = mountGroupWithItems({}, [{}], key)
        items()[0].select(true)
        expect(items()[0].isSelected.value).toBe(true)
    })

    it('select(false) deselects the item', () => {
        const key = makeKey()
        const { items } = mountGroupWithItems({}, [{}], key)
        items()[0].select(true)
        items()[0].select(false)
        expect(items()[0].isSelected.value).toBe(false)
    })
})

describe('useGroupItem — selectedClass', () => {
    it('selectedClass is empty when not selected', () => {
        const key = makeKey()
        const { items } = mountGroupWithItems({}, [{}], key)
        expect(items()[0].selectedClass.value).toEqual([])
    })

    it('selectedClass contains group.selectedClass when selected and group has selectedClass', () => {
        const key = makeKey()
        const { items } = mountGroupWithItems({ selectedClass: 'origam-btn--selected' }, [{}], key)
        items()[0].toggle()
        const cls = items()[0].selectedClass.value
        expect(cls).toContain('origam-btn--selected')
    })
})

describe('useGroupItem — disabled', () => {
    it('disabled item cannot be selected', () => {
        const key = makeKey()
        const { group, items } = mountGroupWithItems({}, [{ disabled: true }], key)
        const id = items()[0].id
        group().select(id, true)
        expect(group().isSelected(id)).toBe(false)
    })

    it('disabled ref reflects props.disabled', () => {
        const key = makeKey()
        const { items } = mountGroupWithItems({}, [{ disabled: true }], key)
        expect(items()[0].disabled.value).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// useGroupItem — throws without parent group (required=true)
// ---------------------------------------------------------------------------

describe('useGroupItem — throws without parent group (required=true)', () => {
    it('throws when required=true and no parent group provides the key', () => {
        // NOTE: Vue 3 / @vue/test-utils catches errors that occur inside
        // `setup()` and routes them through app.config.errorHandler rather than
        // re-throwing from `mount()`. The throw can therefore only be observed
        // by calling the composable directly inside a running setup context —
        // which is exactly what we do here by embedding the assertion inside
        // the component setup itself.
        const key = makeKey()
        let threwError = false

        const Solo = defineComponent({
            name: 'OrigamSoloGroupItem',
            emits: ['group:selected'],
            setup () {
                try {
                    useGroupItem({}, key, true)
                } catch {
                    threwError = true
                }
                return () => h('div')
            }
        })

        mount(Solo)
        expect(threwError).toBe(true)
    })

    it('returns null when required=false and no parent group', () => {
        const key = makeKey()
        let result: ReturnType<typeof useGroupItem> = undefined as any

        const Solo = defineComponent({
            name: 'OrigamSoloGroupItemOptional',
            emits: ['group:selected'],
            setup () {
                result = useGroupItem({}, key, false)
                return () => h('div')
            }
        })

        mount(Solo)
        expect(result).toBeNull()
    })
})
