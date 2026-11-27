// #1570 — décors enso : choix du fichier 1x / 2x des fonds CSS, variables par mode, pétales bornés.
import { describe, expect, it } from 'vitest'

import { ENSO_BRUSH, ENSO_DEMO_MODES, ENSO_GALLERY, ENSO_MASK_DRY_02, ENSO_PETAL_FLIGHTS } from '~/consts/enso.const'
import { CTA_PLANES } from '~/consts/cta.const'
import { ctaPlaneViews, ensoArtVars, ensoDemoColumns, ensoImageSet, ensoMaskUrl, ensoPageHeaderPlaneViews, ensoPetalViews } from '~/utils/enso.util'
import { ENSO_PAGE_HEADER_PLANES } from '~/consts/enso-page-header.const'
import { ENSO_PAGE_HEADER_FAMILY } from '~/enums/enso-page-header.enum'

const SOURCE = { src: '/a-1600.avif', srcset: '/a-400.avif 400w, /a-1600.avif 1600w, /a-800.avif 800w' }

describe('ensoImageSet', () => {
    it('prend le plus petit fichier qui couvre la largeur en 1x puis le double en 2x', () => {
        expect(ensoImageSet(SOURCE, 300)).toBe('image-set(url("/a-400.avif") 1x, url("/a-800.avif") 2x)')
        expect(ensoImageSet(SOURCE, 500)).toBe('image-set(url("/a-800.avif") 1x, url("/a-1600.avif") 2x)')
    })

    it('retombe sur le plus grand fichier quand aucun ne couvre la largeur', () => {
        expect(ensoImageSet(SOURCE, 2000)).toBe('image-set(url("/a-1600.avif") 1x, url("/a-1600.avif") 2x)')
    })

    it('ignore les entrées mal formées et retombe sur `src` si le srcset est vide', () => {
        expect(ensoImageSet({ src: '/s.avif', srcset: '/x.avif, /a-400.avif 400w' }, 300)).toBe('image-set(url("/a-400.avif") 1x, url("/a-400.avif") 2x)')
        expect(ensoImageSet({ src: '/s.avif', srcset: '' }, 300)).toBe('image-set(url("/s.avif") 1x, url("/s.avif") 2x)')
    })
})

describe('ensoArtVars', () => {
    it('pose une variante par mode et le ratio, sans jamais mélanger les dossiers', () => {
        const vars = ensoArtVars(ENSO_BRUSH, 240)

        expect(vars['--enso-art-light']).toContain('/brand/enso/shared/brush-violet-')
        expect(vars['--enso-art-dark']).toContain('/brand/enso/shared/brush-ivory-')
        expect(vars['--enso-art-ratio']).toBe(`${ENSO_BRUSH.width} / ${ENSO_BRUSH.height}`)
    })
})

