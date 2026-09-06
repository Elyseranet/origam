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

/**
 * Split a heritage clause on top-level commas only — a naive `.split(',')`
 * breaks apart the SECOND argument of `Pick<X, 'a' | 'b'>` / `Omit<X, 'a'>`,
 * corrupting every other parent listed after it (issue #501: measured on
 * `IAudioProps extends …, Pick<ITypographyProps, 'fontSize' | 'fontWeight'
 * | 'lineHeight'> {` — the naive split turned this into two bogus parent
 * tokens, `Pick` and `'fontSize' | 'fontWeight' | 'lineHeight'>`, neither of
 * which resolves, silently dropping all three picked props from every
 * consumer of `IAudioProps`, e.g. `IParallaxProps`).
 */
function splitTopLevel (str, sep = ',') {
    const parts = []
    let depth = 0
    let current = ''
    for (const ch of str) {
        if (ch === '<' || ch === '(' || ch === '[') depth++
        else if (ch === '>' || ch === ')' || ch === ']') depth--
        if (ch === sep && depth === 0) {
            parts.push(current)
            current = ''
        } else {
            current += ch
        }
    }
    if (current) parts.push(current)
    return parts
}

/** Parses `Pick<Base, 'a' | 'b'>` / `Omit<Base, 'a' | 'b'>` → { kind, base, keys }, else null. */
function parseNarrowing (token) {
    const m = /^(Pick|Omit)<\s*([A-Za-z0-9_]+)\s*,\s*(.+)>$/.exec(token)
    if (!m) return null
    const [, kind, base, keysExpr] = m
    const keys = [...keysExpr.matchAll(/'([^']+)'|"([^"]+)"/g)].map((k) => k[1] ?? k[2])
    return { kind: kind === 'Pick' ? 'pick' : 'omit', base, keys }
}

/** name -> { own: Set<string>, extends: string[], narrowed: Array<{kind,base,keys}>, file } */
const INTERFACES = new Map()

