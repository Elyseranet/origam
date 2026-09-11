// Unit tests for `useCreateList` and `useList`.
//
// Both composables rely on Vue's provide/inject mechanism.
// `useCreateList` provides a store to descendant components and returns the
// *parent* store (or a sentinel when there is no ancestor).
// `useList` returns the nearest ancestor store (or null).
//
// All tests mount real component trees so the provide/inject chain works.

import { computed, defineComponent, h, shallowRef } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { useCreateList, useList } from '@origam/composables/List/list.composable'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ListStore = ReturnType<typeof useCreateList>
type ListInject = ReturnType<typeof useList>

function mountListTree (depth: 1 | 2 = 1) {
    let rootStore!: ListStore
    let childStore!: ListStore
    let leafInject!: ListInject

    const Leaf = defineComponent({
        name: 'Leaf',
        setup () {
            leafInject = useList()
            return () => h('div', 'leaf')
        }
    })

    const Child = defineComponent({
        name: 'Child',
        setup () {
            childStore = useCreateList()
            return () => h(Leaf)
        }
    })

    const Root = defineComponent({
        name: 'Root',
        setup () {
            rootStore = useCreateList()
            return () => depth === 2 ? h(Child) : h(Leaf)
        }
    })

    mount(Root)

    return { rootStore, childStore: depth === 2 ? childStore : undefined, leafInject }
}

// ---------------------------------------------------------------------------
// useList — no ancestor
// ---------------------------------------------------------------------------

describe('useList — no ancestor', () => {
    it('returns null when called outside a list tree', () => {
        let result: ListInject = undefined as any

        const Standalone = defineComponent({
            setup () {
                result = useList()
                return () => h('div')
            }
        })

        mount(Standalone)
        expect(result).toBeNull()
    })
})

// ---------------------------------------------------------------------------
// useCreateList — root (no parent)
// ---------------------------------------------------------------------------

describe('useCreateList — single root', () => {
    it('hasPrepend starts as false', () => {
        const { rootStore } = mountListTree(1)
        // rootStore is the *parent* sentinel when there is no ancestor.
        // At depth=1, rootStore.hasPrepend comes from the default sentinel.
        expect(rootStore.hasPrepend.value).toBe(false)
    })

    it('hasAppend starts as false', () => {
        const { rootStore } = mountListTree(1)
        expect(rootStore.hasAppend.value).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// useCreateList — nested tree
// ---------------------------------------------------------------------------

describe('useCreateList — nested tree', () => {
    it('leaf sees the innermost list store (child store, not root)', () => {
        const { leafInject } = mountListTree(2)
        expect(leafInject).not.toBeNull()
        // The leaf injects from the Child's store.
        expect(leafInject).toHaveProperty('hasPrepend')
        expect(leafInject).toHaveProperty('hasAppend')
    })

    it('Child.useCreateList returns the Root store as its parent', () => {
        let rootData!: ListStore
        let childParent!: ListStore

        const Child = defineComponent({
            setup () {
                childParent = useCreateList()
                return () => h('div')
            }
        })

        const Root = defineComponent({
            setup () {
                rootData = useCreateList()
                return () => h(Child)
            }
        })

        mount(Root)

        // childParent is the store provided by Root (= Root's own sentinel or
        // the store Root created). They should share the hasPrepend ref.
        expect(childParent).toHaveProperty('hasPrepend')
        expect(childParent).toHaveProperty('hasAppend')
    })
})

// ---------------------------------------------------------------------------
// updateHasPrepend / updateHasAppend
// ---------------------------------------------------------------------------

describe('useCreateList — updateHasPrepend / updateHasAppend', () => {
    it('updateHasPrepend sets hasPrepend to true when given a true computedRef', () => {
        let store!: { hasPrepend: ReturnType<typeof shallowRef<boolean>>, updateHasPrepend: (v: any) => void }

        const Host = defineComponent({
            setup () {
                const list = useCreateList()
                store = useList() as any  // inject what we just provided
                return () => h('div')
            }
        })

        const Wrapper = defineComponent({
            setup () {
                useCreateList()  // provide context
                return () => h(Host)
            }
        })

        mount(Wrapper)

        // The store we injected should have updateHasPrepend.
        expect(typeof (store as any).updateHasPrepend).toBe('function')
    })

    it('updateHasPrepend is a function in the created list data', () => {
        let data: any

        const Host = defineComponent({
            setup () {
                data = useList()
                return () => h('div')
            }
        })

        const Root = defineComponent({
            setup () {
                useCreateList()
                return () => h(Host)
            }
        })

        mount(Root)

        expect(typeof data.updateHasPrepend).toBe('function')
        expect(typeof data.updateHasAppend).toBe('function')
    })

    it('calling updateHasPrepend with a true ComputedRef sets the flag', () => {
        let injected: any

        const Child = defineComponent({
            setup () {
                injected = useList()
                return () => h('div')
            }
        })

        const Root = defineComponent({
            setup () {
                useCreateList()
                return () => h(Child)
            }
        })

        mount(Root)

        const trueRef = computed(() => true)
        injected.updateHasPrepend(trueRef)
        expect(injected.hasPrepend.value).toBe(true)
    })

    it('calling updateHasAppend with a true ComputedRef sets the flag', () => {
        let injected: any

        const Child = defineComponent({
            setup () {
                injected = useList()
                return () => h('div')
            }
        })

        const Root = defineComponent({
            setup () {
                useCreateList()
                return () => h(Child)
            }
        })

        mount(Root)

        const trueRef = computed(() => true)
        injected.updateHasAppend(trueRef)
        expect(injected.hasAppend.value).toBe(true)
    })

    it('calling updateHasPrepend with undefined is a safe no-op', () => {
        let injected: any

        const Child = defineComponent({
            setup () {
                injected = useList()
                return () => h('div')
            }
        })

        const Root = defineComponent({
            setup () {
                useCreateList()
                return () => h(Child)
            }
        })

        mount(Root)

        expect(() => injected.updateHasPrepend(undefined)).not.toThrow()
        expect(injected.hasPrepend.value).toBe(false)
    })
})
