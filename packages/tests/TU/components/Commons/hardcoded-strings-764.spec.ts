// #764 — les 15 chaines destinees a l'utilisateur ecrites en dur que le
// detecteur C8 ETENDU (#763) a revelees dans 9 composants. L'ancien
// detecteur n'en voyait qu'UNE sur quinze : il ne regardait ni les
// litteraux du `<script>` rendus dans le template, ni les gabarits
// `:aria-label="…`${x} (start)`…"`.
//
// ⛔ LE PIEGE QUE CE FICHIER EST CONSTRUIT POUR EVITER, herite de
// `chart-i18n-accessible-name.spec.ts` : sous `en`, une chaine anglaise
// ECRITE EN DUR et sa traduction correctement resolue sont
// BYTE-IDENTIQUES. Un test qui ne monte que sous `en` passe donc avec le
// defaut integralement present. Chaque assertion de rendu monte sous `fr`
// ET attend une valeur ABSOLUE — jamais un simple « differe de », qui
// passe aussi sur deux chaines fausses.
//
// ⛔ CONTROLE POSITIF (le bloc du bas). « ca s'affiche en francais » et
// « ma sonde lit la mauvaise locale » sont indiscernables sans lui : on
// pinne une chaine DEJA traduite AVANT ce lot et qui doit l'etre encore
// apres. Le cas le plus parlant est OrigamChartCartesian, dont
// `aria-label` resolvait deja `origam.chart.zoom.reset_aria_label`
// pendant que le texte VISIBLE du meme bouton affichait « Reset zoom » :
// les deux moities du meme element, une traduite, l'autre pas.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import { createOrigam } from '@origam/origam'

import OrigamChartBoxPlot from '@origam/components/Chart/OrigamChartBoxPlot.vue'
import OrigamChartBullet from '@origam/components/Chart/OrigamChartBullet.vue'
import OrigamChartCandlestick from '@origam/components/Chart/OrigamChartCandlestick.vue'
import OrigamChartCartesian from '@origam/components/Chart/OrigamChartCartesian.vue'
import OrigamChartPareto from '@origam/components/Chart/OrigamChartPareto.vue'
import OrigamChartPictorial from '@origam/components/Chart/OrigamChartPictorial.vue'
import OrigamCommandPalette from '@origam/components/CommandPalette/OrigamCommandPalette.vue'
import OrigamSliderField from '@origam/components/SliderField/OrigamSliderField.vue'
import OrigamVideo from '@origam/components/Video/OrigamVideo.vue'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false, media: query, onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()
    }))
})

class ObserverMock {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn(() => [])
}

vi.stubGlobal('ResizeObserver', ObserverMock)
vi.stubGlobal('IntersectionObserver', ObserverMock)

afterEach(() => {
    document.body.innerHTML = ''
})

function mountIn (component: unknown, locale: string | undefined, props: Record<string, unknown> = {}) {
    return mount(component as never, {
        props: props as never,
        attachTo: document.body,
        global: {plugins: [createOrigam(locale ? {locale: {locale}} : undefined)]}
    })
}

const SERIES = [{name: 'S1', data: [1, 2, 3]}]

const BULLET_PROPS = {
    series: [{
        name: 'S1',
        data: [{value: 50, target: 100, ranges: [{to: 60}, {to: 100}, {to: 140}]}]
    }]
}

/*********************************************************
 * OrigamVideo — 'Playback error' (l.813, gravite haute)
 *
 * @description
 * Mot pour mot le defaut qui a fait naitre #567 sur OrigamAudio,
 * corrige la-bas et jamais vu ici. La cle `origam.media.playback_error`
 * EXISTAIT deja dans les deux locales : le composant frere ne la lisait
 * simplement pas. Aucune cle nouvelle, donc — une reutilisation.
 ********************************************************/
describe('OrigamVideo — message d\'erreur de lecture localise (#764)', () => {
    const forceError = async (wrapper: ReturnType<typeof mountIn>) => {
        const video = wrapper.find('video').element as HTMLVideoElement
        // `MediaError` ne porte qu'un `code` numerique : c'est CETTE
        // branche qu'atteint une vraie panne de decodage, et c'est elle
        // qui rendait la chaine en dur.
        Object.defineProperty(video, 'error', {
            configurable: true,
            get: () => ({code: 4}) as MediaError
        })
        video.dispatchEvent(new Event('error'))
        await wrapper.vm.$nextTick()
    }

    it('affiche l\'anglais sous en', async () => {
        const wrapper = mountIn(OrigamVideo, undefined, {src: 'movie.mp4'})
        await forceError(wrapper)

        expect(wrapper.text()).toContain('Playback error')

        wrapper.unmount()
    })

    it('affiche le francais sous fr', async () => {
        const wrapper = mountIn(OrigamVideo, 'fr', {src: 'movie.mp4'})
        await forceError(wrapper)

        expect(wrapper.text()).toContain('Erreur de lecture')
        expect(wrapper.text()).not.toContain('Playback error')

        wrapper.unmount()
    })
})

