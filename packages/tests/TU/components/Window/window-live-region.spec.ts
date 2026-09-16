// Regression coverage for #474 — the `origam.carousel.aria_label.delimiter`
// locale string ("Carousel slide {0} of {1}") was translated (en + fr) but
// never read anywhere in <OrigamWindow>: no live region announced the
// active-slide change to assistive tech, only the (correctly labelled)
// prev/next buttons existed. `role="region"` / `aria-roledescription="carousel"`
// were also entirely absent from the root.
//
// This spec mounts a REAL 3-item window (not a stub, and UNCONTROLLED — no
// `modelValue`/`@update:modelValue` round-trip to fake — since OrigamWindow
// manages its own selection state internally when nothing listens for the
// update) so `group.items` / `activeIndex` are the genuine computed values.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamWindow from '@origam/components/Window/OrigamWindow.vue'
import OrigamWindowItem from '@origam/components/Window/OrigamWindowItem.vue'
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

function mountThreeSlides (props: Record<string, unknown> = {}) {
    return mount(OrigamWindow, {
        props: { continuous: true, ...props } as never,
        global: {
            plugins: [createOrigam()],
            components: { OrigamWindowItem }
        },
        slots: {
            default: `
                <origam-window-item :value="1">Slide 1</origam-window-item>
                <origam-window-item :value="2">Slide 2</origam-window-item>
                <origam-window-item :value="3">Slide 3</origam-window-item>
            `
        }
    })
}

describe('OrigamWindow — #474 carousel region + live-region slide announcement', () => {
    /*********************************************************
     * ⛔ #781 — le repère est CONDITIONNÉ au nom accessible
     *
     * @description
     * Ce test épinglait « la racine porte role="region" +
     * aria-roledescription="carousel" », sans condition. Mesuré sur
     * `develop` : la racine les portait bien, et n'avait AUCUN nom —
     * `<div class="origam-window" aria-roledescription="carousel"
     * role="region">`. Or `region` est l'un des rares rôles dont la
     * définition WAI-ARIA 1.2 marque le nom accessible comme REQUIS. Un
     * `region` anonyme n'est pas un repère qu'on peut atteindre utilement :
     * c'est une entrée sans nom dans la liste des repères, et
     * l'`aria-roledescription` qui l'accompagne décrit alors le vide.
     *
     * @description
     * Le composant applique désormais la règle de 9637961f (#747 / #660 /
     * #653) : pas de rôle que le DS ne sait pas nommer, et aucun libellé
     * inventé. Les deux tests ci-dessous remplacent l'ancien — ils
     * mesurent les DEUX branches, ce que l'ancien ne faisait pas.
     ********************************************************/
    it('ne déclare AUCUN repère tant que le consommateur ne le nomme pas', async () => {
        const wrapper = mountThreeSlides()
        await wrapper.vm.$nextTick()
        const root = wrapper.find('.origam-window')

        expect(root.attributes('role')).toBeUndefined()
        expect(root.attributes('aria-roledescription')).toBeUndefined()
    })

    it('déclare role="region" + aria-roledescription dès qu\'un aria-label arrive', async () => {
        const wrapper = mount(OrigamWindow, {
            props: { continuous: true } as never,
            attrs: { 'aria-label': 'Product gallery' },
            global: { plugins: [createOrigam()], components: { OrigamWindowItem } },
            slots: { default: '<origam-window-item :value="1">Slide 1</origam-window-item>' }
        })
        await wrapper.vm.$nextTick()
        const root = wrapper.find('.origam-window')

        expect(root.attributes('role')).toBe('region')
        // Chaîne de locale, pas une chaîne en dur : aria-roledescription est
        // LU TEL QUEL par le lecteur d'écran.
        expect(root.attributes('aria-roledescription')).toBe('carousel')
        expect(root.attributes('aria-label')).toBe('Product gallery')
    })

    it('un aria-labelledby suffit aussi — et un aria-label blanc ne suffit pas', async () => {
        const labelledBy = mount(OrigamWindow, {
            props: { continuous: true } as never,
            attrs: { 'aria-labelledby': 'gallery-heading' },
            global: { plugins: [createOrigam()], components: { OrigamWindowItem } },
            slots: { default: '<origam-window-item :value="1">Slide 1</origam-window-item>' }
        })
        await labelledBy.vm.$nextTick()
        expect(labelledBy.find('.origam-window').attributes('role')).toBe('region')

        const blank = mount(OrigamWindow, {
            props: { continuous: true } as never,
            attrs: { 'aria-label': '   ' },
            global: { plugins: [createOrigam()], components: { OrigamWindowItem } },
            slots: { default: '<origam-window-item :value="1">Slide 1</origam-window-item>' }
        })
        await blank.vm.$nextTick()
        expect(blank.find('.origam-window').attributes('role')).toBeUndefined()
    })

    it('renders a role="status" aria-live="polite" live region announcing "Carousel slide 1 of 3" on mount', async () => {
        const wrapper = mountThreeSlides()
        await wrapper.vm.$nextTick()
        const live = wrapper.find('.origam-window__live-region')
        expect(live.exists()).toBe(true)
        expect(live.attributes('role')).toBe('status')
        expect(live.attributes('aria-live')).toBe('polite')
        expect(live.text()).toBe('Carousel slide 1 of 3')
    })

    it('updates the live region to "Carousel slide 2 of 3" after clicking next', async () => {
        const wrapper = mountThreeSlides()
        await wrapper.vm.$nextTick()
        await wrapper.find('.origam-window__next').trigger('click')
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.origam-window__live-region').text()).toBe('Carousel slide 2 of 3')
    })

    it('updates the live region to "Carousel slide 3 of 3" after clicking next twice', async () => {
        const wrapper = mountThreeSlides()
        await wrapper.vm.$nextTick()
        await wrapper.find('.origam-window__next').trigger('click')
        await wrapper.vm.$nextTick()
        await wrapper.find('.origam-window__next').trigger('click')
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.origam-window__live-region').text()).toBe('Carousel slide 3 of 3')
    })

    it('updates the live region back down after clicking prev', async () => {
        const wrapper = mountThreeSlides({ modelValue: 2 })
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.origam-window__live-region').text()).toBe('Carousel slide 2 of 3')
        await wrapper.find('.origam-window__prev').trigger('click')
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.origam-window__live-region').text()).toBe('Carousel slide 1 of 3')
    })
})
