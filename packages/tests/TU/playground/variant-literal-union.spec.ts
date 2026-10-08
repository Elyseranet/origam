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

import { beforeAll, describe, expect, it } from 'vitest'

import { extractLiteralUnions } from '../../../playground/scripts/extract-literal-unions.mjs'

describe('variant literal union — resolved prop type per family (#1050)', () => {
    // vue-component-meta runs a real TS program over the SFCs — slow by the
    // standard of this suite's other specs (~2s measured locally, in
    // isolation). Two traps, both measured rather than assumed:
    //
    // 1. `extractLiteralUnions()` calls `createChecker()`
    //    (extract-literal-unions.mjs:90), which rebuilds the WHOLE
    //    `packages/ds/tsconfig.json` TS program FROM SCRATCH on every
    //    call. The original version of this spec called it once per `it()`
    //    (OrigamBtn, then OrigamField) — paying that full program-build cost
    //    TWICE for no reason, since one checker can answer both. Fixed here
    //    by calling it ONCE in `beforeAll`, for both components at once.
    // 2. That is still a CPU-heavy, real-TypeScript-program operation, and
    //    this suite runs 579 files across many parallel Vitest workers —
    //    under CI contention this one file was measured at 54.6s total on
    //    the Node 22 CI job (one test hit the old 30_000ms timeout and
    //    failed: run 37772347653, job "Unit tests (Vitest, Node 22)") and
    //    36.0s on the SAME run's Node 24 job (passed, with almost no margin
    //    left under a 30_000ms-per-test budget). In isolation (no sibling
    //    files competing for CPU) the same two tests take 3.73s — so the gap
    //    is CI worker-pool contention, not a Node-version difference and not
    //    a product defect. `beforeAll`'s timeout below is sized generously
    //    above the measured 54.6s/2-calls worst case for a SINGLE call.
    let components

    beforeAll(() => {
        ({ components } = extractLiteralUnions({ only: new Set(['OrigamBtn', 'OrigamField']) }))
    }, 90_000)

    it('OrigamBtn.variant resolves to exactly the 7 VARIANT (action) values', () => {
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
    })

    it('OrigamField.variant resolves to exactly the 5 VARIANT_INPUT (input) values', () => {
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
    })
})
