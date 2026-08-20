/*********************************************************
 * OrigamParallaxLayer — l'attribut id ne doit jamais recevoir le jeton
 *
 * @description
 * Épingle un défaut RÉEL, introduit par la campagne #372 et resté invisible
 * une journée entière. Le composant déclarait, pour s'enregistrer auprès de
 * son host, un `const id = Symbol('origam:parallax-layer')`. #372 a ajouté
 * `:id="id"` sur la racine de 136 composants en supposant partout que `id`
 * désignait la prop héritée de `ICommonsComponentProps` ; ici le local
 * masquait la prop, et Vue s'est retrouvé à poser un Symbol en attribut :
 *
 *     TypeError: Cannot convert a Symbol value to a string
 *
 * @description
 * Ce qui rend le cas coûteux, ce n'est pas la faute — c'est sa portée. Le
 * throw se produit pendant le rendu, donc c'est TOUT le sous-arbre
 * `<origam-parallax>` qui disparaît, host compris : plus une seule couche
 * affichée. Trois specs e2e le voyaient, et toutes trois échouaient sur
 * `.origam-parallax` introuvable — un symptôme qui désigne le host, jamais
 * l'enfant fautif.
 *
 * @description
 * POURQUOI UN TEST UNITAIRE ICI. Le seul autre filet est e2e, et il
 * n'accuse que le host. Ce spec nomme l'enfant. Il tient sur deux
 * assertions complémentaires — la première seule ne suffirait pas :
 *   1. le montage ne jette pas ET la couche est rendue (le régresseur casse
 *      le rendu, pas seulement l'attribut) ;
 *   2. l'attribut `id` porte la valeur du consommateur, ce qui prouve que
 *      c'est bien la PROP qui alimente le binding et non un local homonyme.
 *
 * Un futur `const id = …` dans ce composant fait échouer les deux.
 ********************************************************/

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'

import OrigamParallax from '@origam/components/Parallax/OrigamParallax.vue'
import OrigamParallaxLayer from '@origam/components/Parallax/OrigamParallaxLayer.vue'
import { createOrigam } from '@origam/origam'

const mountHost = (layerProps: Record<string, unknown> = {}) => mount(OrigamParallax, {
    slots: {
        default: () => h(OrigamParallaxLayer, layerProps, { default: () => 'couche' })
    },
    global: { plugins: [createOrigam({})] }
})

describe('OrigamParallaxLayer — id', () => {
    it('rend la couche ET le host (un Symbol lié à :id ferait sauter tout le sous-arbre)', () => {
        const wrapper = mountHost()

        expect(wrapper.find('.origam-parallax').exists(), 'le host doit être rendu').toBe(true)
        expect(wrapper.find('.origam-parallax__layer').exists(), 'la couche doit être rendue').toBe(true)
    })

    it("l'attribut id rendu est celui du consommateur, pas un jeton interne", () => {
        const wrapper = mountHost({ id: 'ma-couche' })
        const layer = wrapper.find('.origam-parallax__layer')

        expect(layer.attributes('id')).toBe('ma-couche')
    })
})
