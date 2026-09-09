// Accumulation d'un GROUPE de cases a cocher — filet anti-regression #396.
//
// Ce fichier existe pour une seule raison : le defaut « un groupe de cases a
// cocher n'accumule JAMAIS, chaque clic ecrase le precedent, sans erreur » a
// deja ete corrige une fois (ca79ef8b, cb069cdd) et est REVENU, faute d'un
// test qui l'epingle. Aucun spec du depot ne montait DEUX controles partageant
// un meme v-model : la surface exacte ou vit le bug n'etait couverte nulle
// part.
//
// Les trois voies de composition sont couvertes, parce que la garde
// `multiple` doit tenir a CHAQUE niveau (une seule manquante annule celles du
// dessous — c'est exactement ce qui s'etait passe sur OrigamCheckbox) :
//   1. deux <origam-checkbox-btn> sur un v-model tableau partage
//   2. deux <origam-checkbox> sur un v-model tableau partage
//   3. deux <origam-checkbox-btn> dans un <origam-selection-control-group>
//   4. <origam-checkbox-group> pilote par `items` — la voie que documente la
//      story, et la plus profonde : CheckboxGroup -> SelectionControlGroup ->
//      Checkbox -> CheckboxBtn -> SelectionControl
//
// AUCUN stub : la chaine reelle Checkbox -> CheckboxBtn -> SelectionControl
// est montee, sinon le test mesurerait le stub et non le composant.
//
// ⛔ Note d'outillage — MESURE, pas supposition. Sur ce jsdom, un
// `trigger('click')` sur le <input type="checkbox"> bascule bien
// `element.checked` (verifie : `true` apres le clic) mais N'EMET AUCUN
// evenement `input` : le composant ecoute `@input="handleInput"`, donc rien ne
// se passe et `modelValue` reste vide. Un test bati sur `trigger('click')`
// mesurerait donc l'outil, pas le composant — il serait rouge sur du code
// correct. `setValue()` a le defaut symetrique (il n'emet que `change`).
// D'ou le helper `toggleInput` ci-dessous : on bascule `checked` puis on emet
// `input`, ce qui reproduit exactement la sequence du navigateur.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'

import OrigamCheckbox from '@origam/components/Checkbox/OrigamCheckbox.vue'
import OrigamCheckboxBtn from '@origam/components/Checkbox/OrigamCheckboxBtn.vue'
import OrigamCheckboxGroup from '@origam/components/Checkbox/OrigamCheckboxGroup.vue'
import OrigamSelectionControlGroup from '@origam/components/SelectionControl/OrigamSelectionControlGroup.vue'
import { createOrigam } from '@origam/origam'

const mountWithOrigam = (component: any) => mount(component, {
    global: {
        plugins: [ createOrigam() ]
    }
})

// Deux <origam-checkbox-btn> qui partagent le MEME v-model tableau, chacun
// avec sa propre `value`. C'est la forme documentee d'un groupe de cases.
const TwoCheckboxBtn = defineComponent({
    name: 'TwoCheckboxBtn',
    setup () {
        const selected = ref<string[]>([])

        return { selected }
    },
    render () {
        return h('div', [
            h(OrigamCheckboxBtn, {
                'modelValue': this.selected,
                'value': 'a',
                'label': 'A',
                'onUpdate:modelValue': (v: any) => { this.selected = v }
            }),
            h(OrigamCheckboxBtn, {
                'modelValue': this.selected,
                'value': 'b',
                'label': 'B',
                'onUpdate:modelValue': (v: any) => { this.selected = v }
            })
        ])
    }
})

const TwoCheckbox = defineComponent({
    name: 'TwoCheckbox',
    setup () {
        const selected = ref<string[]>([])

        return { selected }
    },
    render () {
        return h('div', [
            h(OrigamCheckbox, {
                'modelValue': this.selected,
                'value': 'a',
                'label': 'A',
                'onUpdate:modelValue': (v: any) => { this.selected = v }
            }),
            h(OrigamCheckbox, {
                'modelValue': this.selected,
                'value': 'b',
                'label': 'B',
                'onUpdate:modelValue': (v: any) => { this.selected = v }
            })
        ])
    }
})

// Le groupe possede la selection ; les enfants n'ont PAS de v-model propre.
const GroupedCheckboxBtn = defineComponent({
    name: 'GroupedCheckboxBtn',
    setup () {
        const selected = ref<string[]>([])

        return { selected }
    },
    render () {
        return h(OrigamSelectionControlGroup, {
            'modelValue': this.selected,
            'onUpdate:modelValue': (v: any) => { this.selected = v }
        }, {
            default: () => [
                h(OrigamCheckboxBtn, { value: 'a', label: 'A' }),
                h(OrigamCheckboxBtn, { value: 'b', label: 'B' })
            ]
        })
    }
})

// La voie documentee par la story : le groupe rend lui-meme ses <origam-checkbox>
// a partir de `items`, le consommateur n'ecrit aucune case a la main.
const ItemsCheckboxGroup = defineComponent({
    name: 'ItemsCheckboxGroup',
    setup () {
        const selected = ref<string[]>([])

        return { selected }
    },
    render () {
        return h(OrigamCheckboxGroup, {
            'modelValue': this.selected,
            'label': 'Notifications',
            'items': [
                { label: 'A', value: 'a' },
                { label: 'B', value: 'b' }
            ],
            'onUpdate:modelValue': (v: any) => { this.selected = v }
        })
    }
})

