// #1378 — center/circle atteignent el._ripple, par valeur objet (les modifiers de directive sont statiques en template).
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import Ripple from '@origam/directives/Ripple/ripple.directive'
import { createOrigam } from '@origam/origam'
import OrigamBtn from '@origam/components/Btn/OrigamBtn.vue'
import OrigamSelectionControl from '@origam/components/SelectionControl/OrigamSelectionControl.vue'

type TEl = HTMLElement & { _ripple?: { centered?: boolean, circle?: boolean, enabled?: boolean } }
const rippleOf = (w: { element: Element }) => (w.element as TEl)._ripple
const anyRipple = (w: { findAll: (s: string) => { element: Element }[] }) =>
    w.findAll('*').map(n => (n.element as TEl)._ripple).filter(Boolean)
const opts = { global: { plugins: [createOrigam()] } }

describe('v-ripple — center/circle (#1378)', () => {
    it('la directive lit center/circle dans la valeur objet', () => {
        const el = document.createElement('button') as TEl
        Ripple.mounted(el as never, { value: { center: true, circle: true }, modifiers: {} } as never)
        expect(el._ripple).toMatchObject({ enabled: true, centered: true, circle: true })
    })

    it('SelectionControl : ripple centré et circulaire, éteint si disabled', () => {
        const on = anyRipple(mount(OrigamSelectionControl, { ...opts, props: { type: 'checkbox', ripple: true } }))
        expect(on).toHaveLength(1)
        expect(on[0]).toMatchObject({ enabled: true, centered: true, circle: true })
        const off = anyRipple(mount(OrigamSelectionControl, { ...opts, props: { type: 'checkbox', ripple: true, disabled: true } }))
        expect(off.every(r => !r?.enabled)).toBe(true)
    })

    it('Btn : centré seulement en mode icône', () => {
        expect(rippleOf(mount(OrigamBtn, { ...opts, props: { icon: 'mdi-plus' } }))).toMatchObject({ enabled: true, centered: true })
        expect(rippleOf(mount(OrigamBtn, opts))).toMatchObject({ enabled: true })
        expect(rippleOf(mount(OrigamBtn, opts))?.centered).toBeFalsy()
        expect(rippleOf(mount(OrigamBtn, { ...opts, props: { icon: 'mdi-plus', disabled: true } }))?.enabled).toBe(false)
    })
})
