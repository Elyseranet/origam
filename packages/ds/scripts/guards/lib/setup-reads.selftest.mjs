/**
 * Self-test for `setup-reads.mjs`.
 *
 * A detector nobody measured is a detector nobody can trust — this repo has
 * repeatedly shipped silent checkers. These fixtures pin BOTH directions:
 * every `MUST_FLAG` case is a real theme-escaping read, every `MUST_NOT_FLAG`
 * case is a deferred read that the resolver reaches fine. If a change to the
 * analyser breaks either direction, this fails loudly.
 *
 * Run: node packages/ds/scripts/guards/lib/setup-reads.selftest.mjs
 */

import { analyseSource } from './setup-reads.mjs'

const wrap = body => `<template><div/></template>\n<script setup lang="ts">\n${body}\n</script>\n`

const MUST_FLAG = [
    ['direct member read', `
        const props = withDefaults(defineProps<IProps>(), { a: 1 })
        const x = props.a
    `, ['a']],
    ['read inside an object literal passed to a composable (the Clipboard case)', `
        const props = withDefaults(defineProps<IProps>(), { feedbackDuration: 2000 })
        const { copy } = useClipboard({ feedbackDuration: props.feedbackDuration })
    `, ['feedbackDuration']],
    ['read inside an if block (blocks do not defer)', `
        const props = withDefaults(defineProps<IProps>(), { a: 1 })
        if (props.a) { doThing() }
    `, ['a']],
    ['read inside a for block', `
        const props = withDefaults(defineProps<IProps>(), { items: () => [] })
        for (const i of props.items) { register(i) }
    `, ['items']],
    ['destructuring at setup level', `
        const props = withDefaults(defineProps<IProps>(), { a: 1, b: 2 })
        const { a, b } = props
    `, ['a', 'b']],
    ['renamed destructuring reports the source key', `
        const props = withDefaults(defineProps<IProps>(), { a: 1 })
        const { a: renamed } = props
    `, ['a']],
    ['spread at setup level', `
        const props = withDefaults(defineProps<IProps>(), { a: 1 })
        const merged = { ...props, extra: true }
    `, ['*']],
    ['bracket access', `
        const props = withDefaults(defineProps<IProps>(), { a: 1 })
        const v = props['a']
    `, ['a']],
    ['ternary argument at setup level', `
        const props = withDefaults(defineProps<IProps>(), { name: 'x' })
        const layout = useLayout(props.name ? props.name : 'default')
    `, ['name']],
    ['defineProps without withDefaults', `
        const props = defineProps<IProps>()
        const x = props.a
    `, ['a']]
]

const MUST_NOT_FLAG = [
    ['computed', `
        const props = withDefaults(defineProps<IProps>(), { a: 1 })
        const x = computed(() => props.a)
    `],
    ['watch getter + callback', `
        const props = withDefaults(defineProps<IProps>(), { a: 1 })
        watch(() => props.a, (v) => console.log(props.a, v))
    `],
    ['event handler', `
        const props = withDefaults(defineProps<IProps>(), { a: 1 })
        function onClick () { return props.a }
    `],
    ['lifecycle hook', `
        const props = withDefaults(defineProps<IProps>(), { a: 1 })
        onMounted(() => { init(props.a) })
    `],
    ['toRef is lazy', `
        const props = withDefaults(defineProps<IProps>(), { color: 'red' })
        const { colorClasses } = useColor(toRef(props, 'color'))
    `],
    ['toRefs is lazy', `
        const props = withDefaults(defineProps<IProps>(), { a: 1 })
        const { a } = toRefs(props)
    `],
    ['bare pass-through to a composable is transitive, not eager', `
        const props = withDefaults(defineProps<IProps>(), { a: 1 })
        const { borderClasses } = useBorder(props)
    `],
    ['reads through the RESOLVED props are safe', `
        const _props = withDefaults(defineProps<IProps>(), { a: 1 })
        const props = useDefaults(_props)
        const x = props.a
    `],
    ['nested arrow inside object literal', `
        const props = withDefaults(defineProps<IProps>(), { a: 1 })
        const cfg = { get value () { return props.a }, fn: () => props.a }
    `],
    ['method shorthand in object literal', `
        const props = withDefaults(defineProps<IProps>(), { a: 1 })
        const api = { read () { return props.a } }
    `]
]

let failures = 0
const fail = (msg) => { console.log(`  FAIL  ${msg}`); failures++ }

console.log('─'.repeat(70))
console.log('Self-test: setup-reads analyser')
console.log('─'.repeat(70))
console.log('\nMUST FLAG (real theme-escaping reads):')
for (const [label, body, expectedProps] of MUST_FLAG) {
    const { eager } = analyseSource(wrap(body))
    const got = [...new Set(eager.map(e => e.prop))].sort()
    const want = [...expectedProps].sort()
    if (JSON.stringify(got) !== JSON.stringify(want)) {
        fail(`${label} — expected [${want}], got [${got}]`)
    } else {
        console.log(`  ok    ${label}`)
    }
}

console.log('\nMUST NOT FLAG (deferred / lazy — resolver reaches these):')
for (const [label, body] of MUST_NOT_FLAG) {
    const { eager } = analyseSource(wrap(body))
    if (eager.length) {
        fail(`${label} — falsely flagged [${eager.map(e => e.prop)}]`)
    } else {
        console.log(`  ok    ${label}`)
    }
}

console.log('')
if (failures) {
    console.log(`FAIL — ${failures} self-test case(s) failed.`)
    process.exit(1)
}
console.log(`PASS — ${MUST_FLAG.length + MUST_NOT_FLAG.length} cases, precision and recall both pinned.`)
