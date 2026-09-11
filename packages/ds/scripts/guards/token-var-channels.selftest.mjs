/**
 * Self-test for `token-var-channels.mjs`.
 *
 * A cross-reference guard looks trivially correct — "is this name in that
 * set" — which is exactly why it needs pinning on the shapes that actually
 * broke real components (#435): a paren-nested fallback
 * (`color-mix(in srgb, var(--bg), black 20%)`), a locally-synthesised "let"
 * variable that must NOT be flagged (Pagination's `--bg-base`, EmptyState's
 * `--origam-empty-state---resolved-*`), and the with-fallback / without-
 * fallback split that changes the human-readable classification but not the
 * verdict.
 *
 * MUST_FLAG pins recall: a genuinely dead channel must never slip through.
 * MUST_NOT_FLAG pins precision: a locally-synthesised var, an emitted var,
 * and a non-origam var must never be reported — a false positive here would
 * send someone hunting for a token that was never supposed to exist.
 *
 * The MUTATION section is the part a plain fixture list cannot prove: it
 * takes a stylesheet where everything currently resolves cleanly, renames
 * ONE emitted declaration — exactly the class of regression #435 was — and
 * asserts the guard's own analysis function flips a previously-silent read
 * into a violation. A selftest that only checks curated fixtures can pass
 * while the detector itself is inert (e.g. a regex that never matches
 * anything); the mutation proves the detector is actually sensitive to the
 * one failure mode this guard exists to catch.
 *
 * Run: node packages/ds/scripts/guards/token-var-channels.selftest.mjs
 */

import { findVarReads, findVarDeclarations } from './lib/css-var-scan.mjs'
import { analyseChannels, expandInterpolatedReads, propagateThroughTokenGraph, readNamesFromScriptSources } from './token-var-channels.mjs'

let failures = 0
const fail = (msg) => { console.log(`  FAIL  ${msg}`); failures++ }
const ok = (msg) => console.log(`  ok    ${msg}`)

console.log('─'.repeat(70))
console.log('Self-test: token-var-channels')
console.log('─'.repeat(70))

/*********************************************************
 * Part 1 — findVarReads: paren-aware fallback boundary
 ********************************************************/
console.log('\nfindVarReads — paren-aware fallback boundary:')

{
    const reads = findVarReads('color: var(--origam-btn---color);')
    if (reads.length === 1 && reads[0].name === '--origam-btn---color' && reads[0].hasFallback === false) {
        ok('simple read, no fallback')
    } else fail(`simple read, no fallback — got ${JSON.stringify(reads)}`)
}

{
    // The exact shape that broke a naive regex in Pagination's real SCSS:
    // a fallback that itself calls a function containing a nested var()
    // and a comma of its own.
    const css = 'background: var(--origam-pagination---background-color-hover, color-mix(in srgb, var(--bg-base), black 20%));'
    const reads = findVarReads(css)
    if (reads.length === 2 &&
        reads[0].name === '--origam-pagination---background-color-hover' && reads[0].hasFallback === true &&
        reads[1].name === '--bg-base' && !reads[1].name.startsWith('--origam-')) {
        // --bg-base is not an --origam- name, so it must not appear as a
        // finding of its own (findVarReads filters by prefix) — assert that.
        fail('expected --bg-base to be filtered out (not --origam- prefixed) but it was returned')
    } else if (reads.length === 1 && reads[0].name === '--origam-pagination---background-color-hover' && reads[0].hasFallback === true) {
        ok('nested color-mix(...) fallback does not desync the paren counter, non-origam var inside it is ignored')
    } else {
        fail(`nested fallback parsing — got ${JSON.stringify(reads)}`)
    }
}

{
    const reads = findVarReads('a: var(--origam-x, 8px); b: var(--origam-y);')
    const byName = Object.fromEntries(reads.map((r) => [r.name, r.hasFallback]))
    if (byName['--origam-x'] === true && byName['--origam-y'] === false) {
        ok('two reads on one line, fallback flag tracked independently')
    } else fail(`two reads on one line — got ${JSON.stringify(reads)}`)
}

/*********************************************************
 * Part 2 — findVarDeclarations: LHS vs. var() reference
 ********************************************************/
console.log('\nfindVarDeclarations — LHS vs. reference disambiguation:')

{
    const decls = findVarDeclarations('.x { --origam-btn---color: var(--origam-color-text-primary); }')
    const names = decls.map((d) => d.name)
    if (names.length === 1 && names[0] === '--origam-btn---color') {
        ok('declaration LHS captured, reference on the RHS not mistaken for a second declaration')
    } else fail(`declaration vs reference — got ${JSON.stringify(names)}`)
}

