// ⛔ C2 — canal du thème, lot "Chart" (Bullet/Polar/PolarBar/Sankey/
// Sunburst/Variwide) + OrigamCardHeader.
//
// Deux defauts distincts, mesures separement :
//
// 1. Canal CLASSE mort — `usePadding()`/`useMargin()` scindent leur sortie :
//    la forme d'echelle (`padding="4"`) emet SEULEMENT une classe utilitaire
//    et laisse `paddingStyles` vide (meme chose pour `margin`). Trois
//    composants (Bullet, Sankey, Variwide) ne destructuraient MEME PAS
//    `paddingClasses`/`marginClasses` de leurs composables respectifs, ni ne
//    les liaient a `rootClasses` — le canal etait donc totalement mort, pas
//    seulement ecrase. Polar/PolarBar/Sunburst avaient deja ce cablage
//    (residu du fix #620, qui n'a couvert que Gauge/Heatmap/Honeycomb/Map/
//    Pareto/Pictorial). Ce bloc verifie que TOUS les six emettent desormais
//    la classe utilitaire — verification jsdom-safe (`wrapper.classes()` ne
//    depend d'aucune resolution `var()`).
//
// 2. Cascade CSS — la classe emise perd contre la regle scopee du composant
//    (specificite (0,2,0) via [data-v-hash] contre (0,1,0) pour
//    l'utilitaire). CE defaut-la ne peut PAS etre mesure ici : jsdom ne
//    resout jamais `var()` et ne charge meme pas le `<style scoped>` du SFC
//    dans `document.head`. Voir
//    `packages/tests/e2e/chart-family-padding-margin-cascade.spec.ts` pour
//    la preuve en navigateur reel (Playwright, Histoire statique).

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { createOrigam } from '@origam/origam'

import OrigamCardHeader from '@origam/components/Card/OrigamCardHeader.vue'
import OrigamChartBullet from '@origam/components/Chart/OrigamChartBullet.vue'
import OrigamChartPolar from '@origam/components/Chart/OrigamChartPolar.vue'
import OrigamChartPolarBar from '@origam/components/Chart/OrigamChartPolarBar.vue'
import OrigamChartSankey from '@origam/components/Chart/OrigamChartSankey.vue'
import OrigamChartSunburst from '@origam/components/Chart/OrigamChartSunburst.vue'
import OrigamChartVariwide from '@origam/components/Chart/OrigamChartVariwide.vue'

function mountWith (component: any, props: Record<string, unknown> = {}) {
    return mount(component, {
        props: props as never,
        global: {plugins: [createOrigam()]}
    })
}

// `series: []` is enough to reach a stable render for every component in
// this lot without an unrelated crash (mirrors chart-i18n-empty-state.spec.ts).
const CASES: Array<[string, any, Record<string, unknown>]> = [
    ['OrigamChartBullet', OrigamChartBullet, {series: []}],
    ['OrigamChartPolar', OrigamChartPolar, {series: []}],
    ['OrigamChartPolarBar', OrigamChartPolarBar, {series: []}],
    ['OrigamChartSankey', OrigamChartSankey, {series: []}],
    ['OrigamChartSunburst', OrigamChartSunburst, {series: []}],
    ['OrigamChartVariwide', OrigamChartVariwide, {series: []}]
]

describe('famille Chart (lot C2) — le canal CLASSE de padding/margin est-il cable ?', () => {
    for (const [name, component, baseProps] of CASES) {
        it(`${name} : padding="4" emet la classe utilitaire origam--p-4`, () => {
            const wrapper = mountWith(component, {...baseProps, padding: '4'})

            expect(wrapper.classes()).toContain('origam--p-4')
        })

        it(`${name} : margin="4" emet la classe utilitaire origam--m-4`, () => {
            const wrapper = mountWith(component, {...baseProps, margin: '4'})

            expect(wrapper.classes()).toContain('origam--m-4')
        })
    }
})

describe('OrigamCardHeader (lot C2) — le canal CLASSE de padding/margin est-il cable ?', () => {
    it('padding="4" emet la classe utilitaire origam--p-4', () => {
        const wrapper = mountWith(OrigamCardHeader, {padding: '4'})

        expect(wrapper.classes()).toContain('origam--p-4')
    })

    it('margin="4" emet la classe utilitaire origam--m-4', () => {
        const wrapper = mountWith(OrigamCardHeader, {margin: '4'})

        expect(wrapper.classes()).toContain('origam--m-4')
    })
})
