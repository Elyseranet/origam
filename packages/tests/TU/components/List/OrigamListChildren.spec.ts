import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { OrigamListChildren } from '@origam/components'
import { createOrigam } from '@origam/origam'
import { LIST_ITEM_TYPE } from '@origam/enums'

/*********************************************************
 * OrigamListChildren — le slot ne choisit pas la branche (critere C7)
 *
 * @description
 * `hasDivider` / `hasSubheader` testaient AUSSI la presence du slot
 * (`slots.divider || item.type === DIVIDER`). Un slot n'appartient a aucun
 * item : le fournir faisait donc matcher CHAQUE ligne. La story « Slots -
 * Divider » passait 4 items sans `type` et rendait 4 separateurs — plus
 * aucun item, plus aucun subheader (`divider` gagnant le `v-else-if`).
 *
 * @description
 * Le slot est un OVERRIDE de rendu pour les items de ce type, pas un
 * selecteur de branche. Test de mutation verifie : en restaurant le
 * `slots.divider ||`, les deux premiers `it` echouent.
 ********************************************************/

const ITEMS = [
    { title: 'Folders', type: LIST_ITEM_TYPE.SUBHEADER, props: { title: 'Folders' }, raw: null },
    { title: 'Inbox', props: { title: 'Inbox' }, raw: null },
    { title: 'Starred', props: { title: 'Starred' }, raw: null },
    { title: 'divider', type: LIST_ITEM_TYPE.DIVIDER, raw: null }
]

const mountChildren = (slots?: Record<string, string>) =>
    mount(OrigamListChildren, {
        props: { items: ITEMS } as never,
        slots,
        global: { plugins: [createOrigam()] }
    })

describe('OrigamListChildren — branch selection is driven by item.type', () => {
    it('providing a #divider slot does NOT turn every row into a divider', () => {
        const wrapper = mountChildren({ divider: '<hr data-cy="custom-divider">' })

        expect(wrapper.findAll('[data-cy="custom-divider"]')).toHaveLength(1)
        expect(wrapper.text()).toContain('Inbox')
        expect(wrapper.text()).toContain('Starred')

        wrapper.unmount()
    })

    it('providing a #subheader slot only overrides the subheader-typed row', () => {
        const wrapper = mountChildren({ subheader: '<span data-cy="custom-subheader">SH</span>' })

        expect(wrapper.findAll('[data-cy="custom-subheader"]')).toHaveLength(1)
        expect(wrapper.text()).toContain('Inbox')
        expect(wrapper.text()).toContain('Starred')

        wrapper.unmount()
    })

    it('both slots at once keep the item rows intact', () => {
        const wrapper = mountChildren({
            divider: '<hr data-cy="custom-divider">',
            subheader: '<span data-cy="custom-subheader">SH</span>'
        })

        expect(wrapper.findAll('[data-cy="custom-divider"]')).toHaveLength(1)
        expect(wrapper.findAll('[data-cy="custom-subheader"]')).toHaveLength(1)
        expect(wrapper.findAll('.origam-list-item')).toHaveLength(2)

        wrapper.unmount()
    })

    it('without any slot, typed rows still render the default divider / subheader chrome', () => {
        const wrapper = mountChildren()

        expect(wrapper.findAll('.origam-divider')).toHaveLength(1)
        expect(wrapper.findAll('.origam-list-subheader')).toHaveLength(1)
        expect(wrapper.findAll('.origam-list-item')).toHaveLength(2)

        wrapper.unmount()
    })
})
