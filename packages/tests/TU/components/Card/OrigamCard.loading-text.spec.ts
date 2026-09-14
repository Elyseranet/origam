// `loadingText` on <OrigamCard> — verdict: cablee.
//
// Before this fix the prop was declared (through the transverse
// `ILoaderProps`) and read nowhere: the card mounted `<origam-progress>` /
// `<origam-skeleton>` for its loading state and let each of them fall back
// to its OWN default `label` (`'origam.loading'`), so two cards with two
// different `loadingText` values announced exactly the same thing.
//
// The fix binds `:label="loadingText"` on the active renderer rather than
// re-implementing a translation path in the card — both renderers already
// resolve `label` as a LOCALE KEY into their `aria-label` (`t(props.label)`).
//
// ⛔ What these tests assert on, and why. They read `aria-label` — a real
// DOM attribute — never `getComputedStyle`: under jsdom a `var()`-driven
// declaration silently resolves to a fabricated `16px` (see CLAUDE.md,
// issue #398), so a style assertion here would measure nothing.
// Mutation-checked: reverting the `:label` binding in `OrigamCard.vue`
// turns the first three assertions red.
//
// ⛔ Every read is awaited. `<OrigamProgress>` forwards to its concrete
// linear/circular child through `progressRef.value?.filterProps(props)` — a
// TEMPLATE REF, therefore `undefined` during render 1, so the child paints
// its OWN default `'origam.loading'` before the parent's value arrives on
// render 2 (the one-tick delta documented at length in
// `props.composable.ts`; measured invisible to a real browser paint, but
// perfectly visible to a synchronous `wrapper.find()`). Reading before the
// flush is how this spec first reported a working binding as broken.

import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'

import OrigamCard from '@origam/components/Card/OrigamCard.vue'
import { createOrigam } from '@origam/origam'

function mountCard (props: Record<string, unknown>) {
    return mount(OrigamCard, {
        props: props as never,
        global: { plugins: [createOrigam()] }
    })
}

/** The `aria-label` of whichever loading renderer the card mounted, read
 *  once the template-ref forwarding above has flushed. */
async function loaderLabel (wrapper: ReturnType<typeof mountCard>): Promise<string | undefined> {
    await nextTick()
    await nextTick()
    const el = wrapper.find('.origam-card__loader [aria-label]')
    return el.exists() ? el.attributes('aria-label') : undefined
}

describe('OrigamCard — loadingText reaches the loading indicator', () => {
    it('translates a custom loadingText key on the line renderer', async () => {
        const wrapper = mountCard({ loading: true, loadingText: 'origam.data_iterator.loading_text' })

        expect(await loaderLabel(wrapper)).toBe('Loading items...')
    })

    it('translates a custom loadingText key on the skeleton renderer', async () => {
        const wrapper = mountCard({
            loading: { type: 'skeleton' },
            loadingText: 'origam.data_iterator.loading_text'
        })

        expect(await loaderLabel(wrapper)).toBe('Loading items...')
    })

    it('two distinct loadingText values produce two distinct announcements', async () => {
        const a = mountCard({ loading: true, loadingText: 'origam.loading' })
        const b = mountCard({ loading: true, loadingText: 'origam.data_iterator.loading_text' })

        expect(await loaderLabel(a)).not.toBe(await loaderLabel(b))
    })

    it('falls back to the shared origam.loading key when loadingText is omitted', async () => {
        const wrapper = mountCard({ loading: true })

        expect(await loaderLabel(wrapper)).toBe('Loading...')
    })

    it('a per-instance loading={type,label} still wins over loadingText', async () => {
        const wrapper = mountCard({
            loading: { type: 'line', label: 'origam.data_iterator.loading_text' },
            loadingText: 'origam.loading'
        })

        expect(await loaderLabel(wrapper)).toBe('Loading items...')
    })

    it('announces nothing while not loading', () => {
        const wrapper = mountCard({ loadingText: 'origam.data_iterator.loading_text' })

        expect(wrapper.find('.origam-card__loader').exists()).toBe(false)
    })
})
