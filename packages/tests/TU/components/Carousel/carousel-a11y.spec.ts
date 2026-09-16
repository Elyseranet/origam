// Unit tests for the Carousel accessibility surface — campagne « majeurs »,
// critère C6 de la famille Carousel.
//
// ⛔ Ce que le classeur affirmait, et ce qui a été MESURÉ ici
// ─────────────────────────────────────────────────────────────
// Le constat portait « ni role=region, ni aria-roledescription, ni région
// live, et AUCUN contrôle pause/lecture en autoplay ». Les trois premiers
// points sont FAUX sur `develop` : ils sont portés par `<OrigamWindow>`, qui
// EST la racine rendue de `<OrigamCarousel>` (commit 6c67db66, #474).
// L'inspection avait lu `OrigamCarousel.vue` seul sans suivre la composition.
// Les tests « héritées de Window » ci-dessous épinglent ce fait pour qu'une
// régression sur Window soit vue depuis Carousel.
//
// Le QUATRIÈME point est réel : `cycle` arme un timer de 6 s par défaut et
// rien ne permettait de l'arrêter. WCAG 2.2.2 (Pause, Stop, Hide, niveau A)
// exige un mécanisme explicite dès qu'un contenu démarre seul et dure plus
// de 5 s. `prefers-reduced-motion` est respecté mais ne couvre que les
// utilisateurs ayant activé ce réglage système — ce n'est pas le mécanisme
// que la règle demande.
//
// Pourquoi Vitest et pas Playwright : tout ce qui est asserté ici est de la
// structure DOM et du comportement de timer. Aucune assertion ne porte sur
// une propriété calculée que le DS thème via un `var()` — le piège jsdom
// documenté dans CLAUDE.md ne s'applique donc pas.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'

import OrigamCarousel from '@origam/components/Carousel/OrigamCarousel.vue'
import OrigamCarouselItem from '@origam/components/Carousel/OrigamCarouselItem.vue'
import { createOrigam } from '@origam/origam'

const matchMediaMock = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
})

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: matchMediaMock
})

vi.stubGlobal('requestAnimationFrame', vi.fn((_cb: FrameRequestCallback) => 0))
vi.stubGlobal('cancelAnimationFrame', vi.fn())

function mountCarousel (props: Record<string, unknown> = {}, numItems = 3) {
    if (typeof (window as any).matchMedia !== 'function') {
        Object.defineProperty(window, 'matchMedia', {
            writable: true, configurable: true, value: matchMediaMock
        })
    }

    // ⛔ Piège de harnais mesuré : une chaîne de gabarit passée en slot est
    // rendue comme du TEXTE ÉCHAPPÉ (`&lt;origam-carousel-item&gt;`), pas
    // compilée — zéro item monté, région live vide, et l'on conclut à tort
    // que le composant est cassé. Les items doivent être construits avec
    // `h()`. Vérifié en vidant `wrapper.html()` dans un fichier.
    return mount(OrigamCarousel, {
        props: { hideDelimiters: true, ...props } as never,
        slots: {
            default: () => Array.from({ length: numItems }, (_, i) =>
                h(OrigamCarouselItem, { key: i }, {
                    default: () => h('span', { 'data-cy': `slide-${ i }` }, `Slide ${ i + 1 }`)
                })
            )
        },
        global: {
            plugins: [createOrigam()],
            components: { OrigamCarouselItem }
        },
        attachTo: document.body
    })
}

beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true, configurable: true, value: matchMediaMock
    })
    vi.useFakeTimers()
})

afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    Object.defineProperty(window, 'matchMedia', {
        writable: true, configurable: true, value: matchMediaMock
    })
})

// ---------------------------------------------------------------------------
// Patron WAI-ARIA — la part déjà portée par <OrigamWindow>
// ---------------------------------------------------------------------------

