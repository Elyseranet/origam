// Unit tests for <OrigamBracket>
//
// Strategy: we focus on the typography surface wired on the double-elimination
// __de-label BEM child. The label is only rendered when:
//   1. variant === BRACKET_VARIANT.DOUBLE_ELIMINATION
//   2. the section has a non-empty `label` string (winnersLabel / losersLabel)
//
// ResizeObserver: vi.clearAllMocks() in the global vitest.setup.ts resets the
// mock before each test, so we re-declare it in a spec-level beforeEach.

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import OrigamBracket from '@origam/components/Bracket/OrigamBracket.vue'
import { BRACKET_VARIANT } from '@origam/enums'
import type { IBracketRound } from '@origam/interfaces'
import { createOrigam } from '@origam/origam'

// ---------------------------------------------------------------------------
// ResizeObserver re-mock
// ---------------------------------------------------------------------------
beforeEach(() => {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
    })) as any
})

// ---------------------------------------------------------------------------
// Minimal double-elimination fixture — two sections with labels so __de-label
// elements are actually rendered in the DOM.
// ---------------------------------------------------------------------------
const DOUBLE_ELIM_FIXTURE: IBracketRound[] = [
    {
        id: 'wb-f',
        title: 'Winner final',
        side: 'winner',
        matches: [
            {
                id: 'wf1',
                competitorA: { id: 't1', name: 'T1' },
                competitorB: { id: 'g2', name: 'G2' },
                status: 'pending'
            }
        ]
    },
    {
        id: 'lb-f',
        title: 'Losers final',
        side: 'loser',
        matches: [
            {
                id: 'lf1',
                competitorA: { id: 'fnc', name: 'FNATIC' },
                competitorB: { id: 'tl', name: 'Team Liquid' },
                status: 'pending'
            }
        ]
    }
]

const makeGlobal = () => ({
    plugins: [createOrigam()]
})

const mountBracket = (props: Record<string, any> = {}) => {
    return mount(OrigamBracket, {
        props: {
            rounds: DOUBLE_ELIM_FIXTURE,
            variant: BRACKET_VARIANT.DOUBLE_ELIMINATION,
            winnersLabel: 'Winners bracket',
            losersLabel: 'Losers bracket',
            ...props
        },
        attachTo: document.body,
        global: makeGlobal()
    })
}

// ---------------------------------------------------------------------------
// Typography surface — __de-label (bracket-double-label)
// ---------------------------------------------------------------------------
describe('OrigamBracket — typography (double-elimination __de-label)', () => {
    it('sets --origam-bracket-double-label---font-size when fontSize prop is passed', () => {
        const wrapper = mountBracket({ fontSize: 'xl' })
        const labels = wrapper.findAll('.origam-bracket__de-label')
        expect(labels.length).toBeGreaterThan(0)
        labels.forEach(label => {
            expect((label.element as HTMLElement).style.getPropertyValue('--origam-bracket-double-label---font-size'))
                .toBe('var(--origam-font__size---xl)')
        })
        wrapper.unmount()
    })

    it('sets --origam-bracket-double-label---font-weight when fontWeight prop is passed', () => {
        const wrapper = mountBracket({ fontWeight: 'bold' })
        const labels = wrapper.findAll('.origam-bracket__de-label')
        expect(labels.length).toBeGreaterThan(0)
        labels.forEach(label => {
            expect((label.element as HTMLElement).style.getPropertyValue('--origam-bracket-double-label---font-weight'))
                .toBe('var(--origam-font__weight---bold)')
        })
        wrapper.unmount()
    })

    it('sets --origam-bracket-double-label---letter-spacing when letterSpacing prop is passed', () => {
        const wrapper = mountBracket({ letterSpacing: 'wide' })
        const labels = wrapper.findAll('.origam-bracket__de-label')
        expect(labels.length).toBeGreaterThan(0)
        labels.forEach(label => {
            expect((label.element as HTMLElement).style.getPropertyValue('--origam-bracket-double-label---letter-spacing'))
                .toBe('var(--origam-font__letterSpacing---wide)')
        })
        wrapper.unmount()
    })

    it('emits no typography vars when none of the props are set', () => {
        const wrapper = mountBracket()
        const label = wrapper.find('.origam-bracket__de-label')
        expect(label.exists()).toBe(true)
        expect((label.element as HTMLElement).style.getPropertyValue('--origam-bracket-double-label---font-size')).toBe('')
        expect((label.element as HTMLElement).style.getPropertyValue('--origam-bracket-double-label---font-weight')).toBe('')
        expect((label.element as HTMLElement).style.getPropertyValue('--origam-bracket-double-label---letter-spacing')).toBe('')
        wrapper.unmount()
    })

    it('does not render __de-label in single-elimination mode', () => {
        const wrapper = mount(OrigamBracket, {
            props: {
                rounds: [
                    {
                        id: 'final',
                        title: 'Final',
                        matches: [{ id: 'f1', competitorA: { id: 't1', name: 'T1' }, competitorB: null, status: 'pending' }]
                    }
                ],
                variant: BRACKET_VARIANT.SINGLE_ELIMINATION
            },
            attachTo: document.body,
            global: makeGlobal()
        })
        expect(wrapper.find('.origam-bracket__de-label').exists()).toBe(false)
        wrapper.unmount()
    })
})
