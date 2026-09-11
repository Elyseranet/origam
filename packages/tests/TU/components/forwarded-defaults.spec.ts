// Forwarded slot-defaults — the #263 contract, applied catalogue-wide.
//
// A component that forwards its OWN props down to descendants as
// `<OrigamDefaultsProvider>` entries must forward ONLY the props the consumer
// actually passed. `usePassedProps()` documents this explicitly:
//
//     "any component that FORWARDS its own props down to descendants as
//      `<OrigamDefaultsProvider>` entries […] must use this — not a plain
//      `!== undefined` check — to decide whether to forward a value."
//
// Two distinct ways a naive forward breaks, both verified here:
//
//   1. Boolean coercion. Vue resolves an unset prop whose declared type
//      *includes* `boolean` to the concrete value `false`, never `undefined`.
//      `TColor = string | IGradient | false | null | undefined` includes
//      `false`, so this bites `color` / `bgColor` too — not just the obvious
//      `border` / `rounded` / `disabled`. A plain `omitUndefined()` cannot
//      catch it, and the forwarded `false` then WINS the `mergeDeep` against
//      an ancestor/theme default.
//
//   2. `undefined` leak. `mergeDeep` assigns `out[key] = targetProperty`
//      unconditionally, so a forwarded `undefined` overwrites — and erases —
//      an ancestor/theme value that was set.
//
// Measured before this spec: `OrigamAvatarGroup` and `OrigamBtnGroup` were
// guarded (#263); `OrigamConfirmWrapper` guards equivalently by hand with
// explicit `!== undefined` checks. ELEVEN other forwarders were unguarded.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, inject, ref } from 'vue'
import type { Component } from 'vue'

import { ORIGAM_DEFAULTS_KEY } from '@origam/consts'
import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/interfaces'

import OrigamSelectionControlGroup from '@origam/components/SelectionControl/OrigamSelectionControlGroup.vue'
import OrigamChipGroup from '@origam/components/Chip/OrigamChipGroup.vue'
import OrigamListGroup from '@origam/components/List/OrigamListGroup.vue'
import OrigamItemGroup from '@origam/components/ItemGroup/OrigamItemGroup.vue'
import OrigamRadioGroup from '@origam/components/Radio/OrigamRadioGroup.vue'
import OrigamTabs from '@origam/components/Tabs/OrigamTabs.vue'
import OrigamTabPanels from '@origam/components/Tabs/OrigamTabPanels.vue'
import OrigamExpansionPanels from '@origam/components/ExpansionPanel/OrigamExpansionPanels.vue'
import OrigamList from '@origam/components/List/OrigamList.vue'
import OrigamBreadcrumb from '@origam/components/Breadcrumb/OrigamBreadcrumb.vue'
import OrigamBottomNav from '@origam/components/BottomNav/OrigamBottomNav.vue'
import OrigamBtnGroup from '@origam/components/Btn/OrigamBtnGroup.vue'

type TEntry = Record<string, unknown> | undefined

/**
 * Mount `parent` (optionally with props) and capture the defaults entry that
 * its subtree sees for `childKey`. Rendering the probe in the default slot is
 * enough — every forwarder below wraps its slot in the provider.
 */
function childDefaults (parent: Component, childKey: string, props: Record<string, unknown> = {}): TEntry {
    let seen: TEntry
    const Probe = defineComponent({
        setup () {
            const d = inject(ORIGAM_DEFAULTS_KEY, ref({}))
            seen = (d.value as Record<string, TEntry>)?.[childKey]
            return () => h('i')
        }
    })

    mount(parent as never, {
        props: props as never,
        slots: { default: () => h(Probe) },
        global: { plugins: [createOrigam()] }
    })

    return seen
}

