/*
 * CHARACTERIZATION SPEC — pins a KNOWN, CURRENTLY-UNFIXED defect.
 *
 * ⚠️ If a test in this file FAILS, that is (probably) GOOD NEWS: someone
 * implemented the prop. Delete the corresponding assertion here and replace
 * it with a real behavioural test in the component's own spec.
 *
 * What is pinned
 * --------------
 * Three cross-cutting `Commons` interfaces advertise a per-side / per-corner
 * surface that NO composable reads and NO component binds:
 *
 *   IMarginProps   marginTop marginRight marginBottom marginLeft
 *                  marginBlock marginInline          (only `margin` is read)
 *   IPaddingProps  paddingTop paddingRight paddingBottom paddingLeft
 *                  paddingBlock paddingInline        (only `padding` is read)
 *   IRoundedProps  roundedTopLeft roundedTopRight
 *                  roundedBottomLeft roundedBottomRight  (only `rounded`)
 *   ILoaderProps   loadingText                       (never read anywhere)
 *
 * `useMargin` / `usePadding` read `props.margin` / `props.padding` only;
 * `useRounded` receives the `rounded` value alone. The other 16 names appear
 * in `packages/ds/src/interfaces/Commons/*` and nowhere else in the library.
 *
 * OrigamCard is the host because it is the strongest possible contrast: the
 * SHORTHAND forms (`margin`, `padding`, `rounded`) demonstrably paint on it,
 * so a failure to paint from the per-side form cannot be blamed on the
 * component not wiring the composable at all. The "control" block below is
 * what makes the "dead" block meaningful — do not delete it.
 *
 * Scope of the defect (measured, see the sweep in inert-props-sweep.spec.ts):
 * 100 components declare the margin/padding names, 102 the rounded corners,
 * 14 `loadingText`; ZERO of them react to any of those props.
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

const DEAD_PROPS: Array<[string, unknown, unknown]> = [
    ['marginTop', 4, 40],
    ['marginRight', 4, 40],
    ['marginBottom', 4, 40],
    ['marginLeft', 4, 40],
    ['marginBlock', 4, 40],
    ['marginInline', 4, 40],
    ['paddingTop', 4, 40],
    ['paddingRight', 4, 40],
    ['paddingBottom', 4, 40],
    ['paddingLeft', 4, 40],
    ['paddingBlock', 4, 40],
    ['paddingInline', 4, 40],
    ['roundedTopLeft', 4, 40],
    ['roundedTopRight', 4, 40],
    ['roundedBottomLeft', 4, 40],
    ['roundedBottomRight', 4, 40]
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

describe('DEFECT — per-side / per-corner props are declared, typed, documented, and inert', () => {
    it.each(DEAD_PROPS)(
        '%s produces an identical rendered surface for two different values',
        (prop, a, b) => {
            expect(
                surface({ [prop as string]: a }),
                `\`${prop}\` now changes the render — the defect this spec pins is FIXED. `
                + 'Remove this case and write a real behavioural test for the prop.'
            ).toBe(surface({ [prop as string]: b }))
        }
    )

    it('declares every one of them at runtime (so a consumer really can pass them)', () => {
        const declared = Object.keys((OrigamCard as unknown as { props: Record<string, unknown> }).props)
        for (const [prop] of DEAD_PROPS) expect(declared).toContain(prop)
    })

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

describe('DEFECT — IChipGroupProps.filter never cascades to the chips', () => {
    /*
     * The homonym trap. `grep filter packages/ds/src/components/Chip/OrigamChipGroup.vue`
     * returns 4 hits and every one of them is `filterProps` — the unrelated
     * prop-filtering helper returned by `useProps`. The declared prop
     * (chip-group.interface.ts:18) is read nowhere.
     *
     * That it was MEANT to cascade is not a guess: `IChipProps` carries
     * `filter` and `filterIcon` (chip.interface.ts:35-36) and `OrigamChip`
     * renders the check affordance from them (OrigamChip.vue:310,339). The
     * group-level switch that would turn it on for all children was never
     * wired.
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

    it('filter=true and filter=false render the same chips', () => {
        expect(renderGroup({ filter: true })).toBe(renderGroup({ filter: false }))
    })

    it('no chip carries the filter affordance under filter=true', () => {
        expect(renderGroup({ filter: true })).not.toContain('origam-chip--filter')
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
