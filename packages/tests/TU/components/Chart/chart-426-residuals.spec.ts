// #426 — les quatre points restants du ticket, mesures plutot que supposes.
//
// Le ticket listait encore, apres le gros du traitement :
//
//   1. `role="figure"` sur un `div` dans 20 cas sur 21
//   2. `ChartStreamgraph` — activation clavier cassee
//   3. `ChartPictorial` — `iconsPerUnit` sans effet au-dela de MAX_SLOTS
//   4. `ChartPyramid` — `margin` / `padding` tokenises morts
//
// Deux d'entre eux (1 et 4) etaient DEJA corriges par des commits
// anterieurs. Ce spec les verrouille quand meme : un defaut repare sans test
// revient, et le ticket ne pouvait pas etre ferme sur un « c'est
// probablement regle ».

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamChartPictorial from '@origam/components/Chart/OrigamChartPictorial.vue'
import OrigamChartPyramid from '@origam/components/Chart/OrigamChartPyramid.vue'
import OrigamChartStreamgraph from '@origam/components/Chart/OrigamChartStreamgraph.vue'
import { createOrigam } from '@origam/origam'

const CATEGORIES = [ 'jan', 'fev', 'mar' ]
const SERIES = [
    { name: 'A', data: [ 3, 5, 2 ] },
    { name: 'B', data: [ 1, 4, 6 ] }
]

const mountChart = (component: unknown, props: Record<string, unknown> = {}) => mount(component as never, {
    props: { series: SERIES, categories: CATEGORIES, ...props } as never,
    global: { plugins: [ createOrigam() ] }
})

describe('#426 — 2. ChartStreamgraph, activation clavier', () => {
    it('⛔ Enter sur un ruban emet point-click', async () => {
        const wrapper = mountChart(OrigamChartStreamgraph)
        const ribbon = wrapper.find('[data-cy="origam-chart-streamgraph-ribbon-0"]')

        expect(ribbon.exists()).toBe(true)
        await ribbon.trigger('keydown.enter')

        // Avant le correctif : `onRibbonActivate` passait par `hoveredPoint`,
        // qui exige `hoveredXIndex` — un ref que SEUL le mousemove renseigne.
        // Au clavier il valait `null`, donc rien ne partait.
        expect(wrapper.emitted('point-click')).toHaveLength(1)
    })

    it('Espace emet aussi', async () => {
        const wrapper = mountChart(OrigamChartStreamgraph)

        await wrapper.find('[data-cy="origam-chart-streamgraph-ribbon-0"]').trigger('keydown.space')

        expect(wrapper.emitted('point-click')).toHaveLength(1)
    })

    it('le point emis porte la bonne serie et une abscisse resolue', async () => {
        const wrapper = mountChart(OrigamChartStreamgraph)

        await wrapper.find('[data-cy="origam-chart-streamgraph-ribbon-1"]').trigger('keydown.enter')

        const [ point ] = wrapper.emitted('point-click')![0] as [ Record<string, unknown> ]

        expect(point.seriesIndex).toBe(1)
        expect(point.seriesName).toBe('B')
        // Sans survol, l'indice retombe sur 0 — la premiere valeur, celle que
        // `ribbonAriaLabel` annonce en tete puisqu'il enumere toute la serie.
        expect(point.dataIndex).toBe(0)
        expect(point.x).toBe('jan')
        expect(point.y).toBe(1)
    })

    it('le ruban est bien focusable et annonce comme actionnable', () => {
        const wrapper = mountChart(OrigamChartStreamgraph)
        const ribbon = wrapper.find('[data-cy="origam-chart-streamgraph-ribbon-0"]')

        expect(ribbon.attributes('tabindex')).toBe('0')
        expect(ribbon.attributes('role')).toBe('button')
    })
})

describe('#426 — 3. ChartPictorial, le plafond d\'iconsPerUnit s\'annonce', () => {
    let warn: ReturnType<typeof vi.spyOn>

    beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
    afterEach(() => { warn.mockRestore() })

    const warned = () => warn.mock.calls.some((args) => args.join(' ').includes('iconsPerUnit'))

    it('sous le plafond : aucun avertissement', () => {
        // max = 6, iconsPerUnit = 1 -> 6 slots, sous MAX_SLOTS (8).
        mountChart(OrigamChartPictorial, { iconsPerUnit: 1 })

        expect(warned()).toBe(false)
    })

    it('⛔ au-dessus du plafond : le composant annonce qu\'il recalcule son pas', () => {
        // max = 40, iconsPerUnit = 1 -> 40 slots demandes, bien au-dela de 8.
        mountChart(OrigamChartPictorial, {
            series: [ { name: 'A', data: [ 40 ] } ],
            categories: [ 'x' ],
            iconsPerUnit: 1
        })

        expect(warned()).toBe(true)
    })
})

describe('#426 — 4. ChartPyramid, margin/padding tokenises', () => {
    it('margin tokenise emet bien sa classe utilitaire', () => {
        const wrapper = mountChart(OrigamChartPyramid, { margin: '4' })

        expect(wrapper.classes().some((c) => c.startsWith('origam--m-'))).toBe(true)
    })

    it('padding tokenise emet bien sa classe utilitaire', () => {
        const wrapper = mountChart(OrigamChartPyramid, { padding: '4' })

        expect(wrapper.classes().some((c) => c.startsWith('origam--p-'))).toBe(true)
    })
})

describe('#426 — 1. plus aucun role="figure" pose sur un div', () => {
    it('les racines Chart sont des <figure> natifs', () => {
        for (const component of [ OrigamChartStreamgraph, OrigamChartPyramid, OrigamChartPictorial ]) {
            const wrapper = mountChart(component)

            // ⛔ Le CLAUDE.md est explicite : « role="button" sur un <div> est
            // une dette, pas une solution ». La regle vaut pour figure.
            expect(wrapper.element.tagName.toLowerCase()).toBe('figure')
            expect(wrapper.attributes('role')).toBeUndefined()
        }
    })
})
