import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { OrigamCheckbox, OrigamCheckboxGroup } from '@origam/components'
import { createOrigam } from '@origam/origam'

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach(el => el.remove())
})

// ---------------------------------------------------------------------------
// ⛔ PERTE DE DONNÉES — ligne L53 du classeur d'inspection, ticket #396.
//
// Le constat du classeur, mot pour mot : « Un groupe de cases à cocher
// n'accumule JAMAIS : chaque clic écrase le précédent, sans erreur ni
// avertissement. […] Le cas simple (case isolée) fonctionne parfaitement, ce
// qui explique que le défaut soit resté invisible. »
//
// Et surtout : « Ce bug avait DÉJÀ été corrigé par le passé et le code du
// correctif est toujours présent dans OrigamSelectionControl, avec son
// commentaire — il est revenu faute d'un test qui l'épingle. Aucun test
// (story, TU ou e2e) ne monte DEUX contrôles partageant un v-model. »
//
// C'est exactement ce trou que ce fichier comble. Un correctif sans test qui
// l'épingle n'est pas un correctif, c'est un sursis — celui-ci a duré le temps
// d'une régression.
// ---------------------------------------------------------------------------

const ITEMS = [
    { label: 'A', value: 'a' },
    { label: 'B', value: 'b' },
    { label: 'C', value: 'c' }
]

/**
 * Deux `<OrigamCheckbox>` partageant UN SEUL `v-model` de tableau — le cas
 * qu'aucun test ne montait, et le seul où le défaut se voit.
 */
const TwoCheckboxes = defineComponent({
    setup () {
        const selected = ref<unknown[]>([])

        return { selected }
    },
    render () {
        return h('div', [
            h(OrigamCheckbox, {
                value: 'a',
                modelValue: this.selected,
                'onUpdate:modelValue': (v: unknown[]) => { this.selected = v }
            }),
            h(OrigamCheckbox, {
                value: 'b',
                modelValue: this.selected,
                'onUpdate:modelValue': (v: unknown[]) => { this.selected = v }
            })
        ])
    }
})

describe('OrigamCheckbox — accumulation sur un v-model partagé (#396)', () => {
    it('deux cases cochées successivement gardent les DEUX valeurs', async () => {
        const wrapper = mount(TwoCheckboxes, { global: { plugins: [createOrigam()] } })
        const boxes = wrapper.findAll('input[type="checkbox"]')

        expect(boxes.length).toBe(2)

        await boxes[0].setValue(true)
        expect(wrapper.vm.selected).toEqual(['a'])

        await boxes[1].setValue(true)

        // ⛔ Le cœur du défaut : si le second clic écrase au lieu d'accumuler,
        // on obtient ['b'] et l'utilisateur a perdu son premier choix SANS
        // aucun avertissement.
        expect(wrapper.vm.selected).toEqual(['a', 'b'])
    })

    it('décocher retire UNE valeur et garde les autres', async () => {
        const wrapper = mount(TwoCheckboxes, { global: { plugins: [createOrigam()] } })
        const boxes = wrapper.findAll('input[type="checkbox"]')

        await boxes[0].setValue(true)
        await boxes[1].setValue(true)
        expect(wrapper.vm.selected).toEqual(['a', 'b'])

        await boxes[0].setValue(false)
        expect(wrapper.vm.selected).toEqual(['b'])
    })
})

// ⛔ Le groupe passe par `<OrigamCheckboxGroup>`, PAS par
// `<OrigamSelectionControlGroup>` : ce dernier ne rend RIEN par lui-même, il
// n'expose que des slots (`#item.N`, `#item`). Ce sont CheckboxGroup et
// RadioGroup qui fournissent le `#item`. Un test monté sur le contrôle nu
// trouve zéro case et donne l'illusion d'un défaut produit — vérifié.
describe('OrigamCheckboxGroup — le chemin officiellement documenté (#396)', () => {
    it('accumule sans multiple explicite, model initialisé à []', async () => {
        const Host = defineComponent({
            setup () {
                const selected = ref<unknown[]>([])

                return { selected }
            },
            render () {
                return h(OrigamCheckboxGroup, {
                    items: ITEMS,
                    modelValue: this.selected,
                    'onUpdate:modelValue': (v: unknown[]) => { this.selected = v }
                })
            }
        })

        const wrapper = mount(Host, { global: { plugins: [createOrigam()] } })
        const boxes = wrapper.findAll('input[type="checkbox"]')

        expect(boxes.length).toBe(ITEMS.length)

        await boxes[0].setValue(true)
        await boxes[2].setValue(true)

        expect(wrapper.vm.selected).toEqual(['a', 'c'])
    })
})

describe('OrigamCheckbox — trueValue retombe sur props.value, pas sur true (#396)', () => {
    it("une case avec value='a' écrit 'a' dans le model, jamais true", async () => {
        const Host = defineComponent({
            setup () {
                const selected = ref<unknown[]>([])

                return { selected }
            },
            render () {
                return h(OrigamCheckbox, {
                    value: 'a',
                    modelValue: this.selected,
                    'onUpdate:modelValue': (v: unknown[]) => { this.selected = v }
                })
            }
        })

        const wrapper = mount(Host, { global: { plugins: [createOrigam()] } })

        await wrapper.find('input[type="checkbox"]').setValue(true)

        expect(wrapper.vm.selected).toEqual(['a'])
        expect(wrapper.vm.selected).not.toEqual([true])
    })
})
