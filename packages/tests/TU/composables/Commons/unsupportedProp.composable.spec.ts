// #426 — `useUnsupportedProp`: dev-time warning for a chart prop that
// is publicly exposed (inherited from `IChartBaseProps`) but has no
// rendering effect on a particular chart type. First consumer: `colorScheme`
// on OrigamChartBullet / OrigamChartCandlestick / OrigamChartHeatmap /
// OrigamChartMap — see `packages/ds/src/components/Chart/OrigamChart{
// Bullet,Candlestick,Heatmap,Map}.vue` and the component-level integration
// spec `chart-colorscheme-unsupported.spec.ts`.
//
// This spec isolates the composable itself: the check runs inside
// `watchEffect` (not a bare `if` in `setup()`) so the read is LAZY per
// ADR-005 — a `ref`-driven prop mutated AFTER mount must still trigger the
// warning the first time it becomes truthy.

import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'

import { useUnsupportedProp } from '@origam/composables/Commons/unsupportedProp.composable'

const FakeChartHost = defineComponent({
    name: 'FakeChartUnsupportedPropHost',
    props: {colorScheme: {type: Array, default: () => []}},
    setup (props) {
        useUnsupportedProp(
            'FakeChartUnsupportedPropHost',
            'colorScheme',
            'test reason — binary colour model',
            () => !!(props.colorScheme as Array<unknown>)?.length
        )
        return () => h('div')
    }
})

const RerenderFakeChartHost = defineComponent({
    name: 'RerenderFakeChartUnsupportedPropHost',
    props: {colorScheme: {type: Array, default: () => []}},
    setup (props) {
        useUnsupportedProp(
            'RerenderFakeChartUnsupportedPropHost',
            'colorScheme',
            'test reason — rerender dedup',
            () => !!(props.colorScheme as Array<unknown>)?.length
        )
        return () => h('div')
    }
})

const LazyFakeChartHost = defineComponent({
    name: 'LazyFakeChartUnsupportedPropHost',
    setup () {
        const scheme = ref<Array<string>>([])
        useUnsupportedProp(
            'LazyFakeChartUnsupportedPropHost',
            'colorScheme',
            'test reason — lazy',
            () => !!scheme.value.length
        )
        return () => h('button', {onClick: () => { scheme.value = ['#111', '#222'] }})
    }
})

describe('useUnsupportedProp', () => {
    it('does not warn when isPassed() is false', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mount(FakeChartHost, {props: {colorScheme: []}})
        expect(warn).not.toHaveBeenCalled()
        warn.mockRestore()
    })

    it('warns once, naming the component / prop / reason, when isPassed() is true', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mount(FakeChartHost, {props: {colorScheme: ['#111', '#222']}})
        expect(warn).toHaveBeenCalledTimes(1)
        expect(warn).toHaveBeenCalledWith(
            expect.stringMatching(/FakeChartUnsupportedPropHost.*colorScheme.*binary colour model/)
        )
        warn.mockRestore()
    })

    it('does not re-emit on subsequent renders of the SAME mounted instance', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const wrapper = mount(RerenderFakeChartHost, {props: {colorScheme: ['#111']}})
        await wrapper.setProps({colorScheme: ['#111', '#222']})
        await wrapper.setProps({colorScheme: ['#333']})
        expect(warn).toHaveBeenCalledTimes(1)
        warn.mockRestore()
    })

    it('reads the getter LAZILY: a value that only becomes truthy after mount still triggers the warning once', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const wrapper = mount(LazyFakeChartHost)
        expect(warn).not.toHaveBeenCalled()

        await wrapper.find('button').trigger('click')
        expect(warn).toHaveBeenCalledTimes(1)
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('LazyFakeChartUnsupportedPropHost'))
        warn.mockRestore()
    })
})
