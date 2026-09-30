/*********************************************************
 * token-sheet.mjs — resolve a legacy dotted token path to the CSS variable
 * the design system ACTUALLY declares.
 *
 * @description
 * The marketing catalogue's `kind_extra.tokens.excerpt` was authored against
 * the Style Dictionary v4 + Tokens Studio pipeline: `tokenPath` held a DTCG
 * source path (`btn.background-color`) and `value` a DTCG reference
 * (`{color.action.primary.bg}`). That pipeline, its `packages/ds/tokens/`
 * sources and the Figma sync plugin were REMOVED on 2026-08-31. Neither
 * spelling names anything that exists any more.
 *
 * @description
 * What exists today is a set of HAND-MAINTAINED stylesheets under
 * `packages/ds/src/assets/css/tokens/`, and the grammar they use is
 * `--origam-{block}---{property}`, with `--{state}---` for a state and
 * `__{child}---` for a BEM child.
 *
 * @description
 * ⛔ The dotted path CANNOT be converted by string substitution. A dot means
 * four different separators depending on the segment's ROLE, and the role is
 * not recoverable from the path: `alert.success.bg` is
 * `--origam-alert--success---bg` (state), `alert.title.font-size` is
 * `--origam-alert__title---font-size` (BEM child), and
 * `breadcrumb.item.color` is `--origam-breadcrumb-item---color` (a flat
 * block name, not a child at all). Guessing produces a plausible variable
 * name that resolves to nothing — exactly the failure this module exists to
 * prevent.
 *
 * @description
 * So this module does not convert; it LOOKS UP. It enumerates every spelling
 * the grammar can produce for a dotted path and keeps only the ones the
 * sheets really declare. One hit is the answer; several is an ambiguity the
 * caller must settle by reading which variable the component consumes; none
 * means the token does not exist and MUST NOT be invented.
 ********************************************************/

import { readFileSync } from 'node:fs'
import { dirname, resolve as resolvePath } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = resolvePath(dirname(fileURLToPath(import.meta.url)), '../../../..')

/*********************************************************
 * SHEETS
 *
 * @description
 * The hand-maintained token stylesheets, in increasing precedence. `light.css`
 * is last because it is the default identity the catalogue documents: when a
 * name is declared in several sheets, the light value is the one the page
 * should show.
 *
 * @description
 * `dark.css` is read even though the page documents light, because a handful
 * of names are declared ONLY there. Including it keeps a real token from
 * being reported as absent.
 ********************************************************/
export const SHEETS = [
    'packages/ds/src/assets/css/tokens/primitive.css',
    'packages/ds/src/assets/css/tokens/dark.css',
    'packages/ds/src/assets/css/tokens/light.css'
]

/*********************************************************
 * DECL_RE
 *
 * @description
 * Matches one custom-property declaration at the start of a line. Anchored on
 * `--origam-` so a `var()` reference inside a value is never mistaken for a
 * declaration, and stops at the first `;` so a multi-value shadow stays whole.
 ********************************************************/
const DECL_RE = /^[ \t]*(--origam-[A-Za-z0-9_-]+)[ \t]*:[ \t]*([^;]+);/gm

/*********************************************************
 * parseSheet
 *
 * @description
 * Reads one stylesheet into a `name -> declared value` map. The FIRST
 * declaration of a name inside a single sheet wins: the light sheet declares
 * its set once at the top and the later blocks are brand/mode overrides, so
 * the first is the default identity.
 ********************************************************/
export function parseSheet (relPath) {
    const src = readFileSync(resolvePath(REPO, relPath), 'utf8')
    const out = new Map()
    let m
    DECL_RE.lastIndex = 0
    while ((m = DECL_RE.exec(src)) !== null) {
        if (!out.has(m[1])) out.set(m[1], m[2].trim())
    }
    return out
}

/*********************************************************
 * loadDeclared
 *
 * @description
 * The union of every declared name across `SHEETS`, later sheets winning.
 * This is the ground truth every other function in this module compares to.
 ********************************************************/
export function loadDeclared () {
    const out = new Map()
    for (const sheet of SHEETS) {
        for (const [name, value] of parseSheet(sheet)) out.set(name, value)
    }
    return out
}

/*********************************************************
 * BLOCK_SEPARATORS
 *
 * @description
 * The three separators that can join two segments BEFORE the `---` boundary:
 * a plain hyphen (both segments belong to one flat block name), `__` (the
 * next segment is a BEM child) and `--` (the next segment is a state).
 ********************************************************/
const BLOCK_SEPARATORS = ['-', '__', '--']

/*********************************************************
 * candidates
 *
 * @description
 * Every variable name the origam grammar can spell for a dotted path. The
 * `---` boundary sits at exactly one of the segment joins; segments before it
 * are joined by each combination of `BLOCK_SEPARATORS`, and segments after it
 * by `-` (a property name is hyphenated, never separated further).
 *
 * @description
 * The count is bounded by `3^(n-1) * (n-1)` for an n-segment path — 12 names
 * for the typical three-segment path, 4 for a two-segment one. Enumerating is
 * cheaper and far more honest than a heuristic, because every candidate is
 * then checked against the sheets rather than trusted.
 ********************************************************/
