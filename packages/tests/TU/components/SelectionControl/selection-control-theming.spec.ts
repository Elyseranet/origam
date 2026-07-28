// Unit tests for <OrigamSelectionControl> — issue #241 + #247 fixes.
//
// #241 — `border`/`rounded`/`elevation` were declared on
// `ISelectionControlProps` (inherited by `ICheckboxBtnProps` /
// `IRadioBtnProps`) but nothing downstream ever called `useBorder` /
// `useRounded` / `useElevation` on them. A theme's
// `'origam-checkbox': { rounded: 'md' }` was a silent no-op. This spec
// locks in the fix at its source — `OrigamSelectionControl` is the
// component that owns `.origam-selection-control__input`, the state-layer
// box behind the Checkbox/Radio glyph (same "box owns the surface"
// pattern as `OrigamSwitchTrack`).
//
// IMPORTANT — documented limitation kept from the original diagnostic:
// the checkbox/radio glyph itself (`mdi-checkbox-*` / `mdi-radiobox-*`,
// rendered by `<origam-icon>` as an icon-font character) has no
// border-radius / border / box-shadow of its own. These props are
// proven below to reach a real DOM box with real computed styles — they
// do NOT reshape the glyph's silhouette. That remains a separate
// rendering-mechanism question (glyph vs drawn box), explicitly out of
// scope for this wiring fix (see issue #241's "aggravating factor").
//
// #247 — `.origam-selection-control` set `grid-area: control`
// unconditionally, assuming it always sits inside `OrigamInput`'s named
// grid. Used standalone (e.g. `OrigamRadioBtn` directly in an unrelated
// CSS grid, as `ThemeBuilderColorPicker` does), every control collapsed
// onto the same unresolved "control" cell. The rule is now scoped to
// `.origam-input &` so it only fires inside the real Field/Input grid.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamSelectionControl from '@origam/components/SelectionControl/OrigamSelectionControl.vue'
import { createOrigam } from '@origam/origam'

function mountControl (props: Record<string, unknown> = {}) {
    return mount(OrigamSelectionControl, {
        attachTo: document.body,
        global: { plugins: [createOrigam()] },
        props: { value: 'a', ...props }
    })
}

describe('OrigamSelectionControl — border prop is consumed on the state-layer box (#241)', () => {
    it('border=true emits the origam--border-thin utility class on __input', () => {
        const wrapper = mountControl({ border: true })
        const input = wrapper.find('.origam-selection-control__input')
        expect(input.classes()).toContain('origam--border-thin')
    })

    it('no border class on __input when border is unset', () => {
        const wrapper = mountControl()
        const input = wrapper.find('.origam-selection-control__input')
        expect(input.classes().some(c => c.startsWith('origam--border'))).toBe(false)
    })

    it('borderColor is forwarded to __input\'s inline style', () => {
        const wrapper = mountControl({ border: true, borderColor: 'red' })
        const input = wrapper.find('.origam-selection-control__input')
        expect(input.attributes('style') || '').toContain('border-color: red')
    })
})

describe('OrigamSelectionControl — rounded prop is consumed on the state-layer box (#241)', () => {
    it('rounded="lg" emits the origam--rounded-lg utility class on __input', () => {
        const wrapper = mountControl({ rounded: 'lg' })
        const input = wrapper.find('.origam-selection-control__input')
        expect(input.classes()).toContain('origam--rounded-lg')
    })

    it('rounded="lg" emits an inline border-radius on __input (wins over the hardcoded 50% circle)', () => {
        const wrapper = mountControl({ rounded: 'lg' })
        const input = wrapper.find('.origam-selection-control__input')
        expect(input.attributes('style') || '').toContain('border-radius: var(--origam-radius---lg, 12px)')
    })

    it('no rounded utility class on __input when rounded is unset (keeps the default circular hit-box)', () => {
        const wrapper = mountControl()
        const input = wrapper.find('.origam-selection-control__input')
        expect(input.classes().some(c => c.startsWith('origam--rounded-'))).toBe(false)
    })

    it('does NOT reshape the checkbox/radio glyph itself — the icon carries no border-radius (documented rendering limitation)', () => {
        const wrapper = mountControl({ rounded: 'lg', trueIcon: 'mdi-checkbox-marked', falseIcon: 'mdi-checkbox-blank-outline' })
        const icon = wrapper.find('.origam-icon')
        expect(icon.exists()).toBe(true)
        expect(icon.attributes('style') || '').not.toContain('border-radius')
        expect(icon.classes().some(c => c.startsWith('origam--rounded-'))).toBe(false)
    })
})

