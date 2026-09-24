// Unit tests for <OrigamInput> — `hideDetails` et la bande de messages.
//
// Pourquoi ce spec existe (#937, /why-origam) :
// `.origam-input__details` est rendue PAR DÉFAUT, même sans le moindre message.
// Elle coûte 22px (`min-height: 22px` + `padding-top`), et c'est ce blanc que
// l'on voyait sous le champ de la carte de démo — et les 70px du switch, qui
// écrasaient toute la rangée de contrôles. La réserve est volontaire : elle
// évite qu'un message d'erreur qui apparaît fasse sauter la mise en page.
//
// Le correctif côté consommateur est `hide-details="auto"`. Ce spec pin les
// TROIS états, dont celui qui répond à la crainte de la régression inverse :
// avec `auto`, la bande REVIENT dès qu'un message existe.
//
// ⛔ On assiste ici sur la PRÉSENCE DE L'ÉLÉMENT, jamais sur un style calculé :
// `min-height` passe par `var()`, que jsdom ne résout jamais (#398), et le
// `<style scoped>` du SFC n'est de toute façon pas injecté sous jsdom. La
// présence du nœud, elle, est un fait du rendu Vue, mesurable ici.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamInput from '@origam/components/Input/OrigamInput.vue'
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

function mountInput (props: Record<string, unknown> = {}) {
    return mount(OrigamInput, {
        props: props as never,
        global: { plugins: [createOrigam()] }
    })
}

const DETAILS = '.origam-input__details'

describe('OrigamInput — hideDetails', () => {
    it('par défaut, la bande de messages est réservée même sans message', () => {
        expect(mountInput().find(DETAILS).exists()).toBe(true)
    })

    it('hideDetails=true la supprime, message ou pas — donc un message deviendrait invisible', () => {
        expect(mountInput({ hideDetails: true }).find(DETAILS).exists()).toBe(false)
        expect(mountInput({ hideDetails: true, messages: ['Boom'] }).find(DETAILS).exists()).toBe(false)
    })

    it('hideDetails="auto" replie la bande quand il n\'y a rien à dire', () => {
        expect(mountInput({ hideDetails: 'auto' }).find(DETAILS).exists()).toBe(false)
    })

    it('hideDetails="auto" la RESTITUE dès qu\'un message existe — pas de message avalé', () => {
        expect(mountInput({ hideDetails: 'auto', messages: ['Boom'] }).find(DETAILS).exists()).toBe(true)
    })

    it('hideDetails="auto" la restitue aussi sur une erreur de validation', () => {
        expect(
            mountInput({ hideDetails: 'auto', error: true, errorMessages: ['Invalid value'] }).find(DETAILS).exists()
        ).toBe(true)
    })
})