describe('ensoMaskUrl', () => {
    it('donne un url() de même origine, sur src et jamais sur le srcset', () => {
        expect(ensoMaskUrl(ENSO_MASK_DRY_02)).toBe(`url("${ENSO_MASK_DRY_02.src}")`)
        expect(ensoMaskUrl(ENSO_MASK_DRY_02)).toMatch(/^url\("\/brand\//)
    })
})

describe('ensoPetalViews', () => {
    it('borne le nombre de pétales entre 0 et le nombre de trajectoires', () => {
        expect(ensoPetalViews(8)).toHaveLength(8)
        expect(ensoPetalViews(99)).toHaveLength(ENSO_PETAL_FLIGHTS.length)
        expect(ensoPetalViews(-3)).toHaveLength(0)
    })

    it('donne à chaque pétale ses variables de trajectoire et ses deux variantes', () => {
        const [first] = ensoPetalViews(1)

        expect(first.style['--petal-duration']).toBe(ENSO_PETAL_FLIGHTS[0].duration)
        expect(first.style['--enso-art-light']).toContain('/brand/enso/light/petal-')
        expect(first.style['--enso-art-dark']).toContain('/brand/enso/dark/petal-')
    })
})

describe('ensoDemoColumns', () => {
    it('sert la variante du mode de chaque colonne', () => {
        const columns = ensoDemoColumns()

        expect(columns.map(c => c.mode)).toEqual(ENSO_DEMO_MODES.map(m => m.mode))
        expect(columns[0].items).toHaveLength(ENSO_GALLERY.length)
        expect(columns[0].items[0].src).toBe(ENSO_GALLERY[0].art.light.src)
        expect(columns[1].items[0].src).toBe(ENSO_GALLERY[0].art.dark.src)
    })

    it('sert un asset partagé tel quel dans les deux modes, et un asset par mode depuis son dossier', () => {
        const [light, dark] = ensoDemoColumns()
        const find = (col: typeof light, name: string) => col.items.find(item => item.name === name)

        expect(find(light, 'ENSO_SUN_DISC')?.src).toBe('/brand/enso/shared/sun-disc-540.avif')
        expect(find(dark, 'ENSO_SUN_DISC')?.src).toBe('/brand/enso/shared/sun-disc-540.avif')
        expect(find(light, 'ENSO_CTA_RIDGE')?.src).toBe('/brand/enso/light/cta-ridge-1983.avif')
        expect(find(dark, 'ENSO_CTA_RIDGE')?.src).toBe('/brand/enso/dark/cta-ridge-1983.avif')
    })
})

describe('ctaPlaneViews (#1596)', () => {
    it('donne un plan par entrée de CTA_PLANES, du plus lointain au plus proche, avec sa vitesse', () => {
        const views = ctaPlaneViews()

        expect(views.map(v => v.key)).toEqual(['mountains', 'ridge', 'foreground'])
        expect(views.map(v => v.speed)).toEqual(CTA_PLANES.map(p => p.speed))
        // sens du parallaxe de la maquette : négatif, et d'autant plus faible que le plan est proche
        const magnitudes = views.map(v => Math.abs(v.speed))
        expect(views.every(v => v.speed < 0)).toBe(true)
        expect([...magnitudes].sort((a, b) => b - a)).toEqual(magnitudes)
    })

    it('porte la variante de chaque mode et la classe de décor', () => {
        const [mountains] = ctaPlaneViews()

        expect(mountains.classes).toContain('enso-art')
        expect(mountains.style['--enso-art-light']).toContain('/brand/enso/light/cta-mountains-')
        expect(mountains.style['--enso-art-dark']).toContain('/brand/enso/dark/cta-mountains-')
    })
})

describe('ensoPageHeaderPlaneViews (#1584)', () => {
    const families = Object.values(ENSO_PAGE_HEADER_FAMILY)

    it('couvre exactement les quatre familles, avec un ou deux plans', () => {
        expect(families).toEqual(['catalog', 'editorial', 'legal', 'tool'])
        expect(Object.keys(ENSO_PAGE_HEADER_PLANES).sort()).toEqual([...families].sort())
        for (const family of families) expect([1, 2]).toContain(ensoPageHeaderPlaneViews(family).length)
    })

    it('n\'utilise jamais le Fuji (réservé au hero et au CTA)', () => {
        const fuji = /hero-mountains|hero-sky|hero-sun|cta-mountains/
        for (const family of families) {
            for (const view of ensoPageHeaderPlaneViews(family)) {
                expect(String(view.style['--enso-art-light'])).not.toMatch(fuji)
                expect(String(view.style['--enso-art-dark'])).not.toMatch(fuji)
            }
        }
    })

    it('porte les deux modes sur chaque plan, le plan lointain avant et plus fort que le proche', () => {
        for (const family of families) {
            const views = ensoPageHeaderPlaneViews(family)

            expect(views[0].key).toBe('back')
            for (const view of views) {
                expect(view.classes).toEqual(['enso-art', `enso-page-header__plane--${view.key}`])
                expect(String(view.style['--enso-art-light'])).toContain('/brand/enso/light/')
                expect(String(view.style['--enso-art-dark'])).toContain('/brand/enso/dark/')
                expect(view.speed).toBeGreaterThan(0)
            }
            if (views.length === 2) expect(views[0].speed).toBeGreaterThan(views[1].speed)
        }
    })
})
