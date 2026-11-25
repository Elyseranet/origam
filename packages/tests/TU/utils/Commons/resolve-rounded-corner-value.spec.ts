import { describe, expect, it } from 'vitest'

import { resolveRoundedCornerValue } from '../../../../ds/src/utils/Commons/spacing.util'

// #1022 — an unrecognised per-corner radius must pass verbatim, like
// `resolveSpacingValue`, instead of being dropped without a signal.
describe('resolveRoundedCornerValue (#1022)', () => {
    it.each([
        ['0', '0'],
        ['10px 4px', '10px 4px'],
        ['50% / 20%', '50% / 20%'],
        ['fit-content', 'fit-content'],
        ['  8px ', '8px']
    ])('passes %j verbatim', (input, out) => {
        expect(resolveRoundedCornerValue(input)).toBe(out)
    })

    it.each([
        ['md', 'var(--origam-radius---md, 8px)'],
        ['8px', '8px'],
        ['1.5rem', '1.5rem'],
        ['50%', '50%'],
        ['var(--x, 8px)', 'var(--x, 8px)'],
        ['calc(1rem + 2px)', 'calc(1rem + 2px)']
    ])('keeps %j unchanged', (input, out) => {
        expect(resolveRoundedCornerValue(input)).toBe(out)
    })

    it('numbers become px; true/false/empty/nullish/shaped emit nothing', () => {
        expect(resolveRoundedCornerValue(8)).toBe('8px')
        expect(resolveRoundedCornerValue(0)).toBe('0px')
        for (const v of [true, false, '', '  ', null, undefined, 'shaped', 'shaped-invert']) {
            expect(resolveRoundedCornerValue(v)).toBeNull()
        }
    })
})
