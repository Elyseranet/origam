/**
 * Canonical token-path → origam CSS-variable-name algorithm.
 *
 * This pure, dependency-free module is the SINGLE SOURCE OF TRUTH for the
 * naming grammar. It is consumed by:
 *   - `scripts/build-tokens.mjs` (Style Dictionary `origam/name/css` transform)
 *   - `src/utils/Theme/token-name.util.ts` (runtime + Theme Builder export)
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
 */
export function isBemChildKey (key) {
    return /^[a-zA-Z]+$/.test(key) && !key.includes('-')
}

/**
 * Resolve a token path to its origam CSS variable name (without the leading
 * `--`). `isComponent` is `true` when the token originates from a
 * `tokens/component/*.json` source; `false` for primitive / semantic tokens.
 */
export function tokenPathToCssVarName (path, isComponent) {
    if (isComponent) {
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
