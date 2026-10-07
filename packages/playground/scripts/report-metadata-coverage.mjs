/*
 * THE PROOF — cross-reads Source A and Source B and says what the metadata
 * chain can and cannot carry.
 *
 * This is the script behind the lot-1 verdict. It answers, by measurement
 * rather than by reading the component source:
 *
 *   1. How many of the catalogue's components expose an exploitable
 *      descriptor at all (both sources, independently).
 *   2. For how many props Source A's runtime `type` is actually DECIDABLE —
 *      i.e. tells a UI which control to render — versus ambiguous.
 *   3. How much of that ambiguity Source B recovers.
 *
 * Run `meta:runtime` and `meta:unions` first; this reads their output.
 *
 * Usage: pnpm -F @origam/playground meta:report
 */

import path from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { REPO_ROOT } from './lib/component-files.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const META_DIR = path.join(HERE, '..', '.metadata')

/*
 * A runtime `type` is DECIDABLE when it names exactly one constructor: a UI
 * can map `Boolean` to a checkbox and `Number` to a number input with no
 * further information. Anything else is not.
 *
 * ⛔ The catch-all `[Boolean, Number, String]` is the shape to watch. It does
 * NOT mean "this prop accepts three kinds of value" — it is what the SFC
 * compiler emits when it cannot narrow the declared type, so it is an
 * ABSENCE of information wearing the costume of a union. Counting it as a
 * type is how a playground ends up rendering a checkbox for `padding`.
 */
const DECIDABLE_SINGLE = new Set(['String', 'Boolean', 'Number', 'Array', 'Object', 'Function', 'Date'])

function classifyRuntimeType (runtimeType) {
    if (runtimeType === null) return 'absent'
    if (typeof runtimeType === 'string') {
        return DECIDABLE_SINGLE.has(runtimeType) ? 'decidable' : 'other'
    }
    if (Array.isArray(runtimeType)) {
        const real = runtimeType.filter(t => t !== null)

        if (real.length === 1) return 'decidable'

        return 'ambiguous'
    }

    return 'other'
}

function load (name) {
    const file = path.join(META_DIR, name)

    if (!existsSync(file)) {
        console.error(`missing ${path.relative(REPO_ROOT, file)} — run meta:runtime and meta:unions first`)
        process.exit(1)
    }

    return JSON.parse(readFileSync(file, 'utf8'))
}

const runtime = load('runtime.json')
const unions = load('unions.json')

const A = new Map(runtime.components.map(c => [c.name, c]))
const B = new Map(unions.components.map(c => [c.name, c]))

const names = [...new Set([...A.keys(), ...B.keys()])].sort()

let aUsable = 0
let bUsable = 0
const counts = { decidable: 0, ambiguous: 0, absent: 0, other: 0 }
let recoveredByB = 0
let stillUnknown = 0
let enumerable = 0
const aOnlyProps = []
const bOnlyProps = []

for (const name of names) {
    const a = A.get(name)
    const b = B.get(name)

    if (a?.usable) aUsable += 1
    if (b?.usable) bUsable += 1
    if (!a?.usable || !b?.usable) continue

    for (const [key, prop] of Object.entries(a.props)) {
        // `class` / `style` are attribute pass-throughs, not authored props.
        if (key === 'class' || key === 'style') continue

        const bProp = b.props[key]

        if (!bProp) { aOnlyProps.push(`${name}.${key}`); continue }

        const klass = classifyRuntimeType(prop.runtimeType)

        counts[klass] += 1

        if (bProp.options) enumerable += 1

        if (klass !== 'decidable') {
            if (bProp.options) recoveredByB += 1
            else stillUnknown += 1
        }
    }

    for (const key of Object.keys(b.props)) {
        if (!(key in a.props)) bOnlyProps.push(`${name}.${key}`)
    }
}

const authored = counts.decidable + counts.ambiguous + counts.absent + counts.other

console.log('=== COVERAGE: does each source see the catalogue at all? ===')
console.log(`components enumerated (git index)      ${names.length}`)
console.log(`Source A  usable descriptor            ${aUsable}/${names.length}`)
console.log(`Source B  usable meta                  ${bUsable}/${names.length}`)
console.log()
console.log('=== SOURCE A: is the runtime type usable to pick a control? ===')
console.log(`authored props examined                ${authored}`)
console.log(`  decidable (one constructor)          ${counts.decidable}\t${pct(counts.decidable, authored)}`)
console.log(`  ambiguous (compiler could not narrow)${counts.ambiguous}\t${pct(counts.ambiguous, authored)}`)
console.log(`  absent (no type emitted)             ${counts.absent}\t${pct(counts.absent, authored)}`)
console.log(`  other                                ${counts.other}\t${pct(counts.other, authored)}`)
console.log()
console.log('=== SOURCE B: what does it add on top? ===')
console.log(`props with an ENUMERABLE literal union ${enumerable}\t${pct(enumerable, authored)}`)
console.log(`  of the non-decidable ones, recovered  ${recoveredByB}`)
console.log(`  of the non-decidable ones, still open ${stillUnknown}`)
console.log(`events seen only by B                  ${unions.components.reduce((n, c) => n + (c.events?.length ?? 0), 0)}`)
console.log(`slots  seen only by B                  ${unions.components.reduce((n, c) => n + (c.slots?.length ?? 0), 0)}`)
console.log()
console.log('=== DISAGREEMENT between the two sources ===')
console.log(`props only A sees (${aOnlyProps.length}): ${aOnlyProps.slice(0, 12).join(', ')}`)
console.log(`props only B sees (${bOnlyProps.length}): ${bOnlyProps.slice(0, 12).join(', ')}`)

function pct (n, total) {
    return total === 0 ? '—' : `${((n / total) * 100).toFixed(1)}%`
}
