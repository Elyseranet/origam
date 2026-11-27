/**
 * home-cta.spec.ts — CTA « Crépuscule » pleine largeur (#1596, maquette v12)
 *
 * Contrat :
 *  - <section> labellee par le H2 #cta-title, qui SUIT le mode du site (ciel
 *    clair en clair, ciel sombre en sombre — plus de sous-arbre force) ;
 *  - deux boutons : « Explorer les composants » (soleil, /components) et
 *    « Lire la documentation » (contour, /docs/, site statique : lien brut) ;
 *  - ni carte, ni pinceau, ni image dans la section : le decor (ciel en
 *    degrade + trois plans de paysage) est un fond CSS decoratif `aria-hidden` ;
 *  - le titre et la description sont lisibles AA sur le ciel peint (mesure par
 *    pixels : home-cta-contrast.spec.ts).
 *
 * Le paysage et le parallaxe sont couverts par home-cta-scene.spec.ts.
 */

import { expect, test } from '@playwright/test'

import { applyBrand } from './_support/marketing-theme'

test.describe('HomeCta — CTA « Crépuscule »', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/', { waitUntil: 'load' })
        await page.locator('section.home-cta').waitFor({ state: 'attached' })
    })

    test('la section est labellee par le H2 #cta-title, unique', async ({ page }) => {
        const section = page.locator('section.home-cta')
        await expect(section).toBeVisible()
        await expect(section).toHaveAttribute('aria-labelledby', 'cta-title')
        await expect(page.locator('section.home-cta h2')).toHaveCount(1)
        await expect(page.locator('h2#cta-title')).toContainText('Ready to build your interfaces?')
    })

    test('« Explorer les composants » mene a /components (action principale)', async ({ page }) => {
        const btn = page.locator('[data-cy="cta-btn-components"]')
        await expect(btn).toBeVisible()
        await expect(btn).toContainText('Explore the components')
        await expect(btn).toHaveAttribute('href', '/components')
    })

    test('« Lire la documentation » mene a /docs/ (site statique : lien brut, jamais localise)', async ({ page }) => {
        const btn = page.locator('[data-cy="cta-btn-docs"]')
        await expect(btn).toBeVisible()
        await expect(btn).toContainText('Read the documentation')
        await expect(btn).toHaveAttribute('href', '/docs/')
    })

    test('la description est rendue', async ({ page }) => {
        await expect(page.locator('[data-cy="cta-description"]')).toContainText('npm i origam')
    })

    test('les deux boutons se focalisent au clavier', async ({ page }) => {
        for (const cy of ['cta-btn-components', 'cta-btn-docs']) {
            const btn = page.locator(`[data-cy="${ cy }"]`)
            await btn.focus()
            await expect(btn).toBeFocused()
        }
    })

    test('aucune image ni svg dans la section : le decor est un fond CSS', async ({ page }) => {
        await expect(page.locator('section.home-cta')).toHaveCount(1)
        await expect(page.locator('section.home-cta img')).toHaveCount(0)
        await expect(page.locator('section.home-cta svg')).toHaveCount(0)
    })

    for (const mode of ['light', 'dark'] as const) {
        test(`la section suit le mode du site (${ mode }) : aucun sous-arbre force`, async ({ page }) => {
            await applyBrand(page, 'origam', mode)
            await expect(page.locator('section.home-cta')).toHaveCount(1)
            await expect(page.locator('[data-mode] > section.home-cta')).toHaveCount(0)
            const sky = await page.locator('section.home-cta').evaluate(el => getComputedStyle(el).backgroundImage)
            expect(sky).toContain('linear-gradient')
        })
    }

    test('aucune cle i18n brute dans la section', async ({ page }) => {
        const text = await page.locator('section.home-cta').textContent()
        expect(text).not.toContain('home.cta.')
    })
})
