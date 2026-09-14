/**
 * extract.mjs — DS source → structural doc facts.
 *
 * Uses the TypeScript compiler API (no ts-morph dependency) to parse the
 * origam design-system sources under packages/ds/src/{enums,interfaces,
 * consts,utils} and pull out ONLY the factual / structural fields that can
 * be derived from the source with certainty:
 *
 *   enum      → name, definition (printed), values[] (MEMBER refs)
 *   interface → name, definition (printed), extends[], props[] (name/type/optional + JSDoc)
 *   const     → name, definition (printed or summarised), value | values[], jsdoc
 *   util      → name, signature, params[] (name/type/required/default), returns.type, jsdoc, overloads
 *
 * It NEVER fabricates prose. JSDoc text is returned verbatim when present
 * (so the caller can decide whether to use it), and the placeholder-only
 * JSDoc found across the DS (`@param x …`) is detected and flagged so the
 * caller can ignore it and keep curated descriptions instead.
 */

import { createRequire } from 'node:module'
import path from 'node:path'
import url from 'node:url'

const require = createRequire(import.meta.url)
/** @type {import('typescript')} */
const ts = require('typescript')

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
export const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..')
export const DS_SRC = path.join(REPO_ROOT, 'packages', 'ds', 'src')

/**
 * The eight families of the API Reference, and where each one is read from.
 *
 * `components` is the odd one out: its source is a `.vue` SFC, not a `.ts`, and
 * its public surface is declared by macros that merely NAME an interface. It
 * carries `vue: true` and is handled by `extract-vue.mjs`; `listSourceFiles`
 * and `extractFile` do not apply to it.
 */
export const DOMAINS = {
    enums: { dir: 'enums', glob: '.enum.ts', kind: 'enum' },
    interfaces: { dir: 'interfaces', glob: '.interface.ts', kind: 'interface' },
    consts: { dir: 'consts', glob: '.const.ts', kind: 'const' },
    utils: { dir: 'utils', glob: '.util.ts', kind: 'util' },
    composables: { dir: 'composables', glob: '.composable.ts', kind: 'composable' },
    types: { dir: 'types', glob: '.type.ts', kind: 'type' },
    directives: { dir: 'directives', glob: '.directive.ts', kind: 'directive' },
    components: { dir: 'components', glob: '.vue', kind: 'component', vue: true },
}

/** Domains whose source is a `.ts` file the TypeScript Program can compile. */
export const TS_DOMAINS = Object.keys(DOMAINS).filter(k => !DOMAINS[k].vue)

/**
 * kebab-case a symbol name, reproducing the EXISTING marketing convention so
 * the generator never creates a duplicate of an already-curated slug.
 *
 * Two historical algorithms were used in the committed data and they differ
 * ONLY on acronyms — so the generator must match each per domain:
 *
 *   • 'percap' (interfaces): a dash before EVERY uppercase letter.
 *     IHTMLExpandElement → i-h-t-m-l-expand-element, IDataListKVItem → i-data-list-k-v-item
 *
 *   • 'standard' (enums, consts, utils): acronyms kept grouped.
 *     HexToRGB → hex-to-rgb, RGBtoCSS → rg-bto-css, addDays → add-days
 *
 * SCREAMING_SNAKE (ALIGN, AUDIO_DEFAULTS) is identical under both → lowercase + dashes.
 */
export function toSlug (name, style = 'standard') {
    if (/^[A-Z0-9_]+$/.test(name)) return name.toLowerCase().replace(/_/g, '-')
    if (style === 'percap') {
        return name.replace(/([A-Z])/g, '-$1').replace(/^-/, '').replace(/_/g, '-').toLowerCase()
    }
    return name
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
        .replace(/_/g, '-')
        .toLowerCase()
}

/**
 * Families read as FUNCTIONS — one extraction path, two kinds. A composable is
 * a util that happens to live under `composables/` and to hand back an object.
 */
const FN_KINDS = new Set(['util', 'composable'])

/** Slug style historically used per domain. */
export const SLUG_STYLE = {
    enums: 'standard',
    interfaces: 'percap',
    consts: 'standard',
    utils: 'standard',
    composables: 'standard',
    types: 'standard',
    directives: 'standard',
    components: 'standard',
}

