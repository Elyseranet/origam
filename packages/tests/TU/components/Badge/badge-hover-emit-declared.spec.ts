// VAGUE 3 — critere C7 sur OrigamBadge : la story expose
// `<Variant title="Events - update:hover">`
// (packages/stories/components/stories/Badge/OrigamBadge.story.vue:146)
// alors que `IBadgeEmits extends IAdjacentEmits {}` ne declare que
// `click:prepend` et `click:append` (interfaces/Badge/badge.interface.ts:49).
//
// Badge cable pourtant un vrai survol : `useStateFlag(props, {state:'hover'})`
// avec `@mouseenter` / `@mouseleave` sur la racine. La question n'est donc
// PAS « la Variant est-elle un mensonge » mais « l'emit part-il malgre son
// absence de la declaration ». On MESURE au lieu de raisonner : Vue lit le
// gestionnaire dans `vnode.props`, ou un `onUpdate:hover` non declare
// atterrit quand meme via les attrs.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamBadge from '@origam/components/Badge/OrigamBadge.vue'
import { createOrigam } from '@origam/origam'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

describe('OrigamBadge — update:hover (C7, coherence story / API)', () => {
    it('mouseenter emet bien update:hover=true', async () => {
        const wrapper = mount(OrigamBadge as never, {
            props: {content: '3'} as never,
            global: {plugins: [createOrigam()]}
        })

        await nextTick()
        await wrapper.trigger('mouseenter')
        await nextTick()

        const emitted = wrapper.emitted('update:hover')
        expect(
            emitted,
            'la Variant « Events - update:hover » de la story serait un mensonge'
        ).toBeTruthy()
        expect(emitted?.[0]).toEqual([true])

        await wrapper.trigger('mouseleave')
        await nextTick()

        expect(wrapper.emitted('update:hover')?.[1]).toEqual([false])
    })

    it('l emit est DECLARE dans IBadgeEmits, pas seulement fonctionnel par accident', async () => {
        const wrapper = mount(OrigamBadge as never, {
            props: {content: '3'} as never,
            global: {plugins: [createOrigam()]}
        })

        await nextTick()

        // `emitsOptions` est la forme normalisee de ce que `defineEmits` a
        // declare. Un emit qui part sans y figurer fonctionne « par
        // accident » : Vue le fait AUSSI retomber en attribut natif sur la
        // racine, et l'API publique (types, doc, story) ment sur le contrat.
        const emitsOptions = (wrapper.vm.$ as unknown as {emitsOptions: Record<string, unknown> | null}).emitsOptions

        expect(
            emitsOptions && 'update:hover' in emitsOptions,
            'update:hover doit figurer dans IBadgeEmits — la story lui dedie une Variant'
        ).toBe(true)
    })
})
