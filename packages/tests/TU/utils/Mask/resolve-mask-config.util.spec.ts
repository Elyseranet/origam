import { describe, expect, it } from 'vitest'

import { resolveMaskConfig } from '@origam/utils/Mask/resolve-mask-config.util'

describe('resolveMaskConfig', () => {
    describe('null / undefined / empty string → returns null', () => {
        it('returns null for undefined', () => {
            expect(resolveMaskConfig(undefined)).toBeNull()
        })

        it('returns null for null', () => {
            expect(resolveMaskConfig(null)).toBeNull()
        })

        it('returns null for empty string', () => {
            expect(resolveMaskConfig('')).toBeNull()
        })
    })

    describe('built-in preset keys', () => {
        it('resolves "phone:fr" to the correct pattern', () => {
            const result = resolveMaskConfig('phone:fr')
            expect(result).not.toBeNull()
            expect(result!.pattern).toBe('## ## ## ## ##')
            expect(result!.validator).toBeNull()
            expect(result!.required).toBe(false)
        })

        it('resolves "phone:us" to the correct pattern', () => {
            const result = resolveMaskConfig('phone:us')
            expect(result!.pattern).toBe('(###) ###-####')
        })

        it('resolves "creditcard" with a non-null validator', () => {
            const result = resolveMaskConfig('creditcard')
            expect(result!.validator).not.toBeNull()
            expect(result!.pattern).toBe('#### #### #### ####')
        })

        it('resolves "iban" with a non-null validator', () => {
            const result = resolveMaskConfig('iban')
            expect(result!.validator).not.toBeNull()
        })

        it('resolves "date:iso" with a non-null validator', () => {
            const result = resolveMaskConfig('date:iso')
            expect(result!.pattern).toBe('####-##-##')
            expect(result!.validator).not.toBeNull()
        })

        it('resolves "date:fr" with a non-null validator', () => {
            const result = resolveMaskConfig('date:fr')
            expect(result!.pattern).toBe('##/##/####')
            expect(result!.validator).not.toBeNull()
        })

        it('resolves "date:us" with a non-null validator', () => {
            const result = resolveMaskConfig('date:us')
            expect(result!.pattern).toBe('##/##/####')
            expect(result!.validator).not.toBeNull()
        })

        it('resolves "time" with null validator', () => {
            const result = resolveMaskConfig('time')
            expect(result!.pattern).toBe('##:##')
            expect(result!.validator).toBeNull()
        })

        it('resolves "postcode:fr" with null validator', () => {
            const result = resolveMaskConfig('postcode:fr')
            expect(result!.pattern).toBe('#####')
            expect(result!.validator).toBeNull()
        })

        it('defaults required to false for presets that omit it', () => {
            const result = resolveMaskConfig('phone:fr')
            expect(result!.required).toBe(false)
        })
    })

    describe('raw pattern strings (not a preset key)', () => {
        it('uses the string verbatim as the pattern', () => {
            const result = resolveMaskConfig('##-##-####')
            expect(result).not.toBeNull()
            expect(result!.pattern).toBe('##-##-####')
            expect(result!.validator).toBeNull()
            expect(result!.required).toBe(false)
        })

        it('handles single-char pattern', () => {
            const result = resolveMaskConfig('#')
            expect(result!.pattern).toBe('#')
        })

        it('handles a pattern that looks similar to a preset but is not registered', () => {
            const result = resolveMaskConfig('phone:xx')
            expect(result!.pattern).toBe('phone:xx')
        })
    })

    describe('IMaskOptions object', () => {
        it('returns pattern, validator and required as-is', () => {
            const opts = { pattern: 'AA-##', validator: 'luhn' as any, required: true }
            const result = resolveMaskConfig(opts)
            expect(result!.pattern).toBe('AA-##')
            expect(result!.validator).toBe('luhn')
            expect(result!.required).toBe(true)
        })

        it('defaults validator to null when omitted', () => {
            const result = resolveMaskConfig({ pattern: 'AA-##' })
            expect(result!.validator).toBeNull()
        })

        it('defaults required to false when omitted', () => {
            const result = resolveMaskConfig({ pattern: 'AA-##' })
            expect(result!.required).toBe(false)
        })

        it('respects required: false explicitly', () => {
            const result = resolveMaskConfig({ pattern: 'AA-##', required: false })
            expect(result!.required).toBe(false)
        })
    })
})
