/**
 * Canonical token-path → origam CSS-variable-name algorithm.
 *
 * This pure, dependency-free module is the SINGLE SOURCE OF TRUTH for the
 * naming grammar. It is consumed by:
 *   - `scripts/build-tokens.mjs` (Style Dictionary `origam/name/css` transform)
 *   - `src/utils/Commons/token-name.util.ts` (runtime + Theme Builder export)
 *
 * Keeping both consumers on this module avoids drift between the names baked
 * into the published CSS sheets and the names a runtime/exported theme emits.
 * A parity unit test (`token-name.util.spec.ts`) asserts the TS wrapper and
 * this core stay byte-identical.
 *
 * Grammar (the `---` triple-tiret separates block from property, `--`
 * double-tiret separates a state/modifier, `__` separates a BEM child):
 *
 *   COMPONENT (filePath under `component/`)
 *     [btn]                          → origam-btn
 *     [btn, background-color]        → origam-btn---background-color
 *     [btn, primary, background-color] → origam-btn--primary---background-color
 *     [card, overlay, background-color] → origam-card__overlay---background-color
 *     [card, overlay, hover, opacity]   → origam-card__overlay--hover---opacity
 *
 *   PRIMITIVE / SEMANTIC (by path length)
 *     [color, black]                 → origam-color---black
 *     [color, neutral, 500]          → origam-color__neutral---500
 *     [color, action, primary, bg]   → origam-color__action--primary---bg
 *
 * RESERVED MARKER GROUPS (`$child` / `$state`, issue #435)
 *
 * A component token file may DECLARE, rather than imply, that the segment
 * which follows is a BEM child or a state / modifier:
 *
 *   "table": { "$child": { "header-cell": { "background-color": … } } }
 *     → origam-table__header-cell---background-color
 *   "field": { "$state": { "variant-solo": { "box-shadow": … } } }
 *     → origam-field--variant-solo---box-shadow
 *
 * The markers nest, which is what makes them strictly more expressive than
 * the heuristic they override —
 * `calendar.$child.timeline.$child.hour-label.width` emits
 * `origam-calendar__timeline__hour-label---width`, a two-level child the
 * single-`__` heuristic cannot produce at all.
 *
 * `$` is DTCG's own metadata channel (`$value`, `$type`, `$description`), so
 * a `$`-prefixed group can never collide with a real child, state or property
 * name, and Tokens Studio / Figma round-trip the source keys untouched.
 *
 * ⛔ A path carrying no marker is resolved by the legacy heuristic, byte for
 * byte — the markers are an opt-in override, not a migration. The converse
 * also holds and is the sharp edge: as soon as a path carries ANY marker the
 * heuristic stops running on ALL of its segments, so a state it used to catch
 * for free (`error`, a member of INTENT_STATES) must then be marked
 * explicitly or it collapses into the property name.
 */

/**
 * Component-level intent / state / modifier segments. A path segment matching
 * one of these (in a component context) is emitted with the `--` modifier
 * separator instead of being treated as a BEM child or property.
 */
export const INTENT_STATES = new Set([
    'primary', 'secondary', 'ghost',
    'success', 'warning', 'danger', 'info', 'error',
    'selected', 'outlined', 'elevated', 'filter',
    'hover', 'active', 'disabled', 'focus'
])

/**
 * A BEM child key is a single bare word (letters only, no separators / digits).
 * Property keys typically contain hyphens (`background-color`) so they fail
 * this test and are emitted as properties rather than children.
 *
 * This heuristic is UNDECIDABLE on hyphenated keys: `header-cell` (a child),
 * `background-color` (a property) and `variant-solo` (a state) are lexically
 * identical, so it classifies all three as properties and flattens the two it
 * gets wrong. That is issue #435. The cure is not a better heuristic — no
 * heuristic can separate them — but the reserved marker groups below, which
 * let a source declare its intent instead of hoping the guesser lands right.
 */
export function isBemChildKey (key) {
    return /^[a-zA-Z]+$/.test(key) && !key.includes('-')
}

export const TOKEN_GROUP_CHILD = '$child'
export const TOKEN_GROUP_STATE = '$state'

function markedComponentVarName (path) {
    const [blockName, ...rest] = path
    let name = `origam-${blockName}`
    const propParts = []

    for (let i = 0; i < rest.length; i++) {
        if (rest[i] === TOKEN_GROUP_CHILD && i + 1 < rest.length) { name += `__${rest[++i]}`; continue }
        if (rest[i] === TOKEN_GROUP_STATE && i + 1 < rest.length) { name += `--${rest[++i]}`; continue }
        propParts.push(rest[i])
    }

    return propParts.length === 0 ? name : `${name}---${propParts.join('-')}`
}

/**
 * Resolve a token path to its origam CSS variable name (without the leading
 * `--`). `isComponent` is `true` when the token originates from a
 * `tokens/component/*.json` source; `false` for primitive / semantic tokens.
 */
export function tokenPathToCssVarName (path, isComponent) {
    if (isComponent) {
        if (path.includes(TOKEN_GROUP_CHILD) || path.includes(TOKEN_GROUP_STATE)) {
            return markedComponentVarName(path)
        }

        const [blockName, ...rest] = path

        if (rest.length === 0) {
            return `origam-${blockName}`
        }

        if (rest.length > 1 && INTENT_STATES.has(rest[0])) {
            const [state, ...propParts] = rest
            return `origam-${blockName}--${state}---${propParts.join('-')}`
        }

        if (rest.length > 1 && isBemChildKey(rest[0])) {
            const [child, ...propParts] = rest
            if (propParts.length > 1 && INTENT_STATES.has(propParts[0])) {
                const [state, ...innerProp] = propParts
                return `origam-${blockName}__${child}--${state}---${innerProp.join('-')}`
            }
            return `origam-${blockName}__${child}---${propParts.join('-')}`
        }

        return `origam-${blockName}---${rest.join('-')}`
    }

    if (path.length === 2) {
        return `origam-${path[0]}---${path[1]}`
    }
    if (path.length === 3) {
        return `origam-${path[0]}__${path[1]}---${path[2]}`
    }
    if (path.length === 4) {
        return `origam-${path[0]}__${path[1]}--${path[2]}---${path[3]}`
    }
    return `origam-${path.join('-')}`
}

/**
 * Convenience wrapper that returns the full custom-property reference,
 * `--origam-…`, ready to drop into a stylesheet declaration.
 */
export function tokenPathToCssVar (path, isComponent) {
    return `--${tokenPathToCssVarName(path, isComponent)}`
}
