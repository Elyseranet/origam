// TU — forwardRefs.util.ts
// Exports: forwardRefs, getDescriptor
//
// forwardRefs creates a Proxy that looks up keys in a list of Vue Refs.
// We test it with plain object refs (not real Vue component instances)
// because the Proxy logic is framework-agnostic.

import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { forwardRefs, getDescriptor } from '@origam/utils/Commons/forwardRefs.util'

// ─── getDescriptor ────────────────────────────────────────────────────────────

describe('getDescriptor', () => {
    it('returns descriptor for own property', () => {
        const obj = { foo: 42 }
        const d = getDescriptor(obj, 'foo')
        expect(d).toBeDefined()
        expect(d!.value).toBe(42)
    })

    it('walks prototype chain to find descriptor', () => {
        class Base { get x () { return 1 } }
        const instance = new Base()
        const d = getDescriptor(instance, 'x')
        expect(d).toBeDefined()
    })

    it('returns undefined for missing property', () => {
        const obj = {}
        expect(getDescriptor(obj, 'nonexistent')).toBeUndefined()
    })

    it('returns undefined for null input', () => {
        expect(getDescriptor(null, 'x')).toBeUndefined()
    })
})

// ─── forwardRefs ──────────────────────────────────────────────────────────────

describe('forwardRefs', () => {
    it('own properties of target are accessible directly', () => {
        const target = { ownProp: 'hello' }
        const proxy = forwardRefs(target)
        expect(proxy.ownProp).toBe('hello')
    })

    it('gets property from first ref when target does not have it', () => {
        const target = {} as any
        const innerObj = { innerProp: 'from-ref' }
        const r = ref(innerObj as any)
        const proxy = forwardRefs(target, r)
        expect((proxy as any).innerProp).toBe('from-ref')
    })

    it('target property takes precedence over ref property', () => {
        const target = { x: 'target-value' } as any
        const innerObj = { x: 'ref-value' }
        const r = ref(innerObj as any)
        const proxy = forwardRefs(target, r)
        expect((proxy as any).x).toBe('target-value')
    })

    it('returns undefined for $-prefixed keys (skips internal properties)', () => {
        const target = {} as any
        const r = ref({ $props: { a: 1 } } as any)
        const proxy = forwardRefs(target, r)
        expect((proxy as any).$props).toBeUndefined()
    })

    it('returns undefined for __-prefixed keys', () => {
        const target = {} as any
        const r = ref({ __internal: true } as any)
        const proxy = forwardRefs(target, r)
        expect((proxy as any).__internal).toBeUndefined()
    })

    it('returns undefined for symbol keys that are not in target', () => {
        const target = {} as any
        const sym = Symbol('test')
        const proxy = forwardRefs(target, ref({} as any))
        expect((proxy as any)[sym]).toBeUndefined()
    })

    it('"in" operator returns true for ref property', () => {
        const target = {} as any
        const r = ref({ existsInRef: true } as any)
        const proxy = forwardRefs(target, r)
        expect('existsInRef' in proxy).toBe(true)
    })

    it('"in" operator returns false for missing property', () => {
        const target = {} as any
        const r = ref({ a: 1 } as any)
        const proxy = forwardRefs(target, r)
        expect('missing' in proxy).toBe(false)
    })

    it('set: sets on target when target has the property', () => {
        const target = { count: 0 } as any
        const proxy = forwardRefs(target)
        ;(proxy as any).count = 99
        expect(target.count).toBe(99)
    })

    it('set: sets on ref.value when target does not have the property', () => {
        const target = {} as any
        const inner = { count: 0 }
        const r = ref(inner as any)
        const proxy = forwardRefs(target, r)
        ;(proxy as any).count = 42
        expect(inner.count).toBe(42)
    })

    it('set: throws TypeError for symbol keys (Proxy returns false → strict mode violation)', () => {
        // The source's `set` trap returns `false` for symbol keys without a matching target/ref.
        // In strict mode (ESM), a Proxy `set` trap returning false throws a TypeError:
        //   "set on proxy: trap returned falsish for property Symbol(x)"
        // This is correct/expected behaviour — symbol-keyed writes on the forwardRef proxy
        // are intentionally unsupported. The test documents the actual runtime contract.
        const target = {} as any
        const sym = Symbol('x')
        const proxy = forwardRefs(target, ref({} as any))
        expect(() => { (proxy as any)[sym] = 'val' }).toThrow(TypeError)
    })

    it('bound methods from ref are bound to ref.value', () => {
        const target = {} as any
        const inner = {
            greet () { return 'hello from inner' }
        }
        const r = ref(inner as any)
        const proxy = forwardRefs(target, r)
        const method = (proxy as any).greet
        expect(typeof method).toBe('function')
        expect(method()).toBe('hello from inner')
    })

    it('does not return methods for null ref.value', () => {
        const target = {} as any
        const r = ref(null as any)
        const proxy = forwardRefs(target, r)
        expect((proxy as any).anything).toBeUndefined()
    })
})

// ─── getOwnPropertyDescriptor trap (lot #1398, caracterisation avant refactor) ──

describe('forwardRefs — getOwnPropertyDescriptor', () => {
    const desc = (proxy: object, key: string) => Object.getOwnPropertyDescriptor(proxy, key)

    it('returns the target own descriptor first', () => {
        const proxy = forwardRefs({ own: 1 }, ref({ own: 2 }))
        expect(desc(proxy, 'own')?.value).toBe(1)
    })

    it('finds the descriptor on the first ref that owns it (prototype included)', () => {
        class Base { get viaProto () { return 'p' } }
        const proxy = forwardRefs({}, ref(undefined), ref({ a: 1 }), ref(new Base()))
        expect(desc(proxy, 'a')?.value).toBe(1)
        expect(typeof desc(proxy, 'viaProto')?.get).toBe('function')
    })

    it('falls back to the setupState of a component-like ref ("_" in value)', () => {
        const proxy = forwardRefs({}, ref({ _: { setupState: { fromSetup: 7 } } }))
        expect(desc(proxy, 'fromSetup')?.value).toBe(7)
    })

    it('searches the refs forwarded by a child proxy, breadth first', () => {
        const grandChild = forwardRefs({}, ref({ deep: 'x' }))
        const child = forwardRefs({}, ref({ mid: 'y' }), ref(grandChild))
        const proxy = forwardRefs({}, ref(child))
        expect(desc(proxy, 'mid')?.value).toBe('y')
        expect(desc(proxy, 'deep')?.value).toBe('x')
    })

    it('skips internal / symbol keys and returns undefined when nothing owns the key', () => {
        const proxy = forwardRefs({}, ref({ $x: 1, __y: 2 }))
        expect(desc(proxy, '$x')).toBeUndefined()
        expect(desc(proxy, '__y')).toBeUndefined()
        expect(desc(proxy, 'nope')).toBeUndefined()
        expect(Object.getOwnPropertyDescriptor(proxy, Symbol('s'))).toBeUndefined()
    })
})
