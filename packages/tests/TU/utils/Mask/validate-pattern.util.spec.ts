import { describe, expect, it } from 'vitest'

import {
    isFrDateValid,
    isIbanValid,
    isIsoDateValid,
    isLuhnValid,
    isUsDateValid,
    validatePattern
} from '@origam/utils/Mask/validate-pattern.util'

describe('isLuhnValid', () => {
    // Public test card numbers (Visa, MC, Amex, Discover)
    it.each([
        '4111111111111111',
        '5555555555554444',
        '378282246310005',
        '6011111111111117'
    ])('valid: %s', (n) => {
        expect(isLuhnValid(n)).toBe(true)
    })

    it.each([
        '1234567890123456',
        '4111111111111112',
        '0000000000000001',
        '9999999999999999'
    ])('invalid: %s', (n) => {
        expect(isLuhnValid(n)).toBe(false)
    })

    it('rejects empty / non-numeric', () => {
        expect(isLuhnValid('')).toBe(false)
        expect(isLuhnValid('abc')).toBe(false)
        expect(isLuhnValid('41 11')).toBe(false)
    })
})

describe('isIbanValid', () => {
    // Spec-compliant example IBANs (from the ECBS test set)
    it.each([
        'GB82WEST12345698765432',
        'DE89370400440532013000',
        'FR1420041010050500013M02606',
        'BE68539007547034'
    ])('valid: %s', (n) => {
        expect(isIbanValid(n)).toBe(true)
    })

    it.each([
        'GB82WEST12345698765431',
        'DE00000000000000000000',
        'FR0000000000000000000000000',
        'XX12345678901234567890'
    ])('invalid: %s', (n) => {
        expect(isIbanValid(n)).toBe(false)
    })

    it('accepts spaces in the input (paste-friendly)', () => {
        expect(isIbanValid('GB82 WEST 1234 5698 7654 32')).toBe(true)
    })
})

describe('iso date validator', () => {
    it.each(['20240101', '20000229', '19991231'])('valid: %s', (n) => {
        expect(isIsoDateValid(n)).toBe(true)
    })
    it.each(['20240230', '20011302', '2024010'])('invalid: %s', (n) => {
        expect(isIsoDateValid(n)).toBe(false)
    })
})

describe('fr date validator', () => {
    it('valid 31/12/2024', () => {
        expect(isFrDateValid('31122024')).toBe(true)
    })
    it('invalid 32/01/2024', () => {
        expect(isFrDateValid('32012024')).toBe(false)
    })
    it('29/02/2024 (leap) is valid', () => {
        expect(isFrDateValid('29022024')).toBe(true)
    })
    it('29/02/2023 (non-leap) is invalid', () => {
        expect(isFrDateValid('29022023')).toBe(false)
    })
})

describe('us date validator', () => {
    it('valid 12/31/2024', () => {
        expect(isUsDateValid('12312024')).toBe(true)
    })
    it('invalid 13/01/2024', () => {
        expect(isUsDateValid('13012024')).toBe(false)
    })
})

describe('validatePattern (dispatcher)', () => {
    it('calls a built-in validator by name', () => {
        expect(validatePattern('4111111111111111', 'luhn')).toBe(true)
    })

    it('calls a user-supplied function', () => {
        const fn = (v: string) => v === 'origam'
        expect(validatePattern('origam', fn)).toBe(true)
        expect(validatePattern('nope', fn)).toBe(false)
    })

    it('throws on unknown validator name', () => {
        expect(() => validatePattern('x', 'unknown' as any)).toThrow(/unknown validator/)
    })
})