export function candidates (path) {
    const out = []
    for (let cut = 1; cut < path.length; cut++) {
        const block = path.slice(0, cut)
        const property = path.slice(cut).join('-')
        const joins = block.length - 1
        const combinations = BLOCK_SEPARATORS.length ** joins
        for (let i = 0; i < combinations; i++) {
            let name = block[0]
            let n = i
            for (let j = 0; j < joins; j++) {
                name += BLOCK_SEPARATORS[n % BLOCK_SEPARATORS.length] + block[j + 1]
                n = Math.floor(n / BLOCK_SEPARATORS.length)
            }
            out.push(`--origam-${name}---${property}`)
        }
    }
    return out
}

/*********************************************************
 * PINNED
 *
 * @description
 * The four dotted paths whose enumeration matches TWO declared names. Each is
 * settled by reading which variable the component's own SCSS consumes FIRST —
 * the primary channel, the other being its `var()` fallback. Not a preference:
 * the primary is the one a consumer sets to change the rendering.
 *
 * @description
 * `chip.overlay.opacity` — `OrigamChip.vue:643` reads
 * `var(--origam-chip__overlay---opacity, var(--origam-chip---overlay-opacity, 0))`.
 * @description
 * `data-table.row.background-color` — `OrigamDataTableRow.vue:303` reads
 * `var(--origam-data-table-row---background-color, var(--origam-data-table__row---background-color, ...))`.
 * @description
 * `data-table.row.transition-duration` — same file, line 306, same shape.
 * @description
 * `data-table.row.column-title.font-weight` — same file, line 314, same shape.
 ********************************************************/
export const PINNED = {
    'chip.overlay.opacity': '--origam-chip__overlay---opacity',
    'data-table.row.background-color': '--origam-data-table-row---background-color',
    'data-table.row.transition-duration': '--origam-data-table-row---transition-duration',
    'data-table.row.column-title.font-weight': '--origam-data-table-row__column-title---font-weight'
}

/*********************************************************
 * resolveTokenPath
 *
 * @description
 * Resolves one dotted path against the declared set. Returns
 * `{ status: 'ok', name, value, how }`, `{ status: 'ambiguous', hits }` or
 * `{ status: 'absent' }`. Nothing is ever fabricated: an `ok` result names a
 * variable that is declared in one of `SHEETS`, with the value written there.
 *
 * @description
 * `slug` enables ONE retry, and it is the only liberty this module takes. A
 * few catalogue entries were authored against a block name the design system
 * has since renamed — `bottom-bar.height` for what is now
 * `--origam-bottom-nav---height`, `tabs.panel.padding-block` for
 * `--origam-tab-panels__panel---padding-block`. Substituting the entry's own
 * slug for the first segment recovers those, and it is not a guess: the slug
 * is a fact already on the record, and the candidate still has to be declared
 * to be accepted.
 ********************************************************/
export function resolveTokenPath (declared, tokenPath, slug = null) {
    /*********************************************************
     * @description
     * ⛔ IDEMPOTENCE. A `tokenPath` that is ALREADY a variable name carries no
     * dots to split on, so the enumeration below would produce nothing and the
     * line would be reported absent — a second run of the fixer would delete
     * everything the first one corrected. Recognising the current grammar
     * first is what makes re-running safe, and re-running is the normal case:
     * `docs-fixtures.yml` round-trips this seed on every `packages/ds/**`
     * change.
     * @description
     * The value is re-read from the sheets rather than trusted, so a token
     * whose declaration moved is refreshed and one that was deleted is
     * correctly reported absent.
     ********************************************************/
    if (String(tokenPath).startsWith('--origam-')) {
        return declared.has(tokenPath)
            ? { status: 'ok', how: 'already-derived', name: tokenPath, value: declared.get(tokenPath) }
            : { status: 'absent' }
    }

    const pinned = PINNED[tokenPath]
    if (pinned && declared.has(pinned)) {
        return { status: 'ok', how: 'pinned', name: pinned, value: declared.get(pinned) }
    }

    const attempt = (path, how) => {
        const hits = [...new Set(candidates(path).filter(c => declared.has(c)))]
        if (hits.length === 1) return { status: 'ok', how, name: hits[0], value: declared.get(hits[0]) }
        if (hits.length > 1) return { status: 'ambiguous', hits }
        return null
    }

    const segments = String(tokenPath).split('.')
    const direct = attempt(segments, 'direct')
    if (direct) return direct

    if (slug && segments.length > 1 && segments[0] !== slug) {
        const anchored = attempt([slug, ...segments.slice(1)], 'slug-anchored')
        if (anchored) return anchored
    }

    return { status: 'absent' }
}

/*********************************************************
 * isRederived
 *
 * @description
 * True when an excerpt line already carries the current grammar: a
 * `tokenPath` that is a real `--origam-…` variable name, and a `value` free
 * of DTCG brace references. Used by the guard to tell a corrected line from
 * one still in the removed pipeline's notation.
 ********************************************************/
export function isRederived (line) {
    const path = String(line?.tokenPath ?? '')
    const value = String(line?.value ?? '')
    return path.startsWith('--origam-') && !/\{[^}]+\}/.test(value)
}
