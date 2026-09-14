// #395 / #426 — les 11 `<desc>` de la seconde moitie de la famille Chart
// etaient des PHRASES ANGLAISES EN DUR, avec leur accord code a la main :
//
//     const svgDesc = computed(() => {
//         const n = visibleTiles.value.length
//         return `Treemap chart with ${ n } ${ n === 1 ? 'tile' : 'tiles' }.`
//     })
//
// La PR #611 avait corrige les 39 autres chaines de ce lot et LAISSE ces 11,
// faute d'un mecanisme de pluriel. Ce mecanisme est livre (#610,
// `Intl.PluralRules` dans `resolvePlural`, locale.util.ts) : `t('k.desc', n)`
// cherche `desc_<categorie CLDR>` puis retombe sur `desc_other`.
//
// ─────────────────────────────────────────────────────────────────────────
// PIEGE QUI DECIDE DE LA METHODE — repris de chart-accessible-name-i18n :
// sous la locale `en`, une chaine anglaise EN DUR et sa traduction correcte
// sont identiques OCTET POUR OCTET. Un test qui n'exerce que `en` passe AVEC
// le defaut intact, et Histoire tourne sous `en` : Playwright ne peut donc
// pas trancher ce critere. Toute assertion ci-dessous monte sous `fr` ET
// sous `en`, et epingle la VALEUR ABSOLUE des deux cotes — jamais un simple
// « les deux different ».
// ─────────────────────────────────────────────────────────────────────────
//
// DEUX DEFAUTS DE GRAMMAIRE mesures au passage, que le classeur ne listait
// pas (il ne comptait que « chaine en dur ») : `OrigamChartRadar` et
// `OrigamChartStreamgraph` ecrivaient la forme PLURIELLE en dur, sans
// ternaire. Sortie reelle de la sonde AVANT correction :
//
//     [en] Radar n=1       :: "radar chart with 1 series and 1 axes."
//     [en] Streamgraph n=1 :: "Streamgraph with 1 series and 1 time points."
//
// ─────────────────────────────────────────────────────────────────────────
// POURQUOI PAS `count === 1 ? a : b`, ET POURQUOI PAS NON PLUS LE PATRON
// DE `cartesian.desc` :
//
// 1. Le DS est publie sur npm et traduit par des gens dont on ne connait pas
//    la langue. `n === 1 ? sing : plur` est la regle ANGLAISE. Le dernier
//    bloc de ce fichier mesure le contre-exemple le plus court : `fr` et
//    `en` ne s'accordent meme pas sur ZERO.
//
// 2. `cartesian.desc` (livre par #610, hors de ce lot) porte DEUX comptes
//    qui varient independamment — series et points — dans UNE seule cle
//    pluralisee sur `points`. Le `{series}` y suit donc la categorie du
//    MAUVAIS compte. Invisible en anglais, ou « series » est invariable ;
//    faux en francais des que les deux comptes divergent. Les 4 composants
//    de ce lot qui portent deux comptes (Polar, Radar, Sankey, Streamgraph)
//    composent donc des FRAGMENTS pluralises separement, chacun avec sa
//    propre categorie CLDR, assembles par une cle-coquille qui laisse
//    l'ordre des mots au traducteur. Cf. le bloc 4 ci-dessous, qui echoue
//    sur le patron plat et passe sur celui-ci.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'

import { createOrigam } from '@origam/origam'
import { useLocale } from '@origam/composables/Commons/locale.composable'

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

function mountWith (component: unknown, props: Record<string, unknown>, locale: string) {
    return mount(component as never, {
        props: props as never,
        global: {plugins: [createOrigam({locale: {locale}})]}
    })
}

function descOf (component: unknown, props: Record<string, unknown>, locale: string): string {
    const wrapper = mountWith(component, props, locale)
    const desc = wrapper.find('svg[role="img"] desc')

    expect(desc.exists()).toBe(true)
    const text = desc.text()

    wrapper.unmount()

    return text
}

