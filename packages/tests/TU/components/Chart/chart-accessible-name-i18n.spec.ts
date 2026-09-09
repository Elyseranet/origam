// #395 / #567 — le NOM ACCESSIBLE de la seconde moitie de la famille Chart
// (OrigamChartPolar -> OrigamChartWordCloud) etait code en dur en anglais.
//
// Le motif n'est pas celui qu'on cherchait en #395 (« No data to display »,
// litteral nu, deja corrige). Il est place DERRIERE un operateur :
//
//     const ariaLabel    = computed(() => props.title ?? 'Radar chart')
//     const svgAriaLabel = computed(() => props.title ?? 'radar chart')
//     const svgTitle     = computed(() => props.title ?? 'radar chart')
//
// C'est exactement l'angle mort du detecteur C8 documente dans #567 : la
// chaine n'est atteignable que si `title` est absent, donc elle ne saute
// pas aux yeux d'une analyse statique qui cherche des litteraux en position
// directe. Elle est pourtant le nom que le lecteur d'ecran annonce pour le
// graphique entier des que le consommateur ne passe pas de `title`.
//
// PIEGE, repris de chart-i18n-empty-state.spec.ts : sous la locale `en` par
// defaut, le littéral anglais et sa traduction correcte sont identiques
// octet pour octet — un test qui n'exerce que `en` passe AVEC le defaut
// present. Toute assertion ci-dessous monte donc sous `fr` et lit le DOM
// rendu, jamais la source du template.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import { createOrigam } from '@origam/origam'

import OrigamChartPolar from '@origam/components/Chart/OrigamChartPolar.vue'
import OrigamChartPolarBar from '@origam/components/Chart/OrigamChartPolarBar.vue'
import OrigamChartPyramid from '@origam/components/Chart/OrigamChartPyramid.vue'
import OrigamChartRadar from '@origam/components/Chart/OrigamChartRadar.vue'
import OrigamChartSankey from '@origam/components/Chart/OrigamChartSankey.vue'
import OrigamChartSparkline from '@origam/components/Chart/OrigamChartSparkline.vue'
import OrigamChartStreamgraph from '@origam/components/Chart/OrigamChartStreamgraph.vue'
import OrigamChartSunburst from '@origam/components/Chart/OrigamChartSunburst.vue'
import OrigamChartTreemap from '@origam/components/Chart/OrigamChartTreemap.vue'
import OrigamChartVariwide from '@origam/components/Chart/OrigamChartVariwide.vue'
import OrigamChartWordCloud from '@origam/components/Chart/OrigamChartWordCloud.vue'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false, media: query, onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()
    }))
})

class ObserverMock {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn(() => [])
}
vi.stubGlobal('ResizeObserver', ObserverMock)
vi.stubGlobal('IntersectionObserver', ObserverMock)

afterEach(() => {
    document.body.innerHTML = ''
})

function mountWith (component: unknown, props: Record<string, unknown>, locale?: string) {
    return mount(component as never, {
        props: props as never,
        global: {plugins: [createOrigam(locale ? {locale: {locale}} : undefined)]}
    })
}

const SERIES = [{name: 'A', data: [1, 2, 3]}]
const CATEGORIES = ['x', 'y', 'z']

/*********************************************************
 * Le jeu de props minimal qui fait rendre le SVG (et non
 * l'etat vide) pour chacun des 11 composants portant le motif.
 * `title` est deliberement ABSENT partout : c'est la branche
 * `?? '<x> chart'` qu'on veut atteindre.
 ********************************************************/
