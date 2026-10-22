/**
 * merge.mjs — combine structural facts (from DS source) with curated content
 * (from the existing _DOC), producing the object to serialise.
 *
 * GOLDEN RULE (ticket constraint): structural fields are regenerated from the
 * source; CURATED fields are preserved verbatim from the existing doc and are
 * NEVER overwritten with empty / auto-generated prose.
 *
 *   structural (regenerated): definition / signature, values[].value,
 *                             props[].name|type|optional, params[].name|type|required|defaultValue,
 *                             returns.type, extends, name, sourceFile, value
 *   curated   (preserved)   : category, icon, descriptionKey, descriptionFallback,
 *                             examples, usedBy, related, note*, and every
 *                             per-row/per-value/per-param description.
 *
 * When a structural field has a per-item description (an enum value, an
 * interface prop, a util param) we keep the curated description matched by
 * the item's identity (value string / prop name / param name).
 */

import { isPlaceholderJsDoc } from './extract.mjs'

const EMPTY = ''

/** pick curated string, else source JSDoc (only if non-placeholder), else empty */
function descFrom (curated, jsdoc) {
    if (curated && curated.trim()) return curated
    if (jsdoc && !isPlaceholderJsDoc(jsdoc)) return jsdoc
    return EMPTY
}

export function mergeEnum (src, existing) {
    const ex = existing?.doc ?? {}
    const exValues = new Map((ex.values ?? []).map(v => [v.value, v]))
    return {
        slug: src.slug,
        name: src.name,
        category: ex.category ?? src.category,
        icon: ex.icon, // enums catalog has icon on entry; doc may omit — preserve if present
        descriptionKey: ex.descriptionKey ?? EMPTY,
        descriptionFallback: descFrom(ex.descriptionFallback, src.jsdoc),
        definition: src.definition,
        values: src.values.map(v => {
            const c = exValues.get(v.value)
            return {
                value: v.value,
                descriptionKey: c?.descriptionKey ?? EMPTY,
                descriptionFallback: c?.descriptionFallback ?? EMPTY,
            }
        }),
        usedBy: ex.usedBy ?? [],
        sourceFile: src.sourceFile,
        examples: ex.examples ?? [],
    }
}

export function mergeInterface (src, existing) {
    const ex = existing?.doc ?? {}
    const exProps = new Map((ex.props ?? []).map(p => [p.name, p]))
    return {
        slug: src.slug,
        name: src.name,
        category: ex.category ?? src.category,
        descriptionKey: ex.descriptionKey ?? EMPTY,
        descriptionFallback: descFrom(ex.descriptionFallback, src.jsdoc),
        definition: src.definition,
        extends: src.extends,
        props: src.props.map(p => {
            const c = exProps.get(p.name)
            const row = {
                name: p.name,
                type: p.type,
                optional: p.optional,
                descriptionFallback: descFrom(c?.descriptionFallback, p.jsdoc),
            }
            if (c?.default !== undefined) row.default = c.default
            return row
        }),
        usedBy: ex.usedBy ?? [],
        sourceFile: src.sourceFile,
        examples: ex.examples ?? [],
    }
}

export function mergeConst (src, existing) {
    const ex = existing?.doc ?? {}
    const exValues = new Map((ex.values ?? []).map(v => [v.value, v]))
    const merged = {
        slug: src.slug,
        name: src.name,
        category: ex.category ?? src.category,
        descriptionKey: ex.descriptionKey ?? EMPTY,
        descriptionFallback: descFrom(ex.descriptionFallback, src.jsdoc),
        definition: src.definition,
    }
    if (src.values) {
        merged.values = src.values.map(v => {
            const c = exValues.get(v.value)
            return {
                value: v.value,
                descriptionKey: c?.descriptionKey ?? EMPTY,
                descriptionFallback: c?.descriptionFallback ?? EMPTY,
            }
        })
    } else if (src.value !== undefined) {
        merged.value = src.value
    }
    merged.usedBy = ex.usedBy ?? []
    merged.sourceFile = src.sourceFile
    merged.examples = ex.examples ?? []
    return merged
}

export function mergeUtil (src, existing) {
    const ex = existing?.doc ?? {}
    const exParams = new Map((ex.params ?? []).map(p => [p.name, p]))
    const merged = {
        slug: src.slug,
        name: src.name,
        category: ex.category ?? src.category,
        icon: ex.icon ?? 'mdi-function',
        descriptionKey: ex.descriptionKey ?? EMPTY,
        descriptionFallback: descFrom(ex.descriptionFallback, src.jsdoc),
        signature: src.signature,
        params: src.params.map(p => {
            const c = exParams.get(p.name)
            const row = {
                name: p.name,
                type: p.type,
                required: p.required,
            }
            if (p.defaultValue !== undefined) row.defaultValue = p.defaultValue
            else if (c?.defaultValue !== undefined) row.defaultValue = c.defaultValue
            row.descriptionKey = c?.descriptionKey ?? EMPTY
            row.descriptionFallback = c?.descriptionFallback ?? EMPTY
            return row
        }),
        returns: {
            type: src.returnType,
            descriptionKey: ex.returns?.descriptionKey ?? EMPTY,
            descriptionFallback: ex.returns?.descriptionFallback ?? EMPTY,
        },
        sourceFile: src.sourceFile,
        examples: ex.examples ?? [],
        related: ex.related ?? [],
    }
    if (ex.noteKey !== undefined) merged.noteKey = ex.noteKey
    if (ex.noteFallback !== undefined) merged.noteFallback = ex.noteFallback
    return merged
}

export const MERGERS = {
    enum: mergeEnum,
    interface: mergeInterface,
    const: mergeConst,
    util: mergeUtil,
}

export const DOC_TYPE = {
    enum: 'IEnumDoc',
    interface: 'IInterfaceDoc',
    const: 'IConstDoc',
    util: 'IUtilDoc',
}

export const DOC_SUFFIX = {
    enum: 'ENUM_DOC',
    interface: 'INTERFACE_DOC',
    const: 'CONST_DOC',
    util: 'UTIL_DOC',
}

export const IMPORT_PATH = {
    enum: "~/interfaces/enums-catalog.interface",
    interface: "~/interfaces/interfaces-catalog.interface",
    const: "~/interfaces/consts-catalog.interface",
    util: "~/interfaces/utils-catalog.interface",
}
