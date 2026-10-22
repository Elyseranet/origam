/**
 * Self-test for `marketing-server-leak.mjs` (#1255).
 *
 * A guard whose extractor regresses goes QUIET, and a quiet guard and a clean
 * tree print the same green. These cases pin both directions: every shape of
 * leak the guard must catch (recall) and every shape it must leave alone
 * (precision), on an in-memory file tree — no disk, no git.
 *
 * Run: node packages/ds/scripts/guards/marketing-server-leak.selftest.mjs
 */

import { CLIENT_ROOTS, SERVER_ONLY_FILES, findServerLeaks, isClientRoot } from './marketing-server-leak.mjs'

let failures = 0
const fail = (msg) => { console.log(`  FAIL  ${msg}`); failures++ }

console.log('─'.repeat(70))
console.log('Self-test: marketing-server-leak')
console.log('─'.repeat(70))

const tree = (extra) => new Map(Object.entries({
    'src/utils/db.util.ts': `import { createDataSource } from '../../server/db/data-source'\nexport const useDb = () => createDataSource()`,
    'server/db/data-source.ts': `import { DataSource } from 'typeorm'\nexport const createDataSource = () => new DataSource({})`,
    'server/db/entities/index.ts': `export class DocEntry {}`,
    'src/consts/shared.const.ts': `export const SHARED = 1`,
    'src/consts/doc-upsert.const.ts': `import { DocEntry } from '../../server/db/entities/index.ts'\nexport const SPEC = { DocEntry }`,
    'src/consts/leaky.const.ts': `import { SPEC } from './doc-upsert.const'\nexport const LEAKY = SPEC`,
    'src/utils/pure.util.ts': `import { SHARED } from '../consts/shared.const'\nexport const pure = () => SHARED`,
    'src/utils/reference-cache.util.ts': `export const referenceDocCacheKey = () => 'k'`,
    ...extra
}))

const MUST_FLAG = [
    ['component imports a listed server util', { 'src/components/A.vue': `<script setup lang="ts">\nimport { useDb } from '~/utils/db.util'\nuseDb()\n</script>` }],
    ['composable imports a server package directly', { 'src/composables/useA.ts': `import { DataSource } from 'typeorm'\nexport const a = DataSource` }],
    ['page reaches a server file through a shared const (two hops)', { 'src/pages/p.vue': `<script setup lang="ts">\nimport { LEAKY } from '~/consts/leaky.const'\n</script>` }],
    ['listed util with NO server import (reference-cache) is still server-only', { 'src/layouts/default.vue': `<script setup lang="ts">\nimport { referenceDocCacheKey } from '../utils/reference-cache.util'\n</script>` }],
    ['dynamic import() is followed', { 'src/middleware/m.ts': `export default async () => { const m = await import('../utils/db.util'); return m }` }],
    ['Node builtin makes a file server-only', { 'src/utils/node.util.ts': `import { createHash } from 'node:crypto'\nexport const h = createHash`, 'src/components/B.vue': `<script setup lang="ts">\nimport { h } from '~/utils/node.util'\n</script>` }],
    ['client plugin (not *.server.ts) is a root', { 'src/plugins/x.client.ts': `import { useDb } from '../utils/db.util'\nexport default useDb` }],
    ['service is a root', { 'src/services/s.service.ts': `import { useDb } from '../utils/db.util'\nexport const s = useDb` }]
]

const MUST_NOT_FLAG = [
    ['type-only import of a server util', { 'src/components/C.vue': `<script setup lang="ts">\nimport type { useDb } from '~/utils/db.util'\n</script>` }],
    ['import list made only of `type` specifiers', { 'src/composables/useC.ts': `import { type useDb } from '../utils/db.util'\nexport const c = 1` }],
    ['export type … from a server util', { 'src/composables/useD.ts': `export type { useDb } from '../utils/db.util'` }],
    ['*.server.ts plugin may use server utils', { 'src/plugins/theme-sync.server.ts': `import { useDb } from '../utils/db.util'\nexport default useDb` }],
    ['client file importing a pure shared util', { 'src/components/D.vue': `<script setup lang="ts">\nimport { pure } from '~/utils/pure.util'\n</script>` }],
    ['server/api importing server utils is the point of server/', { 'server/api/x.get.ts': `import { useDb } from '../../src/utils/db.util'\nexport default useDb` }],
    ['an unreachable server util is not a violation by itself', {}]
]

console.log('\nMUST FLAG (a client file reaches server-only code — recall):')
for (const [label, extra] of MUST_FLAG) {
    const v = findServerLeaks(tree(extra))
    if (v.size === 0) fail(`${label} — missed`)
    else console.log(`  ok    ${label}`)
}

console.log('\nMUST NOT FLAG (legitimate code — precision):')
for (const [label, extra] of MUST_NOT_FLAG) {
    const v = findServerLeaks(tree(extra))
    if (v.size > 0) fail(`${label} — falsely flagged (${[...v.keys()].join(', ')})`)
    else console.log(`  ok    ${label}`)
}

console.log('\nChain (the report must name every hop, not only the root):')
const chain = [...findServerLeaks(tree({ 'src/pages/p.vue': `<script setup lang="ts">\nimport { LEAKY } from '~/consts/leaky.const'\n</script>` })).values()][0] ?? ''
if (!chain.includes('src/pages/p.vue → src/consts/leaky.const.ts → src/consts/doc-upsert.const.ts → server/db/entities/index.ts')) {
    fail(`chain does not list every hop: ${chain}`)
} else console.log('  ok    root → const → const → server file')

console.log('\nID shape (baseline-diffable — no line number):')
const id = [...findServerLeaks(tree({ 'src/components/A.vue': `<script setup lang="ts">\nimport { useDb } from '~/utils/db.util'\n</script>` })).keys()][0]
if (id !== 'src/components/A.vue::src/utils/db.util.ts') fail(`unexpected id ${id}`)
else console.log('  ok    "<client file>::<server file>"')

console.log('\nWiring (the lists must really cover what the ticket names):')
for (const dir of ['src/pages/a.vue', 'src/components/a.vue', 'src/composables/a.ts', 'src/layouts/a.vue', 'src/middleware/a.ts', 'src/plugins/a.client.ts']) {
    if (!isClientRoot(dir)) fail(`${dir} is not a client root`)
}
if (isClientRoot('src/plugins/a.server.ts')) fail('*.server.ts plugin must not be a client root')
if (isClientRoot('src/utils/a.util.ts')) fail('src/utils is shared, not a root (reached transitively)')
for (const f of ['admin-auth', 'db', 'reference-cache']) {
    if (!SERVER_ONLY_FILES.includes(`src/utils/${f}.util.ts`)) fail(`${f} missing from SERVER_ONLY_FILES`)
}
if (CLIENT_ROOTS.length < 6) fail('CLIENT_ROOTS shrank')
if (failures === 0) console.log('  ok    roots and server-only list')

console.log('')
if (failures) {
    console.log(`FAIL — ${failures} self-test case(s) failed.`)
    process.exit(1)
}
console.log(`PASS — ${MUST_FLAG.length + MUST_NOT_FLAG.length + 3} cases (${MUST_FLAG.length} recall, ${MUST_NOT_FLAG.length} precision, 3 structure).`)
