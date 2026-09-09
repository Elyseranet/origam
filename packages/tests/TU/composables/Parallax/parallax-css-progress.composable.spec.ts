// `useParallaxRuntime` — le mode CSS scroll-driven n'appelait jamais
// `onProgress` (issue #432, troisième point).
//
// ⛔ Ce qui est mesuré ici, et ce qui ne peut PAS l'être
// ──────────────────────────────────────────────────────
// Ce spec teste le CÂBLAGE, pas le rendu : « quand le chemin CSS est actif
// et que la page défile, le runtime rapporte-t-il une progression ? ».
// C'est de la logique pure une fois `IntersectionObserver` et
// `CSS.supports` remplacés — aucune assertion ne porte sur une propriété
// calculée, donc le piège `var()` de jsdom ne s'applique pas.
//
// Ce qui reste hors de portée de jsdom, et n'est donc PAS testé ici : le
// mouvement réel des couches, qui dépend d'un moteur de layout et d'une
// timeline `animation-timeline: scroll()`. Il est couvert côté navigateur
// par `packages/tests/e2e/parallax.spec.ts`.
//
// Le défaut, tel que mesuré sur develop avant correction : `startCss()`
// publiait les variables CSS par couche mais n'installait AUCUN écouteur
// `scroll` / `resize` — ceux-ci n'étaient posés que dans la branche
// `if (!cssScrollDriven.value)`. `updateProgress()`, seul appelant de
// `options.onProgress`, n'était donc joignable que par la boucle rAF du
// chemin JS. Sur Chrome 115+ (où `animation-timeline: scroll()` est
// supporté et l'easing vaut `linear`), `@scroll-progress` ne partait
// JAMAIS.

import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

import { PARALLAX_DIRECTION, PARALLAX_EASING } from '@origam/enums'
import { useParallaxRuntime } from '@origam/composables/Parallax/parallax.composable'
import { _resetCssSupportCache } from '@origam/composables/Commons/cssSupport.composable'

// ---------------------------------------------------------------------------
// Environnement : jsdom n'a ni matchMedia, ni IntersectionObserver, ni
// CSS.supports. On les fournit — et on force `CSS.supports` à répondre VRAI
// pour `animation-timeline: scroll()` afin de placer le runtime sur le
// chemin CSS, celui exact où le défaut vivait.
// ---------------------------------------------------------------------------

let intersectionCallbacks: Array<(entries: unknown[]) => void> = []

beforeEach(() => {
    intersectionCallbacks = []

    // @ts-expect-error — jsdom n'implémente pas matchMedia
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))

    // @ts-expect-error — jsdom n'implémente pas IntersectionObserver
    window.IntersectionObserver = class {
        constructor (cb: (entries: unknown[]) => void) {
            intersectionCallbacks.push(cb)
        }

        observe () {}
        disconnect () {}
        unobserve () {}
    }

    // @ts-expect-error — CSS.supports n'existe pas sous jsdom
    window.CSS = {
        supports: (query: string) => query.includes('animation-timeline')
    }

    _resetCssSupportCache()
})

afterEach(() => {
    _resetCssSupportCache()
    vi.restoreAllMocks()
})

function mountRuntime (opts: { easing?: string, threshold?: number } = {}) {
    const host = document.createElement('div')
    document.body.appendChild(host)

    // getBoundingClientRect renvoie des zéros sous jsdom : on le remplace par
    // une géométrie plausible, sinon `updateProgress` divise par zéro et la
    // progression est indistinguable d'une absence d'appel.
    host.getBoundingClientRect = () => ({
        top: 100, left: 0, bottom: 400, right: 300,
        width: 300, height: 300, x: 0, y: 100,
        toJSON: () => ({})
    }) as DOMRect

    const onProgress = vi.fn()
    const onEnter = vi.fn()

    let api!: ReturnType<typeof useParallaxRuntime>

    const Host = defineComponent({
        name: 'OrigamParallaxCssHost',
        setup () {
            api = useParallaxRuntime({
                target: ref(host),
                direction: ref(PARALLAX_DIRECTION.VERTICAL),
                easing: ref(opts.easing ?? PARALLAX_EASING.LINEAR),
                threshold: ref(opts.threshold ?? 0),
                disabled: ref(false),
                speed: ref(0.3),
                onProgress,
                onEnter
            } as never)

            return () => h('div')
        }
    })

    const wrapper = mount(Host)

    return { api: () => api, wrapper, host, onProgress, onEnter }
}


