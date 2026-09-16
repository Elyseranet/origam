/**
 * Self-test for `class-fallthrough.mjs`.
 *
 * Three things are pinned, per the repo's convention (see
 * `id-forwarding.selftest.mjs` / `dead-handlers.selftest.mjs`):
 *
 *   1. RECALL — every `MUST_FLAG` fixture genuinely loses a consumer's
 *      `class`: the interface declares it, and nothing in the file reads it
 *      back.
 *   2. PRECISION — every `MUST_NOT_FLAG` fixture is a correct or
 *      out-of-scope shape. The two that matter most are the NEGATIVE
 *      CONTROLS at the end: `class` mentioned only in a COMMENT or inside a
 *      STRING must NOT count as a re-bind. A purely textual detector passes
 *      those and would therefore have declared `OrigamChartBullet` healthy
 *      — the exact failure this guard exists to prevent.
 *   3. MUTATION CHECK — the three real components found and fixed under
 *      #620, their PRE-FIX shape reproduced, each asserted to turn the
 *      guard red. A guard that does not catch the bug it was written for
 *      catches nothing.
 *
 * Run: node packages/ds/scripts/guards/lib/class-fallthrough.selftest.mjs
 */

import { fileURLToPath } from 'node:url'

import { analyseSource } from './class-fallthrough.mjs'

const wrap = (template, script) => `<template>\n${template}\n</template>\n<script setup lang="ts">\n${script}\n</script>\n`

// ─────────────────────────────────────────────────────────────────────────
// MUST FLAG — `class` declared, never read back
// ─────────────────────────────────────────────────────────────────────────
const MUST_FLAG = [
    ['rootClasses without props.class', wrap(
        `<figure :class="rootClasses"></figure>`,
        `const rootClasses = computed(() => [ backgroundColorClasses.value, roundedClasses.value ])`
    )],
    ['style re-bound but not class — the OrigamChartBullet shape', wrap(
        `<figure :class="rootClasses" :style="[rootStyles]"></figure>`,
        `const rootClasses = computed(() => [ marginClasses.value ])\nconst rootStyles = computed(() => [ out, props.style ])`
    )],
    ['filterProps EXCLUDING class — the OrigamDialogConfirmation shape', wrap(
        `<origam-dialog v-bind="dialogProps"></origam-dialog>`,
        `const dialogProps = computed(() => ref.value?.filterProps(props, ['class', 'style', 'id']))`
    )],
    ['bare filterProps(props) — useProps defaults already exclude class', wrap(
        `<origam-dialog v-bind="dialogProps"></origam-dialog>`,
        `const dialogProps = computed(() => ref.value?.filterProps(props))`
    )],
    ['a sibling prop named classes is not class', wrap(
        `<div :class="rootClasses"></div>`,
        `const rootClasses = computed(() => [ props.classes ])`
    )]
]

// ─────────────────────────────────────────────────────────────────────────
// MUST NOT FLAG — correct or out-of-scope
// ─────────────────────────────────────────────────────────────────────────
const MUST_NOT_FLAG = [
    ['the conventional shape: rootClasses ends with props.class', wrap(
        `<figure :class="rootClasses"></figure>`,
        `const rootClasses = computed(() => [ roundedClasses.value, props.class ])`
    )],
    ['bracket access props[\'class\']', wrap(
        `<div :class="rootClasses"></div>`,
        `const rootClasses = computed(() => [ props['class'] ])`
    )],
    ['template-side $props.class', wrap(
        `<div :class="[rootClasses, $props.class]"></div>`,
        `const rootClasses = computed(() => [])`
    )],
    ['v-bind="$props" on the root', wrap(
        `<div v-bind="$props"></div>`,
        `const noop = 1`
    )],
    ['filterProps with an explicit array that OMITS class', wrap(
        `<origam-dialog v-bind="dialogProps"></origam-dialog>`,
        `const dialogProps = computed(() => ref.value?.filterProps(props, ['id', 'modelValue']))`
    )]
]

// `class` NOT declared by the interface — Vue's automatic fallthrough
// handles it, so the guard must stay silent whatever the file contains.
const NOT_DECLARED = wrap(
    `<tr :class="textColorClasses"></tr>`,
    `const textColorClasses = computed(() => [])`
)