/*********************************************************
 * Jeux de props REELS.
 *
 * ⛔ Les 5 composants Sankey / Sparkline / Sunburst / Treemap / WordCloud
 * ne prennent PAS `nodes` / `data` / `words` : comme tout le reste de la
 * famille ils lisent `series[0].data`. Les fixtures de
 * `chart-accessible-name-i18n.spec.ts` les nourrissent avec les mauvais
 * noms de prop — ces composants y rendent donc leur ETAT VIDE, ce qui ne
 * se voyait pas parce qu'un `aria-label` ne depend pas des donnees. Mesure
 * de la sonde avec les fixtures de ce fichier-la :
 *     [en] Treemap n=2 :: "Treemap chart with 0 tiles."
 * Les fixtures ci-dessous rendent bien 1 / 2 / 3 elements.
 ********************************************************/
const S3 = [{name: 'A', data: [1, 2, 3]}]
const S1 = [{name: 'A', data: [7]}]
const C3 = ['x', 'y', 'z']
const C1 = ['x']

interface ICase {
    name: string
    component: unknown
    props: Record<string, unknown>
    en: string
    fr: string
}

/*********************************************************
 * 1. SINGULIER — la categorie `one`.
 *
 * C'est ici que se lisent les deux defauts de grammaire :
 * Radar rendait « 1 axes » et Streamgraph « 1 time points ».
 ********************************************************/
const SINGULAR: Array<ICase> = [
    {
        name: 'OrigamChartPolar (pie)',
        component: OrigamChartPolar,
        props: {type: 'pie', series: S1, categories: C1},
        en: 'Pie chart with 1 series and 1 point.',
        fr: 'Graphique circulaire avec 1 série et 1 point.'
    },
    {
        name: 'OrigamChartPolarBar',
        component: OrigamChartPolarBar,
        props: {series: S1, categories: C1},
        en: 'Polar bar chart with 1 wedge.',
        fr: 'Graphique à barres polaires avec 1 secteur.'
    },
    {
        name: 'OrigamChartPyramid (funnel)',
        component: OrigamChartPyramid,
        props: {type: 'funnel', series: S1, categories: C1},
        en: 'Funnel chart with 1 slice.',
        fr: 'Graphique en entonnoir avec 1 tranche.'
    },
    {
        name: 'OrigamChartRadar',
        component: OrigamChartRadar,
        props: {series: S1, categories: C1},
        en: 'Radar chart with 1 series and 1 axis.',
        fr: 'Graphique radar avec 1 série et 1 axe.'
    },
    {
        name: 'OrigamChartSankey',
        component: OrigamChartSankey,
        props: {series: [{name: 'S', data: [{from: 'A', to: 'B', value: 5}]}]},
        en: 'Sankey diagram with 2 nodes and 1 link.',
        fr: 'Diagramme de Sankey avec 2 nœuds et 1 lien.'
    },
    {
        name: 'OrigamChartSparkline (bar)',
        component: OrigamChartSparkline,
        props: {type: 'bar', series: [{name: 'S', data: [4]}]},
        en: 'Bar sparkline with 1 data point.',
        fr: 'Sparkline à barres horizontales avec 1 point de données.'
    },
    {
        name: 'OrigamChartStreamgraph',
        component: OrigamChartStreamgraph,
        props: {series: S1, categories: C1},
        en: 'Streamgraph with 1 series and 1 time point.',
        fr: 'Graphique en flux avec 1 série et 1 point temporel.'
    },
    {
        name: 'OrigamChartSunburst',
        component: OrigamChartSunburst,
        props: {series: [{name: 'S', data: [{name: 'A', value: 3, children: [{name: 'B', value: 1}]}]}]},
        en: 'Sunburst chart with 1 root node.',
        fr: 'Graphique en rayons de soleil avec 1 nœud racine.'
    },
    {
        name: 'OrigamChartTreemap',
        component: OrigamChartTreemap,
        props: {series: [{name: 'S', data: [{name: 'A', value: 3}]}]},
        en: 'Treemap chart with 1 tile.',
        fr: 'Carte proportionnelle avec 1 tuile.'
    },
    {
        name: 'OrigamChartVariwide',
        component: OrigamChartVariwide,
        props: {series: S1, categories: C1},
        en: 'Variwide chart with 1 column.',
        fr: 'Graphique à largeur variable avec 1 colonne.'
    },
    {
        name: 'OrigamChartWordCloud',
        component: OrigamChartWordCloud,
        props: {series: [{name: 'S', data: [{text: 'a', value: 3}]}]},
        en: 'Word cloud chart with 1 word.',
        fr: 'Nuage de mots avec 1 mot.'
    }
]

