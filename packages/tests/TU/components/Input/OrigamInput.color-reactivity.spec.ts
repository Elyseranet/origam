/*********************************************************
 * OrigamInput — reactivite de color / bgColor
 *
 * @description
 * Epingle le correctif de `toRef(props.color)` vers `toRef(props, 'color')`.
 * La premiere forme passe la VALEUR a `toRef`, qui en fait un ref figé : la
 * couleur etait donc capturee une fois pour toutes a l'execution de
 * `setup()`, et plus rien ne pouvait la changer ensuite.
 * @description
 * Ni une prop modifiee apres le montage, ni une entree de theme n'atteignait
 * la racine `origam-input`. Aucun nombre de `nextTick` n'y changeait rien —
 * ce n'etait pas un probleme de timing mais de reactivite absente.
 * @description
 * Le defaut touchait aussi `OrigamDataList`, corrige en meme temps, et le
 * root `origam-input` est partage par TextField, TextareaField,
 * PasswordField, FileField, Checkbox et Radio.
 * @description
 * ⛔ Ce test doit ECHOUER si quelqu'un retablit `toRef(props.color)`. C'est
 * sa seule raison d'etre : le type-check ne distingue pas les deux formes.
 ********************************************************/

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import OrigamInput from '@origam/components/Input/OrigamInput.vue'
import { createOrigam } from '@origam/origam'

describe('OrigamInput — color / bgColor restent reactifs apres le montage', () => {
    it('changer color apres le montage change la classe utilitaire de la racine', async () => {
        const wrapper = mount(OrigamInput, {
            props: { color: 'primary' },
            global: { plugins: [createOrigam()] }
        })

        await nextTick()
        await nextTick()

        expect((wrapper.attributes('class') ?? '').match(/origam--color-\S+/)?.[0]).toBe('origam--color-primary')

        await wrapper.setProps({ color: 'danger' })
        await nextTick()
        await nextTick()

        expect((wrapper.attributes('class') ?? '').match(/origam--color-\S+/)?.[0]).toBe('origam--color-danger')
    })

    it('changer bgColor apres le montage change la classe utilitaire de la racine', async () => {
        const wrapper = mount(OrigamInput, {
            props: { bgColor: 'primary' },
            global: { plugins: [createOrigam()] }
        })

        await nextTick()
        await nextTick()

        const before = (wrapper.attributes('class') ?? '').match(/origam--bg-\S+/)?.[0]

        await wrapper.setProps({ bgColor: 'success' })
        await nextTick()
        await nextTick()

        expect((wrapper.attributes('class') ?? '').match(/origam--bg-\S+/)?.[0]).not.toBe(before)
    })
})
