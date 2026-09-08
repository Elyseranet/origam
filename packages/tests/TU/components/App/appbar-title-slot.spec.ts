import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { OrigamAppBar } from '@origam/components'
import { createOrigam } from '@origam/origam'

/*********************************************************
 * OrigamAppBar — le slot `title` (critere C7)
 *
 * @description
 * La doc (`packages/docs/components/App/OrigamAppBar.md`) et la story
 * (Variant « Slots - Title ») annoncaient toutes deux un slot `title`
 * « herite d'OrigamToolbar ». `IAppBarSlots` ne le declarait pas et le
 * template ne transmettait aucun `<template #title>` a `<origam-toolbar>`
 * (seuls `append` / `prepend` / `content` / `default` l'etaient) : le
 * contenu du slot etait purement et simplement perdu.
 *
 * @description
 * `<OrigamToolbar>` declare bien un slot `title` (`IToolbarSlots.title`),
 * il ne manquait que le relais. Test de mutation verifie : en retirant le
 * `<template #title>` du template d'OrigamAppBar, le premier `it` echoue
 * (« Custom title » absent du DOM) et le second passe au vert inverse.
 ********************************************************/
beforeEach(() => {
    class ResizeObserverStub { observe (): void {} unobserve (): void {} disconnect (): void {} }
    ;(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub

    class IntersectionObserverStub {
        observe (): void {}
        unobserve (): void {}
        disconnect (): void {}
        takeRecords (): Array<never> { return [] }
    }
    ;(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IntersectionObserverStub
})

const mountBar = (options: { props?: Record<string, unknown>, slots?: Record<string, string> } = {}) =>
    mount(OrigamAppBar, {
        props: { order: 0, ...(options.props ?? {}) } as never,
        slots: options.slots,
        attachTo: document.body,
        global: { plugins: [createOrigam()] }
    })

describe('OrigamAppBar — slot `title`', () => {
    it('renders the `title` slot content inside the toolbar title region', async () => {
        const wrapper = mountBar({ slots: { title: '<strong data-cy="custom-title">Custom title</strong>' } })
        await nextTick()

        const region = wrapper.find('.origam-toolbar__title')
        expect(region.exists()).toBe(true)
        expect(region.find('[data-cy="custom-title"]').exists()).toBe(true)
        expect(wrapper.text()).toContain('Custom title')

        wrapper.unmount()
    })

    it('the slot wins over the `title` prop, like on OrigamToolbar', async () => {
        const wrapper = mountBar({
            props: { title: 'Prop title' },
            slots: { title: '<span>Slot title</span>' }
        })
        await nextTick()

        expect(wrapper.text()).toContain('Slot title')
        expect(wrapper.text()).not.toContain('Prop title')

        wrapper.unmount()
    })

    it('without the slot, the `title` prop still renders', async () => {
        const wrapper = mountBar({ props: { title: 'Prop title' } })
        await nextTick()

        expect(wrapper.text()).toContain('Prop title')

        wrapper.unmount()
    })
})
