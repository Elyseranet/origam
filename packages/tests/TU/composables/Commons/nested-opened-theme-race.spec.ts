/*********************************************************
 * #530 (lot B) — useNested.opened : mesure du cas theme laisse ouvert par
 * la baseline `composable-setup-reads.json`, puis correction.
 *
 * @description
 * `composable-setup-reads.mjs` baseline `useNested:opened` avec ce
 * commentaire explicite : « Tres probablement inoffensif (aucun theme
 * livre ne configure `opened`), mais non mesure : laisse baseline plutot
 * que corrige a l'aveugle. » Ce fichier fait la mesure manquante, sur le
 * VRAI mecanisme (`createOrigam({ themes })` + `_activeDefaultsFor`), pas
 * une hypothese.
 *
 * @description
 * MESURE AVANT correction : `const opened = ref(new Set(props.opened))`
 * (nested.composable.ts:27) s'execute pendant le `setup()` de l'appelant,
 * donc AVANT que `beforeCreate` installe l'accesseur ADR-005 sur
 * `instance.props`. Le `watch(() => props.opened, …)` ajoute par #486
 * juste apres ne corrige PAS ce premier instantane : son propre premier
 * releve (pour etablir la base de comparaison) a lieu au meme instant
 * `setup()`, donc AVANT le theme lui aussi — seul un changement ULTERIEUR
 * (venant du parent) peut le faire callback. Verifie : avant correction,
 * ce test echouait (`root.opened.value.has('group-a')` valait `true` —
 * la valeur du parent, jamais le theme).
 *
 * @description
 * CORRECTIF APPLIQUE : un `onMounted()` re-applique le meme seed
 * (`new Set(props.opened)`) une fois que `beforeCreate` a eu la
 * possibilite d'ecrire — miroir exact du patron deja livre pour
 * `useVirtual.estimateLast` (#504). Garde par `openedTouchedBeforeMount`
 * pour ne jamais ecraser un `open()`/`openOnSelect()` legitime survenu
 * avant le montage du parent (un enfant peut monter, donc s'executer,
 * avant le `onMounted` de son parent).
 ********************************************************/

import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/interfaces'
import type { INestedProps } from '@origam/interfaces'
import { useNested } from '@origam/composables/Commons/nested.composable'

type NestedRoot = ReturnType<typeof useNested>

describe('#530 — useNested.opened : un theme fournissant `opened` (jamais passe par le consommateur)', () => {
    it('atteint `opened` apres le montage — corrige, verifie contre le vrai mecanisme', async () => {
        let root!: NestedRoot

        const Host = defineComponent({
            name: 'NestedOpenedThemeRaceHost',
            props: {
                opened: {type: Array, default: () => []},
                selected: {type: Array, default: () => []}
            },
            emits: ['update:selected', 'update:opened', 'click:open', 'click:select'],
            setup (props) {
                root = useNested(props as unknown as INestedProps)
                return () => h('div')
            }
        })

        const theme: IOrigamTheme = {
            name: 'brandx',
            components: {'nested-opened-theme-race-host': {opened: ['group-a']}},
            vars: {}
        }
        const origam = createOrigam({themes: [theme]})
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', undefined)

        const wrapper = mount(Host, {global: {plugins: [origam]}})
        await nextTick()

        expect(root.opened.value.has('group-a')).toBe(true)
        expect(root.opened.value.size).toBe(1)

        wrapper.unmount()
    })

    it('cas de controle — sans theme, `opened` reste un Set vide (rien ne casse)', async () => {
        let root!: NestedRoot

        const Host = defineComponent({
            name: 'NestedOpenedPlainHost',
            props: {
                opened: {type: Array, default: () => []},
                selected: {type: Array, default: () => []}
            },
            emits: ['update:selected', 'update:opened', 'click:open', 'click:select'],
            setup (props) {
                root = useNested(props as unknown as INestedProps)
                return () => h('div')
            }
        })

        const wrapper = mount(Host, {global: {plugins: [createOrigam()]}})
        await nextTick()

        expect(root.opened.value.size).toBe(0)
        wrapper.unmount()
    })
})
