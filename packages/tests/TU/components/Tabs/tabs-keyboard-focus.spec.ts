// #786 — OrigamTabs : les fleches doivent deplacer le FOCUS, pas seulement
// la selection (WAI-ARIA APG, « Tabs with Automatic Activation »).
//
// ⛔ POURQUOI CE FICHIER EXISTE
// `packages/tests/e2e/tabs.spec.ts` couvrait deja les 4 touches — mais
// n'assertait QUE `aria-selected`. 35/35 verts sur un clavier casse.
// Toute assertion ici porte sur `document.activeElement`, jamais sur
// `aria-selected` seul.
//
// ⛔ LE HARNESS DOIT ETRE CONTROLE
// Le defaut n'existe QUE quand le modele est CONTROLE, c'est-a-dire quand
// le consommateur fournit A LA FOIS `modelValue` ET `onUpdate:modelValue`
// (condition `isControlled` de `useVModel`). Un `mount(OrigamTabs, {props:
// {modelValue}})` sans listener passe par `internalValue()` et ne reproduit
// RIEN. C'est pourquoi on monte un composant parent qui porte un vrai
// `v-model` — mesure a l'appui, les deux colonnes ci-dessous :
//
//                 controle (v-model)        non controle
//   ArrowRight    focus 0 -> 0  ❌           focus 0 -> 1  ✅
//   ArrowRight    focus 0 -> 1  ❌
//   ArrowLeft     focus 1 -> 2  ❌
//
// A/B, remesure : ce fichier rend 8 echecs / 3 passes sur le code d'AVANT
// (source ramenee a `ae47fbdaa~1`, ce fichier inchange) et 11/11 apres. Les
// 3 qui passent des deux cotes sont exactement celles qui le doivent : Home,
// End, et le controle negatif « modele non controle ».
// ⚠️ Une version precedente de cet entete annoncait « 7 echecs » — chiffre
// faux, contredit par le message du commit lui-meme (« 8 echecs / 3 passes »)
// et par la remesure.

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'

import OrigamTabs from '@origam/components/Tabs/OrigamTabs.vue'
import OrigamTab from '@origam/components/Tabs/OrigamTab.vue'
import { createOrigam } from '@origam/origam'

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------
const makeGlobal = () => ({
    plugins: [createOrigam()],
    stubs: { OrigamIcon: { template: '<span/>' } }
})

// Parent portant un VRAI v-model => `isControlled` vaut true cote useVModel.
const ControlledTabs = defineComponent({
    props: {
        direction: { type: String, default: undefined },
        tabs: {
            type: Array as () => Array<Record<string, unknown>>,
            default: () => [
                { value: 'a', text: 'A' },
                { value: 'b', text: 'B' },
                { value: 'c', text: 'C' }
            ]
        }
    },
    setup (props, { expose }) {
        const model = ref(props.tabs[0].value)

        expose({ model })

        return () => h(OrigamTabs, {
            'modelValue': model.value,
            'onUpdate:modelValue': (v: unknown) => { model.value = v },
            'direction': props.direction
        }, {
            default: () => props.tabs.map(tp => h(OrigamTab, tp))
        })
    }
})

const mountTabs = (props: Record<string, unknown> = {}) => mount(ControlledTabs, {
    props,
    attachTo: document.body,
    global: makeGlobal()
})

/** Index de l'onglet reellement focalise, -1 si le focus est ailleurs. */
const focusedIndex = (wrapper: ReturnType<typeof mountTabs>) =>
    wrapper.findAll('[role="tab"]').findIndex(t => t.element === document.activeElement)

const selectedFlags = (wrapper: ReturnType<typeof mountTabs>) =>
    wrapper.findAll('[role="tab"]').map(t => t.attributes('aria-selected'))

const press = async (wrapper: ReturnType<typeof mountTabs>, key: string) => {
    await wrapper.find('[role="tablist"]').trigger('keydown', { key })
    await nextTick()
    await nextTick()
}

/** Pose le focus de depart sur un onglet, comme le ferait un Tab entrant. */
const focusTabAt = async (wrapper: ReturnType<typeof mountTabs>, index: number) => {
    const tab = wrapper.findAll('[role="tab"]')[index].element as HTMLElement
    tab.focus()
    await nextTick()
    expect(focusedIndex(wrapper)).toBe(index)
}

