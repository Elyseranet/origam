// #505 — `useChartAnimationStyle`: inline style set only when the value is
// meaningful (consumer explicit OR theme), never for the untouched default.
//
// Every `OrigamChart*.vue` used to write
//   out['--origam-chart---animation-duration'] = `${props.animationDuration}ms`
// UNCONDITIONALLY. `props.animationDuration` always resolves to SOMETHING
// (a `withDefaults()` default of 600), so the assignment fired on every
// render — and an inline style always outranks any `[data-theme] { ... }`
// CSS rule, permanently shadowing the token.
//
// ⛔ THE DECISIVE CASE is the theme-via-props one, not the nominal one. A
// naive `usePassedProps('animationDuration')`-only gate would be a
// REGRESSION: ADR-005 lets a theme set this exact prop through
// `theme.components['origam-chart-cartesian'].animationDuration` WITHOUT the
// consumer ever writing it in the template. `usePassedProps` reads
// `instance.vnode.props` (what the PARENT template wrote) — which the
// ADR-005 resolver does not touch — so it stays `false` under a props-level
// theme override even though `props.animationDuration` correctly resolves to
// the themed value. Gating on `usePassedProps` alone would silently drop
// that themed value from the CSS var. This file mounts a real theme via
// `createOrigam({ themes })` (the `vmodel-default-value.spec.ts` pattern),
// not a plain object mutation, specifically to catch that regression.

import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'

import { createOrigam } from '@origam/origam'
import { useChartAnimationStyle } from '@origam/composables/Chart/chart-animation.composable'
import { CHART_ANIMATION_DURATION_DEFAULT } from '@origam/consts/Chart/chart.const'

import type { IOrigamTheme } from '@origam/types'

const FakeChartHost = defineComponent({
    name: 'FakeChartAnimationHost',
    props: {animationDuration: {type: Number, default: CHART_ANIMATION_DURATION_DEFAULT}},
    setup (props) {
        const chartAnimationStyle = useChartAnimationStyle(props)
        return () => h('div', {style: chartAnimationStyle.value})
    }
})

const themedWith = (animationDuration: number): ReturnType<typeof createOrigam> => {
    const theme: IOrigamTheme = {
        name: 'chart-brand',
        components: {'fake-chart-animation-host': {animationDuration}},
        vars: {}
    }
    const origam = createOrigam({themes: [theme]})
    origam._defaultsRef.value = origam._activeDefaultsFor('chart-brand', undefined)
    return origam
}

describe('useChartAnimationStyle — #505 three-level priority', () => {
    it('niveau 3 — rien passé + aucun thème : pas d’inline style, le CSS default (600ms) s’applique', () => {
        const wrapper = mount(FakeChartHost, {global: {plugins: [createOrigam()]}})
        expect(wrapper.attributes('style')).toBeUndefined()
        wrapper.unmount()
    })

    it('niveau 1 — prop explicite : gagne, l’inline style porte la valeur du consommateur', () => {
        const wrapper = mount(FakeChartHost, {
            global: {plugins: [createOrigam()]},
            props: {animationDuration: 900}
        })
        expect(wrapper.element.style.getPropertyValue('--origam-chart---animation-duration')).toBe('900ms')
        wrapper.unmount()
    })

    it('prop explicite ÉGALE au défaut statique : reste inline (level 1 doit toujours s’appliquer, même valeur identique)', () => {
        const wrapper = mount(FakeChartHost, {
            global: {plugins: [createOrigam()]},
            props: {animationDuration: CHART_ANIMATION_DURATION_DEFAULT}
        })
        expect(wrapper.element.style.getPropertyValue('--origam-chart---animation-duration')).toBe(`${ CHART_ANIMATION_DURATION_DEFAULT }ms`)
        wrapper.unmount()
    })

    it('niveau 2 — LE CAS DÉCISIF : rien passé + thème (theme.components, prop-level) : la valeur du thème atteint la CSS var', () => {
        const wrapper = mount(FakeChartHost, {global: {plugins: [themedWith(300)]}})
        expect(wrapper.element.style.getPropertyValue('--origam-chart---animation-duration')).toBe('300ms')
        wrapper.unmount()
    })

    it('un thème qui fixe EXACTEMENT le défaut statique (600) reste indiscernable du cas "rien" — pas de régression visuelle possible', () => {
        const wrapper = mount(FakeChartHost, {global: {plugins: [themedWith(CHART_ANIMATION_DURATION_DEFAULT)]}})
        // Pas d'inline — mais la valeur rendue par le fallback CSS (600ms) est
        // de toute façon identique à celle du thème : aucune différence visible.
        expect(wrapper.attributes('style')).toBeUndefined()
        wrapper.unmount()
    })
})
