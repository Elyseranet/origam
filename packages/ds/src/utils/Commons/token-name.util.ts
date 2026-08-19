/**
 * Token-path → origam CSS-variable-name naming grammar (runtime).
 *
 * This is the runtime / Theme-Builder-export twin of the build-time core in
 * `scripts/token-name.mjs`. Both implement the SAME algorithm; a parity unit
 * test (`token-name.util.spec.ts`) asserts they stay byte-identical so the
 * names baked into the published CSS sheets never drift from the names a
 * runtime-injected or exported theme produces.
 *
 * Why two copies instead of one shared module: the build script is a Node
 * `.mjs` that runs before the library is bundled, while the published library
 * only ships `src/**\/*.ts` (mkdist). A relative import from `src` into
 * `scripts/` would not survive the build, so the implementation is duplicated
 * and protected by the parity test instead.
 *
 * Grammar (`---` separates block from property, `--` a state/modifier, `__` a
 * BEM child):
 *
 *   COMPONENT
 *     ['btn']                            → --origam-btn
 *     ['btn', 'background-color']        → --origam-btn---background-color
 *     ['btn', 'primary', 'background-color'] → --origam-btn--primary---background-color
 *     ['card', 'overlay', 'background-color'] → --origam-card__overlay---background-color
 *     ['card', 'overlay', 'hover', 'opacity'] → --origam-card__overlay--hover---opacity
 *
 *   PRIMITIVE / SEMANTIC (by path length)
 *     ['color', 'black']                 → --origam-color---black
 *     ['color', 'neutral', '500']        → --origam-color__neutral---500
 *     ['color', 'action', 'primary', 'bg'] → --origam-color__action--primary---bg
 */

/**
 * Component-level intent / state / modifier segments. A path segment matching
 * one of these (in a component context) is emitted with the `--` modifier
 * separator rather than treated as a BEM child or property.
 */
export const TOKEN_INTENT_STATES: ReadonlySet<string> = new Set([
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
export function isBemChildKey (key: string): boolean {
    return /^[a-zA-Z]+$/.test(key) && !key.includes('-')
}

/**
 * Resolve a token path to its origam CSS variable name (WITHOUT the leading
 * `--`). `isComponent` is `true` when the token originates from a
 * `tokens/component/*.json` source; `false` for primitive / semantic tokens.
 */
export function tokenPathToCssVarName (path: ReadonlyArray<string>, isComponent: boolean): string {
    if (isComponent) {
        const [blockName, ...rest] = path

        if (rest.length === 0) {
            return `origam-${blockName}`
        }

        if (rest.length > 1 && TOKEN_INTENT_STATES.has(rest[0])) {
            const [state, ...propParts] = rest
            return `origam-${blockName}--${state}---${propParts.join('-')}`
        }

        if (rest.length > 1 && isBemChildKey(rest[0])) {
            const [child, ...propParts] = rest
            if (propParts.length > 1 && TOKEN_INTENT_STATES.has(propParts[0])) {
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
 * `--origam-…`, ready to drop into a stylesheet declaration or `style`
 * binding.
 */
export function tokenPathToCssVar (path: ReadonlyArray<string>, isComponent: boolean): string {
    return `--${tokenPathToCssVarName(path, isComponent)}`
}