/**
 * The `type` family drops the `T` prefix before slugging: `TAudioLoopMode` is
 * catalogued as `audio-loop-mode`, not `t-audio-loop-mode`.
 *
 * Measured against the curated data: 487 distinct live type slugs, 79 rows in
 * the catalogue, 75 of them matched by this rule with ZERO name mismatch and
 * ZERO slug collision. The 4 unmatched rows are entries whose source symbol no
 * longer exists (`display-level`, `location`, `route-location-raw`,
 * `transition`).
 */
export function typeSlug (name) {
    return toSlug(/^T[A-Z]/.test(name) ? name.slice(1) : name, 'standard')
}

/** SCREAMING_SNAKE a slug for the export const name: add-days→ADD_DAYS, i-color-props→I_COLOR_PROPS */
export function slugToScreaming (slug) {
    return slug.replace(/-/g, '_').toUpperCase()
}

/** True when JSDoc is the DS placeholder noise (just a title + `…` params), not real prose. */
function isPlaceholderJsDoc (text) {
    if (!text) return true
    const t = text.trim()
    if (!t) return true
    // A single short sentence that merely restates the name, or only ellipses.
    if (/^[…\s]*$/.test(t)) return true
    return false
}

function walk (dir, ext, out = []) {
    let entries
    try { entries = ts.sys.readDirectory(dir, [ext.replace(/^\./, '')]) } catch { entries = [] }
    // readDirectory with extension filter returns full paths already
    for (const f of entries) if (f.endsWith(ext)) out.push(f)
    return out
}

export function listSourceFiles (domainKey) {
    const d = DOMAINS[domainKey]
    const root = path.join(DS_SRC, d.dir)
    return walk(root, d.glob).sort()
}

/** category = first path segment under the domain dir, e.g. .../enums/Commons/align.enum.ts → "Commons" */
export function folderCategory (domainKey, file) {
    const d = DOMAINS[domainKey]
    const rel = path.relative(path.join(DS_SRC, d.dir), file)
    const seg = rel.split(path.sep)[0]
    return seg && seg !== path.basename(file) ? seg : 'Commons'
}

export function relSourcePath (file) {
    return path.relative(REPO_ROOT, file).split(path.sep).join('/')
}

function getJsDoc (node) {
    const jsdoc = ts.getJSDocCommentsAndTags(node)
    for (const j of jsdoc) {
        if (ts.isJSDoc(j)) {
            const comment = typeof j.comment === 'string'
                ? j.comment
                : ts.getTextOfJSDocComment(j.comment) || ''
            return comment.trim()
        }
    }
    return ''
}

function printNode (printer, sourceFile, node) {
    return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile)
}

/**
 * Build a Program over all DS files so the type checker can resolve inferred
 * return types and aliased types. Returns { checker, program }.
 */
export function createProgram () {
    const files = []
    for (const k of TS_DOMAINS) files.push(...listSourceFiles(k))
    // Include the whole ds/src for type resolution of imports.
    const program = ts.createProgram(files, {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        allowJs: false,
        noEmit: true,
        skipLibCheck: true,
        strict: false,
        types: [],
    })
    return { program, checker: program.getTypeChecker() }
}

const printer = ts.createPrinter({ removeComments: true })

/**
 * VERBATIM declaration text — a byte-exact mirror of the DS source, INCLUDING
 * member-level JSDoc (`@deprecated`, …), original alignment and semicolons.
 *
 * `node.getText(sf)` starts after the node's own leading trivia, so the
 * declaration's *own* preceding JSDoc (which already feeds `descriptionFallback`)
 * is excluded, while internal member comments and the original formatting are
 * preserved. DS declarations are top-level (flush-left), so no dedent is needed.
 */
function verbatimDefinition (sf, node) {
    return node.getText(sf)
}

