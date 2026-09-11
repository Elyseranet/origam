// Unit tests for `useHover`.
// Covers: isHover/hoverState/hoverClasses/forced computation,
// mouseenter/mouseleave handlers, reactive prop changes.

import { defineComponent, h, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { IHoverProps } from '@origam/interfaces'
import { useHover } from '@origam/composables/Commons/hover.composable'

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * `useHover` accepts an explicit `name` string used verbatim in the class
 * (`${name}--hovered`). When omitted, the default calls
 * `getCurrentInstanceName()` which applies `toKebabCase` from the component
 * name. Here we pass an already-kebab-cased name to get predictable classes.
 */
function mountWithHover (initial: IHoverProps['hover'], kebabName = 'origam-hover-host') {
    const props = reactive<IHoverProps>({ hover: initial })
    let api!: ReturnType<typeof useHover>

    const Host = defineComponent({
        setup () {
            api = useHover(props, kebabName)
            return () => h('div')
        }
    })
    mount(Host)
    return { props, api: () => api }
}

// ─── suite ──────────────────────────────────────────────────────────────────

describe('useHover — hover=undefined (default, pointer-driven)', () => {
    it('isHover starts false', () => {
        const { api } = mountWithHover(undefined)
        expect(api().isHover.value).toBe(false)
    })

    it('onMouseenter sets isHover to true', () => {
        const { api } = mountWithHover(undefined)
        api().onMouseenter()
        expect(api().isHover.value).toBe(true)
    })

    it('onMouseleave sets isHover to false', () => {
        const { api } = mountWithHover(undefined)
        api().onMouseenter()
        api().onMouseleave()
        expect(api().isHover.value).toBe(false)
    })

    it('hoverState is undefined', () => {
        const { api } = mountWithHover(undefined)
        expect(api().hoverState.value).toBeUndefined()
    })
})

describe('useHover — hover=false (same as default)', () => {
    it('isHover starts false', () => {
        const { api } = mountWithHover(false)
        expect(api().isHover.value).toBe(false)
    })

    it('onMouseenter still activates hover', () => {
        const { api } = mountWithHover(false)
        api().onMouseenter()
        expect(api().isHover.value).toBe(true)
    })
})

describe('useHover — hover=true (forced)', () => {
    it('isHover is true regardless of mouse events', () => {
        const { api } = mountWithHover(true)
        expect(api().isHover.value).toBe(true)
    })

    it('onMouseleave does NOT unset isHover when forced=true', () => {
        const { api } = mountWithHover(true)
        api().onMouseleave()
        expect(api().isHover.value).toBe(true)
    })

    it('hoverState is undefined when hover is boolean true', () => {
        const { api } = mountWithHover(true)
        expect(api().hoverState.value).toBeUndefined()
    })
})

describe('useHover — hover=IHoverState object', () => {
    it('isHover is pointer-driven when enabled is absent', () => {
        const { api } = mountWithHover({ color: 'primary' })
        expect(api().isHover.value).toBe(false)
        api().onMouseenter()
        expect(api().isHover.value).toBe(true)
    })

    it('isHover is forced when enabled=true in object', () => {
        const { api } = mountWithHover({ enabled: true, color: 'danger' })
        expect(api().isHover.value).toBe(true)
    })

    it('hoverState returns the config object', () => {
        const config = { color: 'success', bgColor: 'warning' }
        const { api } = mountWithHover(config)
        expect(api().hoverState.value).toEqual(config)
    })

    it('hoverState is still reactive after pointer events', () => {
        const config = { elevation: 'md' }
        const { api } = mountWithHover(config)
        api().onMouseenter()
        expect(api().hoverState.value).toEqual(config)
    })
})

describe('useHover — hoverClasses', () => {
    it('no class when isHover=false', () => {
        const { api } = mountWithHover(false, 'origam-btn')
        expect(api().hoverClasses.value).toEqual([])
    })

    it('emits <component>--hovered class when isHover=true', () => {
        const { api } = mountWithHover(true, 'origam-btn')
        expect(api().hoverClasses.value).toContain('origam-btn--hovered')
    })

    it('class mirrors the name arg verbatim (consumer is responsible for casing)', () => {
        const { api } = mountWithHover(true, 'origam-list-item')
        expect(api().hoverClasses.value).toContain('origam-list-item--hovered')
    })

    it('class added after onMouseenter', () => {
        const { api } = mountWithHover(undefined, 'origam-card')
        expect(api().hoverClasses.value).toEqual([])
        api().onMouseenter()
        expect(api().hoverClasses.value).toContain('origam-card--hovered')
    })

    it('class removed after onMouseleave', () => {
        const { api } = mountWithHover(undefined, 'origam-card')
        api().onMouseenter()
        api().onMouseleave()
        expect(api().hoverClasses.value).toEqual([])
    })
})

describe('useHover — reactive prop changes', () => {
    it('prop change from false to true forces isHover', () => {
        const { props, api } = mountWithHover(false)
        expect(api().isHover.value).toBe(false)
        props.hover = true
        expect(api().isHover.value).toBe(true)
    })

    it('prop change from true to false releases force (pointer events take over)', () => {
        const { props, api } = mountWithHover(true)
        expect(api().isHover.value).toBe(true)
        props.hover = false
        // forced is now false; isHovered internal ref is still false → overall false
        expect(api().isHover.value).toBe(false)
    })

    it('prop change to object with enabled=true forces hover', () => {
        const { props, api } = mountWithHover(false)
        props.hover = { enabled: true, color: 'info' }
        expect(api().isHover.value).toBe(true)
    })
})
