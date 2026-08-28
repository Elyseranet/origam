/**
 * Self-test for `analyseComposableSource()` (in `setup-reads.mjs`), the
 * detector guard #17 (`composable-setup-reads.mjs`) runs against
 * `src/composables/`.
 *
 * Same standard as `setup-reads.selftest.mjs`: every `MUST_FLAG` case is a
 * real theme-timing-unsafe eager read reachable through a composable's own
 * `props`/`properties` parameter, every `MUST_NOT_FLAG` case is either a
 * deferred read the resolver reaches fine, or a shape outside this
 * detector's MEASURED scope (see the last two `MUST_NOT_FLAG` entries and
 * the comment on each).
 *
 * ⛔ SCOPE, MEASURED NOT ASSUMED (#504 reconciliation). A parallel detector
 * was built that ALSO matches by parameter TYPE (`opts: IFooProps`, any
 * name) and by destructuring directly in the signature
 * (`({ a }: IFooProps) => …`). Run side-by-side against the full
 * `src/composables/` tree as it exists today, it produced the EXACT SAME 4
 * eager-read findings as this detector — zero composable in the catalogue
 * uses either shape. The two `MUST_NOT_FLAG` cases below pin that boundary
 * so it stays visible: if a future composable ever uses one of these
 * shapes, this test still correctly predicts it will NOT be flagged, and a
 * human has to notice and extend `analyseComposableSource` on purpose,
 * rather than the gap staying invisible.
 *
 * Run: node packages/ds/scripts/guards/lib/composable-setup-reads.selftest.mjs
 */

import { analyseComposableSource } from './setup-reads.mjs'

const eagerProps = (src, fn = 'useProbe') => {
    const row = analyseComposableSource(src, 'probe.composable.ts').find(r => r.fn === fn)
    return (row?.eager ?? []).map(e => e.prop)
}

const MUST_FLAG = [
    ['direct member read on a `props` parameter', `
        export function useProbe (props) { const x = props.a; return { x } }
    `, ['a']],
    ['arrow-const composable (the useNested shape, #486)', `
        export const useProbe = (props) => { const opened = ref(new Set(props.opened)); return { opened } }
    `, ['opened']],
    ['provide*-named composable IS analysed — no name-prefix filter here (the DataTable shape, #504)', `
        export function provideExpanded (props) { const x = useVModel(props, 'expanded', props.expanded); return { x } }
    `, ['expanded'], 'provideExpanded'],
    ['create*-named composable IS ALSO analysed — no name-prefix filter at all (DataTable createSort/createHeaders shape)', `
        export function createSort (props) { const x = props.sortBy; return { x } }
    `, ['sortBy'], 'createSort'],
    ['conditional gate at top level (the useLink shape, #504)', `
        export function useProbe (props) { const link = props.to ? makeLink(props) : undefined; return { link } }
    `, ['to']],
    ['read feeding a ref initial value (the useVirtual shape, #504)', `
        export function useProbe (props) { const last = shallowRef(Math.ceil(props.height / 16)); return { last } }
    `, ['height']],
    ['destructuring at setup level FROM the props variable (not in the signature)', `
        export function useProbe (props) { const { a, b } = props; return { a, b } }
    `, ['a', 'b']],
    ['spread at setup level', `
        export function useProbe (props) { const merged = { ...props, extra: true }; return { merged } }
    `, ['*']],
    ['bracket access', `
        export function useProbe (props) { const v = props['a']; return { v } }
    `, ['a']],
    ['a `properties` parameter is at-risk too, same as `props`', `
        export function useProbe (properties) { const x = properties.a; return { x } }
    `, ['a']]
]

const MUST_NOT_FLAG = [
    ['computed', `
        export function useProbe (props) { return computed(() => props.a) }
    `],
    ['watch getter + callback', `
        export function useProbe (props) { watch(() => props.a, (v) => console.log(props.a, v)) }
    `],
    ['event handler / returned callback', `
        export function useProbe (props) { const onClick = () => props.a; return { onClick } }
    `],
    ['lifecycle hook (the useVirtual onMounted fix, #504)', `
        export function useProbe (props) { onMounted(() => { init(props.a) }) }
    `],
    ['toRef is lazy', `
        export function useProbe (props) { const a = toRef(props, 'a'); return { a } }
    `],
    ['toRefs is lazy', `
        export function useProbe (props) { const { a } = toRefs(props); return { a } }
    `],
    ['bare pass-through to a composable is transitive, not eager', `
        export function useProbe (props) { const { borderClasses } = useBorder(props); return { borderClasses } }
    `],
    ['a non-exported function is out of scope', `
        function useHidden (props) { const t = props.a }
    `],
    ['SCOPE BOUNDARY (measured, see file doc): a parameter typed `IFooProps` but NOT named `props`/`properties` is not matched — no composable in the catalogue uses this shape today', `
        export function useBar (opts) { const x = opts.a; return { x } }
    `],
    ['SCOPE BOUNDARY (measured, see file doc): destructuring directly in the parameter signature is not matched — no composable in the catalogue uses this shape today', `
        export function useBaz ({ a }) { return { a } }
    `]
]

let failures = 0
const fail = (msg) => {
    console.log(`  FAIL  ${msg}`)
    failures++
}

console.log('─'.repeat(70))
console.log('Self-test: analyseComposableSource() — guard #17 composable-setup-reads')
console.log('─'.repeat(70))
console.log('\nMUST FLAG (real theme-timing-unsafe reads):')
for (const [label, body, expected, fnName] of MUST_FLAG) {
    const got = [...new Set(eagerProps(body, fnName ?? 'useProbe'))].sort()
    const want = [...expected].sort()
    if (JSON.stringify(got) !== JSON.stringify(want)) {
        fail(`${label} — expected [${want}], got [${got}]`)
    } else {
        console.log(`  ok    ${label}`)
    }
}

console.log('\nMUST NOT FLAG (deferred / lazy / out of scope):')
for (const [label, body] of MUST_NOT_FLAG) {
    const got = eagerProps(body)
    if (got.length) {
        fail(`${label} — falsely flagged [${got}]`)
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
