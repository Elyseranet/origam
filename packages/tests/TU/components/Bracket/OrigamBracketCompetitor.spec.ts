// Unit tests for <OrigamBracketCompetitor> — typography surface
//
// Strategy: mount with createOrigam() plugin. The typography surface
// (`ITypographyProps`, effective props: fontSize + fontWeight) is wired via
// 4 useTypography calls with distinct prefixes, each bound to a different
// DOM element:
//
//   Prefix               | Element                          | CSS vars read
//   ---------------------|----------------------------------|---------------------------------
//   bracket-competitor   | .origam-bracket-competitor (root) | font-size, font-weight
//   bracket-seed         | .origam-bracket-competitor__seed  | font-size, font-weight
//   bracket-score        | .origam-bracket-competitor__score | font-size, font-weight
//   bracket-advantage    | .origam-bracket-competitor__advantage | font-size, font-weight
//
// Assertions use style.getPropertyValue on each target element.
// ResizeObserver is re-mocked because vi.clearAllMocks() in global setup resets it.

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import OrigamBracketCompetitor from '@origam/components/Bracket/OrigamBracketCompetitor.vue'
import type { IBracketCompetitor } from '@origam/interfaces'
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
const COMPETITOR: IBracketCompetitor = { id: 't1', name: 'T1', seed: 1 }

