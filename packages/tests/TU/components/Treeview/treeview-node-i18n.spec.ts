// #C8 (lot mineur C2/C8/C7, 2026-09-11) — `<OrigamTreeviewNode>` rendered the
// children group's accessible name as a template literal concatenating the
// English word "contents" directly onto `node.label`:
//
//   :aria-label="`${node.label} contents`"
//
// A non-English locale never touched this string — it stayed "contents" no
// matter what `createOrigam({locale})` was configured with. Fixed by routing
// through `useLocale().t('origam.treeview.node_children_aria_label', ...)`.
//
// TDD: this spec asserts the LOCALISED value renders (French included), not
// merely that an aria-label is present — a test asserting only presence
// would have stayed green before the fix too.

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import OrigamTreeview from '@origam/components/Treeview/OrigamTreeview.vue'
import type { ITreeviewNode } from '@origam/interfaces'
import { createOrigam } from '@origam/origam'

const ITEMS: ITreeviewNode[] = [
    {
        id: 'branch-1',
        label: 'Branch 1',
        children: [
            { id: 'leaf-1', label: 'Leaf 1' }
        ]
    }
]

const mountTreeview = (locale?: string) =>
    mount(OrigamTreeview, {
        props: {
            items: ITEMS,
            expandedValue: ['branch-1']
        },
        attachTo: document.body,
        global: { plugins: [createOrigam(locale ? { locale: { locale } } as never : undefined)] }
    })

describe('OrigamTreeviewNode — children group aria-label is localised (#C8)', () => {
    it('renders the English default via the locale key, not a literal', () => {
        const wrapper = mountTreeview()
        const group = wrapper.find('.origam-treeview-node__children')

        expect(group.attributes('aria-label')).toBe('Branch 1 contents')
    })

    it('renders the French translation when the locale is fr', () => {
        const wrapper = mountTreeview('fr')
        const group = wrapper.find('.origam-treeview-node__children')

        expect(group.attributes('aria-label')).toBe('Contenu de Branch 1')
    })
})
