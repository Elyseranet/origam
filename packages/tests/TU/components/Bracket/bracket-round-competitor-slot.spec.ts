// Regression for #388 — `OrigamBracketRound` never forwards a `#competitor`
// slot into the `<OrigamBracketMatch>` it renders as the default `match`
// slot content. A consumer providing `#competitor` at `OrigamBracket` level
// sees the DEFAULT `<OrigamBracketCompetitor>` row render anyway — the
// custom slot is silently discarded on this path.
//
// Already pinned by `packages/tests/e2e/bracket.spec.ts` ("competitor slot
// replaces the default row", `test.fail(...)`) — this is the same defect,
// reproduced directly against the component (no Histoire/browser needed)
// so it's covered by the fast unit suite too.

import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import OrigamBracketRound from '@origam/components/Bracket/OrigamBracketRound.vue'
import type { IBracketMatch, IBracketRound } from '@origam/interfaces'
import { createOrigam } from '@origam/origam'

beforeEach(() => {
    global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as any
})

const SAMPLE_MATCH: IBracketMatch = {
    id: 'sm1',
    competitorA: { id: 't1', name: 'T1', seed: 1 },
    competitorB: { id: 'g2', name: 'G2', seed: 4 },
    scoreA: 2,
    scoreB: 1,
    winnerId: 't1',
    status: 'completed'
}

const SAMPLE_ROUND: IBracketRound = {
    id: 'qf',
    title: 'Quarter-finals',
    matches: [SAMPLE_MATCH]
}

function mountRoundWithCompetitorSlot () {
    return mount(OrigamBracketRound, {
        props: {
            round: SAMPLE_ROUND,
            index: 0,
            totalRounds: 3
        },
        slots: {
            competitor: (scope: { side: 'A' | 'B' }) => h('div', { class: 'custom-competitor-row', 'data-cy': `custom-${scope.side}` }, scope.side)
        },
        global: { plugins: [createOrigam()] }
    })
}

describe('OrigamBracketRound — forwards the #competitor slot to OrigamBracketMatch (#388)', () => {
    it('renders the custom competitor slot content for both sides', () => {
        const wrapper = mountRoundWithCompetitorSlot()
        expect(wrapper.findAll('.custom-competitor-row')).toHaveLength(2)
        wrapper.unmount()
    })

    it('does NOT also render the default OrigamBracketCompetitor row (no duplication)', () => {
        const wrapper = mountRoundWithCompetitorSlot()
        expect(wrapper.find('.origam-bracket-competitor').exists()).toBe(false)
        wrapper.unmount()
    })

    it('without a #competitor slot, the default OrigamBracketCompetitor still renders (no regression)', () => {
        const wrapper = mount(OrigamBracketRound, {
            props: { round: SAMPLE_ROUND, index: 0, totalRounds: 3 },
            global: { plugins: [createOrigam()] }
        })
        expect(wrapper.findAll('.origam-bracket-competitor')).toHaveLength(2)
        wrapper.unmount()
    })
})