const toggleInput = async (wrapper: any, index: number) => {
    // Le delta d'un tick documente dans `props.composable.ts` : la chaine
    // forwarde ses props via un template ref, `undefined` pendant le rendu 1.
    // Sans ce flush, on mesurerait l'etat AVANT que `multiple` n'ait atteint
    // `OrigamSelectionControl` — un faux defaut, invisible dans un navigateur.
    await wrapper.vm.$nextTick()

    const inputs = wrapper.findAll('input[type="checkbox"]')

    expect(inputs.length).toBe(2)

    const el = inputs[index].element as HTMLInputElement

    el.checked = !el.checked
    await inputs[index].trigger('input')
    await wrapper.vm.$nextTick()
}

describe('#396 — deux <origam-checkbox-btn> sur un v-model tableau partage', () => {
    it('accumule les valeurs au lieu d\'ecraser la precedente', async () => {
        const wrapper = mountWithOrigam(TwoCheckboxBtn)

        await toggleInput(wrapper, 0)
        expect(wrapper.vm.selected).toEqual([ 'a' ])

        await toggleInput(wrapper, 1)
        // Le coeur du defaut : sans la correction, on obtenait ['b'].
        expect(wrapper.vm.selected).toEqual([ 'a', 'b' ])
    })

    it('ne retire que sa propre valeur au decochage', async () => {
        const wrapper = mountWithOrigam(TwoCheckboxBtn)

        await toggleInput(wrapper, 0)
        await toggleInput(wrapper, 1)
        expect(wrapper.vm.selected).toEqual([ 'a', 'b' ])

        await toggleInput(wrapper, 0)
        expect(wrapper.vm.selected).toEqual([ 'b' ])
    })

    it('ecrit la `value` du controle, pas le booleen `true` (trueValue lit props.value)', async () => {
        const wrapper = mountWithOrigam(TwoCheckboxBtn)

        await toggleInput(wrapper, 1)
        expect(wrapper.vm.selected).toEqual([ 'b' ])
        expect(wrapper.vm.selected).not.toContain(true)
    })
})

describe('#396 — deux <origam-checkbox> sur un v-model tableau partage', () => {
    it('accumule les valeurs au lieu d\'ecraser la precedente', async () => {
        const wrapper = mountWithOrigam(TwoCheckbox)

        await toggleInput(wrapper, 0)
        expect(wrapper.vm.selected).toEqual([ 'a' ])

        await toggleInput(wrapper, 1)
        expect(wrapper.vm.selected).toEqual([ 'a', 'b' ])
    })

    it('ne retire que sa propre valeur au decochage', async () => {
        const wrapper = mountWithOrigam(TwoCheckbox)

        await toggleInput(wrapper, 0)
        await toggleInput(wrapper, 1)
        await toggleInput(wrapper, 1)
        expect(wrapper.vm.selected).toEqual([ 'a' ])
    })
})

describe('#396 — <origam-selection-control-group> qui possede la selection', () => {
    it('accumule les valeurs des <origam-checkbox-btn> enfants', async () => {
        const wrapper = mountWithOrigam(GroupedCheckboxBtn)

        await toggleInput(wrapper, 0)
        expect(wrapper.vm.selected).toEqual([ 'a' ])

        await toggleInput(wrapper, 1)
        expect(wrapper.vm.selected).toEqual([ 'a', 'b' ])
    })
})

describe('#396 — <origam-checkbox-group> pilote par `items`', () => {
    it('accumule les valeurs des cases qu\'il rend lui-meme', async () => {
        const wrapper = mountWithOrigam(ItemsCheckboxGroup)

        await toggleInput(wrapper, 0)
        expect(wrapper.vm.selected).toEqual([ 'a' ])

        await toggleInput(wrapper, 1)
        expect(wrapper.vm.selected).toEqual([ 'a', 'b' ])
    })

    it('n\'emet update:modelValue qu\'UNE fois par selection', async () => {
        const wrapper = mountWithOrigam(ItemsCheckboxGroup)
        const group = wrapper.findComponent(OrigamCheckboxGroup)

        await toggleInput(wrapper, 0)

        // Le double-emit de RadioGroup (handler du consommateur appele deux
        // fois par selection, `onUpdate:modelValue` bloque dans $attrs puis
        // reinjecte) est ce que l'option `emits` de CheckboxGroup previent.
        expect(group.emitted('update:modelValue')).toHaveLength(1)
    })
})

describe('#396 — `multiple` explicitement passee reste souveraine', () => {
    it('multiple=false force le mode simple meme sur un modele tableau', async () => {
        const SingleMode = defineComponent({
            name: 'SingleMode',
            setup () {
                const selected = ref<any>([])

                return { selected }
            },
            render () {
                return h('div', [
                    h(OrigamCheckboxBtn, {
                        'modelValue': this.selected,
                        'value': 'a',
                        'multiple': false,
                        'onUpdate:modelValue': (v: any) => { this.selected = v }
                    }),
                    h(OrigamCheckboxBtn, {
                        'modelValue': this.selected,
                        'value': 'b',
                        'multiple': false,
                        'onUpdate:modelValue': (v: any) => { this.selected = v }
                    })
                ])
            }
        })

        const wrapper = mountWithOrigam(SingleMode)

        await toggleInput(wrapper, 0)
        expect(wrapper.vm.selected).toBe('a')

        await toggleInput(wrapper, 1)
        expect(wrapper.vm.selected).toBe('b')
    })
})
