// Accord des DEUX comptes independants dans `origam.chart.cartesian.desc`.
//
// La clé livrée par #610 mettait `{series}` et `{count}` (les points) dans
// UNE SEULE chaine pluralisee. `Intl.PluralRules` choisit la forme sur UN
// compte ; l'autre suit donc la categorie du mauvais nombre.
//
// ⛔ INDETECTABLE SOUS `en` : « series » y est invariable, donc `desc_one` et
// `desc_other` sont identiques octet pour octet sur ce mot. Un test qui
// n'exerce que `en` passe avec le defaut intact — et Histoire tourne sous
// `en`. Toute assertion ci-dessous monte donc sous `fr`.
//
// Le cas discriminant est 1 serie / N points : les deux comptes tombent alors
// dans des categories CLDR differentes, ce que la clé unique ne pouvait pas
// exprimer.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamChartCartesian from '@origam/components/Chart/OrigamChartCartesian.vue'
import { createOrigam } from '@origam/origam'

function mountFr (series: Array<unknown>, categories: Array<string>) {
    return mount(OrigamChartCartesian as never, {
        props: { type: 'line', series, categories } as never,
        global: { plugins: [ createOrigam({ locale: { locale: 'fr' } }) ] }
    })
}

const descOf = (wrapper: ReturnType<typeof mountFr>) => wrapper.find('desc').text()

describe('OrigamChartCartesian — accord des deux comptes du <desc> (fr)', () => {
    it('1 serie / 5 points : « 1 série » au SINGULIER, « 5 points » au pluriel', () => {
        const wrapper = mountFr(
            [ { name: 'S', data: [ 1, 2, 3, 4, 5 ] } ],
            [ 'a', 'b', 'c', 'd', 'e' ]
        )
        const desc = descOf(wrapper)

        // Le defaut rendait « 1 séries » ici : la forme etait choisie sur les
        // 5 points et `{series}` la subissait.
        expect(desc).toContain('1 série')
        expect(desc).not.toContain('1 séries')
        expect(desc).toContain('5 points')
    })

    it('3 series / 1 point : « 3 séries » au pluriel, « 1 point » au SINGULIER', () => {
        const wrapper = mountFr(
            [
                { name: 'A', data: [ 1 ] },
                { name: 'B', data: [ 2 ] },
                { name: 'C', data: [ 3 ] }
            ],
            [ 'a' ]
        )
        const desc = descOf(wrapper)

        // Cas symetrique : sous la clé unique, la forme etait choisie sur le
        // point unique et rendait « 3 série ».
        expect(desc).toContain('3 séries')
        expect(desc).toContain('1 point')
        expect(desc).not.toContain('1 points')
    })

    it('1 serie / 1 point : les deux au singulier', () => {
        const wrapper = mountFr([ { name: 'S', data: [ 7 ] } ], [ 'a' ])
        const desc = descOf(wrapper)

        expect(desc).toContain('1 série')
        expect(desc).toContain('1 point')
        expect(desc).not.toContain('1 séries')
        expect(desc).not.toContain('1 points')
    })

    it('aucun fragment non resolu ne fuit dans le rendu', () => {
        const wrapper = mountFr([ { name: 'S', data: [ 1, 2 ] } ], [ 'a', 'b' ])
        const desc = descOf(wrapper)

        // Garde-fou : si une clé de fragment etait mal nommee, `t()` rendrait
        // la clé brute. Sans cette assertion le test passerait sur un rendu
        // du genre « avec origam.chart.cartesian.desc_series et … ».
        expect(desc).not.toContain('origam.chart')
        expect(desc).not.toContain('{series}')
        expect(desc).not.toContain('{points}')
        expect(desc).not.toContain('{count}')
    })
})
