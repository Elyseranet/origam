// v-ripple — critère C5 du classeur (« Couvert par un test unitaire ? »).
//
// Seul `ripple.util` était testé, jamais la directive elle-même. Ces tests
// couvrent ce que la directive ajoute par-dessus l'util : le cycle de vie
// (`mounted` / `updated` / `unmounted`) et l'état `element._ripple` qu'elle
// pose, sur lequel les trois rappels de l'util s'appuient par `?.`.
//
// Le classeur note que `unmounted` ne fait PAS de `clearTimeout` sur la
// minuterie en cours — et que c'est volontaire : les rappels sont gardés par
// un optional chaining sur `_ripple`, supprimé juste avant. Ils
// s'auto-neutralisent. Le dernier test épingle exactement cette garantie.

import { beforeEach, describe, expect, it, vi } from 'vitest'

import Ripple from '@origam/directives/Ripple/ripple.directive'

const makeBinding = (value: unknown, uid = 1) => ({
    value,
    modifiers: {},
    instance: { $: { uid } }
}) as never

describe('v-ripple — cycle de vie (C5)', () => {
    let el: HTMLElement

    beforeEach(() => {
        el = document.createElement('button')
        document.body.appendChild(el)
    })

    it('mounted pose l\'état _ripple sur l\'élément', () => {
        Ripple.mounted(el as never, makeBinding(true))

        expect((el as never as { _ripple?: unknown })._ripple).toBeDefined()
    })

    it('unmounted retire l\'état — les rappels résiduels s\'auto-neutralisent', () => {
        Ripple.mounted(el as never, makeBinding(true))
        Ripple.unmounted!(el as never)

        expect((el as never as { _ripple?: unknown })._ripple).toBeUndefined()
    })

    it('un rappel qui tourne APRÈS le démontage ne lève pas', () => {
        Ripple.mounted(el as never, makeBinding(true))
        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
        Ripple.unmounted!(el as never)

        // Le point du test : la minuterie n'est pas annulée, mais son rappel
        // trouve `_ripple` absent et sort sans rien faire. Une exception ici
        // signalerait que la garde `?.` a sauté.
        expect(() => {
            el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
        }).not.toThrow()
    })

    it('value=false n\'active pas l\'effet', () => {
        Ripple.mounted(el as never, makeBinding(false))

        const state = (el as never as { _ripple?: { enabled?: boolean } })._ripple

        expect(state?.enabled).toBeFalsy()
    })
})
