// The two axes ADR-005 lot 3 added to `useStateEffect`: `opacity` and
// `borderColor`.
//
// WHY A SEPARATE FILE. These assert the state SWAP, which is the whole
// point of the two additions — an interface key that `useStateEffect`
// never resolves is the "half-implemented surface" CLAUDE.md's reuse rule
// names as failure mode 1. They are kept apart from
// `stateEffect.composable.spec.ts` so a regression names the lot.
//
// The `borderColor` case is NOT in ADR-005's D6 table. D6 lists `opacity`
// as the single gap on `IStateEffectConfig`; it checked the variants that
// set a border WIDTH and missed that `outlined --active` sets a border
// COLOUR, which the `border` shorthand cannot carry. Found by remeasuring
// the ADR rather than by reading it.

import { computed, defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { useStateEffect } from '@origam/composables/Commons/stateEffect.composable'

type StateEffectProps = Parameters<typeof useStateEffect>[0]

function mountStateEffect (
    props: StateEffectProps,
    options: {
        isHover?: boolean
        isActive?: boolean
        hoverState?: Record<string, unknown>
        activeState?: Record<string, unknown>
    } = {}
) {
    const isHover = ref(options.isHover ?? false)
    const isActive = ref(options.isActive ?? false)
    const hoverState = computed(() => options.hoverState as never)
    const activeState = computed(() => options.activeState as never)

    let api!: ReturnType<typeof useStateEffect>

    const Host = defineComponent({
        name: 'OrigamStateEffectLot3Host',
        setup () {
            api = useStateEffect(props, isHover, isActive, hoverState, activeState)
            return () => h('div')
        }
    })

    mount(Host)
    return { api: () => api, isHover, isActive }
}

describe('useStateEffect — opacity axis (ADR-005 lot 3)', () => {
    it('exposes the opacity channels and the resolved scalar', () => {
        const keys = Object.keys(mountStateEffect({}).api())
        expect(keys).toContain('opacityClasses')
        expect(keys).toContain('opacityStyles')
        expect(keys).toContain('opacity')
    })

    it('resting value resolves when no state is engaged', () => {
        const { api } = mountStateEffect({ opacity: 70 })
        expect(api().opacityClasses.value).toEqual(['origam--opacity-70'])
    })

    it("OrigamBtn's `plain` preset: opacity 70 at rest, 100 on hover", () => {
        const { api, isHover } = mountStateEffect(
            { opacity: 70 },
            { hoverState: { opacity: 100 } }
        )

        expect(api().opacity.value).toBe(70)
        expect(api().opacityClasses.value).toEqual(['origam--opacity-70'])

        isHover.value = true

        expect(api().opacity.value).toBe(100)
        expect(api().opacityClasses.value).toEqual(['origam--opacity-100'])
    })

    it('hover outranks active on this axis too', () => {
        const { api, isHover, isActive } = mountStateEffect(
            { opacity: 50 },
            { hoverState: { opacity: 100 }, activeState: { opacity: 12 } }
        )

        isActive.value = true
        expect(api().opacity.value).toBe(12)

        isHover.value = true
        expect(api().opacity.value).toBe(100)
    })

    it('emits nothing when no opacity is set anywhere', () => {
        const { api } = mountStateEffect({})
        expect(api().opacityClasses.value).toEqual([])
        expect(api().opacityStyles.value).toEqual([])
    })
})

describe('useStateEffect — borderColor axis (ADR-005 lot 3, missed by D6)', () => {
    it('exposes the resolved borderColor scalar', () => {
        expect(Object.keys(mountStateEffect({}).api())).toContain('borderColor')
    })

    it("OrigamBtn's `outlined --active`: a border COLOUR swapped by state", () => {
        const { api, isActive } = mountStateEffect(
            { border: true, borderColor: 'currentColor' },
            { activeState: { borderColor: 'primary' } }
        )

        expect(api().borderColor.value).toBe('currentColor')

        isActive.value = true

        expect(api().borderColor.value).toBe('primary')
    })

    it('REGRESSION GUARD — with no state override it still reads props.borderColor', () => {
        // This is the behaviour every existing consumer (Card, Sheet,
        // Alert, Btn, ...) depends on. The getter now goes through
        // `pickEffective`, whose default branch must return the resting
        // prop unchanged.
        const { api, isHover, isActive } = mountStateEffect({ borderColor: 'danger' })

        expect(api().borderColor.value).toBe('danger')

        isHover.value = true
        isActive.value = true

        expect(api().borderColor.value).toBe('danger')
    })

    it('a state override naming only `border` leaves borderColor at the resting value', () => {
        const { api, isHover } = mountStateEffect(
            { border: true, borderColor: 'danger' },
            { hoverState: { border: 'thick' } }
        )

        isHover.value = true

        expect(api().border.value).toBe('thick')
        expect(api().borderColor.value).toBe('danger')
    })
})
