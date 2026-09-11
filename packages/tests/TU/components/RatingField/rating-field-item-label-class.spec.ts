// La regle SCSS `.origam-rating-field-item__label` existe, et le `<label>` du
// template ne portait AUCUNE classe : elle ne pouvait donc jamais matcher.
//
// ⛔ Meme motif que `origam-chip--pill`, trouve dans le meme chantier : une
// regle ecrite pour une classe que personne n'emet. Le defaut est silencieux
// dans les deux sens — ni le SCSS ni le template ne sont fautifs isolement,
// c'est leur rencontre qui n'a jamais lieu.
//
// Consequence visible ici : le `cursor: pointer` que la regle porte ne
// s'appliquait pas au label, pourtant cliquable puisqu'il est apparie a
// l'`<input>` par `for`/`id`.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'

import OrigamRatingFieldItem from '@origam/components/RatingField/OrigamRatingFieldItem.vue'
import OrigamSwitchTrack from '@origam/components/Switch/OrigamSwitchTrack.vue'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
}) as never

describe('OrigamRatingFieldItem — the <label> carries its BEM class', () => {
    it('emits origam-rating-field-item__label so the scoped rule can match', () => {
        const wrapper = mount(OrigamRatingFieldItem, {
            global: { plugins: [createOrigam()] },
            props: { name: 'rating', value: 3 } as never
        })

        const label = wrapper.find('label')

        expect(label.exists()).toBe(true)
        expect(label.classes()).toContain('origam-rating-field-item__label')
    })

    it('keeps the label/input pairing intact alongside the class', () => {
        const wrapper = mount(OrigamRatingFieldItem, {
            global: { plugins: [createOrigam()] },
            props: { name: 'rating', value: 2.5 } as never
        })

        const label = wrapper.find('label')
        const input = wrapper.find('input[type="radio"]')

        expect(label.attributes('for')).toBe('rating-2-5')
        expect(input.attributes('id')).toBe('rating-2-5')
    })
})
