import type { THSVA } from "../../types"

import { has, HSVtoHex, HSVtoHSL, HSVtoRGB } from "../../utils"

/**
 * Strip alpha.
 *
 * @param color      …
 * @param stripAlpha …
 */
export function stripAlpha (color: any, stripAlpha: boolean) {
    if (stripAlpha) {
        const result = {...color}

        delete result.a

        return result
    }

    return color
}

/**
 * Extract color.
 *
 * @param color …
 * @param input …
 */
export function extractColor (color: THSVA, input: any) {
    if (input == null || typeof input === 'string') {
        const hex = HSVtoHex(color)
        return color.a === 1 ? hex.slice(0, 7) : hex
    }

    if (typeof input === 'object') {
        let converted

        if (has(input, ['r', 'g', 'b'])) converted = HSVtoRGB(color)
        else if (has(input, ['h', 's', 'l'])) converted = HSVtoHSL(color)
        else if (has(input, ['h', 's', 'v'])) converted = color

        return stripAlpha(converted, !has(input, ['a']) && color.a === 1)
    }

    return color
}

/**
 * Has alpha.
 *
 * @param color …
 */
export function hasAlpha (color: any) {
    if (!color) return false

    if (typeof color === 'string') {
        return color.length > 7
    }

    if (typeof color === 'object') {
        return has(color, ['a']) || has(color, ['alpha'])
    }

    return false
}