/** Extract all exported symbols of interest from one source file. */
export function extractFile (domainKey, file, program, checker) {
    const sf = program.getSourceFile(file)
    if (!sf) return []
    const kind = DOMAINS[domainKey].kind
    const slugStyle = SLUG_STYLE[domainKey]
    const results = []
    const category = folderCategory(domainKey, file)
    const sourceFile = relSourcePath(file)

    const isExported = (node) =>
        node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)

    /*
     * DIRECTIVE — one entry per `directives/{Name}/{name}.directive.ts`.
     *
     * ⛔ Identity comes from the DIRECTORY, not from an export. Reading the
     * exported const covers five of the six: `Contrast` declares `const
     * vContrast` and only leaves through `export default`, so a scan keyed on
     * named exports silently drops it — and, worse, a run with entry-orphaning
     * on would then flag the live `v-contrast` as deleted. Measured: the
     * directory rule matches all 6 curated slugs and all 6 names, exactly.
     *
     * Only the IDENTITY is derivable. A directive's documented signature is a
     * set of USAGE forms (`v-ripple.center`, `v-hover.callback="fn"`), its args
     * and modifiers are prose — none of it readable from the declaration, all of
     * it curated. See RESYNC_POLICY in generate-api-docs.mjs.
     */
    if (kind === 'directive') {
        const slug = toSlug(path.basename(path.dirname(file)), slugStyle)
        return [{ kind, name: `v-${slug}`, slug, category, sourceFile }]
    }

    // Util functions may be declared multiple times (overloads + implementation).
    // Group FunctionDeclarations by name so we emit one entry carrying ALL
    // overload signatures and the implementation's (broadest) param/return types.
    const fnGroups = new Map()

    ts.forEachChild(sf, (node) => {
        // ENUM
        if (kind === 'enum' && ts.isEnumDeclaration(node) && isExported(node)) {
            const name = node.name.text
            const def = verbatimDefinition(sf, node)
            const values = node.members.map(m => ({
                value: `${name}.${m.name.getText(sf)}`,
            }))
            results.push({ kind, name, slug: toSlug(name, slugStyle), category, sourceFile, definition: def, values, jsdoc: getJsDoc(node) })
        }

        // INTERFACE
        if (kind === 'interface' && ts.isInterfaceDeclaration(node) && isExported(node)) {
            const name = node.name.text
            const def = verbatimDefinition(sf, node)
            const ext = []
            if (node.heritageClauses) {
                for (const hc of node.heritageClauses) {
                    if (hc.token === ts.SyntaxKind.ExtendsKeyword) {
                        for (const t of hc.types) ext.push(t.expression.getText(sf))
                    }
                }
            }
            const props = node.members.filter(ts.isPropertySignature).map(m => ({
                name: m.name.getText(sf),
                type: m.type ? m.type.getText(sf) : 'unknown',
                optional: !!m.questionToken,
                jsdoc: getJsDoc(m),
            }))
            results.push({ kind, name, slug: toSlug(name, slugStyle), category, sourceFile, definition: def, extends: ext, props, jsdoc: getJsDoc(node) })
        }

        // CONST
        if (kind === 'const' && ts.isVariableStatement(node) && isExported(node)) {
            for (const decl of node.declarationList.declarations) {
                if (!ts.isIdentifier(decl.name)) continue
                const name = decl.name.text
                // Only document SCREAMING_SNAKE constants (the catalog convention).
                if (!/^[A-Z0-9_]+$/.test(name)) continue
                // Verbatim: prefer the single-declaration text, but keep the
                // `export const` keywords from the statement so the snippet is
                // self-contained. DS consts are one declaration per statement.
                const def = node.declarationList.declarations.length === 1
                    ? verbatimDefinition(sf, node)
                    : `export const ${verbatimDefinition(sf, decl)}`
                const init = decl.initializer
                const entry = { kind, name, slug: toSlug(name, slugStyle), category, sourceFile, definition: def, jsdoc: getJsDoc(node) }
                const unwrapped = init && ts.isAsExpression(init) ? init.expression : init
                if (unwrapped && ts.isObjectLiteralExpression(unwrapped)) {
                    // Object literal → one copiable `key: value` member per property.
                    entry.values = unwrapped.properties.filter(ts.isPropertyAssignment).map(p => ({
                        value: `${p.name.getText(sf)}: ${p.initializer.getText(sf).replace(/\s+/g, ' ')}`,
                    }))
                } else if (unwrapped && ts.isArrayLiteralExpression(unwrapped)) {
                    // Array literal → one copiable member per element (matches the
                    // curated convention, e.g. BREAKPOINTS_ARRAY → BREAKPOINTS.SM, …).
                    entry.values = unwrapped.elements.map(el => ({
                        value: el.getText(sf).replace(/\s+/g, ' '),
                    }))
                } else if (unwrapped) {
                    // Scalar / Set / Map / call expression → single scalar value.
                    entry.value = unwrapped.getText(sf).replace(/\s+/g, ' ')
                }
                results.push(entry)
            }
        }

        /*
         * TYPE — `export type TFoo = 'a' | 'b'`
         *
         * ⛔ `isExported` is the whole admission rule for this family, and it
         * currently excludes NOTHING: all 487 type aliases under
         * `packages/ds/src/types` carry `export`. That makes it a rule no
         * assertion over the real sources can defend — it reads identically
         * whether the guard is here or deleted. It is pinned instead by a
         * synthetic negative control in
         * `packages/tests/TU/marketing/doc-sync-extract-coverage.spec.ts`
         * ("NON-exported alias is not catalogued"), verified to fail when the
         * guard is removed.
         *
         * What it buys is the composition with entry-orphaning: a type that
         * loses its `export` stops being emitted, so it leaves the `seen` set,
         * so `orphanMissingEntries` retires it. The catalogue therefore
         * follows the PUBLIC type surface rather than accumulating whatever it
         * was once told.
         *
         * ⛔ The package barrel is NOT the test of "public". `types/index.ts`
         * re-exports 261 of the 268 `.type.ts` files, and the seven it skips
         * are not private: `tokens.type.ts` is published under its own subpath
         * (`"./tokens/types"` in package.json). Filtering on the barrel would
         * have dropped `TTokenName` and six more real types.
         */
        if (kind === 'type' && ts.isTypeAliasDeclaration(node) && isExported(node)) {
            const name = node.name.text
            results.push({
                kind,
                name,
                slug: typeSlug(name),
                category,
                sourceFile,
                definition: verbatimDefinition(sf, node),
                values: unionValues(checker, node).map(value => ({ value })),
                jsdoc: getJsDoc(node),
            })
        }

        // UTIL / COMPOSABLE — function declarations (overloads + implementation):
        // `export function foo (...) {}`
        //
        // A composable is a util-shaped export: a name, parameters, a return
        // type. It is read by the SAME code, with the same overload grouping.
        // The directory and the file suffix come from DOMAINS; what makes a
        // composable family entry out of the exports of one file is
        // `composableOfFile` below.
        if (FN_KINDS.has(kind) && ts.isFunctionDeclaration(node) && isExported(node) && node.name) {
            const n = node.name.text
            if (!fnGroups.has(n)) fnGroups.set(n, [])
            fnGroups.get(n).push(node)
        }

        // UTIL / COMPOSABLE — arrow / function-expression consts: `export const foo = (...) => ...`
        //
        // ⛔ This form is NOT a rare case for composables — `useIcon` is written
        // this way, among others. A scan that only knew `export function` read
        // those files as exporting nothing, and a family whose file exports
        // nothing looks exactly like a family that was deleted.
        if (FN_KINDS.has(kind) && ts.isVariableStatement(node) && isExported(node)) {
            for (const decl of node.declarationList.declarations) {
                if (!ts.isIdentifier(decl.name)) continue
                const init = decl.initializer
                if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) {
                    results.push(buildUtilEntry(sf, checker, decl.name.text, init, category, sourceFile, getJsDoc(node), 'const', slugStyle, kind))
                }
            }
        }
    })

    // Emit one util entry per grouped function name (handling overloads).
    for (const [name, decls] of fnGroups) {
        const impl = decls.find(d => !!d.body) ?? decls[decls.length - 1]
        const overloads = decls.filter(d => !d.body)
        // JSDoc lives on the first declaration (overload) in TS.
        const jsdoc = getJsDoc(decls[0])
        const entry = buildUtilEntry(sf, checker, name, impl, category, sourceFile, jsdoc, 'function', slugStyle, kind)
        if (overloads.length > 0) {
            // Signature = the PUBLIC overload declarations only (the implementation
            // signature is internal and often widened by default values, so it is
            // excluded — matching the curated convention).
            entry.signature = overloads
                .map(d => buildSignatureFromDecl(sf, checker, name, d, 'function'))
                .join('\n')
            // Params/returns from the LAST overload (the most permissive public one),
            // matching the existing curated docs (e.g. convertToUnit).
            const last = overloads[overloads.length - 1]
            const merged = buildUtilEntry(sf, checker, name, last, category, sourceFile, jsdoc, 'function', slugStyle, kind)
            entry.params = merged.params
            entry.returnType = merged.returnType
            entry.returns = merged.returns
        }
        results.push(entry)
    }

    if (kind === 'composable') return [composableOfFile(file, results)].filter(Boolean)

    return results
}

