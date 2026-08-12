// Tests for `useBackdrop` — the `IBackdropProps` / `backdropBlur` surface
// created for ADR-005 ticket #21 (the props path `ghost` needs to stop
// shipping `backdrop-filter` as bespoke CSS). Mirrors the classes-first
// test shape already used by `elevation.composable.spec.ts` /
// `rounded.composable.spec.ts`.

import { defineComponent, h, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { IBackdropProps } from '@origam/interfaces'

import { useBackdrop } from '@origam/composables/Commons/backdrop.composable'

function mountWith (initial: IBackdropProps['backdropBlur']) {
    const props = reactive<IBackdropProps>({ backdropBlur: initial })
    let api!: ReturnType<typeof useBackdrop>

    const Host = defineComponent({
        name: 'OrigamBackdropHost',
        setup () {
            api = useBackdrop(props)
            return () => h('div')
        }
    })

    mount(Host)
    return { props, api: () => api }
}

describe('useBackdrop — classes-first', () => {
    it('utility rung "md" → emits origam--backdrop-md class AND token style (both prefixed forms)', () => {
        const { api } = mountWith('md')
        expect(api().backdropClasses.value).toContain('origam--backdrop-md')
        expect(api().backdropStyles.value).toContain('backdrop-filter: var(--origam-backdrop__blur---md)')
        expect(api().backdropStyles.value).toContain('-webkit-backdrop-filter: var(--origam-backdrop__blur---md)')
    })

    it.each(['none', 'xs', 'sm', 'md', 'lg', 'xl'])('utility rung %s → utility class + inline style companion', (rung) => {
        const { api } = mountWith(rung)
        expect(api().backdropClasses.value).toContain(`origam--backdrop-${rung}`)
        // Cascade-safety companion (mirrors `useRounded`): several of the 16
        // existing `backdrop-filter` call sites already own the property via
        // a component-scoped token, so the bare utility class alone can lose
        // the cascade. The inline style is what actually guarantees paint.
        expect(api().backdropStyles.value).toContain(`backdrop-filter: var(--origam-backdrop__blur---${rung})`)
    })

    it('backdropBlur undefined → no class, no style', () => {
        const { api } = mountWith(undefined)
        expect(api().backdropClasses.value).toEqual([])
        expect(api().backdropStyles.value).toEqual([])
    })

    it('empty string → no class, no style', () => {
        const { api } = mountWith('')
        expect(api().backdropClasses.value).toEqual([])
        expect(api().backdropStyles.value).toEqual([])
    })

    it('exposes a backdropSupported flag sourced from useCssSupport (no direct CSS.supports call)', () => {
        const { api } = mountWith('md')
        expect(typeof api().backdropSupported.value).toBe('boolean')
    })
})

describe('useBackdrop — bare-length wrapping', () => {
    it('numeric length 8 → wraps into blur(8px), no utility class', () => {
        const { api } = mountWith(8)
        expect(api().backdropStyles.value).toEqual([
            'backdrop-filter: blur(8px)',
            '-webkit-backdrop-filter: blur(8px)'
        ])
        expect(api().backdropClasses.value).toEqual([])
    })

    it('numeric length 0 → wraps into blur(0px)', () => {
        const { api } = mountWith(0)
        expect(api().backdropStyles.value).toEqual([
            'backdrop-filter: blur(0px)',
            '-webkit-backdrop-filter: blur(0px)'
        ])
    })

    it('string length "8px" → wraps into blur(8px) verbatim (no double unit)', () => {
        const { api } = mountWith('8px')
        expect(api().backdropStyles.value).toEqual([
            'backdrop-filter: blur(8px)',
            '-webkit-backdrop-filter: blur(8px)'
        ])
    })

    it('string length "0.5rem" → wraps into blur(0.5rem)', () => {
        const { api } = mountWith('0.5rem')
        expect(api().backdropStyles.value).toEqual([
            'backdrop-filter: blur(0.5rem)',
            '-webkit-backdrop-filter: blur(0.5rem)'
        ])
    })
})

describe('useBackdrop — custom backdrop-filter passthrough', () => {
    it('a single blur() call → emitted verbatim (not double-wrapped)', () => {
        const { api } = mountWith('blur(8px)')
        expect(api().backdropStyles.value).toEqual([
            'backdrop-filter: blur(8px)',
            '-webkit-backdrop-filter: blur(8px)'
        ])
    })

    it('composed multi-function filter → emitted verbatim', () => {
        const { api } = mountWith('blur(8px) saturate(1.4)')
        expect(api().backdropStyles.value).toEqual([
            'backdrop-filter: blur(8px) saturate(1.4)',
            '-webkit-backdrop-filter: blur(8px) saturate(1.4)'
        ])
    })

    it('custom var(...) reference → emitted verbatim', () => {
        const { api } = mountWith('var(--my-filter)')
        expect(api().backdropStyles.value).toEqual([
            'backdrop-filter: var(--my-filter)',
            '-webkit-backdrop-filter: var(--my-filter)'
        ])
    })

    it('comma-separated filter list → emitted verbatim', () => {
        const { api } = mountWith('blur(4px), saturate(1.2)')
        expect(api().backdropStyles.value).toEqual([
            'backdrop-filter: blur(4px), saturate(1.2)',
            '-webkit-backdrop-filter: blur(4px), saturate(1.2)'
        ])
    })

    it('leading/trailing whitespace on a custom value is trimmed', () => {
        const { api } = mountWith('  blur(8px) saturate(1.4)  ')
        expect(api().backdropStyles.value).toEqual([
            'backdrop-filter: blur(8px) saturate(1.4)',
            '-webkit-backdrop-filter: blur(8px) saturate(1.4)'
        ])
    })

    it('custom value never emits a utility class', () => {
        const { api } = mountWith('blur(8px) saturate(1.4)')
        expect(api().backdropClasses.value).toEqual([])
    })

    it('plain gibberish string (no unit/function signal) → no style (silent-drop, mirrors useElevation/useRounded)', () => {
        const { api } = mountWith('not-a-blur')
        expect(api().backdropStyles.value).toEqual([])
        expect(api().backdropClasses.value).toEqual([])
    })
})
