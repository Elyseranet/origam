import { describe, expect, it } from 'vitest'

import { formatMeasuredOn } from '~/utils/build-stats.util'

describe('formatMeasuredOn', () => {
    it('rend la date de mesure dans la langue active', () => {
        expect(formatMeasuredOn('2026-11-26', 'en')).toBe('November 26, 2026')
        expect(formatMeasuredOn('2026-11-26', 'fr')).toBe('26 novembre 2026')
    })

    it('ne glisse pas d\'un jour selon le fuseau (lecture en UTC)', () => {
        expect(formatMeasuredOn('2026-01-01', 'en')).toBe('January 1, 2026')
    })
})
