import { describe, expect, it } from 'vitest'

import { trimBlankLines } from '@origam/utils/Code/trim-blank-lines.util'

describe('trimBlankLines (#1388)', () => {
    it('drops leading and trailing line feeds only', () => {
        expect(trimBlankLines('\n\nconst a = 1\n\nconst b = 2\n\n')).toBe('const a = 1\n\nconst b = 2')
    })

    it('keeps surrounding spaces, like the regex it replaces', () => {
        expect(trimBlankLines('\n  x  \n')).toBe('  x  ')
    })

    it('returns an empty string for line feeds only or an empty input', () => {
        expect(trimBlankLines('\n\n\n')).toBe('')
        expect(trimBlankLines('')).toBe('')
    })

    it('stays linear on many inner line feeds (the S5852 input)', () => {
        const input = 'a' + '\n'.repeat(200_000) + 'b'
        const t0 = performance.now()
        expect(trimBlankLines(input)).toBe(input)
        expect(performance.now() - t0).toBeLessThan(200)
    })
})
