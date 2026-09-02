// v-click-outside et v-intersect — critère C3 du classeur (« Réactivité »).
//
// Les deux directives n'avaient AUCUN hook `updated`. Vue construit un NOUVEL
// objet `binding` à chaque mise à jour : une closure enregistrée au montage
// retient le premier, donc `binding.value` y est figé pour toujours. Un
// consommateur qui échange son handler continue d'appeler l'ANCIEN, sans
// erreur ni avertissement.
//
// Le classeur retenait ces deux défauts « sur lecture du code, pas sur
// mesure » — les sondes précédentes n'avaient pas satisfait les gardes de
// `checkEvent` (ClickOutside) ni de l'observer (Intersect). Ces tests les
// mesurent : on enregistre, on échange le handler, on déclenche, et on
// regarde LEQUEL a tourné.
//
// ⚠️ Le DOM avale les exceptions levées dans un écouteur : on assert donc sur
// des compteurs `vi.fn()`, jamais sur un `throw`.
//
// ⛔ ET SURTOUT — la raison pour laquelle les sondes précédentes ont échoué et
// conclu « les gardes de checkEvent ne sont pas satisfaites » : elles le
// SONT. Le handler part dans un `setTimeout(…, 0)`
// (`clickOutside.util.ts:72`), donc une assertion synchrone juste après le
// dispatch mesure toujours zéro appel. Il faut laisser tourner la boucle
// d'événements. Ce n'était pas un problème de garde, c'était un problème
// d'asynchronisme — et la différence change le verdict.

import { beforeEach, describe, expect, it, vi } from 'vitest'

import ClickOutside from '@origam/directives/ClickOutside/clickOutside.directive'
import Intersect from '@origam/directives/Intersect/intersect.directive'

/** Binding minimal — la directive ne lit que `value`, `modifiers` et l'uid. */
const makeBinding = (value: unknown, uid = 1, modifiers: Record<string, boolean> = {}) => ({
    value,
    modifiers,
    instance: { $: { uid } }
}) as never

describe('v-click-outside — hook updated (C3)', () => {
    let el: HTMLElement

    beforeEach(() => {
        el = document.createElement('div')
        document.body.appendChild(el)
    })

    it('après échange du handler, c\'est le NOUVEAU qui est appelé', async () => {
        const oldHandler = vi.fn()
        const newHandler = vi.fn()

        ClickOutside.mounted(el, makeBinding(oldHandler))
        ClickOutside.updated!(el, makeBinding(newHandler))

        const outside = document.createElement('button')
        document.body.appendChild(outside)
        outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
        outside.dispatchEvent(new MouseEvent('click', { bubbles: true }))

        await new Promise(resolve => setTimeout(resolve, 0))

        expect(newHandler).toHaveBeenCalled()
        expect(oldHandler).not.toHaveBeenCalled()

        ClickOutside.unmounted(el, makeBinding(newHandler))
        outside.remove()
    })

    it('un clic DANS l\'élément n\'appelle aucun handler', async () => {
        const handler = vi.fn()

        ClickOutside.mounted(el, makeBinding(handler))

        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
        el.dispatchEvent(new MouseEvent('click', { bubbles: true }))

        await new Promise(resolve => setTimeout(resolve, 0))

        expect(handler).not.toHaveBeenCalled()

        ClickOutside.unmounted(el, makeBinding(handler))
    })

    it('après démontage, plus rien ne part', async () => {
        const handler = vi.fn()

        ClickOutside.mounted(el, makeBinding(handler))
        ClickOutside.unmounted(el, makeBinding(handler))

        const outside = document.createElement('button')
        document.body.appendChild(outside)
        outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
        outside.dispatchEvent(new MouseEvent('click', { bubbles: true }))

        await new Promise(resolve => setTimeout(resolve, 0))

        expect(handler).not.toHaveBeenCalled()
        outside.remove()
    })
})

describe('v-intersect — hook updated (C3)', () => {
    let el: HTMLElement
    let observerCallback: IntersectionObserverCallback | null

    beforeEach(() => {
        observerCallback = null
        el = document.createElement('div')
        document.body.appendChild(el)

        // jsdom n'implémente pas IntersectionObserver : on le remplace par un
        // double qui EXPOSE son callback, afin de déclencher une intersection
        // à la demande. C'est ce que les sondes précédentes n'avaient pas fait.
        vi.stubGlobal('IntersectionObserver', class {
            constructor (cb: IntersectionObserverCallback) {
                observerCallback = cb
            }

            observe () { /* no-op */ }
            unobserve () { /* no-op */ }
            disconnect () { /* no-op */ }
        })
    })

    const fire = (isIntersecting: boolean) => {
        observerCallback?.(
            [{ isIntersecting } as IntersectionObserverEntry],
            {} as IntersectionObserver
        )
    }

    it('après échange du handler, c\'est le NOUVEAU qui est appelé', () => {
        const oldHandler = vi.fn()
        const newHandler = vi.fn()

        Intersect.mounted(el as never, makeBinding(oldHandler))
        Intersect.updated!(el as never, makeBinding(newHandler))

        fire(true)

        expect(newHandler).toHaveBeenCalled()
        expect(oldHandler).not.toHaveBeenCalled()
    })

    it('sans mise à jour, le handler du montage reste appelé', () => {
        const handler = vi.fn()

        Intersect.mounted(el as never, makeBinding(handler))
        fire(true)

        expect(handler).toHaveBeenCalledTimes(1)
    })
})
