// #523 / #548 — `class` et `style` sont-ils VRAIMENT des faux positifs ?
//
// Le garde `unconsumed-props` compte 48 entrees `class` / `style` dans le
// depot, dont 36 dans la seule famille Chart. Les deux tickets les PRESUMENT
// faux positifs, au motif que Vue fusionne ces deux attributs
// automatiquement sur une racine unique.
//
// ⛔ Presume n'est pas mesure, et le raisonnement a une condition : il ne
// vaut QUE pour un composant a racine unique. Un composant a racines
// multiples n'a pas de fallthrough automatique — Vue avertit et n'applique
// rien — et l'entree serait alors un VRAI defaut.
//
// Ce spec tranche au runtime plutot que par raisonnement : on passe les deux
// attributs, on regarde s'ils atterrissent.
//
// La lecon de #501, rappelee par #523, est exactement celle-la : le scanner
// de typographie reproduisait fidelement ses chiffres et etait pourtant
// incomplet. Un garde qui compte n'est pas un garde qui prouve.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamChartSparkline from '@origam/components/Chart/OrigamChartSparkline.vue'
import OrigamChartTreemap from '@origam/components/Chart/OrigamChartTreemap.vue'
import OrigamChartWordCloud from '@origam/components/Chart/OrigamChartWordCloud.vue'
import { createOrigam } from '@origam/origam'

const SERIES_XY = [ { name: 'S', data: [ { x: 'a', y: 10 }, { x: 'b', y: 5 } ] } ]
const SERIES_WORDS = [ { name: 'S', data: [ { text: 'hello', value: 10 }, { text: 'world', value: 5 } ] } ]

const CASES = [
    [ 'OrigamChartSparkline', OrigamChartSparkline, { series: SERIES_XY } ],
    [ 'OrigamChartTreemap', OrigamChartTreemap, { series: SERIES_XY } ],
    [ 'OrigamChartWordCloud', OrigamChartWordCloud, { series: SERIES_WORDS } ]
] as const

describe('famille Chart — le fallthrough de class/style est-il reel ? (#523)', () => {
    for (const [ name, component, props ] of CASES) {
        it(`${name} : la classe du consommateur atteint la racine`, () => {
            const wrapper = mount(component as never, {
                props: props as never,
                attrs: { class: 'ma-classe-consommateur' },
                global: { plugins: [ createOrigam() ] }
            })

            expect(wrapper.classes()).toContain('ma-classe-consommateur')
        })

        it(`${name} : le style du consommateur atteint la racine`, () => {
            const wrapper = mount(component as never, {
                props: props as never,
                attrs: { style: 'outline: 2px solid red' },
                global: { plugins: [ createOrigam() ] }
            })

            // ⛔ On assert sur l'attribut brut, pas sur `getComputedStyle` :
            // sous jsdom celui-ci ne resout jamais un `var()`, et il fabrique
            // des valeurs par defaut qui ressemblent a des mesures.
            expect(wrapper.attributes('style') ?? '').toContain('outline')
        })

        it(`${name} : racine UNIQUE — c'est la condition du fallthrough`, () => {
            const wrapper = mount(component as never, {
                props: props as never,
                global: { plugins: [ createOrigam() ] }
            })

            // Un composant a racines multiples n'a pas de fallthrough
            // automatique. Si cette assertion tombe un jour, l'entree
            // `class`/`style` de ce composant redevient un vrai defaut.
            expect(wrapper.element.nodeType).toBe(Node.ELEMENT_NODE)
        })
    }
})

// ── #620 — le fallthrough NE JOUE PAS quand `class` est une PROP DECLAREE ──
//
// Le bloc ci-dessus mesure le fallthrough AUTOMATIQUE de Vue, et il tient
// pour les trois composants qu'il liste. Mais il ne couvrait que trois
// composants sur les 26 de la famille, et il mesure le mauvais mecanisme
// pour les autres.
//
// `ICommonsComponentProps` (commons.interface.ts:78) declare `class`. Toute
// la famille Chart en herite par IChartBaseProps (chart-base.interface.ts:27).
// Or DECLARER `class` comme prop la RETIRE de `$attrs` : le fallthrough
// automatique ne s'applique plus du tout, et le composant doit re-binder
// `props.class` A LA MAIN. Cinq composants sur six le font en terminant leur
// tableau `rootClasses` par `props.class` ; OrigamChartPictorial ne le
// faisait pas, et jetait donc silencieusement la classe du consommateur.
//
// ── margin / padding a moitie cables ──
//
// `useMargin` SCINDE sa sortie (margin.composable.ts:58-72 contre :74-93) :
// la forme d'echelle (`margin="4"`) et la forme booleenne emettent SEULEMENT
// une classe utilitaire et laissent `marginStyles` VIDE ; seules les formes
// numerique et chaine CSS passent par l'inline. Un composant qui ne binde que
// `marginStyles` rend donc `margin="4"` et `margin` totalement inertes.