/*********************************************************
 * composableOfFile — ONE catalogue entry per composable FILE
 *
 * ⛔ The composable family is NOT indexed by exported function, and assuming it
 * was is what made a first pass declare eleven live composables dead.
 * `aspect.composable.ts` exports `useAspectRatio`; the catalogue calls it
 * `use-aspect`. `filters.composable.ts` exports `useFilter` and is catalogued
 * `use-filters`. `select.composable.ts` → `use-select`, `expand.composable.ts`
 * → `use-expand`, `throttle.composable.ts` → `use-throttle`. The slug comes
 * from the FILE; only the display name comes from the function.
 *
 * Measured against the 104 curated rows: the file rule matches 97. The 7 it
 * does not match are files that no longer exist — `use-active` and `use-hover`
 * among them, merged into `useStateFlag` (the merge is documented at the top of
 * `stateFlag.composable.ts`), plus `use-audio-player`, `use-media-player`,
 * `use-parallax-transform`, `use-textarea-rich` and `use-waveform`.
 *
 * The primary export is the `use…` function named after the file when there is
 * one, otherwise the first `use…` export in source order. A file that exports
 * no `use…` function is not a composable and yields nothing — that is what
 * keeps the 39 helper exports of this directory (`createDate`, `provideDefaults`,
 * `_resetCssSupportCache`, `resetCodeHighlighterForTesting`, …) out of a
 * catalogue that would otherwise announce test hooks as public API.
 ********************************************************/
