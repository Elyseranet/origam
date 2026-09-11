// Tests for the `active` state of `useStateFlag`.
// Covers: boolean active prop (true forces isOn), false/undefined →
// internal toggle via toggle(), IStateEffectConfig object prop (enabled
// flag, internalToggle path), classes output, activeClass custom appended,
// and the forced toggle(true|false) path absorbed from an in-flight edit to
// the old active.composable.ts (see stateFlag.composable.ts's `toggle` doc).
// `useActive` was merged into `useStateFlag` — see hover.composable.spec.ts
// for the hover side.

import { defineComponent, h, nextTick, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { IActiveProps } from '@origam/interfaces'

import { useStateFlag } from '@origam/composables/Commons/stateFlag.composable'

type ActivePropValue = IActiveProps['active']

function mountWithActive (initial: ActivePropValue, componentName = 'OrigamActiveHost', activeClass?: string) {
    const props = reactive<IActiveProps & { activeClass?: string }>({
        active: initial,
        activeClass
    })
    let api!: ReturnType<typeof useStateFlag<'active'>>

    const Host = defineComponent({
        name: componentName,
        emits: ['update:active'],
        setup () {
            api = useStateFlag(props, { state: 'active' })
            return () => h('div')
        }
    })

    mount(Host)
    return { props, api: () => api }
}

describe('useStateFlag(active) — boolean prop', () => {
    it('active=true forces isOn to true', () => {
        const { api } = mountWithActive(true)
        expect(api().isOn.value).toBe(true)
    })

    it('active=false → isOn starts as false', () => {
        const { api } = mountWithActive(false)
        expect(api().isOn.value).toBe(false)
    })

    it('active=undefined → isOn starts as false', () => {
        const { api } = mountWithActive(undefined)
        expect(api().isOn.value).toBe(false)
    })
})

describe('useStateFlag(active) — toggle() (plain boolean / undefined)', () => {
    it('toggle() flips isOn from false to true', () => {
        const { api } = mountWithActive(false)
        api().toggle()
        expect(api().isOn.value).toBe(true)
    })

    it('toggle() toggles back from true to false', () => {
        const { api } = mountWithActive(false)
        api().toggle()
        api().toggle()
        expect(api().isOn.value).toBe(false)
    })

    it('toggle() when active=undefined starts toggle from false', () => {
        const { api } = mountWithActive(undefined)
        api().toggle()
        expect(api().isOn.value).toBe(true)
    })
})

describe('useStateFlag(active) — IStateEffectConfig object prop', () => {
    it('active={} (no enabled) → isOn starts as false', () => {
        const { api } = mountWithActive({ color: 'primary' })
        expect(api().isOn.value).toBe(false)
    })

    it('active={ enabled: true } → isOn is forced to true', () => {
        const { api } = mountWithActive({ enabled: true, color: 'primary' })
        expect(api().isOn.value).toBe(true)
    })

    it('active={} → toggle() uses internal toggle (flips to true)', () => {
        const { api } = mountWithActive({ color: 'primary' })
        api().toggle()
        expect(api().isOn.value).toBe(true)
    })

    it('active={} → toggle() twice → isOn back to false (internal toggle)', () => {
        const { api } = mountWithActive({ color: 'primary' })
        api().toggle()
        api().toggle()
        expect(api().isOn.value).toBe(false)
    })

    it('config is the config object when active is IStateEffectConfig', () => {
        const config = { color: 'danger', bgColor: 'warning' }
        const { api } = mountWithActive(config)
        expect(api().config.value).toEqual(config)
    })

    it('config is undefined when active is a boolean', () => {
        const { api } = mountWithActive(true)
        expect(api().config.value).toBeUndefined()
    })

    it('config is undefined when active is undefined', () => {
        const { api } = mountWithActive(undefined)
        expect(api().config.value).toBeUndefined()
    })
})

describe('useStateFlag(active) — classes', () => {
    it('isOn=false → no active class', () => {
        const { api } = mountWithActive(false, 'OrigamBtn')
        expect(api().classes.value).toEqual([])
    })

    it('isOn=true → emits component--active class', () => {
        const { api } = mountWithActive(true, 'OrigamBtn')
        expect(api().classes.value).toContain('origam-btn--active')
    })

    it('activeClass prop appended alongside component--active when isOn', () => {
        const { api } = mountWithActive(true, 'OrigamBtn', 'my-custom-active')
        const cls = api().classes.value
        expect(cls).toContain('origam-btn--active')
        expect(cls).toContain('my-custom-active')
    })

    it('activeClass NOT appended when isOn=false', () => {
        const { api } = mountWithActive(false, 'OrigamBtn', 'my-custom-active')
        expect(api().classes.value).not.toContain('my-custom-active')
    })

    it('class uses kebab-cased component name', () => {
        const { api } = mountWithActive(true, 'OrigamListItem')
        expect(api().classes.value).toContain('origam-list-item--active')
    })

    it('classes updates reactively after toggle()', () => {
        const { api } = mountWithActive(false, 'OrigamChip')
        expect(api().classes.value).toEqual([])
        api().toggle()
        expect(api().classes.value).toContain('origam-chip--active')
    })
})

describe('useStateFlag(active) — reactive prop changes', () => {
    it('prop change from false to true forces isOn to true', () => {
        const { props, api } = mountWithActive(false)
        expect(api().isOn.value).toBe(false)
        props.active = true
        expect(api().isOn.value).toBe(true)
    })

    it('prop change from true to false releases the force (requires nextTick for internal watcher)', async () => {
        const { props, api } = mountWithActive(true)
        expect(api().isOn.value).toBe(true)
        props.active = false
        // useVModel keeps an internal ref synced via a Vue watch (async flush).
        // forced becomes false immediately, but vmodel.internal needs a tick to
        // pick up the new prop value when the component is uncontrolled.
        await nextTick()
        expect(api().isOn.value).toBe(false)
    })
})

describe('useStateFlag(active) — toggle(force) (absorbed from active.composable.ts WIP)', () => {
    it('toggle(true) forces isOn to true without a boolean prop toggling through it twice', () => {
        const { api } = mountWithActive({ color: 'primary' })
        api().toggle(true)
        expect(api().isOn.value).toBe(true)
    })

    it('toggle(false) forces isOn back to false', () => {
        const { api } = mountWithActive({ color: 'primary' })
        api().toggle(true)
        api().toggle(false)
        expect(api().isOn.value).toBe(false)
    })

    it('toggle(true) does not emit update:active (writes internalToggle, not the v-model)', () => {
        const props = reactive<IActiveProps>({ active: { color: 'primary' } })
        const emitted: unknown[] = []
        const Host = defineComponent({
            name: 'OrigamActiveForceHost',
            emits: ['update:active'],
            setup (_, { emit }) {
                const api = useStateFlag(props, { state: 'active' })
                return { api, forceOn: () => api.toggle(true), emit }
            },
            render () { return h('div') }
        })
        const wrapper = mount(Host, { attrs: { 'onUpdate:active': (v: unknown) => emitted.push(v) } })
        ;(wrapper.vm as unknown as { forceOn: () => void }).forceOn()
        expect(emitted).toEqual([])
    })

    it('an accidental non-boolean argument (e.g. a native Event from a bare template binding) is ignored and falls through to the normal toggle', () => {
        // Regression guard: `toggle` is bound DIRECTLY as a template event
        // handler at several migrated call sites (`@click="handleClick"` on
        // Avatar/Sheet before they were changed to explicit `()` calls).
        // Vue invokes a bare-identifier handler with the native Event as its
        // first argument. `typeof force === 'boolean'` must reject that and
        // fall through to the ordinary toggle path instead of treating the
        // Event as a forced value.
        const { api } = mountWithActive(false)
        const fakeEvent = new Event('click')
        // @ts-expect-error — simulating what Vue's compiled template does
        api().toggle(fakeEvent)
        expect(api().isOn.value).toBe(true)
    })
})
