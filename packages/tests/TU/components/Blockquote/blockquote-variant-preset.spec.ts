// Unit tests for `BLOCKQUOTE_VARIANT_PRESETS` (ADR-005 ticket #25) as
// consumed by <OrigamBlockquote> via `useDefaults`.
//
// The generic tier-resolution MECHANISM (call-site prop > theme default >
// variant preset > component default, `usePassedProps` edge cases, state
// presets, theme `variants` override) is already exhaustively covered at
// the composable level in
// `packages/tests/TU/composables/Commons/defaults.composable.spec.ts`
// ("useDefaults — variant preset tier"). These tests are narrower: do the
// SPECIFIC values in `BLOCKQUOTE_VARIANT_PRESETS` land correctly on the
// real component, and does an explicit call-site prop still beat them.
//
// Blockquote binds its resolved styles via a `:style` array on the root
// element (no `useStyle()` intermediary), so assertions read
// `.attributes('style')` / `.attributes('class')` — same pattern as
// `OrigamBlockquote.spec.ts`. jsdom does not run a real CSS cascade, so
// this is the reliable way to assert "what did the component compute",
// as opposed to `getComputedStyle` (exercised instead in
// `packages/tests/e2e/blockquote.spec.ts` against a real browser).

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { OrigamBlockquote } from '@origam/components'
import { createOrigam } from '@origam/origam'

function mountBq (props: Record<string, unknown> = {}) {
    return mount(OrigamBlockquote, {
        props: props as never,
        slots: { default: () => 'Talk is cheap.' },
        global: { plugins: [createOrigam()] }
    })
}

function styleOf (props: Record<string, unknown> = {}): string {
    return mountBq(props).find('.origam-blockquote').attributes('style') ?? ''
}

function classOf (props: Record<string, unknown> = {}): string {
    return mountBq(props).find('.origam-blockquote').attributes('class') ?? ''
}

describe('BLOCKQUOTE_VARIANT_PRESETS — default', () => {
    it('presets a 4px inline-start border (accent bar width)', () => {
        const style = styleOf({ variant: 'default' })
        expect(style).toContain('border-inline-start-width: 4px')
        expect(style).toContain('border-inline-end-width: 0px')
    })

    it('presets asymmetric padding (inline-start gets the accent-width bump)', () => {
        const style = styleOf({ variant: 'default' })
        expect(style).toContain('padding-block-start: 16px')
        expect(style).toContain('padding-inline-start: 28px')
        expect(style).toContain('padding-block-end: 16px')
        expect(style).toContain('padding-inline-end: 24px')
    })

    it('presets no typography override (theme default drives font)', () => {
        const style = styleOf({ variant: 'default' })
        expect(style).not.toContain('--origam-blockquote---font-family')
        expect(style).not.toContain('--origam-blockquote---font-style')
    })

    it('is the withDefaults() fallback — omitting variant entirely resolves the same preset', () => {
        expect(styleOf({})).toBe(styleOf({ variant: 'default' }))
    })
})

describe('BLOCKQUOTE_VARIANT_PRESETS — elegant', () => {
    it('presets serif / italic / xl / loose typography', () => {
        const style = styleOf({ variant: 'elegant' })
        expect(style).toContain('--origam-blockquote---font-family: var(--origam-font__family---serif)')
        expect(style).toContain('--origam-blockquote---font-style: italic')
        expect(style).toContain('--origam-blockquote---font-size: var(--origam-font__size---xl)')
        expect(style).toContain('--origam-blockquote---line-height: var(--origam-font__lineHeight---loose)')
    })

    it('presets a 4px inline-start border and its own padding-block', () => {
        const style = styleOf({ variant: 'elegant' })
        expect(style).toContain('border-inline-start-width: 4px')
        expect(style).toContain('padding-block-start: 24px')
        expect(style).toContain('padding-block-end: 24px')
        expect(style).toContain('padding-inline-start: 28px')
    })
})