// ---------------------------------------------------------------------------
// Horizontal — ArrowRight / ArrowLeft
// ---------------------------------------------------------------------------
describe('#786 OrigamTabs — les fleches deplacent le focus (horizontal)', () => {
    it('ArrowRight deplace le focus ET la selection sur l\'onglet suivant', async () => {
        const wrapper = mountTabs()
        await nextTick()
        await focusTabAt(wrapper, 0)

        await press(wrapper, 'ArrowRight')

        // ⛔ L'assertion qui manquait : le FOCUS, pas seulement aria-selected.
        expect(focusedIndex(wrapper)).toBe(1)
        expect(selectedFlags(wrapper)).toEqual(['false', 'true', 'false'])

        wrapper.unmount()
    })

    it('deux ArrowRight consecutifs ne laissent pas le focus d\'un cran en arriere', async () => {
        const wrapper = mountTabs()
        await nextTick()
        await focusTabAt(wrapper, 0)

        await press(wrapper, 'ArrowRight')
        await press(wrapper, 'ArrowRight')

        // Avant #786 : focus=1 alors que aria-selected pointait deja l'onglet 2.
        expect(focusedIndex(wrapper)).toBe(2)
        expect(selectedFlags(wrapper)).toEqual(['false', 'false', 'true'])

        wrapper.unmount()
    })

    it('ArrowLeft deplace le focus ET la selection sur l\'onglet precedent', async () => {
        const wrapper = mountTabs()
        await nextTick()
        await focusTabAt(wrapper, 0)

        await press(wrapper, 'ArrowRight')
        await press(wrapper, 'ArrowLeft')

        expect(focusedIndex(wrapper)).toBe(0)
        expect(selectedFlags(wrapper)).toEqual(['true', 'false', 'false'])

        wrapper.unmount()
    })

    it('ArrowRight boucle du dernier onglet au premier, focus compris', async () => {
        const wrapper = mountTabs()
        await nextTick()
        await focusTabAt(wrapper, 0)

        await press(wrapper, 'End')
        expect(focusedIndex(wrapper)).toBe(2)

        await press(wrapper, 'ArrowRight')

        expect(focusedIndex(wrapper)).toBe(0)
        expect(selectedFlags(wrapper)).toEqual(['true', 'false', 'false'])

        wrapper.unmount()
    })

    it('le focus et aria-selected ne divergent jamais sur une sequence de 6 touches', async () => {
        const wrapper = mountTabs()
        await nextTick()
        await focusTabAt(wrapper, 0)

        for (const key of ['ArrowRight', 'ArrowRight', 'ArrowLeft', 'End', 'Home', 'ArrowRight']) {
            await press(wrapper, key)

            const focused = focusedIndex(wrapper)
            const selected = selectedFlags(wrapper).indexOf('true')

            expect(
                focused,
                `apres ${key} : focus=${focused}, aria-selected=${selected}`
            ).toBe(selected)
        }

        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// Vertical — ArrowDown / ArrowUp (point explicitement « non mesure » du ticket)
// ---------------------------------------------------------------------------
describe('#786 OrigamTabs — les fleches deplacent le focus (vertical)', () => {
    it('ArrowDown deplace le focus', async () => {
        const wrapper = mountTabs({ direction: 'vertical' })
        await nextTick()
        await focusTabAt(wrapper, 0)

        await press(wrapper, 'ArrowDown')

        expect(focusedIndex(wrapper)).toBe(1)
        expect(selectedFlags(wrapper)).toEqual(['false', 'true', 'false'])

        wrapper.unmount()
    })

    it('ArrowUp deplace le focus', async () => {
        const wrapper = mountTabs({ direction: 'vertical' })
        await nextTick()
        await focusTabAt(wrapper, 0)

        await press(wrapper, 'ArrowDown')
        await press(wrapper, 'ArrowUp')

        expect(focusedIndex(wrapper)).toBe(0)
        expect(selectedFlags(wrapper)).toEqual(['true', 'false', 'false'])

        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// Onglets desactives — la fleche les saute, focus compris
// ---------------------------------------------------------------------------
describe('#786 OrigamTabs — onglets desactives', () => {
    it('ArrowRight saute l\'onglet desactive et focalise le suivant actif', async () => {
        const wrapper = mountTabs({
            tabs: [
                { value: 'a', text: 'A' },
                { value: 'b', text: 'B', disabled: true },
                { value: 'c', text: 'C' }
            ]
        })
        await nextTick()
        await focusTabAt(wrapper, 0)

        await press(wrapper, 'ArrowRight')

        expect(focusedIndex(wrapper)).toBe(2)
        expect(selectedFlags(wrapper)).toEqual(['false', 'false', 'true'])

        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// Home / End — deja corrects avant #786, epingles contre une regression
// ---------------------------------------------------------------------------
describe('#786 OrigamTabs — Home / End (deja corrects, epingles)', () => {
    it('End focalise le dernier onglet', async () => {
        const wrapper = mountTabs()
        await nextTick()
        await focusTabAt(wrapper, 0)

        await press(wrapper, 'End')

        expect(focusedIndex(wrapper)).toBe(2)
        expect(selectedFlags(wrapper)).toEqual(['false', 'false', 'true'])

        wrapper.unmount()
    })

    it('Home focalise le premier onglet', async () => {
        const wrapper = mountTabs()
        await nextTick()
        await focusTabAt(wrapper, 2)

        await press(wrapper, 'Home')

        expect(focusedIndex(wrapper)).toBe(0)
        expect(selectedFlags(wrapper)).toEqual(['true', 'false', 'false'])

        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// Modele NON controle — negatif : le defaut n'y etait pas, il n'y est pas non plus
// ---------------------------------------------------------------------------
describe('#786 OrigamTabs — modele non controle (controle negatif)', () => {
    const UncontrolledTabs = defineComponent({
        setup () {
            return () => h(OrigamTabs, null, {
                default: () => [
                    h(OrigamTab, { value: 'a', text: 'A' }),
                    h(OrigamTab, { value: 'b', text: 'B' }),
                    h(OrigamTab, { value: 'c', text: 'C' })
                ]
            })
        }
    })

    it('ArrowRight deplace le focus sans v-model', async () => {
        const wrapper = mount(UncontrolledTabs, { attachTo: document.body, global: makeGlobal() })
        await nextTick()
        await nextTick()

        const tabs = wrapper.findAll('[role="tab"]')
        ;(tabs[0].element as HTMLElement).focus()

        await wrapper.find('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' })
        await nextTick()
        await nextTick()

        const focused = wrapper.findAll('[role="tab"]').findIndex(t => t.element === document.activeElement)
        expect(focused).toBe(1)

        wrapper.unmount()
    })
})
