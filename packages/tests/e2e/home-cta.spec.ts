/**
 * home-cta.spec.ts — bande de CTA finale (#1517, maquette A du kit A1)
 *
 * Contrat :
 *  - <section> labellee par le H2 #cta-title, sous-arbre force en mode sombre
 *    (la bande reste encre/violet en clair comme en sombre) ;
 *  - deux CTA : « Explorer les composants » (/components) et « Lire la
 *    documentation » (/installation) ;
 *  - le balayage est un SVG decoratif (aria-hidden, non focusable), aucun
 *    asset du kit embarque ;
 *  - le titre est lisible AA sur la bande (mesure, 2 modes du site).
 *
 * Le contraste du bouton soleil est mesure par home-cta-contrast.spec.ts.
 */

import { expect, test } from '@playwright/test'

import { applyBrand } from './_support/marketing-theme'

test.describe('HomeCta — bande de CTA finale', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/', { waitUntil: 'networkidle' })
    })

    test('la section est labellee par le H2 #cta-title, unique', async ({ page }) => {
        const section = page.locator('section.home-cta')
        await expect(section).toBeVisible()
        await expect(section).toHaveAttribute('aria-labelledby', 'cta-title')
        await expect(page.locator('section.home-cta h2')).toHaveCount(1)
        await expect(page.locator('h2#cta-title')).toContainText('Ready to build your interfaces?')
    })

    test('« Explorer les composants » mene a /components', async ({ page }) => {
        const btn = page.locator('[data-cy="cta-btn-start"]')
        await expect(btn).toBeVisible()
        await expect(btn).toContainText('Explore the components')
        await expect(btn).toHaveAttribute('href', '/components')
    })

    test('« Lire la documentation » mene a /docs/ (meme cible que le header)', async ({ page }) => {
        const btn = page.locator('[data-cy="cta-btn-docs"]')
        await expect(btn).toBeVisible()
        await expect(btn).toContainText('Read the documentation')
        await expect(btn).toHaveAttribute('href', '/docs/')
    })

    test('les deux CTA se focalisent au clavier', async ({ page }) => {
        for (const cy of ['cta-btn-start', 'cta-btn-docs']) {
            const btn = page.locator(`[data-cy="${ cy }"]`)
            await btn.focus()
            await expect(btn).toBeFocused()
        }
    })

    test('le balayage est un SVG decoratif, hors arbre d\'accessibilite et du clavier', async ({ page }) => {
        const svg = page.locator('section.home-cta svg.home-cta__brush')
        await expect(svg).toHaveAttribute('aria-hidden', 'true')
        await expect(svg).toHaveAttribute('focusable', 'false')
        await expect(page.locator('section.home-cta img')).toHaveCount(0)
    })

    for (const mode of ['light', 'dark'] as const) {
        test(`le titre est lisible AA (>= 4.5:1) sur la bande — site en ${ mode }`, async ({ page }) => {
            await applyBrand(page, 'origam', mode)

            const ratio = await page.locator('h2#cta-title').evaluate((el) => {
                const parse = (c: string) => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
                const lum = ([r, g, b]: number[]) => {
                    const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }
                    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
                }
                const section = el.closest('section') as HTMLElement
                const fg = lum(parse(getComputedStyle(el).color))
                const bg = lum(parse(getComputedStyle(section).backgroundColor))
                const [hi, lo] = fg > bg ? [fg, bg] : [bg, fg]
                return (hi + 0.05) / (lo + 0.05)
            })
            expect(ratio).toBeGreaterThanOrEqual(4.5)
        })
    }

    test('la bande reste sombre meme quand le site est en clair', async ({ page }) => {
        await applyBrand(page, 'origam', 'light')
        await expect(page.locator('[data-mode="dark"] > section.home-cta')).toHaveCount(1)
    })

    test('aucune cle i18n brute dans la section', async ({ page }) => {
        const text = await page.locator('section.home-cta').textContent()
        expect(text).not.toContain('home.cta.')
    })
})