/*********************************************************
 * 2. PLURIEL — la categorie `other`.
 ********************************************************/
const PLURAL: Array<ICase> = [
    {
        name: 'OrigamChartPolar (donut)',
        component: OrigamChartPolar,
        props: {type: 'donut', series: S3, categories: C3},
        en: 'Donut chart with 1 series and 3 points.',
        fr: 'Graphique en anneau avec 1 série et 3 points.'
    },
    {
        name: 'OrigamChartPolarBar',
        component: OrigamChartPolarBar,
        props: {series: S3, categories: C3},
        en: 'Polar bar chart with 3 wedges.',
        fr: 'Graphique à barres polaires avec 3 secteurs.'
    },
    {
        name: 'OrigamChartPyramid (pyramid)',
        component: OrigamChartPyramid,
        props: {type: 'pyramid', series: S3, categories: C3},
        en: 'Pyramid chart with 3 slices.',
        fr: 'Graphique en pyramide avec 3 tranches.'
    },
    {
        name: 'OrigamChartRadar',
        component: OrigamChartRadar,
        props: {series: S3, categories: C3},
        en: 'Radar chart with 1 series and 3 axes.',
        fr: 'Graphique radar avec 1 série et 3 axes.'
    },
    {
        name: 'OrigamChartSankey',
        component: OrigamChartSankey,
        props: {series: [{name: 'S', data: [{from: 'A', to: 'B', value: 5}, {from: 'B', to: 'C', value: 2}]}]},
        en: 'Sankey diagram with 3 nodes and 2 links.',
        fr: 'Diagramme de Sankey avec 3 nœuds et 2 liens.'
    },
    {
        name: 'OrigamChartSparkline (line)',
        component: OrigamChartSparkline,
        props: {type: 'line', series: [{name: 'S', data: [1, 2, 3]}]},
        en: 'Line sparkline with 3 data points.',
        fr: 'Courbe sparkline avec 3 points de données.'
    },
    {
        name: 'OrigamChartStreamgraph',
        component: OrigamChartStreamgraph,
        props: {series: S3, categories: C3},
        en: 'Streamgraph with 1 series and 3 time points.',
        fr: 'Graphique en flux avec 1 série et 3 points temporels.'
    },
    {
        name: 'OrigamChartSunburst',
        component: OrigamChartSunburst,
        props: {series: [{name: 'S', data: [{name: 'A', value: 3}, {name: 'B', value: 2}]}]},
        en: 'Sunburst chart with 2 root nodes.',
        fr: 'Graphique en rayons de soleil avec 2 nœuds racines.'
    },
    {
        name: 'OrigamChartTreemap',
        component: OrigamChartTreemap,
        props: {series: [{name: 'S', data: [{name: 'A', value: 3}, {name: 'B', value: 2}]}]},
        en: 'Treemap chart with 2 tiles.',
        fr: 'Carte proportionnelle avec 2 tuiles.'
    },
    {
        name: 'OrigamChartVariwide',
        component: OrigamChartVariwide,
        props: {series: S3, categories: C3},
        en: 'Variwide chart with 3 columns.',
        fr: 'Graphique à largeur variable avec 3 colonnes.'
    },
    {
        name: 'OrigamChartWordCloud',
        component: OrigamChartWordCloud,
        props: {series: [{name: 'S', data: [{text: 'a', value: 3}, {text: 'b', value: 1}]}]},
        en: 'Word cloud chart with 2 words.',
        fr: 'Nuage de mots avec 2 mots.'
    }
]

