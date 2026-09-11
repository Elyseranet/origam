/**
 * Self-test for `dead-handlers.mjs`.
 *
 * Two things are pinned, per the repo's convention (see `setup-reads.selftest.mjs`):
 *
 *   1. PRECISION AND RECALL on synthetic fixtures — every `MUST_FLAG` case is
 *      a real dangling-reference handler, every `MUST_NOT_FLAG` case is a
 *      correct shape the resolver / compiler actually invokes. A detector
 *      that flags everything or nothing passes half of a suite written
 *      backwards — both directions are checked explicitly.
 *
 *   2. MUTATION CHECK — the four real bugs found by reading source during the
 *      #432/#434 inspection, replayed VERBATIM as fixtures (not paraphrased),
 *      each asserted to turn the guard red. A detector that can't catch the
 *      bugs it was written for is not ready to ship.
 *
 * Run: node packages/ds/scripts/guards/lib/dead-handlers.selftest.mjs
 */

import { analyseSource } from './dead-handlers.mjs'

const wrap = (template, script) => `<template>\n${template}\n</template>\n<script setup lang="ts">\n${script}\n</script>\n`

const HANDLER = `const handleClick = (e: MouseEvent) => { doThing(e) }`
const HANDLER2 = `const handleClickDate = () => { doThing() }`

// ─────────────────────────────────────────────────────────────────────────
// MUST FLAG — real dangling-reference / discarded-factory handlers
// ─────────────────────────────────────────────────────────────────────────
const MUST_FLAG = [
    ['&& chain — bare reference never called', wrap(
        `<div @click="clickable && handleClick"></div>`, HANDLER
    ), 1],
    ['&& chain, three operands — reference at the tail', wrap(
        `<div @keydown="isClickable && !isLink && handleClick"></div>`, HANDLER
    ), 1],
    ['|| chain — bare reference never called', wrap(
        `<div @click="skip || handleClick"></div>`, HANDLER
    ), 1],
    ['ternary — one branch is a dangling reference', wrap(
        `<div @click="!cond ? handleClickDate : undefined"></div>`, HANDLER2
    ), 1],
    ['ternary — dangling reference is the OTHER branch', wrap(
        `<div @click="cond ? undefined : handleClickDate"></div>`, HANDLER2
    ), 1],
['destructured composable handler, referenced bare inside &&', wrap(
        `<div @click="clickable && handleClick"></div>`,
        `const { onClick: handleClick } = useAdjacent(props)`
    ), 1],
    ['withModifiers used bare as the WHOLE v-on expression', wrap(
        `<div @click="withModifiers(handleClick, ['stop'])"></div>`, HANDLER
    ), 1],
    ['withKeys used bare inside a &&', wrap(
        `<div @keydown="active && withKeys(handleClick, ['enter'])"></div>`, HANDLER
    ), 1],
    ['multi-statement inline handler, second statement dangles', wrap(
        `<div @click="track(); clickable && handleClick"></div>`,
        `const track = () => {}\n${HANDLER}`
    ), 1],
    ['script-level: withModifiers(...) as a bare discarded statement', wrap(
        `<div @click="handleCheckBoxClick"></div>`,
        `const toggleSelect = (x: any) => {}\nconst handleCheckBoxClick = () => {\n  withModifiers(() => toggleSelect(1), ['stop'])\n  doOtherThing()\n}`
    ), 1]
]

// ─────────────────────────────────────────────────────────────────────────
// MUST NOT FLAG — the correct shapes, plus shapes that merely LOOK similar
// ─────────────────────────────────────────────────────────────────────────
const MUST_NOT_FLAG = [
    ['bare method reference — the one Vue-blessed shape', wrap(
        `<div @click="handleClick"></div>`, HANDLER
    )],
    ['bare member-expression reference', wrap(
        `<div @click="obj.handleClick"></div>`,
        `const obj = { handleClick: () => {} }`
    )],
    ['already invoked', wrap(
        `<div @click="handleClick()"></div>`, HANDLER
    )],
    ['&& chain, right side already invoked', wrap(
        `<div @click="clickable && handleClick()"></div>`, HANDLER
    )],
    ['ternary, both branches already invoked / literal', wrap(
        `<div @click="cond ? handleClick() : undefined"></div>`, HANDLER
    )],
    ['inline function literal — Vue calls IT, body is out of scope for this guard', wrap(
        `<div @click="() => handleClick()"></div>`, HANDLER
    )],
    ['assignment — no dangling reference anywhere', wrap(
        `<div @click="isOpen = !isOpen"></div>`,
        `const isOpen = ref(false)`
    )],
    ['&& chain with a name NOT declared as a local function — could be anything', wrap(
        `<div @click="clickable && somethingFromOutside"></div>`, HANDLER
    )],
    ['ternary with a name NOT declared as a local function', wrap(
        `<div @click="cond ? somethingUnrelated : undefined"></div>`, HANDLER
    )],
    ['withModifiers immediately re-invoked with the event', wrap(
        `<div @click="withModifiers(handleClick, ['stop'])($event)"></div>`, HANDLER
    )],
    ['script-level: withModifiers(...) assigned to a variable, called later', wrap(
        `<div @click="handleCheckBoxClick"></div>`,
        `const handleCheckBoxClick = () => {\n  const guarded = withModifiers(() => {}, ['stop'])\n  guarded()\n}`
    )],
    ['script-level: withModifiers(...) returned from the function', wrap(
        `<div @click="handleCheckBoxClick"></div>`,
        `const handleCheckBoxClick = () => {\n  return withModifiers(() => {}, ['stop'])\n}`
    )],
    ['no template at all', `<script setup lang="ts">\nconst x = 1\n</script>\n`],
    ['directive with no v-on at all', wrap(`<div :class="foo"></div>`, `const foo = 'a'`)]
]