describe('OrigamCarousel — patron WAI-ARIA hérité de <OrigamWindow>', () => {
    /*********************************************************
     * ⛔ #781 — le repère de Window est maintenant conditionné au nom
     *
     * @description
     * Ce test épinglait `role="region"` + `aria-roledescription="carousel"`
     * SANS condition. Mesuré : la racine les portait, et n'avait aucun nom
     * accessible — or `region` est un rôle dont WAI-ARIA 1.2 marque le nom
     * comme REQUIS. `<OrigamWindow>` ne les déclare donc plus qu'une fois
     * nommé, et `<OrigamCarousel>` hérite de la règle par composition, ce
     * que les deux tests ci-dessous vérifient dans les deux sens.
     * Voir `window-live-region.spec.ts` pour le raisonnement complet.
     ********************************************************/
    it('ne déclare aucun repère anonyme quand personne ne nomme le carrousel', () => {
        const wrapper = mountCarousel()
        const root = wrapper.find('.origam-carousel')

        expect(root.attributes('role')).toBeUndefined()
        expect(root.attributes('aria-roledescription')).toBeUndefined()
    })

    it('un aria-label posé sur <origam-carousel> traverse jusqu\'au repère de Window', () => {
        const wrapper = mount(OrigamCarousel, {
            props: { hideDelimiters: true } as never,
            attrs: { 'aria-label': 'Product gallery' },
            slots: {
                default: () => [h(OrigamCarouselItem, { key: 0 }, {
                    default: () => h('span', 'Slide 1')
                })]
            },
            global: { plugins: [createOrigam()], components: { OrigamCarouselItem } },
            attachTo: document.body
        })
        const root = wrapper.find('.origam-carousel')

        expect(root.attributes('aria-label')).toBe('Product gallery')
        expect(root.attributes('role')).toBe('region')
        expect(root.attributes('aria-roledescription')).toBe('carousel')

        wrapper.unmount()
    })

    it('une région live polite annonce la diapositive courante', async () => {
        const wrapper = mountCarousel()

        // Les items s'enregistrent dans le groupe au montage : sans ce tick on
        // mesure l'état AVANT l'enregistrement et la région est vide.
        await nextTick()
        await nextTick()

        const live = wrapper.find('[role="status"]')

        expect(live.exists()).toBe(true)
        expect(live.attributes('aria-live')).toBe('polite')
        // Valeur ABSOLUE : « Carousel slide 1 of 3 », pas juste « non vide ».
        expect(live.text()).toBe('Carousel slide 1 of 3')
    })
})

// ---------------------------------------------------------------------------
// WCAG 2.2.2 — Pause, Stop, Hide
// ---------------------------------------------------------------------------

