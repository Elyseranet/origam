// Tests for `useBackdrop` — the backdrop-filter surface added by
// ADR-005 lot 3, arbitrated as option (a) of Q1.
//
// Class lists and declaration TEXT only, never `getComputedStyle`: the
// rung path emits `var(--origam-blur---*)`, which jsdom does not
// substitute (CLAUDE.md, #398). The real-browser verdict belongs to a
// Playwright spec once a component consumes this in lot 4.

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

describe('useBackdrop — token rungs', () => {
    it('"md" emits the utility class AND both filter declarations', () => {
        const { api } = mountWith('md')
        expect(api().backdropClasses.value).toEqual(['origam--backdrop-blur-md'])
        expect(api().backdropStyles.value).toEqual([
            'backdrop-filter: blur(var(--origam-blur---md, 8px))',
            '-webkit-backdrop-filter: blur(var(--origam-blur---md, 8px))'
        ])
    })

    it('every rung of the ladder resolves to its own class', () => {
        for (const rung of ['xs', 'sm', 'md', 'lg', 'xl']) {
            expect(mountWith(rung).api().backdropClasses.value)
                .toEqual([`origam--backdrop-blur-${rung}`])
        }
    })

    it('the -webkit- twin is present on EVERY path — Safari ships it prefixed only', () => {
        for (const value of ['md', 8, '6px', true] as Array<IBackdropProps['backdropBlur']>) {
            const styles = mountWith(value).api().backdropStyles.value
            expect(styles.some((s) => s.startsWith('-webkit-backdrop-filter:'))).toBe(true)
        }
    })
})

describe('useBackdrop — true takes the default rung', () => {
    it('true resolves to md, i.e. the 8px OrigamBtn ghost already paints', () => {
        const { api } = mountWith(true)
        expect(api().backdropClasses.value).toEqual(['origam--backdrop-blur-md'])
        expect(api().backdropStyles.value[0])
            .toBe('backdrop-filter: blur(var(--origam-blur---md, 8px))')
    })
})

describe('useBackdrop — custom values', () => {
    it('a number is read as px, with no class', () => {
        const { api } = mountWith(12)
        expect(api().backdropStyles.value[0]).toBe('backdrop-filter: blur(12px)')
        expect(api().backdropClasses.value).toEqual([])
    })

    it.each(['6px', '0.5rem', 'var(--custom)'])('%s is wrapped in blur() verbatim', (input) => {
        const { api } = mountWith(input)
        expect(api().backdropStyles.value[0]).toBe(`backdrop-filter: blur(${input})`)
        expect(api().backdropClasses.value).toEqual([])
    })
})

describe('useBackdrop — absence emits NOTHING, never `none`', () => {
    it.each([false, null, undefined, ''])('%s emits no declaration at all', (input) => {
        const { api } = mountWith(input as IBackdropProps['backdropBlur'])
        expect(api().backdropClasses.value).toEqual([])
        expect(api().backdropStyles.value).toEqual([])
    })

    it('never emits the string "none" — that would win the cascade and erase #813-style', () => {
        for (const input of [false, null, undefined, ''] as Array<IBackdropProps['backdropBlur']>) {
            expect(mountWith(input).api().backdropStyles.value.join(' ')).not.toContain('none')
        }
    })
})

describe('useBackdrop — reactivity', () => {
    it('recomputes when the prop changes', () => {
        const { props, api } = mountWith('md')
        expect(api().backdropClasses.value).toEqual(['origam--backdrop-blur-md'])

        props.backdropBlur = 'xl'
        expect(api().backdropClasses.value).toEqual(['origam--backdrop-blur-xl'])
    })
})

/*********************************************************
 * backdropFilter — l'echappatoire « valeur custom »
 *
 * @description
 * ADR-005 lot 4 (#1027), arbitrage du proprietaire du 2026-10-01. Le canal
 * de token que le `ghost` d'`OrigamBtn` portait,
 * `--origam-btn---backdrop-filter-ghost`, est redeclare par le theme
 * `glass` en `blur(12px) saturate(1.8) brightness(1.05)` — un filtre
 * MULTI-FONCTION, qu'une enveloppe `blur(<longueur>)` ne peut pas
 * transporter. Sans ce passthrough, convertir `ghost` en preset de props
 * jetterait silencieusement le verre de cette marque sur 1 identite x 2
 * modes.
 ********************************************************/
function mountWithProps (initial: IBackdropProps) {
    const props = reactive<IBackdropProps>({ ...initial })
    let api!: ReturnType<typeof useBackdrop>

    const Host = defineComponent({
        name: 'OrigamBackdropCustomHost',
        setup () {
            api = useBackdrop(props)
            return () => h('div')
        }
    })

    mount(Host)
    return { props, api: () => api }
}

describe('useBackdrop — backdropFilter passthrough', () => {
    it('emits the string VERBATIM on both properties, with no blur() wrapper', () => {
        const value = 'blur(12px) saturate(1.8) brightness(1.05)'
        const { api } = mountWithProps({ backdropFilter: value })

        expect(api().backdropStyles.value).toEqual([
            `backdrop-filter: ${value}`,
            `-webkit-backdrop-filter: ${value}`
        ])
        expect(api().backdropStyles.value.join(' ')).not.toContain('blur(blur(')
    })

    it('carries a var() chain with its fallback intact — the theme channel', () => {
        const value = 'var(--origam-btn---backdrop-filter-ghost, blur(8px))'
        const { api } = mountWithProps({ backdropFilter: value })

        expect(api().backdropStyles.value).toEqual([
            `backdrop-filter: ${value}`,
            `-webkit-backdrop-filter: ${value}`
        ])
    })

    it('BEATS backdropBlur when both are set, and drops the rung class', () => {
        const { api } = mountWithProps({
            backdropBlur: 'md',
            backdropFilter: 'blur(12px) saturate(1.8)'
        })

        expect(api().backdropStyles.value).toEqual([
            'backdrop-filter: blur(12px) saturate(1.8)',
            '-webkit-backdrop-filter: blur(12px) saturate(1.8)'
        ])
        // The rung class would resolve `var(--origam-blur---md)` on the SAME
        // property and fight the inline declaration — so it must not be emitted.
        expect(api().backdropClasses.value).toEqual([])
    })

    it('an empty / absent backdropFilter leaves backdropBlur in charge', () => {
        for (const backdropFilter of [undefined, '', '   '] as Array<string | undefined>) {
            const { api } = mountWithProps({ backdropBlur: 'md', backdropFilter })

            expect(api().backdropClasses.value).toEqual(['origam--backdrop-blur-md'])
            expect(api().backdropStyles.value).toEqual([
                'backdrop-filter: blur(var(--origam-blur---md, 8px))',
                '-webkit-backdrop-filter: blur(var(--origam-blur---md, 8px))'
            ])
        }
    })

    it('emits nothing at all when neither axis is set', () => {
        const { api } = mountWithProps({})

        expect(api().backdropClasses.value).toEqual([])
        expect(api().backdropStyles.value).toEqual([])
    })

    it('recomputes when backdropFilter changes', () => {
        const { props, api } = mountWithProps({ backdropFilter: 'blur(4px)' })
        expect(api().backdropStyles.value[0]).toBe('backdrop-filter: blur(4px)')

        props.backdropFilter = 'saturate(2)'
        expect(api().backdropStyles.value[0]).toBe('backdrop-filter: saturate(2)')
    })
})
