/*
 * #706 — OrigamSnackbar must cancel its auto-dismiss timer on unmount.
 *
 * `startTimeout()` arms a `window.setTimeout` for the whole snackbar
 * duration (5000ms by default). Nothing used to cancel it when the
 * component went away — only a pointerenter did. The timer therefore
 * outlived the component, and under Vitest it could fire after the jsdom
 * environment was torn down, where `window` no longer exists: an
 * unhandled error that fails the whole run with zero red tests.
 *
 * Found by the systematic sweep the #706 fix ran over every
 * setTimeout / setInterval / rAF / .then() in the DS — not by a red test.
 */
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'

import OrigamSnackbar from '@origam/components/Snackbar/OrigamSnackbar.vue'

import { createOrigam } from '@origam/origam'

const SNACKBAR_TIMEOUT = 5000

/* Mirrors OrigamSnackbar.spec.ts's stub — jsdom has no layout engine, so
 * the real OrigamOverlay's locationStrategy throws. */
const OrigamOverlayStub = defineComponent({
    name: 'OrigamOverlay',
    props: {
        modelValue: { type: Boolean, default: false },
        class: [String, Array, Object],
        style: [String, Array, Object]
    },
    emits: ['update:modelValue'],
    setup (props, { slots, expose }) {
        const contentEl = ref<HTMLElement | null>(null)
        const activatorEl = ref<HTMLElement | null>(null)
        const globalTop = ref(true)

        expose({
            filterProps: () => ({}),
            contentEl,
            activatorEl,
            globalTop
        })

        return () => h('div', { 'data-stub': 'overlay', class: props.class }, [
            props.modelValue ? slots.default?.() : null
        ])
    }
})

describe('OrigamSnackbar — auto-dismiss teardown (#706)', () => {
    it('clears the auto-dismiss timeout when the component unmounts', async () => {
        const setSpy = vi.spyOn(window, 'setTimeout')

        const wrapper = mount(OrigamSnackbar, {
            props: { modelValue: true, text: 'Notification' } as never,
            global: {
                plugins: [createOrigam()],
                stubs: { OrigamOverlay: OrigamOverlayStub }
            }
        })

        await nextTick()

        // Locate the auto-dismiss timer among any other timers the tree armed.
        const dismissCall = setSpy.mock.calls.findIndex(
            (call) => call[1] === SNACKBAR_TIMEOUT
        )

        expect(dismissCall, 'the auto-dismiss timer was never armed').toBeGreaterThan(-1)

        const handle = setSpy.mock.results[dismissCall].value

        const clearSpy = vi.spyOn(window, 'clearTimeout')

        wrapper.unmount()

        expect(clearSpy).toHaveBeenCalledWith(handle)
    })
})