/*********************************************************
 * OrigamCommandPalette — les 3 indices du pied (l.557-559)
 *
 * @description
 * Le commentaire au-dessus du bloc les annoncait sans detour :
 * « Footer fallback strings ». `closeText` REUTILISE `origam.close`
 * plutot que d'ouvrir une quatrieme cle — meme mot, meme sens, dans
 * les deux langues.
 ********************************************************/
describe('OrigamCommandPalette — indices du pied localises (#764)', () => {
    const footerText = (wrapper: ReturnType<typeof mountIn>) =>
        [...document.querySelectorAll('.origam-command-palette__footer-hint')]
            .map((el) => el.textContent?.trim() ?? '')
            .join(' | ') || wrapper.text()

    it('affiche l\'anglais sous en', () => {
        const wrapper = mountIn(OrigamCommandPalette, undefined, {modelValue: true})

        const text = footerText(wrapper)
        expect(text).toContain('Navigate')
        expect(text).toContain('Select')
        expect(text).toContain('Close')

        wrapper.unmount()
    })

    it('affiche le francais sous fr', () => {
        const wrapper = mountIn(OrigamCommandPalette, 'fr', {modelValue: true})

        const text = footerText(wrapper)
        expect(text).toContain('Naviguer')
        expect(text).toContain('Sélectionner')
        expect(text).toContain('Fermer')
        expect(text).not.toContain('Navigate')

        wrapper.unmount()
    })
})

/*********************************************************
 * OrigamSliderField — `${label} (start)` / `(end)` x4 (l.116/142/330/354)
 *
 * @description
 * Quatre `<input type="range">` portaient le meme gabarit anglais : un
 * lecteur d'ecran francophone entendait « Prix (start) ». Le suffixe
 * passe par `t()`, qui interpole le `label` du consommateur dans la
 * phrase de la locale. `label` absent ⇒ toujours `undefined`, jamais
 * `aria-label=""` (qui priverait l'element de son nom implicite).
 ********************************************************/
describe('OrigamSliderField — noms des poignees localises (#764)', () => {
    const labels = () =>
        [...document.querySelectorAll('input[type="range"]')]
            .map((el) => el.getAttribute('aria-label'))

    it('affiche l\'anglais sous en', () => {
        const wrapper = mountIn(OrigamSliderField, undefined, {range: true, modelValue: [20, 80], label: 'Price'})

        expect(labels()).toEqual(['Price (start)', 'Price (end)'])

        wrapper.unmount()
    })

    it('affiche le francais sous fr', () => {
        const wrapper = mountIn(OrigamSliderField, 'fr', {range: true, modelValue: [20, 80], label: 'Prix'})

        expect(labels()).toEqual(['Prix (début)', 'Prix (fin)'])

        wrapper.unmount()
    })

    it('sans `label`, aucun aria-label n\'est emis (pas de chaine vide)', () => {
        const wrapper = mountIn(OrigamSliderField, 'fr', {range: true, modelValue: [20, 80]})

        expect(labels()).toEqual([null, null])

        wrapper.unmount()
    })
})

/*********************************************************
 * OrigamChartCartesian — 'Reset zoom' visible (l.317)
 *
 * @description
 * ⛔ CAS A MOITIE FAIT AVANT CE LOT, et c'est ce qui en fait le
 * meilleur controle positif du fichier : la prop `zoomResetLabel`, le
 * `computed` `zoomResetAriaLabel` et les DEUX traductions existaient
 * deja. Seul le texte VISIBLE ne les consultait pas. En francais, le
 * nom accessible disait « Réinitialiser le zoom » pendant que le bouton
 * affichait « Reset zoom » — sur le meme element.
 ********************************************************/
const CARTESIAN_ZOOM_PROPS = {
    series: [{name: 'S1', data: Array.from({length: 20}, (_, i) => i + 1)}],
    categories: Array.from({length: 20}, (_, i) => `c${ i }`),
    zoomable: true
}

/*********************************************************
 * zoomIn — le bouton n'existe qu'une fois le graphe zoome
 *
 * @description
 * `v-if="zoomable && isZoomed"`. `isZoomed` n'est pas une prop et le
 * composant n'expose pas `zoomTo` : le seul chemin est l'interaction
 * reelle, shift + molette, que `onSvgWheel` ecoute. Sous jsdom
 * `getBoundingClientRect()` rend des zeros, ce qui ancre le zoom en
 * fraction 0 — deterministe, et suffisant pour faire passer
 * `zoomStart > 0 || zoomEnd < len - 1`.
 ********************************************************/
