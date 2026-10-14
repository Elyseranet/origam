// Tests for `useLoader` composable.
// Covers the polymorphic `loading` prop resolution into IResolvedLoader,
// the backward-compatible class map output, and the defaultKind behaviour.

import { defineComponent, h, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { ILoaderProps } from '@origam/interfaces'
import type { TLoaderKind, TLoadingValue } from '@origam/types'

import { useLoader } from '@origam/composables/Commons/loader.composable'

/**
 * Mount a host component that calls `useLoader` from inside `setup()` and
 * exposes the live result through a callback. We use a reactive props bag
 * so the test can mutate it and observe the computed refs update.
 */
function mountWith (
    initial: TLoadingValue | undefined,
    defaultKind?: TLoaderKind
) {
    const props = reactive<ILoaderProps>({ loading: initial })
    let api!: ReturnType<typeof useLoader>

    const Host = defineComponent({
        name: 'OrigamHostUnderTest',
        setup () {
            api = defaultKind != null
                ? useLoader(props, defaultKind)
                : useLoader(props)
            return () => h('div')
        }
    })

    const wrapper = mount(Host)
    return { props, api: () => api, wrapper }
}

describe('useLoader', () => {
    it('returns isActive=false and indeterminate kind=circular by default when loading is false', () => {
        const { api } = mountWith(false)
        const cfg = api().loaderConfig.value
        expect(cfg.isActive).toBe(false)
        expect(cfg.kind).toBe('circular')
        expect(cfg.modelValue).toBeUndefined()
        expect(api().isLoading.value).toBe(false)
    })

    it('treats undefined loading as not loading', () => {
        const { api } = mountWith(undefined)
        expect(api().isLoading.value).toBe(false)
        expect(api().loaderConfig.value.isActive).toBe(false)
    })

    it('loading=true → isActive, kind=defaultKind, indeterminate, no modelValue', () => {
        const { api } = mountWith(true)
        const cfg = api().loaderConfig.value
        expect(cfg.isActive).toBe(true)
        expect(cfg.kind).toBe('circular')
        expect(cfg.indeterminate).toBe(true)
        expect(cfg.modelValue).toBeUndefined()
        expect(api().isLoading.value).toBe(true)
    })

    it('loading=42 → isActive, determinate, modelValue=42', () => {
        const { api } = mountWith(42)
        const cfg = api().loaderConfig.value
        expect(cfg.isActive).toBe(true)
        expect(cfg.kind).toBe('circular')
        expect(cfg.indeterminate).toBe(false)
        expect(cfg.modelValue).toBe(42)
    })

    it('loading={ type: "line" } → kind=line, indeterminate, empty overrides', () => {
        const { api } = mountWith({ type: 'line' })
        const cfg = api().loaderConfig.value
        expect(cfg.kind).toBe('line')
        expect(cfg.indeterminate).toBe(true)
        expect(cfg.modelValue).toBeUndefined()
        expect(cfg.overrides).toEqual({})
    })

    it('loading={ type: "circular", size: 32 } → kind=circular, overrides.size=32', () => {
        const { api } = mountWith({ type: 'circular', size: 32 })
        const cfg = api().loaderConfig.value
        expect(cfg.kind).toBe('circular')
        expect((cfg.overrides as { size?: number }).size).toBe(32)
        expect(cfg.indeterminate).toBe(true)
    })

    it('loading={ type: "skeleton", variant: "pill" } → kind=skeleton, overrides.variant=pill', () => {
        const { api } = mountWith({ type: 'skeleton', variant: 'pill' })
        const cfg = api().loaderConfig.value
        expect(cfg.kind).toBe('skeleton')
        expect((cfg.overrides as { variant?: string }).variant).toBe('pill')
    })

    it('loading={ type: "line", modelValue: 75 } → modelValue=75, determinate', () => {
        const { api } = mountWith({ type: 'line', modelValue: 75 })
        const cfg = api().loaderConfig.value
        expect(cfg.kind).toBe('line')
        expect(cfg.modelValue).toBe(75)
        expect(cfg.indeterminate).toBe(false)
    })

    it('defaultKind defaults to "circular" when omitted', () => {
        const { api } = mountWith(true)
        expect(api().loaderConfig.value.kind).toBe('circular')
    })

    it('defaultKind="line" overrides the default for boolean / number inputs', () => {
        const { api: apiTrue } = mountWith(true, 'line')
        expect(apiTrue().loaderConfig.value.kind).toBe('line')

        const { api: apiNum } = mountWith(60, 'line')
        const cfg = apiNum().loaderConfig.value
        expect(cfg.kind).toBe('line')
        expect(cfg.modelValue).toBe(60)
    })

    it('explicit object kind wins over defaultKind', () => {
        const { api } = mountWith({ type: 'skeleton' }, 'line')
        expect(api().loaderConfig.value.kind).toBe('skeleton')
    })

    it('loaderClasses exposes `${componentName}--loading` keyed on isLoading', () => {
        const { props, api } = mountWith(false)
        // host component name is "OrigamHostUnderTest" → kebab "origam-host-under-test"
        expect(api().loaderClasses.value).toEqual({
            'origam-host-under-test--loading': false
        })

        props.loading = true
        // Re-read computed — reactivity should propagate.
        expect(api().loaderClasses.value).toEqual({
            'origam-host-under-test--loading': true
        })
        expect(api().isLoading.value).toBe(true)
    })

    it('mutating props.loading flips the resolved descriptor reactively', () => {
        const { props, api } = mountWith(false)
        expect(api().loaderConfig.value.isActive).toBe(false)

        props.loading = 25
        expect(api().loaderConfig.value).toMatchObject({
            isActive: true,
            kind: 'circular',
            modelValue: 25,
            indeterminate: false
        })

        props.loading = { type: 'line', modelValue: 90 }
        expect(api().loaderConfig.value).toMatchObject({
            isActive: true,
            kind: 'line',
            modelValue: 90,
            indeterminate: false
        })

        props.loading = false
        expect(api().loaderConfig.value.isActive).toBe(false)
    })
})