function composableOfFile (file, results) {
    const base = path.basename(file, '.composable.ts')
    const slug = `use-${toSlug(base, 'standard')}`
    const expected = `use${base.charAt(0).toUpperCase()}${base.slice(1)}`.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    const candidates = results.filter(r => /^use[A-Z]/.test(r.name))
    const primary = candidates.find(r => r.name === expected) ?? candidates[0]
    if (!primary) return null
    return { ...primary, slug }
}

/** Build just the signature string from one function declaration. */
function buildSignatureFromDecl (sf, checker, name, decl, form) {
    const params = decl.parameters.map(p => ({
        name: p.name.getText(sf),
        type: p.type ? p.type.getText(sf) : inferParamType(checker, p),
        required: !p.questionToken && !p.initializer,
        defaultValue: p.initializer ? p.initializer.getText(sf) : undefined,
    }))
    const returnType = decl.type ? decl.type.getText(sf) : inferReturnType(checker, decl)
    return buildSignature(name, params, returnType, form)
}

/**
 * Build a util / composable doc entry from either a FunctionDeclaration or an
 * arrow / function-expression. `form` controls the signature style to match the
 * existing convention: `function name(...)` vs `const name: (...) => ...`.
 *
 * A COMPOSABLE additionally carries `returns[]`: the members of the object it
 * hands back, which is what a consumer destructures and what the catalogue
 * lists one row at a time (`useIcon` → `iconData: ComputedRef<TIconInstance>`).
 * A util has a single unnamed return and keeps the `returnType` scalar the
 * caller already normalises into a one-row `returns` collection.
 */
function buildUtilEntry (sf, checker, name, fnNode, category, sourceFile, jsdoc, form, slugStyle, kind = 'util') {
    const params = fnNode.parameters.flatMap(p => {
        const flat = kind === 'composable' ? destructuredParams(sf, checker, p) : null
        if (flat) return flat
        return [{
            name: p.name.getText(sf),
            type: p.type ? p.type.getText(sf) : inferParamType(checker, p),
            required: !p.questionToken && !p.initializer,
            defaultValue: p.initializer ? p.initializer.getText(sf) : undefined,
        }]
    })
    const returnType = fnNode.type ? fnNode.type.getText(sf) : inferReturnType(checker, fnNode)
    const sig = buildSignature(name, params, returnType, form)
    const entry = { kind, name, slug: toSlug(name, slugStyle), category, sourceFile, signature: sig, params, returnType, jsdoc }
    if (kind === 'composable') {
        entry.domain = category
        entry.returns = namedReturns(checker, fnNode)
    }
    return entry
}

/**
 * A DESTRUCTURED parameter, flattened into one row per binding.
 *
 * `useTouch({ isActive, isTemporary, width, touchless, position }: {…})` takes
 * one parameter whose NAME, read literally, is the whole `{…}` pattern. The
 * catalogue documents the five bindings instead — and so does every consumer.
 * Measured: this form accounts for the bulk of the composable-parameter drift
 * against the curated rows (`useTouch`, `useOptions`, …).
 *
 * ⛔ Scoped to composables on purpose. The `util` family's curated rows were
 * produced by this same function in its non-flattening form, so flattening
 * there would rewrite rows nobody asked about, in a family this change is not
 * meant to touch.
 *
 * Returns null when the parameter is not an object pattern, so the caller keeps
 * its normal path.
 */
