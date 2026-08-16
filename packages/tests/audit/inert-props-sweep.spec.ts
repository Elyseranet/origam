/*
 * RUNTIME SWEEP — mounts every component in the catalogue twice, with two
 * distinct values of a candidate prop, and diffs the rendered DOM.
 *
 * This is the evidence pass for the "declared but never consumed" audit. The
 * static scripts (packages/ds/scripts/audit-unconsumed-props.mjs and
 * audit-dead-prop-names.mjs) produce CANDIDATES; only this file decides.
 *
 * Criterion of inertness, per the audit brief: two distinct values of the
 * prop produce byte-identical markup (classes + inline styles + attributes).
 * If nothing in the DOM differs, nothing downstream — SCSS, computed style,
 * behaviour — can differ either.
 *
 * The prop list is read from the component's OWN compiled runtime props
 * descriptor (`Component.props`), i.e. what Vue actually registered, not from
 * a hand-resolved interface graph. That makes this pass fully independent of
 * the static scripts.
 *
 * Set SWEEP_REPORT=<path> to dump the full machine-readable result.
 */

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createOrigam } from '@origam/origam'
import { writeFileSync } from 'node:fs'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

const modules = import.meta.glob('../../ds/src/components/**/*.vue', { eager: true }) as Record<
    string,
    { default: any }
>

/** Props probed, with two values a correct implementation MUST distinguish. */
const PROBES: Record<string, [unknown, unknown]> = {
    // control group — known-working single-value forms
    margin: [4, 40],
    padding: [4, 40],
    rounded: ['sm', 'xl'],
    border: [2, 8],
    // per-side / logical-axis surfaces under suspicion
    marginTop: [4, 40],
    marginRight: [4, 40],
    marginBottom: [4, 40],
    marginLeft: [4, 40],
    marginBlock: [4, 40],
    marginInline: [4, 40],
    paddingTop: [4, 40],
    paddingRight: [4, 40],
    paddingBottom: [4, 40],
    paddingLeft: [4, 40],
    paddingBlock: [4, 40],
    paddingInline: [4, 40],
    roundedTopLeft: [4, 40],
    roundedTopRight: [4, 40],
    roundedBottomLeft: [4, 40],
    roundedBottomRight: [4, 40],
    // already-fixed logical border axes — must come back LIVE (regression guard)
    borderBlock: [4, 40],
    borderInline: [4, 40],
    // other cross-cutting Commons surfaces
    borderColor: ['primary', 'danger'],
    borderStyle: ['dashed', 'dotted'],
    borderTop: [4, 40],
    borderRight: [4, 40],
    borderBottom: [4, 40],
    borderLeft: [4, 40],
    borderTopColor: ['primary', 'danger'],
    borderRightColor: ['primary', 'danger'],
    borderBottomColor: ['primary', 'danger'],
    borderLeftColor: ['primary', 'danger'],
    elevation: ['sm', 'xl'],
    color: ['primary', 'danger'],
    bgColor: ['primary', 'danger'],
    density: ['default', 'compact'],
    height: [40, 400],
    maxHeight: [40, 400],
    minHeight: [40, 400],
    width: [40, 400],
    maxWidth: [40, 400],
    minWidth: [40, 400],
    fontFamily: ['serif', 'monospace'],
    fontSize: [12, 32],
    fontWeight: [300, 900],
    lineHeight: [1, 2],
    letterSpacing: ['1px', '9px'],
    top: [4, 40],
    bottom: [4, 40],
    left: [4, 40],
    right: [4, 40],
    activeClass: ['probe-a', 'probe-b'],
    loadingText: ['probe-a', 'probe-b'],
    tag: ['div', 'section'],
    id: ['probe-a', 'probe-b'],
    appendIcon: ['$check', '$close'],
    prependIcon: ['$check', '$close'],
    appendAvatar: ['/probe-a.png', '/probe-b.png'],
    prependAvatar: ['/probe-a.png', '/probe-b.png']
}

