import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'

import OrigamMediaVolumeControl from '@origam/components/Media/OrigamMediaVolumeControl.vue'
import type { IOrigamTheme } from '@origam/interfaces'
import { createOrigam } from '@origam/origam'

/**
 * #429 — la moitié « PROPS D'ABORD » de la correction.
 *
 * Avant : le composant ne déclarait AUCUNE prop visuelle. Un thème pouvait
 * écrire `components: { 'origam-media-volume-control': { size: 'small' } }`
 * et il ne se passait rien — le résolveur ADR-005 ne patche que les clés que
 * le composant déclare vraiment (c'est une INTERSECTION, pas une union). Le
 * seul levier restant était un override CSS brut, ce qui inverse la logique
 * du DS.
 *
 * Ce spec épingle exactement ça : les quatre nouvelles props sont atteignables
 * par `theme.components`, sans que le composant appelle `useDefaults()`.
 *
 * ⛔ Les assertions portent sur les CLASSES ÉMISES, jamais sur un style
 * calculé : sous jsdom `getComputedStyle` ne résout pas `var()` et renverrait
 * un `16px` fabriqué (cf. CLAUDE.md #398). La géométrie réelle produite par
 * ces classes est mesurée en navigateur dans
 * `packages/tests/e2e/media-volume-control.spec.ts`.
 */

const TOOLTIP_STUB = {
    template: `
        <div class="origam-tooltip-stub">
            <slot name="activator" :props="{}" />
            <slot />
        </div>
    `
}

const SCRUBBER_STUB = { template: '<div role="slider" />' }

const REQUIRED_PROPS = {
    volume: 0.7,
    muted: false,
    muteLabel: 'Mute',
    unmuteLabel: 'Unmute',
    volumeLabel: 'Volume'
}

const mountThemed = (components: IOrigamTheme['components'], props: Record<string, unknown> = {}) => {
    const theme: IOrigamTheme = { name: 'brandx', components, vars: {} }
    const origam = createOrigam({ themes: [ theme ] })

    origam._defaultsRef.value = origam._activeDefaultsFor('brandx', undefined)

    return mount(OrigamMediaVolumeControl, {
        props: { ...REQUIRED_PROPS, ...props },
        global: {
            plugins: [ origam ],
            stubs: {
                OrigamIcon: { template: '<i aria-hidden="true" />' },
                OrigamTooltip: TOOLTIP_STUB,
                OrigamMediaScrubber: SCRUBBER_STUB
            }
        }
    })
}

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach((el) => el.remove())
})

describe('OrigamMediaVolumeControl — atteignable par theme.components (#429)', () => {
    it('un thème pilote `size` sans que la prop soit passée', () => {
        const wrapper = mountThemed({ 'origam-media-volume-control': { size: 'small' } })

        expect(wrapper.get('button').classes()).toContain('origam-media-volume-control--size-small')
    })

    it('un thème pilote `density` sans que la prop soit passée', () => {
        const wrapper = mountThemed({ 'origam-media-volume-control': { density: 'compact' } })

        expect(wrapper.get('button').classes()).toContain('origam-media-volume-control--density-compact')
    })

    it('un thème pilote `rounded` sans que la prop soit passée', () => {
        const wrapper = mountThemed({ 'origam-media-volume-control': { rounded: 'sm' } })

        expect(wrapper.get('button').classes()).toContain('origam--rounded-sm')
    })

    it('un thème pilote `color` sans que la prop soit passée', () => {
        const wrapper = mountThemed({ 'origam-media-volume-control': { color: 'primary' } })

        // `useTextColor` pousse la déclaration inline sur le canal
        // foreground — c'est elle qui gagne la cascade (cf. #514), la classe
        // utilitaire n'est qu'un compagnon.
        expect(wrapper.get('button').attributes('style')).toContain('color:')
    })

    it('une prop passée explicitement gagne toujours sur le thème', () => {
        const wrapper = mountThemed(
            { 'origam-media-volume-control': { size: 'small' } },
            { size: 'x-large' }
        )

        const classes = wrapper.get('button').classes()

        expect(classes).toContain('origam-media-volume-control--size-x-large')
        expect(classes).not.toContain('origam-media-volume-control--size-small')
    })

    it('sans entrée de thème, aucune classe de design n\'est émise', () => {
        const wrapper = mountThemed({})

        const classes = wrapper.get('button').classes().join(' ')

        expect(classes).not.toMatch(/--size-/)
        expect(classes).not.toMatch(/--density-/)
        expect(classes).not.toMatch(/rounded/)
    })
})
