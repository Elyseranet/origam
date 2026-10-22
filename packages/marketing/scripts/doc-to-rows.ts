/**
 * doc-to-rows.ts — map a family `*_DOC` object onto the normalised DB shape.
 *
 * One mapper per kind translates the curated `_DOC` (8 different shapes, see
 * src/interfaces/*-catalog.interface.ts) into a uniform internal record:
 *
 *   { entry, props, values, params, returns, emits, slots, examples,
 *     directiveArgs, directiveModifiers, relations }
 *
 * The requestable collections are normalised into child tables; the rich,
 * component-only blocks (anatomy/a11y/tokens/playground/…) ride along in
 * `entry.kind_extra` as jsonb (ADR §3.4). Nothing is invented or dropped:
 * every field of the source object lands in a column or in kind_extra.
 */

import { toSlug } from './extract.mjs'

const arr = (v) => Array.isArray(v) ? v : []
const orNull = (v) => (v === undefined ? null : v)

/** Empty normalised record with the entry pre-filled. */
function base (kind, doc) {
    return {
        entry: {
            kind,
            slug: doc.slug,
            name: doc.name,
            category: orNull(doc.category),
            domain: orNull(doc.domain),
            icon: orNull(doc.icon),
            description_key: orNull(doc.descriptionKey),
            description_fallback: orNull(doc.descriptionFallback),
            definition: orNull(doc.definition),
            signature: orNull(doc.signature),
            tag: orNull(doc.tag),
            value: orNull(doc.value),
            source_file: orNull(doc.sourceFile),
            package_note: orNull(doc.packageNote),
            note_key: orNull(doc.noteKey),
            note_fallback: orNull(doc.noteFallback),
            story_url: orNull(doc.storyUrl),
            doc_url: orNull(doc.docUrl),
            parent_slug: orNull(doc.parentSlug),
            kind_extra: null,
        },
        props: [],
        values: [],
        params: [],
        returns: [],
        emits: [],
        slots: [],
        examples: [],
        directiveArgs: [],
        directiveModifiers: [],
        relations: [],
    }
}

/** examples[] → doc_example rows (shape identical across families). */
function examples (doc) {
    return arr(doc.examples).map((e, i) => ({
        position: i,
        title_key: orNull(e.titleKey),
        title_fallback: orNull(e.titleFallback),
        code: orNull(e.code),
        lang: orNull(e.lang),
    }))
}

/** value-bearing rows (enum members / const values / type values). */
function valueRows (list) {
    return arr(list).map((v, i) => ({
        position: i,
        value: v.value,
        description_key: orNull(v.descriptionKey),
        description_fallback: orNull(v.descriptionFallback),
    }))
}

function mapEnum (doc, kind = 'enum') {
    const r = base(kind, doc)
    r.values = valueRows(doc.values)
    r.examples = examples(doc)
    r.relations = arr(doc.usedBy).map((u, i) => ({
        position: i,
        rel_type: 'used_by',
        to_kind: 'component',
        to_slug: orNull(u.slug),
        to_name: orNull(u.name),
        prop_name: orNull(u.propName),
        description_key: null,
        description_fallback: null,
    }))
    return r
}

function mapType (doc) {
    const r = mapEnum(doc, 'type')
    // `kind` here is the type's sub-kind ('type' | 'enum'), distinct from the
    // doc_entry.kind discriminant — keep it in kind_extra.
    r.entry.kind_extra = { typeKind: orNull(doc.kind) }
    return r
}

function mapInterface (doc) {
    const r = base('interface', doc)
    r.props = arr(doc.props).map((p, i) => ({
        position: i,
        name: p.name,
        type_label: orNull(p.type),
        type_slug: null,
        type_kind: null,
        optional: orNull(p.optional),
        required: null,
        default_value: orNull(p.default),
        description_key: orNull(p.descriptionKey),
        description_fallback: orNull(p.descriptionFallback),
    }))
    r.examples = examples(doc)
    const ext = arr(doc.extends).map((name, i) => ({
        position: i,
        rel_type: 'extends',
        to_kind: 'interface',
        to_slug: toSlug(name, 'percap'),
        to_name: name,
        prop_name: null,
        description_key: null,
        description_fallback: null,
    }))
    const used = arr(doc.usedBy).map((u, i) => ({
        position: i,
        rel_type: 'used_by',
        to_kind: orNull(u.kind),
        to_slug: orNull(u.slug),
        to_name: orNull(u.name),
        prop_name: null,
        description_key: null,
        description_fallback: null,
    }))
    r.relations = [...ext, ...used]
    return r
}

function mapConst (doc) {
    const r = base('const', doc)
    r.values = valueRows(doc.values)
    r.examples = examples(doc)
    r.relations = arr(doc.usedBy).map((u, i) => ({
        position: i,
        rel_type: 'used_by',
        to_kind: null,
        to_slug: orNull(u.slug),
        to_name: orNull(u.name),
        prop_name: null,
        description_key: null,
        description_fallback: null,
    }))
    return r
}

/** util / composable params share a shape. */
function paramRows (list) {
    return arr(list).map((p, i) => ({
        position: i,
        name: p.name,
        type: orNull(p.type),
        required: orNull(p.required),
        default_value: orNull(p.defaultValue),
        description_key: orNull(p.descriptionKey),
        description_fallback: orNull(p.descriptionFallback),
    }))
}

function relatedSlugs (list, toKind) {
    return arr(list).map((slug, i) => ({
        position: i,
        rel_type: 'related',
        to_kind: toKind,
        to_slug: slug,
        to_name: null,
        prop_name: null,
        description_key: null,
        description_fallback: null,
    }))
}

