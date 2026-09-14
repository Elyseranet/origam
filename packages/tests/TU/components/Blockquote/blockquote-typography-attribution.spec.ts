// Regression for #387 — two independent defects in <OrigamBlockquote>,
// both proven by measurement rather than by reading the code.
//
// 1. `letterSpacing` type-checks, forwards a value into
//    `--origam-blockquote---letter-spacing` via `useTypography`, but no SCSS
//    rule in OrigamBlockquote.vue ever reads it — `getComputedStyle(el)
//    .letterSpacing` stayed 'normal' regardless of the prop. The other four
//    typography props (fontFamily/fontSize/fontWeight/lineHeight) were
//    already wired; letterSpacing was the one silent gap.
//
// 2. The attribution `<footer>` renders unconditionally on
//    `hasAttribution = hasAuthor || hasSource` — so with only `source` set
//    (no author), the dash ("— ") and the ", " separator both rendered with
//    nothing to attach to, producing an orphaned "— , LKML, 2003".

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { OrigamBlockquote } from '@origam/components'
import { createOrigam } from '@origam/origam'

function mountBq (props: Record<string, unknown> = {}) {
    return mount(OrigamBlockquote, {
        props: props as never,
        slots: { default: () => 'Talk is cheap. Show me the code.' },
        attachTo: document.body,
        global: { plugins: [createOrigam()] }
    })
}

describe('OrigamBlockquote — letterSpacing prop actually applies (#387)', () => {
    it('emits no letter-spacing override when letterSpacing is unset', () => {
        const wrapper = mountBq()
        const style = wrapper.find('.origam-blockquote').attributes('style') ?? ''
        expect(style).not.toContain('--origam-blockquote---letter-spacing:')
    })

    it('letterSpacing="wide" sets the letter-spacing var to the wide token', () => {
        const wrapper = mountBq({ letterSpacing: 'wide' })
        const style = wrapper.find('.origam-blockquote').attributes('style') ?? ''
        expect(style).toContain('--origam-blockquote---letter-spacing: var(--origam-font__letterSpacing---wide)')
    })

    // A `getComputedStyle().letterSpacing` assertion was tried here first —
    // it cannot prove anything in this environment: verified with an
    // isolated probe that jsdom's `getComputedStyle` never resolves
    // `var(...)` at all (it returns the literal unresolved string,
    // `'var(--x, normal)'`, regardless of whether the declaration comes
    // from an inline style, an injected <style>, or a scoped SFC block —
    // see jsdom/jsdom#1895). This is an environment ceiling, not something
    // the fix can satisfy. The proof that actually holds in jsdom is
    // string-level: the SCSS declares `letter-spacing:
    // var(--origam-blockquote---resolved-letter-spacing)` (confirmed by
    // reading OrigamBlockquote.vue), and the two tests above prove the
    // chain feeding that var is wired correctly end to end. A real-browser
    // screenshot/computed-style check is the way to close this gap; noting
    // the limitation explicitly rather than asserting something jsdom can't
    // verify.
})

describe('OrigamBlockquote — attribution renders no orphaned dash/separator (#387)', () => {
    it('source only (no author): renders neither the dash nor the separator', () => {
        const wrapper = mountBq({ source: 'LKML, 2003' })

        expect(wrapper.find('.origam-blockquote__dash').exists()).toBe(false)
        expect(wrapper.find('.origam-blockquote__separator').exists()).toBe(false)
        expect(wrapper.find('.origam-blockquote__source').exists()).toBe(true)
        expect(wrapper.find('.origam-blockquote__source').text()).toBe('LKML, 2003')
    })

    it('author only (no source): renders the dash but no separator', () => {
        const wrapper = mountBq({ author: 'Linus Torvalds' })

        expect(wrapper.find('.origam-blockquote__dash').exists()).toBe(true)
        expect(wrapper.find('.origam-blockquote__separator').exists()).toBe(false)
        expect(wrapper.find('.origam-blockquote__source').exists()).toBe(false)
    })

    it('author AND source: renders the dash and the separator', () => {
        const wrapper = mountBq({ author: 'Linus Torvalds', source: 'LKML, 2003' })

        expect(wrapper.find('.origam-blockquote__dash').exists()).toBe(true)
        expect(wrapper.find('.origam-blockquote__separator').exists()).toBe(true)
    })

    it('neither author nor source: no attribution footer at all', () => {
        const wrapper = mountBq()

        expect(wrapper.find('.origam-blockquote__attribution').exists()).toBe(false)
    })
})
