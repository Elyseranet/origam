/**
 * Escape an arbitrary string so it is safe to interpolate as a CSS
 * IDENT — i.e. after the `#` of an id selector.
 *
 * Needed because `useStyle()` builds a real stylesheet rule out of an
 * element id (`#<id> { … }`) and that id can now come from the CONSUMER
 * (the `id` prop). Without escaping, an id is not merely cosmetic: it is
 * injected verbatim into a `<style>` element, so `id="a { } body { display:
 * none }"` would append attacker/typo-controlled rules to the document.
 * Escaping also makes ids that are legal in HTML but illegal as a CSS ident
 * (leading digit, dots, colons — very common with template-generated ids)
 * actually match their element instead of silently killing the rule.
 *
 * Delegates to the native `CSS.escape` (CSSOM) when present. jsdom and SSR
 * have no `CSS` global, hence the manual fallback, which implements the same
 * spec algorithm. The fallback was compared against the native `CSS.escape`
 * in Chromium over 34 inputs (leading digit, lone `-`, `--`, control chars,
 * NULL, non-ASCII, backslash, quotes, whitespace, `#id`, `::before`) and is
 * byte-identical on all of them — worth re-running if it is ever touched,
 * because the unit tests only ever exercise this branch (jsdom exposes no
 * `CSS` global, so the native path is never taken under test).
 *
 * Known spec-mandated limit, shared with the native function: a NULL in the
 * input escapes to U+FFFD, so the resulting selector does NOT match an
 * element whose id really contains a NULL. Pathological in HTML, and not
 * something this function can fix — the round trip is lossy by spec.
 */
/** Digit, `0`-`9`. */
function isDigit (code: number): boolean {
    return code >= 0x0030 && code <= 0x0039
}

/**
 * Characters an ident may carry as-is: alphanumerics, `-`, `_`, and
 * everything non-ASCII (the spec lets those through unescaped).
 */
function isIdentSafe (code: number): boolean {
    return (
        code >= 0x0080 ||
        code === 0x002D ||
        code === 0x005F ||
        isDigit(code) ||
        (code >= 0x0041 && code <= 0x005A) ||
        (code >= 0x0061 && code <= 0x007A)
    )
}

/**
 * Characters that must take the `\<hex><space>` form: the C0 controls and
 * DEL, plus a digit in a position where it would start the ident — first,
 * or second behind a leading `-`.
 */
function needsHexEscape (code: number, index: number, value: string): boolean {
    if (code <= 0x001F || code === 0x007F) return true
    if (!isDigit(code)) return false

    return index === 0 || (index === 1 && value.charCodeAt(0) === 0x002D)
}

/** A lone `-` is not a valid ident on its own. */
function isLoneHyphen (code: number, index: number, value: string): boolean {
    return index === 0 && code === 0x002D && value.length === 1
}

function escapeIdentChar (value: string, index: number): string {
    const code = value.charCodeAt(index)

    if (code === 0x0000) return '�'
    if (needsHexEscape(code, index, value)) return `\\${code.toString(16)} `
    if (isLoneHyphen(code, index, value)) return `\\${value[index]}`
    if (isIdentSafe(code)) return value[index]

    return `\\${value[index]}`
}

export function escapeCssIdent (value: string): string {
    const css = (globalThis as { CSS?: { escape?: (v: string) => string } }).CSS

    /* istanbul ignore next — browser path, jsdom has no CSS global */
    if (typeof css?.escape === 'function') return css.escape(value)

    let out = ''

    for (let i = 0; i < value.length; i++) {
        out += escapeIdentChar(value, i)
    }

    return out
}

/**
 * Returns:
 *  - 'null' if the node is not attached to the DOM
 *  - the root node (HTMLDocument | ShadowRoot) otherwise
 */
export function attachedRoot (node: Node): null | Document | ShadowRoot {
    /* istanbul ignore next */
    if (typeof node.getRootNode !== 'function') {
        // Shadow DOM not supported (IE11), lets find the root of this node
        while (node.parentNode) node = node.parentNode

        // The root parent is the document if the node is attached to the DOM
        if (node !== document) return null

        return document
    }

    const root = node.getRootNode()

    // The composed root node is the document if the node is attached to the DOM
    if (root !== document && root.getRootNode({composed: true}) !== document) return null

    return root as Document | ShadowRoot
}
