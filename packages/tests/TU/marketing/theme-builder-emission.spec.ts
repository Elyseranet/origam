// Feature A — "— none —" = undefined on every control. The load-bearing
// guarantee is EMISSION: a prop the user leaves (or sets back to) "— none —"
// must NOT appear in the exported IOrigamTheme.component[X] — the DS component
// then keeps its own default (PROPS-FIRST). These specs pin `setProp`'s unset
// handling and the JSON/TS export omission, the pure core of the feature.
//
// `useThemeBuilder` pulls its catalog from `useThemeBuilderCatalog`, which
// itself calls Nuxt's `useFetch`. We mock the catalog (never the fetch) so the
// composable runs Nuxt-free with a fixed, known prop surface.
import { computed } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { THEME_BUILDER_UNSET_VALUE } from '~/consts/theme-builder-controls.const'

const stubEntries = computed(() => [
    {
        slug: 'btn',
        componentKey: 'origam-btn',
        componentTag: 'origam-btn',
        name: 'Button',
        icon: 'mdi-gesture-tap-button',
        category: 'general',
        controls: [
            { prop: 'variant', props: ['variant'], kind: 'select', group: 'color', label: 'Variant', defaultValue: 'elevated' },
            { prop: 'rounded', props: ['rounded'], kind: 'rounded', group: 'shape', label: 'Rounded', defaultValue: 'sm' },
            { prop: 'closable', props: ['closable'], kind: 'switch', group: 'state', label: 'Closable', defaultValue: true },
            { prop: 'block', props: ['block'], kind: 'switch', group: 'state', label: 'Block', defaultValue: false }
        ],
        propGroups: [],
        tokenGroups: [],
        tokens: [],
        previewAdapter: {},
        previewable: false
    }
])

vi.mock('~/composables/useThemeBuilderCatalog', () => ({
    useThemeBuilderCatalog: () => ({ entries: stubEntries, nav: computed(() => []) })
}))

// Imported AFTER the mock is registered (vi.mock is hoisted, but keep intent clear).
import { useThemeBuilder } from '~/composables/useThemeBuilder'

describe('theme-builder emission — "— none —" = undefined', () => {
    let tb: ReturnType<typeof useThemeBuilder>

    beforeEach(() => {
        tb = useThemeBuilder()
    })

    /** The `component` block of the light entry (or `{}` when none emitted). */
    const emittedComponent = () => tb.themeObjects.value[0]?.components ?? {}

    it('stores a real non-default value and emits it', () => {
        tb.setProp('btn', 'variant', 'outlined')
        expect(tb.isPropEdited('btn', 'variant')).toBe(true)
        expect(emittedComponent()).toEqual({ 'origam-btn': { variant: 'outlined' } })
        expect(tb.generatedJson.value).toContain('"variant": "outlined"')
    })

    it('UNSET sentinel removes the prop from the exported theme', () => {
        tb.setProp('btn', 'variant', 'outlined')
        tb.setProp('btn', 'variant', THEME_BUILDER_UNSET_VALUE)
        expect(tb.isPropEdited('btn', 'variant')).toBe(false)
        expect(emittedComponent()).toEqual({})
        expect(tb.generatedJson.value).not.toContain('variant')
        expect(tb.generatedJson.value).not.toContain('__unset__')
    })

    it('a bare undefined removes the prop (no stray `prop: undefined`)', () => {
        tb.setProp('btn', 'variant', 'text')
        tb.setProp('btn', 'variant', undefined)
        expect(emittedComponent()).toEqual({})
        // The TS export must never print a `variant: undefined` line.
        expect(tb.generatedCode.value).not.toContain('undefined')
    })

    it('unsetting a prop whose DS default is NOT undefined leaves no residue', () => {
        // `rounded` default is the string 'sm'; the pre-fix code stored a stray
        // `rounded: undefined` here because value !== default.
        tb.setProp('btn', 'rounded', '12px')
        tb.setProp('btn', 'rounded', THEME_BUILDER_UNSET_VALUE)
        expect(tb.isPropEdited('btn', 'rounded')).toBe(false)
        expect(emittedComponent()).toEqual({})
    })

    it('picking a value equal to the DS default is not stored (diff-only)', () => {
        tb.setProp('btn', 'variant', 'elevated') // == default
        expect(tb.isPropEdited('btn', 'variant')).toBe(false)
        expect(emittedComponent()).toEqual({})
    })

    it('tri-state: explicit `false` on a default-true boolean IS stored', () => {
        tb.setProp('btn', 'closable', false) // default is true → real override
        expect(tb.isPropEdited('btn', 'closable')).toBe(true)
        expect(emittedComponent()).toEqual({ 'origam-btn': { closable: false } })
    })

    it('tri-state: `false` on a default-false boolean collapses to unset', () => {
        tb.setProp('btn', 'block', false) // == default false → omitted
        expect(tb.isPropEdited('btn', 'block')).toBe(false)
        expect(emittedComponent()).toEqual({})
    })

    it('UNSET on one prop keeps the other edited props intact', () => {
        tb.setProp('btn', 'variant', 'text')
        tb.setProp('btn', 'closable', false)
        tb.setProp('btn', 'variant', THEME_BUILDER_UNSET_VALUE)
        expect(emittedComponent()).toEqual({ 'origam-btn': { closable: false } })
    })
})
