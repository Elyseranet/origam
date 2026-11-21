// Unit tests for `useIcon` (icon resolution) and `createIcons`.
//
// `useIcon` requires an injected icon context (ORIGAM_ICONS_KEY) and a Vue
// component scope. We mount a thin host component that exposes the returned
// `iconData` ref so we can assert the resolved component + icon name.
//
// Tested behaviours:
//   - undefined prop → falls back to OrigamComponentIcon (no-icon placeholder)
//   - "$alias" string → resolves through `aliases` map
//   - Unknown "$alias" → throws
//   - SVG path data string (starts with M/L/C…) → OrigamSvgIcon
//   - Array → OrigamSvgIcon with the array payload
//   - "setName:iconName" prefix → resolves from that set
//   - Plain string (no prefix, no path data) → resolved from defaultSet
//
// `createIcons` is also tested to verify the shape of the returned options.

import { defineComponent, h, provide, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { ORIGAM_ICONS_KEY } from '@origam/consts'
import { OrigamComponentIcon, OrigamSvgIcon } from '@origam/components'
import { useIcon } from '@origam/composables/Icon/icon.composable'
import { createIcons } from '@origam/composables/Icon/iconsFull.composable'

// ---------------------------------------------------------------------------
// Minimal icon set stub
// ---------------------------------------------------------------------------

const STUB_SET_COMPONENT = defineComponent({ name: 'StubIconSet', setup: () => () => h('span') })

const STUB_ICONS = {
    defaultSet: 'mdi',
    sets: {
        mdi: { component: STUB_SET_COMPONENT },
        custom: { component: STUB_SET_COMPONENT }
    },
    aliases: {
        close: 'mdi:close',
        home: 'mdi:home'
    }
}

// ---------------------------------------------------------------------------
// Helper: mount a host that resolves the icon prop
// ---------------------------------------------------------------------------

function mountWithIcon (iconValue: any) {
    const iconProp = ref(iconValue)
    let iconData: any

    const Host = defineComponent({
        name: 'IconTestHost',
        setup () {
            provide(ORIGAM_ICONS_KEY, STUB_ICONS as any)
            // Child must be in the same setup scope or we use a child component.
            return () => h('div')
        }
    })

    // We mount a child that actually calls useIcon inside the provided context.
    const Child = defineComponent({
        name: 'IconTestChild',
        setup () {
            const result = useIcon(iconProp)
            iconData = result.iconData
            return () => h('div')
        }
    })

    const Wrapper = defineComponent({
        name: 'IconTestWrapper',
        setup () {
            provide(ORIGAM_ICONS_KEY, STUB_ICONS as any)
            return () => h(Child)
        }
    })

    mount(Wrapper)
    return { iconProp, getIconData: () => iconData.value }
}

// ---------------------------------------------------------------------------
// Icon resolution
// ---------------------------------------------------------------------------

describe('useIcon — prop=undefined', () => {
    it('returns OrigamComponentIcon as the fallback component', () => {
        const { getIconData } = mountWithIcon(undefined)
        expect(getIconData().component).toBe(OrigamComponentIcon)
    })

    it('icon payload is undefined', () => {
        const { getIconData } = mountWithIcon(undefined)
        expect(getIconData().icon).toBeUndefined()
    })
})

describe('useIcon — SVG path string', () => {
    it('routes "M 0 0 L 10 10" to OrigamSvgIcon', () => {
        const { getIconData } = mountWithIcon('M 0 0 L 10 10')
        expect(getIconData().component).toBe(OrigamSvgIcon)
    })

    it('preserves the raw path data as the icon payload', () => {
        const path = 'M 0 0 L 10 10'
        const { getIconData } = mountWithIcon(path)
        expect(getIconData().icon).toBe(path)
    })

    it('lower-case path commands are also routed to OrigamSvgIcon', () => {
        const { getIconData } = mountWithIcon('m 0 0 l 10 10')
        expect(getIconData().component).toBe(OrigamSvgIcon)
    })

    it('C command (cubic bezier) is routed to OrigamSvgIcon', () => {
        const { getIconData } = mountWithIcon('C 100,200 200,100 300,200')
        expect(getIconData().component).toBe(OrigamSvgIcon)
    })
})

describe('useIcon — array payload', () => {
    it('routes an array to OrigamSvgIcon', () => {
        const { getIconData } = mountWithIcon(['M 0 0', 'L 10 10'])
        expect(getIconData().component).toBe(OrigamSvgIcon)
    })

    it('preserves the array as the icon payload', () => {
        const arr = ['path-a', 'path-b']
        const { getIconData } = mountWithIcon(arr)
        expect(getIconData().icon).toEqual(arr)
    })
})

describe('useIcon — alias resolution', () => {
    it('"$close" resolves via the aliases map', () => {
        // STUB_ICONS.aliases.close = 'mdi:close'
        // This should resolve to the mdi set component with icon name 'close'.
        const { getIconData } = mountWithIcon('$close')
        expect(getIconData().component).toBe(STUB_SET_COMPONENT)
        expect(getIconData().icon).toBe('close')
    })

    it('unknown "$noexist" alias warns and falls back to an empty icon (no throw)', () => {
        // `useIcon` no longer throws inside the computed (an uncatchable Vue
        // error). For an unresolvable alias it warns once and falls back to the
        // empty component icon, so reading `.value` is always safe.
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        let threw = false
        let result: { component?: unknown } | null = null
        const iconProp = ref('$noexist')

        const Child = defineComponent({
            setup () {
                const { iconData } = useIcon(iconProp)
                try {
                    result = iconData.value as { component?: unknown }
                } catch {
                    threw = true
                }
                return () => h('div')
            }
        })
        const Wrapper = defineComponent({
            setup () {
                provide(ORIGAM_ICONS_KEY, STUB_ICONS as any)
                return () => h(Child)
            }
        })
        mount(Wrapper)
        expect(threw).toBe(false)
        expect(warn).toHaveBeenCalled()
        expect(result?.component).toBeTruthy()
        warn.mockRestore()
    })
})

describe('useIcon — set-prefixed string', () => {
    it('"mdi:alarm" resolves to the mdi set component with icon "alarm"', () => {
        const { getIconData } = mountWithIcon('mdi:alarm')
        expect(getIconData().component).toBe(STUB_SET_COMPONENT)
        expect(getIconData().icon).toBe('alarm')
    })

    it('"custom:check" resolves to the custom set component with icon "check"', () => {
        const { getIconData } = mountWithIcon('custom:check')
        expect(getIconData().component).toBe(STUB_SET_COMPONENT)
        expect(getIconData().icon).toBe('check')
    })
})

describe('useIcon — plain string (no prefix)', () => {
    it('routes to the defaultSet (mdi) and keeps the icon name', () => {
        const { getIconData } = mountWithIcon('alarm')
        expect(getIconData().component).toBe(STUB_SET_COMPONENT)
        expect(getIconData().icon).toBe('alarm')
    })
})

describe('useIcon — object (non-string, non-array)', () => {
    it('routes a component object to OrigamComponentIcon', () => {
        const iconObj = { component: STUB_SET_COMPONENT, icon: 'heart' }
        const { getIconData } = mountWithIcon(iconObj)
        // Non-string, non-array values go through the `typeof icon !== 'string'`
        // branch which returns { component: OrigamComponentIcon, icon: <the object> }.
        expect(getIconData().component).toBe(OrigamComponentIcon)
        // The whole iconObj is stored as the .icon payload — deep equality.
        expect(getIconData().icon).toStrictEqual(iconObj)
    })
})

// ---------------------------------------------------------------------------
// createIcons
// ---------------------------------------------------------------------------

describe('createIcons', () => {
    it('returns an object with defaultSet, sets, and aliases', () => {
        const icons = createIcons()
        expect(icons).toHaveProperty('defaultSet')
        expect(icons).toHaveProperty('sets')
        expect(icons).toHaveProperty('aliases')
    })

    it('defaultSet is "mdi"', () => {
        const icons = createIcons()
        expect(icons.defaultSet).toBe('mdi')
    })

    it('sets contains an mdi entry', () => {
        const icons = createIcons()
        expect(icons.sets).toHaveProperty('mdi')
    })

    it('merges custom options over the defaults', () => {
        const CustomSet = defineComponent({ name: 'CustomSet', setup: () => () => h('span') })
        const icons = createIcons({
            sets: { brand: { component: CustomSet } },
            aliases: { logo: 'brand:logo' }
        })
        expect(icons.sets).toHaveProperty('brand')
        expect(icons.aliases).toHaveProperty('logo')
        // Default mdi set should still be present (deep merge).
        expect(icons.sets).toHaveProperty('mdi')
    })

    it('custom defaultSet override is preserved', () => {
        const icons = createIcons({ defaultSet: 'fa' } as any)
        expect(icons.defaultSet).toBe('fa')
    })
})
