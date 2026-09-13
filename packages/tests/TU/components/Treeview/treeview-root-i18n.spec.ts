// #C8 (lot mineur C2/C8/C7, 2026-09-13) — `<OrigamTreeview>` rendered the
// root `aria-label` as a hardcoded English literal when the consumer did
// not pass `ariaLabel`:
//
//   :aria-label="ariaLabel || 'File tree'"
//
// A non-English locale never touched this string. Fixed by routing the
// fallback through `useLocale().t('origam.treeview.aria_label')`, deferred
// into a `computed` (safe for ADR-005 — evaluated at render).
//
// TDD: this spec asserts the LOCALISED value renders (French included), not
// merely that an aria-label is present, and confirms the explicit
// `ariaLabel` prop still wins over the locale fallback (no regression on
// the consumer-supplied path).

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import OrigamTreeview from '@origam/components/Treeview/OrigamTreeview.vue'
import type { ITreeviewNode } from '@origam/interfaces'
import { createOrigam } from '@origam/origam'

const ITEMS: ITreeviewNode[] = [
    { id: 'leaf-1', label: 'Leaf 1' }
]

const mountTreeview = (props: Record<string, unknown> = {}, locale?: string) =>
    mount(OrigamTreeview, {
        props: { items: ITEMS, ...props } as never,
        global: { plugins: [createOrigam(locale ? { locale: { locale } } as never : undefined)] }
    })

describe('OrigamTreeview — root aria-label is localised (#C8)', () => {
    it('renders the English default via the locale key, not a bare literal bypass', () => {
        const wrapper = mountTreeview()

        expect(wrapper.attributes('aria-label')).toBe('File tree')
    })

    it('renders the French translation when the locale is fr', () => {
        const wrapper = mountTreeview({}, 'fr')

        expect(wrapper.attributes('aria-label')).toBe('Arborescence de fichiers')
    })

    it('an explicit ariaLabel prop still wins over the locale fallback', () => {
        const wrapper = mountTreeview({ ariaLabel: 'My custom tree' }, 'fr')

        expect(wrapper.attributes('aria-label')).toBe('My custom tree')
    })
})
