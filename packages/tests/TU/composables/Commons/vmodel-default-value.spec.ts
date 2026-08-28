/*********************************************************
 * #504 — `useVModel(props, 'x', props.x, …)` : le 3e argument est-il mort ?
 *
 * @description
 * Deux composables du catalogue passent la prop elle-même comme
 * `defaultValue` — `provideExpanded` (`props.expanded`) et `provideSelection`
 * (`props.modelValue`). Cet argument est évalué à l'appel, donc pendant le
 * `setup()` de l'appelant : c'est LA seule chose qui les rend « lecture
 * précoce » au sens ADR-005.
 *
 * @description
 * L'hypothèse à trancher : cet argument ne sert jamais, parce que
 * `useVModel` amorce sa valeur avec
 * `props[prop] !== undefined ? props[prop] : defaultValue`. Si c'est vrai, le
 * retirer supprime deux candidats sans rien changer.
 *
 * @description
 * ⛔ LE CAS QUI DÉCIDE EST CELUI DU THÈME, pas le cas nominal. Le résolveur
 * ADR-005 écrit APRÈS `setup()` : au moment où `defaultValue` est évalué la
 * prop vaut encore `undefined`, et la valeur du thème n'arrive qu'ensuite. Un
 * argument capturé trop tôt pourrait donc écraser le thème. C'est ce que ce
 * fichier mesure, et pas seulement le cas « une valeur est passée ».
 ********************************************************/

import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'

import { createOrigam } from '@origam/origam'
import { useVModel } from '@origam/composables/Commons/vModel.composable'

import type { IOrigamTheme } from '@origam/types'

/** Host qui passe `props.value` en 3e argument — la forme suspecte. */
const WithEagerDefault = defineComponent({
    name: 'FakeVmodelHost',
    props: {value: {type: String, default: undefined}},
    setup (props) {
        const model = useVModel(props as never, 'value' as never, (props as never as {value: string}).value as never)

        return () => h('span', String(model.value ?? 'NONE'))
    }
})

/** Host identique, sans le 3e argument. */
const WithoutDefault = defineComponent({
    name: 'FakeVmodelHost',
    props: {value: {type: String, default: undefined}},
    setup (props) {
        const model = useVModel(props as never, 'value' as never)

        return () => h('span', String(model.value ?? 'NONE'))
    }
})

const themed = (): ReturnType<typeof createOrigam> => {
    const theme: IOrigamTheme = {
        name: 'brandx',
        components: {'fake-vmodel-host': {value: 'FROM_THEME'}},
        vars: {}
    }
    const origam = createOrigam({themes: [theme]})

    origam._defaultsRef.value = origam._activeDefaultsFor('brandx', undefined)

    return origam
}

describe('#504 — les deux formes sont indiscernables', () => {
    it('aucune valeur passée : les deux rendent la même chose', () => {
        const a = mount(WithEagerDefault, {global: {plugins: [createOrigam()]}})
        const b = mount(WithoutDefault, {global: {plugins: [createOrigam()]}})

        expect(a.text()).toBe(b.text())
        a.unmount(); b.unmount()
    })

    it('une valeur passée : les deux la rendent', () => {
        const a = mount(WithEagerDefault, {global: {plugins: [createOrigam()]}, props: {value: 'PASSED'}})
        const b = mount(WithoutDefault, {global: {plugins: [createOrigam()]}, props: {value: 'PASSED'}})

        expect(a.text()).toBe('PASSED')
        expect(b.text()).toBe('PASSED')
        a.unmount(); b.unmount()
    })

    /*********************************************************
     * ⛔ LE CAS DÉCISIF
     *
     * @description
     * Le thème écrit la prop après `setup()`. Si le 3e argument comptait, la
     * forme suspecte figerait `undefined` et perdrait la valeur du thème.
     ********************************************************/
    it('sous un thème : la valeur thématisée arrive dans les DEUX formes', () => {
        const a = mount(WithEagerDefault, {global: {plugins: [themed()]}})
        const b = mount(WithoutDefault, {global: {plugins: [themed()]}})

        expect(b.text()).toBe('FROM_THEME')
        expect(a.text()).toBe(b.text())
        a.unmount(); b.unmount()
    })
})
