// #739 — deux défauts mesurés sur l'aperçu live des fiches composants :
//
//  1. `previewPropsFor` jetait `false` avant la fusion, donc DÉCOCHER une prop
//     booléenne dans le playground n'atteignait jamais le composant (385
//     contrôles booléens concernés sur les 218 fiches).
//  2. `previewSlotTextFor` injectait le repli générique « Content » dès qu'une
//     fiche déclarait un slot `default`, y compris quand l'adaptateur curaté
//     rendait DÉJÀ le composant visible par ses props — le texte écrasait
//     alors le rendu (mesuré : 13 fiches, dont `avatar`, qui n'affichait plus
//     son icône).
//
// Ces tests épinglent les deux règles. Ils échouent tous les deux sur le code
// d'avant le correctif.
import { describe, expect, it } from 'vitest'

import { previewPropsFor, previewSlotTextFor } from '~/utils/component-preview.util'

import type { IComponentDoc } from '~/interfaces/components-catalog.interface'

/** Fiche minimale déclarant un slot `default` et rien d'autre. */
const docWithDefaultSlot = (slug: string): IComponentDoc => ({
    slug,
    name: slug,
    tag: `origam-${slug}`,
    slots: [{ slot: 'default', descriptionKey: '', descriptionFallback: '' }]
} as unknown as IComponentDoc)

describe('previewPropsFor — les trois autorités', () => {
    it('laisse passer `false` édité par l\'utilisateur (défaut 2 du ticket #739)', () => {
        // `chip` ne déclare aucune `previewProps` : sans le correctif, la clé
        // disparaissait purement et simplement de l'objet fusionné.
        expect(previewPropsFor('chip', { border: false })).toHaveProperty('border', false)
    })

    it('laisse passer `false` même contre une valeur d\'adaptateur', () => {
        // `badge` déclare `previewProps: { inline: true }`.
        expect(previewPropsFor('badge', { inline: false })).toHaveProperty('inline', false)
    })

    it('laisse passer la chaîne vide éditée — c\'est le choix « (none) »', () => {
        // `text-field` déclare `previewProps: { label: 'Label' }` : sans le
        // correctif, choisir « (none) » ne retirait jamais le libellé.
        expect(previewPropsFor('text-field', { label: '' })).toHaveProperty('label', '')
    })

    it('laisse l\'adaptateur gagner sur une valeur NON éditée', () => {
        // `avatar` déclare `size: 'large'`. Le contrôle `size` du playground
        // vaut `'default'` par défaut : c'est la valeur du DS, pas un choix.
        expect(previewPropsFor('avatar', {}, { size: 'default' }))
            .toHaveProperty('size', 'large')
    })

    it('laisse l\'utilisateur gagner sur l\'adaptateur dès qu\'il a édité', () => {
        expect(previewPropsFor('avatar', { size: 'x-small' }, { size: 'default' }))
            .toHaveProperty('size', 'x-small')
    })

    it('ignore une chaîne vide NON éditée plutôt que d\'écraser l\'adaptateur', () => {
        // Le contrôle `icon` d'`avatar` propose « (none) » (`''`) ; tant que
        // l'utilisateur n'y a pas touché, l'icône curatée doit rester.
        expect(previewPropsFor('avatar', {}, { icon: '' }))
            .toHaveProperty('icon', 'mdi-account')
    })

    it('garde un `false` NON édité : c\'est la valeur par défaut du DS', () => {
        expect(previewPropsFor('chip', {}, { border: false }))
            .toHaveProperty('border', false)
    })

    it('retire `undefined` des deux côtés', () => {
        const merged = previewPropsFor('chip', { a: undefined }, { b: undefined })
        expect(merged).not.toHaveProperty('a')
        expect(merged).not.toHaveProperty('b')
    })
})

describe('previewSlotTextFor — le repli générique', () => {
    it('n\'injecte plus « Content » quand l\'adaptateur rend déjà le composant visible', () => {
        // `avatar` déclare `previewProps: { icon: 'mdi-account' }` ; son slot
        // par défaut REMPLACE l'icône, donc le repli la masquait.
        expect(previewSlotTextFor('avatar', docWithDefaultSlot('avatar'))).toBe('')
    })

    it('garde le repli quand rien d\'autre ne peut rendre le composant', () => {
        // `container` n'a aucune entrée d'adaptateur : sans le repli, la boîte
        // est vide.
        expect(previewSlotTextFor('container', docWithDefaultSlot('container'))).toBe('Content')
    })

    it('garde le `slotText` curaté, même avec des `previewProps`', () => {
        // `card` déclare les deux : le texte curaté est un choix explicite.
        expect(previewSlotTextFor('card', docWithDefaultSlot('card'))).toBe('Card content')
    })

    it('garde la priorité de l\'override de variante', () => {
        expect(previewSlotTextFor('avatar', docWithDefaultSlot('avatar'), 'AB')).toBe('AB')
    })

    it('ne rend rien quand la fiche ne déclare pas de slot par défaut', () => {
        expect(previewSlotTextFor('no-such-component', { slug: 'no-such-component', slots: [] } as unknown as IComponentDoc)).toBe('')
    })
})
