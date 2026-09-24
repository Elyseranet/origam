/*********************************************************
 * #781 — famille a11y : les marques `role="button"` de Sparkline / Radar
 *
 * @description
 * ⛔ CE QUE SONAR DISAIT, ET CE QUE LA MESURE DONNE
 * Le ticket listait 5 emplacements (`OrigamChartSparkline.vue` 30/54/94/112,
 * `OrigamChartRadar.vue` 94) sous l'intitulé « `role="button"` sur `<rect>` /
 * `<circle>` **+ aucun gestionnaire clavier** », la règle Sonar étant « Use
 * `<button>` instead of the button role ».
 *
 * Les deux moitiés sont fausses, et ce fichier le prouve plutôt que de
 * l'affirmer :
 *
 * 1. `<button>` n'est PAS disponible ici. Ces marques vivent dans l'espace de
 *    coordonnées d'un `<svg>`, où du contenu de flux HTML est illégal hors
 *    d'un `<foreignObject>`. `role="button"` + `tabindex` + `keydown` EST la
 *    construction correcte pour une marque SVG actionnable.
 * 2. « Aucun gestionnaire clavier » est faux : les blocs
 *    « clavier — Entrée / Espace » ci-dessous ACTIONNENT réellement la touche
 *    et vérifient que `point-click` part. Poser un `@keydown` sans vérifier
 *    qu'il déclenche quelque chose reproduirait le défaut sous une autre
 *    forme ; on mesure donc l'émission, pas la présence de l'attribut.
 *
 * @description
 * ⛔ LE DÉFAUT RÉEL, LUI, EXISTE — et c'est un défaut de NOM, pas de rôle.
 * `IChartSeries.name` est typé `string`, mais rien ne l'impose au RUNTIME :
 * un consommateur JavaScript qui l'omet obtenait, mesuré sur `develop` :
 *
 *   Sparkline  aria-label=", 0: 1"          (séparateur orphelin en tête)
 *   Radar      aria-label="undefined, x: 1" (le mot « undefined » lu à voix haute)
 *
 * Les assertions « série sans nom » de ce fichier sont les CONTRÔLES POSITIFS
 * du lot : elles rougissent sur le commit parent et passent après. Les
 * assertions « série nommée » sont les contrôles de non-régression — elles
 * passent des deux côtés, et ne prouvent donc rien à elles seules.
 *
 * @description
 * Aucune assertion ici ne lit `getComputedStyle` : on mesure des attributs
 * ARIA et des émissions. Le piège jsdom/`var()` du CLAUDE.md ne s'applique
 * pas.
 ********************************************************/

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamChartSparkline from '@origam/components/Chart/OrigamChartSparkline.vue'
import OrigamChartRadar from '@origam/components/Chart/OrigamChartRadar.vue'
import { createOrigam } from '@origam/origam'

import type { IChartPoint } from '@origam/interfaces'

const mountSparkline = (props: Record<string, unknown>) =>
    mount(OrigamChartSparkline, {
        props: props as never,
        global: { plugins: [createOrigam()] }
    })

const mountRadar = (props: Record<string, unknown>) =>
    mount(OrigamChartRadar, {
        props: props as never,
        global: { plugins: [createOrigam()] }
    })

// ---------------------------------------------------------------------------
// Sparkline — nom accessible des marques
// ---------------------------------------------------------------------------

describe('OrigamChartSparkline — nom accessible des marques role="button"', () => {
    it('nomme une barre « <série>, <index>: <valeur> » quand la série a un nom', () => {
        const wrapper = mountSparkline({ series: [{ name: 'Revenue', data: [3, 7, 2] }], type: 'column' })

        expect(wrapper.find('[data-cy="origam-chart-sparkline-bar-1"]').attributes('aria-label'))
            .toBe('Revenue, 1: 7')

        wrapper.unmount()
    })

    /*********************************************************
     * CONTRÔLE POSITIF — rougit sur le commit parent
     * Parent : aria-label=", 0: 3". Ici : "0: 3".
     ********************************************************/
    it('n\'émet PAS de séparateur orphelin quand la série n\'a pas de nom', () => {
        const wrapper = mountSparkline({ series: [{ data: [3, 7, 2] }], type: 'column' })
        const label = wrapper.find('[data-cy="origam-chart-sparkline-bar-0"]').attributes('aria-label')

        expect(label).toBe('0: 3')
        expect(label?.startsWith(',')).toBe(false)

        wrapper.unmount()
    })

    it('traite un nom de série vide ou blanc comme absent', () => {
        const wrapper = mountSparkline({ series: [{ name: '   ', data: [3, 7] }], type: 'column' })

        expect(wrapper.find('[data-cy="origam-chart-sparkline-bar-0"]').attributes('aria-label'))
            .toBe('0: 3')

        wrapper.unmount()
    })

    it('vaut pour les quatre familles de marques signalées (rect colonne, rect barre, marqueur, marqueur spécial)', () => {
        const series = [{ data: [3, 7, 2] }]

        const column = mountSparkline({ series, type: 'column' })
        const bar = mountSparkline({ series, type: 'bar' })
        const line = mountSparkline({ series, type: 'line', showMarkers: true })

        // Sparkline.vue:30  — <rect> colonne
        expect(column.find('[data-cy="origam-chart-sparkline-bar-0"]').attributes('aria-label')).toBe('0: 3')
        // Sparkline.vue:54  — <rect> barre horizontale
        expect(bar.find('[data-cy="origam-chart-sparkline-hbar-0"]').attributes('aria-label')).toBe('0: 3')
        // Sparkline.vue:94  — <circle> marqueur
        expect(line.find('[data-cy="origam-chart-sparkline-marker-0"]').attributes('aria-label')).toBe('0: 3')
        // Sparkline.vue:112 — <circle> marqueur spécial (last, affiché par défaut)
        expect(line.find('[data-cy="origam-chart-sparkline-special-last"]').attributes('aria-label')).toBe('2: 2')

        column.unmount()
        bar.unmount()
        line.unmount()
    })
})

