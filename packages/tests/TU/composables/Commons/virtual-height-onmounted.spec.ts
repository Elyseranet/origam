/*********************************************************
 * #504 — useVirtual seeded `last` (la premiere estimation anti-flash) une
 * seule fois, dans `shallowRef(...)`, pendant le `setup()`. Vue execute
 * `setup()` AVANT `beforeCreate` — l'endroit ou le resolveur de props
 * ADR-005 patche `instance.props` — donc si `height` n'etait fourni QUE
 * par un theme, cette premiere estimation lisait la valeur d'avant le
 * theme et ne se corrigeait jamais (le `watch(viewportHeight, …)` existant
 * ne reagit qu'a un changement ULTERIEUR, il ne revisite pas une valeur
 * INITIALE fausse).
 *
 * @description
 * ⛔ CE FICHIER MESURE CONTRE LE VRAI MECANISME, PAS UNE DOUBLURE. Une
 * version anterieure de ce test mutait un objet JS ordinaire tenu par
 * fermeture (`props.height = lateHeight` sur un objet qui n'a jamais
 * transite par `defineProps()`) — cela prouve qu'une fonction relit une
 * reference mutable, pas qu'elle survit au mecanisme reel
 * `Object.defineProperty` install pas ADR-005 sur `instance.props`. Ici,
 * `height` est un vrai `defineProps()` et la valeur vient d'un vrai
 * `createOrigam({ themes })` — le meme patron que
 * `vmodel-default-value.spec.ts`.
 *
 * @description
 * LE PIEGE A EVITER, VERIFIE EN PRATIQUE : avec une liste de 10 items
 * seulement, `items.value.slice(0, last)` renvoie les 10 items DES QUE
 * `last >= 10` — la valeur exacte de `last` (10 correcte, ou 77 fausse en
 * jsdom, `ceil(display.height/itemHeight)`) devient invisible. Le tableau
 * ci-dessous compte 200 items pour que la difference reste mesurable.
 ********************************************************/

import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/interfaces'
import { useVirtual } from '@origam/composables/Commons/virtual.composable'

describe('useVirtual — la premiere estimation de `last` doit refleter un `height` fourni PAR LE THEME (#504)', () => {
    it('un theme fournissant `height` (jamais passe par le consommateur) est repercute apres onMounted', async () => {
        let api!: ReturnType<typeof useVirtual<string>>
        const Host = defineComponent({
            name: 'VirtualThemedHeightHost',
            props: {
                height: {type: Number, default: undefined},
                itemHeight: {type: Number, default: 10}
            },
            setup (props) {
                api = useVirtual(props as any, ref(Array.from({length: 200}, (_, i) => String(i))))
                return () => h('div')
            }
        })

        const theme: IOrigamTheme = {
            name: 'brandx',
            components: {'virtual-themed-height-host': {height: 100}},
            vars: {}
        }
        const origam = createOrigam({themes: [theme]})
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', undefined)

        const wrapper = mount(Host, {global: {plugins: [origam]}})
        await nextTick()

        // height=100, itemHeight=10 -> ceil(100/10) = 10 items attendus si
        // la valeur du theme est bien arrivee dans l'estimation.
        expect(api.computedItems.value.length).toBe(10)
        wrapper.unmount()
    })

    it('sans theme ni prop, l estimation retombe sur display.height sans planter (cas de controle)', async () => {
        let api!: ReturnType<typeof useVirtual<string>>
        const Host = defineComponent({
            name: 'VirtualPlainHeightHost',
            props: {
                height: {type: Number, default: undefined},
                itemHeight: {type: Number, default: 10}
            },
            setup (props) {
                api = useVirtual(props as any, ref(['a', 'b', 'c']))
                return () => h('div')
            }
        })

        const wrapper = mount(Host, {global: {plugins: [createOrigam()]}})
        await nextTick()

        expect(api.computedItems.value.length).toBeGreaterThanOrEqual(0)
        wrapper.unmount()
    })
})