/** Attend une frame d'animation PUIS une macrotache : le rapport de
 *  progression du chemin CSS est differe par `requestAnimationFrame`, et
 *  sous jsdom une frame arrive vers 16 ms — un `setTimeout(0)` passe AVANT
 *  et fait conclure a tort que rien n'a ete emis. */
function nextFrame () {
    return new Promise((resolve) => {
        requestAnimationFrame(() => setTimeout(resolve, 0))
    })
}

/** Simule l'entrée dans le viewport signalée par l'IntersectionObserver. */
function enterViewport () {
    for (const cb of intersectionCallbacks) {
        cb([{ isIntersecting: true }])
    }
}

describe('useParallaxRuntime — chemin CSS scroll-driven (#432)', () => {
    it('contrôle de branche : le runtime est bien SUR le chemin CSS', () => {
        const { api } = mountRuntime()

        // Sans ce contrôle, tous les tests ci-dessous pourraient passer en
        // mesurant le chemin JS — c'est-à-dire en ne mesurant pas le défaut.
        expect(api().cssScrollDriven.value).toBe(true)
    })

    it('contrôle NÉGATIF : sur le chemin JS (easing non linéaire), onProgress part déjà', async () => {
        const { onProgress } = mountRuntime({ easing: PARALLAX_EASING.SPRING })

        enterViewport()
        window.dispatchEvent(new Event('scroll'))
        await nextFrame()

        // Ce chemin-là n'a jamais été cassé : il sert de témoin. S'il devenait
        // rouge, le défaut serait ailleurs que là où on le croit.
        expect(onProgress).toHaveBeenCalled()
    })

    it('émet une progression au défilement alors que le chemin CSS est actif', async () => {
        const { onProgress } = mountRuntime()

        enterViewport()
        onProgress.mockClear()

        window.dispatchEvent(new Event('scroll'))
        await nextFrame()

        expect(onProgress).toHaveBeenCalled()
    })

    it('la progression rapportée est une valeur EXACTE dans [0, 1], pas un simple appel', async () => {
        const { onProgress, api } = mountRuntime()

        enterViewport()
        window.dispatchEvent(new Event('scroll'))
        await nextFrame()

        const last = onProgress.mock.calls.at(-1)?.[0] as number

        // Géométrie posée plus haut : top=100, height=300, innerHeight=768
        // (défaut jsdom) → p = (768 - 100) / (300 + 768) = 0.6254...
        // On asserte la VALEUR, pas « ça a changé » — un test qui vérifie
        // seulement que deux valeurs diffèrent reste vert sur une gouttière
        // morte (cf. --origam-row---density: 0).
        expect(last).toBeCloseTo((window.innerHeight - 100) / (300 + window.innerHeight), 5)
        expect(api().progress.value).toBeCloseTo(last, 5)
    })

    it('réagit aussi au redimensionnement (la progression dépend de la hauteur du viewport)', async () => {
        const { onProgress } = mountRuntime()

        enterViewport()
        onProgress.mockClear()

        window.dispatchEvent(new Event('resize'))
        await nextFrame()

        expect(onProgress).toHaveBeenCalled()
    })

    it('retire ses écouteurs au démontage (pas de fuite après unmount)', async () => {
        const { onProgress, wrapper } = mountRuntime()

        enterViewport()
        wrapper.unmount()
        onProgress.mockClear()

        window.dispatchEvent(new Event('scroll'))
        await nextFrame()

        expect(onProgress).not.toHaveBeenCalled()
    })
})
