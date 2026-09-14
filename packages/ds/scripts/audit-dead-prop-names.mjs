#!/usr/bin/env node
/**
 * audit-dead-prop-names.mjs — SECOND, INDEPENDENT METHOD.
 *
 * Deliberately dumb on purpose: it shares no code path with
 * `audit-unconsumed-props.mjs`. For every property name declared anywhere
 * under `src/interfaces/`, it greps the whole of `packages/ds/src` for that
 * identifier and reports the names whose ONLY occurrences are inside
 * `src/interfaces/` (and, optionally, docs/stories/tests).
 *
 * A name with zero occurrences outside the interfaces is dead for the whole
 * catalogue — no component, no composable, no SCSS, no template can be
 * reading it. That is a much stronger statement than the per-component
 * script's "candidate", and it needs no model of forwarding at all.
 *
 * The two methods answer different questions and are used to cross-check
 * each other:
 *   - this one   : is the name referenced ANYWHERE in the library source?
 *   - the other  : does THIS component route it to an effect?
 *
 * Usage: node packages/ds/scripts/audit-dead-prop-names.mjs [--verbose]
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const DS = join(HERE, '..')
const SRC = join(DS, 'src')
const ROOT = join(DS, '..', '..')

function walk (dir, out = []) {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)
        const st = statSync(full)
        if (st.isDirectory()) walk(full, out)
        else out.push(full)
    }
    return out
}

const read = (f) => readFileSync(f, 'utf8')
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')

/* --- collect every declared property name, with its declaring interface --- */
const ifaceFiles = walk(join(SRC, 'interfaces')).filter((f) => f.endsWith('.ts'))
/** prop -> Set<interface> */
const declaredIn = new Map()

for (const file of ifaceFiles) {
    const src = stripComments(read(file))
    const re = /export\s+interface\s+([A-Za-z0-9_]+)\s*(?:extends\s+[^{]+)?\{/g
    let m
    while ((m = re.exec(src))) {
        let depth = 1
        let i = re.lastIndex
        while (i < src.length && depth > 0) {
            if (src[i] === '{') depth++
            else if (src[i] === '}') depth--
            i++
        }
        const body = src.slice(re.lastIndex, i - 1)
        // depth-0 members only
        let d = 0
        for (const line of body.split('\n')) {
            if (d === 0) {
                const mm = /^\s*(?:readonly\s+)?(['"]?)([A-Za-z_$][A-Za-z0-9_$]*)\1\s*\??\s*:/.exec(line)
                if (mm) {
                    if (!declaredIn.has(mm[2])) declaredIn.set(mm[2], new Set())
                    declaredIn.get(mm[2]).add(`${m[1]} (${relative(SRC, file)})`)
                }
            }
            for (const ch of line) {
                if ('{(['.includes(ch)) d++
                else if ('})]'.includes(ch)) d--
            }
        }
    }
}

/* --- build the corpus outside src/interfaces --- */
const IFACE_DIR = join(SRC, 'interfaces')
const libFiles = walk(SRC).filter((f) => !f.startsWith(IFACE_DIR) && /\.(ts|vue|scss|css)$/.test(f))
const libCorpus = libFiles.map((f) => ({ f, txt: read(f) }))

/* consumer-side corpus: stories, docs, tests, marketing — a name used there
   but nowhere in src is still dead, but it proves the API was advertised. */
const consumerDirs = ['stories', 'docs', 'tests', 'marketing'].map((d) => join(ROOT, 'packages', d)).filter((d) => {
    try { return statSync(d).isDirectory() } catch { return false }
})
const consumerFiles = consumerDirs.flatMap((d) => walk(d))
    .filter((f) => /\.(ts|vue|md|mjs)$/.test(f) && !f.includes('node_modules') && !f.includes('/dist/'))
const consumerCorpus = consumerFiles.map((f) => ({ f, txt: read(f) }))

function hits (corpus, name) {
    const re = new RegExp(`\\b${name}\\b`)
    return corpus.filter((c) => re.test(c.txt))
}

const verbose = process.argv.includes('--verbose')
const dead = []
for (const [prop, ifaces] of declaredIn) {
    const inLib = hits(libCorpus, prop)
    if (inLib.length) continue
    const inConsumers = hits(consumerCorpus, prop)
    dead.push({ prop, ifaces: [...ifaces], consumers: inConsumers.map((c) => relative(ROOT, c.f)) })
}

console.log(`declared property names (all interfaces) : ${declaredIn.size}`)
console.log(`names with ZERO occurrence in src/ outside interfaces: ${dead.length}`)
console.log('')
for (const d of dead.sort((a, b) => b.consumers.length - a.consumers.length)) {
    console.log(`${d.prop}`)
    console.log(`   declared by : ${d.ifaces.join(', ')}`)
    console.log(`   advertised in ${d.consumers.length} consumer file(s)${verbose && d.consumers.length ? ': ' + d.consumers.slice(0, 12).join(', ') : ''}`)
}
