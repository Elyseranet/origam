// Regression test for issue #434 — `clickable` on <OrigamProgressLinear>
// never did anything.
//
// Root cause #1 (the one named in the ticket): the root element bound
// `@click="clickable && handleClick"`. Vue compiles a click handler that
// isn't a bare identifier / member-expression call into an INLINE
// STATEMENT — it evaluates the expression on every click but never
// INVOKES `handleClick`, because `clickable && handleClick` is a plain
// expression (short-circuit `&&`), not a call. `handleClick` is merely
// referenced, never called.
//
// Root cause #2 (found while writing this test — a second, independent
// bug masked by #1): `handleClick` reads `intersectionRef.value` to get
// `getBoundingClientRect()`, but `intersectionRef` (from
// `useIntersectionObserver()`) is never assigned an element anywhere in
// the component — no `ref="intersectionRef"` in the template, and no
// `watchEffect` syncing it from the template `ref="root"` the way the
// sibling `OrigamProgressCircular.vue` does (`intersectionRef.value =
// root.value`). Even with root cause #1 fixed, `handleClick` always hit
// its `if (!intersectionRef.value) return` guard and did nothing.
//
// This test stubs `getBoundingClientRect` on the rendered root element and
// clicks at a known position, then asserts BOTH that `update:modelValue`
// fires AND that the emitted value matches the click position — a click at
// the horizontal midpoint of a 0-100 bar must emit ~50.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamProgressLinear from '@origam/components/Progress/OrigamProgressLinear.vue'
import { createOrigam } from '@origam/origam'

// `intersectionRef` is synced from the template `ref="root"` via a
// `watchEffect` (default 'pre' flush). Its first run happens synchronously
// during setup — before the DOM exists, so `root.value` is still undefined.
// The re-run carrying the real element is scheduled once the template ref is
// actually assigned post-mount, which only flushes on the next tick. A real
// user can never click before that tick elapses (mount + paint always come
// first), but a synchronous test `mount()` can — hence the explicit
// `await nextTick()` before simulating the click.
async function mountClickable (modelValue = 0) {
    const wrapper = mount(OrigamProgressLinear, {
        props: {
            clickable: true,
            modelValue,
            max: 100
        } as never,
        global: {plugins: [createOrigam()]}
    })

    const root = wrapper.element as HTMLElement
    root.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        right: 200,
        bottom: 20,
        width: 200,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => ({})
    })

    await nextTick()

    return wrapper
}

describe('OrigamProgressLinear — clickable prop (#434)', () => {
    it('emits update:modelValue when clicked while clickable=true', async () => {
        const wrapper = await mountClickable()

        await wrapper.trigger('click', {clientX: 100})

        expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('emits the value matching the click position along the bar', async () => {
        const wrapper = await mountClickable()

        // Bar spans clientX 0..200 for a 0..100 value range.
        // A click at clientX=100 (midpoint) must emit 50.
        await wrapper.trigger('click', {clientX: 100})

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(Number(emitted![0][0])).toBe(50)
    })

    it('does NOT emit update:modelValue when clickable is false', async () => {
        const wrapper = mount(OrigamProgressLinear, {
            props: {clickable: false, modelValue: 0, max: 100} as never,
            global: {plugins: [createOrigam()]}
        })
        const root = wrapper.element as HTMLElement
        root.getBoundingClientRect = () => ({
            left: 0, top: 0, right: 200, bottom: 20, width: 200, height: 20, x: 0, y: 0, toJSON: () => ({})
        })
        await nextTick()

        await wrapper.trigger('click', {clientX: 100})

        expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })
})
