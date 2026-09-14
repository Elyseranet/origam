// #550 (critere C7) — `<OrigamTreeview>` relaie le slot `node`.
//
// MESURE AVANT CORRECTIF (meme montage, `develop` @ 925784a5) :
//   <template #node> pose sur <origam-treeview> → contenu custom rendu :
//   false, a n'importe quelle profondeur. `<OrigamTreeviewNode>` DECLARE
//   et rend `node`, et le repasse a ses enfants recursifs ; seule la
//   racine ne le transmettait pas, et `ITreeviewSlots` etait `{}`.
//
// La story « Slots - node » demontrait pourtant la fonctionnalite sur
// `<origam-treeview>`.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamTreeview from '@origam/components/Treeview/OrigamTreeview.vue'
import { createOrigam } from '@origam/origam'

const ITEMS = [
    {
        id: 'src',
        label: 'src',
        children: [
            {id: 'main', label: 'main.ts'},
            {id: 'app', label: 'App.vue'}
        ]
    },
    {id: 'readme', label: 'README.md'}
]

function mountTree (slots: Record<string, string> = {}) {
    return mount(OrigamTreeview as never, {
        props: {items: ITEMS} as never,
        slots: slots as never,
        global: {plugins: [createOrigam()]}
    })
}

describe('OrigamTreeview — slot `node` relaye (#550, C7)', () => {
    it('le contenu custom est rendu pour chaque noeud racine', () => {
        const wrapper = mountTree({node: '<i class="sonde-node">{{ params.node.label }}</i>'})

        const nodes = wrapper.findAll('.sonde-node')

        expect(nodes.length).toBeGreaterThanOrEqual(ITEMS.length)
        expect(nodes.map((n) => n.text())).toContain('README.md')
    })

    it('le scope porte le noeud, sa profondeur et son etat', () => {
        const wrapper = mountTree({
            node: '<i class="sonde-scope">{{ params.node.id }}|{{ params.depth }}|{{ params.isExpanded }}|{{ params.isSelected }}</i>'
        })

        expect(wrapper.findAll('.sonde-scope')[0].text()).toBe('src|0|false|false')
    })

    it('le relais traverse la recursion — un noeud replie ne rend pas ses enfants', async () => {
        const wrapper = mountTree({node: '<i class="sonde-node">{{ params.node.id }}</i>'})

        expect(wrapper.findAll('.sonde-node').map((n) => n.text())).toEqual(['src', 'readme'])

        await wrapper.find('[data-cy="treeview-row-src"] .origam-treeview-node__chevron').trigger('click')

        expect(wrapper.findAll('.sonde-node').map((n) => n.text())).toEqual(['src', 'main', 'app', 'readme'])
    })
})
