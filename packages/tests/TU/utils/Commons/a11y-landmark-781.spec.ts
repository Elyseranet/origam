/*********************************************************
 * #781 — `warnMissingLandmarkName` : ce que le DS dit quand il se tait
 *
 * @description
 * Retirer `role="region"` d'une racine anonyme n'est acceptable que si le
 * développeur APPREND pourquoi et comment le récupérer. C'est le contrat que
 * 9637961f a posé pour `useAccessibleCommand` / `useIconAccessibility` : pas
 * de libellé inventé, un avertissement de développement qui nomme le canal
 * exact. Ce fichier vérifie les deux moitiés du contrat — l'avertissement
 * part, et il ne part qu'UNE fois.
 *
 * @description
 * ⛔ Fichier dédié, et ce n'est pas un caprice d'organisation : la
 * déduplication se fait dans un `Set` privé au module, donc le deuxième
 * montage anonyme de N'IMPORTE quel spec du même fichier n'avertirait plus.
 * Vitest isole le graphe de modules par FICHIER de test — c'est ce qui rend
 * l'assertion « exactement une fois » mesurable ici et nulle part ailleurs.
 ********************************************************/

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamWindow from '@origam/components/Window/OrigamWindow.vue'
import OrigamWindowItem from '@origam/components/Window/OrigamWindowItem.vue'
import { createOrigam } from '@origam/origam'
import { warnMissingLandmarkName } from '@origam/utils/Commons/a11y.util'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
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

const mountWindow = (attrs: Record<string, unknown> = {}) =>
    mount(OrigamWindow, {
        props: { continuous: true } as never,
        attrs,
        global: { plugins: [createOrigam()], components: { OrigamWindowItem } },
        slots: { default: '<origam-window-item :value="1">Slide 1</origam-window-item>' }
    })

afterEach(() => {
    vi.restoreAllMocks()
})

describe('warnMissingLandmarkName — la fonction elle-même', () => {
    it('nomme le rôle retiré, la roledescription orpheline et le canal qui répare', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        warnMissingLandmarkName('OrigamProbe', 'region', 'carousel')

        expect(spy).toHaveBeenCalledTimes(1)
        const message = String(spy.mock.calls[0][0])
        expect(message).toContain('<OrigamProbe>')
        expect(message).toContain('role="region"')
        expect(message).toContain('aria-roledescription="carousel"')
        // Le canal exact, pas « ajoutez un nom » : c'est ce qui distingue un
        // avertissement utile d'un avertissement décoratif.
        expect(message).toContain('aria-label')
        expect(message).toContain('aria-labelledby')
    })

    it('ne se répète pas pour le même couple (composant, rôle)', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        warnMissingLandmarkName('OrigamProbeTwice', 'region', 'carousel')
        warnMissingLandmarkName('OrigamProbeTwice', 'region', 'carousel')
        warnMissingLandmarkName('OrigamProbeTwice', 'region', 'carousel')

        expect(spy).toHaveBeenCalledTimes(1)
    })
})

describe('OrigamWindow — l\'avertissement part au montage anonyme', () => {
    it('avertit une fois, et se tait dès qu\'un nom est fourni', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        // 1er montage : anonyme → le repère n'est pas déclaré, le DS le dit.
        const anonymous = mountWindow()
        expect(anonymous.find('.origam-window').attributes('role')).toBeUndefined()

        const landmarkWarnings = spy.mock.calls
            .map((call) => String(call[0]))
            .filter((message) => message.includes('<OrigamWindow>') && message.includes('role="region"'))

        expect(landmarkWarnings).toHaveLength(1)
        anonymous.unmount()

        // 2e montage : nommé → repère déclaré, et aucun avertissement de plus.
        spy.mockClear()
        const named = mountWindow({ 'aria-label': 'Product gallery' })
        expect(named.find('.origam-window').attributes('role')).toBe('region')

        const afterNaming = spy.mock.calls
            .map((call) => String(call[0]))
            .filter((message) => message.includes('<OrigamWindow>') && message.includes('role="region"'))

        expect(afterNaming).toHaveLength(0)
        named.unmount()
    })
})
