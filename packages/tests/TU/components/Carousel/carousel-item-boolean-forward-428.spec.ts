// Regression coverage for #428 (case 2) — <OrigamCarouselItem> forwarded
// rounded/border/bgColor/color to <OrigamImg> via a plain
// `filterProps(props)`. All four accept a `boolean` member in their type
// union (`IResponsiveProps` -> `IBorderProps`/`IRoundedProps`,
// `IColorProps`/`IBgColorProps` -> `TColor` includes `false`), so Vue
// resolves an UNSET prop of that shape to the concrete value `false` —
// never `undefined`. `filterProps` only strips STRICT `undefined`, so it
// forwarded an explicit `false` for all four whenever CarouselItem's own
// consumer never set them, permanently outranking `theme.components
// ['origam-img']`.
//
// Read directly off `vm.$.props` (same assertion style #428 itself used to
// measure the bug) — mounted under a REAL `createOrigam()` theme, since the
// ADR-005 resolver patches `instance.props` in `beforeCreate`.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, nextTick, ref } from 'vue'

import OrigamCarouselItem from '@origam/components/Carousel/OrigamCarouselItem.vue'
import { createOrigam } from '@origam/origam'
import { ORIGAM_WINDOW_GROUP_KEY, ORIGAM_WINDOW_KEY } from '@origam/consts/Window/window.const'
import type { IOrigamTheme } from '@origam/types'

// Minimal stand-ins for the injected window/group context OrigamWindowItem
// (CarouselItem's direct child) requires to mount at all — shape-only,
// no behaviour under test here.
function stubProvide() {
    return {
        [ORIGAM_WINDOW_KEY]: {
            transition: computed(() => undefined),
            transitionCount: ref(0),
            transitionHeight: ref(undefined),
            isReversed: ref(false),
            rootRef: ref(undefined)
        },
        [ORIGAM_WINDOW_GROUP_KEY]: {
            register: () => {},
            unregister: () => {},
            select: () => {},
            selected: ref([]),
            // `<OrigamWindowItem>` (CarouselItem's direct child) gates its
            // `#default` slot behind `hasContent`/`isShown`, both derived
            // from `groupItem.isSelected` — always `false` here would mean
            // the slot (and with it `<OrigamImg>`) never renders at all.
            // This item must read as "the active one" for the DOM to have
            // anything to assert on.
            isSelected: () => true,
            prev: () => {},
            next: () => {},
            selectedClass: ref(undefined),
            items: computed(() => []),
            disabled: ref(false),
            getItemIndex: () => -1
        }
    }
}

function themedOrigam(componentDefaults: Record<string, unknown>) {
    const theme: IOrigamTheme = { name: 'brandx', components: { 'origam-img': componentDefaults }, vars: {} }
    const origam = createOrigam({ themes: [theme] })
    origam._defaultsRef.value = origam._activeDefaultsFor('brandx', undefined)
    return origam
}

// `imgProps`/`windowItemProps` (OrigamCarouselItem.vue) go through the
// template-ref-forwarding pattern documented in `props.composable.ts` —
// `origamImgRef` / `origamWindowItemRef` are `undefined` on the FIRST
// render, so the forwarded props only reach `<origam-img>` from the
// SECOND render onward. Two `nextTick()`s settle it.
const mountItem = async (origam: ReturnType<typeof createOrigam>, props: Record<string, unknown> = {}) => {
    const wrapper = mount(OrigamCarouselItem, {
        props,
        global: { plugins: [origam], provide: stubProvide() }
    })
    await nextTick()
    await nextTick()
    return wrapper
}

describe('OrigamCarouselItem -> OrigamImg — boolean-coerced prop forwarding (#428)', () => {
    it('lets rounded theme reach Img when the consumer never set it', async () => {
        const wrapper = await mountItem(themedOrigam({ rounded: 'lg' }))
        const img = wrapper.findComponent({ name: 'OrigamImg' })
        expect((img.vm as any).$.props.rounded).toBe('lg')
        wrapper.unmount()
    })

    it('lets border theme reach Img when the consumer never set it', async () => {
        const wrapper = await mountItem(themedOrigam({ border: true }))
        const img = wrapper.findComponent({ name: 'OrigamImg' })
        expect((img.vm as any).$.props.border).toBe(true)
        wrapper.unmount()
    })

    it('lets bgColor theme reach Img when the consumer never set it', async () => {
        const wrapper = await mountItem(themedOrigam({ bgColor: 'primary' }))
        const img = wrapper.findComponent({ name: 'OrigamImg' })
        expect((img.vm as any).$.props.bgColor).toBe('primary')
        wrapper.unmount()
    })

    it('lets color theme reach Img when the consumer never set it', async () => {
        const wrapper = await mountItem(themedOrigam({ color: 'success' }))
        const img = wrapper.findComponent({ name: 'OrigamImg' })
        expect((img.vm as any).$.props.color).toBe('success')
        wrapper.unmount()
    })

    it('an explicit consumer rounded value still wins over the theme', async () => {
        const wrapper = await mountItem(themedOrigam({ rounded: 'lg' }), { rounded: 'sm' })
        const img = wrapper.findComponent({ name: 'OrigamImg' })
        expect((img.vm as any).$.props.rounded).toBe('sm')
        wrapper.unmount()
    })

    it('an explicit consumer border=false still wins over a theme border=true', async () => {
        const wrapper = await mountItem(themedOrigam({ border: true }), { border: false })
        const img = wrapper.findComponent({ name: 'OrigamImg' })
        expect((img.vm as any).$.props.border).toBe(false)
        wrapper.unmount()
    })
})
