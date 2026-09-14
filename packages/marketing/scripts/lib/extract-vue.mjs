/**
 * extract-vue.mjs — the LIVING component API (`.vue`) → structural doc facts.
 *
 * The four families the re-sync already covered (enums / interfaces / consts /
 * utils) are all plain `.ts`, and `extract.mjs` reads them with the TypeScript
 * compiler API. Components are not: their public surface is declared by the
 * three macros of a `<script setup>` block — `defineProps<IXxxProps>`,
 * `defineEmits<IXxxEmits>`, `defineSlots<IXxxSlots>` — and lives in an
 * interface the `.vue` merely NAMES.
 *
 * ⛔ NOTHING IS RE-IMPLEMENTED HERE.
 *
 *   • the component catalogue comes from `getRealComponents()`
 *     (`packages/ds/scripts/guards/lib/components.mjs`), the same filesystem
 *     scan every DS guard uses — never a hand-maintained list;
 *   • reading which interface each macro names comes from
 *     `macroInterfacesOf()` (`packages/ds/scripts/lib/component-api.mjs`),
 *     extracted verbatim from `analysis/c7-story-doc-sync.mjs` so the
 *     inspection harness and this pipeline read the SAME thing. C7's `csv`
 *     output was captured before and after that extraction and diffed: byte
 *     for byte identical;
 *   • the TypeScript Program / checker is the one `extract.mjs` already
 *     builds for the other families.
 *
 * ⛔ WHY THE TYPE CHECKER RESOLVES THE INTERFACE, AND NOT `declaredPropsFor`
 * ---------------------------------------------------------------------------
 * C7 resolves a prop surface with `declaredPropsFor`
 * (`scripts/audit-unconsumed-props.mjs`), a regex resolver that follows
 * `extends`, `Pick<>` and `Omit<>`. It answers "which NAMES?" — which is all
 * C7 needs. This pipeline also needs the TYPE of each prop (`doc_prop.type_label`
 * is a [SRC] column), the payload of each emit and the slot-props of each slot.
 * Teaching that to the regex resolver would mean editing
 * `audit-unconsumed-props.mjs`, which feeds the BLOCKING guard
 * `guards/unconsumed-props.mjs` — the very reason C7 refused to touch it.
 *
 * So the resolution goes through TypeScript itself, which resolves
 * `Omit<IDatePickerControlsProps, 'active'>` by construction rather than by
 * pattern (the trap that cost ticket #700).
 *
 * The two resolvers were CONFRONTED on the whole catalogue — 218 components,
 * prop names only, TS vs `declaredPropsFor`:
 *
 *      agree = 217        disagree = 1        unresolved = 0
 *
 * The single disagreement is `IRatingFieldProps.letterSpacing`, which TS sees
 * and the regex resolver does not. TypeScript is right, and the cause is a
 * real defect in the shared resolver: `resolveInterface()` passes ONE `seen`
 * set down the whole traversal, so a diamond re-visit is indistinguishable
 * from a cycle. `IRatingFieldProps extends IInputProps, …, ILabelProps`; both
 * narrow `ITypographyProps` with a `Pick<>`, `IInputProps` is visited first
 * and marks `ITypographyProps` seen, so `ILabelProps`' `Pick<…, 'letterSpacing'>`
 * resolves to an EMPTY map and the prop vanishes. Reported, NOT fixed here —
 * the fix moves a blocking CI guard and belongs in its own change.
 */

import { createRequire } from 'node:module'
import path from 'node:path'

import { DS_SRC, REPO_ROOT, relSourcePath } from './extract.mjs'

/** @type {import('typescript')} */
const ts = createRequire(import.meta.url)('typescript')

const DS_SCRIPTS = path.join(REPO_ROOT, 'packages', 'ds', 'scripts')

const { getRealComponents, pascalToKebab } = await import(
    path.join(DS_SCRIPTS, 'guards', 'lib', 'components.mjs')
)
const { macroInterfacesOf } = await import(
    path.join(DS_SCRIPTS, 'lib', 'component-api.mjs')
)

export { getRealComponents, pascalToKebab }

/**
 * A payload-less emit is labelled `void`, which is the majority convention in
 * the curated data (25 rows against 6 spelled `—`). Normalising the 6 is an
 * update of 6 cells, not a loss.
 */
const NO_PAYLOAD = 'void'

/** A slot that takes no slot-props is labelled `—` — the curated convention. */
const NO_SLOT_PROPS = '—'

const oneLine = (s) => s.replace(/\s+/g, ' ').trim()

/**
 * Index every interface / type-alias declaration of the DS by name, so a macro
 * that names `IBadgeProps` can be resolved to its declaration node.
 *
 * The first declaration of a name wins — the DS has no legitimate duplicate,
 * and picking deterministically beats picking at random.
 */
export function buildDeclarationIndex (program) {
    const decls = new Map()
    for (const sf of program.getSourceFiles()) {
        if (!sf.fileName.startsWith(DS_SRC)) continue
        ts.forEachChild(sf, (node) => {
            if (!node.name) return
            if (!ts.isInterfaceDeclaration(node) && !ts.isTypeAliasDeclaration(node)) return
            if (!decls.has(node.name.text)) decls.set(node.name.text, node)
        })
    }
    return decls
}

/** The checker's view of a named interface, or null when the name is unknown. */
function typeOfDeclaration (checker, decls, name) {
    const decl = name ? decls.get(name) : null
    return decl ? { decl, type: checker.getTypeAtLocation(decl.name) } : null
}