// ─────────────────────────────────────────────────────────────────────────
// MUTATION CHECK — the four real bugs, verbatim, replayed as fixtures
// ─────────────────────────────────────────────────────────────────────────
const REAL_BUGS = [
    ['OrigamProgressLinear — @click="clickable && handleClick"', wrap(
        `<div :is="tag" @click="clickable && handleClick"></div>`,
        `const props = withDefaults(defineProps<{clickable?: boolean}>(), {})\nconst handleClick = (e: MouseEvent) => {\n    if (!intersectionRef.value) return\n    progress.value = 1\n}`
    )],
    ['OrigamDatePicker — @click="!viewModeIsMonth ? handleClickDate : undefined"', wrap(
        `<span @click="!viewModeIsMonth ? handleClickDate : undefined">x</span>`,
        `const viewModeIsMonth = computed(() => true)\nconst handleClickDate = () => {\n    viewMode.value = 'month'\n}`
    )],
    ['OrigamChip / OrigamListItem — @keydown="isClickable && !isLink && handleKeydown"', wrap(
        `<div @keydown="isClickable && !isLink && handleKeydown"></div>`,
        `const handleKeydown = (e: KeyboardEvent) => {\n    if (e.key === 'Enter') onClick(e as any)\n}`
    )],
    ['OrigamDataTableRow — withModifiers(...) as a bare discarded statement', wrap(
        `<input @click="handleCheckBoxClick">`,
        `const toggleSelect = (item: any) => {}\nconst handleCheckBoxClick = () => {\n    withModifiers(() => toggleSelect(props.item), ['stop'])\n    emits('select')\n}`
    )]
]

let failures = 0
const fail = (msg) => { console.log(`  FAIL  ${msg}`); failures++ }

console.log('─'.repeat(70))
console.log('Self-test: dead-handlers analyser')
console.log('─'.repeat(70))

console.log('\nMUST FLAG (real dangling-handler shapes):')
for (const [label, source, minCount] of MUST_FLAG) {
    const { findings } = analyseSource(source)
    if (findings.length < minCount) {
        fail(`${label} — expected >= ${minCount} finding(s), got ${findings.length}`)
    } else {
        console.log(`  ok    ${label} (${findings.length} finding(s))`)
    }
}

console.log('\nMUST NOT FLAG (correct shapes / no dangling handler):')
for (const [label, source] of MUST_NOT_FLAG) {
    const { findings } = analyseSource(source)
    if (findings.length) {
        fail(`${label} — falsely flagged ${JSON.stringify(findings.map(f => `${f.kind}:${f.name}`))}`)
    } else {
        console.log(`  ok    ${label}`)
    }
}

console.log('\nMUTATION CHECK (the four real bugs, replayed verbatim):')
for (const [label, source] of REAL_BUGS) {
    const { findings } = analyseSource(source)
    if (findings.length === 0) {
        fail(`${label} — NOT CAUGHT (the guard would have missed the real bug)`)
    } else {
        console.log(`  ok    ${label} -> ${findings.map(f => `${f.kind}:${f.name}`).join(', ')}`)
    }
}

console.log('')
if (failures) {
    console.log(`FAIL — ${failures} self-test case(s) failed.`)
    process.exit(1)
}
console.log(`PASS — ${MUST_FLAG.length + MUST_NOT_FLAG.length + REAL_BUGS.length} cases, precision/recall pinned AND the four known bugs are caught.`)
