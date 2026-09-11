import { PATTERN_VALIDATOR } from '../../enums'

import type { TPatternValidator, TPatternValidatorName } from '../../types'

/**
 * Standard Luhn checksum used to validate credit-card,
 * IMEI, SIRET-like number sequences.
 *
 *   1. Walk digits from right to left.
 *   2. Double every second digit; subtract 9 if > 9.
 *   3. Sum the result. A valid number's sum mod 10 == 0.
 */
export function isLuhnValid (digits: string): boolean {
    if (!digits) return false
    if (!/^\d+$/.test(digits)) return false

    let sum = 0
    let alternate = false
    for (let i = digits.length - 1; i >= 0; i--) {
        let n = digits.charCodeAt(i) - 48
        if (alternate) {
            n *= 2
            if (n > 9) n -= 9
        }
        sum += n
        alternate = !alternate
    }
    return sum % 10 === 0
}

/**
 * Standard IBAN mod-97 check (ISO 13616).
 *
 *   1. Move the first 4 chars to the end.
 *   2. Replace every letter with `letter - 'A' + 10` as a
 *      decimal pair.
 *   3. The resulting big integer mod 97 must equal 1.
 *
 * We compute the mod incrementally to avoid BigInt.
 */
export function isIbanValid (raw: string): boolean {
    if (!raw) return false
    const clean = raw.replace(/\s+/g, '').toUpperCase()
    if (clean.length < 4 || clean.length > 34) return false
    if (!/^[A-Z0-9]+$/.test(clean)) return false

    const rearranged = clean.slice(4) + clean.slice(0, 4)
    let numeric = ''
    for (const c of rearranged) {
        if (c >= '0' && c <= '9') {
            numeric += c
        } else {
            // 'A' (65) → 10, 'B' → 11, …, 'Z' → 35
            numeric += String(c.charCodeAt(0) - 55)
        }
    }

    // incremental mod-97
    let remainder = 0
    for (const ch of numeric) {
        remainder = (remainder * 10 + (ch.charCodeAt(0) - 48)) % 97
    }
    return remainder === 1
}

/**
 * Validates a calendar date against the gregorian rules
 * (real days per month, leap years).
 */
function isRealDate (y: number, m: number, d: number): boolean {
    if (m < 1 || m > 12) return false
    if (d < 1 || d > 31) return false
    const date = new Date(Date.UTC(y, m - 1, d))
    return (
        date.getUTCFullYear() === y &&
        date.getUTCMonth() === m - 1 &&
        date.getUTCDate() === d
    )
}

/**
 * `YYYYMMDD` — accepts the unmasked iso digits.
 */
export function isIsoDateValid (unmasked: string): boolean {
    if (!/^\d{8}$/.test(unmasked)) return false
    const y = Number(unmasked.slice(0, 4))
    const m = Number(unmasked.slice(4, 6))
    const d = Number(unmasked.slice(6, 8))
    return isRealDate(y, m, d)
}

/**
 * `DDMMYYYY` — accepts the unmasked fr digits.
 */
export function isFrDateValid (unmasked: string): boolean {
    if (!/^\d{8}$/.test(unmasked)) return false
    const d = Number(unmasked.slice(0, 2))
    const m = Number(unmasked.slice(2, 4))
    const y = Number(unmasked.slice(4, 8))
    return isRealDate(y, m, d)
}

/**
 * `MMDDYYYY` — accepts the unmasked us digits.
 */
export function isUsDateValid (unmasked: string): boolean {
    if (!/^\d{8}$/.test(unmasked)) return false
    const m = Number(unmasked.slice(0, 2))
    const d = Number(unmasked.slice(2, 4))
    const y = Number(unmasked.slice(4, 8))
    return isRealDate(y, m, d)
}

/**
 * Lookup table — built-in validator name → impl.
 */
const VALIDATORS: Record<TPatternValidatorName, (s: string) => boolean> = {
    [PATTERN_VALIDATOR.LUHN]: isLuhnValid,
    [PATTERN_VALIDATOR.IBAN]: isIbanValid,
    [PATTERN_VALIDATOR.DATE_ISO]: isIsoDateValid,
    [PATTERN_VALIDATOR.DATE_FR]: isFrDateValid,
    [PATTERN_VALIDATOR.DATE_US]: isUsDateValid
}

/**
 * Resolve and execute a validator on an UNMASKED value.
 *
 * - `string`   → looked up in `VALIDATORS`. Unknown names
 *                throw — typo-prevention.
 * - `function` → called as-is.
 */
export function validatePattern (
    unmasked: string,
    validator: TPatternValidator
): boolean {
    if (typeof validator === 'function') {
        return validator(unmasked)
    }
    const fn = VALIDATORS[validator]
    if (!fn) {
        throw new Error(`[origam:mask] unknown validator "${validator}"`)
    }
    return fn(unmasked)
}