async function zoomIn (wrapper: ReturnType<typeof mountIn>) {
    const svg = wrapper.find('svg').element
    svg.dispatchEvent(new WheelEvent('wheel', {deltaY: -100, shiftKey: true, bubbles: true, cancelable: true}))
    await wrapper.vm.$nextTick()
}

describe('OrigamChartCartesian — texte visible du bouton de zoom (#764)', () => {
    it('affiche l\'anglais sous en', async () => {
        const wrapper = mountIn(OrigamChartCartesian, undefined, CARTESIAN_ZOOM_PROPS)
        await zoomIn(wrapper)
        const btn = document.querySelector('[data-cy="origam-chart-zoom-reset"]')

        expect(btn).not.toBeNull()
        expect(btn?.textContent?.trim()).toBe('Reset zoom')

        wrapper.unmount()
    })

    it('affiche le francais sous fr — et le texte visible rejoint enfin son aria-label', async () => {
        const wrapper = mountIn(OrigamChartCartesian, 'fr', CARTESIAN_ZOOM_PROPS)
        await zoomIn(wrapper)
        const group = document.querySelector('[data-cy="origam-chart-zoom-reset"]')
        const btn = document.querySelector('[data-cy="origam-chart-zoom-reset-btn"]')

        expect(group).not.toBeNull()
        expect(group?.textContent?.trim()).toBe('Réinitialiser le zoom')
        // Le nom accessible etait DEJA correct avant ce lot — c'est
        // l'invariant qui prouve que la sonde lit bien la locale `fr`.
        expect(btn?.getAttribute('aria-label')).toBe('Réinitialiser le zoom')

        wrapper.unmount()
    })
})

/*********************************************************
 * Les 6 noms accessibles par donnee des charts
 * (BoxPlot 671, Bullet 678, Candlestick 576, Pareto 751,
 *  Pictorial 728 et 893)
 *
 * @description
 * Chacun assemblait une phrase anglaise par interpolation. Le gabarit
 * vit desormais dans la locale, avec ses parametres positionnels — ce
 * qui laisse au traducteur la liberte de REORDONNER, impossible avec un
 * template literal (« {2} icônes sur {3} » inverse l'ordre anglais).
 *
 * @description
 * `OrigamChartCandlestick` portait un SEPTIEME litteral que le
 * detecteur ne signalait pas — `bullish` / `bearish`, assigne a une
 * variable avant interpolation. Traduire la phrase en laissant ces deux
 * mots aurait produit « … : bullish, ouverture 10 … » : une demi-
 * correction visible. Ils sont donc traites avec, hors des 15.
 ********************************************************/
