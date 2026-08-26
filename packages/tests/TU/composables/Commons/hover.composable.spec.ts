// Unit tests for the `hover` state of `useStateFlag`.
// Covers: isOn/config/classes computation, set()/unset() handlers,
// reactive prop changes. `useHover` was merged into `useStateFlag` —
// see stateFlag.composable.ts and active.composable.spec.ts.

import { defineComponent, h, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { IHoverProps } from '@origam/interfaces'
import { useStateFlag } from '@origam/composables/Commons/stateFlag.composable'

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * `useStateFlag` accepts an explicit `name` option used verbatim in the
 * class (`${name}--hover`). When omitted, it calls
 * `getCurrentInstanceName()` which applies `toKebabCase` from the component
 * name. Here we pass an already-kebab-cased name to get predictable classes.
 *
 * ⛔ Historical bug this replaces: the old `useHover(props, prop, name)` took
 * two POSITIONAL strings. A harness calling `useHover(props, 'origam-hover-host')`
 * believing it named the instance actually overwrote `prop` (the key read
 * off `props`) — 11 of these 21 tests were red on `develop` because of it.
 * `useStateFlag(props, { state: 'hover', name: kebabName })` can't make that
 * mistake: `state` is a closed union checked at compile time, and `name` is
 * a named option, never confused with `source`.
 */
function mountWithHover (initial: IHoverProps['hover'], kebabName = 'origam-hover-host') {
    const props = reactive<IHoverProps>({ hover: initial })
    let api!: ReturnType<typeof useStateFlag<'hover'>>

    const Host = defineComponent({
        setup () {
            api = useStateFlag(props, { state: 'hover', name: kebabName })
            return () => h('div')
        }
    })
    mount(Host)
    return { props, api: () => api }
}

// ─── suite ──────────────────────────────────────────────────────────────────

describe('useStateFlag(hover) — hover=undefined (default, pointer-driven)', () => {
    it('isOn starts false', () => {
        const { api } = mountWithHover(undefined)
        expect(api().isOn.value).toBe(false)
    })

    it('set() sets isOn to true', () => {
        const { api } = mountWithHover(undefined)
        api().set()
        expect(api().isOn.value).toBe(true)
    })

    it('unset() sets isOn to false', () => {
        const { api } = mountWithHover(undefined)
        api().set()
        api().unset()
        expect(api().isOn.value).toBe(false)
    })

    it('config is undefined', () => {
        const { api } = mountWithHover(undefined)
        expect(api().config.value).toBeUndefined()
    })
})

describe('useStateFlag(hover) — hover=false (same as default)', () => {
    it('isOn starts false', () => {
        const { api } = mountWithHover(false)
        expect(api().isOn.value).toBe(false)
    })

    it('set() still activates hover', () => {
        const { api } = mountWithHover(false)
        api().set()
        expect(api().isOn.value).toBe(true)
    })
})

describe('useStateFlag(hover) — hover=true (forced)', () => {
    it('isOn is true regardless of interaction', () => {
        const { api } = mountWithHover(true)
        expect(api().isOn.value).toBe(true)
    })

    it('unset() does NOT unset isOn when forced=true', () => {
        const { api } = mountWithHover(true)
        api().unset()
        expect(api().isOn.value).toBe(true)
    })

    it('config is undefined when hover is boolean true', () => {
        const { api } = mountWithHover(true)
        expect(api().config.value).toBeUndefined()
    })
})

describe('useStateFlag(hover) — hover=IStateEffectConfig object', () => {
    it('isOn is pointer-driven when enabled is absent', () => {
        const { api } = mountWithHover({ color: 'primary' })
        expect(api().isOn.value).toBe(false)
        api().set()
        expect(api().isOn.value).toBe(true)
    })

    it('isOn is forced when enabled=true in object', () => {
        const { api } = mountWithHover({ enabled: true, color: 'danger' })
        expect(api().isOn.value).toBe(true)
    })

    it('config returns the config object', () => {
        const config = { color: 'success', bgColor: 'warning' }
        const { api } = mountWithHover(config)
        expect(api().config.value).toEqual(config)
    })

    it('config is still reactive after pointer events', () => {
        const config = { elevation: 'md' }
        const { api } = mountWithHover(config)
        api().set()
        expect(api().config.value).toEqual(config)
    })

    it('set() does NOT destroy the config object (bug fixed by the useActive merge)', () => {
        // Pre-merge bug: useHover's onMouseenter wrote `vmodel.value = true`
        // UNCONDITIONALLY, which for a controlled `v-model:hover="{...}"`
        // emitted `true` back to the parent and destroyed the config on the
        // first mouseenter. useStateFlag gates set()/unset()/toggle() on the
        // current value's type — object → internalToggle, never vmodel.
        const config = { bgColor: 'success' }
        const { props, api } = mountWithHover(config)
        api().set()
        expect(props.hover).toEqual(config)
        expect(api().config.value).toEqual(config)
        expect(api().isOn.value).toBe(true)
    })
})

describe('useStateFlag(hover) — classes', () => {
    it('no class when isOn=false', () => {
        const { api } = mountWithHover(false, 'origam-btn')
        expect(api().classes.value).toEqual([])
    })

    it('emits <component>--hover class when isOn=true', () => {
        const { api } = mountWithHover(true, 'origam-btn')
        expect(api().classes.value).toContain('origam-btn--hover')
    })

    it('class mirrors the name option verbatim (consumer is responsible for casing)', () => {
        const { api } = mountWithHover(true, 'origam-list-item')
        expect(api().classes.value).toContain('origam-list-item--hover')
    })

    it('class added after set()', () => {
        const { api } = mountWithHover(undefined, 'origam-card')
        expect(api().classes.value).toEqual([])
        api().set()
        expect(api().classes.value).toContain('origam-card--hover')
    })

    it('class removed after unset()', () => {
        const { api } = mountWithHover(undefined, 'origam-card')
        api().set()
        api().unset()
        expect(api().classes.value).toEqual([])
    })
})

describe('useStateFlag(hover) — reactive prop changes', () => {
    it('prop change from false to true forces isOn', () => {
        const { props, api } = mountWithHover(false)
        expect(api().isOn.value).toBe(false)
        props.hover = true
        expect(api().isOn.value).toBe(true)
    })

    it('prop change from true to false releases force (pointer events take over)', () => {
        const { props, api } = mountWithHover(true)
        expect(api().isOn.value).toBe(true)
        props.hover = false
        // forced is now false; isOn's internal ref is still false → overall false
        expect(api().isOn.value).toBe(false)
    })

    it('prop change to object with enabled=true forces hover', () => {
        const { props, api } = mountWithHover(false)
        props.hover = { enabled: true, color: 'info' }
        expect(api().isOn.value).toBe(true)
    })
})