type Row = {
    component: string
    prop: string
    verdict: 'inert' | 'live' | 'unmountable' | 'nondeterministic' | 'not-rendered'
    detail?: string
}

const rows: Row[] = []

// One plugin instance for the whole sweep — building a fresh one per mount
// (7 800 mounts) exhausts the default V8 heap.
const origam = createOrigam()

function render (Cmp: any, props: Record<string, unknown>): { markup: string; full: string } {
    const wrapper = mount(Cmp, {
        props,
        global: { plugins: [origam], stubs: { teleport: true, transition: false } }
    })
    // A component does NOT necessarily paint through an inline `:style` on its
    // root. `OrigamAlert` (and every other `useStyle(xxxStyles)` caller) never
    // binds `:style` at all — it injects a <style> element into document.head.
    // Diffing `wrapper.html()` alone therefore reports EVERY style-driven prop
    // as inert on those components. The rendered surface is markup + injected
    // stylesheet, so both go into the comparison.
    // generated, monotonically increasing identifiers — not a prop effect
    const norm = (s: string) => s
        .replace(/origam_styletag_\d+/g, 'origam_styletag_N')
        .replace(/(origam-[a-z-]+?)-\d+/g, '$1-N')
    const markup = norm(wrapper.html())
    const full = markup + '\n/* head */\n' + norm(document.head.innerHTML)
    wrapper.unmount()
    // jsdom keeps every injected <style> node alive; over thousands of mounts
    // that alone exhausts the heap.
    document.head.innerHTML = ''
    return { markup, full }
}

/**
 * Some props are MODIFIERS: they can only change anything when a companion
 * prop is set (a border colour with no border, a loading label with no
 * loading state, an offset with no positioning context). Probing them alone
 * reports them inert for a legitimate reason — a false positive. Every probe
 * below carries the companion its implementation requires.
 */
const COMPANIONS: Record<string, Record<string, unknown>> = {
    borderColor: { border: true },
    borderStyle: { border: true },
    borderTopColor: { border: true },
    borderRightColor: { border: true },
    borderBottomColor: { border: true },
    borderLeftColor: { border: true },
    loadingText: { loading: true },
    activeClass: { active: true },
    top: { position: 'absolute' },
    bottom: { position: 'absolute' },
    left: { position: 'absolute' },
    right: { position: 'absolute' }
}

/**
 * Sharding, and why the default is small.
 *
 * Probing all 57 props across the catalogue is ~10 000 mounts; jsdom keeps
 * every mounted tree reachable long enough that the run needs
 * `NODE_OPTIONS=--max-old-space-size=8192` and still takes ~90 s. That does
 * not belong in the default unit run, so by default this spec probes only the
 * CONTROL group — enough to assert the instrument still detects a working
 * prop, in about 15 s.
 *
 * Full audit (run the shards separately, merge the JSON):
 *   NODE_OPTIONS=--max-old-space-size=8192 \
 *   SWEEP_PROPS=margin,padding,rounded,border,marginTop,... \
 *   SWEEP_REPORT=/tmp/shard1.json \
 *   pnpm -F @origam/tests exec vitest --run TU/origam/inert-props-sweep.spec.ts
 */
const DEFAULT_PROPS = ['margin', 'padding', 'rounded', 'border', 'marginTop', 'paddingTop', 'roundedTopLeft']
const propFilter = process.env.SWEEP_PROPS?.split(',').map((s) => s.trim()).filter(Boolean) ?? DEFAULT_PROPS

