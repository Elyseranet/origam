/*
 * CHARACTERIZATION SPEC — pins a KNOWN, CURRENTLY-UNFIXED defect.
 *
 * ⚠️ If a test in this file FAILS, that is (probably) GOOD NEWS: someone
 * implemented the prop. Delete the corresponding assertion here and replace
 * it with a real behavioural test in the component's own spec.
 *
 * What is pinned
 * --------------
 *   ILoaderProps   loadingText                       (never read anywhere)
 *   IPositionProps top / bottom / left / right       (computed, then dropped)
 *   IChipGroupProps.filter                           (never cascades)
 *   IBorderProps.borderColor                         (emits an intent verbatim)
 *
 * RESOLVED — the 16 per-side / per-corner props
 * ---------------------------------------------
 * `marginTop|Right|Bottom|Left|Block|Inline`,
 * `paddingTop|Right|Bottom|Left|Block|Inline` and
 * `roundedTopLeft|TopRight|BottomLeft|BottomRight` were pinned here as inert
 * and are now IMPLEMENTED. Their inert assertions have been removed from this
 * file per the instruction at the top; the behavioural tests that replaced
 * them live in:
 *
 *   packages/tests/TU/composables/Commons/directional-props.composable.spec.ts
 *       — value vocabulary + the precedence grammar, at composable level
 *   packages/tests/TU/components/Card/OrigamCard.directional-props.spec.ts
 *       — the same 16 through `useStateEffect`, asserted on computed style
 *   packages/tests/TU/components/Btn/OrigamBtn.directional-props.spot-check.spec.ts
 *       — a second `useStateEffect` consumer, to prove it is not Card-specific
 *
 * The runtime-declaration assertion below is KEPT: it is what guarantees a
 * consumer can actually pass the names, independently of whether they paint.
 *
 * OrigamCard is the host because it is the strongest possible contrast: the
 * SHORTHAND forms (`margin`, `padding`, `rounded`) demonstrably paint on it,
 * so a failure to paint from the per-side form cannot be blamed on the
 * component not wiring the composable at all. The "control" block below is
 * what makes the remaining "dead" blocks meaningful — do not delete it.
 */

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createOrigam } from '@origam/origam'
import OrigamCard from '@origam/components/Card/OrigamCard.vue'
import OrigamChip from '@origam/components/Chip/OrigamChip.vue'
import OrigamChipGroup from '@origam/components/Chip/OrigamChipGroup.vue'
import { h } from 'vue'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

const origam = createOrigam()

/**
 * Rendered surface = markup + the stylesheet the component injects.
 * `OrigamCard` paints inline, but several components (`OrigamAlert`,
 * `OrigamBtn`, …) never bind `:style` and go through `useStyle()` instead —
 * comparing `wrapper.html()` alone would call every style-driven prop dead
 * on those. Both channels are captured so this helper stays reusable.
 */
function surface (props: Record<string, unknown>): string {
    document.head.innerHTML = ''
    const wrapper = mount(OrigamCard, { props: props as never, global: { plugins: [origam] } })
    const out = wrapper.html() + '\n/* head */\n' + document.head.innerHTML
    wrapper.unmount()
    document.head.innerHTML = ''
    return out.replace(/origam_styletag_\d+/g, 'N').replace(/(origam-[a-z-]+?)-\d+/g, '$1-N')
}

/**
 * The 16 per-side / per-corner names, kept as a list so the
 * runtime-declaration assertion below stays exhaustive. These are no longer
 * dead — see the "RESOLVED" note in the file header for where their
 * behavioural tests live.
 */
const DIRECTIONAL_PROPS: Array<string> = [
    'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'marginBlock', 'marginInline',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'paddingBlock', 'paddingInline',
    'roundedTopLeft', 'roundedTopRight', 'roundedBottomLeft', 'roundedBottomRight'
]

describe('CONTROL — the shorthand forms do paint (proves the harness detects a working prop)', () => {
    it.each([
        ['margin', 4, 40],
        ['padding', 4, 40],
        ['rounded', 'sm', 'xl'],
        ['border', 2, 8]
    ])('%s changes the rendered surface between two values', (prop, a, b) => {
        expect(surface({ [prop as string]: a })).not.toBe(surface({ [prop as string]: b }))
    })
})

describe('per-side / per-corner props — declared at runtime', () => {
    it('declares every one of them at runtime (so a consumer really can pass them)', () => {
        const declared = Object.keys((OrigamCard as unknown as { props: Record<string, unknown> }).props)
        for (const prop of DIRECTIONAL_PROPS) expect(declared).toContain(prop)
    })
})

