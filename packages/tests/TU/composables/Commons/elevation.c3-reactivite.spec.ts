/*********************************************************
 * SONDE C3 — useElevation (composable « moyen »)
 *
 * @description
 * Sonde de CHIFFRAGE. Trois canaux a eprouver, pas un :
 *   1. la prop `elevation` elle-meme ;
 *   2. le Ref `flat` passe en second argument, qui court-circuite tout ;
 *   3. le passage rung-utilitaire -> nombre Material, qui emprunte une
 *      branche de code differente.
 *
 * @description
 * C'est la ou un composable « moyen » coute plus cher qu'un simple : la
 * reactivite n'a pas UNE entree, elle en a plusieurs, et chacune peut etre
 * figee independamment des autres.
 ********************************************************/

import { defineComponent, h, nextTick, reactive, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { IElevationProps } from '@origam/interfaces'
import { useElevation } from '@origam/composables/Commons/elevation.composable'

const monter = (initial: IElevationProps['elevation'], flat = ref(false)) => {
    const props = reactive<IElevationProps>({ elevation: initial })
    let api!: ReturnType<typeof useElevation>

    const Host = defineComponent({
        name: 'OrigamCard',
        setup () {
            api = useElevation(props, flat)
            return () => h('div', {
                class: api.elevationClasses.value,
                style: api.elevationStyles.value
            })
        }
    })

    const wrapper = mount(Host)
    return { props, flat, wrapper, cls: () => wrapper.find('div').attributes('class') ?? '' }
}

describe('C3 — useElevation', () => {
    it('canal 1 : changer elevation APRES le montage change les classes', async () => {
        const { props, cls } = monter('sm')
        expect(cls()).toContain('origam--shadow-sm')

        props.elevation = 'lg'
        await nextTick()
        await nextTick()

        expect(cls()).toContain('origam--shadow-lg')
        expect(cls()).not.toContain('origam--shadow-sm')
    })

    it('canal 2 : basculer le Ref flat APRES le montage vide les classes', async () => {
        const flat = ref(false)
        const { cls } = monter('lg', flat)
        expect(cls()).toContain('origam-card--elevated')

        flat.value = true
        await nextTick()
        await nextTick()

        expect(cls()).toBe('')
    })

    it('canal 3 : passer d un rung a un nombre Material change de branche', async () => {
        const { props, cls } = monter('xs')
        expect(cls()).toContain('origam--shadow-xs')

        props.elevation = 12
        await nextTick()
        await nextTick()

        expect(cls()).toContain('origam--shadow-lg')
    })
})
