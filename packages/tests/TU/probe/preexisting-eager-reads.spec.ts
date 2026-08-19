/********************************************************
 *  PRE-EXISTING EAGER READS — RUNTIME CONFIRMATION
 *
 *  @description
 *  Issue #363 claimed that removing `useDefaults` would break 24 components
 *  whose props are read at `setup()` level, and that the removal therefore had
 *  to come second.
 *  Static analysis says otherwise: not one of those 24 ever called
 *  `useDefaults`, so the removal cannot reach them.
 *  Their props were already unreachable by a theme before the campaign started
 *  and are equally unreachable after it, which makes them a separate defect
 *  rather than a precondition.
 *  This spec confirms that at runtime on a sample, so the claim rests on a
 *  render rather than on an AST walk.
 *  It asserts the CURRENT broken behaviour deliberately: each case is a bug
 *  worth its own ticket, and pinning it here means the day someone fixes the
 *  eager read, this spec fails and points at the ticket to close.
 ********************************************************/

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/interfaces'

import OrigamWindow from '@origam/components/Window/OrigamWindow.vue'
import OrigamDataList from '@origam/components/DataList/OrigamDataList.vue'

function mountThemed (Comp: any, name: string, props: Record<string, unknown>) {
    const theme: IOrigamTheme = { name: 'probe', components: { [name]: props }, vars: {} }
    const origam = createOrigam({ themes: [theme] })
    origam._defaultsRef.value = origam._activeDefaultsFor('probe', undefined)
    return mount(Comp, { global: { plugins: [origam] } })
}

/*
 * Each case carries its own control. "Themed markup equals unthemed markup"
 * proves nothing on its own — it reads the same whether the theme was ignored
 * or the prop simply has no visible effect. The control passes the identical
 * value EXPLICITLY and requires the markup to change, which establishes the
 * prop is observable in the first place. Only then does the themed case mean
 * the theme was dropped.
 */
function assertThemeIgnoredButPropWorks (Comp: any, name: string, props: Record<string, unknown>) {
    const plain = mount(Comp, { global: { plugins: [createOrigam({})] } }).html()
    const explicit = mount(Comp, { props, global: { plugins: [createOrigam({})] } }).html()
    const themed = mountThemed(Comp, name, props).html()

    expect(explicit, 'control: passing the prop explicitly must change the markup').not.toBe(plain)
    expect(themed, 'the themed value is dropped — it renders as if unset').toBe(plain)
}

describe('props read at setup() level never see the theme — pre-existing, unrelated to the useDefaults removal', () => {
    it('OrigamWindow drops a themed prevIcon / nextIcon', () => {
        assertThemeIgnoredButPropWorks(OrigamWindow, 'origam-window', {
            showArrows: true,
            prevIcon: 'mdi-chevron-double-left',
            nextIcon: 'mdi-chevron-double-right'
        })
    })

    it('OrigamDataList drops a themed bgColor / color', () => {
        assertThemeIgnoredButPropWorks(OrigamDataList, 'origam-data-list', { bgColor: 'primary', color: 'success' })
    })
})
