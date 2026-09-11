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

import {
    TOKEN_GROUP_CHILD,
    TOKEN_GROUP_STATE,
    tokenPathToCssVar,
    tokenPathToCssVarName
} from '@origam/utils/Commons/token-name.util'

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
 * FIXED by the reserved marker groups `$child` / `$state` (decision of
 * 2026-08-27, form B). A source declares its intent instead of hoping the
 * guesser lands right; a path carrying NO marker still goes through the
 * legacy heuristic, byte for byte. That opt-in property is what makes the
 * change auditable, and it is pinned below.
 *
 * MEASURED on the whole catalogue, before → after, by resolving every leaf
 * path under both grammars and cross-checking against what the DS actually
 * READS (findVarReads over packages/ds/src):
 *
 *   2955  component token paths in tokens/component/*.json
 *   2815    name UNCHANGED byte for byte
 *    140    name changed, of which:
 *      126      dead before → wired after   (the repair)
 *       14      dead before → dead after    (collateral: a never-read
 *               sibling that moved with the key it lives under)
 *        0      wired before → dead after   (no regression)
 *
 * Two regressions DID exist mid-flight and this control is what caught them:
 * `file-field.dropzone.error.*` was resolved correctly by the heuristic (via
 * TOKEN_INTENT_STATES) and my first marker pass knocked it out, because once
 * a path carries any marker EVERY child / state on it must be marked. That
 * constraint is pinned by the last case in this block.
 *
 * On the emitted sheets the same change reads as 121 in / 121 out with 2664
 * names untouched, identical in light.css, dark.css, _light.scss, _dark.scss.
 * The remaining 19 changes are real but invisible: `calendar` and `chart` are
 * in no theme's selectedTokenSets, so nothing is emitted for them at all.
 * That is #436-A, a different correction (wire the file up, rather than
 * rename what it emits) — the marked sources here start producing output the
 * day it lands, and not before.
 *
 * ⛔ The earlier breakdown in this header (70 / 7 / 13 / 82) was not wrong,
 * it was PARTIAL: it enumerated only two of the six directions a path can be
 * misgrouped in (flat→child, flat→state), and missed nested child, state
 * under a child, child→state and state→child. 70 + 7 = 77 is the figure the
 * ticket carried; the full population is 126.
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
     * THE OPT-IN PROPERTY — an UNMARKED path is still resolved by the
     * heuristic, wrong answer included.
     *
     * @description
     * This is not an oversight, it is the whole reason the change is safe:
     * `$child` / `$state` override, they do not migrate. 2815 of 2955 paths
     * carry no marker and keep their name byte for byte. If a future
     * "cleanup" makes the marker implicit — every hyphenated segment a child,
     * say — this case goes red first, and so do the five flat properties
     * above it.
     ********************************************************/
    it('leaves an UNMARKED hyphenated segment on the flat branch', () => {
        expect(tokenPathToCssVarName(['table', 'header-cell', 'background-color'], true))
            .toBe('origam-table---header-cell-background-color')
    })

    /*********************************************************
     * GREEN — the 126 repairs, one case per direction.
     *
     * @description
     * `OrigamTable.vue` reads `--origam-table__header-cell---background-color`
     * and `OrigamTable.md` documents it as the override token. Before the
     * marker the pipeline emitted `--origam-table---header-cell-background-
     * color`, so the two names never met and the token was unreachable in
     * every theme.
     ********************************************************/
    it('$child resolves a hyphenated BEM child to the __ form components read', () => {
        expect(tokenPathToCssVarName(['table', TOKEN_GROUP_CHILD, 'header-cell', 'background-color'], true))
            .toBe('origam-table__header-cell---background-color')
    })

    /*********************************************************
     * `variant-solo` is a VARIANT of the field, not a child element, and it
     * is read as `--origam-field--variant-solo---box-shadow`. It could never
     * have been rescued by TOKEN_INTENT_STATES: that set holds GLOBAL intents
     * (primary, hover, danger…) and these variants are component-local by
     * definition, so the set would have had to grow without bound.
     ********************************************************/
    it('$state resolves a component-local variant to the -- form', () => {
        expect(tokenPathToCssVarName(['field', TOKEN_GROUP_STATE, 'variant-solo', 'box-shadow'], true))
            .toBe('origam-field--variant-solo---box-shadow')
    })

    /*********************************************************
     * Two-level nesting — the case the single-`__` heuristic could not
     * express AT ALL, in either direction.
     *
     * @description
     * `OrigamCalendar.vue:1346` reads
     * `--origam-calendar__timeline__hour-label---width`. No relaxation of
     * `isBemChildKey` produces two `__` separators, which is why this case
     * alone disqualified every "better predicate" proposal.
     ********************************************************/
    it('$child nests, producing a two-level child', () => {
        expect(tokenPathToCssVarName(
            ['calendar', TOKEN_GROUP_CHILD, 'timeline', TOKEN_GROUP_CHILD, 'hour-label', 'width'], true
        )).toBe('origam-calendar__timeline__hour-label---width')
    })

    it('$state nests under $child — state of a child element', () => {
        expect(tokenPathToCssVarName(
            ['file-field', TOKEN_GROUP_CHILD, 'dropzone', TOKEN_GROUP_STATE, 'dragging', 'border-color'], true
        )).toBe('origam-file-field__dropzone--dragging---border-color')
    })

    /*********************************************************
     * ⛔ THE CONSTRAINT THAT COST TWO REGRESSIONS.
     *
     * @description
     * Once a path carries a marker it is resolved ENTIRELY by the marker
     * branch — the heuristic no longer runs on any of its segments. So a
     * state the heuristic used to catch for free (`error`, a member of
     * TOKEN_INTENT_STATES) silently collapses into the property name unless
     * it is marked too. That is exactly what happened to
     * `file-field.dropzone.error.*`, and only the before/after read
     * cross-check surfaced it — the build stayed green and the count of
     * moved lines still looked plausible.
     ********************************************************/
    it('a marker DISABLES the heuristic for the rest of the path', () => {
        expect(tokenPathToCssVarName(['file-field', TOKEN_GROUP_CHILD, 'dropzone', 'error', 'fg'], true))
            .toBe('origam-file-field__dropzone---error-fg')
        expect(tokenPathToCssVarName(
            ['file-field', TOKEN_GROUP_CHILD, 'dropzone', TOKEN_GROUP_STATE, 'error', 'fg'], true
        )).toBe('origam-file-field__dropzone--error---fg')
    })

    /** The build-time core must agree on the marked forms too. */
    it('build-time core resolves the markers identically', () => {
        expect(coreName(['table', TOKEN_GROUP_CHILD, 'header-cell', 'background-color'], true))
            .toBe('origam-table__header-cell---background-color')
        expect(coreName(['field', TOKEN_GROUP_STATE, 'variant-solo', 'box-shadow'], true))
            .toBe('origam-field--variant-solo---box-shadow')
    })

    /*********************************************************
     * Markers are COMPONENT-only. Primitive / semantic paths resolve by
     * length and must ignore them — nothing in tokens/primitive.json or
     * tokens/semantic/* carries one, and the emitted primitive sheet did not
     * move by a single byte.
     ********************************************************/
    it('ignores the marker outside a component source', () => {
        expect(tokenPathToCssVarName(['color', 'neutral', '500'], false))
            .toBe('origam-color__neutral---500')
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
