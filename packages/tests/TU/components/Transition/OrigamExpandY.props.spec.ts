// Mirror of OrigamExpandX.props.spec.ts — see that file for the full
// rationale (defect C, ticket #538). `<OrigamExpandY>` is the height-axis
// twin of `<OrigamExpandX>`; this spec exists to catch a copy-paste error
// between the two hand-mirrored components rather than to re-argue the
// design decisions already covered there.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'

import OrigamExpandY from '@origam/components/Transition/OrigamExpandY.vue'

const ITEMS = [1, 2, 3]

function mountListHost (group: boolean) {
    const Host = defineComponent({
        setup () {
            return () => h(
                OrigamExpandY,
                { group },
                {
                    default: () => ITEMS.map(item => h(
                        'div',
                        { key: item, 'data-cy': `item-${item}` },
                        `Item ${item}`
                    ))
                }
            )
        }
    })

    return mount(Host, {
        global: { stubs: { transition: false, 'transition-group': false } }
    })
}

describe('OrigamExpandY — group prop (defect C regression)', () => {
    it('renders only the first item when group is false/absent (plain Transition)', () => {
        const wrapper = mountListHost(false)
        expect(wrapper.findAll('[data-cy^="item-"]')).toHaveLength(1)
    })

    it('renders every item when group=true (TransitionGroup)', () => {
        const wrapper = mountListHost(true)
        expect(wrapper.findAll('[data-cy^="item-"]')).toHaveLength(ITEMS.length)
    })

    it('does not warn about extraneous attributes when group=true (mode correctly omitted)', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mountListHost(true)
        const modeWarning = warnSpy.mock.calls.find(call =>
            String(call[0]).includes('Extraneous non-props attributes')
        )
        expect(modeWarning).toBeUndefined()
        warnSpy.mockRestore()
    })
})

function mountToggleHost (props: { leaveAbsolute?: boolean; hideOnLeave?: boolean }) {
    const show = ref(true)

    const Host = defineComponent({
        setup () {
            return () => h(
                OrigamExpandY,
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

describe('OrigamExpandY — leaveAbsolute prop (defect C regression)', () => {
    it('pulls the leaving element out of flow (position: absolute) while it collapses', async () => {
        const { wrapper, show } = mountToggleHost({ leaveAbsolute: true })
        const el = wrapper.find('[data-cy="content"]').element as HTMLElement

        show.value = false
        await nextTick()

        expect(el.style.position).toBe('absolute')
    })

    it('does NOT touch position when leaveAbsolute is absent (baseline)', async () => {
        const { wrapper, show } = mountToggleHost({})
        const el = wrapper.find('[data-cy="content"]').element as HTMLElement

        show.value = false
        await nextTick()

        expect(el.style.position).toBe('')
    })
})

describe('OrigamExpandY — hideOnLeave prop (defect C regression)', () => {
    let rafSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        rafSpy = vi.spyOn(window, 'requestAnimationFrame')
    })

    afterEach(() => {
        rafSpy.mockRestore()
    })

    it('sets display: none instantly on leave', async () => {
        const { wrapper, show } = mountToggleHost({ hideOnLeave: true })
        const el = wrapper.find('[data-cy="content"]').element as HTMLElement

        show.value = false
        await nextTick()

        expect(el.style.display).toBe('none')
    })

    it('schedules fewer requestAnimationFrame calls on leave than the baseline (rAF shrink skipped)', async () => {
        const hideHost = mountToggleHost({ hideOnLeave: true })
        rafSpy.mockClear()
        hideHost.show.value = false
        await nextTick()
        const hideOnLeaveCalls = rafSpy.mock.calls.length

        const baselineHost = mountToggleHost({})
        rafSpy.mockClear()
        baselineHost.show.value = false
        await nextTick()
        const baselineCalls = rafSpy.mock.calls.length

        expect(hideOnLeaveCalls).toBeLessThan(baselineCalls)
    })

    it('does not set display: none when hideOnLeave is absent (baseline)', async () => {
        const { wrapper, show } = mountToggleHost({})
        const el = wrapper.find('[data-cy="content"]').element as HTMLElement

        show.value = false
        await nextTick()

        expect(el.style.display).not.toBe('none')
    })
})
