/**
 * Self-test for `no-usedefaults-in-components.mjs`.
 *
 * The guard's whole value rests on one distinction: a CALL to `useDefaults` is
 * a violation, a MENTION of it is not. Several components carry comments that
 * still explain the old mechanism, and `OrigamBtnGroup`'s prose even contains
 * the literal text `useDefaults(props)`. A line-based regex flags all of those.
 * That is not hypothetical — issue #363 opened with "45 components call
 * useDefaults", a figure produced by exactly such a grep. The real count was
 * 40; the five extras were comments and imports.
 *
 * So these fixtures measure both directions rather than trusting the claim.
 * MUST_FLAG pins recall: a real call in any shape must be caught. MUST_NOT_FLAG
 * pins precision: prose, strings, and a bare import must not be.
 *
 * Run: node packages/ds/scripts/guards/no-usedefaults-in-components.selftest.mjs
 */

import { analyseSource } from './lib/setup-reads.mjs'

const wrap = body => `<template><div/></template>\n<script setup lang="ts">\n${body}\n</script>\n`

const MUST_FLAG = [
    ['the canonical shape', `
        import { useDefaults } from '@/composables'
        const _props = withDefaults(defineProps<IProps>(), { a: 1 })
        const props = useDefaults(_props)
    `],
    ['bound to a name other than props', `
        const _props = withDefaults(defineProps<IProps>(), { a: 1 })
        const resolved = useDefaults(_props)
    `],
    ['declared alongside other bindings', `
        const _props = withDefaults(defineProps<IProps>(), { a: 1 })
        const attrs = useAttrs(), props = useDefaults(_props)
    `],
    ['plain defineProps, no withDefaults', `
        const _props = defineProps<IProps>()
        const props = useDefaults(_props)
    `]
]

const MUST_NOT_FLAG = [
    ['a comment explaining the old mechanism', `
        // \`useDefaults\` used to resolve each prop against the closest provider.
        const props = withDefaults(defineProps<IProps>(), { a: 1 })
    `],
    ['a comment containing a literal call, as OrigamBtnGroup carries', `
        const props = withDefaults(defineProps<IProps>(), { a: 1 })
        // Children merge their own values via useDefaults(props) — they no longer do.
    `],
    ['a block comment naming it', `
        /* useDefaults is gone; the resolver writes into instance.props. */
        const props = withDefaults(defineProps<IProps>(), { a: 1 })
    `],
    ['an unused import with no call', `
        import { useDefaults } from '@/composables'
        const props = withDefaults(defineProps<IProps>(), { a: 1 })
    `],
    ['the name inside a string literal', `
        const props = withDefaults(defineProps<IProps>(), { a: 1 })
        const note = 'useDefaults(props)'
    `],
    ['provideDefaults, which is a different function and stays legitimate', `
        const props = withDefaults(defineProps<IProps>(), { a: 1 })
        provideDefaults(props.defaults)
    `],
    ['a clean component that never mentions it', `
        const props = withDefaults(defineProps<IProps>(), { a: 1 })
        const cls = computed(() => props.a)
    `]
]

let failures = 0
const fail = (msg) => { console.log(`  FAIL  ${msg}`); failures++ }

console.log('─'.repeat(70))
console.log('Self-test: no-usedefaults-in-components')
console.log('─'.repeat(70))

console.log('\nMUST FLAG (a real call — recall):')
for (const [label, body] of MUST_FLAG) {
    if (!analyseSource(wrap(body)).callsUseDefaults) fail(`${label} — missed`)
    else console.log(`  ok    ${label}`)
}

console.log('\nMUST NOT FLAG (a mention, not a call — precision):')
for (const [label, body] of MUST_NOT_FLAG) {
    if (analyseSource(wrap(body)).callsUseDefaults) fail(`${label} — falsely flagged`)
    else console.log(`  ok    ${label}`)
}

console.log('')
if (failures) {
    console.log(`FAIL — ${failures} self-test case(s) failed.`)
    process.exit(1)
}
const total = MUST_FLAG.length + MUST_NOT_FLAG.length
console.log(`PASS — ${total} cases (${MUST_FLAG.length} recall, ${MUST_NOT_FLAG.length} precision).`)
