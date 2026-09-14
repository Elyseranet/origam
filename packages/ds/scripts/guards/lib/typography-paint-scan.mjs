/*********************************************************
 * typography-paint-scan
 *
 * @description
 * `useTypography(props, prefix)` writes ONE inline custom property per
 * typography prop the consumer passes:
 *
 *     --origam-{prefix}---font-family      ← fontFamily
 *     --origam-{prefix}---font-size        ← fontSize
 *     --origam-{prefix}---font-weight      ← fontWeight
 *     --origam-{prefix}---line-height      ← lineHeight
 *     --origam-{prefix}---letter-spacing   ← letterSpacing
 *
 * Writing the variable paints NOTHING on its own. Some stylesheet has to
 * READ it back. When no rule anywhere does, the prop is typed, offered by
 * autocompletion, documented in the interface — and completely inert. The
 * consumer gets no effect and no warning.
 * @description
 * This scan crosses the two sides mechanically:
 *   • which typography props each call site TYPES (via the interface graph
 *     reaching ITypographyProps, or an explicit Pick<>)
 *   • which of its variables any stylesheet in the package READS
 * and reports the (component, prop) pairs that are typed but unread.
 *
 * The read search is deliberately package-wide, not file-local: a BEM-child
 * prefix is often read by the parent's stylesheet. Package-wide is the
 * generous reading — a variable unread even here is unread everywhere, so
 * every pair reported is a true negative, never an artefact of scope.
 *
 * Usage: node packages/ds/scripts/guards/lib/typography-paint-scan.mjs [--json]
 ********************************************************/

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..')
const DS_SRC = resolve(REPO, 'packages/ds/src')

/** propName -> CSS property emitted by useTypography. Mirrors TYPOGRAPHY_TOKEN_MAP. */
const TOKEN_MAP = {
    fontFamily: 'font-family',
    fontSize: 'font-size',
    fontWeight: 'font-weight',
    lineHeight: 'line-height',
    letterSpacing: 'letter-spacing'
}

function walk (dir, out = []) {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)

        if (statSync(full).isDirectory()) walk(full, out)
        else out.push(full)
    }

    return out
}

const ALL_FILES = walk(DS_SRC)

/*********************************************************
 * Side A — what each call site TYPES
 ********************************************************/

