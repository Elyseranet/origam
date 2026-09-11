import { CUSTOM_BORDER_RADIUS_REGEX } from '../../consts'

/**
 * Whether a string is a free-form custom `border-radius` value (a
 * `var(...)` / `calc(...)` reference or a single CSS length outside the
 * literal `BORDER_RADIUS_REGEX` whitelist) that should be emitted verbatim
 * as an inline `border-radius` declaration.
 *
 * @param value …
 */
export function isCustomBorderRadius (value: string): boolean {
    return CUSTOM_BORDER_RADIUS_REGEX.test(value.trim())
}

/**
 * Format rounded styles var.
 *
 * @param values …
 */
export function formatRoundedStylesVar (values: Array<string>) {
    const styles = []

    switch (values.length) {
        case 1 :
            styles.push(`border-radius: ${values[0]}`)
            break
        case 4 :
            styles.push(`border-start-start-radius: ${values[0]}`)
            styles.push(`border-start-end-radius: ${values[1]}`)
            styles.push(`border-end-start-radius: ${values[2]}`)
            styles.push(`border-end-end-radius: ${values[3]}`)
            break
    }

    return styles
}