/*********************************************************
 * Part 3 — analyseChannels: recall (MUST_FLAG) and precision (MUST_NOT_FLAG)
 ********************************************************/
console.log('\nanalyseChannels — recall (a dead channel must be caught):')

const MUST_FLAG = [
    [
        'no fallback, never emitted — the clearest break',
        new Map([['Comp/A.vue', 'a { color: var(--origam-a---color); }']]),
        new Set(),
        'Comp/A.vue::--origam-a---color'
    ],
    [
        'with fallback, never emitted — renders fine today, still a dead channel (EmptyState shape)',
        new Map([['Comp/B.vue', 'a { font-family: var(--origam-b__title---font-family, Inter, sans-serif); }']]),
        new Set(),
        'Comp/B.vue::--origam-b__title---font-family'
    ],
    [
        'hyphenated BEM child name mismatch — the exact #435 shape (table.header-cell)',
        new Map([['Comp/Table.vue', 'a { border-bottom-color: var(--origam-table__header-cell---border-bottom-color, #ccc); }']]),
        new Set(['--origam-table---header-cell-border-bottom-color']), // what the buggy pipeline actually emits
        'Comp/Table.vue::--origam-table__header-cell---border-bottom-color'
    ]
]

for (const [label, vueStyles, emittedVars, expectedId] of MUST_FLAG) {
    const { deadChannels } = analyseChannels({ vueStyles, emittedVars })
    if (deadChannels.has(expectedId)) ok(label)
    else fail(`${label} — expected id ${expectedId}, got [${[...deadChannels.keys()].join(', ')}]`)
}

console.log('\nanalyseChannels — precision (a live or local var must NOT be flagged):')

const MUST_NOT_FLAG = [
    [
        'emitted var — real channel, must be silent',
        new Map([['Comp/C.vue', 'a { color: var(--origam-c---color); }']]),
        new Set(['--origam-c---color'])
    ],
    [
        'locally-synthesised "let" var (Pagination --bg-base / EmptyState --resolved-* shape) — declared and consumed in the same file, never meant to be a token',
        new Map([['Comp/D.vue', ':root { --origam-d---resolved-gap: var(--origam-d---gap-md, 16px); } a { gap: var(--origam-d---resolved-gap); }']]),
        // The synthesis SOURCE (--origam-d---gap-md) is a real, emitted
        // token — only the LOCAL derived name must be excluded from
        // dead-channel detection, not anything it happens to reference.
        new Set(['--origam-d---gap-md'])
    ],
    [
        'non-origam custom property — outside the token pipeline contract entirely',
        new Map([['Comp/E.vue', 'a { color: var(--my-custom-thing, red); }']]),
        new Set()
    ]
]

for (const [label, vueStyles, emittedVars] of MUST_NOT_FLAG) {
    const { deadChannels } = analyseChannels({ vueStyles, emittedVars })
    if (deadChannels.size === 0) ok(label)
    else fail(`${label} — falsely flagged [${[...deadChannels.keys()].join(', ')}]`)
}

console.log('\nanalyseChannels — dormant tokens (reverse direction):')
{
    const vueStyles = new Map([['Comp/F.vue', 'a { color: var(--origam-f---color); }']])
    const emittedVars = new Set(['--origam-f---color', '--origam-g---unused'])
    const { dormantTokens } = analyseChannels({ vueStyles, emittedVars })
    if (dormantTokens.has('--origam-g---unused') && !dormantTokens.has('--origam-f---color')) {
        ok('emitted-but-unread token flagged, emitted-and-read token is not')
    } else fail(`dormant token detection — got [${[...dormantTokens.keys()].join(', ')}]`)
}

/*********************************************************
 * Part 3b — the SECOND read channel: `var()` written in a `.ts` (#552)
 *
 * The regression this pins: the read set used to be built from `.vue` files
 * alone, so a token resolved in TypeScript and shipped as an inline style
 * was reported dormant while it was demonstrably reaching the DOM. Four of
 * Grid's six gap tokens were reported dead on exactly that artefact.
 *
 * ⛔ Every case below goes through the REAL `readNamesFromScriptSources`.
 * Hand-building the name set here would test nothing: the scanner is the
 * part that can be wrong. That shortcut is precisely what let a blind spot
 * survive in the emits guard's self-test.
 ********************************************************/
