// #1013 — the Bracket restriction, asserted on the RUNTIME PROPS DESCRIPTOR.
//
// Why this spec exists rather than a grep. `IBracketProps` carries no literal
// `Omit` of its own: the `Omit<IBorderProps, …>` lives once in
// `types/Bracket/bracket.type.ts` as `TBracketBorderProps`, and the three
// Bracket interfaces either extend that (restricted) or extend `IBorderProps`
// directly (full surface). So `grep Omit` on an interface file answers
// NOTHING about whether that interface is restricted — it is the wrong
// question, and it returned 0 on a file that IS restricted.
//
// The Vue SFC compiler turns `defineProps<IXxxProps>()` into a runtime props
// descriptor whose keys are exactly the interface's resolved property set,
// `extends` chain flattened. Reading `Component.props` is therefore a direct
// observation of the restriction, immune to where the `Omit` is written, how
// it is named, or how many files it passes through.
//
// Three components, three different answers, each one measured:
//   OrigamBracket            — 0 real useBorder/useStateEffect calls, paints
//                              via bracketSurfaceVars -> inline axis REMOVED
//   OrigamBracketMatch       — same, and it is in the `unconsumed-props`
//                              EXCLUDED set, so the guard is BLIND to it:
//                              this spec is the only thing watching
//   OrigamBracketCompetitor  — calls useStateEffect, so all four edges reach
//                              useBorder -> FULL surface, must stay

import { describe, expect, it } from 'vitest'

import OrigamBracket from '@origam/components/Bracket/OrigamBracket.vue'
import OrigamBracketMatch from '@origam/components/Bracket/OrigamBracketMatch.vue'
import OrigamBracketCompetitor from '@origam/components/Bracket/OrigamBracketCompetitor.vue'

const INLINE_EDGE_PROPS = [
    'borderInlineStart',
    'borderInlineEnd',
    'borderInlineStartColor',
    'borderInlineEndColor'
] as const

const BLOCK_EDGE_PROPS = [
    'borderBlockStart',
    'borderBlockEnd',
    'borderBlockStartColor',
    'borderBlockEndColor'
] as const

function propKeys (component: unknown): Array<string> {
    const declared = (component as { props?: Record<string, unknown> }).props ?? {}

    return Object.keys(declared)
}

describe('#1013 — the Bracket restriction is scoped to measured non-consumption', () => {
    it.each([
        ['OrigamBracket', OrigamBracket],
        ['OrigamBracketMatch', OrigamBracketMatch]
    ])('%s declares the BLOCK edges and NOT the inline ones', (_label, component) => {
        const keys = propKeys(component)

        // The block edges are honoured (bracketSurfaceVars + the SCSS
        // fallback chain), so they must stay declared.
        for (const prop of BLOCK_EDGE_PROPS) expect(keys).toContain(prop)

        // The inline edges cannot be honoured through a physical fallback
        // chain, so they must be absent rather than typed-and-ignored.
        for (const prop of INLINE_EDGE_PROPS) expect(keys).not.toContain(prop)
    })

    it('⛔ OrigamBracketCompetitor keeps ALL FOUR edges — restricting by family would have deleted 4 working props', () => {
        const keys = propKeys(OrigamBracketCompetitor)

        for (const prop of [...BLOCK_EDGE_PROPS, ...INLINE_EDGE_PROPS]) {
            expect(keys).toContain(prop)
        }
    })

    it('the restriction removed ONLY those four keys — the rest of the border surface is intact', () => {
        // Guards against an Omit that drifts wider than intended. Every other
        // border prop must survive on the restricted interfaces.
        const untouched = [
            'border', 'borderColor', 'borderStyle',
            'borderTop', 'borderRight', 'borderBottom', 'borderLeft',
            'borderBlock', 'borderInline',
            'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'
        ]

        for (const component of [OrigamBracket, OrigamBracketMatch]) {
            const keys = propKeys(component)
            for (const prop of untouched) expect(keys).toContain(prop)
        }
    })
})