/** Build `interfaceName -> { extends: [...], picks: Set<prop> }` over the interface tree. */
function buildInterfaceGraph () {
    const graph = new Map()

    for (const file of ALL_FILES.filter(f => f.endsWith('.interface.ts'))) {
        const src = readFileSync(file, 'utf8')
        const re = /export\s+interface\s+(\w+)\s*(?:extends\s+([^{]+))?\{/g
        let m

        while ((m = re.exec(src))) {
            const [, name, heritage = ''] = m
            const picks = new Set()
            const parents = []

            // `Pick<ITypographyProps, 'fontSize' | 'fontWeight'>` narrows the surface.
            const pickRe = /Pick<\s*ITypographyProps\s*,\s*([^>]+)>/g
            let p
            while ((p = pickRe.exec(heritage))) {
                for (const q of p[1].matchAll(/'(\w+)'/g)) picks.add(q[1])
            }

            for (const raw of heritage.replace(/Pick<[^>]+>/g, '').split(',')) {
                const clean = raw.trim().replace(/<.*$/, '')
                if (clean) parents.push(clean)
            }

            graph.set(name, { parents, picks })
        }
    }

    return graph
}

const GRAPH = buildInterfaceGraph()

/** Which typography props does `iface` expose? Walks `extends` transitively. */
function typedProps (iface, seen = new Set()) {
    if (!iface || seen.has(iface)) return new Set()
    seen.add(iface)

    if (iface === 'ITypographyProps') return new Set(Object.keys(TOKEN_MAP))

    const node = GRAPH.get(iface)
    if (!node) return new Set()

    const out = new Set(node.picks)
    for (const parent of node.parents) {
        for (const prop of typedProps(parent, seen)) out.add(prop)
    }

    return out
}

/*********************************************************
 * Side B — which variables any stylesheet READS
 ********************************************************/

/**
 * Every `var(--origam-…)` reference across the package. Reading the raw
 * text (not just <style> blocks) is intentional: a handful of components
 * synthesise the declaration from JS, and that still counts as a read.
 */
function collectReadVars () {
    const read = new Set()

    for (const file of ALL_FILES) {
        if (!/\.(vue|scss|css|ts)$/.test(file)) continue

        const src = readFileSync(file, 'utf8')
        for (const m of src.matchAll(/var\(\s*(--origam-[a-zA-Z0-9_-]+)/g)) {
            read.add(m[1])
        }
    }

    return read
}

const READ_VARS = collectReadVars()

/*********************************************************
 * Cross the two sides
 ********************************************************/

const callSites = []

for (const file of ALL_FILES.filter(f => f.endsWith('.vue'))) {
    const src = readFileSync(file, 'utf8')

    // ⛔ matchAll, not match: several components call useTypography more than
    // once with different prefixes (Table → table / table__caption /
    // table__header-cell, EmptyState → __title / __description, ListItem →
    // __title / __subtitle). Taking only the first call silently dropped 16
    // of the 59 call sites and made the first draft of this inventory wrong.
    const prefixes = [...new Set(
        [...src.matchAll(/useTypography\(\s*props\s*,\s*'([^']+)'\s*\)/g)].map(m => m[1])
    )]
    if (!prefixes.length) continue

    const propsIface = src.match(/defineProps<\s*(\w+)\s*>/)?.[1] ?? null
    const exposed = propsIface ? typedProps(propsIface) : new Set()

    // Does the component actually bind the styles it computes?
    const binds = /typographyStyles/.test(src.replace(/useTypography\([^)]*\)/g, ''))

    const dead = []
    const painted = []

    for (const prop of Object.keys(TOKEN_MAP)) {
        if (!exposed.has(prop)) continue

        // A prop paints if ANY of the component's prefixes is read back —
        // each call emits its own variable onto its own element.
        const anyRead = prefixes.some(
            p => READ_VARS.has(`--origam-${p}---${TOKEN_MAP[prop]}`)
        )

        ;(anyRead ? painted : dead).push(prop)
    }

    callSites.push({
        component: file.split('/').pop().replace('.vue', ''),
        file: relative(REPO, file),
        prefix: prefixes.join(' + '),
        prefixCount: prefixes.length,
        propsIface,
        binds,
        exposed: [...exposed],
        painted,
        dead
    })
}

callSites.sort((a, b) => a.component.localeCompare(b.component))

if (process.argv.includes('--json')) {
    console.log(JSON.stringify(callSites, null, 2))
    process.exit(0)
}

const line = '─'.repeat(78)
const withDead = callSites.filter(c => c.dead.length)
const deadPairs = withDead.reduce((n, c) => n + c.dead.length, 0)
const typedPairs = callSites.reduce((n, c) => n + c.exposed.length, 0)

console.log(line)
console.log('typography-paint-scan — typed typography props that paint nothing')
console.log(line)
console.log(`call sites            : ${callSites.length}`)
console.log(`(component, prop) typed: ${typedPairs}`)
console.log(`… of which INERT       : ${deadPairs}  (${withDead.length} components)`)
console.log(line)

const byProp = {}
for (const c of withDead) for (const p of c.dead) (byProp[p] ??= []).push(c.component)

console.log('\nBy prop:')
for (const [prop, comps] of Object.entries(byProp).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${prop.padEnd(15)} ${String(comps.length).padStart(3)} component(s)`)
}

console.log('\nBy component:')
for (const c of withDead) {
    console.log(`  ${c.component.padEnd(34)} prefix=${c.prefix}`)
    console.log(`      inert : ${c.dead.join(', ')}`)
    if (c.painted.length) console.log(`      paints: ${c.painted.join(', ')}`)
    if (!c.binds) console.log('      ⚠ computes typographyStyles but never binds it')
}

const unbound = callSites.filter(c => !c.binds)
if (unbound.length) {
    console.log(`\n⚠ ${unbound.length} call site(s) never bind typographyStyles at all.`)
}

console.log(`\n${line}`)
