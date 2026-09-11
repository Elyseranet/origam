// Unit tests for <OrigamBracketRound>
//
// Strategy: mount with createOrigam() plugin. The typography surface
// (`ITypographyProps`) is wired on the BEM-child `__title` element via
// `useTypography(props, 'bracket-round-title')`. The SCSS `__title` block
// reads:
//   --origam-bracket-round-title---font-size
//   --origam-bracket-round-title---font-weight
//   --origam-bracket-round-title---letter-spacing
//
// Assertions use `style.getPropertyValue` on the `.origam-bracket-round__title`
// element — same pattern as OrigamBracket.spec.ts.
//
// ResizeObserver is re-mocked in a spec-level beforeEach because
// vi.clearAllMocks() in the global vitest.setup.ts resets it before each test.

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import OrigamBracketRound from '@origam/components/Bracket/OrigamBracketRound.vue'
import type { IBracketMatch, IBracketRound } from '@origam/interfaces'
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
// Fixtures
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Mount helper
// ---------------------------------------------------------------------------
const mountRound = (props: Record<string, any> = {}) =>
    mount(OrigamBracketRound, {
        props: {
            round: SAMPLE_ROUND,
            index: 0,
            totalRounds: 3,
            showRoundTitle: true,
            ...props
        },
        global: { plugins: [createOrigam()] }
    })

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
describe('OrigamBracketRound — rendering', () => {
    it('renders the root with class origam-bracket-round', () => {
        const wrapper = mountRound()
        expect(wrapper.find('.origam-bracket-round').exists()).toBe(true)
        wrapper.unmount()
    })

    it('renders the title heading when showRoundTitle=true', () => {
        const wrapper = mountRound({ showRoundTitle: true })
        expect(wrapper.find('.origam-bracket-round__title').exists()).toBe(true)
        wrapper.unmount()
    })

    it('does NOT render the title heading when showRoundTitle=false', () => {
        const wrapper = mountRound({ showRoundTitle: false })
        expect(wrapper.find('.origam-bracket-round__title').exists()).toBe(false)
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// Typography surface — bracket-round-title (BEM child)
// ---------------------------------------------------------------------------
// Effective props on the __title element:
//   fontSize      → --origam-bracket-round-title---font-size
//   fontWeight    → --origam-bracket-round-title---font-weight
//   letterSpacing → --origam-bracket-round-title---letter-spacing

describe('OrigamBracketRound — fontSize prop', () => {
    it('emits no font-size override when fontSize is unset', () => {
        const wrapper = mountRound()
        const title = wrapper.find('.origam-bracket-round__title').element as HTMLElement
        expect(title.style.getPropertyValue('--origam-bracket-round-title---font-size')).toBe('')
        wrapper.unmount()
    })

    it('fontSize="xl" sets --origam-bracket-round-title---font-size to the xl token', () => {
        const wrapper = mountRound({ fontSize: 'xl' })
        const title = wrapper.find('.origam-bracket-round__title').element as HTMLElement
        expect(title.style.getPropertyValue('--origam-bracket-round-title---font-size'))
            .toBe('var(--origam-font__size---xl)')
        wrapper.unmount()
    })

    it('fontSize="sm" sets --origam-bracket-round-title---font-size to the sm token', () => {
        const wrapper = mountRound({ fontSize: 'sm' })
        const title = wrapper.find('.origam-bracket-round__title').element as HTMLElement
        expect(title.style.getPropertyValue('--origam-bracket-round-title---font-size'))
            .toBe('var(--origam-font__size---sm)')
        wrapper.unmount()
    })
})

describe('OrigamBracketRound — fontWeight prop', () => {
    it('emits no font-weight override when fontWeight is unset', () => {
        const wrapper = mountRound()
        const title = wrapper.find('.origam-bracket-round__title').element as HTMLElement
        expect(title.style.getPropertyValue('--origam-bracket-round-title---font-weight')).toBe('')
        wrapper.unmount()
    })

    it('fontWeight="bold" sets --origam-bracket-round-title---font-weight to the bold token', () => {
        const wrapper = mountRound({ fontWeight: 'bold' })
        const title = wrapper.find('.origam-bracket-round__title').element as HTMLElement
        expect(title.style.getPropertyValue('--origam-bracket-round-title---font-weight'))
            .toBe('var(--origam-font__weight---bold)')
        wrapper.unmount()
    })

    it('fontWeight="semibold" sets --origam-bracket-round-title---font-weight to the semibold token', () => {
        const wrapper = mountRound({ fontWeight: 'semibold' })
        const title = wrapper.find('.origam-bracket-round__title').element as HTMLElement
        expect(title.style.getPropertyValue('--origam-bracket-round-title---font-weight'))
            .toBe('var(--origam-font__weight---semibold)')
        wrapper.unmount()
    })
})

describe('OrigamBracketRound — letterSpacing prop', () => {
    it('emits no letter-spacing override when letterSpacing is unset', () => {
        const wrapper = mountRound()
        const title = wrapper.find('.origam-bracket-round__title').element as HTMLElement
        expect(title.style.getPropertyValue('--origam-bracket-round-title---letter-spacing')).toBe('')
        wrapper.unmount()
    })

    it('letterSpacing="wide" sets --origam-bracket-round-title---letter-spacing to the wide token', () => {
        const wrapper = mountRound({ letterSpacing: 'wide' })
        const title = wrapper.find('.origam-bracket-round__title').element as HTMLElement
        expect(title.style.getPropertyValue('--origam-bracket-round-title---letter-spacing'))
            .toBe('var(--origam-font__letterSpacing---wide)')
        wrapper.unmount()
    })

    it('letterSpacing="tight" sets --origam-bracket-round-title---letter-spacing to the tight token', () => {
        const wrapper = mountRound({ letterSpacing: 'tight' })
        const title = wrapper.find('.origam-bracket-round__title').element as HTMLElement
        expect(title.style.getPropertyValue('--origam-bracket-round-title---letter-spacing'))
            .toBe('var(--origam-font__letterSpacing---tight)')
        wrapper.unmount()
    })
})

describe('OrigamBracketRound — no typography vars when props unset', () => {
    it('title has no inline style when no typography prop is provided', () => {
        const wrapper = mountRound()
        const title = wrapper.find('.origam-bracket-round__title').element as HTMLElement
        expect(title.style.getPropertyValue('--origam-bracket-round-title---font-size')).toBe('')
        expect(title.style.getPropertyValue('--origam-bracket-round-title---font-weight')).toBe('')
        expect(title.style.getPropertyValue('--origam-bracket-round-title---letter-spacing')).toBe('')
        wrapper.unmount()
    })
})
