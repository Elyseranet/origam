// Tests for `useVModel` composable.
// Covers uncontrolled mode (internal ref), controlled mode (external v-model),
// transform functions, and the `externalValue` getter.

import { defineComponent, h, nextTick, reactive, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { useVModel } from '@origam/composables/Commons/vModel.composable'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a host component that exposes `useVModel` API via a captured ref.
 * Returns the reactive props bag, the wrapper, and a lazy accessor for the
 * computed model (captured after setup() has run).
 */
function mountUncontrolled<T> (
    initialValue: T | undefined,
    defaultValue?: T,
    transformIn?: (v: T | undefined) => T,
    transformOut?: (v: T) => T
) {
    const props = reactive<{ modelValue?: T; 'onUpdate:modelValue'?: any }>({
        modelValue: initialValue
    })
    let api!: ReturnType<typeof useVModel<typeof props, 'modelValue'>>

    const Host = defineComponent({
        name: 'OrigamVModelHostUncontrolled',
        emits: ['update:modelValue'],
        setup () {
            api = useVModel(props, 'modelValue', defaultValue as any, transformIn as any, transformOut as any)
            return () => h('div')
        }
    })

    const wrapper = mount(Host)
    return { props, api: () => api, wrapper }
}

// ---------------------------------------------------------------------------
// Uncontrolled mode (no onUpdate:modelValue listener on the vnode props)
// ---------------------------------------------------------------------------

describe('useVModel — uncontrolled mode', () => {
    it('initialises with the provided value', () => {
        const { api } = mountUncontrolled('hello')
        expect(api().value).toBe('hello')
    })

    it('falls back to defaultValue when initial value is undefined', () => {
        const { api } = mountUncontrolled<string>(undefined, 'fallback')
        expect(api().value).toBe('fallback')
    })

    it('returns undefined when both initial and default are absent', () => {
        const { api } = mountUncontrolled<string>(undefined)
        expect(api().value).toBeUndefined()
    })

    it('setting model.value updates the internal ref', async () => {
        const { api } = mountUncontrolled('initial')
        api().value = 'updated'
        await Promise.resolve()
        expect(api().value).toBe('updated')
    })

    it('setting to the same value does not trigger a second update', async () => {
        const { api, wrapper } = mountUncontrolled('same')
        const emitSpy = vi.spyOn(wrapper.vm as any, '$emit')
        api().value = 'same'
        await Promise.resolve()
        // No new emit because value unchanged.
        expect(emitSpy).not.toHaveBeenCalled()
    })

    it('applies transformIn when reading the model', () => {
        const { api } = mountUncontrolled<string>('hello', undefined, (v) => (v ?? '').toUpperCase())
        expect(api().value).toBe('HELLO')
    })

    it('externalValue returns the internal ref value in uncontrolled mode', () => {
        const { api } = mountUncontrolled('extval')
        expect((api() as any).externalValue).toBe('extval')
    })
})

// ---------------------------------------------------------------------------
// transformOut path
// ---------------------------------------------------------------------------

describe('useVModel — transformOut', () => {
    it('applies transformOut before storing in internal ref', async () => {
        const { api } = mountUncontrolled<string>(
            'hello',
            undefined,
            (v) => (v ?? '').toUpperCase(),
            (v) => v.toLowerCase()
        )
        // Set via the transformed value space (uppercase input).
        api().value = 'WORLD'
        await Promise.resolve()
        // transformOut('WORLD') = 'world' is stored, transformIn reads it back as 'WORLD'.
        expect(api().value).toBe('WORLD')
    })
})

// ---------------------------------------------------------------------------
// Default value edge cases
// ---------------------------------------------------------------------------

describe('useVModel — numeric and boolean defaults', () => {
    it('works with numeric initial value', () => {
        const { api } = mountUncontrolled<number>(42)
        expect(api().value).toBe(42)
    })

    it('works with boolean initial value false', () => {
        const { api } = mountUncontrolled<boolean>(false)
        expect(api().value).toBe(false)
    })

    it('false as default value is used when initial is undefined', () => {
        const { api } = mountUncontrolled<boolean>(undefined, false)
        expect(api().value).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// CONTROLLED mode — the optimistic read window (ADR-001)
//
// "Controlled" means the parent passes BOTH `modelValue` and
// `onUpdate:modelValue` as real vnode props: `useVModel` reads `vm.vnode.props`
// to decide, so the props must come down through a render, not be handed over
// as a plain reactive object (which is what the uncontrolled helper above
// does).
//
// The behaviour under test is the one-tick optimistic window: a write must be
// readable immediately, and the parent must still be able to refuse it.
// ---------------------------------------------------------------------------

function mountControlled (parentBehaviour: (incoming: string, current: string) => string) {
    let api!: ReturnType<typeof useVModel<{ modelValue?: string }, 'modelValue'>>
    const emitted: string[] = []

    const Child = defineComponent({
        name: 'OrigamVModelChild',
        props: { modelValue: { type: String, default: undefined } },
        emits: ['update:modelValue'],
        setup (props) {
            api = useVModel(props as any, 'modelValue')
            return () => h('div')
        }
    })

    const Parent = defineComponent({
        name: 'OrigamVModelParent',
        setup () {
            const value = ref('a')

            return () => h(Child, {
                modelValue: value.value,
                'onUpdate:modelValue': (v: string) => {
                    emitted.push(v)
                    // The parent is free to accept, rewrite, or ignore.
                    value.value = parentBehaviour(v, value.value)
                }
            })
        }
    })

    const wrapper = mount(Parent)
    return { api: () => api, emitted, wrapper }
}

describe('useVModel — controlled mode, optimistic read', () => {
    const accepts = (incoming: string) => incoming
    const refuses = (_incoming: string, current: string) => current
    const clamps = (incoming: string) => incoming.slice(0, 1)

    it('reads back the value it just wrote, within the same tick', () => {
        const { api } = mountControlled(accepts)

        api().value = 'b'

        // THE regression this exists to prevent: before the fix the getter
        // returned the prop, which the parent had not yet sent back — so the
        // write appeared to vanish and the caller re-derived from a stale value.
        expect(api().value).toBe('b')
    })

    it('still emits exactly once for the parent', () => {
        const { api, emitted } = mountControlled(accepts)

        api().value = 'b'

        expect(emitted).toEqual(['b'])
    })

    it('keeps the value once the parent accepts it', async () => {
        const { api } = mountControlled(accepts)

        api().value = 'b'
        await nextTick()
        await nextTick()

        expect(api().value).toBe('b')
    })

    it('reverts when the parent REFUSES the value', async () => {
        const { api } = mountControlled(refuses)

        api().value = 'b'
        expect(api().value).toBe('b')   // optimistic, within the tick

        await nextTick()
        await nextTick()

        // The parent never updated the prop — the refusal must win. Holding the
        // optimistic value here would leave a rejected value on screen forever,
        // which is exactly what bounding the window to one tick prevents.
        expect(api().value).toBe('a')
    })

    it('shows the parent value when the parent REWRITES it (clamp / normalise)', async () => {
        const { api } = mountControlled(clamps)

        api().value = 'bcd'
        expect(api().value).toBe('bcd')  // optimistic

        await nextTick()
        await nextTick()

        expect(api().value).toBe('b')    // the parent's version wins
    })

    it('follows an external change made by the parent alone', async () => {
        const { api, wrapper } = mountControlled(accepts)

        expect(api().value).toBe('a')

        await wrapper.vm.$forceUpdate()
        await nextTick()

        expect(api().value).toBe('a')
    })
})
