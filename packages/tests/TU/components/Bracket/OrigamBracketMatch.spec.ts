// Unit tests for <OrigamBracketMatch>
//
// Context: OrigamBracket.spec.ts / OrigamBracketRound.spec.ts /
// OrigamBracketCompetitor.spec.ts exercise the bracket layout and the
// competitor row's typography surface, but nothing mounts OrigamBracketMatch
// directly and asserts on ITS OWN computed logic — the status resolution,
// winner/loser/forfeit derivation, and the live/click event wiring, all of
// which key off the BRACKET_MATCH_STATUS enum (recently re-derived from an
// enum into TBracketMatchStatus). A member-value swap there is invisible to
// the type-checker and would not be caught by any existing spec.
//
// Strategy: mount the real (non-stubbed) component with createOrigam(), and
// assert on rendered class modifiers / text / emitted events — never on the
// enum member itself.

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import OrigamBracketMatch from '@origam/components/Bracket/OrigamBracketMatch.vue'
import type { IBracketCompetitor, IBracketMatch } from '@origam/interfaces'
import { createOrigam } from '@origam/origam'

beforeEach(() => {
    global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as any
})

const COMPETITOR_A: IBracketCompetitor = { id: 't1', name: 'T1' }
const COMPETITOR_B: IBracketCompetitor = { id: 't2', name: 'T2' }

const baseMatch = (overrides: Partial<IBracketMatch> = {}): IBracketMatch => ({
    id: 'm1',
    competitorA: COMPETITOR_A,
    competitorB: COMPETITOR_B,
    ...overrides
})

const mountMatch = (matchOverrides: Partial<IBracketMatch> = {}, props: Record<string, any> = {}) =>
    mount(OrigamBracketMatch, {
        props: { match: baseMatch(matchOverrides), ...props },
        attachTo: document.body,
        global: { plugins: [createOrigam()] }
    })

