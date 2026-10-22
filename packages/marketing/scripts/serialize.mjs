/**
 * serialize.mjs — render a merged doc object to a deterministic TS source
 * string matching the committed convention:
 *   import type { IXxxDoc } from '~/interfaces/...'
 *   export const SLUG_DOMAIN_DOC: IXxxDoc = { ... }
 *
 * Determinism (for idempotency): fixed key order, 4-space indent, single
 * quotes, multi-line string fields (definition / signature / code) emitted as
 * template literals. Re-running the generator on unchanged source reproduces
 * byte-identical output.
 */

import { slugToScreaming } from './extract.mjs'
import { DOC_TYPE, DOC_SUFFIX, IMPORT_PATH } from './merge.mjs'

const IND = '    '

// Tokens the Nuxt SSR build statically replaces (e.g. `typeof window` ->
// "undefined"). When such a token appears verbatim INSIDE a documentation
// code string, @rollup/plugin-replace corrupts it ('"undefined" !== ...') and
// the server bundle fails to parse. We emit the token via a `${'…'}`
// interpolation so the rendered text is identical but the contiguous token
// never exists in the module source for the replacer to match.
const SSR_REPLACED_TOKENS = ['typeof window', 'typeof document']

function hasDangerousToken (s) {
    return SSR_REPLACED_TOKENS.some(t => String(s).includes(t))
}

function neutralizeTokens (body) {
    return body
        .replace(/typeof window/g, "typeof ${'window'}")
        .replace(/typeof document/g, "typeof ${'document'}")
}

function q (s) {
    return "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"
}

/** multi-line code → template literal; escape backticks and ${, then split
 *  any SSR-replaced token so the build can't corrupt it. */
function tpl (s) {
    const escaped = String(s).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
    return '`' + neutralizeTokens(escaped) + '`'
}

/** template literal for multi-line OR token-bearing strings, single-quote otherwise */
function strField (s) {
    return (/\n/.test(String(s)) || hasDangerousToken(s)) ? tpl(s) : q(s)
}

function arr (items, indent, render) {
    if (!items || items.length === 0) return '[]'
    const inner = items.map(it => indent + IND + render(it, indent + IND)).join(',\n')
    return '[\n' + inner + ',\n' + indent + ']'
}

function objLine (pairs) {
    // single-line { key: val, ... }
    return '{ ' + pairs.map(([k, v]) => `${k}: ${v}`).join(', ') + ' }'
}

function renderEnum (d, i) {
    const L = []
    L.push(`${i}slug: ${q(d.slug)},`)
    L.push(`${i}name: ${q(d.name)},`)
    L.push(`${i}category: ${q(d.category)},`)
    L.push(`${i}descriptionKey: ${q(d.descriptionKey)},`)
    L.push(`${i}descriptionFallback: ${strField(d.descriptionFallback)},`)
    L.push(`${i}definition: ${tpl(d.definition)},`)
    L.push(`${i}values: ${arr(d.values, i, (v) => objLine([['value', q(v.value)], ['descriptionKey', q(v.descriptionKey)], ['descriptionFallback', q(v.descriptionFallback)]]))},`)
    L.push(`${i}usedBy: ${arr(d.usedBy, i, (u) => objLine(usedByEnum(u)))},`)
    if (d.sourceFile) L.push(`${i}sourceFile: ${q(d.sourceFile)},`)
    L.push(`${i}examples: ${renderExamples(d.examples, i)},`)
    return L.join('\n')
}

function usedByEnum (u) {
    const p = [['slug', q(u.slug)], ['name', q(u.name)]]
    if (u.propName !== undefined) p.push(['propName', q(u.propName)])
    return p
}

function renderInterface (d, i) {
    const L = []
    L.push(`${i}slug: ${q(d.slug)},`)
    L.push(`${i}name: ${q(d.name)},`)
    L.push(`${i}category: ${q(d.category)},`)
    L.push(`${i}descriptionKey: ${q(d.descriptionKey)},`)
    L.push(`${i}descriptionFallback: ${strField(d.descriptionFallback)},`)
    L.push(`${i}definition: ${tpl(d.definition)},`)
    L.push(`${i}extends: ${d.extends.length ? '[' + d.extends.map(q).join(', ') + ']' : '[]'},`)
    L.push(`${i}props: ${arr(d.props, i, (p) => {
        const pairs = [['name', q(p.name)], ['type', q(p.type)], ['optional', String(p.optional)]]
        if (p.default !== undefined) pairs.push(['default', q(p.default)])
        pairs.push(['descriptionFallback', strField(p.descriptionFallback)])
        return objLine(pairs)
    })},`)
    L.push(`${i}usedBy: ${arr(d.usedBy, i, (u) => objLine([['slug', q(u.slug)], ['name', q(u.name)], ['kind', q(u.kind)]]))},`)
    if (d.sourceFile) L.push(`${i}sourceFile: ${q(d.sourceFile)},`)
    L.push(`${i}examples: ${renderExamples(d.examples, i)},`)
    return L.join('\n')
}

