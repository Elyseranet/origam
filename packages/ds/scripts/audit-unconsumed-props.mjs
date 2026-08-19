#!/usr/bin/env node
/**
 * audit-unconsumed-props.mjs
 *
 * Static sweep for props a component DECLARES (through its `defineProps<IXxxProps>()`
 * interface, including every `extends` in the Commons hierarchy) but never
 * CONSUMES — neither in its `<script setup>`, nor in a `<template>` expression,
 * nor transitively through a composable it hands the whole `props` object to.
 *
 * The output is a CANDIDATE list, not a verdict. Static analysis over-reports:
 * a prop can be consumed through a spread, a `v-bind="attrs"`, or a composable
 * shape this script does not model. Every candidate must be confirmed at
 * runtime (two distinct values → identical DOM / computed style) before being
 * called dead. See `--why <Component> <prop>` to inspect one decision.
 *
 * Usage:
 *   node packages/ds/scripts/audit-unconsumed-props.mjs             # summary
 *   node packages/ds/scripts/audit-unconsumed-props.mjs --json      # machine readable
 *   node packages/ds/scripts/audit-unconsumed-props.mjs --component Btn
 *   node packages/ds/scripts/audit-unconsumed-props.mjs --by-prop   # rank props across catalogue
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const SRC = join(HERE, '..', 'src')

/* ------------------------------------------------------------------ */
/* fs helpers                                                          */
/* ------------------------------------------------------------------ */

function walk (dir, filter, out = []) {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)
        const st = statSync(full)
        if (st.isDirectory()) walk(full, filter, out)
        else if (filter(full)) out.push(full)
    }
    return out
}

const read = (f) => readFileSync(f, 'utf8')

/* strip comments so `props.foo` inside a JSDoc block never counts */
function stripComments (src) {
    return src
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
}

/* ------------------------------------------------------------------ */
/* 1. interface graph                                                  */
/* ------------------------------------------------------------------ */

/** name -> { own: Set<string>, extends: string[], file } */
const INTERFACES = new Map()