// ---------------------------------------------------------------------------
// Sparkline — le rôle est bien opérable (ce que Sonar dit absent)
// ---------------------------------------------------------------------------

describe('OrigamChartSparkline — le role="button" est réellement opérable', () => {
    it('chaque marque est un point d\'arrêt de tabulation nommé', () => {
        const wrapper = mountSparkline({ series: [{ name: 'Revenue', data: [3, 7] }], type: 'column' })
        const bar = wrapper.find('[data-cy="origam-chart-sparkline-bar-0"]')

        expect(bar.element.tagName.toLowerCase()).toBe('rect')
        expect(bar.attributes('role')).toBe('button')
        expect(bar.attributes('tabindex')).toBe('0')
        expect(bar.attributes('aria-label')).toBeTruthy()

        wrapper.unmount()
    })

    it('Entrée sur un marqueur SPÉCIAL émet point-click (aucun test ne le couvrait)', async () => {
        const wrapper = mountSparkline({ series: [{ name: 'Revenue', data: [3, 7, 2] }], type: 'line' })

        await wrapper.find('[data-cy="origam-chart-sparkline-special-last"]').trigger('keydown.enter')

        const emitted = wrapper.emitted('point-click')
        expect(emitted).toHaveLength(1)
        expect((emitted![0][0] as IChartPoint).dataIndex).toBe(2)

        wrapper.unmount()
    })

    it('Espace sur un marqueur SPÉCIAL émet point-click aussi', async () => {
        const wrapper = mountSparkline({ series: [{ name: 'Revenue', data: [3, 7, 2] }], type: 'line' })

        await wrapper.find('[data-cy="origam-chart-sparkline-special-last"]').trigger('keydown.space')

        expect(wrapper.emitted('point-click')).toHaveLength(1)

        wrapper.unmount()
    })

    it('Entrée sur une barre horizontale émet point-click', async () => {
        const wrapper = mountSparkline({ series: [{ name: 'Revenue', data: [3, 7, 2] }], type: 'bar' })

        await wrapper.find('[data-cy="origam-chart-sparkline-hbar-2"]').trigger('keydown.enter')

        const emitted = wrapper.emitted('point-click')
        expect(emitted).toHaveLength(1)
        expect((emitted![0][0] as IChartPoint).dataIndex).toBe(2)

        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// Radar — nom accessible + opérabilité du sommet
// ---------------------------------------------------------------------------

describe('OrigamChartRadar — nom accessible des sommets role="button"', () => {
    it('nomme un sommet « <série>, <catégorie>: <valeur> » quand la série a un nom', async () => {
        const wrapper = mountRadar({ series: [{ name: 'A', data: [1, 2, 3] }], categories: ['x', 'y', 'z'] })
        await nextTick()

        expect(wrapper.find('[data-cy="origam-chart-point-0-0"]').attributes('aria-label'))
            .toBe('A, x: 1')

        wrapper.unmount()
    })

    /*********************************************************
     * CONTRÔLE POSITIF — rougit sur le commit parent
     * Parent : aria-label="undefined, x: 1" — le mot « undefined » était
     * interpolé dans le gabarit et lu à voix haute par le lecteur d'écran.
     ********************************************************/
    it('n\'interpole JAMAIS le mot « undefined » dans le nom accessible', async () => {
        const wrapper = mountRadar({ series: [{ data: [1, 2, 3] }], categories: ['x', 'y', 'z'] })
        await nextTick()

        const label = wrapper.find('[data-cy="origam-chart-point-0-0"]').attributes('aria-label')

        expect(label).toBe('x: 1')
        expect(label).not.toContain('undefined')

        wrapper.unmount()
    })

    it('Entrée et Espace sur un sommet émettent bien point-click', async () => {
        const enter = mountRadar({ series: [{ name: 'A', data: [1, 2, 3] }], categories: ['x', 'y', 'z'] })
        await nextTick()
        await enter.find('[data-cy="origam-chart-point-0-1"]').trigger('keydown.enter')
        expect(enter.emitted('point-click')).toHaveLength(1)
        expect((enter.emitted('point-click')![0][0] as IChartPoint).dataIndex).toBe(1)
        enter.unmount()

        const space = mountRadar({ series: [{ name: 'A', data: [1, 2, 3] }], categories: ['x', 'y', 'z'] })
        await nextTick()
        await space.find('[data-cy="origam-chart-point-0-1"]').trigger('keydown.space')
        expect(space.emitted('point-click')).toHaveLength(1)
        space.unmount()
    })

    it('le sommet est un <circle> nommé et focusable — pas un <button>, impossible dans un <svg>', async () => {
        const wrapper = mountRadar({ series: [{ name: 'A', data: [1, 2, 3] }], categories: ['x', 'y', 'z'] })
        await nextTick()

        const point = wrapper.find('[data-cy="origam-chart-point-0-0"]')

        expect(point.element.tagName.toLowerCase()).toBe('circle')
        expect(point.element.closest('svg')).not.toBeNull()
        expect(point.attributes('role')).toBe('button')
        expect(point.attributes('tabindex')).toBe('0')

        wrapper.unmount()
    })
})
