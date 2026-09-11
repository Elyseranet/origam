// Regression coverage for #428 — OrigamBracket -> OrigamBracketRound and
// OrigamBracketRound -> OrigamBracketMatch both forwarded `color`
// UNCONDITIONALLY. Both parents carry a hard `withDefaults({ color:
// 'primary' })`, so reading `props.color` directly NEVER produced
// `undefined` — even when the parent's own consumer never touched `color`
// at all — and an explicit passed value always outranks a theme default
// (ADR-005 precedence). The child's `theme.components[...].color` was
// therefore permanently unreachable through either forwarding point.
//
// Both directions are proven the same way #428 itself measured the bug:
// reading the resolved value directly off `vm.$.props`, which the ADR-005
// resolver patches in `beforeCreate` (after `setup()`) — so this only works
// mounted under a REAL `createOrigam()` theme, not by mutating a plain JS
// object.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamBracket from '@origam/components/Bracket/OrigamBracket.vue'
import OrigamBracketRound from '@origam/components/Bracket/OrigamBracketRound.vue'
import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/types'

const COMPETITOR_A = { id: 'c1', name: 'Team A' }
const COMPETITOR_B = { id: 'c2', name: 'Team B' }
const MATCH = { id: 'm1', competitorA: COMPETITOR_A, competitorB: COMPETITOR_B, scoreA: 2, scoreB: 1, winnerId: 'c1' }
const ROUND = { id: 'r1', title: 'Final', matches: [MATCH] }

function themedOrigam(componentName: string, componentDefaults: Record<string, unknown>) {
    const theme: IOrigamTheme = { name: 'brandx', components: { [componentName]: componentDefaults }, vars: {} }
    const origam = createOrigam({ themes: [theme] })
    origam._defaultsRef.value = origam._activeDefaultsFor('brandx', undefined)
    return origam
}

describe('OrigamBracket -> OrigamBracketRound — color forwarding (#428)', () => {
    it('the theme reaches Round when Bracket\'s own consumer never set color', () => {
        const origam = themedOrigam('origam-bracket-round', { color: 'danger' })
        const wrapper = mount(OrigamBracket, {
            props: { rounds: [ROUND] },
            global: { plugins: [origam] }
        })

        const round = wrapper.findComponent({ name: 'OrigamBracketRound' })
        expect((round.vm as any).$.props.color).toBe('danger')

        wrapper.unmount()
    })

    it('an explicit consumer color on Bracket still cascades to every round', () => {
        const wrapper = mount(OrigamBracket, {
            props: { rounds: [ROUND], color: 'success' },
            global: { plugins: [createOrigam()] }
        })

        const round = wrapper.findComponent({ name: 'OrigamBracketRound' })
        expect((round.vm as any).$.props.color).toBe('success')

        wrapper.unmount()
    })
})

describe('OrigamBracketRound -> OrigamBracketMatch — color forwarding (#428)', () => {
    it('the theme reaches Match when Round\'s own consumer never set color', () => {
        const origam = themedOrigam('origam-bracket-match', { color: 'warning' })
        const wrapper = mount(OrigamBracketRound, {
            props: { round: ROUND, index: 0, totalRounds: 1 },
            global: { plugins: [origam] }
        })

        const match = wrapper.findComponent({ name: 'OrigamBracketMatch' })
        expect((match.vm as any).$.props.color).toBe('warning')

        wrapper.unmount()
    })

    it('an explicit consumer color on Round still cascades to every match', () => {
        const wrapper = mount(OrigamBracketRound, {
            props: { round: ROUND, index: 0, totalRounds: 1, color: 'info' },
            global: { plugins: [createOrigam()] }
        })

        const match = wrapper.findComponent({ name: 'OrigamBracketMatch' })
        expect((match.vm as any).$.props.color).toBe('info')

        wrapper.unmount()
    })
})
