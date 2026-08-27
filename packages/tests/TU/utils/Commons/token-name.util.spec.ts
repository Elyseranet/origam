// Tests for the shared token-path → CSS-variable naming util.
//
// Two responsibilities:
//   1. Assert the naming grammar produces the documented `--origam-*` names.
//   2. PARITY GUARD — the TS runtime util (`token-name.util.ts`) and the
//      build-time core (`scripts/token-name.mjs`) implement the same
//      algorithm by hand (the build script is plain Node `.mjs` and cannot
//      import from the published `src/**.ts`). This test imports BOTH and
//      asserts they agree across a representative path matrix, so the names
//      baked into the published CSS sheets never drift from the names a
//      runtime-injected or exported theme emits.

import { describe, expect, it } from 'vitest'

import { tokenPathToCssVar, tokenPathToCssVarName } from '@origam/utils/Commons/token-name.util'

// Build-time core lives outside src/ — import via relative path.
import {
    tokenPathToCssVarName as coreName,
    tokenPathToCssVar as coreVar
} from '../../../../ds/scripts/token-name.mjs'

describe('tokenPathToCssVarName — primitive / semantic grammar', () => {
    it('2-segment primitive → block---prop', () => {
        expect(tokenPathToCssVarName(['color', 'black'], false)).toBe('origam-color---black')
        expect(tokenPathToCssVarName(['space', '4'], false)).toBe('origam-space---4')
        expect(tokenPathToCssVarName(['radius', 'md'], false)).toBe('origam-radius---md')
    })

    it('3-segment → block__child---prop', () => {
        expect(tokenPathToCssVarName(['color', 'neutral', '500'], false)).toBe('origam-color__neutral---500')
        expect(tokenPathToCssVarName(['color', 'surface', 'default'], false)).toBe('origam-color__surface---default')
        expect(tokenPathToCssVarName(['font', 'size', 'sm'], false)).toBe('origam-font__size---sm')
    })

    it('4-segment semantic with modifier → block__child--mod---prop', () => {
        expect(tokenPathToCssVarName(['color', 'action', 'primary', 'bg'], false)).toBe('origam-color__action--primary---bg')
        expect(tokenPathToCssVarName(['color', 'feedback', 'warning', 'fgSubtle'], false)).toBe('origam-color__feedback--warning---fgSubtle')
    })
})

describe('tokenPathToCssVarName — component grammar', () => {
    it('bare component name', () => {
        expect(tokenPathToCssVarName(['btn'], true)).toBe('origam-btn')
    })

    it('component property', () => {
        expect(tokenPathToCssVarName(['btn', 'background-color'], true)).toBe('origam-btn---background-color')
    })

    it('component intent state', () => {
        expect(tokenPathToCssVarName(['btn', 'primary', 'background-color'], true)).toBe('origam-btn--primary---background-color')
    })

    it('component BEM child', () => {
        expect(tokenPathToCssVarName(['card', 'overlay', 'background-color'], true)).toBe('origam-card__overlay---background-color')
    })

    it('component BEM child with nested state', () => {
        expect(tokenPathToCssVarName(['card', 'overlay', 'hover', 'opacity'], true)).toBe('origam-card__overlay--hover---opacity')
    })
})

describe('tokenPathToCssVar — full custom-property reference', () => {
    it('prefixes with --', () => {
        expect(tokenPathToCssVar(['color', 'neutral', '500'], false)).toBe('--origam-color__neutral---500')
        expect(tokenPathToCssVar(['btn', 'primary', 'background-color'], true)).toBe('--origam-btn--primary---background-color')
    })
})

describe('PARITY — TS util vs build-time .mjs core', () => {
    const matrix: Array<{ path: string[], component: boolean }> = [
        { path: ['color', 'black'], component: false },
        { path: ['color', 'neutral', '500'], component: false },
        { path: ['color', 'surface', 'default'], component: false },
        { path: ['color', 'action', 'primary', 'bg'], component: false },
        { path: ['color', 'feedback', 'warning', 'fgSubtle'], component: false },
        { path: ['space', '4'], component: false },
        { path: ['radius', 'md'], component: false },
        { path: ['shadow', 'sm'], component: false },
        { path: ['border', 'width', 'thin'], component: false },
        { path: ['font', 'size', 'sm'], component: false },
        { path: ['color', 'a', 'b', 'c', 'd'], component: false },
        { path: ['btn'], component: true },
        { path: ['btn', 'background-color'], component: true },
        { path: ['btn', 'primary', 'background-color'], component: true },
        { path: ['btn', 'success', 'fg'], component: true },
        { path: ['card', 'overlay', 'background-color'], component: true },
        { path: ['card', 'overlay', 'hover', 'opacity'], component: true },
        { path: ['alert', 'icon', 'color'], component: true }
    ]

    it.each(matrix)('matches for $path (component=$component)', ({ path, component }) => {
        expect(tokenPathToCssVarName(path, component)).toBe(coreName(path, component))
        expect(tokenPathToCssVar(path, component)).toBe(coreVar(path, component))
    })
})