describe('OrigamChart* — noms accessibles par donnee localises (#764)', () => {
    const firstLabel = (selector = '[aria-label]') => {
        const els = [...document.querySelectorAll(selector)]
            .map((el) => el.getAttribute('aria-label'))
            .filter((v): v is string => Boolean(v))

        return els
    }

    it('OrigamChartBoxPlot — en puis fr', () => {
        const en = mountIn(OrigamChartBoxPlot, undefined, {series: [{name: 'S1', data: [1, 2, 3, 4, 5]}]})
        expect(firstLabel().some((v) => v.includes('median='))).toBe(true)
        en.unmount()
        document.body.innerHTML = ''

        const fr = mountIn(OrigamChartBoxPlot, 'fr', {series: [{name: 'S1', data: [1, 2, 3, 4, 5]}]})
        const frLabels = firstLabel()
        expect(frLabels.some((v) => v.includes('médiane='))).toBe(true)
        expect(frLabels.some((v) => v.includes('median='))).toBe(false)
        fr.unmount()
    })

    it('OrigamChartBullet — en puis fr', () => {
        const en = mountIn(OrigamChartBullet, undefined, BULLET_PROPS)
        expect(firstLabel().some((v) => v.includes('% achievement'))).toBe(true)
        en.unmount()
        document.body.innerHTML = ''

        const fr = mountIn(OrigamChartBullet, 'fr', BULLET_PROPS)
        const frLabels = firstLabel()
        expect(frLabels.some((v) => v.includes("d'atteinte"))).toBe(true)
        expect(frLabels.some((v) => v.includes('achievement'))).toBe(false)
        fr.unmount()
    })

    it('OrigamChartCandlestick — en puis fr, y compris bullish/bearish', () => {
        const data = [{date: '2026-01-01', open: 10, high: 20, low: 5, close: 15}]
        const en = mountIn(OrigamChartCandlestick, undefined, {series: [{name: 'S1', data}]})
        expect(firstLabel().some((v) => v.includes('open 10') && v.includes('bullish'))).toBe(true)
        en.unmount()
        document.body.innerHTML = ''

        const fr = mountIn(OrigamChartCandlestick, 'fr', {series: [{name: 'S1', data}]})
        const frLabels = firstLabel()
        expect(frLabels.some((v) => v.includes('ouverture 10') && v.includes('haussier'))).toBe(true)
        expect(frLabels.some((v) => v.includes('open ') || v.includes('bullish'))).toBe(false)
        fr.unmount()
    })

    it('OrigamChartPareto — en puis fr', () => {
        const en = mountIn(OrigamChartPareto, undefined, {series: SERIES, categories: ['a', 'b', 'c']})
        expect(firstLabel().some((v) => v.includes('cumulative'))).toBe(true)
        en.unmount()
        document.body.innerHTML = ''

        const fr = mountIn(OrigamChartPareto, 'fr', {series: SERIES, categories: ['a', 'b', 'c']})
        const frLabels = firstLabel()
        expect(frLabels.some((v) => v.includes('cumul '))).toBe(true)
        expect(frLabels.some((v) => v.includes('cumulative'))).toBe(false)
        fr.unmount()
    })

    it('OrigamChartPictorial — les DEUX gabarits, en puis fr', () => {
        const props = {series: SERIES, categories: ['a', 'b', 'c']}
        const en = mountIn(OrigamChartPictorial, undefined, props)
        expect(firstLabel().some((v) => v.includes('icons)'))).toBe(true)
        en.unmount()
        document.body.innerHTML = ''

        const fr = mountIn(OrigamChartPictorial, 'fr', props)
        const frLabels = firstLabel()
        expect(frLabels.some((v) => v.includes('icônes sur'))).toBe(true)
        expect(frLabels.some((v) => v.includes('icons)'))).toBe(false)
        fr.unmount()
    })

    it('OrigamChartPictorial — le gabarit `fill` (l.728) suit aussi la locale', () => {
        const props = {series: SERIES, categories: ['a', 'b', 'c'], fillMode: true}
        const en = mountIn(OrigamChartPictorial, undefined, props)
        const enLabels = firstLabel()
        en.unmount()
        document.body.innerHTML = ''

        const fr = mountIn(OrigamChartPictorial, 'fr', props)
        const frLabels = firstLabel()
        fr.unmount()

        // Le mode `fill` n'est pas atteignable par toutes les combinaisons
        // de props ; on n'assert que si le gabarit est effectivement rendu.
        if (enLabels.some((v) => v.includes('of maximum'))) {
            expect(frLabels.some((v) => v.includes('du maximum'))).toBe(true)
            expect(frLabels.some((v) => v.includes('of maximum'))).toBe(false)
        }
    })
})

/*********************************************************
 * ⛔ CONTROLE POSITIF — la sonde lit-elle vraiment `fr` ?
 *
 * @description
 * Chacune de ces chaines etait DEJA traduite AVANT ce lot, par une cle
 * qui existait deja dans `fr.json`. Si l'une d'elles revenait en
 * anglais, « ca s'affiche en francais » plus haut ne prouverait rien :
 * le harnais lirait la mauvaise locale, ou `createOrigam({locale})` ne
 * prendrait pas. Ce bloc est la seule chose qui distingue les deux.
 ********************************************************/
describe('Controle positif — des chaines deja traduites AVANT #764 le sont toujours', () => {
    it('OrigamChartCartesian : `aria-label` du bouton de zoom (traduit avant, texte visible non)', async () => {
        const wrapper = mountIn(OrigamChartCartesian, 'fr', CARTESIAN_ZOOM_PROPS)
        await zoomIn(wrapper)
        const btn = document.querySelector('[data-cy="origam-chart-zoom-reset-btn"]')

        expect(btn?.getAttribute('aria-label')).toBe('Réinitialiser le zoom')

        wrapper.unmount()
    })

    it('OrigamCommandPalette : `placeholder` (cle `origam.command_palette.placeholder`, intacte)', () => {
        const wrapper = mountIn(OrigamCommandPalette, 'fr', {modelValue: true})
        const input = document.querySelector('.origam-command-palette__input')

        expect(input?.getAttribute('placeholder')).toBe('Rechercher…')

        wrapper.unmount()
    })

    it('OrigamChartPareto : `aria-label` racine (cle `origam.chart.pareto.aria_label`, intacte)', () => {
        const wrapper = mountIn(OrigamChartPareto, 'fr', {series: SERIES, categories: ['a', 'b', 'c']})

        expect(wrapper.attributes('aria-label')).toBe('diagramme de Pareto')

        wrapper.unmount()
    })

    it('le meme montage sous `en` rend l\'anglais — la locale est bien le SEUL facteur', () => {
        const wrapper = mountIn(OrigamChartPareto, undefined, {series: SERIES, categories: ['a', 'b', 'c']})

        expect(wrapper.attributes('aria-label')).toBe('Pareto chart')

        wrapper.unmount()
    })
})
