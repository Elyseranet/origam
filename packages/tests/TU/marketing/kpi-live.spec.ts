import { describe, expect, it } from 'vitest'
import { LIVE_KPIS } from '../../../marketing/src/consts/kpis.const'
import { resolveLiveKpis } from '../../../marketing/src/utils/kpi.util'

const sources = (s: number | null, d: number | null) => resolveLiveKpis(LIVE_KPIS, s, d).map(k => k.source)

describe('resolveLiveKpis (#1210)', () => {
    it('stars > 0 et downloads : les deux sont rendus', () => {
        expect(sources(5, 796)).toEqual(['downloads', 'stars'])
    })
    it('stars à 0 : masqué, downloads conservé', () => {
        expect(sources(0, 796)).toEqual(['downloads'])
    })
    it('stars null : masqué', () => {
        expect(sources(null, 796)).toEqual(['downloads'])
    })
    it('downloads null : masqué ; downloads à 0 : affiché (valeur réelle)', () => {
        expect(sources(5, null)).toEqual(['stars'])
        expect(sources(null, 0)).toEqual(['downloads'])
    })
})
