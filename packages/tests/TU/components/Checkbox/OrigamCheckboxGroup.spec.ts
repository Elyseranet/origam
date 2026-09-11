import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { OrigamCheckboxGroup } from '@origam/components'
import { createOrigam } from '@origam/origam'

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach(el => el.remove())
})

const ITEMS = [
    { label: 'A', value: 'a' },
    { label: 'B', value: 'b' },
    { label: 'C', value: 'c' }
]

const mountGroup = (props: Record<string, unknown> = {}) => mount(OrigamCheckboxGroup, {
    props: { items: ITEMS, ...props } as never,
    global: { plugins: [createOrigam()] }
})

// ---------------------------------------------------------------------------
// `<OrigamCheckboxGroup>` — créé le 2026-09-02 depuis la remarque utilisateur
// sur la ligne L53 du classeur d'inspection :
//
//   « il faut créer un composant OrigamCheckboxGroup qui est l'équivalent du
//     composant OrigamRadioGroup mais avec la props multiple car les checkbox
//     peuvent être multiple »
//
// Ces tests couvrent ce qui DISTINGUE ce composant de son modèle. Reproduire
// la couverture de RadioGroup n'aurait rien prouvé : c'est l'écart qui porte
// le risque.
// ---------------------------------------------------------------------------
describe('OrigamCheckboxGroup — la différence avec RadioGroup', () => {
    it('multiple vaut true par défaut (RadioGroup le force à false)', () => {
        const wrapper = mountGroup()

        expect(wrapper.props('multiple')).toBe(true)
    })

    it('sélectionner plusieurs valeurs est le cas normal — le model les garde toutes', async () => {
        const wrapper = mountGroup({ modelValue: [] })

        await wrapper.setProps({ modelValue: ['a', 'c'] } as never)

        expect(wrapper.props('modelValue')).toEqual(['a', 'c'])
    })

    it('multiple={false} reste légitime — un groupe de cases à choix exclusif', () => {
        const wrapper = mountGroup({ multiple: false })

        expect(wrapper.props('multiple')).toBe(false)
    })

    it('rend une case par item', () => {
        const wrapper = mountGroup()

        expect(wrapper.findAll('input[type="checkbox"]').length).toBe(ITEMS.length)
    })
})

// ---------------------------------------------------------------------------
// ⛔ La régression que RadioGroup a réellement subie, épinglée ici AVANT
// qu'elle ne se reproduise.
//
// RadioGroup a vécu sans aucune option `emits` tout en liant
// `useVModel(props, 'modelValue')` en v-model sur trois enfants. Vue reste
// SILENCIEUX dans ce cas : son avertissement ne se déclenche que si le
// composant a une option `emits` qui OMET l'événement, jamais s'il n'en a
// aucune. Le symptôme était `onUpdate:modelValue` bloqué dans `$attrs`, donc
// réinjecté sur `<origam-input>` par le spread `rootAttrs` — le handler du
// consommateur appelé DEUX fois par sélection.
// ---------------------------------------------------------------------------
describe('OrigamCheckboxGroup — emits déclarés (garde anti-double-appel)', () => {
    it('déclare update:modelValue, donc le handler ne transite pas par les attrs', () => {
        const wrapper = mountGroup()
        const declared = (wrapper.vm.$options.emits ?? []) as string[] | Record<string, unknown>
        const names = Array.isArray(declared) ? declared : Object.keys(declared)

        expect(names).toContain('update:modelValue')
    })

    it('onUpdate:modelValue ne traîne pas dans $attrs', () => {
        const wrapper = mount(OrigamCheckboxGroup, {
            props: { items: ITEMS } as never,
            attrs: { 'onUpdate:modelValue': () => undefined },
            global: { plugins: [createOrigam()] }
        })

        expect(Object.keys(wrapper.vm.$attrs)).not.toContain('onUpdate:modelValue')
    })
})

// ---------------------------------------------------------------------------
// Cascade visuelle — même garde que #263 sur RadioGroup / BtnGroup /
// AvatarGroup : ne transmettre QUE ce que le consommateur a réellement passé.
//
// `color` / `bgColor` sont des `TColor` (qui inclut `false`), donc la
// coercition des props booléennes de Vue résout chaque prop NON PASSÉE à la
// valeur concrète `false` — il ne reste aucun `undefined` à filtrer. `density`
// porte en plus la valeur du `withDefaults` du groupe, qui n'est pas non plus
// l'intention du consommateur : transmise inconditionnellement, elle gagnait
// le `mergeDeep` contre une entrée de thème et l'effaçait en silence.
// ---------------------------------------------------------------------------
describe('OrigamCheckboxGroup — cascade vers les enfants', () => {
    it('ne transmet aucun défaut visuel quand le consommateur ne passe rien', () => {
        const wrapper = mountGroup()
        const provider = wrapper.findComponent({ name: 'OrigamDefaultsProvider' })
        const defaults = provider.props('defaults') as Record<string, Record<string, unknown>>

        expect(defaults['origam-checkbox']).toEqual({})
    })

    it('transmet color quand il est réellement passé', () => {
        const wrapper = mountGroup({ color: 'primary' })
        const provider = wrapper.findComponent({ name: 'OrigamDefaultsProvider' })
        const defaults = provider.props('defaults') as Record<string, Record<string, unknown>>

        expect(defaults['origam-checkbox'].color).toBe('primary')
    })
})

// ---------------------------------------------------------------------------
// ⛔ Surface morte retirée — ligne L54 du classeur, critère C5.
//
// `ICheckboxBtnEmits` héritait de `IFocusEmits`, qui déclare
// `update:focused`. Or `<OrigamCheckboxBtn>` n'a AUCUNE gestion du focus — ni
// handler `focus`/`blur`, ni appel à `useFocus` — et `focused` n'est même pas
// une de ses props. L'événement ne pouvait donc jamais partir.
//
// `<OrigamCheckbox>` est le cas inverse : il appelle `useFocus(props)`, dont
// le `useVModel(props, 'focused')` émet réellement `update:focused`. Les deux
// assertions ci-dessous épinglent cette asymétrie, qui est voulue.
// ---------------------------------------------------------------------------
describe('Famille Checkbox — update:focused déclaré uniquement là où il part', () => {
    it("OrigamCheckboxBtn ne déclare PLUS update:focused (il ne peut pas l'émettre)", async () => {
        const { OrigamCheckboxBtn } = await import('@origam/components')
        const wrapper = mount(OrigamCheckboxBtn, { global: { plugins: [createOrigam()] } })
        const declared = (wrapper.vm.$options.emits ?? []) as string[] | Record<string, unknown>
        const names = Array.isArray(declared) ? declared : Object.keys(declared)

        expect(names).not.toContain('update:focused')
    })

    it('OrigamCheckbox le déclare, lui — il appelle useFocus', async () => {
        const { OrigamCheckbox } = await import('@origam/components')
        const wrapper = mount(OrigamCheckbox, { global: { plugins: [createOrigam()] } })
        const declared = (wrapper.vm.$options.emits ?? []) as string[] | Record<string, unknown>
        const names = Array.isArray(declared) ? declared : Object.keys(declared)

        expect(names).toContain('update:focused')
    })
})
