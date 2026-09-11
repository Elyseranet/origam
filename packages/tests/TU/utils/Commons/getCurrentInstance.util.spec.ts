// TU — getCurrentInstance.util.ts
// Exports: getLifeCycleTarget, getCurrentInstance, getCurrentInstanceName, getUid
//
// These helpers require a Vue setup() context. Tests are exercised via
// defineComponent + mount (no histoire/e2e). We use @vue/test-utils for mounting.
//
// getUid / getCurrentInstanceName require a live component instance — tested via
// a real component mount so no mocking of Vue internals is needed.

import { describe, expect, it, afterEach } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import {
    getLifeCycleTarget,
    getCurrentInstance,
    getUid
} from '@origam/utils/Commons/getCurrentInstance.util'

afterEach(() => {
    // Reset the uid counter between tests to keep them independent.
    getUid.reset()
})

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

    it('returns a numeric uid when called from setup()', () => {
        let uid: number | undefined

        const Comp = defineComponent({
            setup () {
                uid = getUid()
                return () => h('div')
            }
        })

        mount(Comp)
        expect(typeof uid).toBe('number')
    })

    it('returns the same uid on repeated calls within the same component instance', () => {
        const uids: Array<number> = []

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

    it('assigns different uids to different component instances', () => {
        const uids: Array<number> = []

        const Comp = defineComponent({
            setup () {
                uids.push(getUid())
                return () => h('div')
            }
        })

        mount(Comp)
        mount(Comp)
        expect(uids).toHaveLength(2)
        expect(uids[0]).not.toBe(uids[1])
    })

    it('getUid.reset() resets the counter', () => {
        const firstUids: Array<number> = []

        const Comp = defineComponent({
            setup () {
                firstUids.push(getUid())
                return () => h('div')
            }
        })

        mount(Comp)
        getUid.reset()

        const secondUids: Array<number> = []
        const Comp2 = defineComponent({
            setup () {
                secondUids.push(getUid())
                return () => h('div')
            }
        })
        mount(Comp2)

        // After reset the counter restarts at 0
        expect(secondUids[0]).toBe(0)
    })
})
