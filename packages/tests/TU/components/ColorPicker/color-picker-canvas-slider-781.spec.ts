/*********************************************************
 * #781 — `role="slider"` de `<OrigamColorPickerCanvas>` : verrou de non-régression
 *
 * @description
 * ⛔ CE SIGNALEMENT EST DÉJÀ CORRIGÉ SUR `develop` — la mesure l'établit.
 * Le ticket #781 le décrit comme « `role="slider"` **sans `aria-valuenow`**
 * — attribut *requis* par le rôle », et le classe comme le cas le plus net
 * du lot. Il l'était : le commit **e0c95bfaa** (« C6 a11y —
 * ColorPickerCanvas invalid ARIA role », 2026-09-11) a remplacé
 * `role="application"` — qui ne porte PAS `aria-valuenow` dans sa table de
 * propriétés supportées — par `role="slider"` ET a ajouté le
 * `canvasAriaValueNow` que le rôle exige. Ce commit est un ancêtre de
 * `develop` : `git merge-base --is-ancestor e0c95bfaa HEAD` → vrai.
 *
 * Le relevé Sonar cité par #781 décrit donc un état du code antérieur à
 * cette correction. ⛔ Aucune modification de composant n'accompagne ce
 * fichier : il n'y avait rien à corriger.
 *
 * @description
 * CE QUI EST QUAND MÊME LIVRÉ : le verrou. Rien n'épinglait
 * `aria-valuenow` — ni sa présence, ni le fait qu'il SUIVE la valeur.
 * Un `aria-valuenow` figé satisferait la règle Sonar tout en n'annonçant
 * rien : c'est précisément ce que le troisième test interdit.
 *
 * @description
 * A/B : ces assertions rougissent contre `e0c95bfaa~1` (le parent de la
 * correction), pas contre le parent de CE commit — il n'y a pas de parent
 * fautif ici. Mesuré, `e0c95bfaa~1` rend
 * `role="application"` et AUCUN `aria-valuenow`.
 *
 * @description
 * Attributs ARIA et émissions uniquement : aucun `getComputedStyle`, donc
 * aucune exposition au piège jsdom/`var()`.
 ********************************************************/

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamColorPickerCanvas from '@origam/components/ColorPicker/OrigamColorPickerCanvas.vue'
import { createOrigam } from '@origam/origam'

const mountCanvas = (props: Record<string, unknown> = {}) =>
    mount(OrigamColorPickerCanvas, {
        props: props as never,
        global: { plugins: [createOrigam()] }
    })

describe('OrigamColorPickerCanvas — role="slider" et ses propriétés requises', () => {
    it('porte role="slider" avec les trois bornes que le rôle réclame', () => {
        const wrapper = mountCanvas({ colorHsv: { h: 0, s: 0.4, v: 0.6, a: 1 } })

        expect(wrapper.attributes('role')).toBe('slider')
        expect(wrapper.attributes('aria-valuenow')).toBeDefined()
        expect(wrapper.attributes('aria-valuemin')).toBe('0')
        expect(wrapper.attributes('aria-valuemax')).toBe('100')

        wrapper.unmount()
    })

    it('aria-valuenow reporte la saturation réelle, en pourcentage', () => {
        const wrapper = mountCanvas({ colorHsv: { h: 0, s: 0.4, v: 0.6, a: 1 } })

        // Valeur ABSOLUE, pas « non vide » : 0.4 → 40.
        expect(wrapper.attributes('aria-valuenow')).toBe('40')
        expect(wrapper.attributes('aria-valuetext')).toBe('Saturation 40%, lightness 60%')

        wrapper.unmount()
    })

    /*********************************************************
     * ⛔ Le test qui interdit un `aria-valuenow` FIGÉ.
     * Poser l'attribut une fois suffirait à taire la règle Sonar sans rien
     * annoncer de vrai au lecteur d'écran. On mesure donc DEUX valeurs.
     ********************************************************/
    it('aria-valuenow SUIT la valeur quand elle change', async () => {
        const wrapper = mountCanvas({ colorHsv: { h: 0, s: 0.4, v: 0.6, a: 1 } })

        const before = wrapper.attributes('aria-valuenow')

        await wrapper.setProps({ colorHsv: { h: 0, s: 0.9, v: 0.2, a: 1 } } as never)
        await nextTick()

        const after = wrapper.attributes('aria-valuenow')

        expect(before).toBe('40')
        expect(after).toBe('90')
        expect(after).not.toBe(before)

        wrapper.unmount()
    })

    it('reste nommé et borné même sans couleur (le champ ouvre dans cet état)', () => {
        const wrapper = mountCanvas({})

        expect(wrapper.attributes('role')).toBe('slider')
        expect(wrapper.attributes('aria-valuenow')).toBe('0')
        expect(wrapper.attributes('aria-label')).toBe('Saturation and lightness')

        wrapper.unmount()
    })

    /*********************************************************
     * Le clavier ACTIONNE réellement le curseur — on ne se contente pas de
     * constater la présence d'un `@keydown`.
     ********************************************************/
    it('ArrowRight déplace la saturation et fait bouger aria-valuenow', async () => {
        const wrapper = mountCanvas({ colorHsv: { h: 0, s: 0.4, v: 0.6, a: 1 } })

        await wrapper.trigger('keydown', { key: 'ArrowRight' })

        const emitted = wrapper.emitted('update:colorHsv')
        expect(emitted).toHaveLength(1)
        // pas d'arrondi flottant dans l'assertion : 0.4 + 0.01
        expect((emitted![0][0] as { s: number }).s).toBeCloseTo(0.41, 5)

        // Le composant est contrôlé : on rejoue la valeur émise, puis on
        // vérifie que l'annonce a suivi.
        await wrapper.setProps({ colorHsv: emitted![0][0] } as never)
        await nextTick()

        expect(wrapper.attributes('aria-valuenow')).toBe('41')

        wrapper.unmount()
    })

    it('End porte la saturation au maximum annoncé (100)', async () => {
        const wrapper = mountCanvas({ colorHsv: { h: 0, s: 0.4, v: 0.6, a: 1 } })

        await wrapper.trigger('keydown', { key: 'End' })

        const emitted = wrapper.emitted('update:colorHsv')
        expect(emitted).toHaveLength(1)

        await wrapper.setProps({ colorHsv: emitted![0][0] } as never)
        await nextTick()

        expect(wrapper.attributes('aria-valuenow')).toBe(wrapper.attributes('aria-valuemax'))

        wrapper.unmount()
    })
})