function renderConst (d, i) {
    const L = []
    L.push(`${i}slug: ${q(d.slug)},`)
    L.push(`${i}name: ${q(d.name)},`)
    L.push(`${i}category: ${q(d.category)},`)
    L.push(`${i}descriptionKey: ${q(d.descriptionKey)},`)
    L.push(`${i}descriptionFallback: ${strField(d.descriptionFallback)},`)
    L.push(`${i}definition: ${tpl(d.definition)},`)
    if (d.values) {
        L.push(`${i}values: ${arr(d.values, i, (v) => objLine([['value', q(v.value)], ['descriptionKey', q(v.descriptionKey)], ['descriptionFallback', q(v.descriptionFallback)]]))},`)
    } else if (d.value !== undefined) {
        L.push(`${i}value: ${strField(d.value)},`)
    }
    L.push(`${i}usedBy: ${arr(d.usedBy, i, (u) => {
        const pairs = [['name', q(u.name)]]
        if (u.slug !== undefined) pairs.push(['slug', q(u.slug)])
        return objLine(pairs)
    })},`)
    if (d.sourceFile) L.push(`${i}sourceFile: ${q(d.sourceFile)},`)
    L.push(`${i}examples: ${renderExamples(d.examples, i)},`)
    return L.join('\n')
}

function renderUtil (d, i) {
    const L = []
    L.push(`${i}slug: ${q(d.slug)},`)
    L.push(`${i}name: ${q(d.name)},`)
    L.push(`${i}category: ${q(d.category)},`)
    L.push(`${i}icon: ${q(d.icon)},`)
    L.push(`${i}descriptionKey: ${q(d.descriptionKey)},`)
    L.push(`${i}descriptionFallback: ${strField(d.descriptionFallback)},`)
    L.push(`${i}signature: ${tpl(d.signature)},`)
    L.push(`${i}params: ${arr(d.params, i, (p) => {
        const pairs = [['name', q(p.name)], ['type', q(p.type)], ['required', String(p.required)]]
        if (p.defaultValue !== undefined) pairs.push(['defaultValue', q(p.defaultValue)])
        pairs.push(['descriptionKey', q(p.descriptionKey)])
        pairs.push(['descriptionFallback', strField(p.descriptionFallback)])
        return objLine(pairs)
    })},`)
    L.push(`${i}returns: ${objLine([['type', q(d.returns.type)], ['descriptionKey', q(d.returns.descriptionKey)], ['descriptionFallback', strField(d.returns.descriptionFallback)]])},`)
    if (d.sourceFile) L.push(`${i}sourceFile: ${q(d.sourceFile)},`)
    L.push(`${i}examples: ${renderExamples(d.examples, i)},`)
    L.push(`${i}related: ${d.related.length ? '[' + d.related.map(q).join(', ') + ']' : '[]'},`)
    if (d.noteKey !== undefined) L.push(`${i}noteKey: ${q(d.noteKey)},`)
    if (d.noteFallback !== undefined) L.push(`${i}noteFallback: ${strField(d.noteFallback)},`)
    return L.join('\n')
}

function renderExamples (examples, i) {
    if (!examples || examples.length === 0) return '[]'
    return arr(examples, i, (ex, ind) => {
        const L = ['{']
        L.push(`${ind}${IND}titleKey: ${q(ex.titleKey)},`)
        L.push(`${ind}${IND}titleFallback: ${q(ex.titleFallback)},`)
        L.push(`${ind}${IND}code: ${tpl(ex.code)},`)
        L.push(`${ind}${IND}lang: ${q(ex.lang)},`)
        L.push(`${ind}}`)
        return L.join('\n')
    })
}

const RENDERERS = { enum: renderEnum, interface: renderInterface, const: renderConst, util: renderUtil }

export function serialize (kind, merged) {
    const exportName = `${slugToScreaming(merged.slug)}_${DOC_SUFFIX[kind]}`
    const body = RENDERERS[kind](merged, IND)
    return [
        `import type { ${DOC_TYPE[kind]} } from '${IMPORT_PATH[kind]}'`,
        '',
        `export const ${exportName}: ${DOC_TYPE[kind]} = {`,
        body,
        '}',
        '',
    ].join('\n')
}