console.log('\nreadNamesFromScriptSources — a token read from a .ts is a real read (#552):')
{
    const gridConst = new Map([['consts/Grid/grid.const.ts', `
        export const GRID_GAP_SIZE_VAR = {
            xs: 'var(--origam-grid---gap-xs)',
            lg: 'var(--origam-grid---gap-lg)'
        }
    `]])

    const scriptReadNames = readNamesFromScriptSources(gridConst)

    if (scriptReadNames.has('--origam-grid---gap-xs') && scriptReadNames.has('--origam-grid---gap-lg')) {
        ok('var() inside a string literal in a .ts is collected')
    } else {
        fail(`expected both grid gap names — got [${[...scriptReadNames].join(', ')}]`)
    }

    // The regression, end to end: no .vue reads these, only the .ts does.
    const vueStyles = new Map([['Comp/Grid.vue', 'a { gap: var(--origam-grid---gap); }']])
    const emittedVars = new Set(['--origam-grid---gap', '--origam-grid---gap-xs', '--origam-grid---gap-lg'])

    const withoutTs = analyseChannels({ vueStyles, emittedVars })
    const withTs = analyseChannels({ vueStyles, emittedVars, scriptReadNames })

    if (withoutTs.dormantTokens.size !== 2) {
        fail(`pre-#552 behaviour should report 2 dormant tokens — got ${withoutTs.dormantTokens.size}`)
    } else if (withTs.dormantTokens.size === 0) {
        ok('the same two tokens stop being dormant once the .ts read set is supplied')
    } else {
        fail(`expected 0 dormant with the .ts read set — got [${[...withTs.dormantTokens.keys()].join(', ')}]`)
    }

    // ⛔ Precision: the .ts read set must NOT silence the dead-channel
    // direction. A component reading a var nothing declares is still broken,
    // whatever some .ts happens to mention.
    const orphan = new Map([['Comp/Orphan.vue', 'a { color: var(--origam-orphan---color); }']])
    const stillDead = analyseChannels({
        vueStyles: orphan,
        emittedVars: new Set(),
        scriptReadNames: new Set(['--origam-orphan---color'])
    })

    if (stillDead.deadChannels.size === 1) {
        ok('a .ts mention does not mask a genuinely undeclared channel')
    } else {
        fail(`dead-channel direction must stay .vue-only — got ${stillDead.deadChannels.size} violation(s)`)
    }
}

/*********************************************************
 * Part 3c — the THIRD read channel: a name assembled by a Sass loop
 *
 * The guard reads RAW SCSS, never the compiled output, so a token named by
 * interpolation is literally absent from every file it scans:
 *
 *     @each $status in (success, info, warning, danger) {
 *         border-color: var(--origam-snackbar--#{$status}---border, …);
 *     }
 *
 * `findVarReads` stops at the `#`, so those four real reads were invisible
 * and the four declared tokens were accused of being dormant. Measured on
 * the real tree: 10 false positives, Snackbar and the feedback palette.
 ********************************************************/
console.log('\nexpandInterpolatedReads — a name built by a Sass loop is a real read:')
{
    const styles = new Map([[ 'Comp/Snackbar.vue', `
        @each $status in (success, danger) {
            &--#{$status} { border-color: var(--origam-snackbar--#{$status}---border, red); }
        }
    ` ]])

    const emitted = new Set([
        '--origam-snackbar--success---border',
        '--origam-snackbar--danger---border',
        '--origam-snackbar---border',          // ⛔ must NOT match: no segment where #{…} is
        '--origam-alert--success---border'     // ⛔ must NOT match: different component
    ])

    const expanded = expandInterpolatedReads(styles, emitted)

    const wanted = expanded.has('--origam-snackbar--success---border') && expanded.has('--origam-snackbar--danger---border')
    const unwanted = expanded.has('--origam-snackbar---border') || expanded.has('--origam-alert--success---border')

    if (wanted && !unwanted) ok('the loop\'s two rungs count as read, neighbours do not')
    else fail(`interpolation expansion — got [${[ ...expanded ].join(', ')}]`)

    // End to end: without the expansion the two tokens are dormant, with it they are not.
    const withoutExpansion = analyseChannels({ vueStyles: styles, emittedVars: emitted })
    const withExpansion = analyseChannels({ vueStyles: styles, emittedVars: emitted, scriptReadNames: expanded })

    if (withoutExpansion.dormantTokens.has('--origam-snackbar--success---border')
        && !withExpansion.dormantTokens.has('--origam-snackbar--success---border')) {
        ok('a token named only through interpolation stops being reported dormant')
    } else fail('end-to-end interpolation case did not flip')

    // ⛔ Precision: an interpolated read must never SILENCE an unrelated token.
    if (withExpansion.dormantTokens.has('--origam-alert--success---border')) {
        ok('an unrelated declared token stays dormant — the wildcard is scoped, not global')
    } else fail('the interpolation wildcard leaked onto an unrelated token')
}

