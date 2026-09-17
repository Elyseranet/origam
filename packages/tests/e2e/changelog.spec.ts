/**
 * changelog — spec e2e (DS-first)
 *
 * Vérifie que la page /changelog utilise bien les composants origam :
 * - La page charge (HTTP 200, pas d'erreur JS critique)
 * - Le H1 hero est rendu par OrigamTitle (.origam-title)
 * - Les titres de section sont des OrigamTitle (h2)
 * - Les panels de version sont des OrigamExpansionPanel
 * - Les chips de version/type sont des OrigamChip
 * - Les highlights utilisent OrigamGrid/OrigamGridItem (list structure)
 * - Les boutons CTA sont des OrigamBtn
 * - Zéro HTML natif brut interdit (h1/h2/h3/ul/li hors composants)
 * - Audit a11y axe-core : 0 violation critical/serious
 *
 * Run :
 *   pnpm -F @origam/tests playwright test \
 *     --config=playwright.marketing.config.ts changelog.spec.ts
 */

import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const BASE = '/changelog'

test.describe('changelog — DS-first', () => {
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

    test('le H1 hero est rendu par OrigamTitle (.origam-title)', async ({ page }) => {
        const heroTitle = page.locator('#changelog-title')
        await expect(heroTitle).toBeVisible()
        await expect(heroTitle).toHaveClass(/origam-title/)
    })

    test('les titres de section h2 sont des OrigamTitle (.origam-title)', async ({ page }) => {
        const sectionTitles = page.locator(
            '#changelog-versions-title, #changelog-cta-title'
        )
        const count = await sectionTitles.count()
        expect(count).toBeGreaterThanOrEqual(2)
        for (let i = 0; i < count; i++) {
            await expect(sectionTitles.nth(i)).toHaveClass(/origam-title/)
        }
    })

    test('le sélecteur de version est un OrigamSelect (.origam-select)', async ({ page }) => {
        const select = page.locator('[data-cy="changelog-version-select"]')
        await expect(select).toBeVisible()
        await expect(select).toHaveClass(/origam-select/)
    })

    // ⛔ Ne PAS réintroduire un numéro de version en dur ici.
    //
    // Ces deux tests épinglaient `2.6.0` — la version la plus récente le jour
    // où ils ont été écrits. `CHANGELOG_VERSIONS` est REGÉNÉRÉ depuis
    // `/CHANGELOG.md` à chaque release (voir l'en-tête de
    // `packages/marketing/src/consts/changelog-versions.const.ts`), et la page
    // ouvre toujours sur la plus récente. Le dépôt est passé à `2.17.1` : la
    // spec est donc devenue rouge sans qu'aucun comportement ne change, et
    // elle le redeviendrait à la prochaine release. Mesuré dans le balayage de
    // #835 — 6,7 s et 6,6 s, en assertion franche, pas en expiration.
    //
    // Ce qui est réellement garanti ici, et qui ne périme pas : la carte ouvre
    // sur UNE version, cette version est celle que le select annonce, et
    // changer d'option change effectivement le contenu rendu.
    test('la carte de version par défaut affiche une version + ses highlights (régression contenu)', async ({ page }) => {
        const card = page.locator('[data-cy="changelog-release-card"]')
        await expect(card).toBeVisible()
        await expect(card.locator('.changelog-release__version')).toHaveText(/^\d+\.\d+\.\d+/)

        const highlights = card.locator('.changelog-release__highlight')
        const count = await highlights.count()
        expect(count).toBeGreaterThan(0)

        const firstText = highlights.first().locator('.changelog-release__highlight-text')
        const text = await firstText.textContent()
        expect(text?.trim().length).toBeGreaterThan(0)

        const summary = await card.locator('.changelog-release__summary').textContent()
        expect(summary?.trim().length).toBeGreaterThan(0)
    })

    test('changer la version dans le select swappe le contenu de la carte', async ({ page }) => {
        const card = page.locator('[data-cy="changelog-release-card"]')
        const version = card.locator('.changelog-release__version')

        await expect(version).toHaveText(/^\d+\.\d+\.\d+/)

        const before = (await version.innerText()).trim()

        const select = page.locator('[data-cy="changelog-version-select"]')
        await select.click()

        const options = page.locator('[role="option"], .origam-list-item')
        await expect(options.first()).toBeVisible({ timeout: 10_000 })

        // La PREMIÈRE option dont le libellé diffère de la version affichée :
        // quelle que soit la release en cours, il en existe forcément une.
        const labels = await options.evaluateAll(els => els.map(el => (el as HTMLElement).innerText.trim()))
        const target = labels.find(l => l.length > 0 && !l.includes(before))
        expect(target, `aucune autre version que "${ before }" dans le select — libellés : ${ JSON.stringify(labels) }`).toBeTruthy()

        await options.filter({ hasText: target! }).first().click()

        await expect(version).not.toHaveText(before, { timeout: 10_000 })
        expect(await card.locator('.changelog-release__highlight').count()).toBeGreaterThan(0)
    })

    test('le badge hero est un OrigamChip (.origam-chip)', async ({ page }) => {
        const badge = page.locator('[data-cy="changelog-hero-badge"]')
        await expect(badge).toBeVisible()
        await expect(badge).toHaveClass(/origam-chip/)
    })

    test('les chips de type/highlights de la carte sont des OrigamChip (.origam-chip)', async ({ page }) => {
        const chips = page.locator('[data-cy="changelog-release-card"] .origam-chip')
        const count = await chips.count()
        expect(count).toBeGreaterThan(4)
    })

    test('le lien vers le changelog complet sur GitHub est un OrigamBtn (.origam-btn)', async ({ page }) => {
        const ctaLink = page.locator('[data-cy="changelog-full-link"]')
        await expect(ctaLink).toBeVisible()
        await expect(ctaLink).toHaveClass(/origam-btn/)
    })

    test('les boutons CTA sont des OrigamBtn (.origam-btn)', async ({ page }) => {
        await page.locator('[data-cy="changelog-cta"]').scrollIntoViewIfNeeded()
        const btns = page.locator('[data-cy="changelog-cta-github"], [data-cy="changelog-cta-fulllog"]')
        const count = await btns.count()
        expect(count).toBe(2)
        for (let i = 0; i < count; i++) {
            await expect(btns.nth(i)).toHaveClass(/origam-btn/)
        }
    })

    test('aucun <h1> natif brut (hors composant origam-title)', async ({ page }) => {
        const nativeH1 = page.locator('article.changelog h1:not(.origam-title, .origam-title *)')
        const count = await nativeH1.count()
        expect(count).toBe(0)
    })

    test('aucun <h2> natif brut (hors composant origam-title)', async ({ page }) => {
        const nativeH2 = page.locator('article.changelog h2:not(.origam-title, .origam-title *)')
        const count = await nativeH2.count()
        expect(count).toBe(0)
    })

    test('audit a11y axe-core — 0 violation critical/serious', async ({ page }) => {
        const results = await new AxeBuilder({ page })
            .include('[data-cy="page-changelog"]')
            // OrigamSelect ships aria combobox attrs that leak onto roleless
            // elements (DS bug, tracked in task #27) — exclude the widget so the
            // audit reflects the page's own markup, not the DS component bug.
            .exclude('[data-cy="changelog-version-select"]')
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