// ---------------------------------------------------------------------------
// resolvedStatus — explicit `status` prop wins over `match.status`
// ---------------------------------------------------------------------------
describe('OrigamBracketMatch — resolvedStatus precedence', () => {
    it('uses match.status when no explicit status prop is passed', () => {
        const wrapper = mountMatch({ status: 'live' })
        expect(wrapper.classes()).toContain('origam-bracket-match--status-live')
        wrapper.unmount()
    })

    it('an explicit status prop overrides match.status', () => {
        const wrapper = mountMatch({ status: 'live' }, { status: 'completed' })
        expect(wrapper.classes()).toContain('origam-bracket-match--status-completed')
        expect(wrapper.classes()).not.toContain('origam-bracket-match--status-live')
        wrapper.unmount()
    })

    it('renders no status modifier / meta block when neither is set', () => {
        const wrapper = mountMatch()
        expect(wrapper.find('.origam-bracket-match__status').exists()).toBe(false)
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// statusLabel — mapping per BRACKET_MATCH_STATUS member
// ---------------------------------------------------------------------------
describe('OrigamBracketMatch — statusLabel text per status', () => {
    it.each([
        ['pending', 'TBD'],
        ['live', 'LIVE'],
        ['completed', 'Completed'],
        ['forfeited', 'Forfeit']
    ] as const)('status="%s" renders label "%s"', (status, label) => {
        const wrapper = mountMatch({ status })
        expect(wrapper.find('.origam-bracket-match__status').text()).toBe(label)
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// isLive — only true for BRACKET_MATCH_STATUS.LIVE
// ---------------------------------------------------------------------------
describe('OrigamBracketMatch — isLive', () => {
    it('shows the "Watch live" link when status=live and `to` is set', () => {
        const wrapper = mountMatch({ status: 'live' }, { to: 'https://example.com/watch' })
        expect(wrapper.find('.origam-bracket-match__watch').exists()).toBe(true)
        wrapper.unmount()
    })

    it('does NOT show the watch link for a completed match even with `to` set', () => {
        const wrapper = mountMatch({ status: 'completed' }, { to: 'https://example.com/watch' })
        expect(wrapper.find('.origam-bracket-match__watch').exists()).toBe(false)
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// isWinnerA / isWinnerB / isLoserA / isLoserB — derived from winnerId
// ---------------------------------------------------------------------------
describe('OrigamBracketMatch — winner/loser derivation', () => {
    it('marks competitorA as winner and competitorB as loser when winnerId matches A', () => {
        const wrapper = mountMatch({ winnerId: COMPETITOR_A.id })
        const rows = wrapper.findAll('.origam-bracket-match__row')
        expect(rows[0].classes()).toContain('origam-bracket-competitor--winner')
        expect(rows[1].classes()).toContain('origam-bracket-competitor--loser')
        wrapper.unmount()
    })

    it('marks competitorB as winner and competitorA as loser when winnerId matches B', () => {
        const wrapper = mountMatch({ winnerId: COMPETITOR_B.id })
        const rows = wrapper.findAll('.origam-bracket-match__row')
        expect(rows[0].classes()).toContain('origam-bracket-competitor--loser')
        expect(rows[1].classes()).toContain('origam-bracket-competitor--winner')
        wrapper.unmount()
    })

    it('neither row is winner/loser when winnerId is unset', () => {
        const wrapper = mountMatch()
        const rows = wrapper.findAll('.origam-bracket-match__row')
        for (const row of rows) {
            expect(row.classes()).not.toContain('origam-bracket-competitor--winner')
            expect(row.classes()).not.toContain('origam-bracket-competitor--loser')
        }
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// isForfeitA / isForfeitB — the LOSER of a forfeited match is flagged,
// never the winner. (Component comment: "the LOSER is the one that
// forfeited".)
// ---------------------------------------------------------------------------
describe('OrigamBracketMatch — forfeit derivation', () => {
    it('flags competitorB (the loser) as forfeit when status=forfeited and A won', () => {
        const wrapper = mountMatch({ status: 'forfeited', winnerId: COMPETITOR_A.id })
        const rows = wrapper.findAll('.origam-bracket-match__row')
        // Winner (A) must NOT carry the forfeit flag — only the loser did.
        expect(rows[0].classes()).not.toContain('origam-bracket-competitor--forfeit')
        expect(rows[1].classes()).toContain('origam-bracket-competitor--forfeit')
        wrapper.unmount()
    })

    it('flags competitorA (the loser) as forfeit when status=forfeited and B won', () => {
        const wrapper = mountMatch({ status: 'forfeited', winnerId: COMPETITOR_B.id })
        const rows = wrapper.findAll('.origam-bracket-match__row')
        expect(rows[0].classes()).toContain('origam-bracket-competitor--forfeit')
        expect(rows[1].classes()).not.toContain('origam-bracket-competitor--forfeit')
        wrapper.unmount()
    })

    it('no forfeit flag when status is not "forfeited", even with a winnerId set', () => {
        const wrapper = mountMatch({ status: 'completed', winnerId: COMPETITOR_A.id })
        const rows = wrapper.findAll('.origam-bracket-match__row')
        for (const row of rows) {
            expect(row.classes()).not.toContain('origam-bracket-competitor--forfeit')
        }
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// advantageFor — the advantage badge only applies to the matching competitor
// ---------------------------------------------------------------------------
describe('OrigamBracketMatch — advantage', () => {
    it('shows the advantage badge only on the competitor matching advantage.competitorId', () => {
        const wrapper = mountMatch({ advantage: { competitorId: COMPETITOR_A.id, rounds: 2 } })
        const rows = wrapper.findAll('.origam-bracket-match__row')
        expect(rows[0].find('.origam-bracket-competitor__advantage').exists()).toBe(true)
        expect(rows[1].find('.origam-bracket-competitor__advantage').exists()).toBe(false)
        wrapper.unmount()
    })

    it('defaults advantage rounds to 1 when rounds is unset', () => {
        const wrapper = mountMatch({ advantage: { competitorId: COMPETITOR_B.id } })
        const rows = wrapper.findAll('.origam-bracket-match__row')
        expect(rows[1].find('.origam-bracket-competitor__advantage').text()).toContain('1')
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// Click wiring — root click emits 'click' unless the click landed inside a
// competitor row (which fires its own 'competitor-click' / 'winner-click')
// ---------------------------------------------------------------------------
describe('OrigamBracketMatch — click emits', () => {
    it('emits "click" with the match payload when the card body (not a competitor row) is clicked', async () => {
        const wrapper = mountMatch()
        await wrapper.find('.origam-bracket-match__body').trigger('click')
        expect(wrapper.emitted('click')).toBeTruthy()
        const [match] = wrapper.emitted('click')![0] as [IBracketMatch]
        expect(match.id).toBe('m1')
        wrapper.unmount()
    })

    it('emits "competitor-click" with side "A" when competitorA row is clicked', async () => {
        const wrapper = mountMatch()
        const rows = wrapper.findAll('.origam-bracket-match__row')
        await rows[0].trigger('click')
        expect(wrapper.emitted('competitor-click')).toBeTruthy()
        const [competitor, , side] = wrapper.emitted('competitor-click')![0] as [IBracketCompetitor, IBracketMatch, string]
        expect(competitor.id).toBe(COMPETITOR_A.id)
        expect(side).toBe('A')
        wrapper.unmount()
    })

    it('emits "competitor-click" with side "B" when competitorB row is clicked', async () => {
        const wrapper = mountMatch()
        const rows = wrapper.findAll('.origam-bracket-match__row')
        await rows[1].trigger('click')
        const [, , side] = wrapper.emitted('competitor-click')![0] as [IBracketCompetitor, IBracketMatch, string]
        expect(side).toBe('B')
        wrapper.unmount()
    })

    it('also emits "winner-click" when the clicked competitor is the declared winner', async () => {
        const wrapper = mountMatch({ winnerId: COMPETITOR_A.id })
        const rows = wrapper.findAll('.origam-bracket-match__row')
        await rows[0].trigger('click')
        expect(wrapper.emitted('winner-click')).toBeTruthy()
        wrapper.unmount()
    })

    it('does NOT emit "winner-click" when the clicked competitor lost', async () => {
        const wrapper = mountMatch({ winnerId: COMPETITOR_A.id })
        const rows = wrapper.findAll('.origam-bracket-match__row')
        await rows[1].trigger('click')
        expect(wrapper.emitted('winner-click')).toBeFalsy()
        wrapper.unmount()
    })
})