/**
 * Property members of an interface, `extends` / `Pick` / `Omit` resolved by
 * TypeScript. Returns [{ name, type, optional }].
 *
 * The type text is read from the DECLARATION when there is one, so the doc
 * shows what the author wrote (`TIcon`, `boolean | 'always'`) instead of the
 * checker's expansion. `typeToString` is only the fallback.
 */
function propertyMembers (checker, entry) {
    const out = []
    for (const sym of checker.getPropertiesOfType(entry.type)) {
        const d = sym.valueDeclaration ?? sym.declarations?.[0]
        const written = d && d.type ? d.type.getText() : null
        out.push({
            name: sym.getName(),
            type: oneLine(written ?? checker.typeToString(checker.getTypeOfSymbolAtLocation(sym, entry.decl))),
            optional: !!(sym.flags & ts.SymbolFlags.Optional),
        })
    }
    return out
}

/**
 * Emits are CALL signatures — `(e: 'click:append', event: MouseEvent): void` —
 * not properties, so `getPropertiesOfType` finds nothing on them. The event
 * name is the string literal of the first parameter; the payload label joins
 * the remaining parameter types, matching the curated convention
 * (`IChartSeries, number`).
 */
function emitSignatures (checker, entry) {
    const out = []
    for (const sig of checker.getSignaturesOfType(entry.type, ts.SignatureKind.Call)) {
        const params = sig.getParameters()
        const first = params[0]?.valueDeclaration
        if (!first?.type || !ts.isLiteralTypeNode(first.type) || !ts.isStringLiteral(first.type.literal)) continue
        const payload = params.slice(1).map((p) => {
            const d = p.valueDeclaration
            return oneLine(d?.type ? d.type.getText() : checker.typeToString(checker.getTypeOfSymbolAtLocation(p, entry.decl)))
        })
        out.push({ event: first.type.literal.text, payload: payload.join(', ') || NO_PAYLOAD })
    }
    return out
}

/**
 * Slots are properties whose type is a function — `header?: (props: {…}) => any`.
 * The slot-props label is the first parameter's type text.
 */
function slotMembers (checker, entry) {
    return checker.getPropertiesOfType(entry.type).map((sym) => {
        const d = sym.valueDeclaration ?? sym.declarations?.[0]
        const fn = d?.type
        const param = fn && (ts.isFunctionTypeNode(fn) ? fn.parameters[0] : null)
        return {
            slot: sym.getName(),
            slotProps: param?.type ? oneLine(param.type.getText()) : NO_SLOT_PROPS,
        }
    })
}

/**
 * `parent_slug` — the component family, derived from the directory that holds
 * the `.vue` (`components/Carousel/OrigamCarouselItem.vue` → `carousel`), null
 * when the component IS its family's head.
 *
 * ⛔ Measured against the 188 curated components still alive in the DS, this
 * rule reproduces 185 of them and DISAGREES on three, because the curated
 * value is an editorial grouping and not a filesystem fact:
 *
 *   chart-polar-bar       curated `chart`       · directory `chart-polar`
 *   list-group-activator  curated `list`        · directory `list-group`
 *   spacer                curated `grids`       · directory — (none)
 *
 * (`grids` is itself one of the five entries deleted from the DS — the curated
 * pointer dangles.) The value is therefore supplied on INSERT, so the 30
 * components the catalogue has never seen get a family, and left out of the
 * UPDATE mask, so no curated grouping is overwritten. See ENTRY_SRC_BY_DOMAIN
 * in generate-api-docs.mjs.
 */
function parentSlugOf (file, ownSlug) {
    const dir = pascalToKebab(path.basename(path.dirname(file)))
    return dir && dir !== ownSlug ? dir : null
}

/**
 * One doc record per component, in the `_DOC` shape `mapDoc('component', …)`
 * consumes. Only STRUCTURAL fields are produced — every editorial field
 * (category, icon, description, examples, anatomy, a11y, tokens, playground…)
 * is absent and therefore left untouched by the re-sync mask.
 */
export function extractComponents (program, checker) {
    const decls = buildDeclarationIndex(program)
    const out = []

    for (const cmp of getRealComponents()) {
        const macros = macroInterfacesOf(cmp.file)
        const props = typeOfDeclaration(checker, decls, macros.props)
        const emits = typeOfDeclaration(checker, decls, macros.emits)
        const slots = typeOfDeclaration(checker, decls, macros.slots)

        out.push({
            kind: 'component',
            slug: cmp.kebabName,
            name: cmp.pascalName,
            tag: `origam-${cmp.kebabName}`,
            sourceFile: relSourcePath(cmp.file),
            parentSlug: parentSlugOf(cmp.file, cmp.kebabName),
            props: props
                ? propertyMembers(checker, props).map((p) => ({
                    name: p.name,
                    type: { label: p.type },
                    required: !p.optional,
                }))
                : [],
            emits: emits
                ? emitSignatures(checker, emits).map((e) => ({
                    event: e.event,
                    payload: { label: e.payload },
                }))
                : [],
            slots: slots ? slotMembers(checker, slots) : [],
            /** Reported by the caller so a macro naming an unknown interface is never silent. */
            unresolved: [
                macros.props && !props ? `defineProps<${macros.props}>` : null,
                macros.emits && !emits ? `defineEmits<${macros.emits}>` : null,
                macros.slots && !slots ? `defineSlots<${macros.slots}>` : null,
            ].filter(Boolean),
        })
    }

    return out
}
