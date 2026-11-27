/*********************************************************
 * OrigamParallax — hydratation SSR (#1603, defauts 2 et 5)
 *
 * @description
 * Le HTML serveur est rendu SANS `matchMedia` ni `CSS.supports` ; le client
 * hydrate ensuite sur un navigateur qui reporte `prefers-reduced-motion:
 * reduce` ET le support de `animation-timeline`. Avant correctif, le premier
 * rendu client lisait ces deux informations des l'initialisation : les
 * classes `--reduced-motion` et `--css-driven` (hote et plans) n'etaient pas
 * dans le HTML serveur → « Hydration class mismatch ».
 *
 * @description
 * Mesure : le correctif retire exactement ces avertissements. Rien ici ne lit
 * un style calcule (piege `var()` de jsdom sans objet) : on compare des
 * classes et des avertissements Vue.
 ********************************************************/

import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, h } from 'vue'

import { createOrigam } from '@origam/origam'
import OrigamParallax from '@origam/components/Parallax/OrigamParallax.vue'
import OrigamParallaxLayer from '@origam/components/Parallax/OrigamParallaxLayer.vue'
import { _resetCssSupportCache } from '@origam/composables/Commons/cssSupport.composable'

const ssr = (render: () => ReturnType<typeof h>) => createSSRApp({ render }).use(createOrigam({}))

const tree = () => h(OrigamParallax, null, { default: () => h(OrigamParallaxLayer, { speed: 0.3 }, { default: () => 'layer' }) })

const w = window as unknown as Record<string, unknown>
const saved = { matchMedia: w.matchMedia, IntersectionObserver: w.IntersectionObserver, CSS: w.CSS }

function stubBrowser () {
    w.matchMedia = (query: string) => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
    })
    w.IntersectionObserver = class { observe () {} disconnect () {} unobserve () {} }
    w.CSS = { supports: () => true }
    _resetCssSupportCache()
}

describe('OrigamParallax — hydratation (#1603)', () => {
    beforeEach(() => {
        delete w.matchMedia
        w.CSS = undefined
        _resetCssSupportCache()
    })
    afterEach(() => {
        Object.assign(w, saved)
        _resetCssSupportCache()
        vi.restoreAllMocks()
    })

    it('le premier rendu client sous reduced-motion + animation-timeline ne diverge pas du HTML serveur', async () => {
        // 1. Serveur : aucune API navigateur.
        const html = await renderToString(ssr(tree))
        expect(html).toContain('origam-parallax__layer')

        // 2. Client : le navigateur reporte reduced-motion et le support CSS.
        stubBrowser()
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const root = document.createElement('div')
        root.innerHTML = html
        document.body.appendChild(root)
        const app = ssr(tree)
        app.mount(root)

        const mismatches = warn.mock.calls.map(c => c.join(' ')).filter(m => /hydration/i.test(m))
        expect(mismatches).toEqual([])

        // L'etat media-query s'applique APRES montage, sans erreur.
        await Promise.resolve()
        expect(root.querySelector('.origam-parallax--reduced-motion')).not.toBeNull()
        expect(root.querySelector('.origam-parallax__layer--reduced-motion')).not.toBeNull()

        app.unmount()
        root.remove()
    })

    it('les classes --css-driven ne dependent que des props (identiques serveur / client)', async () => {
        const html = await renderToString(ssr(tree))
        // easing linear par defaut, origine viewport : eligible des le rendu serveur.
        expect(html).toContain('origam-parallax--css-driven')
        expect(html).toContain('origam-parallax__layer--css-driven')

        const ease = await renderToString(ssr(() => h(OrigamParallax, { easing: 'ease-out' }, { default: () => h(OrigamParallaxLayer) })))
        expect(ease).not.toContain('--css-driven')

        const top = await renderToString(ssr(() => h(OrigamParallax, { origin: 'page-top' }, { default: () => h(OrigamParallaxLayer) })))
        expect(top).not.toContain('--css-driven')
    })

    it('la classe de plan porte l\'axe du defilement', async () => {
        const html = await renderToString(ssr(() => h(OrigamParallax, { direction: 'horizontal' }, { default: () => h(OrigamParallaxLayer) })))
        expect(html).toContain('origam-parallax__layer--horizontal')
    })

    it('sous reduced-motion : ecouteur scroll seulement si @scroll-progress est ecoute', async () => {
        stubBrowser()
        const scrollListeners = (props: Record<string, unknown>) => {
            const add = vi.spyOn(window, 'addEventListener')
            const wrapper = mount(OrigamParallax, { props, global: { plugins: [createOrigam({})] }, slots: { default: () => h(OrigamParallaxLayer) } })
            const n = add.mock.calls.filter(c => c[0] === 'scroll').length
            wrapper.unmount()
            add.mockRestore()
            return n
        }
        expect(scrollListeners({})).toBe(0)
        expect(scrollListeners({ onScrollProgress: () => {} })).toBe(1)
    })
})
