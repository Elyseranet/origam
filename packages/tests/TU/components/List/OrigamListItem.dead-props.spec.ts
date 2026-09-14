// Regression coverage for #436 / #440 — "OrigamListItem : deux props declarees
// et documentees n'ont AUCUN effet".
//
//   1. `color` — the interface extends IColorProps and the doc/story expose the
//      prop, but the component only ever called
//      `useBackgroundColor(toRef(props, 'bgColor'))`. The foreground channel was
//      never consumed, so `color` painted nothing. Worse, `<origam-list>` and
//      `<origam-list-group>` both FORWARD `color` down to every descendant
//      `<origam-list-item>` through their defaults provider — that forwarding
//      landed on a prop the row dropped on the floor.
//   2. `slim` — the class `.origam-list-item--slim` was emitted with no matching
//      SCSS rule anywhere. The class assertion below is the jsdom-reachable half
//      of the contract; the rendered padding is asserted in Playwright
//      (`packages/tests/e2e/list-item-dead-props.spec.ts`), because
//      `getComputedStyle` under jsdom never resolves `var()`.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamList from '@origam/components/List/OrigamList.vue'
import OrigamListItem from '@origam/components/List/OrigamListItem.vue'
import { createOrigam } from '@origam/origam'

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

function mountItem (props: Record<string, unknown> = {}) {
    return mount(OrigamListItem, {
        props: { title: 'Row', ...props } as never,
        global: { plugins: [createOrigam()] }
    })
}

describe('OrigamListItem — `color` reaches the foreground channel (#436)', () => {
    it('emits the tokenised foreground utility class for `color="primary"`', () => {
        const wrapper = mountItem({ color: 'primary' })
        expect(wrapper.classes()).toContain('origam--color-primary')
    })

    it('emits a `color:` declaration in the inline style for `color="primary"`', () => {
        // Strategy A / issue #514: on the FOREGROUND channel the inline
        // declaration is emitted alongside the class on purpose — the utility
        // (0,1,0) loses to any scoped rule, so only the inline decl paints.
        const style = mountItem({ color: 'primary' }).attributes('style') ?? ''
        expect(style).toMatch(/(^|;)\s*color:/)
    })

    it('keeps painting the background independently — `bgColor` is not regressed', () => {
        const wrapper = mountItem({ bgColor: 'primary' })
        expect(wrapper.classes()).toContain('origam--bg-primary')
    })

    it('paints both channels at once when `color` and `bgColor` differ', () => {
        const wrapper = mountItem({ color: 'success', bgColor: 'primary' })
        expect(wrapper.classes()).toContain('origam--bg-primary')
        expect(wrapper.classes()).toContain('origam--color-success')
    })

    it('a custom (non-tokenised) `color` lands in the inline style, not as a class', () => {
        const wrapper = mountItem({ color: '#ff00aa' })
        // jsdom normalises a hex literal to its rgb() form when it round-trips
        // through the style attribute — assert on the resolved colour, not on
        // the spelling that was passed in.
        expect(wrapper.attributes('style') ?? '').toContain('color: rgb(255, 0, 170)')
        expect(wrapper.classes().some((c) => c.startsWith('origam--color-'))).toBe(false)
    })

    it('a `color` forwarded by <origam-list> reaches the row it was forwarded to', () => {
        // `<origam-list>` pushes `color` down via its defaults provider. Before
        // the fix the value arrived on a prop the row never read.
        const wrapper = mount(OrigamList, {
            props: { color: 'primary', items: [{ title: 'A', value: 1 }] } as never,
            global: { plugins: [createOrigam()] }
        })
        const row = wrapper.find('.origam-list-item')
        expect(row.exists()).toBe(true)
        expect(row.classes()).toContain('origam--color-primary')
    })
})

describe('OrigamListItem — `slim` (#440)', () => {
    it('emits the `--slim` modifier class', () => {
        expect(mountItem({ slim: true }).classes()).toContain('origam-list-item--slim')
    })

    it('does not emit it when the prop is absent', () => {
        expect(mountItem().classes()).not.toContain('origam-list-item--slim')
    })
})
