import { describe, expect, it } from 'vitest'

import { applyMask, parsePattern, unmaskValue } from '@origam/utils/Mask/apply-mask.util'

describe('parsePattern', () => {
    it('parses digits, letters, any and literals', () => {
        const tokens = parsePattern('AA-##/*')
        expect(tokens).toHaveLength(7)
        expect(tokens.map((t) => t.kind)).toEqual([
            'letter', 'letter', 'literal', 'digit', 'digit', 'literal', 'any'
        ])
        expect(tokens[2].char).toBe('-')
        expect(tokens[5].char).toBe('/')
    })

    it('returns empty for empty pattern', () => {
        expect(parsePattern('')).toEqual([])
    })

    it('caches subsequent calls (returns same ref)', () => {
        const a = parsePattern('##')
        const b = parsePattern('##')
        expect(a).toBe(b)
    })
})

describe('applyMask — basic groups', () => {
    it('formats "123456" against "## ## ##" to "12 34 56" + complete', () => {
        const r = applyMask('123456', '## ## ##')
        expect(r.masked).toBe('12 34 56')
        expect(r.unmasked).toBe('123456')
        expect(r.complete).toBe(true)
    })

    it('keeps trailing literal when next slot is empty', () => {
        const r = applyMask('12', '## ##')
        expect(r.masked).toBe('12 ')
        expect(r.unmasked).toBe('12')
        expect(r.complete).toBe(false)
    })

    it('handles mixed letter+digit pattern', () => {
        const r = applyMask('AB12', 'AA ##')
        expect(r.masked).toBe('AB 12')
        expect(r.unmasked).toBe('AB12')
        expect(r.complete).toBe(true)
    })

    it('drops mismatched characters silently', () => {
        // pattern wants letter-letter-digit-digit
        // value "A1B2" → A (letter) ok, then 1 (mismatch, drop),
        // B (letter) ok, then 2 (digit) ok → consumed "AB2"
        // remaining input runs out → only one digit slot filled
        const r = applyMask('A1B2', 'AA ##')
        expect(r.masked).toBe('AB 2')
        expect(r.unmasked).toBe('AB2')
        expect(r.complete).toBe(false)
    })

    // Pattern (##) ###-#### has 2 + 3 + 4 = 9 digit slots
    it('custom (##) ###-#### formats 9 digits (complete)', () => {
        const r = applyMask('123456789', '(##) ###-####')
        expect(r.masked).toBe('(12) 345-6789')
        expect(r.unmasked).toBe('123456789')
        expect(r.complete).toBe(true)
    })

    it('custom (##) ###-#### with 10 digits drops the 10th (excess)', () => {
        const r = applyMask('1234567890', '(##) ###-####')
        expect(r.masked).toBe('(12) 345-6789')
        expect(r.unmasked).toBe('123456789')
        expect(r.complete).toBe(true)
    })

    it('returns empty masked for empty value', () => {
        const r = applyMask('', '## ##')
        expect(r.masked).toBe('')
        expect(r.unmasked).toBe('')
        expect(r.complete).toBe(false)
    })

    it('strips pre-existing literals (paste handling)', () => {
        const r = applyMask('12 34 56', '## ## ##')
        expect(r.masked).toBe('12 34 56')
        expect(r.unmasked).toBe('123456')
        expect(r.complete).toBe(true)
    })

    it('strips alien-but-known separators', () => {
        // We strip the literals declared in the pattern only.
        // Dots are NOT a literal in this pattern, but they are
        // not a digit either so they are dropped on the walk.
        const r = applyMask('06.12.34.56.78', '## ## ## ## ##')
        expect(r.masked).toBe('06 12 34 56 78')
        expect(r.unmasked).toBe('0612345678')
        expect(r.complete).toBe(true)
    })

    it('any-token (*) accepts anything', () => {
        const r = applyMask('a1!', '***')
        expect(r.masked).toBe('a1!')
        expect(r.unmasked).toBe('a1!')
        expect(r.complete).toBe(true)
    })
})

describe('applyMask — phone:fr', () => {
    it('formats progressively as user types', () => {
        expect(applyMask('0', '## ## ## ## ##').masked).toBe('0')
        // trailing literal emitted once previous slot is filled
        expect(applyMask('06', '## ## ## ## ##').masked).toBe('06 ')
        expect(applyMask('061', '## ## ## ## ##').masked).toBe('06 1')
        expect(applyMask('0612', '## ## ## ## ##').masked).toBe('06 12 ')
        expect(applyMask('06123', '## ## ## ## ##').masked).toBe('06 12 3')
        expect(applyMask('0612345678', '## ## ## ## ##').masked).toBe('06 12 34 56 78')
    })
})

describe('unmaskValue', () => {
    it('returns the unmasked portion only', () => {
        expect(unmaskValue('12 34 56', '## ## ##')).toBe('123456')
        expect(unmaskValue('(12) 345-6789', '(##) ###-####')).toBe('123456789')
    })
})

describe('applyMask — edge cases', () => {
    it('empty pattern returns value as-is, complete=false', () => {
        const r = applyMask('hello', '')
        expect(r.masked).toBe('hello')
        expect(r.unmasked).toBe('hello')
        expect(r.complete).toBe(false)
    })

    it('null-ish value is normalised to empty string', () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - simulate runtime input from external consumers
        const r = applyMask(null, '##')
        expect(r.masked).toBe('')
        expect(r.unmasked).toBe('')
        expect(r.complete).toBe(false)
    })

    it('letters are NOT accepted in a digit-only pattern', () => {
        const r = applyMask('abc12', '###')
        expect(r.masked).toBe('12')
        expect(r.unmasked).toBe('12')
        expect(r.complete).toBe(false)
    })
})
