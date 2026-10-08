/**
 * Self-test for `no-declarations-in-vue.mjs`.
 *
 * The guard's own header documents a real false-positive it already dodged
 * once (`import { type StyleValue } from 'vue'` matching a naive `/\btype\b/`
 * regex) and a deliberate scope boundary (a private, non-exported
 * SCREAMING_SNAKE_CASE local is NOT a violation — only an `export const` is).
 * Both are exactly the kind of near-miss that silently regresses when
 * someone "simplifies" the AST walk later. Pin them here.
 *
 * This file also pins the MARKETING ROOT EXTENSION added for the
 * marketing-reference-factorisation lot: `ROOTS` must list both
 * `packages/ds/src` and `packages/marketing/src`, or the guard is back to
 * covering only the DS — which is how `HomeShowcase.vue`'s
 * `const STATUS_DOT_COLOR` survived unnoticed.
 *
 * Run: node packages/ds/scripts/guards/no-declarations-in-vue.selftest.mjs
 */

import { findDeclarationViolations, ROOTS } from './no-declarations-in-vue.mjs'

let failures = 0
const fail = (msg) => { console.log(`  FAIL  ${msg}`); failures++ }

console.log('─'.repeat(70))
console.log('Self-test: no-declarations-in-vue')
console.log('─'.repeat(70))

const MUST_FLAG = [
    ['interface declared in <script setup>', `
<script setup lang="ts">
interface ILocal { x: number }
</script>
`, 1],
    ['type alias declared in <script setup>', `
<script setup lang="ts">
type TLocal = 'a' | 'b'
</script>
`, 1],
    ['enum declared in <script setup>', `
<script setup lang="ts">
enum ELocal { A, B }
</script>
`, 1],
    ['exported SCREAMING_SNAKE const — the one bright line', `
<script setup lang="ts">
export const STATUS_DOT_COLOR: Record<string, string> = { ok: 'green' }
</script>
`, 1],
    ['declaration in a non-setup <script> block too', `
<script lang="ts">
interface ILegacy { y: string }
export default {}
</script>
`, 1]
]

const MUST_NOT_FLAG = [
    ['type-only import — the documented regex false-positive', `
<script setup lang="ts">
import { type StyleValue } from 'vue'
const x: StyleValue = {}
</script>
`],
    ['non-exported SCREAMING_SNAKE local — deliberately out of scope', `
<script setup lang="ts">
const STATUS_DOT_COLOR: Record<string, string> = { ok: 'green' }
</script>
`],
    ['ordinary camelCase const', `
<script setup lang="ts">
const isOpen = ref(false)
</script>
`],
    ['exported camelCase const — not SCREAMING_SNAKE, not this guard’s target', `
<script setup lang="ts">
export const helperName = 'x'
</script>
`],
    ['defineProps/defineEmits calls — no declaration node at all', `
<script setup lang="ts">
const props = defineProps<{ x: number }>()
defineEmits<{ click: [] }>()
</script>
`]
]

console.log('\nMUST FLAG (a declaration that belongs in src/{interfaces,types,enums,consts} — recall):')
for (const [label, source] of MUST_FLAG) {
    const violations = findDeclarationViolations(source, 'fixture.vue')
    if (violations.size === 0) fail(`${label} — missed`)
    else console.log(`  ok    ${label}`)
}

console.log('\nMUST NOT FLAG (legitimate code — precision):')
for (const [label, source] of MUST_NOT_FLAG) {
    const violations = findDeclarationViolations(source, 'fixture.vue')
    if (violations.size > 0) fail(`${label} — falsely flagged (${[...violations.keys()].join(', ')})`)
    else console.log(`  ok    ${label}`)
}

console.log('\nID shape (a stale baseline entry must be diffable — repo-relative, no line numbers):')
const ids = [...findDeclarationViolations(`
<script setup lang="ts">
interface IFixture { x: number }
</script>
`, 'packages/marketing/src/components/Fixture.vue').keys()]
if (ids.length !== 1 || ids[0] !== 'packages/marketing/src/components/Fixture.vue::interface::IFixture') {
    fail(`expected one id shaped '<relFile>::interface::IFixture', got ${JSON.stringify(ids)}`)
} else {
    console.log('  ok    "<relFile>::<kind>::<name>", no line number baked in')
}

console.log('\nRoot coverage (the marketing + playground extensions must actually be wired, not just importable):')
const labels = ROOTS.map(r => r.label).sort()
if (JSON.stringify(labels) !== JSON.stringify(['ds', 'marketing', 'playground'])) {
    fail(`expected ROOTS to cover ['ds', 'marketing', 'playground'], got ${JSON.stringify(labels)}`)
} else {
    console.log('  ok    ROOTS covers ds, marketing and playground')
}
if (!ROOTS.some(r => r.dir.endsWith('packages/marketing/src'))) {
    fail('marketing root dir does not resolve under packages/marketing/src')
} else {
    console.log('  ok    marketing root resolves to packages/marketing/src')
}
if (!ROOTS.some(r => r.dir.endsWith('packages/playground/src'))) {
    fail('playground root dir does not resolve under packages/playground/src')
} else {
    console.log('  ok    playground root resolves to packages/playground/src')
}

console.log('')
if (failures) {
    console.log(`FAIL — ${failures} self-test case(s) failed.`)
    process.exit(1)
}
const total = MUST_FLAG.length + MUST_NOT_FLAG.length + 1 + 2
console.log(`PASS — ${total} cases (${MUST_FLAG.length} recall, ${MUST_NOT_FLAG.length} precision, 1 id shape, 2 root coverage).`)