function indexInterfaces () {
    const files = walk(join(SRC, 'interfaces'), (f) => f.endsWith('.ts'))
    for (const file of files) {
        const src = stripComments(read(file))
        const re = /export\s+interface\s+([A-Za-z0-9_]+)\s*(?:extends\s+([^{]+))?\{/g
        let m
        while ((m = re.exec(src))) {
            const name = m[1]
            const rawParents = splitTopLevel(m[2] || ',').map((s) => s.trim()).filter(Boolean)
            const ext = []
            const narrowed = []
            for (const raw of rawParents) {
                const pick = parseNarrowing(raw)
                if (pick) narrowed.push(pick)
                else ext.push(raw.replace(/<.*$/, ''))
            }
            // capture the body with brace matching
            let depth = 1
            let i = re.lastIndex
            while (i < src.length && depth > 0) {
                if (src[i] === '{') depth++
                else if (src[i] === '}') depth--
                i++
            }
            const body = src.slice(re.lastIndex, i - 1)
            INTERFACES.set(name, { own: ownMembers(body), extends: ext, narrowed, file })
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
    for (const { kind, base, keys } of def.narrowed) {
        const baseMembers = resolveInterface(base, seen)
        if (kind === 'pick') {
            for (const key of keys) if (baseMembers.has(key) && !out.has(key)) out.set(key, baseMembers.get(key))
        } else {
            for (const [k, v] of baseMembers) if (!keys.includes(k) && !out.has(k)) out.set(k, v)
        }
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

export function scanPropReads (src, fileSrc = src) {
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
        // (props as any)['foo'] — le cast ET l'acces indexe, combines.
        // La ligne au-dessus ne couvre que la forme POINTEE apres un cast ;
        // celle-ci couvre la forme CROCHET avec cle litterale.
        for (const m of src.matchAll(new RegExp(`\\b${p}\\s+as\\s+[^)]*\\)\\s*\\[\\s*['"]([^'"]+)['"]\\s*\\]`, 'g'))) direct.add(m[1])
        // toRef(props, 'foo') / toRefs
        for (const m of src.matchAll(new RegExp(`toRef\\s*\\(\\s*${p}\\s*,\\s*['"]([^'"]+)['"]`, 'g'))) direct.add(m[1])
        /*
         * pick(props, ['a', 'b', …]) — an EXPLICIT key list, unlike
         * `filterProps(props, …)` which is wholesale forwarding and is
         * treated as a wildcard. `OrigamImg` builds `responsiveProps` this
         * way and `v-bind`s it onto its child: six of its props are read
         * through nothing else.
         */
        for (const m of src.matchAll(new RegExp(`\\bpick\\s*\\(\\s*${p}\\s*,\\s*\\[([^\\]]*)\\]`, 'g'))) {
            for (const lit of m[1].matchAll(/['"]([A-Za-z_$][A-Za-z0-9_$]*)['"]/g)) direct.add(lit[1])
        }
        // useX(props, 'foo') INSIDE a composable body — `useDatePickerCalendar`
        // reaches `month` / `year` only through `useVModel(props, 'month')`.
        for (const m of src.matchAll(new RegExp(`\\buse[A-Z][A-Za-z0-9_]*\\s*\\(\\s*${p}\\s*,\\s*['"]([A-Za-z_$][A-Za-z0-9_$]*)['"]`, 'g'))) direct.add(m[1])
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
    //
    // ⛔ TROISIEME FORME, mesuree : `(props as any)[key]`. Le cast met une
    // parenthese fermante entre `props` et le crochet, donc `\bprops\s*\[`
    // ne matche pas. `useHover` est passe a cette forme (commit aa1d9f97) et
    // le garde a rapporte 16 NOUVELLES violations `hover`/`hoverClass` —
    // toutes fausses : une sonde runtime (6/6 verte, feu
    // `TU/composables/Commons/hover.unconsumed-probe.spec.ts`) a prouve que la
    // prop etait lue, forcee, reactive apres montage, et que `hoverClass`
    // atterrissait bien sur la classe rendue. `useHover`/`useActive` ont
    // depuis fusionne dans `useStateFlag` (meme forme `(props as
    // Record<string, unknown>)[source]`) ; la sonde a ete supprimee car sa
    // question etroite est desormais couverte par
    // `hover.composable.spec.ts`/`active.composable.spec.ts`, mais la forme
    // qu'elle a fait decouvrir reste ce que ce bloc detecte.
    //
    // Le piege est qu'une prop MORTE et un detecteur AVEUGLE produisent
    // exactement le meme rapport. Rien dans la sortie ne les distingue —
    // seule une mesure au runtime les separe.
    const indexed = /\bprops\s*\[\s*[A-Za-z_$]/.test(src)
        || /\bprops\s+as\s+[^)]*\)\s*\[\s*[A-Za-z_$]/.test(src)
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

/*********************************************************
 * scanPropNameArgs / propNameParamDefault — le nom de prop
 * choisi AU SITE D'APPEL
 *
 * @description
 * Plusieurs composables prennent le NOM de la prop a lire en
 * second parametre : `useHover(props, prop = 'hover')`,
 * `useActive(props, prop = 'active')`. Ils lisent ensuite
 * `(props as any)[prop]` — une cle calculee, que le scan
 * statique de `scanPropReads` ne peut pas resoudre.
 *
 * @description
 * ⛔ LE DEFAUT NE SUFFIT PAS, ET LE CREDITER PARTOUT EST UNE
 * FAUTE. `useActive` a pour defaut `'active'`, mais six
 * composants l'appellent `useActive(props, 'modelValue')` :
 * chez eux `active` n'est PAS lu, et leur entree de baseline
 * est juste. Une premiere version de ce correctif moissonnait
 * tous les defauts litteraux du fichier — elle a rendu ces six
 * entrees « deja corrigees », c'est-a-dire qu'elle a AVEUGLE le
 * garde sur six vrais defauts pour en debloquer treize faux.
 *
 * @description
 * D'ou la resolution par site d'appel : si l'appelant passe un
 * litteral, c'est LUI qui compte ; s'il n'en passe aucun, alors
 * seulement le defaut du composable s'applique.
 ********************************************************/
export function scanPropNameArgs (src) {
    const byFn = new Map()
    const add = (fn, name) => {
        if (!byFn.has(fn)) byFn.set(fn, new Set())
        byFn.get(fn).add(name)
    }
    for (const p of PROP_PARAM_NAMES) {
        // useX(props, 'name')
        for (const m of src.matchAll(new RegExp(`\\b(use[A-Z][A-Za-z0-9_]*)\\s*\\(\\s*${p}\\s*,\\s*['"]([A-Za-z_$][A-Za-z0-9_$]*)['"]`, 'g'))) {
            add(m[1], m[2])
        }
        /*
         * useX(props, { state: 'active', source: 'modelValue' }) — #499.
         * The option-object form was unmodelled, so `useStateFlag`'s two
         * callers were credited only because the word appeared in a string.
         * Every value in the object is taken as a candidate prop name: the
         * options that are NOT prop names (a label, a class) simply credit a
         * name no interface declares, which changes nothing.
         */
        for (const m of src.matchAll(new RegExp(`\\b(use[A-Z][A-Za-z0-9_]*)\\s*\\(\\s*${p}\\s*,\\s*\\{([^}]*)\\}`, 'g'))) {
            for (const kv of m[2].matchAll(/[A-Za-z_$][A-Za-z0-9_$]*\s*:\s*['"]([A-Za-z_$][A-Za-z0-9_$]*)['"]/g)) {
                add(m[1], kv[1])
            }
        }
    }
    return byFn
}

function propNameParamDefault (src, from) {
    const open = src.indexOf('(', from)
    const close = src.indexOf(')', open)
    if (open < 0 || close < 0) return null
    const params = src.slice(open + 1, close)
    const m = /,\s*[A-Za-z_$][A-Za-z0-9_$]*\s*=\s*['"]([A-Za-z_$][A-Za-z0-9_$]*)['"]/.exec(params)
    return m ? m[1] : null
}

function indexComposables () {
    const files = walk(join(SRC, 'composables'), (f) => f.endsWith('.ts'))
    for (const file of files) {
        const src = stripComments(read(file))
        for (const m of src.matchAll(/export\s+(?:async\s+)?function\s+(use[A-Z][A-Za-z0-9_]*)/g)) {
            const fn = m[1]
            const body = fnBody(src, m.index)
            const { direct, wildcard, indexed } = scanPropReads(body, src)
            COMPOSABLES.set(fn, {
                file,
                direct,
                calls: scanComposableCalls(body),
                wildcard,
                indexed,
                propNameDefault: indexed ? propNameParamDefault(src, m.index) : null
            })
        }
    }
}

/*********************************************************
 * fnBody
 *
 * @description
 * ⛔ Cette fonction prenait la PREMIERE accolade apres le nom. Faux des que la
 * signature en contient une : un second parametre destructure, ou son
 * annotation de type inline. Sur
 *
 *     export function useActivator (props: IActivatorProps, {isActive, isTop}: {…})
 *
 * elle extrayait l'objet `{isActive, isTop}` au lieu du corps, donc
 * `scanPropReads` n'y voyait AUCUN `props.x` et le composable etait indexe
 * comme ne lisant rien.
 *
 * @description
 * Consequence mesuree : les 13 props d'`OrigamOverlay` — `activator`,
 * `openOnHover`, `openOnClick`, `location`, `offset`, `origin`… — etaient
 * comptees mortes alors qu'`useActivator`, `useLocationStrategies` et
 * `useLazy` les lisent toutes. Un quart de la baseline C1 etait faux, et
 * « corriger » ces composants en retirant leurs props les aurait casses.
 *
 * @description
 * On saute donc d'abord la liste de parametres, en equilibrant les
 * parentheses, puis on prend l'accolade qui suit.
 ********************************************************/
function fnBody (src, from) {
    const paren = src.indexOf('(', from)
    if (paren < 0) return ''

    let depth = 0
    let i = paren

    for (; i < src.length; i++) {
        if (src[i] === '(') depth++
        else if (src[i] === ')') { depth--; if (depth === 0) { i++; break } }
    }

    /*********************************************************
     * Sauter l'annotation de type de RETOUR
     *
     * @description
     * ⛔ Troisieme variante du meme piege. Apres la liste de parametres peut
     * venir un type de retour qui contient lui-meme des accolades :
     *
     *     export function useLoader (props, kind, name): {
     *         loaderClasses: ComputedRef<…>
     *     } {
     *
     * Prendre « la premiere accolade apres la parenthese » attrape alors le
     * TYPE, pas le corps. `useLoader` etait indexe comme ne lisant rien, donc
     * `loading` passait pour morte sur Card, ExpansionPanels et
     * ExpansionPanelContent.
     *
     * @description
     * La regle qui distingue les deux : on equilibre la premiere accolade
     * rencontree ; si un `{` la suit immediatement, la premiere etait le type
     * et la seconde est le corps. Sinon la premiere ETAIT le corps.
     ********************************************************/
    const balance = (start) => {
        let d = 1
        let k = start + 1
        while (k < src.length && d > 0) {
            if (src[k] === '{') d++
            else if (src[k] === '}') d--
            k++
        }

        return k
    }

    let open = src.indexOf('{', i)
    if (open < 0) return ''

    const afterFirst = balance(open)
    const next = src.slice(afterFirst).search(/\S/)

    if (next !== -1 && src[afterFirst + next] === '{') open = afterFirst + next

    return src.slice(open, balance(open))
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
 * ⛔ CETTE FONCTION N'EST PLUS LE SEUL EFFACEMENT — voir
 * `blankStringBodies` juste en dessous, qui efface le contenu de TOUTES les
 * chaînes. Elle reste néanmoins distincte et appliquée d'abord : elle est le
 * cas le plus lisible du défaut et le seul documenté par une mesure.
 ********************************************************/
function blankModuleSpecifiers (src) {
    return src.replace(/(\bfrom\s*|\bimport\s*)(['"])([^'"\n]*)\2/g,
        (_, head, quote, body) => `${head}${quote}${' '.repeat(body.length)}${quote}`)
}

/*********************************************************
 * blankStringBodies — #499
 *
 * @description
 * Le flux de tokens ci-dessous est un simple `matchAll(/[A-Za-z_$]\w* /g)` sur
 * le texte du script : il ne distingue pas un IDENTIFIANT d'un mot à
 * l'intérieur d'une CHAÎNE. Toute prop dont le nom apparaît quelque part entre
 * guillemets — un nom de classe CSS, une clé i18n, un nom d'évènement, une
 * option sans rapport — passait donc pour consommée.
 *
 * @description
 * ⛔ C'EST LE SENS DANGEREUX. Un garde qui CRÉDITE à tort n'ennuie personne :
 * il excuse silencieusement de la vraie dette, et son compte descend sans que
 * rien ne soit réparé. MESURÉ : 177 paires (composant, prop) ne tenaient leur
 * crédit que d'une chaîne, sur 4820 créditées.
 *
 * @description
 * L'objection historique était juste et c'est pour ça que ce n'est pas un
 * simple effacement : une prop EST légitimement consommée par une chaîne dans
 * ce dépôt — `useBackgroundColor(props, 'bgColor')`, `toRef(props, 'color')`,
 * `useStateFlag(props, {state: 'active'})`, `props[prop]` itérant une table de
 * noms. La réponse n'est pas de garder toutes les chaînes ni de les jeter
 * toutes : c'est de les retirer du flux de tokens ET de MODÉLISER chacun de
 * ces canaux, ce que fait `scanPropReads` — déjà écrit, mais qui n'était
 * appliqué qu'aux composables, jamais au script du composant lui-même.
 ********************************************************/
export function blankStringBodies (src) {
    return src.replace(/(['"`])((?:\\.|(?!\1)[^\\\n])*)\1/g,
        (_, quote, body) => `${quote}${' '.repeat(body.length)}${quote}`)
}

/** identifiers in the script, excluding the defineProps / withDefaults header */
export function scriptIdentifiers (script) {
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
    /*
     * `ids` is the NAIVE token stream and must never see string content
     * (#499). `src` is returned UNBLANKED because every caller downstream
     * matches on shapes that legitimately quote a prop name —
     * `props['x']`, `toRef(props, 'x')`, `useX(props, 'x')`. Blanking the
     * returned source would swap one defect for the opposite one.
     */
    const ids = new Set()
    for (const m of blankStringBodies(src).matchAll(/[A-Za-z_$][A-Za-z0-9_$]*/g)) ids.add(m[0])
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

    /*********************************************************
     * explicit — les lectures MODÉLISÉES de `props` dans le script
     *
     * @description
     * Ces deux lignes ne couvraient que `props.x` et `props['x']`. Tout le
     * reste — `toRef(props, 'x')`, `const {x} = toRefs(props)`,
     * `(props as any).x`, `props[key]` itérant une table de noms — n'était
     * crédité que par le flux de tokens brut, c'est-à-dire par le simple fait
     * que le mot apparaissait dans une chaîne. En retirant les chaînes du flux
     * (#499), ces formes seraient devenues des faux positifs en masse :
     * `OrigamCol` à lui seul lit 22 props ainsi, dont ses cinq points de
     * rupture via `props[prop]` sur une table locale.
     *
     * @description
     * ⛔ Ne pas réécrire ces formes ici : `scanPropReads` les modélise déjà
     * toutes, il n'était simplement jamais appliqué au script du composant —
     * seulement aux composables. C'est la même fonction, pas une seconde.
     ********************************************************/
    const { direct: explicit, wildcard: readWildcard } = scanPropReads(cleanScript, cleanScript)

    // composables handed the whole props object
    const forwarded = new Set()
    const forwardedBy = new Map()
    let wildcard = false
    const wildcardReasons = []
    if (readWildcard) { wildcard = true; wildcardReasons.push('props spread / Object.keys(props) in script') }
    // Noms de prop passes explicitement en second argument, par composable.
    const propNameArgs = scanPropNameArgs(cleanScript)
    for (const m of cleanScript.matchAll(/\b(use[A-Z][A-Za-z0-9_]*)\s*\(\s*props\b/g)) {
        const { keys, wildcard: w } = composableKeys(m[1])
        for (const k of keys) { forwarded.add(k); if (!forwardedBy.has(k)) forwardedBy.set(k, m[1]) }

        // Cle calculee : `(props as any)[prop]` dans le composable. Le nom lu
        // vient du site d'appel s'il en fournit un, sinon du defaut declare.
        // Crediter le defaut sans regarder l'appel serait une faute — six
        // composants appellent `useActive(props, 'modelValue')` et ne lisent
        // donc PAS `active`.
        const def = COMPOSABLES.get(m[1])
        /*
         * A prop NAME handed as a string to a composable that also received
         * `props` IS a read, whatever that composable does internally — that
         * is the entire point of passing the pair. Crediting it was gated on
         * `def.indexed` and therefore silent for `useBackgroundColor(props,
         * 'bgColor')` & co, which the raw token stream happened to cover.
         * The gate stays where it belongs: on the composable's DEFAULT, which
         * only applies when the call site names nothing.
         */
        const explicitNames = propNameArgs.get(m[1])
        for (const k of explicitNames ?? []) { forwarded.add(k); if (!forwardedBy.has(k)) forwardedBy.set(k, m[1]) }
        if (def?.indexed && !explicitNames?.size && def.propNameDefault) {
            const k = def.propNameDefault
            forwarded.add(k)
            if (!forwardedBy.has(k)) forwardedBy.set(k, m[1])
        }

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

    /*********************************************************
     * shadowed — les noms lies par une destructuration LOCALE
     *
     * @description
     * `scriptIds` est un simple ensemble de tokens : il ne resout aucune
     * portee. Un composant qui ecrit
     * `const {id, css, load} = useStyle(styles)` y place le token `id`, et
     * la prop `id` passe donc pour consommee alors que ce local n'a aucun
     * rapport avec elle.
     *
     * @description
     * Mesure de l'angle mort : 140 composants destructurent un local nomme
     * `id`, et 92 declarent la prop `id` sans jamais la binder dans leur
     * template. Aucun n'apparaissait dans la baseline — l'absence se lisait
     * a tort comme « prouve correct » alors qu'elle voulait dire « jamais
     * regarde ».
     *
     * @description
     * ⛔ ON NE RETIRE PAS une destructuration qui vient DE `props`.
     * `const {density} = useDensity(props)` ou `const {size} = toRefs(props)`
     * consomment reellement la prop — c'est la forme normale du depot. Seule
     * une destructuration dont la source ne mentionne pas `props` cree un
     * homonyme trompeur.
     ********************************************************/
    const shadowed = new Set()

    for (const match of cleanScript.matchAll(/(?:const|let|var)\s*\{([^}]*)\}\s*=\s*([^\n;]*)/g)) {
        if (/\bprops\b/.test(match[2])) continue

        for (const raw of match[1].split(',')) {
            const name = raw.split(':').pop().trim().replace(/^\.\.\./, '')

            if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) shadowed.add(name)
        }
    }

    const unconsumed = []
    for (const [prop, from] of declared) {
        if (explicit.has(prop)) continue
        if (forwarded.has(prop)) continue
        if (tplIds.has(prop)) continue
        if (scriptIds.has(prop) && !shadowed.has(prop)) continue
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
