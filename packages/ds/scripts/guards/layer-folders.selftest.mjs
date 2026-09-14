/**
 * Self-test for `layer-folders.mjs`.
 *
 * A folder-matching guard looks trivially correct, which is exactly why it
 * needs pinning: every real bug it exists to catch is a NEAR-match, not an
 * obvious one. `ExpensionPanel` vs `ExpansionPanel` differs by one letter;
 * `DefaultProvider` vs `DefaultsProvider` by one. A check written with any
 * tolerance at all — prefix matching, case-insensitive compare, Levenshtein
 * "did you mean" — swallows precisely those two and reports green.
 *
 * `file-naming.mjs` learned this the hard way: it originally accepted
 * "component name, optionally suffixed", which meant it matched the
 * convention everyone was already violating. See its "HISTORY" block.
 *
 * MUST_FLAG pins recall on the four real defects #368 removed, plus the two
 * tolerance traps above. MUST_NOT_FLAG pins precision — above all that a
 * legitimate family folder holding several components is never flagged,
 * which is the one false positive that would make this guard unusable.
 *
 * Run: node packages/ds/scripts/guards/layer-folders.selftest.mjs
 */

import { findOrphanFolders } from './layer-folders.mjs'

const COMPONENTS = new Set([
    'ExpansionPanel',
    'DefaultsProvider',
    'TextareaField',
    'TextField',
    'TextMask',
    'Btn',
    'ThemeProvider'
])

const flags = (layer, folder) => findOrphanFolders({
    layers: [{ layer, folders: [folder] }],
    componentNames: COMPONENTS
}).length === 1

const MUST_FLAG = [
    ['misspelling: Expension vs Expansion', 'interfaces', 'ExpensionPanel'],
    ['singular vs plural: DefaultProvider', 'interfaces', 'DefaultProvider'],
    ['family under another name: Textarea', 'composables', 'Textarea'],
    ['sub-component as its own folder: RichToolbar', 'types', 'RichToolbar'],
    ['sub-system folder that should be Commons: Theme', 'utils', 'Theme'],
    ['sub-system folder that should be Commons: Mask', 'utils', 'Mask'],
    ['sub-system folder that should be Commons: CssSupport', 'consts', 'CssSupport'],
    ['prefix of a real component must NOT be tolerated', 'types', 'Text'],
    ['real component plus a suffix must NOT be tolerated', 'types', 'TextFieldMask'],
    ['case differs from the real component', 'enums', 'textareaField'],
    ['transverse name is exact-match only, not substring', 'utils', 'CommonsHelpers']
]

const MUST_NOT_FLAG = [
    ['the transverse folder itself', 'interfaces', 'Commons'],
    ['exact component match', 'interfaces', 'ExpansionPanel'],
    ['family folder holding several components', 'interfaces', 'TextareaField'],
    ['component whose name contains another component', 'types', 'TextMask'],
    ['real component, different layer', 'utils', 'Btn'],
    ['ThemeProvider is a real component, unlike Theme', 'types', 'ThemeProvider'],
    ['Commons in every layer', 'utils', 'Commons']
]

let failures = 0
const fail = (msg) => { console.log(`  FAIL  ${msg}`); failures++ }

console.log('─'.repeat(70))
console.log('Self-test: layer-folders')
console.log('─'.repeat(70))

console.log('\nMUST FLAG (a misfiled or misspelled folder — recall):')
for (const [label, layer, folder] of MUST_FLAG) {
    if (!flags(layer, folder)) fail(`${label} — missed (${layer}/${folder})`)
    else console.log(`  ok    ${label}`)
}

console.log('\nMUST NOT FLAG (a legitimate folder — precision):')
for (const [label, layer, folder] of MUST_NOT_FLAG) {
    if (flags(layer, folder)) fail(`${label} — falsely flagged (${layer}/${folder})`)
    else console.log(`  ok    ${label}`)
}

console.log('\nID shape (a stale baseline entry must be diffable):')
const ids = findOrphanFolders({
    layers: [{ layer: 'types', folders: ['RichToolbar', 'Commons', 'Btn'] }],
    componentNames: COMPONENTS
})
if (ids.length !== 1 || ids[0] !== 'packages/ds/src/types/RichToolbar') {
    fail(`expected exactly ['packages/ds/src/types/RichToolbar'], got ${JSON.stringify(ids)}`)
} else {
    console.log('  ok    repo-relative, no line numbers, one id per folder')
}

console.log('')
if (failures) {
    console.log(`FAIL — ${failures} self-test case(s) failed.`)
    process.exit(1)
}
const total = MUST_FLAG.length + MUST_NOT_FLAG.length + 1
console.log(`PASS — ${total} cases (${MUST_FLAG.length} recall, ${MUST_NOT_FLAG.length} precision, 1 id shape).`)
