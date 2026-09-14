// Regression test for defect A (ticket #538):
// `disabled` (from `ITransitionProps`, inherited by `ITranslateScaleProps`)
// was declared but never read by `<OrigamTranslateScale>` — there was no
// way for a consumer to neutralise the transition. `<OrigamExpandX>` reads
// it correctly via `:css="!disabled"`; TranslateScale's template only ever
// bound `css: !hasTarget`.
//
// Fix combines both conditions:
//   - `css: !hasTarget && !disabled` in the template
//   - the WAAPI `events` computed now also requires `!props.disabled`
// so that when `disabled` is true, the WAAPI enter/leave hooks (which call
// `animate()` — `el.animate()` under the hood) never run, whether or not a
// `target` was provided.
//
// We mock `Element.prototype.animate` and drive a real `v-if` toggle on the
// slotted child (stubs disabled, exactly like
// `OrigamTransition.group-reactivity.spec.ts`) so the assertion exercises
// the REAL `<transition>` enter lifecycle, not a mocked one.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'

import OrigamTranslateScale from '@origam/components/Transition/OrigamTranslateScale.vue'

function nextFrame (): Promise<void> {
    return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

function mountHost (props: { disabled?: boolean; target?: [number, number] }) {
    const show = ref(false)

    const Host = defineComponent({
        setup () {
            return () => h(
                OrigamTranslateScale,
                props,
                {
                    default: () => show.value
                        ? h('div', { key: 'content', 'data-cy': 'content' }, 'Hello')
                        : undefined
                }
            )
        }
    })

    const wrapper = mount(Host, {
        global: { stubs: { transition: false } }
    })

    return { wrapper, show }
}

describe('OrigamTranslateScale — disabled prop (defect A regression)', () => {
    let animateSpy: ReturnType<typeof vi.fn>
    const originalAnimate = (Element.prototype as any).animate

    beforeEach(() => {
        animateSpy = vi.fn().mockReturnValue({
            finished: Promise.resolve(),
            onfinish: null
        })
        ;(Element.prototype as any).animate = animateSpy
    })

    afterEach(() => {
        (Element.prototype as any).animate = originalAnimate
    })

    it('runs the WAAPI animation on enter when a target is set and disabled is absent (baseline)', async () => {
        const { show } = mountHost({ target: [0, 0] })

        show.value = true
        await nextTick()
        await nextFrame()
        await nextFrame()
        await nextFrame()

        expect(animateSpy).toHaveBeenCalled()
    })

    it('does NOT run the WAAPI animation on enter when disabled=true, even with a target', async () => {
        const { show } = mountHost({ target: [0, 0], disabled: true })

        show.value = true
        await nextTick()
        await nextFrame()
        await nextFrame()
        await nextFrame()

        expect(animateSpy).not.toHaveBeenCalled()
    })

    it('renders the slotted content instantly (no CSS transition classes lingering) when disabled=true and no target is set', async () => {
        const { wrapper, show } = mountHost({ disabled: true })

        show.value = true
        await nextTick()
        await nextFrame()

        const content = wrapper.find('[data-cy="content"]')
        expect(content.exists()).toBe(true)
        expect(content.classes().join(' ')).not.toContain('origam-transition--transform-scale-enter')
    })
})
