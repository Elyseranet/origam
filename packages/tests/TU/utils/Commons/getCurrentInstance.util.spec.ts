// TU — getCurrentInstance.util.ts
// Exports: getLifeCycleTarget, getCurrentInstance, getCurrentInstanceName, getUid
//
// These helpers require a Vue setup() context. Tests are exercised via
// defineComponent + mount (no histoire/e2e). We use @vue/test-utils for mounting.
//
// getUid / getCurrentInstanceName require a live component instance — tested via
// a real component mount so no mocking of Vue internals is needed.

import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import {
    getLifeCycleTarget,
    getCurrentInstance,
    getUid
} from '@origam/utils/Commons/getCurrentInstance.util'

describe('getLifeCycleTarget', () => {
    it('returns the provided target when one is given', () => {
        const sentinel = {} as any
        expect(getLifeCycleTarget(sentinel)).toBe(sentinel)
    })

    it('returns null/undefined when called outside a setup context with no argument', () => {
        // Outside a component setup(), _getCurrentInstance() returns null.
        const result = getLifeCycleTarget(undefined)
        expect(result).toBeNull()
    })
})

describe('getCurrentInstance', () => {
    it('throws with an [Origam] prefix when called outside a setup function', () => {
        expect(() => getCurrentInstance('TestComposable')).toThrow('[Origam] TestComposable')
    })

    it('includes the custom message in the thrown error', () => {
        expect(() => getCurrentInstance('useX', 'needs setup context')).toThrow(
            '[Origam] useX needs setup context'
        )
    })

    it('returns the current instance when called from within setup()', () => {
        let instanceFromUtil: ReturnType<typeof getCurrentInstance> | undefined

        const Comp = defineComponent({
            setup () {
                instanceFromUtil = getCurrentInstance('TestComp')
                return () => h('div')
            }
        })

        mount(Comp)
        expect(instanceFromUtil).toBeDefined()
        expect(instanceFromUtil).not.toBeNull()
    })
})

describe('getUid', () => {
    it('throws when called outside a setup function', () => {
        expect(() => getUid()).toThrow('[Origam] getUid')
    })

    // The value used to be a number from a module-global counter. It is now
    // Vue's `useId()` string, because only a tree-derived id survives SSR ->
    // hydration — see the doc comment on `getUid` for the two defects the
    // counter caused and how each was measured. Callers must treat it as
    // opaque: no parsing, no arithmetic, no ordering.
    it('returns a non-empty opaque string uid when called from setup()', () => {
        let uid: string | undefined

        const Comp = defineComponent({
            setup () {
                uid = getUid()
                return () => h('div')
            }
        })

        mount(Comp)
        expect(typeof uid).toBe('string')
        expect(uid).not.toBe('')
    })

    it('returns the same uid on repeated calls within the same component instance', () => {
        const uids: Array<string> = []

        const Comp = defineComponent({
            setup () {
                uids.push(getUid())
                uids.push(getUid())
                return () => h('div')
            }
        })

        mount(Comp)
        expect(uids[0]).toBe(uids[1])
    })

    // Uniqueness is scoped to the APP, which is the scope that matters: the
    // value ends up as a DOM `id`, and ids only have to be unique within one
    // document. A page mounting two independent Vue apps must separate them
    // with Vue's own `app.config.idPrefix` — see the note on `getUid`.
    it('assigns different uids to sibling instances in the same app', () => {
        const uids: Array<string> = []

        const Child = defineComponent({
            setup () {
                uids.push(getUid())
                return () => h('div')
            }
        })
        const Parent = defineComponent({
            setup: () => () => h('div', [h(Child), h(Child)])
        })

        mount(Parent)
        expect(uids).toHaveLength(2)
        expect(uids[0]).not.toBe(uids[1])
    })

    // `getUid.reset()` is GONE, and its absence is the fix for the
    // cross-request half of the bug: it was module-global state rewound once
    // per SSR request by `createOrigam()`'s `install()`, which corrupted any
    // render still in flight. There is nothing left to reset — the id lives on
    // the component instance, so each app is already its own namespace.
    it('exposes no reset hook — per-app scoping replaced it', () => {
        expect((getUid as { reset?: unknown }).reset).toBeUndefined()
    })
})