/*********************************************************
 * #435 — the child / state / property distinction is UNDECIDABLE
 *        from the key string alone
 *
 * `isBemChildKey` decides "is this segment a BEM child or part of a
 * property name?" with:
 *
 *     /^[a-zA-Z]+$/.test(key) && !key.includes('-')
 *
 * i.e. "does it contain a hyphen". Its own docstring gives the game away:
 * "Property keys TYPICALLY contain hyphens". Typically is not always:
 *
 *     header-cell      → BEM child      WITH a hyphen
 *     background-color → property       WITH a hyphen
 *     variant-solo     → component variant, WITH a hyphen
 *
 * The three are lexically identical. No regex separates them, which is why
 * the audit found "0 functional" — not a missed case, an undecidable one.
 *
 * MEASURED on origin/develop @ 1e4132d5. Coverage control: the three
 * sub-populations re-sum to the raw total, so they are exhaustive and
 * disjoint — 1548 + 172 + 132 = 1852. Without that check the first pass
 * reported 1680 (it forgot to exclude the known states).
 *
 *   2949  component token paths in tokens/component/*.json
 *   1852  of them have >= 3 segments, splitting into:
 *   1548    2nd segment hyphen-free → already on the BEM branch, UNAFFECTED
 *    172    2nd segment HAS a hyphen → the whole blast radius of #435
 *    132    2nd segment is a known intent state (TOKEN_INTENT_STATES)
 *
 * Of those 172, classified by what components actually READ (not by shape):
 *
 *     70  read as `__child---prop`  → genuinely broken, this is #435
 *      7  read as `--variant---prop`→ want a STATE name, not a child
 *     13  read as `---child-prop`   → the CURRENT flat name is correct
 *     82  read nowhere              → dormant (see #501 / #503)
 *
 * So relaxing the predicate wholesale repairs 70 and BREAKS 20. The cases
 * below pin all three shapes so that any future fix has to satisfy them
 * simultaneously.
 *
 * ⛔ SCOPE — `calendar` and `chart` are listed in #435's own table but are
 * NOT in this scope: their token file exists yet is not registered in
 * $themes.json, so nothing is emitted for them at all. Fixing this transform
 * will never make them reachable; that is #436-A, a different correction
 * (wire the file up, rather than rename what it emits).
 ********************************************************/
describe('#435 — hyphenated segments: child vs state vs split property', () => {
    /*********************************************************
     * GREEN today, and MUST STAY GREEN.
     *
     * @description
     * These are the 13 paths whose flat name is the one components read.
     * A blanket "treat every hyphenated segment as a BEM child" would
     * rename them and silently break rendering — this block is the
     * anti-regression that makes such a fix go red.
     ********************************************************/
    it.each([
        [['label', 'required-indicator', 'color'], 'origam-label---required-indicator-color'],
        [['field', 'focus-ring', 'width'], 'origam-field---focus-ring-width'],
        [['code', 'line-number', 'padding-right'], 'origam-code---line-number-padding-right'],
        [['video', 'poster-btn', 'background-color'], 'origam-video---poster-btn-background-color'],
        [['blockquote', 'quote-mark', 'color'], 'origam-blockquote---quote-mark-color']
    ])('keeps the flat name for split properties: %j', (path, expected) => {
        expect(tokenPathToCssVarName(path as Array<string>, true)).toBe(expected)
    })

    /** GREEN today — hyphen-free child and known intent state are unaffected. */
    it('still resolves a hyphen-free BEM child', () => {
        expect(tokenPathToCssVarName(['table', 'cell', 'border-color'], true))
            .toBe('origam-table__cell---border-color')
    })

    it('still resolves a known intent state', () => {
        expect(tokenPathToCssVarName(['btn', 'hover', 'background-color'], true))
            .toBe('origam-btn--hover---background-color')
    })

    /*********************************************************
     * RED — the 70 hyphenated BEM children.
     *
     * @description
     * `OrigamTable.vue` reads `--origam-table__header-cell---background-color`
     * and `OrigamTable.md` documents it as the override token. The pipeline
     * emits `--origam-table---header-cell-background-color`. The two names
     * never meet, so the token is unreachable in every theme.
     ********************************************************/
    it.fails('resolves a hyphenated BEM child to the __ form the component reads', () => {
        expect(tokenPathToCssVarName(['table', 'header-cell', 'background-color'], true))
            .toBe('origam-table__header-cell---background-color')
    })

    /*********************************************************
     * RED — the 7 component-local variants.
     *
     * @description
     * `variant-solo` is a VARIANT of the field, not a child element, and it
     * is read as `--origam-field--variant-solo---box-shadow`. It cannot be
     * rescued by TOKEN_INTENT_STATES: that set holds GLOBAL intents
     * (primary, hover, danger…), and these variants are component-local by
     * definition. This case is why the fix cannot be "add them to the set"
     * either — the set would have to grow without bound.
     ********************************************************/
    it.fails('resolves a component-local variant to the -- state form', () => {
        expect(tokenPathToCssVarName(['field', 'variant-solo', 'box-shadow'], true))
            .toBe('origam-field--variant-solo---box-shadow')
    })

    /** The build-time core must fail identically — the defect is shared. */
    it.fails('build-time core exhibits the same defect (parity holds on the bug too)', () => {
        expect(coreName(['table', 'header-cell', 'background-color'], true))
            .toBe('origam-table__header-cell---background-color')
    })

    /*********************************************************
     * RED — the 4th mechanism, and it runs the OTHER way (#505).
     *
     * @description
     * `track` is a bare word, so isBemChildKey returns TRUE and the
     * pipeline emits the BEM form. But it is not a child element here — it
     * is the first word of a compound PROPERTY name, and the component
     * reads it flat:
     *
     *     emitted  --origam-media-scrubber__track---thickness
     *     read     --origam-media-scrubber---track-thickness
     *
     * ⛔ Relaxing isBemChildKey can only let paths INTO the BEM branch,
     * never out of it — these 12 are already inside. The #435 fix leaves
     * them strictly unchanged, which is exactly why they need their own
     * ticket rather than being folded into its count.
     ********************************************************/
    it.fails('emits the flat name for a split property that only looks like a child (#505)', () => {
        expect(tokenPathToCssVarName(['media-scrubber', 'track', 'thickness'], true))
            .toBe('origam-media-scrubber---track-thickness')
    })
})
