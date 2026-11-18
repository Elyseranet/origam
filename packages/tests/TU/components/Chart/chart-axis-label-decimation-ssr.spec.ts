// #1325 — decimation des etiquettes X : en SSR (aucune mesure possible) la
// largeur est ESTIMEE ; le rendu ne doit ni lever ni avertir, et decimer selon
// l'estimation (14 caracteres * 8 px > pas de 20 px => une etiquette sur 2).

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'

import OrigamChartAxis from '@origam/components/Chart/OrigamChartAxis.vue'

const PLOT = {x0: 52, y0: 24, x1: 576, y1: 320, cx: 314, cy: 172}
const LABELS = ['Janvier 2025!', 'Fevrier 2025!', 'Mars 2025!!!!', 'Avril 2025!!!']

const TICKS = {
    x: LABELS.map((value, i) => ({position: 52 + i * 20, label: value, value})),
    y: [{position: 320, label: '0', value: 0}]
}

describe('OrigamChartAxis — decimation X en SSR', () => {
    afterEach(() => vi.restoreAllMocks())

    it('rend sans warning, estimation seule : une etiquette sur N masquee', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const error = vi.spyOn(console, 'error').mockImplementation(() => {})

        const html = await renderToString(createSSRApp({render: () => h(OrigamChartAxis, {plot: PLOT, ticks: TICKS})}))

        expect(warn).not.toHaveBeenCalled()
        expect(error).not.toHaveBeenCalled()
        const xLabels = html.match(/<text[^>]*origam-chart__axis-label--x[^>]*>/g) ?? []
        expect(xLabels).toHaveLength(LABELS.length)
        expect(xLabels.filter((t) => t.includes('visibility="hidden"')).length).toBeGreaterThan(0)
        expect(xLabels[0]).not.toContain('visibility="hidden"')
    })
})
