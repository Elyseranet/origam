import { CSS_LITERAL_REGEX, CSS_PROPERTY_NAME_REGEX, CSS_UNSAFE_VALUE_REGEX } from '../../consts/Commons/style.const'

/*********************************************************
 * maskCssLiterals
 *
 * @description
 * Replaces every quoted string and unquoted `url(…)` body by filler of the
 * SAME length, so indexes found in the mask (a `;`) still point into the
 * original text.
 ********************************************************/
function maskCssLiterals (value: string): string {
    return value.replace(CSS_LITERAL_REGEX, (literal) => '_'.repeat(literal.length))
}

/*********************************************************
 * toSafeCssDeclaration (#1113)
 *
 * @description
 * Returns `name: value` when both parts stay inside one declaration, `null`
 * otherwise. The value is checked on its masked form, so `;` `{` `}` inside a
 * quoted string or a `url(…)` body remain allowed.
 ********************************************************/
export function toSafeCssDeclaration (name: string, value: string): string | null {
    const safe = CSS_PROPERTY_NAME_REGEX.test(name) && !CSS_UNSAFE_VALUE_REGEX.test(maskCssLiterals(value))

    return safe ? `${name}: ${value}` : null
}

/*********************************************************
 * toSafeCssDeclarations (#1113)
 *
 * @description
 * Splits an inline style STRING (`color: red; padding: 4px`) on the `;` that
 * end a declaration — never on one inside a string or a `url(…)` body — and
 * keeps only the declarations `toSafeCssDeclaration` accepts.
 ********************************************************/
export function toSafeCssDeclarations (style: string): string[] {
    const masked = maskCssLiterals(style)
    const declarations: string[] = []
    let start = 0

    for (let end = 0; end <= masked.length; end++) {
        if (end < masked.length && masked[end] !== ';') continue

        const colon = masked.indexOf(':', start)

        if (colon !== -1 && colon < end) {
            const declaration = toSafeCssDeclaration(style.slice(start, colon).trim(), style.slice(colon + 1, end).trim())

            if (declaration) declarations.push(declaration)
        }

        start = end + 1
    }

    return declarations
}