describe('OrigamSelectionControl — elevation prop is consumed on the state-layer box (#241)', () => {
    it('elevation="md" emits the origam--shadow-md utility class on __input', () => {
        const wrapper = mountControl({ elevation: 'md' })
        const input = wrapper.find('.origam-selection-control__input')
        expect(input.classes()).toContain('origam--shadow-md')
    })

    it('elevation="md" emits an inline box-shadow declaration on __input', () => {
        const wrapper = mountControl({ elevation: 'md' })
        const input = wrapper.find('.origam-selection-control__input')
        expect(input.attributes('style') || '').toContain('box-shadow: var(--origam-shadow---md)')
    })

    it('no elevation class/style on __input when elevation is unset', () => {
        const wrapper = mountControl()
        const input = wrapper.find('.origam-selection-control__input')
        expect(input.classes().some(c => c.startsWith('origam--shadow'))).toBe(false)
        expect(input.attributes('style') || '').not.toContain('box-shadow')
    })
})

describe('OrigamSelectionControl — combined theme-like surface (border + rounded + elevation together, #241)', () => {
    it('all three apply simultaneously without clobbering each other', () => {
        const wrapper = mountControl({ border: true, rounded: 'lg', elevation: 'md' })
        const input = wrapper.find('.origam-selection-control__input')
        const style = input.attributes('style') || ''
        expect(input.classes()).toContain('origam--border-thin')
        expect(input.classes()).toContain('origam--rounded-lg')
        expect(input.classes()).toContain('origam--shadow-md')
        expect(style).toContain('border-radius')
        expect(style).toContain('box-shadow')
    })
})

describe('OrigamSelectionControl — grid-area is context-scoped, not unconditional (#247)', () => {
    it('does NOT declare grid-area on the root class selector unconditionally (source-level guard against regression)', async () => {
        // `jsdom`'s CSS engine cannot be trusted to resolve `grid-area`
        // through Vue's scoped-attribute descendant selector reliably —
        // this asserts the actual shipped rule shape instead of computed
        // style, so the regression this ticket fixes (bare
        // `.origam-selection-control { grid-area: control }`, no
        // ancestor guard) cannot silently come back.
        const fs = await import('node:fs')
        const path = await import('node:path')
        const src = fs.readFileSync(
            path.resolve(__dirname, '../../../../ds/src/components/SelectionControl/OrigamSelectionControl.vue'),
            'utf-8'
        )
        const styleBlock = src.slice(src.indexOf('<style'))
        // The original bug: `grid-area: control` sat directly in the root
        // rule's own declaration list (right after `flex: 1 0;`), applying
        // unconditionally regardless of ancestor.
        expect(styleBlock).not.toMatch(/flex:\s*1 0;\s*grid-area:\s*control/)
        // The fix: the declaration is GONE, not merely scoped. Root cause,
        // verified in OrigamInput.vue:344-347 — `.origam-input__control`
        // already owns `grid-area: control` AND is `display: flex`. A
        // `grid-area` on a flex child has no effect, so this declaration was
        // dead code on the Field/Input path and only ever caused harm outside
        // it (every control collapsing onto one cell of a consumer's grid).
        // Scoping it under `.origam-input &` would have preserved an inert
        // rule that a future reader would believe is load-bearing.
        expect((styleBlock.match(/grid-area:\s*control/g) || [])).toHaveLength(0)
    })

    it('renders with no ancestor .origam-input in the DOM when used standalone (e.g. a plain CSS grid, as ThemeBuilderColorPicker does)', () => {
        const wrapper = mountControl()
        expect(wrapper.element.closest('.origam-input')).toBeNull()
    })
})

describe('OrigamSelectionControl — le halo suit `rounded` (#241)', () => {
    it('déclare `border-radius: inherit` sur le :before, jamais une valeur en dur', async () => {
        const fs = await import('node:fs')
        const path = await import('node:path')
        const src = fs.readFileSync(
            path.resolve(process.cwd(), '../ds/src/components/SelectionControl/OrigamSelectionControl.vue'),
            'utf-8'
        )
        const styleBlock = src.slice(src.indexOf('<style'))
        const beforeBlock = styleBlock.slice(styleBlock.indexOf('&:before'))

        // Le halo était codé `border-radius: 100%`, donc circulaire même sous
        // `rounded="md"`. C'était la SEULE surface que la prop pouvait peindre
        // au repos, et elle l'ignorait. `inherit` reprend le rayon résolu par
        // `useRounded` sur `__input`.
        expect(beforeBlock).toMatch(/border-radius:\s*inherit/)
        expect(beforeBlock.slice(0, 400)).not.toMatch(/border-radius:\s*100%/)
    })
})
