// Tests for `useOpacity` — the opacity surface added by ADR-005 lot 3.
//
// Everything asserted here is either a CLASS LIST or the TEXT of a style
// declaration the composable builds itself. Nothing calls
// `getComputedStyle`, deliberately: this DS resolves opacity through
// `var(--origam-opacity---*)`, and jsdom never substitutes a `var()`
// coming from a stylesheet rule (CLAUDE.md, #398) — such an assertion
// would measure a fabricated UA default, not this code.

import { defineComponent, h, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { IOpacityProps } from '@origam/interfaces'

import { useOpacity } from '@origam/composables/Commons/opacity.composable'

function mountWith (initial: IOpacityProps['opacity']) {
    const props = reactive<IOpacityProps>({ opacity: initial })
    let api!: ReturnType<typeof useOpacity>

    const Host = defineComponent({
        name: 'OrigamOpacityHost',
        setup () {
            api = useOpacity(props)
            return () => h('div')
        }
    })

    mount(Host)
    return { props, api: () => api }
}

describe('useOpacity — token rungs', () => {
    it('70 → utility class AND the token declaration, both channels', () => {
        const { api } = mountWith(70)
        expect(api().opacityClasses.value).toEqual(['origam--opacity-70'])
        expect(api().opacityStyles.value).toEqual(['opacity: var(--origam-opacity---70, 0.7)'])
    })

    it('every declared rung resolves to its own class', () => {
        for (const rung of [0, 12, 26, 32, 50, 60, 70, 87, 100]) {
            // 0 is a fraction, not a percent — it is covered below.
            if (rung === 0) continue
            expect(mountWith(rung).api().opacityClasses.value).toEqual([`origam--opacity-${rung}`])
        }
    })

    it('the numeric string "70" behaves exactly like the number 70', () => {
        expect(mountWith('70').api().opacityClasses.value).toEqual(['origam--opacity-70'])
    })
})

describe('useOpacity — the fraction/percent split sits at 1', () => {
    it('1 means OPAQUE, not 1 % — the whole reason the split is at 1', () => {
        expect(mountWith(1).api().opacityStyles.value).toEqual(['opacity: 1'])
    })

    it('0.7 is a CSS fraction, emitted verbatim, no class', () => {
        const { api } = mountWith(0.7)
        expect(api().opacityStyles.value).toEqual(['opacity: 0.7'])
        expect(api().opacityClasses.value).toEqual([])
    })

    it('0 is transparent, emitted verbatim', () => {
        expect(mountWith(0).api().opacityStyles.value).toEqual(['opacity: 0'])
    })
})

describe('useOpacity — percent values off the ladder', () => {
    it('42 divides down to 0.42 rather than emitting a value that clamps to 1', () => {
        const { api } = mountWith(42)
        expect(api().opacityStyles.value).toEqual(['opacity: 0.42'])
        expect(api().opacityClasses.value).toEqual([])
    })
})

describe('useOpacity — custom strings pass through', () => {
    it.each([
        ['50%', 'opacity: 50%'],
        ['var(--x)', 'opacity: var(--x)'],
        ['calc(1 / 3)', 'opacity: calc(1 / 3)']
    ])('%s is emitted verbatim with no class', (input, expected) => {
        const { api } = mountWith(input)
        expect(api().opacityStyles.value).toEqual([expected])
        expect(api().opacityClasses.value).toEqual([])
    })
})

describe('useOpacity — absence and reactivity', () => {
    it.each([undefined, null, ''])('%s emits nothing at all on either channel', (input) => {
        const { api } = mountWith(input as IOpacityProps['opacity'])
        expect(api().opacityClasses.value).toEqual([])
        expect(api().opacityStyles.value).toEqual([])
    })

    it('recomputes when the prop changes — the hover/active swap depends on it', () => {
        const { props, api } = mountWith(70)
        expect(api().opacityClasses.value).toEqual(['origam--opacity-70'])

        props.opacity = 100
        expect(api().opacityClasses.value).toEqual(['origam--opacity-100'])
        expect(api().opacityStyles.value).toEqual(['opacity: var(--origam-opacity---100, 1)'])
    })
})
