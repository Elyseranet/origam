/**
 * Self-test for guard-typecheck-ratchet.mjs's pure counter.
 *
 * Does NOT run `nuxt typecheck` (slow, needs the DS built) — only pins that
 * `countTypeErrors` extracts the right number from vue-tsc's real output
 * shape, and does not get fooled by near-miss text.
 *
 * Run: node scripts/guard-typecheck-ratchet.selftest.mjs
 */

import { countTypeErrors } from './guard-typecheck-ratchet.mjs'

let failures = 0
const fail = (msg) => { console.log(`  FAIL  ${msg}`); failures++ }

console.log('─'.repeat(70))
console.log('Self-test: guard-typecheck-ratchet')
console.log('─'.repeat(70))

const CASES = [
    ['empty output', '', 0],
    ['clean run (no errors)', 'nuxt typecheck\n\nNo errors found.\n', 0],
    [
        'real vue-tsc shape, 3 errors',
        [
            "src/pages/components/[slug].vue(15,11): error TS2322: Type '\"64\"' is not assignable to type 'number'.",
            "src/pages/components/[slug].vue(181,19): error TS2322: Type '\"14\"' is not assignable to type 'number'.",
            'src/interfaces/row-list.interface.ts(2,3): error TS2305: Module has no exported member.',
        ].join('\n'),
        3
    ],
    [
        'does not confuse "error" prose with "error TS\\d+:"',
        'This step reported an error running the build, but TS2322 is mentioned only in passing.',
        0
    ],
    [
        'counts a repeated error code once per occurrence, not once per code',
        'a.vue(1,1): error TS2322: x.\nb.vue(2,2): error TS2322: y.\n',
        2
    ]
]

for (const [label, input, expected] of CASES) {
    const actual = countTypeErrors(input)
    if (actual !== expected) fail(`${label} — expected ${expected}, got ${actual}`)
    else console.log(`  ok    ${label}`)
}

console.log('')
if (failures) {
    console.log(`FAIL — ${failures} self-test case(s) failed.`)
    process.exit(1)
}
console.log(`PASS — ${CASES.length} cases.`)