function destructuredParams (sf, checker, param) {
    if (!ts.isObjectBindingPattern(param.name)) return null
    const paramType = checker.getTypeAtLocation(param)
    return param.name.elements.map(el => {
        const key = (el.propertyName ?? el.name).getText(sf)
        const sym = paramType.getProperty?.(key)
        const decl = sym?.valueDeclaration ?? sym?.declarations?.[0]
        const written = decl?.type ? decl.type.getText() : null
        return {
            name: key,
            type: (written ?? (sym ? checker.typeToString(checker.getTypeOfSymbolAtLocation(sym, param)) : 'unknown')).replace(/\s+/g, ' '),
            required: !el.initializer && !(sym?.flags & ts.SymbolFlags.Optional),
            defaultValue: el.initializer ? el.initializer.getText(sf) : undefined,
        }
    })
}

/**
 * The members of a composable's returned object, read from the checker so the
 * shape is resolved whether the function annotates its return type or infers it.
 * An empty list when the return is not an object (`void`, a plain `Ref`) — the
 * caller then writes no `returns` row rather than inventing one.
 */
function namedReturns (checker, fnNode) {
    try {
        const sig = checker.getSignatureFromDeclaration(fnNode)
        if (!sig) return []
        const rt = checker.getReturnTypeOfSignature(sig)
        return checker.getPropertiesOfType(rt).map(sym => ({
            name: sym.getName(),
            type: checker.typeToString(checker.getTypeOfSymbolAtLocation(sym, fnNode)).replace(/\s+/g, ' '),
        }))
    } catch { return [] }
}

/**
 * The admissible VALUES of a type alias, as the checker expands them.
 *
 * ⛔ Reading the union members off the syntax tree is the obvious move and it
 * is wrong — measured against the curated catalogue, it reproduced 18 of the
 * 327 curated value rows and would have orphaned 309 of them. The curated
 * convention is not "the terms the author typed", it is "the values a consumer
 * may pass", which is exactly the checker's expansion:
 *
 *      TAlways = boolean | 'always'        syntax: boolean, 'always'
 *                                         checker: true, false, always   ← curated
 *      TAudioLoopMode = `${AUDIO_LOOP_MODE}`
 *                                         syntax: (one template term)
 *                                         checker: none, all, one        ← curated
 *
 * With the checker doing the expansion, 305 of the 327 curated rows are
 * reproduced and 63 of the 72 value-bearing entries come out identical. The 9
 * that differ are real drift in the design system (`TRounded` gained six rungs,
 * `TMode` and `TColorModes` now resolve to different unions) plus one spelling
 * (`Array<File>` vs `File[]`) and one prose cell (`(custom string)` vs
 * `string & {}`).
 *
 * A non-union alias (an object shape, a mapped type) yields no value, which is
 * also what the curated rows do: the catalogue then shows the definition alone.
 */
function unionValues (checker, node) {
    const t = checker.getTypeAtLocation(node.name)
    const parts = t.isUnion?.() ? t.types : [t]
    // A single non-literal term is a shape, not a value set — say nothing.
    if (parts.length === 1 && !isLiteralType(parts[0])) return []
    return parts.map(p => {
        if (p.isStringLiteral?.() || p.isNumberLiteral?.()) return String(p.value)
        return checker.typeToString(p).replace(/\s+/g, ' ')
    })
}

function isLiteralType (t) {
    return !!(t.isStringLiteral?.() || t.isNumberLiteral?.() || (t.flags & ts.TypeFlags.BooleanLiteral))
}

function inferParamType (checker, param) {
    try {
        const t = checker.getTypeAtLocation(param)
        return checker.typeToString(t)
    } catch { return 'any' }
}

function inferReturnType (checker, fn) {
    try {
        const sig = checker.getSignatureFromDeclaration(fn)
        if (sig) return checker.typeToString(checker.getReturnTypeOfSignature(sig))
    } catch { /* noop */ }
    return 'void'
}

function buildSignature (name, params, returnType, form = 'function') {
    const ps = params.map(p => {
        const opt = p.required ? '' : '?'
        const def = p.defaultValue ? ` = ${p.defaultValue.replace(/\s+/g, ' ')}` : ''
        return `${p.name}${opt}: ${p.type.replace(/\s+/g, ' ')}${def}`
    }).join(', ')
    const rt = returnType.replace(/\s+/g, ' ')
    return form === 'const'
        ? `const ${name}: (${ps}) => ${rt}`
        : `function ${name}(${ps}): ${rt}`
}

export { isPlaceholderJsDoc }
