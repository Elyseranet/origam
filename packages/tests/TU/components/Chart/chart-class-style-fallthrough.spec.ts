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
