// Tests for `useActive` composable.
// Covers: boolean active prop (true forces isActive), false/undefined →
// internal toggle via onActive(), IActiveState object prop (enabled flag,
// internalToggle path), activeClasses output, activeClass custom appended.

import { defineComponent, h, nextTick, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { IActiveProps } from '@origam/interfaces'

import { useActive } from '@origam/composables/Commons/active.composable'

type ActivePropValue = IActiveProps['active']

function mountWithActive (initial: ActivePropValue, componentName = 'OrigamActiveHost', activeClass?: string) {
    const props = reactive<IActiveProps & { activeClass?: string }>({
        active: initial,
        activeClass
    })
    let api!: ReturnType<typeof useActive>

    const Host = defineComponent({
        name: componentName,
        emits: ['update:active'],
        setup () {
            api = useActive(props)
            return () => h('div')
        }
    })

    mount(Host)
    return { props, api: () => api }
}

describe('useActive — boolean prop', () => {
    it('active=true forces isActive to true', () => {
        const { api } = mountWithActive(true)
        expect(api().isActive.value).toBe(true)
    })

    it('active=false → isActive starts as false', () => {
        const { api } = mountWithActive(false)
        expect(api().isActive.value).toBe(false)
    })

    it('active=undefined → isActive starts as false', () => {
        const { api } = mountWithActive(undefined)
        expect(api().isActive.value).toBe(false)
    })
})

describe('useActive — onActive toggle (plain boolean / undefined)', () => {
    it('onActive() flips isActive from false to true', () => {
        const { api } = mountWithActive(false)
        api().onActive()
        expect(api().isActive.value).toBe(true)
    })

    it('onActive() toggles back from true to false', () => {
        const { api } = mountWithActive(false)
        api().onActive()
        api().onActive()
        expect(api().isActive.value).toBe(false)
    })

    it('onActive() when active=undefined starts toggle from false', () => {
        const { api } = mountWithActive(undefined)
        api().onActive()
        expect(api().isActive.value).toBe(true)
    })
})

describe('useActive — IActiveState object prop', () => {
    it('active={} (no enabled) → isActive starts as false', () => {
        const { api } = mountWithActive({ color: 'primary' })
        expect(api().isActive.value).toBe(false)
    })

    it('active={ enabled: true } → isActive is forced to true', () => {
        const { api } = mountWithActive({ enabled: true, color: 'primary' })
        expect(api().isActive.value).toBe(true)
    })

    it('active={} → onActive() uses internal toggle (flips to true)', () => {
        const { api } = mountWithActive({ color: 'primary' })
        api().onActive()
        expect(api().isActive.value).toBe(true)
    })

    it('active={} → onActive() twice → isActive back to false (internal toggle)', () => {
        const { api } = mountWithActive({ color: 'primary' })
        api().onActive()
        api().onActive()
        expect(api().isActive.value).toBe(false)
    })

    it('activeState is the config object when active is IActiveState', () => {
        const config = { color: 'danger', bgColor: 'warning' }
        const { api } = mountWithActive(config)
        expect(api().activeState.value).toEqual(config)
    })

    it('activeState is undefined when active is a boolean', () => {
        const { api } = mountWithActive(true)
        expect(api().activeState.value).toBeUndefined()
    })

    it('activeState is undefined when active is undefined', () => {
        const { api } = mountWithActive(undefined)
        expect(api().activeState.value).toBeUndefined()
    })
})

describe('useActive — activeClasses', () => {
    it('isActive=false → no active class', () => {
        const { api } = mountWithActive(false, 'OrigamBtn')
        expect(api().activeClasses.value).toEqual([])
    })

    it('isActive=true → emits component--active class', () => {
        const { api } = mountWithActive(true, 'OrigamBtn')
        expect(api().activeClasses.value).toContain('origam-btn--active')
    })

    it('activeClass prop appended alongside component--active when isActive', () => {
        const { api } = mountWithActive(true, 'OrigamBtn', 'my-custom-active')
        const cls = api().activeClasses.value
        expect(cls).toContain('origam-btn--active')
        expect(cls).toContain('my-custom-active')
    })

    it('activeClass NOT appended when isActive=false', () => {
        const { api } = mountWithActive(false, 'OrigamBtn', 'my-custom-active')
        expect(api().activeClasses.value).not.toContain('my-custom-active')
    })

    it('class uses kebab-cased component name', () => {
        const { api } = mountWithActive(true, 'OrigamListItem')
        expect(api().activeClasses.value).toContain('origam-list-item--active')
    })

    it('activeClasses updates reactively after onActive() toggle', () => {
        const { api } = mountWithActive(false, 'OrigamChip')
        expect(api().activeClasses.value).toEqual([])
        api().onActive()
        expect(api().activeClasses.value).toContain('origam-chip--active')
    })
})

describe('useActive — reactive prop changes', () => {
    it('prop change from false to true forces isActive to true', () => {
        const { props, api } = mountWithActive(false)
        expect(api().isActive.value).toBe(false)
        props.active = true
        expect(api().isActive.value).toBe(true)
    })

    it('prop change from true to false releases the force (requires nextTick for internal watcher)', async () => {
        const { props, api } = mountWithActive(true)
        expect(api().isActive.value).toBe(true)
        props.active = false
        // useVModel keeps an internal ref synced via a Vue watch (async flush).
        // forced becomes false immediately, but vmodel.internal needs a tick to
        // pick up the new prop value when the component is uncontrolled.
        await nextTick()
        expect(api().isActive.value).toBe(false)
    })
})
