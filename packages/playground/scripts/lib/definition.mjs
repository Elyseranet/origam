/*
 * Shared derivations of the metadata chain — one `IComponentDefinition`
 * field at a time, from source A (runtime descriptor: names, `required`,
 * defaults) and source B (literal unions + resolved aliases: `tsType`,
 * options, JSDoc).
 *
 * Consumed by `generate-catalog.mjs` (the committed catalogue, #1145) and
 * pinned by `packages/tests/TU/playground/prop-control.spec.ts`.
 *
 * Moved here from the former `generate-host-seed.mjs` when the standalone
 * host's 14-component seed became a SUBSET of the full catalogue (#1145):
 * one generator, one source of truth.
 */

/*
 * Source A's default. ⛔ A function default is NOT invoked: it is a factory
 * for Object/Array props and the value itself for Function props, and the
 * descriptor does not say which — so the fact is recorded, not the value.
 */
export function describeDefault (entry) {
    switch (entry.default.kind) {
        case 'string':
        case 'boolean':
        case 'number':
            return { defaultValue: entry.default.value, hasFactoryDefault: false }
        case 'function':
            return { defaultValue: undefined, hasFactoryDefault: true }
        default:
            return { defaultValue: undefined, hasFactoryDefault: false }
    }
}

/*
 * The control a prop needs, from what the two sources measured. Returns the
 * `CONTROL_KIND` MEMBER NAME.
 *
 * ⛔ Order is the whole function:
 *   1. a finite literal union (source B) wins — the only case where the
 *      accepted values are KNOWN;
 *   2. otherwise only a runtime type naming exactly ONE constructor is
 *      trusted. `['Boolean', 'Number', 'String']` (4 653 props) is what the
 *      SFC compiler emits when it could NOT narrow — an absence of
 *      information, never a reason to render a checkbox. It falls to TEXT,
 *      where the playground coerces EXPLICITLY (`prop-control.util.ts`).
 */
export function deriveControlKind (runtimeType, options) {
    if (Array.isArray(options) && options.length > 0) return 'SELECT'

    let single = runtimeType
    if (Array.isArray(runtimeType)) {
        const named = runtimeType.filter(entry => entry !== null)
        single = named.length === 1 ? named[0] : null
    }

    switch (single) {
        case 'Boolean':
            return 'SWITCH'
        case 'Number':
            return 'NUMBER'
        case 'Object':
        case 'Array':
            return 'JSON'
        default:
            return 'TEXT'
    }
}

/*
 * `TAnchor | undefined` -> `TAnchor`; `All.TCommandPaletteHotkey` -> its bare
 * name. Anything that is not then a bare identifier is not an alias reference.
 */
export function aliasNameOf (tsType) {
    if (typeof tsType !== 'string') return null

    const bare = tsType.split('|').map(part => part.trim()).filter(part => part !== 'undefined' && part !== 'null')
    if (bare.length !== 1) return null

    const name = bare[0].replace(/^All\./, '')
    return /^[A-Za-z_$][\w$]*$/.test(name) ? name : null
}

/*
 * Source B for one prop: the printed type, the union members (from the
 * printed union, or from the alias pass when the printer kept a name), and
 * which stage established them (`METADATA_SOURCE` member name).
 */
export function describeTypes (typesEntry, aliases) {
    if (!typesEntry) return { tsType: null, options: undefined, description: undefined, source: 'RUNTIME' }

    const description = typesEntry.description ?? undefined

    if (Array.isArray(typesEntry.options) && typesEntry.options.length > 0) {
        return { tsType: typesEntry.tsType ?? null, options: typesEntry.options, description, source: 'TYPES' }
    }

    const alias = aliases[aliasNameOf(typesEntry.tsType) ?? '']
    if (alias?.enumerable && Array.isArray(alias.options) && alias.options.length > 0) {
        return { tsType: typesEntry.tsType ?? null, options: alias.options, description, source: 'ALIAS' }
    }

    return { tsType: typesEntry.tsType ?? null, options: undefined, description, source: 'TYPES' }
}

/*
 * `OrigamBtnGroup` -> `origam-btn-group`, with Vue's OWN rule (`hyphenate`
 * in `@vue/shared`: a dash before every capital that does not start a word).
 *
 * ⛔ The former `([a-z0-9])([A-Z])` rule turned `OrigamWindowXTranslate` into
 * `origam-window-xtranslate`, which Vue camelizes back to
 * `OrigamWindowXtranslate` — an unknown element, rendered as an empty box.
 * Measured on the 4 `OrigamWindow{X,Y}[Reverse]Translate`; the marketing
 * catalogue (`server/db/seed/component.json`) spells them
 * `origam-window-x-translate`, as Vue does.
 */
export function toKebabTag (name) {
    return name.replace(/\B([A-Z])/g, '-$1').toLowerCase()
}
