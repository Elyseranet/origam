// PROBE #614 — mesure AVANT tout changement. Fichier jetable.
// Question : `.origam-field__append-inner` porte-t-il ENCORE un role/tabindex
// interactif quand OrigamInlineEdit y rend Confirmer / Annuler ?
import { mount } from '@vue/test-utils'
import { describe, it } from 'vitest'
import { nextTick } from 'vue'

import OrigamInlineEdit from '@origam/components/InlineEdit/OrigamInlineEdit.vue'
import { createOrigam } from '@origam/origam'

const makeGlobal = () => ({ plugins: [createOrigam()] })

const dump = (el: Element | null, label: string) => {
    if (!el) { console.log(`  ${label}: ABSENT`); return }
    const attrs: Record<string, string> = {}
    for (const a of Array.from(el.attributes)) attrs[a.name] = a.value
    console.log(`  ${label}: <${el.tagName.toLowerCase()}>`, JSON.stringify(attrs))
}

describe('PROBE #614', () => {
    it('mode edition, showActions — attributs du conteneur appendInner', async () => {
        const wrapper = mount(OrigamInlineEdit, {
            props: { modelValue: 'coucou', showActions: true },
            attachTo: document.body,
            global: makeGlobal()
        })
        await nextTick()

        // entrer en edition
        const display = wrapper.find('[data-cy="origam-inline-edit-display"]')
        console.log('  display trouve   :', display.exists())
        await display.trigger('click')
        await nextTick(); await nextTick(); await nextTick()

        const root = wrapper.element as HTMLElement
        console.log('  --- edition ---')
        dump(root.querySelector('.origam-field__append-inner'), 'append-inner')

        const btns = root.querySelectorAll('.origam-inline-edit__action-btn')
        console.log('  boutons action   :', btns.length)
        btns.forEach((b, i) => dump(b, `  btn[${i}]`))

        // Tout ancetre interactif du bouton confirmer ?
        const confirm = root.querySelector('.origam-inline-edit__action-btn--confirm')
        let node: Element | null = confirm
        const chain: string[] = []
        while (node && node !== document.body) {
            const role = node.getAttribute('role')
            const ti = node.getAttribute('tabindex')
            chain.push(`${node.tagName.toLowerCase()}${node.className ? '.' + String(node.className).split(' ')[0] : ''}${role ? `[role=${role}]` : ''}${ti ? `[tabindex=${ti}]` : ''}`)
            node = node.parentElement
        }
        console.log('  chaine ancetres  :', chain.join(' < '))

        // Tous les elements focalisables du sous-arbre
        const focusables = root.querySelectorAll('button, input, textarea, [tabindex], [role="button"]')
        console.log('  focalisables     :', Array.from(focusables).map(f => `${f.tagName.toLowerCase()}.${String(f.className).split(' ')[0]}`).join(', '))

        wrapper.unmount()
    })
})
