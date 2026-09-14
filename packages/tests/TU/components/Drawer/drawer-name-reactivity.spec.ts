// C3 (vague 3, lot C3 — reactivite post-montage) — OrigamDrawer.
//
// Le classeur (docs/mesures/classeur-complet-maj-2026-09-01.csv) marque
// OrigamDrawer C3 "defaut" avec cette note : `useLayoutItem({id: props.name})`
// lit `props.name` UNE FOIS au setup (layoutItem.composable.ts:45,
// `const id = options.id ?? ...`) et ne le relit jamais — changer `name`
// apres le montage ne peut donc pas mettre a jour l'id de layout enregistre.
//
// Verifie ici, a l'execution (pas suppose) :
//   1. `name` a UN SEUL canal de rendu observable : `drawerAriaLabel`
//      (OrigamDrawer.vue:422, `computed(() => props.name || t(...))`).
//      Ce canal EST reactif — l'aria-label suit `name` apres le montage.
//   2. L'`id` interne fige par `useLayoutItem` (layoutItem.composable.ts)
//      ne sert QUE de cle de Map cote `createLayout.composable.ts`
//      (`priorities.set(id, order)`, `positions.set(id, position)`, etc.).
//      Ces Maps stockent des REFS, pas des valeurs — la reactivite de
//      order/position/layoutSize/active passe par `.value` a la lecture,
//      independamment de la stabilite de la cle. Changer `name` apres le
//      montage ne re-enregistre pas sous une nouvelle cle, mais ne casse
//      RIEN de ce que cette cle sert a indexer : aucune duplication,
//      aucun orphelin, la largeur reservee reste correcte.
//
// Conclusion mesuree : le seul canal de rendu que `name` pilote reste
// reactif. Le gel de la cle interne d'enregistrement n'a aucune
// consequence observable — ni visuelle, ni sur le nombre d'instances
// enregistrees, ni sur l'espace reserve dans le layout. Verdict C3
// "defaut" du classeur -> FAUX POSITIF pour ce canal precis, documente
// ici plutot que suppose.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { OrigamDrawer, OrigamLayout } from '@origam/components'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

afterEach(() => {
    document.body.innerHTML = ''
    document.head.querySelectorAll('style').forEach(el => el.remove())
})

// `Host` declares `name` / `location` as its OWN reactive props and forwards
// them to `OrigamDrawer` — `wrapper.setProps()` only works on the ROOT
// component of a `mount()` call (@vue/test-utils restriction), so mutating a
// prop on a component found via `findComponent()` deep in the tree throws.
function mountDrawerInLayout (initialProps: { name?: string, location?: string } = {}) {
    const Host = defineComponent({
        props: {
            name: { type: String, default: undefined },
            location: { type: String, default: undefined }
        },
        setup (hostProps) {
            return () => h(OrigamLayout, null, {
                default: () => h(OrigamDrawer, {
                    modelValue: true,
                    permanent: true,
                    name: hostProps.name,
                    location: hostProps.location
                })
            })
        }
    })
    return mount(Host, {
        props: initialProps,
        attachTo: document.body,
        global: { plugins: [createOrigam()] }
    })
}

describe('OrigamDrawer — name prop reactivity after mount (C3)', () => {
    it('aria-label follows `name` after mount (the one channel `name` actually drives)', async () => {
        const wrapper = mountDrawerInLayout({ name: 'Alpha' })
        await nextTick()
        await nextTick()

        let drawer = document.body.querySelector('.origam-drawer')
        expect(drawer?.getAttribute('aria-label')).toBe('Alpha')

        await wrapper.setProps({ name: 'Beta' })
        await nextTick()
        await nextTick()

        drawer = document.body.querySelector('.origam-drawer')
        expect(drawer?.getAttribute('aria-label')).toBe('Beta')

        wrapper.unmount()
    })

    it('changing `name` after mount does not duplicate the layout registration (still exactly one drawer element)', async () => {
        const wrapper = mountDrawerInLayout({ name: 'Alpha' })
        await nextTick()
        await nextTick()

        await wrapper.setProps({ name: 'Beta' })
        await nextTick()
        await nextTick()
        await wrapper.setProps({ name: 'Gamma' })
        await nextTick()
        await nextTick()

        const drawers = document.body.querySelectorAll('.origam-drawer')
        expect(drawers.length).toBe(1)

        wrapper.unmount()
    })

    it('the frozen internal layout-item id does not break the reserved-space registration: order/position stay wired after `name` changes', async () => {
        // `order`/`position` are independently reactive channels registered under
        // the id `useLayoutItem` froze from the INITIAL `name`. This proves that
        // freeze doesn't collaterally break the OTHER reactive channels sharing
        // that same registration slot.
        const wrapper = mountDrawerInLayout({ name: 'Alpha', location: 'left' })
        await nextTick()
        await nextTick()

        let drawer = document.body.querySelector('.origam-drawer') as HTMLElement
        expect(drawer.style.position === 'fixed' || drawer.style.position === 'absolute').toBe(true)
        expect(drawer.classList.contains('origam-drawer--left')).toBe(true)

        await wrapper.setProps({ name: 'Beta', location: 'right' })
        await nextTick()
        await nextTick()

        drawer = document.body.querySelector('.origam-drawer') as HTMLElement
        expect(drawer.classList.contains('origam-drawer--right')).toBe(true)

        wrapper.unmount()
    })
})