// [label, parent, childKey, forwarded prop names]
const FORWARDERS: Array<[string, Component, string, string[]]> = [
    ['OrigamSelectionControlGroup', OrigamSelectionControlGroup, 'origam-selection-control',
        ['density', 'color', 'type', 'disabled', 'readonly', 'error', 'multiple', 'name', 'ripple', 'falseIcon', 'trueIcon', 'valueComparator']],
    ['OrigamChipGroup', OrigamChipGroup, 'origam-chip', ['color', 'bgColor', 'active', 'hover']],
    ['OrigamListGroup', OrigamListGroup, 'origam-list-item', ['color', 'bgColor']],
    ['OrigamItemGroup', OrigamItemGroup, 'origam-item', ['selectedClass']],
    ['OrigamRadioGroup', OrigamRadioGroup, 'origam-radio', ['color', 'bgColor', 'density', 'size']],
    ['OrigamTabs', OrigamTabs, 'origam-tab', ['density', 'color', 'variant', 'fixed']],
    ['OrigamTabPanels', OrigamTabPanels, 'origam-tab-panel', ['transition']],
    ['OrigamExpansionPanels', OrigamExpansionPanels, 'origam-expansion-panel', ['density', 'color', 'bgColor', 'rounded', 'border']],
    ['OrigamList', OrigamList, 'origam-list-item', ['density', 'size', 'color', 'bgColor']],
    ['OrigamBreadcrumb', OrigamBreadcrumb, 'origam-breadcrumb-item', ['density', 'color', 'bgColor', 'hover', 'active', 'disabled']],
    ['OrigamBottomNav', OrigamBottomNav, 'origam-btn', ['density', 'color', 'bgColor', 'hover', 'active']],
    // Already guarded by #263 — kept in the table as a live reference so the
    // contract below is proven to be satisfiable, not merely aspirational.
    ['OrigamBtnGroup', OrigamBtnGroup, 'origam-btn', ['density', 'color', 'bgColor', 'hover', 'active', 'rounded', 'border']]
]

describe.each(FORWARDERS)(
    '%s — forwards no prop the consumer never passed',
    (_label, parent, childKey, forwarded) => {
        it('injects neither a coerced `false` nor an `undefined` for any forwarded prop', () => {
            const entry = childDefaults(parent, childKey) ?? {}

            // Any forwarded key that ended up in the map must carry a real
            // value that came from the theme baseline — never the `false`
            // Vue coerced from an unset boolean-typed prop, and never a bare
            // `undefined` that would erase an ancestor default via mergeDeep.
            const injected = forwarded.filter(k => k in entry && (entry[k] === false || entry[k] === undefined))

            expect(injected, `injected junk: ${injected.map(k => `${k}=${String(entry[k])}`).join(', ')}`).toEqual([])
        })
    }
)

// ---------------------------------------------------------------------------
// The user-visible consequence, on a real theme default
// ---------------------------------------------------------------------------
// The DS baseline theme ships `'origam-chip': { color: 'primary', … }`.
// Pre-fix, wrapping chips in an `<origam-chip-group>` forwarded the group's
// own unset `color` as the coerced `false`, which won the mergeDeep and
// erased `primary` — chips inside a group lost their themed colour for no
// reason the consumer could see.

describe('OrigamChipGroup — does not erase the theme chip colour', () => {
    it('preserves the ancestor `origam-chip` colour when the group sets none', () => {
        const themed: IOrigamTheme = {
            name: 'probe',
            mode: 'light',
            components: { 'origam-chip': { color: 'success' } },
            vars: {}
        }

        let seen: TEntry
        const Probe = defineComponent({
            setup () {
                const d = inject(ORIGAM_DEFAULTS_KEY, ref({}))
                seen = (d.value as Record<string, TEntry>)?.['origam-chip']
                return () => h('i')
            }
        })

        const origam = createOrigam({ themes: [themed] })
        origam._defaultsRef.value = origam._activeDefaultsFor('probe', 'light')

        mount(OrigamChipGroup as never, {
            slots: { default: () => h(Probe) },
            global: { plugins: [origam] }
        })

        expect(seen?.color).toBe('success')
    })

    it('still forwards an EXPLICIT colour set on the group', () => {
        const entry = childDefaults(OrigamChipGroup, 'origam-chip', { color: 'warning' })

        expect(entry?.color).toBe('warning')
    })

    it('still forwards an EXPLICIT `false` set on the group', () => {
        const entry = childDefaults(OrigamChipGroup, 'origam-chip', { color: false })

        expect(entry?.color).toBe(false)
    })
})
