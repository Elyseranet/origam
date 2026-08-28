/*********************************************************
 * #499 — les canaux de crédit, mesurés au runtime
 *
 * @description
 * Les fixtures synthetiques (`unconsumed-props-scan.spec.ts`) prouvent que
 * les CANAUX de credit se comportent comme annonce. Ce fichier-ci prouve
 * l'autre moitie : que sur les composants REELS que la correction fait
 * changer de camp, le verdict est le bon. Un scanner qui credite a tort
 * excuse de la dette ; un scanner qui accuse a tort bloque une PR innocente.
 * Les deux se jugent au rendu, pas a la lecture.
 *
 * @description
 * ⛔ Ce fichier est une affirmation sur le CODE, pas un blanc-seing. Si
 * `OrigamImg` cesse de passer par `pick(props, [...])`, ou `useGroup` par
 * `useVModel(props, 'modelValue')`, ces tests doivent rougir — c'est leur
 * seule raison d'exister.
 ********************************************************/

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { createOrigam } from '@origam/origam'

import OrigamCode from '@origam/components/Code/OrigamCode.vue'
import OrigamImg from '@origam/components/Img/OrigamImg.vue'
import OrigamProgressLinear from '@origam/components/Progress/OrigamProgressLinear.vue'

describe('#499 — canal `pick(props, [...])` : OrigamImg', () => {
    it('height change le rendu (deux valeurs distinctes)', () => {
        const a = mount(OrigamImg, {global: {plugins: [createOrigam()]}, props: {src: '/a.png', height: 100}})
        const b = mount(OrigamImg, {global: {plugins: [createOrigam()]}, props: {src: '/a.png', height: 300}})

        expect(a.html()).not.toBe(b.html())
        a.unmount(); b.unmount()
    })

    /*
     * ⛔ Le noeud qui porte `contentClass` est sous `v-if="slots.default"`
     * dans OrigamResponsive. Sans slot il n'existe pas, et la sonde répond
     * « absent » pour une raison qui n'a rien à voir avec la prop — c'est
     * exactement le piège de population que le garde documente lui-même.
     */
    it('contentClass atteint le DOM (slot fourni — sinon le noeud n existe pas)', () => {
        const w = mount(OrigamImg, {
            global: {plugins: [createOrigam()]},
            props: {src: '/a.png', contentClass: 'probe-content-class'},
            slots: {default: '<span>x</span>'}
        })

        expect(w.html()).toContain('probe-content-class')
        w.unmount()
    })

    it('maxHeight / minHeight / maxWidth / minWidth changent le rendu', () => {
        for (const prop of ['maxHeight', 'minHeight', 'maxWidth', 'minWidth']) {
            const a = mount(OrigamImg, {global: {plugins: [createOrigam()]}, props: {src: '/a.png', [prop]: 50}})
            const b = mount(OrigamImg, {global: {plugins: [createOrigam()]}, props: {src: '/a.png', [prop]: 400}})

            expect(a.html(), prop).not.toBe(b.html())
            a.unmount(); b.unmount()
        }
    })
})

describe("#499 — canal `useVModel(props, 'literal')` dans un composable", () => {
    it('OrigamProgressLinear : modelValue change le rendu', () => {
        const a = mount(OrigamProgressLinear, {global: {plugins: [createOrigam()]}, props: {modelValue: 10}})
        const b = mount(OrigamProgressLinear, {global: {plugins: [createOrigam()]}, props: {modelValue: 90}})

        expect(a.html()).not.toBe(b.html())
        a.unmount(); b.unmount()
    })
})

describe('#499 — la seule paire nouvellement accusee, et elle etait vraie', () => {
    /*
     * Avant le correctif : `class` etait declaree dans `defineProps` (donc
     * retiree du passthrough `$attrs`) et `codeClasses` ne la reprenait pas.
     * La classe du consommateur n'atteignait AUCUN element. Corrige en
     * ajoutant `props.class` a `codeClasses`, comme le font deja Responsive,
     * Tabs, TabPanel et ExpansionPanelContent.
     */
    it('la classe du consommateur atteint le <figure> rendu', () => {
        const w = mount(OrigamCode, {global: {plugins: [createOrigam()]}, props: {code: 'const a = 1', class: 'probe-consumer-class'}})

        expect(w.html()).toContain('probe-consumer-class')
        w.unmount()
    })
})