function mapUtil (doc) {
    const r = base('util', doc)
    r.params = paramRows(doc.params)
    if (doc.returns) {
        r.returns = [{
            position: 0,
            name: null,
            type: orNull(doc.returns.type),
            description_key: orNull(doc.returns.descriptionKey),
            description_fallback: orNull(doc.returns.descriptionFallback),
        }]
    }
    r.examples = examples(doc)
    r.relations = relatedSlugs(doc.related, 'util')
    return r
}

function mapComposable (doc) {
    const r = base('composable', doc)
    r.params = paramRows(doc.params)
    r.returns = arr(doc.returns).map((rt, i) => ({
        position: i,
        name: rt.name,
        type: orNull(rt.type),
        description_key: orNull(rt.descriptionKey),
        description_fallback: orNull(rt.descriptionFallback),
    }))
    r.examples = examples(doc)
    r.relations = relatedSlugs(doc.related, 'composable')
    if (doc.consumedInterfaces) {
        r.entry.kind_extra = { consumedInterfaces: doc.consumedInterfaces }
    }
    return r
}

function mapDirective (doc) {
    const r = base('directive', doc)
    // directive carries a multi-part signature; signatureCode → entry.signature.
    r.entry.signature = orNull(doc.signatureCode)
    r.entry.kind_extra = {
        signatureSummary: orNull(doc.signatureSummary),
        signatureLang: orNull(doc.signatureLang),
    }
    r.directiveArgs = arr(doc.args).map((a, i) => ({
        position: i,
        name: a.name,
        type: orNull(a.type),
        required: orNull(a.required),
        description_key: orNull(a.descriptionKey),
        description_fallback: orNull(a.descriptionFallback),
    }))
    r.directiveModifiers = arr(doc.modifiers).map((m, i) => ({
        position: i,
        name: m.name,
        type: null,
        required: null,
        description_key: orNull(m.descriptionKey),
        description_fallback: orNull(m.descriptionFallback),
    }))
    r.examples = examples(doc)
    r.relations = arr(doc.related).map((rel, i) => ({
        position: i,
        rel_type: 'related',
        to_kind: orNull(rel.kind),
        to_slug: orNull(rel.slug),
        to_name: orNull(rel.name),
        prop_name: null,
        description_key: orNull(rel.descriptionKey),
        description_fallback: orNull(rel.descriptionFallback),
    }))
    return r
}

/** Component-only rich blocks that ride in kind_extra (ADR §3.4). */
const COMPONENT_EXTRA_KEYS = [
    'anatomy', 'cssVars', 'exposed', 'composable',
    'a11y', 'tokens', 'playground', 'previewVariants',
]

function mapComponent (doc) {
    const r = base('component', doc)
    r.props = arr(doc.props).map((p, i) => ({
        position: i,
        name: p.name,
        type_label: p.type ? orNull(p.type.label) : null,
        type_slug: p.type ? orNull(p.type.slug) : null,
        type_kind: p.type ? orNull(p.type.kind) : null,
        optional: null,
        required: orNull(p.required),
        default_value: orNull(p.defaultValue),
        description_key: orNull(p.descriptionKey),
        description_fallback: orNull(p.descriptionFallback),
    }))
    r.emits = arr(doc.emits).map((e, i) => ({
        position: i,
        event: e.event,
        payload_label: e.payload ? orNull(e.payload.label) : null,
        payload_slug: e.payload ? orNull(e.payload.slug) : null,
        payload_kind: e.payload ? orNull(e.payload.kind) : null,
        description_key: orNull(e.descriptionKey),
        description_fallback: orNull(e.descriptionFallback),
    }))
    r.slots = arr(doc.slots).map((s, i) => ({
        position: i,
        slot: s.slot,
        slot_props: orNull(s.slotProps),
        description_key: orNull(s.descriptionKey),
        description_fallback: orNull(s.descriptionFallback),
    }))
    r.examples = examples(doc)
    const family = arr(doc.family).map((f, i) => ({
        position: i,
        rel_type: 'family',
        to_kind: 'component',
        to_slug: orNull(f.slug),
        to_name: orNull(f.name),
        prop_name: null,
        description_key: orNull(f.descriptionKey),
        description_fallback: orNull(f.descriptionFallback),
    }))
    const related = arr(doc.related).map((rel, i) => ({
        position: i,
        rel_type: 'related',
        to_kind: orNull(rel.kind),
        to_slug: orNull(rel.slug),
        to_name: orNull(rel.name),
        prop_name: null,
        description_key: orNull(rel.descriptionKey),
        description_fallback: orNull(rel.descriptionFallback),
    }))
    r.relations = [...family, ...related]

    const extra = {}
    for (const k of COMPONENT_EXTRA_KEYS) if (doc[k] !== undefined) extra[k] = doc[k]
    if (Object.keys(extra).length) r.entry.kind_extra = extra
    return r
}

const MAPPERS = {
    enum: mapEnum,
    type: mapType,
    interface: mapInterface,
    const: mapConst,
    util: mapUtil,
    composable: mapComposable,
    directive: mapDirective,
    component: mapComponent,
}

/** Map a `_DOC` object of the given kind to the normalised DB record. */
export function mapDoc (kind, doc) {
    const mapper = MAPPERS[kind]
    if (!mapper) throw new Error(`No mapper for kind: ${kind}`)
    return mapper(doc)
}