describe('DEFECT — loadingText is inert', () => {
    it('loadingText is inert even with loading active', () => {
        expect(surface({ loading: true, loadingText: 'aaa' }))
            .toBe(surface({ loading: true, loadingText: 'bbb' }))
    })
})

describe('DEFECT — usePosition offsets never reach OrigamCard', () => {
    // `usePosition` DOES compute `positionStyles` from top/bottom/left/right,
    // but OrigamCard destructures `{positionClasses}` only
    // (packages/ds/src/components/Card/OrigamCard.vue:361) and drops the
    // styles. Same shape on OrigamBtn:275, OrigamSheet:97, OrigamSnackbar:162.
    it.each([['top'], ['bottom'], ['left'], ['right']])(
        '%s is ignored even with position="absolute"',
        (prop) => {
            expect(surface({ position: 'absolute', [prop]: '4px' }))
                .toBe(surface({ position: 'absolute', [prop]: '40px' }))
        }
    )
})

describe('FIXED — IChipGroupProps.filter cascades to the chips', () => {
    /*
     * Etait un DEFECT, corrige le 2026-09-01 (remarque utilisateur, ligne L55
     * du classeur d'inspection). Ces tests gardent desormais le correctif au
     * lieu de documenter le bug.
     *
     * Le piege etait un homonyme : `grep filter OrigamChipGroup.vue` renvoyait
     * 4 resultats, tous `filterProps` — l'aide de filtrage de props renvoyee
     * par `useProps`, sans aucun rapport. La prop declaree
     * (chip-group.interface.ts:18) n'etait lue nulle part.
     *
     * Qu'elle DEVAIT cascader n'etait pas une supposition : `IChipProps` porte
     * `filter` et `filterIcon` (chip.interface.ts:35-36) et `OrigamChip` rend
     * l'affordance de coche a partir d'elles. Seul l'interrupteur au niveau du
     * groupe manquait. Il est desormais dans `slotDefaults`, comme
     * color / bgColor / active / hover.
     */
    const renderGroup = (props: Record<string, unknown>) => {
        document.head.innerHTML = ''
        const wrapper = mount(OrigamChipGroup, {
            props: props as never,
            slots: { default: () => [h(OrigamChip, { value: 'a', text: 'A' }), h(OrigamChip, { value: 'b', text: 'B' })] },
            global: { plugins: [origam] }
        })
        const out = wrapper.html()
        wrapper.unmount()
        document.head.innerHTML = ''
        return out.replace(/(origam-[a-z-]+?)-\d+/g, '$1-N')
    }

    it('filter=true and filter=false render DIFFERENT chips (la prop cascade)', () => {
        expect(renderGroup({ filter: true })).not.toBe(renderGroup({ filter: false }))
    })

    it('les chips portent l affordance de filtre sous filter=true', () => {
        expect(renderGroup({ filter: true })).toContain('origam-chip--filter')
    })

    it('et ne la portent PAS sous filter=false — la cascade est bien pilotee', () => {
        expect(renderGroup({ filter: false })).not.toContain('origam-chip--filter')
    })

    it('CONTROL — the chip DOES render it when filter is set on the chip itself', () => {
        document.head.innerHTML = ''
        const wrapper = mount(OrigamChipGroup, {
            props: { modelValue: ['a'] } as never,
            slots: { default: () => [h(OrigamChip, { value: 'a', text: 'A', filter: true })] },
            global: { plugins: [origam] }
        })
        expect(wrapper.html()).toContain('origam-chip--filter')
        wrapper.unmount()
    })
})

describe('DEFECT — borderColor emits an intent verbatim instead of resolving it', () => {
    // This one is NOT an inert prop: the value reaches the stylesheet. It is
    // emitted RAW — `styles.push(\`border-color: ${borderColor}\`)`,
    // packages/ds/src/composables/Commons/border.composable.ts:122 — whereas
    // the per-side colors added by issue #215 go through
    // `resolveBorderSideColor`. A TIntent therefore produces the invalid
    // declaration `border-color: primary`, which every CSS parser discards.
    // Net effect for the user is the same as a dead prop: nothing paints.
    it('borderColor="primary" produces the invalid declaration `border-color: primary`', () => {
        expect(surface({ border: true, borderColor: 'primary' }))
            .toContain('border-color: primary')
    })

    it('CONTROL — borderTopColor resolves the SAME intent to a design token', () => {
        expect(surface({ border: true, borderTopColor: 'primary' }))
            .toContain('border-top-color: var(--origam-color__action--primary---fgSubtle)')
    })

    it('CONTROL — a raw CSS color on borderColor is emitted correctly', () => {
        expect(surface({ border: true, borderColor: '#ff0000' }))
            .toContain('border-color: #ff0000')
    })
})
