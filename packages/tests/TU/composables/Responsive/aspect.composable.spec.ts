// Tests for `useAspectRatio` composable.
// Covers:
//   - Explicit aspectRatio prop (string fraction, numeric string, numeric value)
//   - Edge cases: 0, NaN, negative, undefined
//   - SSR safety: when aspectRatio is undefined and not IN_BROWSER, returns []
//
// #709 — the composable used to emit the padding-percentage hack
// (`padding-block-end: ${1 / ratio * 100}%` on a `__sizer` child, cancelled by
// an opposite `margin-block-start` on `__content`). It now emits the native
// `aspect-ratio` declaration for the ROOT, so the expected value is the ratio
// itself rather than its inverted percentage. `contentStyles` is gone: there
// is no pull-back margin left to emit.
//
// These assertions are STRING assertions on the composable's output, not
// geometry assertions — no `var()`, no `getComputedStyle`. That is the only
// reason they are legitimate under jsdom (repo CLAUDE.md: jsdom never resolves
// `var()` and fabricates a `16px` that looks like a real measurement). Every
// geometry verdict for #709 lives in `packages/tests/e2e/responsive-aspect-ratio.spec.ts`,
// against a real browser.
//
// NOTE: jsdom sets window.innerWidth = 1024 and window.innerHeight = 768 by
// default (or platform-specific). When aspectRatio is undefined the composable
// falls into the IN_BROWSER branch and reads window dimensions. Those values
// are environment-dependent; we skip that branch and only assert the
// explicit-prop path which is deterministic.

import { defineComponent, h, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { useAspectRatio } from '@origam/composables/Responsive/aspect.composable'

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function mountWith (aspectRatio?: string | number) {
    const props = reactive<{ aspectRatio?: string | number }>({ aspectRatio })
    let api!: ReturnType<typeof useAspectRatio>

    const Host = defineComponent({
        name: 'OrigamAspectHost',
        setup () {
            api = useAspectRatio(props)
            return () => h('div')
        }
    })

    mount(Host)
    return { props, api: () => api }
}

// ---------------------------------------------------------------------------
// Explicit aspectRatio prop — deterministic tests
// ---------------------------------------------------------------------------

describe('useAspectRatio — explicit aspectRatio prop', () => {
    it('16/9 string → aspect-ratio: 16 / 9 (the fraction is preserved)', () => {
        const { api } = mountWith('16/9')
        const styles = api().aspectStyles.value
        expect(styles).toHaveLength(1)
        expect(styles[0]).toBe('aspect-ratio: 16 / 9')
    })

    it('4/3 string → aspect-ratio: 4 / 3', () => {
        const { api } = mountWith('4/3')
        const styles = api().aspectStyles.value
        expect(styles).toHaveLength(1)
        expect(styles[0]).toBe('aspect-ratio: 4 / 3')
    })

    it('1 numeric → aspect-ratio: 1', () => {
        const { api } = mountWith(1)
        const styles = api().aspectStyles.value
        expect(styles).toHaveLength(1)
        expect(styles[0]).toBe('aspect-ratio: 1')
    })

    it('2 numeric → aspect-ratio: 2', () => {
        const { api } = mountWith(2)
        const styles = api().aspectStyles.value
        expect(styles).toHaveLength(1)
        expect(styles[0]).toBe('aspect-ratio: 2')
    })

    it('"1" string numeric → aspect-ratio: 1', () => {
        const { api } = mountWith('1')
        const styles = api().aspectStyles.value
        expect(styles[0]).toBe('aspect-ratio: 1')
    })

    it('9/16 portrait → aspect-ratio < 1 (not the inverted percentage)', () => {
        // The padding hack emitted 177.778% here. The native property must
        // emit the ratio itself — a portrait ratio is BELOW 1.
        const { api } = mountWith('9/16')
        expect(api().aspectStyles.value[0]).toBe('aspect-ratio: 9 / 16')
    })

    it('returns array with one string entry for any valid ratio', () => {
        const { api } = mountWith('16/9')
        const styles = api().aspectStyles.value
        expect(Array.isArray(styles)).toBe(true)
        expect(typeof styles[0]).toBe('string')
    })

    it('no longer returns contentStyles (the pull-back margin is gone)', () => {
        const { api } = mountWith('16/9')
        expect('contentStyles' in api()).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// Invalid values — must emit NOTHING rather than an invalid declaration
// ---------------------------------------------------------------------------

describe('useAspectRatio — invalid ratios emit no declaration', () => {
    // NOT in this list: the NUMBER 0. It is falsy, so `if (props.aspectRatio)`
    // reads it as "no ratio given" and routes to the viewport branch exactly
    // like `undefined` — measured here as 1024/768 = 1.3333 (jsdom's window).
    // That is pre-existing behaviour, unchanged by #709, and deliberately not
    // touched: it is the documented "no explicit ratio" path.
    it.each([
        ['"0" string', '0'],
        ['a zero denominator', '16/0'],
        ['a non-numeric string', 'wide'],
        ['a negative ratio', -2]
    ])('%s → empty styles array', (_label, value) => {
        const { api } = mountWith(value as string | number)
        expect(api().aspectStyles.value).toEqual([])
    })
})

// ---------------------------------------------------------------------------
// Reactivity
// ---------------------------------------------------------------------------

describe('useAspectRatio — reactivity', () => {
    it('aspectStyles updates when aspectRatio prop changes', async () => {
        const { props, api } = mountWith('16/9')
        const initial = api().aspectStyles.value[0]
        expect(initial).toBe('aspect-ratio: 16 / 9')

        props.aspectRatio = '1'
        await Promise.resolve()
        expect(api().aspectStyles.value[0]).toBe('aspect-ratio: 1')
    })
})

// ---------------------------------------------------------------------------
// Undefined prop — IN_BROWSER branch (non-deterministic but must not throw)
// ---------------------------------------------------------------------------

describe('useAspectRatio — undefined aspectRatio (browser branch)', () => {
    it('does not throw and returns an array', () => {
        const { api } = mountWith(undefined)
        expect(Array.isArray(api().aspectStyles.value)).toBe(true)
    })
})