describe('OrigamCarousel — WCAG 2.2.2 : contrôle pause/lecture en autoplay', () => {
    it('n\'expose AUCUN contrôle pause quand cycle est absent (rien ne bouge seul)', () => {
        const wrapper = mountCarousel()

        expect(wrapper.find('[data-cy="carousel-play-pause"]').exists()).toBe(false)
    })

    it('expose un <button> pause dès que cycle est actif', () => {
        const wrapper = mountCarousel({ cycle: true })
        const btn = wrapper.find('[data-cy="carousel-play-pause"]')

        expect(btn.exists()).toBe(true)
        // Élément natif — « No ARIA is better than bad ARIA ». Un <div @click>
        // serait un défaut, pas un choix.
        expect(btn.element.tagName).toBe('BUTTON')
    })

    it('le contrôle porte un aria-label traduit, jamais une chaîne en dur', () => {
        const wrapper = mountCarousel({ cycle: true })
        const btn = wrapper.find('[data-cy="carousel-play-pause"]')

        // Valeur ABSOLUE (cf. le piège --origam-row---density: 0) : on vérifie
        // la chaîne rendue par la locale, pas seulement qu'un attribut existe.
        expect(btn.attributes('aria-label')).toBe('Pause the carousel')
        expect(btn.attributes('aria-pressed')).toBe('false')
    })

    it('un clic ARRÊTE réellement le défilement automatique', async () => {
        const wrapper = mountCarousel({ cycle: true, interval: 1000 })

        // ⛔ Contrôle positif OBLIGATOIRE : sans lui, ce test resterait vert
        // même si le timer n'avait jamais démarré — il prouverait « rien ne
        // bouge » sur un carrousel immobile, pas « la pause arrête ».
        vi.advanceTimersByTime(1100)
        await nextTick()
        expect((wrapper.emitted('update:modelValue') ?? []).length).toBeGreaterThan(0)

        await wrapper.find('[data-cy="carousel-play-pause"]').trigger('click')
        await nextTick()

        const emittedBefore = (wrapper.emitted('update:modelValue') ?? []).length

        vi.advanceTimersByTime(5000)
        await nextTick()

        const emittedAfter = (wrapper.emitted('update:modelValue') ?? []).length

        // En pause, cinq intervalles ne produisent AUCUN changement de diapo.
        expect(emittedAfter).toBe(emittedBefore)
    })

    it('le contrôle bascule son libellé et son aria-pressed en pause', async () => {
        const wrapper = mountCarousel({ cycle: true })
        const btn = wrapper.find('[data-cy="carousel-play-pause"]')

        await btn.trigger('click')
        await nextTick()

        expect(btn.attributes('aria-pressed')).toBe('true')
        expect(btn.attributes('aria-label')).toBe('Play the carousel')
    })

    it('un second clic RELANCE le défilement (le mécanisme est réversible)', async () => {
        const wrapper = mountCarousel({ cycle: true, interval: 1000 })
        const btn = wrapper.find('[data-cy="carousel-play-pause"]')

        await btn.trigger('click')
        await nextTick()
        const pausedCount = (wrapper.emitted('update:modelValue') ?? []).length

        await btn.trigger('click')
        await nextTick()

        vi.advanceTimersByTime(1100)
        await nextTick()

        const resumedCount = (wrapper.emitted('update:modelValue') ?? []).length

        expect(resumedCount).toBeGreaterThan(pausedCount)
    })
})

// ---------------------------------------------------------------------------
// Sémantique de diapositive — OrigamCarouselItem
// ---------------------------------------------------------------------------

/*********************************************************
 * ⛔ #781 — `role="group"` sur l'item : FAUX POSITIF de Sonar, mesuré
 *
 * @description
 * Le ticket #781 liste `Carousel/OrigamCarouselItem.vue:2` sous
 * « `role="group"` mal employé », la règle Sonar demandant d'utiliser
 * `<fieldset>` à la place. C'est faux ici, pour deux raisons vérifiables :
 *
 * 1. `role="group"` + `aria-roledescription="slide"` EST le patron
 *    Carousel du WAI-ARIA APG pour une diapositive. `<fieldset>` est un
 *    conteneur de contrôles de formulaire ; il n'est pas un substitut.
 * 2. Contrairement à `region` (voir `window-live-region.spec.ts`),
 *    `group` n'exige PAS de nom accessible dans sa définition WAI-ARIA
 *    1.2. Le retirer faute de nom PERDRAIT la frontière de diapositive au
 *    lieu de supprimer une fausse promesse — c'est pourquoi Window et
 *    CarouselItem sont traités différemment dans le même lot.
 *
 * @description
 * Le code n'est donc PAS modifié. Reste une amélioration APG possible et
 * non tranchée : un `aria-label` positionnel « 3 sur 5 » par diapositive.
 * Elle demanderait d'injecter le registre de groupe dans `CarouselItem` et
 * changerait le rendu de tous les consommateurs — remontée au mainteneur,
 * pas décidée ici.
 ********************************************************/
describe('OrigamCarouselItem — sémantique de diapositive', () => {
    it('chaque item porte role="group" et aria-roledescription="slide"', () => {
        const wrapper = mountCarousel({}, 3)
        const items = wrapper.findAll('.origam-carousel-item')

        expect(items.length).toBe(3)

        for (const item of items) {
            expect(item.attributes('role')).toBe('group')
            expect(item.attributes('aria-roledescription')).toBe('slide')
        }
    })
})