describe('OrigamChart* (seconde moitie) — <desc> traduit et accorde (#395/#426)', () => {
    /*********************************************************
     * 1. SINGULIER.
     ********************************************************/
    describe('categorie CLDR `one`', () => {
        it.each(SINGULAR)('$name : <desc> sous fr', ({component, props, fr}) => {
            expect(descOf(component, props, 'fr')).toBe(fr)
        })

        it.each(SINGULAR)('$name : <desc> sous en', ({component, props, en}) => {
            expect(descOf(component, props, 'en')).toBe(en)
        })
    })

    /*********************************************************
     * 2. PLURIEL.
     ********************************************************/
    describe('categorie CLDR `other`', () => {
        it.each(PLURAL)('$name : <desc> sous fr', ({component, props, fr}) => {
            expect(descOf(component, props, 'fr')).toBe(fr)
        })

        it.each(PLURAL)('$name : <desc> sous en', ({component, props, en}) => {
            expect(descOf(component, props, 'en')).toBe(en)
        })
    })

    /*********************************************************
     * 3. Le defaut lui-meme : `fr` ne doit PAS rendre l'anglais.
     *
     * Redondant avec le bloc 1 tant que les valeurs francaises
     * ci-dessus sont justes — mais c'est l'assertion qui NOMME
     * le defaut, et elle survivra a une retouche de traduction.
     ********************************************************/
    it.each([...SINGULAR, ...PLURAL])('$name : <desc> sous fr n\'est pas la chaine anglaise', ({component, props, en}) => {
        expect(descOf(component, props, 'fr')).not.toBe(en)
    })

    /*********************************************************
     * 4. LE CONTRE-EXEMPLE QUI INTERDIT `count === 1 ? a : b`.
     *
     * `Intl.PluralRules('fr').select(0)` rend `one`, la meme
     * categorie que pour 1 ; `('en').select(0)` rend `other`.
     * Les deux langues ne s'accordent donc pas sur ZERO, et
     * aucun ternaire ecrit dans le composant ne peut rendre les
     * deux justes en meme temps.
     *
     * On interroge la couche i18n directement : les composants
     * concernes rendent leur etat vide a 0 element, le <desc>
     * n'est donc pas le bon instrument pour cette mesure.
     ********************************************************/
    describe('zero — `fr` et `en` ne tombent pas dans la meme categorie CLDR', () => {
        function translate (key: string, count: number, locale: string): string {
            let out = ''

            const Probe = defineComponent({
                setup () {
                    const {t} = useLocale()

                    return () => {
                        out = t(key, count, {chart: 'X'})

                        return h('span', out)
                    }
                }
            })

            const wrapper = mount(Probe, {global: {plugins: [createOrigam({locale: {locale}})]}})

            wrapper.unmount()

            return out
        }

        it('la categorie CLDR de 0 differe entre fr et en', () => {
            expect(new Intl.PluralRules('fr').select(0)).toBe('one')
            expect(new Intl.PluralRules('en').select(0)).toBe('other')
        })

        it('Treemap : « 0 tuile » en fr, « 0 tiles » en en', () => {
            expect(translate('origam.chart.treemap.desc', 0, 'fr')).toBe('X avec 0 tuile.')
            expect(translate('origam.chart.treemap.desc', 0, 'en')).toBe('X with 0 tiles.')
        })

        it('WordCloud : « 0 mot » en fr, « 0 words » en en', () => {
            expect(translate('origam.chart.word_cloud.desc', 0, 'fr')).toBe('X avec 0 mot.')
            expect(translate('origam.chart.word_cloud.desc', 0, 'en')).toBe('X with 0 words.')
        })

        /*********************************************************
         * Le repli sur `_other` — la piece qui rend le mecanisme
         * extensible : une locale qui ne livre que `one`/`other`
         * repond quand meme a une categorie qu'elle ne connait pas.
         ********************************************************/
        it('une categorie absente retombe sur `_other`, pas sur la cle brute', () => {
            const few = translate('origam.chart.treemap.desc', 3, 'ru')

            expect(few).not.toBe('origam.chart.treemap.desc')
            expect(few).toContain('3')
        })
    })
})
