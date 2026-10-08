// Pins the #1050 fix: splitting the single `IVariantProps` mixin into
// `IActionVariantProps` (Btn family, 7 values) / `IInputVariantProps` (Field
// family, 5 values) so each component's RESOLVED `variant` prop union only
// names the vocabulary it actually renders.
//
// ⛔ This measures the RESOLVED artefact, not the source text — the repo's
// own `CLAUDE.md` warns at length that a `grep` for a type name or an
// `Omit` cannot answer "what does this prop actually accept", because the
// restriction can live behind an alias, an `extends` chain, or (as here) a
// renamed interface. `extractLiteralUnions` runs the real `vue-component-meta`
// checker (the same one `pnpm -F @origam/playground meta:unions` uses) over
// the live `.vue` SFCs and reads back the UNION MEMBERS TypeScript itself
// resolved for the `variant` prop — immune to which interface declares it or
// which file it lives in.
//
// A/B against the parent commit (measured by hand, see PR description):
//   OrigamBtn.props.variant.options.length   10 (pre-fix) -> 7 (post-fix)
//   OrigamField.props.variant.options.length 10 (pre-fix) -> 5 (post-fix)
// Before the split, `IVariantProps` accepted `TVariant | TVariantInput` (7 +
// 5, with `outlined`/`plain` double-counted away — 10 distinct strings), so
// BOTH families silently accepted the other's vocabulary. A green run of
// this spec against the pre-fix tree would read 10/10 — that is the
// regression this spec exists to catch.

import { describe, expect, it } from 'vitest'

import { extractLiteralUnions } from '../../../playground/scripts/extract-literal-unions.mjs'

describe('variant literal union — resolved prop type per family (#1050)', () => {
    // vue-component-meta runs a real TS program over the SFCs — slow by the
    // standard of this suite's other specs (~2s measured locally).
    it('OrigamBtn.variant resolves to exactly the 7 VARIANT (action) values', () => {
        const { components } = extractLiteralUnions({ only: new Set(['OrigamBtn']) })
        const btn = components.find(c => c.name === 'OrigamBtn')

        expect(btn?.usable).toBe(true)

        const variant = btn?.props.variant

        expect(variant).toBeTruthy()
        expect(variant.options).toHaveLength(7)
        expect(new Set(variant.options)).toEqual(new Set([
            'text', 'flat', 'elevated', 'tonal', 'outlined', 'plain', 'ghost'
        ]))

        // The input-only vocabulary must NOT leak in.
        for (const inputOnly of ['underlined', 'filled', 'solo']) {
            expect(variant.options).not.toContain(inputOnly)
        }
    }, 30_000)

    it('OrigamField.variant resolves to exactly the 5 VARIANT_INPUT (input) values', () => {
        const { components } = extractLiteralUnions({ only: new Set(['OrigamField']) })
        const field = components.find(c => c.name === 'OrigamField')

        expect(field?.usable).toBe(true)

        const variant = field?.props.variant

        expect(variant).toBeTruthy()
        expect(variant.options).toHaveLength(5)
        expect(new Set(variant.options)).toEqual(new Set([
            'underlined', 'filled', 'solo', 'outlined', 'plain'
        ]))

        // The action-only vocabulary must NOT leak in.
        for (const actionOnly of ['text', 'flat', 'elevated', 'tonal', 'ghost']) {
            expect(variant.options).not.toContain(actionOnly)
        }
    }, 30_000)
})
