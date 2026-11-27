/**
 * home-cta.spec.ts — bande de CTA finale (#1517, maquette A du kit A1)
 *
 * Contrat :
 *  - <section> labellee par le H2 #cta-title, sous-arbre force en mode sombre
 *    (bande encre/lilas du kit en clair comme en sombre, #1574) ;
 *  - deux CTA (#1543) : « Installer » (/installation) et « Explorer les
 *    composants » (/components) ;
 *  - une ligne de soutien discrete qui mene a /support (seul canal : le don) ;
 *  - le pinceau est un fond CSS du kit (aucune balise img/svg dans la section,
 *    donc rien dans l'arbre d'accessibilite) ;
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

    test('le pinceau est un fond CSS decoratif : ni img ni svg dans la section', async ({ page }) => {
        await expect(page.locator('section.home-cta.enso-art')).toHaveCount(1)
        await expect(page.locator('section.home-cta img')).toHaveCount(0)
        await expect(page.locator('section.home-cta svg')).toHaveCount(0)
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
                let node: HTMLElement | null = section
                while (node && /rgba\(0, 0, 0, 0\)|transparent/.test(getComputedStyle(node).backgroundColor)) node = node.parentElement
                const bg = lum(parse(getComputedStyle(node ?? document.body).backgroundColor))
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
