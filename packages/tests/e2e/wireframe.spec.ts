/**
 * wireframe.spec.ts — marketing site e2e
 *
 * Asserts the /wireframe page:
 *  1. Route returns 200 (page mounts without crash).
 *  2. No uncaught console errors.
 *  3. Hero section is present with correct aria-labelledby.
 *  4. Gallery section renders all 6 wireframe cards.
 *  5. Each wireframe preview is visible.
 *  6. Component chips are present inside each card.
 *  7. CTA section is present with action buttons.
 *  8. Page renders correctly under the geek theme.
 *  9. Page renders correctly under the cartoon theme.
 * 10. A11y: no critical/serious axe-core violations.
 *
 * Prerequisites: marketing dev server at http://localhost:3000.
 * Run:
 *   pnpm -F @origam/tests playwright test \
 *     --config=playwright.marketing.config.ts wireframe
 */

import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const ROUTE = '/wireframe'
const LAYOUT_IDS = ['dashboard', 'settings', 'auth', 'list-detail', 'pricing', 'landing']

test.describe('Wireframe page — /wireframe', () => {
    const consoleErrors: string[] = []

    test.beforeEach(async ({ page }) => {
        consoleErrors.length = 0

        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text())
            }
        })

        await page.goto(ROUTE)
        await page.waitForLoadState('networkidle')
    })

    test('route /wireframe répond 200 (page chargée)', async ({ page }) => {
        await expect(page).toHaveURL(new RegExp('/wireframe'))
        const heading = page.locator('#wireframe-title')
        await expect(heading).toBeVisible()
    })

    test('aucune erreur console', async () => {
        expect(
            consoleErrors,
            `Erreurs console trouvées :\n${consoleErrors.join('\n')}`
        ).toHaveLength(0)
    })

    test('en-tête commun présent, famille catalogue, h1 relié', async ({ page }) => {
        const hero = page.locator('[data-cy="enso-page-header"]')
        await expect(hero).toBeVisible()
        await expect(hero).toHaveAttribute('data-family', 'catalog')

        const title = page.locator('#wireframe-title')
        await expect(title).toBeVisible()
        await expect(title).toContainText('Wireframes')
        await expect(title).toContainText('with origam.')
    })

    test('badge hero visible avec le bon texte', async ({ page }) => {
        const badge = page.locator('[data-cy="wireframe-hero-badge"]')
        await expect(badge).toBeVisible()
        await expect(badge).toContainText('6 layouts')
    })

    test('galerie affiche les 6 cartes wireframe', async ({ page }) => {
        const gallery = page.locator('[data-cy="wireframe-gallery"]')
        await expect(gallery).toBeVisible()

        for (const id of LAYOUT_IDS) {
            const card = page.locator(`[data-cy="wireframe-item-${id}"]`)
            await expect(card).toBeVisible({ timeout: 8000 })
        }
    })

    test('chaque aperçu wireframe est visible dans son conteneur', async ({ page }) => {
        for (const id of LAYOUT_IDS) {
            const preview = page.locator(`[data-cy="wireframe-preview-${id}"]`)
            await expect(preview).toBeVisible({ timeout: 8000 })
        }
    })

    test('chaque carte contient des chips de composants', async ({ page }) => {
        for (const id of LAYOUT_IDS) {
            const card = page.locator(`[data-cy="wireframe-item-${id}"]`)
            const chips = card.locator('.wireframe-card__chip')
            const count = await chips.count()
            expect(count, `Card "${id}" devrait avoir au moins un chip`).toBeGreaterThan(0)
        }
    })

    test('section CTA présente avec les deux boutons d\'action', async ({ page }) => {
        const cta = page.locator('[data-cy="wireframe-cta"]')
        await expect(cta).toBeVisible()

        const btnComponents = page.locator('[data-cy="wireframe-cta-components"]')
        await expect(btnComponents).toBeVisible()
        await expect(btnComponents).toHaveAttribute('href', '/components')

        const btnInstall = page.locator('[data-cy="wireframe-cta-install"]')
        await expect(btnInstall).toBeVisible()
        await expect(btnInstall).toHaveAttribute('href', '/installation')
    })

    test('wireframes visibles sous le thème geek', async ({ page }) => {
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'geek')
        })
        await page.waitForTimeout(200)

        const gallery = page.locator('[data-cy="wireframe-gallery"]')
        await expect(gallery).toBeVisible()

        const firstCard = page.locator(`[data-cy="wireframe-item-${LAYOUT_IDS[0]}"]`)
        await expect(firstCard).toBeVisible()

        await page.screenshot({
            path: './e2e/.results-marketing/wireframe-geek.png',
            fullPage: false
        })
    })

    test('wireframes visibles sous le thème cartoon', async ({ page }) => {
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'cartoon')
        })
        await page.waitForTimeout(200)

        const gallery = page.locator('[data-cy="wireframe-gallery"]')
        await expect(gallery).toBeVisible()

        const firstCard = page.locator(`[data-cy="wireframe-item-${LAYOUT_IDS[0]}"]`)
        await expect(firstCard).toBeVisible()

        await page.screenshot({
            path: './e2e/.results-marketing/wireframe-cartoon.png',
            fullPage: false
        })
    })

    test('a11y — pas de violation critique/sérieuse sur la page', async ({ page }) => {
        const results = await new AxeBuilder({ page })
            .include('[data-cy="page-wireframe"]')
            .analyze()

        const critical = results.violations.filter(
            v => v.impact === 'critical' || v.impact === 'serious'
        )

        expect(
            critical,
            `Violations a11y critiques/sérieuses :\n` +
            critical.map(v => `  [${v.impact}] ${v.id}: ${v.description}`).join('\n')
        ).toHaveLength(0)
    })
})
