/**
 * installation — spec e2e (DS-first)
 *
 * Vérifie que la page /installation utilise bien les composants origam :
 * - La page charge sans erreur JS console (200, 0 erreur)
 * - Le H1 hero est rendu par OrigamTitle (.origam-title)
 * - Les blocs de code sont rendus par OrigamCode (.origam-code)
 * - La table peer-deps est un OrigamTable (.origam-table)
 * - Les avatars des étapes sont des OrigamAvatar (.origam-avatar)
 * - Les boutons CTA sont des OrigamBtn (.origam-btn)
 * - Audit a11y axe-core : 0 violation critical/serious
 *
 * Run :
 *   pnpm -F @origam/tests playwright test \
 *     --config=playwright.marketing.config.ts installation.spec.ts
 */

import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const BASE = '/installation'

test.describe('installation — DS-first', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(BASE)
        await page.waitForLoadState('networkidle')
    })

    test('la page se charge sans erreur JS console', async ({ page }) => {
        const errors: string[] = []
        page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
        await page.goto(BASE)
        await page.waitForLoadState('networkidle')
        const criticalErrors = errors.filter(e =>
            !e.includes('favicon') && !e.includes('DevTools')
        )
        expect(criticalErrors).toHaveLength(0)
    })

    test('le h1 hero est rendu par OrigamTitle (.origam-title)', async ({ page }) => {
        const heroTitle = page.locator('#installation-title')
        await expect(heroTitle).toBeVisible()
        await expect(heroTitle).toHaveClass(/origam-title/)
    })

    test('les titres de section h2 sont des OrigamTitle', async ({ page }) => {
        const sectionTitles = page.locator(
            '#installation-steps-title, #installation-peer-deps-title, #installation-cta-title'
        )
        const count = await sectionTitles.count()
        expect(count).toBeGreaterThanOrEqual(3)
        for (let i = 0; i < count; i++) {
            await expect(sectionTitles.nth(i)).toHaveClass(/origam-title/)
        }
    })

    test('les blocs de code sont rendus par OrigamCode (.origam-code)', async ({ page }) => {
        const codeBlocks = page.locator('.origam-code')
        const count = await codeBlocks.count()
        expect(count).toBeGreaterThanOrEqual(5)
    })

    test('les OrigamTabs npm/pnpm/yarn vivent dans le header du bloc install', async ({ page }) => {
        const code = page.locator('[data-cy="installation-code-install"]')
        await expect(code).toHaveClass(/origam-code/)
        const tabs = code.locator('.origam-code__header .installation-step__pm-tabs .origam-tab')
        await expect(tabs).toHaveCount(3)
        await expect(tabs.nth(0)).toHaveText('npm')
        await expect(code.locator('[data-cy="installation-code-install-copy"]')).toBeVisible()
        await expect(code.locator('.origam-code__copy--floating')).toHaveCount(0)
    })

    test('changer d\'onglet swappe la commande affichée dans le code', async ({ page }) => {
        const code = page.locator('[data-cy="installation-code-install"]')
        await expect(code).toContainText('npm install origam')

        await code.locator('.installation-step__pm-tabs .origam-tab', { hasText: 'pnpm' }).first().click()
        await expect(code).toContainText('pnpm add origam')

        await code.locator('.installation-step__pm-tabs .origam-tab', { hasText: 'yarn' }).first().click()
        await expect(code).toContainText('yarn add origam')
    })

    test('le bloc register a un filename main.ts affiché', async ({ page }) => {
        const codeRegister = page.locator('[data-cy="installation-code-register"]')
        await expect(codeRegister).toBeVisible()
        const filename = codeRegister.locator('[data-cy="origam-code-filename"]')
        await expect(filename).toBeVisible()
        await expect(filename).toContainText('main.ts')
    })

    test('le bloc nuxt.config.ts est affiché', async ({ page }) => {
        await page.locator('[data-cy="installation-step-nuxt"]').scrollIntoViewIfNeeded()
        const codeNuxt = page.locator('[data-cy="installation-code-nuxt"]')
        await expect(codeNuxt).toBeVisible()
        await expect(codeNuxt).toHaveClass(/origam-code/)
    })

    test('la table peer-deps est un OrigamTable (.origam-table)', async ({ page }) => {
        const table = page.locator('[data-cy="installation-peer-deps-table"]')
        await expect(table).toBeVisible()
        await expect(table).toHaveClass(/origam-table/)
    })

    test('la table peer-deps contient 3 lignes (vue, vue-i18n, vue-router)', async ({ page }) => {
        const rows = page.locator('[data-cy^="peer-dep-"]')
        await expect(rows).toHaveCount(3)
        await expect(page.locator('[data-cy="peer-dep-vue"]')).toBeVisible()
        await expect(page.locator('[data-cy="peer-dep-vue-i18n"]')).toBeVisible()
        await expect(page.locator('[data-cy="peer-dep-vue-router"]')).toBeVisible()
    })

    test('les avatars des étapes sont des OrigamAvatar (.origam-avatar)', async ({ page }) => {
        const avatars = page.locator('.installation-step__avatar')
        const count = await avatars.count()
        expect(count).toBeGreaterThanOrEqual(5)
        for (let i = 0; i < count; i++) {
            await expect(avatars.nth(i)).toHaveClass(/origam-avatar/)
        }
    })

    test('l\'eyebrow du hero est celui de l\'en-tete commun (#1587), sans pastille', async ({ page }) => {
        const badge = page.locator('[data-cy="page-header-eyebrow"] [data-cy="installation-hero-badge"]')
        await expect(badge).toBeVisible()
        await expect(page.locator('[data-cy="page-installation"] .origam-chip.installation-hero__badge')).toHaveCount(0)
    })

    test('les boutons CTA sont des OrigamBtn (.origam-btn)', async ({ page }) => {
        await page.locator('[data-cy="installation-cta"]').scrollIntoViewIfNeeded()
        const btns = page.locator('[data-cy="installation-cta-components"], [data-cy="installation-cta-github"]')
        const count = await btns.count()
        expect(count).toBe(2)
        for (let i = 0; i < count; i++) {
            await expect(btns.nth(i)).toHaveClass(/origam-btn/)
        }
    })

    test('zéro balise h1/h2/h3/h4 native non Origam dans le contenu de la page', async ({ page }) => {
        const nativeHeadings = await page.evaluate(() => {
            const container = document.querySelector('[data-cy="page-installation"]')
            if (!container) return []
            const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'))
            return headings
                .filter(el => !el.classList.contains('origam-title') && !el.closest('.origam-title'))
                .map(el => el.outerHTML.slice(0, 120))
        })
        expect(nativeHeadings).toHaveLength(0)
    })

    test('audit a11y axe-core — 0 violation critical/serious (hors tokens shiki DS)', async ({ page }) => {
        // Known DS limitation: shiki-light color tokens (#6A737D comments, #D73A49 keywords)
        // have contrast ratios 4.27–4.49 on the brand-theme code background (#fbf5ff).
        // This is a DS-level issue (OrigamCode shiki token mapping), tracked separately.
        // We exclude the origam-code__code spans from the a11y audit to isolate page-level issues.
        const results = await new AxeBuilder({ page })
            .include('[data-cy="page-installation"]')
            .exclude('.origam-code__code')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze()
        const critical = results.violations.filter(v =>
            v.impact === 'critical' || v.impact === 'serious'
        )
        if (critical.length > 0) {
            console.error('A11y violations:', JSON.stringify(critical.map(v => ({
                id: v.id,
                impact: v.impact,
                description: v.description,
                nodes: v.nodes.length
            })), null, 2))
        }
        expect(critical).toHaveLength(0)
    })
})
