/*********************************************************
 * SONDE C3 — useVariant (composable « simple »)
 *
 * @description
 * Sonde de CHIFFRAGE, pas un test de la suite. Elle applique le critere C3
 * a la lettre : monter, changer la prop APRES le montage, attendre nextTick
 * (deux fois), relire la valeur rendue.
 *
 * @description
 * Le spec existant (`variant.composable.spec.ts`) est initial-state-only :
 * il monte avec une valeur et lit. Il ne prouve donc RIEN sur C3.
 ********************************************************/

import { defineComponent, h, nextTick, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { IVariantProps } from '@origam/interfaces'
import { useVariant } from '@origam/composables/Commons/variant.composable'

describe('C3 — useVariant', () => {
    it('changer variant APRES le montage change les classes rendues', async () => {
        const props = reactive<IVariantProps>({ variant: 'text' })
        let api!: ReturnType<typeof useVariant>

        const Host = defineComponent({
            name: 'OrigamBtn',
            setup () {
                api = useVariant(props)
                return () => h('div', { class: api.variantClasses.value })
            }
        })

        const wrapper = mount(Host)

        const avant = wrapper.find('div').attributes('class')
        expect(avant).toContain('origam-btn--variant-text')

        props.variant = 'tonal'
        await nextTick()
        await nextTick()

        const apres = wrapper.find('div').attributes('class')

        expect(apres).toContain('origam-btn--variant-tonal')
        expect(apres).not.toContain('origam-btn--variant-text')
    })
})
