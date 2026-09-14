/*********************************************************
 * #734 — `<OrigamVirtualScroll>` ne rendait RIEN quand
 * `items` n'etait pas passe.
 *
 * @description
 * `IVirtualScrollProps.items` est declare OPTIONNEL
 * (`items?: Array<any>`) mais n'avait aucune valeur par
 * defaut. `useVirtual` lit `items.value.length` de maniere
 * SYNCHRONE dans le corps du `setup()` (virtual.composable
 * lignes 121-122, `Array.from({length: items.value.length})`)
 * — un `items` absent y leve donc
 * `Cannot read properties of undefined (reading 'length')`.
 *
 * @description
 * ⛔ LE PIEGE DE DIAGNOSTIC, ET LA RAISON DE CE FICHIER :
 * l'erreur REMONTEE par le navigateur n'etait pas celle-la,
 * mais `$setup.convertToUnit is not a function`. Quand
 * `setup()` leve, Vue n'assemble jamais l'objet
 * `__returned__` ; le rendu qui suit trouve un `$setup` vide
 * et echoue sur le PREMIER symbole que le template y cherche
 * — ici `convertToUnit`. Le message designe donc un symbole
 * parfaitement importe et parfaitement expose : c'est un
 * symptome secondaire, pas la cause. Mesure dans Chromium
 * (Nuxt dev + dist), les deux erreurs sortent dans cet
 * ordre, la `length` d'abord.
 *
 * @description
 * Ce spec mesure la CAUSE (le montage sans `items` ne leve
 * pas) et le SYMPTOME (le composant rend vraiment un
 * element), pour qu'aucun des deux ne puisse revenir seul.
 ********************************************************/

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { createOrigam } from '@origam/origam'
import OrigamVirtualScroll from '@origam/components/VirtualScroll/OrigamVirtualScroll.vue'

/** Monte le composant avec le plugin origam installe (useDisplay exige l'injection). */
const mountBare = (props: Record<string, unknown>) => mount(OrigamVirtualScroll, {
    props,
    global: {plugins: [createOrigam({})]}
})

describe('OrigamVirtualScroll — `items` est optionnel, donc son absence doit rendre (#734)', () => {
    it('ne leve pas quand `items` est omis', () => {
        expect(() => mountBare({height: 300})).not.toThrow()
    })

    it('rend la racine du composant quand `items` est omis', () => {
        const wrapper = mountBare({height: 300})

        expect(wrapper.find('.origam-virtual-scroll').exists()).toBe(true)
    })

    it('ne leve pas en mode renderless sans `items`', () => {
        expect(() => mountBare({renderless: true})).not.toThrow()
    })

    it('rend toujours les items quand ils sont fournis (non-regression)', () => {
        const wrapper = mountBare({items: ['a', 'b', 'c'], itemHeight: 24, height: 300})

        expect(wrapper.findAll('.origam-virtual-scroll__item').length).toBeGreaterThan(0)
    })
})