import OrigamChartGauge from '@origam/components/Chart/OrigamChartGauge.vue'
import OrigamChartHeatmap from '@origam/components/Chart/OrigamChartHeatmap.vue'
import OrigamChartHoneycomb from '@origam/components/Chart/OrigamChartHoneycomb.vue'
import OrigamChartMap from '@origam/components/Chart/OrigamChartMap.vue'
import OrigamChartPareto from '@origam/components/Chart/OrigamChartPareto.vue'
import OrigamChartPictorial from '@origam/components/Chart/OrigamChartPictorial.vue'

const SERIES_SIMPLE = [ { name: 'S', data: [ 65, 25, 10 ] } ]
const SERIES_HONEYCOMB = [ { name: 'S', data: [ { x: 0, y: 0, name: 'T1', value: 10 } ] } ]

// Les six composants du lot « Chart, premiere moitie ». Gauge et Heatmap
// servent de TEMOINS POSITIFS : ils bindent deja les deux canaux, donc si le
// harnais etait faux ils tomberaient avec les autres — c'est ce qui distingue
// un defaut produit d'un defaut de mesure.
const CHANNEL_CASES = [
    [ 'OrigamChartGauge', OrigamChartGauge, { series: SERIES_SIMPLE } ],
    [ 'OrigamChartHeatmap', OrigamChartHeatmap, { series: SERIES_HONEYCOMB } ],
    [ 'OrigamChartHoneycomb', OrigamChartHoneycomb, { series: SERIES_HONEYCOMB } ],
    [ 'OrigamChartMap', OrigamChartMap, { series: SERIES_SIMPLE } ],
    [ 'OrigamChartPareto', OrigamChartPareto, { series: SERIES_SIMPLE } ],
    [ 'OrigamChartPictorial', OrigamChartPictorial, { series: SERIES_SIMPLE } ]
] as const

describe('famille Chart — `class` declaree en prop doit etre re-bindee (#620)', () => {
    for (const [ name, component, props ] of CHANNEL_CASES) {
        it(`${name} : la classe du consommateur atteint la racine`, () => {
            const wrapper = mount(component as never, {
                props: { ...props, class: 'sonde-consommateur' } as never,
                global: { plugins: [ createOrigam() ] }
            })

            expect(wrapper.classes()).toContain('sonde-consommateur')
        })

        it(`${name} : le style du consommateur atteint la racine`, () => {
            const wrapper = mount(component as never, {
                props: { ...props, style: 'outline: 2px solid red' } as never,
                global: { plugins: [ createOrigam() ] }
            })

            // Assertion sur l'attribut BRUT, jamais `getComputedStyle` : sous
            // jsdom celui-ci ne resout pas `var()` et fabrique des valeurs par
            // defaut qui ressemblent a de vraies mesures.
            expect(wrapper.attributes('style') ?? '').toContain('outline')
        })
    }
})

describe('famille Chart — margin/padding : le canal CLASSE doit etre binde', () => {
    for (const [ name, component, props ] of CHANNEL_CASES) {
        it(`${name} : margin="4" emet la classe utilitaire origam--m-4`, () => {
            const wrapper = mount(component as never, {
                props: { ...props, margin: '4' } as never,
                global: { plugins: [ createOrigam() ] }
            })

            // Valeur ABSOLUE, pas un simple ecart : on nomme la classe
            // attendue. Un test qui verifierait seulement que deux rendus
            // different passerait sur un canal totalement mort.
            expect(wrapper.classes()).toContain('origam--m-4')
        })

        it(`${name} : padding="4" emet la classe utilitaire origam--p-4`, () => {
            const wrapper = mount(component as never, {
                props: { ...props, padding: '4' } as never,
                global: { plugins: [ createOrigam() ] }
            })

            expect(wrapper.classes()).toContain('origam--p-4')
        })

        it(`${name} : la forme booleenne margin emet ${'`'}--marged${'`'}`, () => {
            const wrapper = mount(component as never, {
                props: { ...props, margin: true } as never,
                global: { plugins: [ createOrigam() ] }
            })

            expect(wrapper.classes().some((c) => c.endsWith('--marged'))).toBe(true)
        })
    }
})