// ⛔ NEGATIVE CONTROLS — these are the cases a purely textual `grep
// props.class` detector gets WRONG. They must be FLAGGED: the token appears
// in the file but is never read.
const TEXTUAL_TRAPS = [
    ['props.class named only in a line comment', wrap(
        `<div :class="rootClasses"></div>`,
        `// TODO: terminer rootClasses par props.class\nconst rootClasses = computed(() => [])`
    )],
    ['props.class named only in a block comment', wrap(
        `<div :class="rootClasses"></div>`,
        `/* les 189 autres composants finissent par props.class */\nconst rootClasses = computed(() => [])`
    )],
    ['props.class inside a string literal', wrap(
        `<div :class="rootClasses"></div>`,
        `const hint = 'ajouter props.class ici'\nconst rootClasses = computed(() => [])`
    )]
]


// ─────────────────────────────────────────────────────────────────────────
// MUTATION CHECK — the three real #620 components, pre-fix shape
// ─────────────────────────────────────────────────────────────────────────
const REAL_BUGS = [
    ['OrigamChartBullet', wrap(
        `<figure class="origam-chart-bullet" :class="rootClasses" :style="[rootStyles, marginStyles]"></figure>`,
        `const rootClasses = computed(() => [\n{ 'origam-chart-bullet--no-animation': !props.animated },\nbackgroundColorClasses.value,\nelevationClasses.value,\nmarginClasses.value,\npaddingClasses.value,\nroundedClasses.value\n])\nconst rootStyles = computed(() => [ out, props.style ])`
    )],
    ['OrigamChartStreamgraph', wrap(
        `<figure class="origam-chart-streamgraph" :class="rootClasses" :style="[rootStyles]"></figure>`,
        `const rootClasses = computed(() => [\nbackgroundColorClasses.value,\nelevationClasses.value,\nmarginClasses.value,\npaddingClasses.value,\nroundedClasses.value\n])\nconst rootStyles = computed(() => [ out, props.style ])`
    )],
    ['OrigamDialogConfirmation', wrap(
        `<origam-dialog :id="id" ref="origamDialogRef" v-model="isActive" v-bind="dialogProps"></origam-dialog>`,
        `const dialogProps = computed(() => {\nreturn origamDialogRef.value?.filterProps(props, ['class', 'style', 'id', 'modelValue'])\n})`
    )]
]

/**
 * Runs every fixture. Called by the GUARD ITSELF before it scans the
 * catalogue, so these fixtures are on the blocking path rather than
 * decorative — a detector that has gone blind must not be allowed to
 * announce "0 violation" with the same confidence as a healthy catalogue.
 */
export function runFixtures ({ silent = false } = {}) {
    const log = silent ? () => {} : (m) => console.log(m)
    let failures = 0
    const fail = (msg) => {
        failures++
        console.log(`  FAIL  ${msg}`)
    }

    log('MUST FLAG (class declared, never read back):')
    for (const [label, source] of MUST_FLAG) {
        const { violates } = analyseSource(source, true)
        if (!violates) fail(`${label} — expected a violation, got none`)
        else log(`  ok    ${label}`)
    }

    log('\nMUST NOT FLAG (correct shapes):')
    for (const [label, source] of MUST_NOT_FLAG) {
        const { violates, evidence } = analyseSource(source, true)
        if (violates) fail(`${label} — falsely flagged`)
        else log(`  ok    ${label} (evidence: ${evidence})`)
    }

    log('\nOUT OF SCOPE (interface does not declare class):')
    {
        const { violates } = analyseSource(NOT_DECLARED, false)
        if (violates) fail('class not declared — must never be flagged')
        else log('  ok    class not declared -> silent')
    }

    log('\nNEGATIVE CONTROLS (a textual detector would get these wrong):')
    for (const [label, source] of TEXTUAL_TRAPS) {
        const { violates } = analyseSource(source, true)
        if (!violates) fail(`${label} — NOT flagged: the detector is reading text, not code`)
        else log(`  ok    ${label}`)
    }

    log('\nMUTATION CHECK (the three real #620 components, pre-fix shape):')
    for (const [label, source] of REAL_BUGS) {
        const { violates } = analyseSource(source, true)
        if (!violates) fail(`${label} — NOT CAUGHT (the guard would have missed the real bug)`)
        else log(`  ok    ${label}`)
    }

    const total = MUST_FLAG.length + MUST_NOT_FLAG.length + 1 + TEXTUAL_TRAPS.length + REAL_BUGS.length
    return { failures, total }
}

/* CLI — ignoree lorsque le module est importe par le garde */
const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (invokedDirectly) {
    const { failures, total } = runFixtures()
    console.log('')
    if (failures) {
        console.log(`FAIL — ${failures}/${total} self-test case(s) failed.`)
        process.exit(1)
    }
    console.log(`PASS — ${total} cases: precision, recall, the textual traps, and the three real #620 bugs.`)
}
