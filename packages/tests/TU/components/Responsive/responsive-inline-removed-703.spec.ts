// #703 — the `inline` prop was REMOVED from `IResponsiveProps`, and with it
// the `.origam-responsive--inline` modifier and its two tokens.
//
// Why it went: `inline` painted `display: inline-flex`, which resolves the
// root's width shrink-to-fit. `OrigamResponsive` holds its ratio through a
// `__sizer` whose height is a `padding-block-end` expressed as a PERCENTAGE
// — percentages resolve against the WIDTH. Width auto -> 0 -> padding 0 ->
// height 0. Measured in Chromium (Histoire, one story rendering the three
// consumers side by side, aspect-ratio 16/9, parent 600px, no explicit
// width):
//
//   component           inline=false            inline=true
//   OrigamResponsive    600 x 0   sizer 337.5px  0 x 0    sizer 0px
//   OrigamImg           600 x 338 sizer 337.5px  0 x 0    sizer 0px
//   OrigamCarouselItem  600 x 500 sizer 1054.7px 0 x 500  sizer 0px
//
// All three collapse the width to 0. The prop was structurally incompatible
// with the padding-percentage ratio mechanism, not merely mis-tuned.
//
// This spec LOCKS the removal: it fails on the pre-removal tree (the prop is
// declared, the modifier class is emitted) and passes after.
//
// `wrapper.classes()` is the reliable jsdom tool here — `getComputedStyle`
// under jsdom never resolves `var()`, so asserting on `display` would
// measure a fabricated UA default (see CLAUDE.md, #398).

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamResponsive from '@origam/components/Responsive/OrigamResponsive.vue'
import OrigamImg from '@origam/components/Img/OrigamImg.vue'
import OrigamCarouselItem from '@origam/components/Carousel/OrigamCarouselItem.vue'

const INLINE_MODIFIER = 'origam-responsive--inline'

describe('#703 — `inline` is no longer part of the public API', () => {

    // The runtime props descriptor is what `theme.components` and
    // `filterProps` both read. A prop absent from it cannot be forwarded,
    // cannot be themed, and falls through to `$attrs`.
    it.each([
        ['OrigamResponsive', OrigamResponsive],
        ['OrigamImg', OrigamImg],
        ['OrigamCarouselItem', OrigamCarouselItem]
    ])('%s no longer declares `inline`', (_name, component) => {
        const props = (component as unknown as { props?: Record<string, unknown> }).props ?? {}

        expect(Object.keys(props)).not.toContain('inline')
    })

    it('OrigamResponsive emits no `.origam-responsive--inline` even when `inline` is passed', () => {
        const wrapper = mount(OrigamResponsive, {
            props: { aspectRatio: '16/9', inline: true } as never
        })

        expect(wrapper.classes()).toContain('origam-responsive')
        expect(wrapper.classes()).not.toContain(INLINE_MODIFIER)
    })

    it('OrigamImg emits no `.origam-responsive--inline` even when `inline` is passed', () => {
        const wrapper = mount(OrigamImg, {
            props: { src: 'https://example.invalid/a.png', alt: 'a', eager: true, inline: true } as never
        })

        expect(wrapper.classes()).toContain('origam-img')
        expect(wrapper.classes()).not.toContain(INLINE_MODIFIER)
    })

    // `OrigamImg` hands `<origam-responsive>` an explicit whitelist. `inline`
    // was item 3 of 11; it must be gone from the forwarded set, otherwise the
    // prop would keep travelling even with the interface cleaned.
    it('OrigamImg does not forward `inline` to OrigamResponsive', () => {
        const wrapper = mount(OrigamImg, {
            props: { src: 'https://example.invalid/a.png', alt: 'a', eager: true, inline: true } as never
        })

        const responsive = wrapper.findComponent(OrigamResponsive)

        expect(responsive.exists()).toBe(true)
        expect(Object.keys(responsive.props())).not.toContain('inline')
    })
})