function indexInterfaces () {
    const files = walk(join(SRC, 'interfaces'), (f) => f.endsWith('.ts'))
    for (const file of files) {
        const src = stripComments(read(file))
        const re = /export\s+interface\s+([A-Za-z0-9_]+)\s*(?:extends\s+([^{]+))?\{/g
        let m
        while ((m = re.exec(src))) {
            const name = m[1]
            const ext = (m[2] || '')
                .split(',')
                .map((s) => s.trim().replace(/<.*$/, ''))
                .filter(Boolean)
            // capture the body with brace matching
            let depth = 1
            let i = re.lastIndex
            while (i < src.length && depth > 0) {
                if (src[i] === '{') depth++
                else if (src[i] === '}') depth--
                i++
            }
            const body = src.slice(re.lastIndex, i - 1)
            INTERFACES.set(name, { own: ownMembers(body), extends: ext, file })
        }
    }
}

/** top-level member names of an interface body (depth-0 only) */
function ownMembers (body) {
    const out = new Set()
    let depth = 0
    let line = ''
    const lines = []
    for (const ch of body) {
        if (ch === '\n') { lines.push([line, depth]); line = ''; continue }
        line += ch
        if ('{(['.includes(ch)) depth++
        else if ('})]'.includes(ch)) depth--
    }
    lines.push([line, depth])
    let d = 0
    for (const [raw] of lines) {
        const trimmed = raw.trim()
        if (d === 0) {
            const m = /^(?:readonly\s+)?(['"]?)([A-Za-z_$][A-Za-z0-9_$]*)\1\s*\??\s*:/.exec(trimmed)
            if (m) out.add(m[2])
        }
        for (const ch of raw) {
            if ('{(['.includes(ch)) d++
            else if ('})]'.includes(ch)) d--
        }
    }
    return out
}

const RESOLVED = new Map()

/** full prop set of an interface, following `extends` */
function resolveInterface (name, seen = new Set()) {
    if (RESOLVED.has(name)) return RESOLVED.get(name)
    if (seen.has(name)) return new Map()
    seen.add(name)
    const def = INTERFACES.get(name)
    /** prop -> declaring interface (nearest wins for reporting) */
    const out = new Map()
    if (!def) return out
    for (const parent of def.extends) {
        for (const [k, v] of resolveInterface(parent, seen)) if (!out.has(k)) out.set(k, v)
    }
    for (const k of def.own) out.set(k, name)
    if (seen.size === 1) RESOLVED.set(name, out)
    return out
}

/* ------------------------------------------------------------------ */
/* 2. const arrays (for `props[KEY]` indexed access)                   */
/* ------------------------------------------------------------------ */

const CONST_ARRAYS = new Map() // NAME -> string[]
const ENUM_MEMBERS = new Map() // "ENUM.MEMBER" -> "value"

function indexEnums () {
    const files = walk(join(SRC, 'enums'), (f) => f.endsWith('.ts'))
    for (const file of files) {
        const src = stripComments(read(file))
        const re = /export\s+(?:const\s+)?enum\s+([A-Za-z0-9_]+)\s*\{([\s\S]*?)\}/g
        let m
        while ((m = re.exec(src))) {
            for (const mm of m[2].matchAll(/([A-Za-z0-9_]+)\s*=\s*['"]([^'"]*)['"]/g)) {
                ENUM_MEMBERS.set(`${m[1]}.${mm[1]}`, mm[2])
            }
        }
        // `export const X = { A: 'a' } as const` also used as an enum
        const re2 = /export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*\{([\s\S]*?)\}\s*as\s+const/g
        while ((m = re2.exec(src))) {
            for (const mm of m[2].matchAll(/([A-Za-z0-9_]+)\s*:\s*['"]([^'"]*)['"]/g)) {
                ENUM_MEMBERS.set(`${m[1]}.${mm[1]}`, mm[2])
            }
        }
    }
}

function indexConstArrays () {
    const files = walk(join(SRC, 'consts'), (f) => f.endsWith('.ts'))
    for (const file of files) {
        const src = stripComments(read(file))
        const re = /export\s+const\s+([A-Z0-9_]+)\s*(?::[^=]+)?=\s*\[([^\]]*)\]/g
        let m
        while ((m = re.exec(src))) {
            const vals = [...m[2].matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1])
            // members written as enum references — resolve them
            for (const mm of m[2].matchAll(/([A-Za-z0-9_]+\.[A-Za-z0-9_]+)/g)) {
                const v = ENUM_MEMBERS.get(mm[1])
                if (v) vals.push(v)
            }
            if (vals.length) CONST_ARRAYS.set(m[1], vals)
        }
    }
}

/* ------------------------------------------------------------------ */
/* 3. composable consumption                                           */
/* ------------------------------------------------------------------ */

/** fn name -> { file, direct: Set<string>, calls: Set<string>, indexed: boolean, wildcard: boolean } */
const COMPOSABLES = new Map()

const PROP_PARAM_NAMES = ['props', 'properties']

function scanPropReads (src, fileSrc = src) {
    const direct = new Set()
    let wildcard = false

    for (const p of PROP_PARAM_NAMES) {
        // props.foo / props?.foo
        for (const m of src.matchAll(new RegExp(`\\b${p}\\s*\\??\\.\\s*([A-Za-z_$][A-Za-z0-9_$]*)`, 'g'))) direct.add(m[1])
        // props['foo']
        for (const m of src.matchAll(new RegExp(`\\b${p}\\s*\\[\\s*['"]([^'"]+)['"]\\s*\\]`, 'g'))) direct.add(m[1])
        // (props as any).foo — the TS cast breaks the plain `props.foo` shape.
        // `useActive` reads its legacy `activeClass` exactly like this, which
        // was the last remaining false-positive cluster (6 components).
        for (const m of src.matchAll(new RegExp(`\\b${p}\\s+as\\s+[^)]*\\)\\s*\\??\\.\\s*([A-Za-z_$][A-Za-z0-9_$]*)`, 'g'))) direct.add(m[1])
        // toRef(props, 'foo') / toRefs
        for (const m of src.matchAll(new RegExp(`toRef\\s*\\(\\s*${p}\\s*,\\s*['"]([^'"]+)['"]`, 'g'))) direct.add(m[1])
        // const { a, b } = props
        for (const m of src.matchAll(new RegExp(`(?:const|let|var)\\s*\\{([^}]*)\\}\\s*=\\s*(?:toRefs\\s*\\(\\s*)?${p}\\b`, 'g'))) {
            for (const part of m[1].split(',')) {
                const nm = part.split(':')[0].split('=')[0].trim().replace(/^\.\.\./, '')
                if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(nm)) direct.add(nm)
            }
        }
        // spread / whole-object forwarding => we cannot tell, treat as wildcard
        if (new RegExp(`\\.\\.\\.\\s*${p}\\b`).test(src)) wildcard = true
        if (new RegExp(`Object\\.(keys|entries|values)\\s*\\(\\s*${p}\\s*\\)`).test(src)) wildcard = true
    }

    // props[SOME_CONST] / props[key] indexed access.
    //
    // The key is a variable, so the set of props actually read is whatever the
    // table being iterated contains. Two shapes exist in this codebase:
    //   1. an EXPORTED const array in src/consts (`DIMENSIONS_ARRAY`);
    //   2. a MODULE-LOCAL table, sometimes an array of tuples
    //      (`TYPOGRAPHY_TOKEN_MAP = [['fontFamily', 'font-family', …], …]`
    //      in typography.composable.ts).
    //
    // Missing shape 2 produced 124 measured false positives (every
    // ITypographyProps prop on every component that calls `useTypography`).
    // A guard's false positives block innocent PRs, so the bias here is
    // deliberately towards over-crediting: harvest every string literal that
    // appears inside an array literal in the file.
    const indexed = /\bprops\s*\[\s*[A-Za-z_$]/.test(src)
    if (indexed) {
        for (const [name, vals] of CONST_ARRAYS) {
            if (new RegExp(`\\b${name}\\b`).test(src)) for (const v of vals) direct.add(v)
        }
        for (const arr of fileSrc.matchAll(/\[([^[\]]*)\]/g)) {
            for (const lit of arr[1].matchAll(/['"]([A-Za-z_$][A-Za-z0-9_$]*)['"]/g)) direct.add(lit[1])
        }
    }

    return { direct, wildcard, indexed }
}

function scanComposableCalls (src) {
    const calls = new Set()
    for (const p of PROP_PARAM_NAMES) {
        for (const m of src.matchAll(new RegExp(`\\b(use[A-Z][A-Za-z0-9_]*)\\s*\\(\\s*${p}\\b`, 'g'))) calls.add(m[1])
    }
    return calls
}

function indexComposables () {
    const files = walk(join(SRC, 'composables'), (f) => f.endsWith('.ts'))
    for (const file of files) {
        const src = stripComments(read(file))
        for (const m of src.matchAll(/export\s+(?:async\s+)?function\s+(use[A-Z][A-Za-z0-9_]*)/g)) {
            const fn = m[1]
            const body = fnBody(src, m.index)
            const { direct, wildcard, indexed } = scanPropReads(body, src)
            COMPOSABLES.set(fn, { file, direct, calls: scanComposableCalls(body), wildcard, indexed })
        }
    }
}

function fnBody (src, from) {
    const open = src.indexOf('{', from)
    if (open < 0) return ''
    let depth = 1
    let i = open + 1
    while (i < src.length && depth > 0) {
        if (src[i] === '{') depth++
        else if (src[i] === '}') depth--
        i++
    }
    return src.slice(open, i)
}

const COMPOSABLE_KEYS = new Map()

function composableKeys (fn, seen = new Set()) {
    if (COMPOSABLE_KEYS.has(fn)) return COMPOSABLE_KEYS.get(fn)
    if (seen.has(fn)) return { keys: new Set(), wildcard: false }
    seen.add(fn)
    const def = COMPOSABLES.get(fn)
    if (!def) return { keys: new Set(), wildcard: true } // unknown => be safe, credit everything
    const keys = new Set(def.direct)
    let wildcard = def.wildcard
    for (const child of def.calls) {
        const r = composableKeys(child, seen)
        for (const k of r.keys) keys.add(k)
        wildcard = wildcard || r.wildcard
    }
    const res = { keys, wildcard }
    if (seen.size === 1) COMPOSABLE_KEYS.set(fn, res)
    return res
}

/* ------------------------------------------------------------------ */
/* 4. component analysis                                               */
/* ------------------------------------------------------------------ */

function splitSfc (src) {
    const grab = (tag) => {
        const open = new RegExp(`<${tag}(\\s[^>]*)?>`, 'i').exec(src)
        if (!open) return ''
        const start = open.index + open[0].length
        const close = src.lastIndexOf(`</${tag}>`)
        return close > start ? src.slice(start, close) : src.slice(start)
    }
    return { template: grab('template'), script: grab('script'), style: grabAllStyles(src) }
}

function grabAllStyles (src) {
    let out = ''
    for (const m of src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) out += m[1] + '\n'
    return out
}

/** identifiers appearing in template BINDING EXPRESSIONS + interpolations */
function templateExpressionIdentifiers (template) {
    const ids = new Set()
    const collect = (expr) => {
        for (const m of expr.matchAll(/[A-Za-z_$][A-Za-z0-9_$]*/g)) ids.add(m[0])
    }
    for (const m of template.matchAll(/\{\{([\s\S]*?)\}\}/g)) collect(m[1])
    // :prop="expr"  v-if="expr"  @evt="expr"  v-bind="expr"  #slot="expr"
    for (const m of template.matchAll(/(?::|v-|@|#)[A-Za-z0-9_$:.\-[\]]*\s*=\s*"([^"]*)"/g)) collect(m[1])
    for (const m of template.matchAll(/(?::|v-|@|#)[A-Za-z0-9_$:.\-[\]]*\s*=\s*'([^']*)'/g)) collect(m[1])
    return ids
}

/** blank the balanced `(...)` region that follows `from` (index of the `(`) */
function blankBalanced (src, openIdx) {
    let depth = 0
    let i = openIdx
    for (; i < src.length; i++) {
        if (src[i] === '(') depth++
        else if (src[i] === ')') { depth--; if (depth === 0) { i++; break } }
    }
    return src.slice(0, openIdx) + ' '.repeat(i - openIdx) + src.slice(i)
}

/*********************************************************
 * blankModuleSpecifiers
 *
 * @description
 * Remplace par des blancs le contenu des chaînes de CHEMIN D'IMPORT, et
 * elles seules : `from '…'`, `import '…'`, `export … from '…'`.
 *
 * @description
 * Sans ça, le tokenizer ci-dessous compte les segments du chemin comme des
 * identifiants du script. Un composant important
 * `'../../composables/Commons/activator.composable'` produit un token
 * `activator`, et sa prop `activator` passe pour consommée alors qu'elle ne
 * l'est nulle part. Neuf props étaient dans ce cas — `active` (via
 * `active.composable`), `location`, `style`, `activator` — toutes devenues
 * invisibles à l'audit au moment où le codemod #366 a remplacé les imports
 * de barrel par les vrais noms de fichiers.
 *
 * @description
 * ⛔ NE PAS élargir aux autres chaînes. Une prop est légitimement consommée
 * par une chaîne dans ce dépôt : `useActive(props, 'modelValue')`,
 * `useBackgroundColor(props, 'bgColor')`, `useTextColor(props, 'color')`.
 * Effacer toutes les chaînes transformerait ce faux négatif en une volée de
 * faux positifs — des props bien consommées signalées comme mortes.
 ********************************************************/
function blankModuleSpecifiers (src) {
    return src.replace(/(\bfrom\s*|\bimport\s*)(['"])([^'"\n]*)\2/g,
        (_, head, quote, body) => `${head}${quote}${' '.repeat(body.length)}${quote}`)
}

/** identifiers in the script, excluding the defineProps / withDefaults header */
function scriptIdentifiers (script) {
    let src = blankModuleSpecifiers(stripComments(script))
    // blank the whole `withDefaults( … )` / `defineProps( … )` call, brace-matched.
    // A regex cannot do this: the defaults object legitimately contains nested
    // braces and the lazy form over-ate ~170 lines of real code on OrigamCard.
    for (const kw of ['withDefaults', 'defineProps']) {
        let idx
        while ((idx = src.indexOf(kw)) >= 0) {
            const open = src.indexOf('(', idx)
            if (open < 0) break
            const before = src.slice(0, idx)
            src = before + ' '.repeat(kw.length) + blankBalanced(src, open).slice(idx + kw.length)
        }
    }
    const ids = new Set()
    for (const m of src.matchAll(/[A-Za-z_$][A-Za-z0-9_$]*/g)) ids.add(m[0])
    return { ids, src }
}

function analyseComponent (file) {
    const raw = read(file)
    const { template, script, style } = splitSfc(raw)
    const name = basename(file, '.vue')

    const dp = /defineProps\s*<\s*([A-Za-z0-9_]+)\s*>/.exec(script)
    if (!dp) return null
    const iface = dp[1]
    const declared = resolveInterface(iface)
    if (!declared.size) return null

    const { ids: scriptIds, src: cleanScript } = scriptIdentifiers(script)
    const tplIds = templateExpressionIdentifiers(template)

    // explicit props.X reads
    const explicit = new Set()
    for (const m of cleanScript.matchAll(/\bprops\s*\??\.\s*([A-Za-z_$][A-Za-z0-9_$]*)/g)) explicit.add(m[1])
    for (const m of cleanScript.matchAll(/\bprops\s*\[\s*['"]([^'"]+)['"]\s*\]/g)) explicit.add(m[1])

    // composables handed the whole props object
    const forwarded = new Set()
    const forwardedBy = new Map()
    let wildcard = false
    const wildcardReasons = []
    for (const m of cleanScript.matchAll(/\b(use[A-Z][A-Za-z0-9_]*)\s*\(\s*props\b/g)) {
        const { keys, wildcard: w } = composableKeys(m[1])
        for (const k of keys) { forwarded.add(k); if (!forwardedBy.has(k)) forwardedBy.set(k, m[1]) }
        if (w) { wildcard = true; wildcardReasons.push(`${m[1]}() forwards/enumerates props`) }
    }
    // raw spreads of props
    if (/\.\.\.\s*props\b/.test(cleanScript)) { wildcard = true; wildcardReasons.push('`...props` spread in script') }
    if (/v-bind\s*=\s*"props"/.test(template)) { wildcard = true; wildcardReasons.push('`v-bind="props"` in template') }
    /*
     * `filterProps(props, …)` IS wholesale forwarding, and treating it as an
     * "explicit key list" was a measured mistake.
     *
     * `useProps().filterProps(properties, excludes)` keeps every key of
     * `properties` that also exists on the component's own props. Called as
     * `childRef.filterProps(props, […])` — which is how all 42 call sites in
     * this catalogue are written, and there is not a single object-literal
     * call — it hands the CHILD every prop the two components share. So a
     * parent like `OrigamContextualMenu` (`OrigamContextualMenu.vue:83`,
     * bound at line 11 via `v-bind="menuProps"`) does not read `location`,
     * `offset`, `items`… itself; it forwards them. They are alive.
     *
     * Before this fix those 42 components contributed the bulk of the
     * candidate list — `OrigamContextualMenu` alone scored 109 of its 117
     * props. Every one of those was noise.
     */
    if (/\bfilterProps\s*\(\s*props\b/.test(cleanScript)) {
        wildcard = true
        wildcardReasons.push('filterProps(props, …) forwards every shared prop to a child')
    }
    if (/mergeProps\s*\(\s*props\b/.test(cleanScript)) { wildcard = true; wildcardReasons.push('mergeProps(props, …)') }

    const unconsumed = []
    for (const [prop, from] of declared) {
        if (explicit.has(prop)) continue
        if (forwarded.has(prop)) continue
        if (tplIds.has(prop)) continue
        if (scriptIds.has(prop)) continue
        unconsumed.push({ prop, declaredBy: from })
    }

    return {
        name,
        file: file.slice(file.indexOf('packages/')),
        iface,
        declaredCount: declared.size,
        unconsumed,
        wildcard,
        wildcardReasons,
        style: style.trim().length,
        templateClasses: [...template.matchAll(/origam-[a-z0-9-]+(?:--[a-z0-9-]+)*/g)].map((m) => m[0])
    }
}

/* ------------------------------------------------------------------ */
/* main                                                                */
/* ------------------------------------------------------------------ */

/**
 * Runs the whole analysis and returns one entry per component.
 *
 * Exported so the CI guard (`scripts/guards/unconsumed-props.mjs`) shares the
 * exact analysis this file is measured on, instead of a drifting copy of it.
 * Measured against the runtime sweep: precision 100 % (0 false positives on
 * 1 997 flagged pairs), recall 83.1 %. The bias is deliberate — a guard's
 * false positive blocks an innocent PR, a false negative only misses debt.
 */
export function analyse () {
    if (!INTERFACES.size) {
        indexInterfaces()
        indexEnums()
        indexConstArrays()
        indexComposables()
    }
    const componentFiles = walk(join(SRC, 'components'), (f) => f.endsWith('.vue')).sort()
    return componentFiles.map(analyseComponent).filter(Boolean)
}

/* ------------------------------------------------------------------ */
/* CLI — skipped when this module is imported (e.g. by the guard)      */
/* ------------------------------------------------------------------ */

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (!invokedDirectly) {
    // imported as a library — nothing else to do
} else {
main()
}

function main () {
const results = analyse()

const argv = process.argv.slice(2)
const flag = (n) => argv.includes(n)
const val = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null }

if (flag('--json')) {
    const out = val('--out')
    const payload = JSON.stringify(results, null, 2)
    if (out) { writeFileSync(out, payload); console.log(`wrote ${out}`) } else console.log(payload)
    process.exit(0)
}

const only = val('--component')
if (only) {
    const r = results.find((x) => x.name === only || x.name === `Origam${only}`)
    if (!r) { console.error(`no component ${only}`); process.exit(1) }
    console.log(`${r.name}  <${r.iface}>  ${r.declaredCount} declared props`)
    if (r.wildcard) console.log(`  ⚠ wildcard forwarding: ${r.wildcardReasons.join('; ')}`)
    for (const u of r.unconsumed) console.log(`  ✗ ${u.prop}  (from ${u.declaredBy})`)
    process.exit(0)
}

if (flag('--by-prop')) {
    const byProp = new Map()
    for (const r of results) {
        if (r.wildcard) continue
        for (const u of r.unconsumed) {
            if (!byProp.has(u.prop)) byProp.set(u.prop, { declaredBy: u.declaredBy, comps: [] })
            byProp.get(u.prop).comps.push(r.name)
        }
    }
    const rows = [...byProp.entries()].sort((a, b) => b[1].comps.length - a[1].comps.length)
    for (const [prop, info] of rows) {
        console.log(`${String(info.comps.length).padStart(4)}  ${prop.padEnd(26)} ${info.declaredBy}`)
    }
    process.exit(0)
}

const clean = results.filter((r) => !r.wildcard)
const totalDeclared = results.reduce((a, r) => a + r.declaredCount, 0)
const totalUnconsumed = clean.reduce((a, r) => a + r.unconsumed.length, 0)

console.log(`components analysed        : ${results.length}`)
console.log(`  with wildcard forwarding : ${results.length - clean.length}  (excluded — cannot decide statically)`)
console.log(`cumulative declared props  : ${totalDeclared}`)
console.log(`candidate unconsumed props : ${totalUnconsumed}  (in ${clean.filter((r) => r.unconsumed.length).length} components)`)
console.log('')
for (const r of clean.filter((x) => x.unconsumed.length).sort((a, b) => b.unconsumed.length - a.unconsumed.length)) {
    console.log(`${r.name} (${r.unconsumed.length}/${r.declaredCount})`)
    console.log(`   ${r.unconsumed.map((u) => u.prop).join(', ')}`)
}
}