for (const [path, mod] of Object.entries(modules)) {
    const Cmp = mod?.default
    if (!Cmp || typeof Cmp !== 'object') continue
    const name: string = Cmp.__name || path.split('/').pop()!.replace('.vue', '')
    const declared: string[] = Cmp.props ? Object.keys(Cmp.props) : []
    if (!declared.length) continue

    for (const [prop, [a, b]] of Object.entries(PROBES)) {
        if (!declared.includes(prop)) continue
        if (!propFilter.includes(prop)) continue
        let r1: { markup: string; full: string }
        let r2: { markup: string; full: string }
        let rB: { markup: string; full: string }
        try {
            // DETERMINISM CONTROL — several components mint a per-instance id
            // (useStyle / useId), so two mounts with IDENTICAL props already
            // differ. Without this control those components report "live" for
            // every prop, which is exactly the false positive that would
            // hide a dead prop.
            const companion = COMPANIONS[prop] ?? {}
            r1 = render(Cmp, { ...companion, [prop]: a })
            r2 = render(Cmp, { ...companion, [prop]: a })
            rB = render(Cmp, { ...companion, [prop]: b })
        } catch (err) {
            rows.push({ component: name, prop, verdict: 'unmountable', detail: String((err as Error).message).slice(0, 120) })
            continue
        }
        if (r1.full !== r2.full) {
            rows.push({ component: name, prop, verdict: 'nondeterministic' })
            continue
        }
        // RENDER CONTROL — overlay components (Dialog, Menu, Snackbar, the
        // Picker family…) are CLOSED by default and render nothing but a
        // `<!--v-if-->` placeholder. Every prop then looks inert for a reason
        // that has nothing to do with the prop. Without this control the
        // audit reports whole component families as dead.
        // The test is on the MARKUP only: a closed overlay still injects its
        // stylesheet, so the combined string is never empty.
        const inert = r1.full === rB.full
        const markup = r1.markup.trim()
        if (inert && (!markup || /^<!--[\s\S]*-->$/.test(markup))) {
            rows.push({ component: name, prop, verdict: 'not-rendered' })
            continue
        }
        rows.push({ component: name, prop, verdict: inert ? 'inert' : 'live' })
    }
}

describe('runtime sweep — declared props that produce no DOM difference', () => {
    it('produces a verdict for every (component, probed prop) pair', () => {
        expect(rows.length).toBeGreaterThan(0)

        const byProp = new Map<string, Record<Row['verdict'], string[]>>()
        for (const r of rows) {
            if (!byProp.has(r.prop)) byProp.set(r.prop, { inert: [], live: [], unmountable: [], nondeterministic: [], 'not-rendered': [] })
            byProp.get(r.prop)![r.verdict].push(r.component)
        }

        const lines: string[] = []
        lines.push('prop'.padEnd(22) + 'inert'.padStart(7) + 'live'.padStart(7) + 'unmnt'.padStart(7) + 'nondet'.padStart(8) + '  decided')
        for (const [prop, v] of [...byProp.entries()].sort()) {
            const decided = v.inert.length + v.live.length
            lines.push(
                prop.padEnd(22) +
                String(v.inert.length).padStart(7) +
                String(v.live.length).padStart(7) +
                String(v.unmountable.length).padStart(7) +
                String(v.nondeterministic.length).padStart(8) +
                '  ' + decided
            )
        }
         
        console.log('\n' + lines.join('\n') + '\n')

        if (process.env.SWEEP_REPORT) {
            writeFileSync(process.env.SWEEP_REPORT, JSON.stringify({ rows }, null, 2))
        }
    })

    // INSTRUMENT SELF-TEST. An audit that reports "inert" is only worth
    // anything if it can still recognise a prop that WORKS. These four are
    // known-live on a large share of the catalogue; if they ever come back
    // with zero live components, the harness broke (a missing plugin, a
    // changed render channel, a stubbing regression) and every "inert"
    // verdict it produces is worthless — fix the harness before believing it.
    it.each(['margin', 'padding', 'rounded', 'border'])(
        'CONTROL — %s is detected as live on at least 30 components',
        (prop) => {
            // Shards probe disjoint prop sets; a control prop absent from THIS
            // shard has nothing to say about the instrument's health.
            if (!propFilter.includes(prop)) return
            const live = rows.filter((r) => r.prop === prop && r.verdict === 'live')
            expect(live.length).toBeGreaterThanOrEqual(30)
        }
    )
})