describe('BLOCKQUOTE_VARIANT_PRESETS — quoted', () => {
    it('presets extra top padding only, no border', () => {
        const style = styleOf({ variant: 'quoted' })
        expect(style).toContain('padding-block-start: 32px')
        expect(style).toContain('padding-block-end: 16px')
        expect(style).toContain('padding-inline-start: 24px')
        expect(style).not.toContain('border-inline-start-width')
    })

    it('applies the structural --has-quote-mark class (NOT a --variant- selector)', () => {
        const cls = classOf({ variant: 'quoted' })
        expect(cls).toMatch(/origam-blockquote--has-quote-mark/)
    })

    it('other variants do NOT get the --has-quote-mark class', () => {
        expect(classOf({ variant: 'default' })).not.toMatch(/origam-blockquote--has-quote-mark/)
        expect(classOf({ variant: 'elegant' })).not.toMatch(/origam-blockquote--has-quote-mark/)
    })
})

describe('BLOCKQUOTE_VARIANT_PRESETS — minimal', () => {
    it('presets md / italic typography and a 2px asymmetric border+padding', () => {
        const style = styleOf({ variant: 'minimal' })
        expect(style).toContain('--origam-blockquote---font-size: var(--origam-font__size---md)')
        expect(style).toContain('--origam-blockquote---font-style: italic')
        expect(style).toContain('border-inline-start-width: 2px')
        expect(style).toContain('padding-block-start: 0px')
        expect(style).toContain('padding-inline-start: 14px')
        expect(style).toContain('padding-inline-end: 12px')
    })
})

describe('BLOCKQUOTE_VARIANT_PRESETS — pull', () => {
    it('presets serif / 3xl / medium / snug typography', () => {
        const style = styleOf({ variant: 'pull' })
        expect(style).toContain('--origam-blockquote---font-family: var(--origam-font__family---serif)')
        expect(style).toContain('--origam-blockquote---font-size: var(--origam-font__size---3xl)')
        expect(style).toContain('--origam-blockquote---font-weight: var(--origam-font__weight---medium)')
        expect(style).toContain('--origam-blockquote---line-height: var(--origam-font__lineHeight---snug)')
    })

    it('presets a symmetric block-only border (top + bottom rules, no inline) via the 2-value shorthand', () => {
        // 2-value form: `formatBorderStylesVar` maps values[0] -> `border-
        // block-{type}` (BOTH top+bottom) and values[1] -> `border-inline-
        // {type}` (both left+right) — unlike the 4-value form used by the
        // other presets, which distributes to the four *-start/-end sides
        // individually.
        const style = styleOf({ variant: 'pull' })
        expect(style).toContain('border-block-width: 2px')
        expect(style).toContain('border-inline-width: 0px')
    })

    it('presets uniform 24px padding', () => {
        expect(styleOf({ variant: 'pull' })).toContain('padding: 24px')
    })
})

describe('BLOCKQUOTE_VARIANT_PRESETS — call-site prop beats the preset (ADR-005 Q2)', () => {
    it('an explicit border wins over the default preset border', () => {
        const style = styleOf({ variant: 'default', border: '0px 16px 0px 0px' })
        expect(style).toContain('border-inline-start-width: 16px')
        expect(style).not.toContain('border-inline-start-width: 4px')
    })

    it('an explicit padding wins over the elegant preset padding', () => {
        const style = styleOf({ variant: 'elegant', padding: '8px' })
        expect(style).toContain('padding: 8px')
        expect(style).not.toContain('padding-block-start: 24px')
    })

    it('an explicit fontFamily wins over the pull preset fontFamily — impossible pre-ADR-005', () => {
        const style = styleOf({ variant: 'pull', fontFamily: 'mono' })
        expect(style).toContain('--origam-blockquote---font-family: var(--origam-font__family---mono)')
        expect(style).not.toContain('var(--origam-font__family---serif)')
    })

    it('the accent-color axis is untouched by the preset — accentColor still wins regardless of variant', () => {
        const cls = classOf({ variant: 'elegant', accentColor: 'primary' })
        expect(cls).toMatch(/origam-blockquote--accent-primary/)
    })

    it('the --variant-{value} class still renders as an inert override hook', () => {
        expect(classOf({ variant: 'pull' })).toMatch(/origam-blockquote--variant-pull/)
    })
})