// `frRoot` n'est renseigne que pour OrigamChartPolar : sa racine lit deja la
// cle GENERIQUE `origam.chart.aria_label` (« Graphique »), valeur epinglee
// par chart-i18n-empty-state.spec.ts:196. Ses deux defauts reels sont le
// `svgAriaLabel` et le `svgTitle`. Rendre sa racine specifique elle aussi
// est defendable pour la coherence de la famille, mais casserait ce test
// existant : arbitrage remonte au PM plutot que tranche ici.
const CASES: Array<{
    name: string
    component: unknown
    props: Record<string, unknown>
    fr: string
    frRoot?: string
}> = [
    {
        name: 'OrigamChartPolar (pie)',
        component: OrigamChartPolar,
        props: {type: 'pie', series: SERIES, categories: CATEGORIES},
        fr: 'Graphique circulaire',
        frRoot: 'Graphique'
    },
    {
        name: 'OrigamChartPolar (donut)',
        component: OrigamChartPolar,
        props: {type: 'donut', series: SERIES, categories: CATEGORIES},
        fr: 'Graphique en anneau',
        frRoot: 'Graphique'
    },
    {
        name: 'OrigamChartPolarBar',
        component: OrigamChartPolarBar,
        props: {series: SERIES, categories: CATEGORIES},
        fr: 'Graphique à barres polaires'
    },
    {
        name: 'OrigamChartPyramid (pyramid)',
        component: OrigamChartPyramid,
        props: {type: 'pyramid', series: SERIES, categories: CATEGORIES},
        fr: 'Graphique en pyramide'
    },
    {
        name: 'OrigamChartPyramid (funnel)',
        component: OrigamChartPyramid,
        props: {type: 'funnel', series: SERIES, categories: CATEGORIES},
        fr: 'Graphique en entonnoir'
    },
    {
        name: 'OrigamChartRadar',
        component: OrigamChartRadar,
        props: {series: SERIES, categories: CATEGORIES},
        fr: 'Graphique radar'
    },
    {
        name: 'OrigamChartSankey',
        component: OrigamChartSankey,
        props: {nodes: [{name: 'A'}, {name: 'B'}], links: [{from: 'A', to: 'B', value: 5}]},
        fr: 'Diagramme de Sankey'
    },
    {
        name: 'OrigamChartSparkline (line)',
        component: OrigamChartSparkline,
        props: {type: 'line', data: [1, 2, 3]},
        fr: 'Courbe sparkline'
    },
    {
        name: 'OrigamChartSparkline (bar)',
        component: OrigamChartSparkline,
        props: {type: 'bar', data: [1, 2, 3]},
        fr: 'Sparkline à barres horizontales'
    },
    {
        name: 'OrigamChartStreamgraph',
        component: OrigamChartStreamgraph,
        props: {series: SERIES, categories: CATEGORIES},
        fr: 'Graphique en flux'
    },
    {
        name: 'OrigamChartSunburst',
        component: OrigamChartSunburst,
        props: {data: [{name: 'A', value: 3, children: [{name: 'B', value: 1}]}]},
        fr: 'Graphique en rayons de soleil'
    },
    {
        name: 'OrigamChartTreemap',
        component: OrigamChartTreemap,
        props: {data: [{name: 'A', value: 3}, {name: 'B', value: 2}]},
        fr: 'Carte proportionnelle'
    },
    {
        name: 'OrigamChartVariwide',
        component: OrigamChartVariwide,
        props: {series: SERIES, categories: CATEGORIES},
        fr: 'Graphique à largeur variable'
    },
    {
        name: 'OrigamChartWordCloud',
        component: OrigamChartWordCloud,
        props: {words: [{text: 'a', value: 3}, {text: 'b', value: 1}]},
        fr: 'Nuage de mots'
    }
]

/*********************************************************
 * 1. Le nom accessible de la RACINE suit la locale.
 ********************************************************/
describe('OrigamChart* (seconde moitie) — le nom accessible suit la locale (#567)', () => {
    it.each(CASES)('$name : aria-label de la racine traduit sous fr', ({component, props, fr, frRoot}) => {
        const wrapper = mountWith(component, props, 'fr')
        const root = wrapper.find('figure')

        expect(root.exists()).toBe(true)
        expect(root.attributes('aria-label')).toBe(frRoot ?? fr)

        wrapper.unmount()
    })

    it.each(CASES)('$name : aria-label du <svg role=img> traduit sous fr', ({component, props, fr}) => {
        const wrapper = mountWith(component, props, 'fr')
        const svg = wrapper.find('svg[role="img"]')

        expect(svg.exists()).toBe(true)
        expect(svg.attributes('aria-label')).toBe(fr)

        wrapper.unmount()
    })

    it.each(CASES)('$name : <title> du SVG traduit sous fr', ({component, props, fr}) => {
        const wrapper = mountWith(component, props, 'fr')
        const title = wrapper.find('svg[role="img"] title')

        expect(title.exists()).toBe(true)
        expect(title.text()).toBe(fr)

        wrapper.unmount()
    })

    /*********************************************************
     * 2. `title` fourni par le consommateur reste prioritaire —
     *    la traduction ne doit pas ecraser la valeur explicite.
     ********************************************************/
    it.each(CASES)('$name : un title explicite garde la priorite sur la traduction', ({component, props, fr}) => {
        const wrapper = mountWith(component, {...props, title: 'Ventes 2026'}, 'fr')
        const root = wrapper.find('figure')

        expect(root.attributes('aria-label')).toBe('Ventes 2026')
        expect(root.attributes('aria-label')).not.toBe(fr)

        wrapper.unmount()
    })

    /*********************************************************
     * 3. Sous `en`, la valeur reste l'anglais attendu — la
     *    correction ne doit rien casser pour l'existant.
     ********************************************************/
    it('sous en, Radar annonce toujours un nom anglais non vide', () => {
        const wrapper = mountWith(OrigamChartRadar, {series: SERIES, categories: CATEGORIES})
        const root = wrapper.find('figure')

        expect(root.attributes('aria-label')).toBe('Radar chart')

        wrapper.unmount()
    })
})

