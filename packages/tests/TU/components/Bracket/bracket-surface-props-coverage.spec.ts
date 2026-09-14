// Coverage for #388 — `OrigamBracket.md`'s Props table omitted ~25 props
// that ARE wired (roundedTopLeft/TopRight/BottomLeft/BottomRight,
// borderTop/Right/Bottom/Left/Block/Inline + colors, tag, margin*/padding*,
// width/height/min*/max*, fontSize/fontWeight/letterSpacing/fontFamily/
// lineHeight). Verifying the ticket's runtime claim myself before writing
// it into the doc, rather than taking it on the ticket's word — per-corner
// rounded and per-side border.
//
// Important nuance the doc must get right (confirmed by reading the code,
// not assumed): `rounded*`/`border*`/`elevation` on `<OrigamBracket>` do NOT
// style the bracket's own root container — a code comment at
// OrigamBracket.vue's Class & Style section says so directly ("applied
// PER-MATCH via colorVars... not on the bracket root"). They're resolved by
// `bracketSurfaceVars()` into `--origam-bracket-match---*` custom
// properties set inline on the root, which cascade via normal CSS
// inheritance to every `.origam-bracket-match` card `OrigamBracketMatch.vue`
// renders (confirmed: its scoped SCSS reads the exact same var names via
// `var(--origam-bracket-match---border-{corner}-radius, …)`). `tag`,
// `margin*`/`padding*`, dimension (`width`/`height`/`min*`/`max*`) DO apply
// to the root directly (`useMargin`/`usePadding`/`useDimension` feed
// `rootStyles`/`rootClasses`). Typography
// (fontFamily/fontSize/fontWeight/letterSpacing/lineHeight) is narrower
// still: `useTypography(props, 'bracket-double-label')` only feeds the
// double-elimination section labels ("Winner Bracket" / "Loser Bracket" /
// "Grand Final" headings), not the bracket root or the match cards.

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import OrigamBracket from '@origam/components/Bracket/OrigamBracket.vue'
import { BRACKET_VARIANT } from '@origam/enums'
import type { IBracketRound } from '@origam/interfaces'
import { createOrigam } from '@origam/origam'

beforeEach(() => {
    global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as any
})

const SINGLE_ELIM_FIXTURE: IBracketRound[] = [
    {
        id: 'sf',
        title: 'Semi-final',
        matches: [
            { id: 'm1', competitorA: { id: 't1', name: 'T1' }, competitorB: { id: 'g2', name: 'G2' }, status: 'pending' }
        ]
    }
]

function mountBracket (props: Record<string, any> = {}) {
    return mount(OrigamBracket, {
        props: {
            rounds: SINGLE_ELIM_FIXTURE,
            variant: BRACKET_VARIANT.SINGLE_ELIMINATION,
            ...props
        },
        attachTo: document.body,
        global: { plugins: [createOrigam()] }
    })
}

describe('OrigamBracket — rounded*/border* style the match cards via inherited vars, not the root class list (#388 doc coverage)', () => {
    it('roundedTopLeft sets ONLY the top-left match-card radius var, not top-right', () => {
        const wrapper = mountBracket({ roundedTopLeft: '40px' })
        const style = wrapper.find('.origam-bracket').attributes('style') ?? ''
        expect(style).toContain('--origam-bracket-match---border-top-left-radius: 40px')
        expect(style).not.toContain('--origam-bracket-match---border-top-right-radius:')
        wrapper.unmount()
    })

    it('borderTop sets ONLY the top-side match-card border-width var, not left (bare number)', () => {
        const wrapper = mountBracket({ borderTop: 8 })
        const style = wrapper.find('.origam-bracket').attributes('style') ?? ''
        expect(style).toContain('--origam-bracket-match---border-top-width: 8px')
        expect(style).not.toContain('--origam-bracket-match---border-left-width:')
        wrapper.unmount()
    })

    // #482 — `resolveBracketBorderWidth` used to accept ONLY a bare number,
    // `true`/`''`, or a named rung ('thin'/'thick'): a free-form CSS-length
    // STRING like '8px' fell through to `null` and was silently dropped —
    // no error, no visibly broken render (the 1px default kept applying),
    // so nothing signalled the value was ignored. `resolveBracketRadius`
    // (the `rounded*` counterpart, same file) already accepted a free-form
    // string; width now mirrors it via the same `convertToUnit` fallback.
    it('borderTop="8px" (CSS-length STRING) sets the top-side match-card border-width var — #482', () => {
        const wrapper = mountBracket({ borderTop: '8px' })
        const style = wrapper.find('.origam-bracket').attributes('style') ?? ''
        expect(style).toContain('--origam-bracket-match---border-top-width: 8px')
        wrapper.unmount()
    })

    it('borderTopColor sets the per-side match-card border-color var', () => {
        const wrapper = mountBracket({ borderTopColor: 'success' })
        const style = wrapper.find('.origam-bracket').attributes('style') ?? ''
        expect(style).toContain('--origam-bracket-match---border-top-color:')
        wrapper.unmount()
    })

    it('tag renders the requested root element', () => {
        const wrapper = mountBracket({ tag: 'section' })
        expect(wrapper.element.tagName.toLowerCase()).toBe('section')
        wrapper.unmount()
    })

    it('width/height/margin/padding apply to the root inline style', () => {
        const wrapper = mountBracket({ width: '600px', height: '400px', margin: 16, padding: 8 })
        const style = wrapper.find('.origam-bracket').attributes('style') ?? ''
        expect(style).toContain('width: 600px')
        expect(style).toContain('height: 400px')
        wrapper.unmount()
    })
})
