// #1570 — décors enso : choix du fichier 1x / 2x des fonds CSS, variables par mode, pétales bornés.
import { describe, expect, it } from 'vitest'

import { ENSO_BRUSH, ENSO_DEMO_MODES, ENSO_GALLERY, ENSO_PETAL_FLIGHTS } from '~/consts/enso.const'
import { ensoArtVars, ensoDemoColumns, ensoImageSet, ensoPetalViews } from '~/utils/enso.util'

const SOURCE = { src: '/a-1600.avif', srcset: '/a-400.avif 400w, /a-1600.avif 1600w, /a-800.avif 800w' }

describe('ensoImageSet', () => {
    it('prend le plus petit fichier qui couvre la largeur en 1x puis le double en 2x', () => {
        expect(ensoImageSet(SOURCE, 300)).toBe('image-set(url("/a-400.avif") 1x, url("/a-800.avif") 2x)')
        expect(ensoImageSet(SOURCE, 500)).toBe('image-set(url("/a-800.avif") 1x, url("/a-1600.avif") 2x)')
    })

    it('retombe sur le plus grand fichier quand aucun ne couvre la largeur', () => {
        expect(ensoImageSet(SOURCE, 2000)).toBe('image-set(url("/a-1600.avif") 1x, url("/a-1600.avif") 2x)')
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
})