/*********************************************************
 * 3 bis. Les libelles PAR ELEMENT qui portaient un mot de
 *        liaison anglais en dur (« to », « value », « width »).
 *        Ceux-la ne portent pas d'accord, ils ne dependent donc
 *        pas du mecanisme de pluriel en cours de livraison.
 ********************************************************/
describe('OrigamChart* (seconde moitie) — libelles par element traduits (#567)', () => {
    it('OrigamChartSankey : le lien n\'annonce plus « to » en dur', () => {
        const wrapper = mountWith(OrigamChartSankey, {
            series: [{name: 'flows', data: [{from: 'A', to: 'B', value: 5}]}]
        }, 'fr')

        const link = wrapper.find('[data-cy^="origam-chart-sankey-link-"]')

        expect(link.exists()).toBe(true)
        expect(link.attributes('aria-label')).toContain(' vers ')
        expect(link.attributes('aria-label')).not.toContain(' to ')

        wrapper.unmount()
    })

    it('OrigamChartPolarBar : le libelle de repli n\'est plus « Item N » en dur', () => {
        const wrapper = mountWith(OrigamChartPolarBar, {
            series: [{name: 'A', data: [1, 2]}]
        }, 'fr')

        const html = wrapper.html()

        expect(html).toContain('Élément 1')
        expect(html).not.toContain('Item 1')

        wrapper.unmount()
    })

    it('OrigamChartPyramid : le libelle de repli n\'est plus « Slice N » en dur', () => {
        const wrapper = mountWith(OrigamChartPyramid, {
            series: [{name: 'A', data: [3, 2]}]
        }, 'fr')

        const html = wrapper.html()

        expect(html).toContain('Tranche 1')
        expect(html).not.toContain('Slice 1')

        wrapper.unmount()
    })

    it('OrigamChartVariwide : la colonne n\'annonce plus « value » / « width » en dur', () => {
        const wrapper = mountWith(OrigamChartVariwide, {
            series: SERIES,
            categories: CATEGORIES
        }, 'fr')

        const col = wrapper.find('[data-cy^="origam-chart-variwide-bar-"]')

        expect(col.exists()).toBe(true)
        expect(col.attributes('aria-label')).toContain('valeur')
        expect(col.attributes('aria-label')).toContain('largeur')
        expect(col.attributes('aria-label')).not.toContain('value')
        expect(col.attributes('aria-label')).not.toContain('width')

        wrapper.unmount()
    })
})

/*********************************************************
 * 4. Filet statique — aucun nom accessible en dur ne
 *    reapparait derriere un operateur dans ma moitie.
 *    C'est CE filet qui aurait attrape le defaut d'origine.
 ********************************************************/
describe('OrigamChart* (seconde moitie) — aucun nom accessible en dur derriere un operateur', () => {
    it.each([
        'OrigamChartPolar', 'OrigamChartPolarBar', 'OrigamChartPyramid',
        'OrigamChartRadar', 'OrigamChartSankey', 'OrigamChartSparkline',
        'OrigamChartStreamgraph', 'OrigamChartSunburst', 'OrigamChartTreemap',
        'OrigamChartVariwide', 'OrigamChartWordCloud'
    ])('%s : pas de `props.title ?? <litteral>`', async (name) => {
        const {readFileSync} = await import('node:fs')
        const path = await import('node:path')
        const file = path.resolve(
            __dirname, '../../../../ds/src/components/Chart', `${ name }.vue`
        )
        const src = readFileSync(file, 'utf-8')

        // Tout `?? '...'` ou `?? \`...\`` sur la ligne d'un des trois
        // computeds de nom accessible est un litteral non traduisible.
        const offenders = src
            .split('\n')
            .map((line, i) => ({line, no: i + 1}))
            .filter(({line}) => /const (ariaLabel|svgAriaLabel|svgTitle) =/.test(line))
            .filter(({line}) => /\?\?\s*['`]/.test(line))
            .map(({line, no}) => `${ name }.vue:${ no } ${ line.trim() }`)

        expect(offenders).toEqual([])
    })
})
