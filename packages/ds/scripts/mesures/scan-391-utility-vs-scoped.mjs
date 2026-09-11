#!/usr/bin/env node
/**
 * #391 volet 2 — remeasure "classes-first utility loses to Vue's scoped
 * selector" scope.
 *
 * Mechanism: a Vue SFC's `<style scoped>` root-BEM selector compiles to
 * `.origam-xxx[data-v-hash]` (specificity 0,2,0). A global utility class
 * from `origam-utilities.css` is a plain `.origam--color-primary`
 * (specificity 0,1,0). If the component's OWN scoped root rule declares
 * the SAME CSS property unconditionally, it wins regardless of source
 * order or which value either side carries — the utility class is dead
 * on arrival for that property, on that component.
 *
 * Two tiers reported:
 *   Tier 1 (structural) — root selector declares one of the 9 tracked
 *     utility properties, unconditionally, full stop.
 *   Tier 2 (confirmed live channel) — Tier 1 AND the component's own
 *     <script setup> calls a composable that is documented/verified to
 *     emit the SAME-named utility class (useStateEffect bundles color/
 *     bgColor/border/rounded/elevation/padding/margin; useSize emits
 *     the font-size utility; useBackgroundColor/useTextColor/useBorder/
 *     useRounded/useElevation/useMargin/usePadding are the standalone
 *     equivalents). Tier 2 is the "real, exploitable bug" count — a
 *     structural conflict with NO live prop channel behind it can never
 *     actually be triggered by a consumer.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { parse as parseSFC } from 'vue/compiler-sfc'

const DS_SRC = path.resolve(process.cwd(), 'packages/ds/src')
const COMPONENTS_DIR = path.join(DS_SRC, 'components')
const UTILITIES_CSS = path.join(DS_SRC, 'assets/css/tokens/origam-utilities.css')

// ---- 1. utility property inventory -----------------------------------
const utilCss = readFileSync(UTILITIES_CSS, 'utf8')
const utilRuleRe = /\.origam--([\w-]+)\s*\{([^}]*)\}/g
const utilityByClass = new Map() // className -> Set<property>
let m
while ((m = utilRuleRe.exec(utilCss))) {
    const cls = 'origam--' + m[1]
    const body = m[2]
    const props = new Set()
    body.split(';').forEach((decl) => {
        const [prop] = decl.split(':')
        if (prop && prop.trim()) props.add(prop.trim())
    })
    utilityByClass.set(cls, props)
}

const TRACKED_PROPS = new Set([
    'color', 'background-color', 'box-shadow', 'border-radius',
    'border-width', 'border-style', 'padding', 'margin', 'gap', 'font-size',
    'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
    'border-block-width', 'border-inline-width', 'border-block-start-width', 'border-block-end-width',
    'border-inline-start-width', 'border-inline-end-width',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'padding-block', 'padding-inline', 'padding-block-start', 'padding-block-end',
    'padding-inline-start', 'padding-inline-end',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'margin-block', 'margin-inline', 'margin-block-start', 'margin-block-end',
    'margin-inline-start', 'margin-inline-end'
])

// property -> which composable name(s) confirm a live class channel
const BORDER_COMPOSABLES = ['useStateEffect', 'useBorder']
const PADDING_COMPOSABLES = ['useStateEffect', 'usePadding']
const MARGIN_COMPOSABLES = ['useStateEffect', 'useMargin']

const PROP_TO_COMPOSABLES = {
    'color': ['useStateEffect', 'useTextColor', 'useColorEffect'],
    'background-color': ['useStateEffect', 'useBackgroundColor', 'useColorEffect'],
    'box-shadow': ['useStateEffect', 'useElevation'],
    'border-radius': ['useStateEffect', 'useRounded'],
    'border-width': BORDER_COMPOSABLES,
    'border-style': BORDER_COMPOSABLES,
    'border-top-width': BORDER_COMPOSABLES,
    'border-right-width': BORDER_COMPOSABLES,
    'border-bottom-width': BORDER_COMPOSABLES,
    'border-left-width': BORDER_COMPOSABLES,
    'border-block-width': BORDER_COMPOSABLES,
    'border-inline-width': BORDER_COMPOSABLES,
    'border-block-start-width': BORDER_COMPOSABLES,
    'border-block-end-width': BORDER_COMPOSABLES,
    'border-inline-start-width': BORDER_COMPOSABLES,
    'border-inline-end-width': BORDER_COMPOSABLES,
    'padding': PADDING_COMPOSABLES,
    'padding-top': PADDING_COMPOSABLES,
    'padding-right': PADDING_COMPOSABLES,
    'padding-bottom': PADDING_COMPOSABLES,
    'padding-left': PADDING_COMPOSABLES,
    'padding-block': PADDING_COMPOSABLES,
    'padding-inline': PADDING_COMPOSABLES,
    'padding-block-start': PADDING_COMPOSABLES,
    'padding-block-end': PADDING_COMPOSABLES,
    'padding-inline-start': PADDING_COMPOSABLES,
    'padding-inline-end': PADDING_COMPOSABLES,
    'margin': MARGIN_COMPOSABLES,
    'margin-top': MARGIN_COMPOSABLES,
    'margin-right': MARGIN_COMPOSABLES,
    'margin-bottom': MARGIN_COMPOSABLES,
    'margin-left': MARGIN_COMPOSABLES,
    'margin-block': MARGIN_COMPOSABLES,
    'margin-inline': MARGIN_COMPOSABLES,
    'margin-block-start': MARGIN_COMPOSABLES,
    'margin-block-end': MARGIN_COMPOSABLES,
    'margin-inline-start': MARGIN_COMPOSABLES,
    'margin-inline-end': MARGIN_COMPOSABLES,
    'gap': ['useStateEffect'],
    'font-size': ['useSize']
}

// ---- 2. walk component files ------------------------------------------
function walk (dir) {
    const out = []
    for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry)
        const st = statSync(full)
        if (st.isDirectory()) out.push(...walk(full))
        else if (/^Origam.*\.vue$/.test(entry)) out.push(full)
    }
    return out
}

function stripComments (css) {
    return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

// Brace-depth walker: given style content and a root class name, return
// the list of DIRECT (depth===1 relative to the rule) declarations for
// EVERY top-level occurrence of `.{rootClass} { ... }` in the content.
function directDeclarationsForRoot (css, rootClass) {
    const decls = []
    const escaped = rootClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const openRe = new RegExp(`\\.${escaped}\\s*\\{`, 'g')
    let om
    while ((om = openRe.exec(css))) {
        let i = om.index + om[0].length
        let depth = 1
        let buf = ''
        while (i < css.length && depth > 0) {
            const ch = css[i]
            if (ch === '{') {
                depth++
                buf += ch
            } else if (ch === '}') {
                depth--
                if (depth > 0) buf += ch
            } else if (depth === 1) {
                buf += ch
            }
            i++
        }
        // buf now holds ONLY depth===1 content is wrong: buf accumulates
        // depth>=1 minus the outer brace, so nested blocks are INCLUDED as
        // raw text. We need to strip nested {...} to keep only direct
        // declarations. Do that pass now on buf.
        let depth2 = 0
        let direct = ''
        for (const ch of buf) {
            if (ch === '{') { depth2++; continue }
            if (ch === '}') { depth2--; continue }
            if (depth2 === 0) direct += ch
        }
        direct.split(';').forEach((decl) => {
            const idx = decl.indexOf(':')
            if (idx === -1) return
            const prop = decl.slice(0, idx).trim()
            if (prop && !prop.startsWith('//') && !prop.startsWith('&') && /^[a-z-]+$/i.test(prop)) {
                decls.push(prop)
            }
        })
    }
    return decls
}

const files = walk(COMPONENTS_DIR)
const tier1 = []
const tier2 = []

for (const file of files) {
    const raw = readFileSync(file, 'utf8')
    let descriptor
    try {
        ;({ descriptor } = parseSFC(raw, { filename: file }))
    } catch {
        continue
    }
    const scopedStyles = descriptor.styles.filter((s) => s.scoped)
    if (scopedStyles.length === 0) continue

    const scriptContent = (descriptor.scriptSetup?.content || '') + '\n' + (descriptor.script?.content || '')

    // Root class: first top-level `.origam-xxx {` selector in the FIRST
    // scoped style block (established convention across every component
    // read so far — Btn, Card, BtnGroup all open their scoped block with
    // their own BEM root as the very first rule).
    const firstScoped = stripComments(scopedStyles[0].content)
    const rootMatch = firstScoped.match(/\.([\w-]+)\s*\{/)
    if (!rootMatch) continue
    const rootClass = rootMatch[1]
    if (!rootClass.startsWith('origam-')) continue

    const allDecls = new Set()
    for (const style of scopedStyles) {
        const content = stripComments(style.content)
        directDeclarationsForRoot(content, rootClass).forEach((p) => allDecls.add(p))
    }

    const conflicts = [...allDecls].filter((p) => TRACKED_PROPS.has(p))
    if (conflicts.length === 0) continue

    const rel = path.relative(process.cwd(), file)
    tier1.push({ file: rel, component: rootClass, properties: conflicts })

    const confirmedProps = conflicts.filter((p) => {
        const composables = PROP_TO_COMPOSABLES[p] || []
        return composables.some((c) => new RegExp(`\\b${c}\\s*\\(`).test(scriptContent))
    })
    if (confirmedProps.length > 0) {
        tier2.push({ file: rel, component: rootClass, properties: confirmedProps })
    }
}

console.log(JSON.stringify({
    filesScanned: files.length,
    tier1Count: tier1.length,
    tier2Count: tier2.length,
    tier1,
    tier2
}, null, 2))