/*********************************************************
 * Part 3d — the FOURTH read channel: reachability through the token graph
 *
 * A primitive is almost never read by a component. It is read by a SEMANTIC
 * token inside the stylesheet — so it appeared in no `.vue` and no `.ts`, and
 * was reported dormant while every button on screen resolved through it.
 *
 * ⛔ The precision case below is the whole point, and the reason the naive
 * "referenced anywhere in the sheets" version was rejected: it removed 83
 * tokens on the real tree where only 74 deserved it. A DEAD semantic token
 * pointing at a primitive must not bring that primitive back to life.
 ********************************************************/
console.log('\npropagateThroughTokenGraph — a primitive read by a LIVE token is read (and only then):')
{
    const sheets = new Map([[ 'tokens/light.css', `
        :root {
            --origam-btn---background-color: var(--origam-color__primary---600);
            --origam-ghost---background-color: var(--origam-color__ghost---500);
            --origam-color__primary---600: #7c3aed;
            --origam-color__ghost---500: #abcdef;
        }
    ` ]])

    // Only the Btn token is read by a real component.
    const roots = new Set([ '--origam-btn---background-color' ])
    const reached = propagateThroughTokenGraph(sheets, roots)

    if (reached.has('--origam-color__primary---600')) {
        ok('the primitive behind a live semantic token counts as read')
    } else fail('the graph walk did not reach the primitive behind a live token')

    // ⛔ THE PRECISION CASE. `--origam-ghost---background-color` is itself
    // dormant, so the primitive it points at must stay dormant too.
    if (!reached.has('--origam-color__ghost---500')) {
        ok('a primitive whose only consumer is DORMANT stays dormant — no laundering')
    } else fail('a dead branch laundered its primitive into the read set')

    const emitted = new Set([
        '--origam-btn---background-color',
        '--origam-ghost---background-color',
        '--origam-color__primary---600',
        '--origam-color__ghost---500'
    ])
    const styles = new Map([[ 'Comp/Btn.vue', 'a { background: var(--origam-btn---background-color); }' ]])
    const { dormantTokens } = analyseChannels({ vueStyles: styles, emittedVars: emitted, scriptReadNames: reached })

    if (!dormantTokens.has('--origam-color__primary---600')
        && dormantTokens.has('--origam-color__ghost---500')
        && dormantTokens.has('--origam-ghost---background-color')) {
        ok('end to end: the live chain is silent, the dead chain is reported whole')
    } else fail(`end-to-end graph case — dormant = [${[ ...dormantTokens.keys() ].join(', ')}]`)
}

/*********************************************************
 * Part 4 — MUTATION: prove the guard is sensitive to a #435-shaped
 * regression, not just to its own curated fixtures.
 *
 * Starting point: a small "shipped stylesheet" where every var a component
 * reads resolves cleanly (the pre-regression state). Then mutate ONE
 * emitted declaration's name — the same shape as the real bug, where the
 * pipeline's OUTPUT name silently drifts from what the component reads —
 * and prove the guard flips from 0 violations to exactly 1, on exactly the
 * mutated name.
 ********************************************************/
console.log('\nMUTATION — renaming one emitted var must turn a clean read into a violation:')

{
    const vueStyles = new Map([
        ['Comp/Table.vue', 'a { border-bottom-color: var(--origam-table__header-cell---border-bottom-color); }']
    ])

    const cleanEmitted = new Set(['--origam-table__header-cell---border-bottom-color'])
    const before = analyseChannels({ vueStyles, emittedVars: cleanEmitted })

    if (before.deadChannels.size !== 0) {
        fail(`pre-mutation baseline should be clean — got ${before.deadChannels.size} violation(s)`)
    } else {
        ok('pre-mutation: 0 violations (the channel is alive)')

        // The mutation: the pipeline now emits the FLATTENED name instead of
        // the BEM one — exactly what #435 measured for table.header-cell.
        const mutatedEmitted = new Set(['--origam-table---header-cell-border-bottom-color'])
        const after = analyseChannels({ vueStyles, emittedVars: mutatedEmitted })

        const expectedId = 'Comp/Table.vue::--origam-table__header-cell---border-bottom-color'
        if (after.deadChannels.size === 1 && after.deadChannels.has(expectedId)) {
            ok('post-mutation: exactly 1 violation, on the mutated channel — the guard is sensitive to the regression')
        } else {
            fail(`post-mutation — expected exactly [${expectedId}], got [${[...after.deadChannels.keys()].join(', ')}]`)
        }
    }
}

console.log('')
if (failures) {
    console.log(`FAIL — ${failures} self-test case(s) failed.`)
    process.exit(1)
}
console.log(`PASS — ${MUST_FLAG.length + MUST_NOT_FLAG.length} classification cases, 1 dormant case, 3 script-read cases (#552), 3 interpolation cases, 3 graph-reachability cases, 1 mutation case, plus scanner unit checks.`)
