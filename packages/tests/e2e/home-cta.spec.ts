/**
 * home-cta.spec.ts — bande de CTA finale (#1517, maquette A du kit A1)
 *
 * Contrat :
 *  - <section> labellee par le H2 #cta-title, sous-arbre force en mode sombre
 *    (la bande reste encre/violet en clair comme en sombre) ;
 *  - deux CTA (#1543) : « Installer » (/installation) et « Explorer les
 *    composants » (/components) ;
 *  - une ligne de soutien discrete qui mene a /support (seul canal : le don) ;
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
        await expect(page.locator('h2#cta-title')).toContainText('Three steps to begin.')
    })

    test('« Installer » mene a /installation (action principale, #1543 A3)', async ({ page }) => {
        const btn = page.locator('[data-cy="cta-btn-start"]')
        await expect(btn).toBeVisible()
        await expect(btn).toContainText('Install')
        await expect(btn).toHaveAttribute('href', '/installation')
    })

    test('« Explorer les composants » mene a /components', async ({ page }) => {
        const btn = page.locator('[data-cy="cta-btn-docs"]')
        await expect(btn).toBeVisible()
        await expect(btn).toContainText('Explore the components')
        await expect(btn).toHaveAttribute('href', '/components')
    })

    test('la description et le lien de soutien vers /support sont rendus', async ({ page }) => {
        await expect(page.locator('[data-cy="cta-description"]')).toContainText('npm i origam')
        await expect(page.locator('[data-cy="cta-support"]')).toContainText('MIT')
        const link = page.locator('[data-cy="cta-support-link"]')
        await expect(link).toHaveAttribute('href', '/support')
        await expect(link).toContainText('Support the project')
        await expect(page.locator('section.home-cta')).not.toContainText(/Sponsors|Open Collective/)
    })

    test('les deux CTA se focalisent au clavier', async ({ page }) => {
        for (const cy of ['cta-btn-start', 'cta-btn-docs', 'cta-support-link']) {
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
                const section = el.closest('.home-cta__inner') as HTMLElement
                const fg = lum(parse(getComputedStyle(el).color))
                const bg = lum(parse(getComputedStyle(section).backgroundColor))
                const [hi, lo] = fg > bg ? [fg, bg] : [bg, fg]
                return (hi + 0.05) / (lo + 0.05)
            })
            expect(ratio).toBeGreaterThanOrEqual(4.5)
        })
    }

    test('desktop : titre a gauche, boutons a droite, 28-30 px / 600, boutons x-large', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 })
        const title = await page.locator('h2#cta-title').boundingBox()
        const btn = await page.locator('[data-cy="cta-btn-start"]').boundingBox()
        expect(title!.x).toBeLessThan(btn!.x)
        expect(btn!.height).toBeGreaterThanOrEqual(52)
        await expect(page.locator('h2#cta-title')).toHaveCSS('font-weight', '600')
        const fs = await page.locator('h2#cta-title').evaluate(el => parseFloat(getComputedStyle(el).fontSize))
        expect(fs).toBeGreaterThanOrEqual(28)
        expect(fs).toBeLessThanOrEqual(30)
        const band = await page.locator('.home-cta__band').boundingBox()
        expect(band!.height).toBeLessThanOrEqual(230)
        // bande bord a bord ; contenu aligne sur le conteneur commun (bord a 80 px a 1440)
        expect(band!.x).toBe(0)
        expect(band!.width).toBe(1440)
        expect(Math.round(title!.x)).toBe(80)
    })

    test('le pinceau : eventail jaune sur le tiers droit seulement', async ({ page }) => {
        const svg = await page.locator('svg.home-cta__brush').boundingBox()
        const fan = await page.locator('.home-cta__fan').boundingBox()
        expect(fan!.x - svg!.x).toBeGreaterThan(svg!.width * 0.6)
    })

    test('la bande reste sombre meme quand le site est en clair', async ({ page }) => {
        await applyBrand(page, 'origam', 'light')
        await expect(page.locator('[data-mode="dark"] > section.home-cta')).toHaveCount(1)
    })

    test('aucune cle i18n brute dans la section', async ({ page }) => {
        const text = await page.locator('section.home-cta').textContent()
        expect(text).not.toContain('home.cta.')
    })
})
