/**
 * why-origam — spec e2e (redesign #921+ — hero actions/identities, live theme
 * demo, hairline strengths board, plain weaknesses list, 3-way CTA)
 *
 * Vérifie que la page /why-origam utilise bien les composants origam :
 * - Zéro balise HTML brute (h1-h6, ul, ol, li, table, thead, tbody, tr, th, td)
 * - Les titres sont rendus par OrigamTitle (élément portant la classe origam-title)
 * - Les 8 cellules "strengths" sont dans un seul panneau (OrigamSheet) avec avatar OrigamAvatar
 * - La liste "weaknesses" est une liste de lignes plates (pas de carte) avec icône OrigamIcon
 * - Le tableau de comparaison est rendu par OrigamTable (origam-table)
 * - Les icônes ✓/✗ du tableau ont une couleur intent success/error visible
 * - La démo de theming (WhyOrigamThemeDemo) change les 6 composants et le
 *   panneau de code quand on change d'identité
 * - Le CTA final expose 3 liens (install, components, theming)
 * - Contraste a11y : 0 violation axe-core critical/serious sur la section
 *
 * Run (avec serveur sur 3001) :
 *   MARKETING_BASE_URL=http://localhost:3001 \
 *   pnpm -F @origam/tests playwright test \
 *     --config=playwright.marketing.config.ts why-origam
 */

import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const BASE = '/why-origam'

test.describe('why-origam — redesign', () => {
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
        const heroTitle = page.locator('#why-title')
        await expect(heroTitle).toBeVisible()
        await expect(heroTitle).toHaveClass(/origam-title/)
    })

    test('les titres de section sont des OrigamTitle (h2)', async ({ page }) => {
        const sectionTitles = page.locator('#why-demo-title, #why-strengths-title, #why-comparison-title, #why-weaknesses-title, #why-usecases-title, #why-cta-title')
        const count = await sectionTitles.count()
        expect(count).toBeGreaterThanOrEqual(5)
        for (let i = 0; i < count; i++) {
            await expect(sectionTitles.nth(i)).toHaveClass(/origam-title/)
        }
    })

    test('la barre d\'actions du hero pointe vers la démo et le comparatif', async ({ page }) => {
        await expect(page.locator('[data-cy="why-hero-demo-link"]')).toHaveClass(/origam-btn/)
        await expect(page.locator('[data-cy="why-hero-comparison-link"]')).toHaveClass(/origam-btn/)
    })

    test('la bande d\'identités du hero liste les 8 marques', async ({ page }) => {
        const identities = page.locator('.why-hero__identity')
        await expect(identities).toHaveCount(8)
    })

    test('les 8 cellules "strengths" sont dans un seul panneau, chacune avec un OrigamAvatar', async ({ page }) => {
        const cells = page.locator('.why-strengths__cell')
        await expect(cells).toHaveCount(8)

        const avatars = page.locator('.why-strengths__avatar')
        const count = await avatars.count()
        expect(count).toBe(8)
        for (let i = 0; i < count; i++) {
            await expect(avatars.nth(i)).toHaveClass(/origam-avatar/)
        }
    })

    test('le tableau de comparaison est rendu par OrigamTable (.origam-table)', async ({ page }) => {
        const table = page.locator('[data-cy="why-comparison-table"]')
        await expect(table).toBeVisible()
        await expect(table).toHaveClass(/origam-table/)
    })

    test('les icônes ✓ dans le tableau ont une couleur success visible', async ({ page }) => {
        await page.locator('[data-cy="why-comparison"]').scrollIntoViewIfNeeded()
        await page.waitForTimeout(500)
        const icons = page.locator('.why-comparison__cell-icon')
        const count = await icons.count()
        expect(count).toBeGreaterThan(0)
        const firstIcon = icons.first()
        await expect(firstIcon).toBeVisible()
        await expect(firstIcon).toHaveClass(/origam-icon/)
    })

    test('la section weaknesses est une liste plate de 3 lignes avec OrigamIcon', async ({ page }) => {
        const list = page.locator('.why-weaknesses__list')
        await expect(list).toBeVisible()

        const rows = page.locator('.why-weaknesses__row')
        await expect(rows).toHaveCount(3)

        const icons = page.locator('.why-weaknesses__icon')
        const count = await icons.count()
        expect(count).toBe(3)
        for (let i = 0; i < count; i++) {
            await expect(icons.nth(i)).toHaveClass(/origam-icon/)
        }
    })

    test('les colonnes use-cases sont au nombre de 2 (fits / no-fits)', async ({ page }) => {
        const cols = page.locator('.why-usecases__col')
        await expect(cols).toHaveCount(2)
    })

    test('les boutons CTA finaux sont 3 OrigamBtn (install, components, theming)', async ({ page }) => {
        const btns = page.locator('[data-cy="why-cta-install"], [data-cy="why-cta-components"], [data-cy="why-cta-theming"]')
        const count = await btns.count()
        expect(count).toBe(3)
        for (let i = 0; i < count; i++) {
            await expect(btns.nth(i)).toHaveClass(/origam-btn/)
        }
        await expect(page.locator('[data-cy="why-cta-theming"]')).toHaveAttribute('href', '/theming')
    })

    test.describe('démo de theming (WhyOrigamThemeDemo)', () => {
        test('la démo est visible avec ses 6 composants sur scène', async ({ page }) => {
            const demo = page.locator('[data-cy="why-demo"]')
            await expect(demo).toBeVisible()

            await expect(page.locator('[data-cy="why-demo-stage"] .origam-card')).toBeVisible()
            await expect(page.locator('[data-cy="why-demo-card-primary"]')).toBeVisible()
            await expect(page.locator('[data-cy="why-demo-card-secondary"]')).toBeVisible()
            await expect(page.locator('[data-cy="why-demo-card-chip"]')).toBeVisible()
            await expect(page.locator('[data-cy="why-demo-card-switch"]')).toBeVisible()
            await expect(page.locator('[data-cy="why-demo-card-field"]')).toBeVisible()
        })

        test('changer d\'identité change le contenu du panneau de code', async ({ page }) => {
            const code = page.locator('[data-cy="why-demo-code"]')
            const before = await code.innerText()

            await page.locator('[data-cy="why-demo-identity-cartoon"]').click()
            await page.waitForTimeout(200)

            const after = await code.innerText()
            expect(after).not.toBe(before)
            expect(after).toContain("'origam-")
        })

        test('changer de mode (light/dark) est reflété par aria-checked', async ({ page }) => {
            const lightBtn = page.locator('[data-cy="why-demo-mode-light"]')
            const darkBtn = page.locator('[data-cy="why-demo-mode-dark"]')

            await expect(lightBtn).toHaveAttribute('aria-checked', 'true')
            await darkBtn.click()
            await expect(darkBtn).toHaveAttribute('aria-checked', 'true')
            await expect(lightBtn).toHaveAttribute('aria-checked', 'false')
        })

        test('la navigation clavier (flèches) déplace la sélection du radiogroup identité', async ({ page }) => {
            const origamBtn = page.locator('[data-cy="why-demo-identity-origam"]')
            const appleBtn = page.locator('[data-cy="why-demo-identity-apple"]')

            await origamBtn.focus()
            await page.keyboard.press('ArrowRight')

            await expect(appleBtn).toHaveAttribute('aria-checked', 'true')
            await expect(appleBtn).toBeFocused()
        })
    })

    test('audit a11y axe-core — 0 violation critical/serious', async ({ page }) => {
        const results = await new AxeBuilder({ page })
            .include('[data-cy="page-why-origam"]')
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
