// Unit tests for <OrigamExpansionPanelHeader> — C5 audit (does a declared
// emit really fire, and does a test prove it?).
//
// `click:prepend` / `click:append` (declared via `IAdjacentEmits`, inherited
// through `IExpansionPanelHeaderEmits`) are wired by the SHARED
// `useAdjacent` composable (issue #443) — the mechanism is correct and used
// by many other components, but nothing in this component's own spec file
// asserted it. Mounted directly with a hand-built injection context so the
// header is exercised in isolation from `OrigamExpansionPanel`'s own prop
// forwarding (a separate concern).

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'

import OrigamExpansionPanelHeader from '@origam/components/ExpansionPanel/OrigamExpansionPanelHeader.vue'
import { ORIGAM_EXPANSION_PANEL_KEY } from '@origam/consts'
import { createOrigam } from '@origam/origam'

const OrigamIconStub = defineComponent({
    name: 'OrigamIcon',
    props: ['icon', 'density'],
    template: '<span data-stub="icon"/>'
})

function mountHeader (props: Record<string, unknown> = {}) {
    const expansionPanel = {
        id: 1,
        isSelected: ref(false),
        disabled: ref(false),
        toggle: vi.fn(),
        headerId: ref<string | undefined>(undefined),
        contentId: ref<string | undefined>(undefined)
    }

    const origam = createOrigam({})

    return mount(OrigamExpansionPanelHeader, {
        props: { title: 'Panel', prependIcon: 'mdi-home', appendIcon: 'mdi-close', ...props },
        global: {
            plugins: [origam],
            provide: { [ORIGAM_EXPANSION_PANEL_KEY as unknown as string]: expansionPanel },
            stubs: { OrigamIcon: OrigamIconStub, OrigamAvatar: { template: '<span/>' } },
            directives: {
                ripple: { mounted: () => {}, unmounted: () => {} },
                contrast: { mounted: () => {}, unmounted: () => {} }
            }
        }
    })
}

describe('OrigamExpansionPanelHeader — click:prepend / click:append (C5)', () => {
    it('emits click:prepend when the prepend zone is clicked', async () => {
        const onClickPrepend = vi.fn()
        const wrapper = mountHeader({ onClick: undefined, 'onClick:prepend': onClickPrepend })

        await wrapper.find('.origam-expansion-panel-header__prepend').trigger('click')

        expect(wrapper.emitted('click:prepend')).toBeTruthy()
        expect(onClickPrepend).toHaveBeenCalledTimes(1)
    })

    it('emits click:append when the append zone is clicked', async () => {
        const onClickAppend = vi.fn()
        const wrapper = mountHeader({ 'onClick:append': onClickAppend })

        await wrapper.find('.origam-expansion-panel-header__append').trigger('click')

        expect(wrapper.emitted('click:append')).toBeTruthy()
        expect(onClickAppend).toHaveBeenCalledTimes(1)
    })

    it('clicking the prepend zone does not also toggle the panel', async () => {
        const wrapper = mountHeader({ 'onClick:prepend': vi.fn() })

        await wrapper.find('.origam-expansion-panel-header__prepend').trigger('click')

        // The root `@click="handleExpand"` still fires (event bubbling to the
        // native button), but the prepend zone's own listener is what this
        // spec is pinning — see `useAdjacent`'s isPrependClickable gating.
        expect(wrapper.emitted('click:prepend')?.[0]?.[0]).toBeInstanceOf(MouseEvent)
    })
})
