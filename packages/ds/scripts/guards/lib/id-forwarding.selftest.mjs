/**
 * Self-test for `id-forwarding.mjs`.
 *
 * Two things are pinned, per the repo's convention (see
 * `dead-handlers.selftest.mjs` / `setup-reads.selftest.mjs`):
 *
 *   1. PRECISION AND RECALL on synthetic fixtures — every `MUST_FLAG` case
 *      genuinely loses the consumer's `id`; every `MUST_NOT_FLAG` case is
 *      one of the three correct/out-of-scope shapes documented in
 *      `id-forwarding.mjs` (renamed useStyle destructure, slot-scope
 *      forwarding, fixed useStyle call).
 *   2. MUTATION CHECK — a sample of the 16 real components found+fixed
 *      during the #381 campaign, their PRE-FIX source reconstructed
 *      verbatim from the actual diff, each asserted to turn the guard red.
 *
 * Run: node packages/ds/scripts/guards/lib/id-forwarding.selftest.mjs
 */

import { analyseSource } from './id-forwarding.mjs'

const wrap = (template, script) => `<template>\n${template}\n</template>\n<script setup lang="ts">\n${script}\n</script>\n`

// ─────────────────────────────────────────────────────────────────────────
// MUST FLAG — bare `id` from an un-fixed useStyle, bound unshadowed
// ─────────────────────────────────────────────────────────────────────────
const MUST_FLAG = [
    ['root :id="id" from a one-arg useStyle() call', wrap(
        `<div :id="id" :class="fooClasses"></div>`,
        `const {id, css, load, isLoaded, unload} = useStyle(fooStyles)`
    )],
    ['dynamic :is root, same shape', wrap(
        `<component :is="tag" :id="id"></component>`,
        `const {id, css, load, isLoaded, unload} = useStyle(fooStyles)`
    )],
    ['id bound on a nested child OUTSIDE any slot scope', wrap(
        `<origam-overlay :id="id"><div class="content"></div></origam-overlay>`,
        `const { id, css, load, isLoaded, unload } = useStyle(snackbarStyles)`
    )],
    ['destructure with unrelated siblings, still a bare id', wrap(
        `<div :id="id"></div>`,
        `const {css, id, unload} = useStyle(fooStyles)`
    )]
]

// ─────────────────────────────────────────────────────────────────────────
// MUST NOT FLAG — the three correct/out-of-scope shapes
// ─────────────────────────────────────────────────────────────────────────
const MUST_NOT_FLAG = [
    ['fixed: useStyle called with the () => props.id second argument', wrap(
        `<div :id="id"></div>`,
        `const {id, css, load, isLoaded, unload} = useStyle(fooStyles, () => props.id)`
    )],
    ['mechanism A: useStyle destructure renamed to styleId, a SEPARATE local id computed reads props.id', wrap(
        `<div :id="id"></div>`,
        `const id = computed(() => props.id || \`checkbox-\${uid}\`)\nconst {id: styleId, css, load, isLoaded, unload} = useStyle(fooStyles)`
    )],
    ['mechanism B: :id="id" is INSIDE a #default="{id,...}" slot scope — reads the slot value, not the useStyle homonym', wrap(
        `<origam-input :id="rootId"><template #default="{id, messagesId}"><origam-field :id="id" /></template></origam-input>`,
        `const {id: rootId, css, load, isLoaded, unload} = useStyle(fooStyles)`
    )],
    ['mechanism B, RatingField shape: root :id="id" correctly resolves (fixed useStyle) AND a nested slot-scoped :for="id" is a DIFFERENT attribute entirely', wrap(
        `<origam-input :id="id"><template #default="{id, messagesId}"><origam-label :for="id" /></template></origam-input>`,
        `const {id, css, load, isLoaded, unload} = useStyle(ratingFieldStyles, () => props.id)`
    )],
    ['no useStyle at all', wrap(`<div :id="id"></div>`, `const id = computed(() => props.id)`)],
    ['useStyle called but id NOT bound anywhere in the template', wrap(
        `<div class="foo"></div>`,
        `const {id, css, load, isLoaded, unload} = useStyle(fooStyles)`
    )],
    ['no template at all', `<script setup lang="ts">\nconst x = 1\n</script>\n`]
]

// ─────────────────────────────────────────────────────────────────────────
// MUTATION CHECK — pre-fix source of real #381 components, verbatim
// ─────────────────────────────────────────────────────────────────────────
const REAL_BUGS = [
    ['OrigamAlert (pre-#381 fix)', wrap(
        `<component :is="tag" :id="id" :class="alertClasses"></component>`,
        `const {id, css, load, isLoaded, unload} = useStyle(alertStyles)`
    )],
    ['OrigamBadge (pre-#381 fix) — id on the content pill, not the root', wrap(
        `<component :is="tag" :class="badgeClasses"><div class="origam-badge__wrapper"><origam-transition><span :id="id" v-show="modelValue"></span></origam-transition></div></component>`,
        `const {id, css, load, isLoaded, unload} = useStyle(badgeContentStyles)`
    )],
    ['OrigamSnackbar (pre-#381 fix) — id on a nested <origam-overlay>, 2-space indent style', wrap(
        `<origam-overlay :id="id" v-model="isActive"></origam-overlay>`,
        `const { id, css, load, isLoaded, unload } = useStyle(snackbarStyles)`
    )],
    ['OrigamTreeview (pre-#381 fix)', wrap(
        `<div :id="id" role="tree"></div>`,
        `const {id, css, load, isLoaded, unload} = useStyle(treeviewStyles)`
    )]
]

let failures = 0
const fail = (msg) => { console.log(`  FAIL  ${msg}`); failures++ }

console.log('─'.repeat(70))
console.log('Self-test: id-forwarding analyser')
console.log('─'.repeat(70))

console.log('\nMUST FLAG (id lost — bare useStyle homonym, unshadowed):')
for (const [label, source] of MUST_FLAG) {
    const { findings } = analyseSource(source)
    if (findings.length === 0) {
        fail(`${label} — expected >= 1 finding, got 0`)
    } else {
        console.log(`  ok    ${label} (${findings.length} finding(s))`)
    }
}

console.log('\nMUST NOT FLAG (correct / out-of-scope shapes):')
for (const [label, source] of MUST_NOT_FLAG) {
    const { findings } = analyseSource(source)
    if (findings.length) {
        fail(`${label} — falsely flagged ${findings.length} time(s)`)
    } else {
        console.log(`  ok    ${label}`)
    }
}

console.log('\nMUTATION CHECK (real #381 components, pre-fix source verbatim):')
for (const [label, source] of REAL_BUGS) {
    const { findings } = analyseSource(source)
    if (findings.length === 0) {
        fail(`${label} — NOT CAUGHT (the guard would have missed the real bug)`)
    } else {
        console.log(`  ok    ${label} -> ${findings.length} finding(s)`)
    }
}

console.log('')
if (failures) {
    console.log(`FAIL — ${failures} self-test case(s) failed.`)
    process.exit(1)
}
console.log(`PASS — ${MUST_FLAG.length + MUST_NOT_FLAG.length + REAL_BUGS.length} cases, precision/recall pinned AND the sampled real bugs are caught.`)