// ---------------------------------------------------------------------------
// Mount helper
// ---------------------------------------------------------------------------
const mountCompetitor = (props: Record<string, any> = {}) =>
    mount(OrigamBracketCompetitor, {
        props: {
            competitor: COMPETITOR,
            score: 2,
            showScore: true,
            showSeed: true,
            advantageRounds: 2,
            ...props
        },
        global: { plugins: [createOrigam()] }
    })

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
describe('OrigamBracketCompetitor — rendering', () => {
    it('renders the root with class origam-bracket-competitor', () => {
        const wrapper = mountCompetitor()
        expect(wrapper.find('.origam-bracket-competitor').exists()).toBe(true)
        wrapper.unmount()
    })

    it('renders the seed span when showSeed=true and competitor has a seed', () => {
        const wrapper = mountCompetitor({ showSeed: true })
        expect(wrapper.find('.origam-bracket-competitor__seed').exists()).toBe(true)
        wrapper.unmount()
    })

    it('renders the score span when showScore=true', () => {
        const wrapper = mountCompetitor({ showScore: true })
        expect(wrapper.find('.origam-bracket-competitor__score').exists()).toBe(true)
        wrapper.unmount()
    })

    it('renders the advantage span when advantageRounds > 0', () => {
        const wrapper = mountCompetitor({ advantageRounds: 2 })
        expect(wrapper.find('.origam-bracket-competitor__advantage').exists()).toBe(true)
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// Typography — root (bracket-competitor)
// ---------------------------------------------------------------------------
describe('OrigamBracketCompetitor — fontSize on root', () => {
    it('emits no font-size override on root when fontSize is unset', () => {
        const wrapper = mountCompetitor()
        const root = wrapper.find('.origam-bracket-competitor').element as HTMLElement
        expect(root.style.getPropertyValue('--origam-bracket-competitor---font-size')).toBe('')
        wrapper.unmount()
    })

    it('fontSize="xl" sets --origam-bracket-competitor---font-size to the xl token on root', () => {
        const wrapper = mountCompetitor({ fontSize: 'xl' })
        const root = wrapper.find('.origam-bracket-competitor').element as HTMLElement
        expect(root.style.getPropertyValue('--origam-bracket-competitor---font-size'))
            .toBe('var(--origam-font__size---xl)')
        wrapper.unmount()
    })

    it('fontSize="sm" sets --origam-bracket-competitor---font-size to the sm token on root', () => {
        const wrapper = mountCompetitor({ fontSize: 'sm' })
        const root = wrapper.find('.origam-bracket-competitor').element as HTMLElement
        expect(root.style.getPropertyValue('--origam-bracket-competitor---font-size'))
            .toBe('var(--origam-font__size---sm)')
        wrapper.unmount()
    })
})

describe('OrigamBracketCompetitor — fontWeight on root', () => {
    it('emits no font-weight override on root when fontWeight is unset', () => {
        const wrapper = mountCompetitor()
        const root = wrapper.find('.origam-bracket-competitor').element as HTMLElement
        expect(root.style.getPropertyValue('--origam-bracket-competitor---font-weight')).toBe('')
        wrapper.unmount()
    })

    it('fontWeight="bold" sets --origam-bracket-competitor---font-weight to the bold token on root', () => {
        const wrapper = mountCompetitor({ fontWeight: 'bold' })
        const root = wrapper.find('.origam-bracket-competitor').element as HTMLElement
        expect(root.style.getPropertyValue('--origam-bracket-competitor---font-weight'))
            .toBe('var(--origam-font__weight---bold)')
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// Typography — __seed (bracket-seed)
// ---------------------------------------------------------------------------
describe('OrigamBracketCompetitor — fontSize on __seed', () => {
    it('emits no font-size override on __seed when fontSize is unset', () => {
        const wrapper = mountCompetitor()
        const seed = wrapper.find('.origam-bracket-competitor__seed').element as HTMLElement
        expect(seed.style.getPropertyValue('--origam-bracket-seed---font-size')).toBe('')
        wrapper.unmount()
    })

    it('fontSize="xl" sets --origam-bracket-seed---font-size to the xl token', () => {
        const wrapper = mountCompetitor({ fontSize: 'xl' })
        const seed = wrapper.find('.origam-bracket-competitor__seed').element as HTMLElement
        expect(seed.style.getPropertyValue('--origam-bracket-seed---font-size'))
            .toBe('var(--origam-font__size---xl)')
        wrapper.unmount()
    })
})

describe('OrigamBracketCompetitor — fontWeight on __seed', () => {
    it('fontWeight="semibold" sets --origam-bracket-seed---font-weight to the semibold token', () => {
        const wrapper = mountCompetitor({ fontWeight: 'semibold' })
        const seed = wrapper.find('.origam-bracket-competitor__seed').element as HTMLElement
        expect(seed.style.getPropertyValue('--origam-bracket-seed---font-weight'))
            .toBe('var(--origam-font__weight---semibold)')
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// Typography — __score (bracket-score)
// ---------------------------------------------------------------------------
describe('OrigamBracketCompetitor — fontSize on __score', () => {
    it('emits no font-size override on __score when fontSize is unset', () => {
        const wrapper = mountCompetitor()
        const score = wrapper.find('.origam-bracket-competitor__score').element as HTMLElement
        expect(score.style.getPropertyValue('--origam-bracket-score---font-size')).toBe('')
        wrapper.unmount()
    })

    it('fontSize="xl" sets --origam-bracket-score---font-size to the xl token', () => {
        const wrapper = mountCompetitor({ fontSize: 'xl' })
        const score = wrapper.find('.origam-bracket-competitor__score').element as HTMLElement
        expect(score.style.getPropertyValue('--origam-bracket-score---font-size'))
            .toBe('var(--origam-font__size---xl)')
        wrapper.unmount()
    })
})

describe('OrigamBracketCompetitor — fontWeight on __score', () => {
    it('fontWeight="bold" sets --origam-bracket-score---font-weight to the bold token', () => {
        const wrapper = mountCompetitor({ fontWeight: 'bold' })
        const score = wrapper.find('.origam-bracket-competitor__score').element as HTMLElement
        expect(score.style.getPropertyValue('--origam-bracket-score---font-weight'))
            .toBe('var(--origam-font__weight---bold)')
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// Typography — __advantage (bracket-advantage)
// ---------------------------------------------------------------------------
describe('OrigamBracketCompetitor — fontSize on __advantage', () => {
    it('emits no font-size override on __advantage when fontSize is unset', () => {
        const wrapper = mountCompetitor()
        const adv = wrapper.find('.origam-bracket-competitor__advantage').element as HTMLElement
        expect(adv.style.getPropertyValue('--origam-bracket-advantage---font-size')).toBe('')
        wrapper.unmount()
    })

    it('fontSize="xl" sets --origam-bracket-advantage---font-size to the xl token', () => {
        const wrapper = mountCompetitor({ fontSize: 'xl' })
        const adv = wrapper.find('.origam-bracket-competitor__advantage').element as HTMLElement
        expect(adv.style.getPropertyValue('--origam-bracket-advantage---font-size'))
            .toBe('var(--origam-font__size---xl)')
        wrapper.unmount()
    })
})

describe('OrigamBracketCompetitor — fontWeight on __advantage', () => {
    it('fontWeight="regular" sets --origam-bracket-advantage---font-weight to the regular token', () => {
        const wrapper = mountCompetitor({ fontWeight: 'regular' })
        const adv = wrapper.find('.origam-bracket-competitor__advantage').element as HTMLElement
        expect(adv.style.getPropertyValue('--origam-bracket-advantage---font-weight'))
            .toBe('var(--origam-font__weight---regular)')
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// No vars emitted when props unset
// ---------------------------------------------------------------------------
describe('OrigamBracketCompetitor — no typography vars when props unset', () => {
    it('no font vars on any surface when neither fontSize nor fontWeight is provided', () => {
        const wrapper = mountCompetitor()
        const root = wrapper.find('.origam-bracket-competitor').element as HTMLElement
        const seed = wrapper.find('.origam-bracket-competitor__seed').element as HTMLElement
        const score = wrapper.find('.origam-bracket-competitor__score').element as HTMLElement
        const adv = wrapper.find('.origam-bracket-competitor__advantage').element as HTMLElement

        for (const el of [root, seed, score, adv]) {
            expect(el.style.getPropertyValue('--origam-bracket-competitor---font-size')).toBe('')
            expect(el.style.getPropertyValue('--origam-bracket-competitor---font-weight')).toBe('')
        }
        wrapper.unmount()
    })
})
