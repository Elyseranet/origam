/*
 * Runtime verification of the 8 baseline entries the catalogue-wide sweep
 * could not decide (component unmountable in isolation, or the prop was
 * outside the probed set). Part of the 30-entry random sample audit.
 *
 * Lives under `audit/` — see vitest.audit.config.ts for why these do not run
 * in the unit suite. Run with:
 *   pnpm -F @origam/tests exec vitest --run --config=vitest.audit.config.ts \
 *     audit/sample-verification.spec.ts
 */

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { createOrigam } from '@origam/origam'
import OrigamMain from '@origam/components/Main/OrigamMain.vue'
import OrigamLayout from '@origam/components/Layout/OrigamLayout.vue'
import OrigamParallax from '@origam/components/Parallax/OrigamParallax.vue'
import OrigamChartPareto from '@origam/components/Chart/OrigamChartPareto.vue'
import OrigamTranslateScale from '@origam/components/Transition/OrigamTranslateScale.vue'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((q: string) => ({
        matches: false, media: q, onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()
    }))
})

const origam = createOrigam()

function surface (Cmp: unknown, props: Record<string, unknown>, slots?: Record<string, unknown>): string {
    document.head.innerHTML = ''
    const wrapper = mount(Cmp as never, {
        props: props as never,
        slots: (slots ?? { default: () => 'x' }) as never,
        global: { plugins: [origam] }
    })
    const out = wrapper.html() + '\n/* head */\n' + document.head.innerHTML
    wrapper.unmount()
    document.head.innerHTML = ''
    return out.replace(/origam_styletag_\d+/g, 'N').replace(/(origam-[a-z-]+?)-\d+/g, '$1-N')
}

describe('sampled baseline entries — runtime confirmation', () => {
    it('OrigamMain.minHeight — declares IDimensionProps, never calls useDimension', () => {
        // OrigamMain injects the layout created by OrigamLayout (useCreateLayout),
        // so it cannot be mounted bare — that is why the catalogue sweep filed it
        // `unmountable` rather than judging it.
        const inLayout = (minHeight: number) => {
            document.head.innerHTML = ''
            const wrapper = mount(OrigamLayout, {
                slots: { default: () => h(OrigamMain, { minHeight }) },
                global: { plugins: [origam] }
            })
            const out = wrapper.html() + '\n/* head */\n' + document.head.innerHTML
            wrapper.unmount()
            document.head.innerHTML = ''
            return out.replace(/origam_styletag_\d+/g, 'N').replace(/(origam-[a-z-]+?)-\d+/g, '$1-N')
        }
        expect(inLayout(40)).toBe(inLayout(400))
    })

    it('OrigamParallax.loop — the only "loop" in the file is the word in a comment', () => {
        expect(surface(OrigamParallax, { src: '/a.jpg', loop: false }))
            .toBe(surface(OrigamParallax, { src: '/a.jpg', loop: true }))
    })

    it('OrigamChartPareto.colorScheme — has a withDefaults default and no reader', () => {
        const data = [{ label: 'a', value: 1 }, { label: 'b', value: 2 }]
        expect(surface(OrigamChartPareto, { data, colorScheme: ['#ff0000', '#00ff00'] }))
            .toBe(surface(OrigamChartPareto, { data, colorScheme: ['#0000ff', '#ffff00'] }))
    })

    it('OrigamTranslateScale.disabled — the identifier appears nowhere in the component', () => {
        expect(surface(OrigamTranslateScale, { disabled: false }))
            .toBe(surface(OrigamTranslateScale, { disabled: true }))
    })
})
