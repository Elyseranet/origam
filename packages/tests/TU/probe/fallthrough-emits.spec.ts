import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createOrigam } from '@origam/origam'

import OrigamTextField from '../../../ds/src/components/TextField/OrigamTextField.vue'
import OrigamDatePickerField from '../../../ds/src/components/DatePickerField/OrigamDatePickerField.vue'

/*********************************************************
 * Un evenement NON declare part-il quand meme ?
 *
 * @description
 * Aucun composant du DS ne pose `inheritAttrs: false`, et la racine
 * de la plupart est un AUTRE composant. Un listener non declare
 * tombe donc dans `$attrs` et retombe sur cette racine, en cascade.
 * La question mesuree ici : un `Events - focus` / `Events - click:clear`
 * dans une story est-il un MENSONGE, ou un cablage legitime ?
 ********************************************************/
describe('fallthrough des emits non declares', () => {
    it('focus / blur atteignent le consommateur de <origam-text-field>', async () => {
        const seen: Array<string> = []
        const wrapper = mount(OrigamTextField, {
            global: {plugins: [createOrigam({})]},
            attrs: {
                onFocus: () => seen.push('focus'),
                onBlur: () => seen.push('blur')
            }
        })
        const input = wrapper.find('input')
        expect(input.exists()).toBe(true)
        await input.trigger('focus')
        await input.trigger('blur')
        expect(seen).toEqual(['focus', 'blur'])
    })

    it('click:clear atteint le consommateur de <origam-date-picker-field>', async () => {
        const seen: Array<string> = []
        const wrapper = mount(OrigamDatePickerField, {
            global: {plugins: [createOrigam({})]},
            props: {modelValue: '2026-09-08', clearable: true},
            attrs: {'onClick:clear': () => seen.push('click:clear')}
        })
        const inner = wrapper.findComponent(OrigamTextField)
        expect(inner.exists()).toBe(true)
        inner.vm.$emit('click:clear')
        await wrapper.vm.$nextTick()
        expect(seen).toEqual(['click:clear'])
    })
})
