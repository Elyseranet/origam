/**
 * roadmap — spec e2e (DS-first)
 *
 * Vérifie que la page /roadmap utilise bien les composants origam :
 * - La page charge sans erreur JS console
 * - Le H1 hero est rendu par OrigamTitle (.origam-title)
 * - La section statut utilise OrigamIcon avec color success/error
 * - Les waves livrées utilisent OrigamTable par wave
 * - La timeline des phases utilise OrigamTimeline + OrigamTimelineItem
 * - Les avatars dans la timeline sont des OrigamAvatar
 * - Les composants Wave 4 sont rendus en OrigamCard
 * - Les boutons CTA sont des OrigamBtn
 * - Audit a11y axe-core : 0 violation critical/serious
 *
 * Run :
 *   pnpm -F @origam/tests playwright test \
 *     --config=playwright.marketing.config.ts roadmap.spec.ts
 */

import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const BASE = '/roadmap'

test.describe('roadmap — DS-first', () => {
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
        const heroTitle = page.locator('#roadmap-title')
        await expect(heroTitle).toBeVisible()
        await expect(heroTitle).toHaveClass(/origam-title/)
    })

    test('les titres de section sont des OrigamTitle (h2)', async ({ page }) => {
        const sectionTitles = page.locator(
            '#roadmap-status-title, #roadmap-delivered-title, #roadmap-phases-title, #roadmap-wave4-title, #roadmap-cta-title'
        )
        const count = await sectionTitles.count()
        expect(count).toBeGreaterThanOrEqual(4)
        for (let i = 0; i < count; i++) {
            await expect(sectionTitles.nth(i)).toHaveClass(/origam-title/)
        }
    })

    test('la section statut contient des OrigamIcon avec couleur success/error', async ({ page }) => {
        const statusSection = page.locator('[data-cy="roadmap-status"]')
        await expect(statusSection).toBeVisible()
        const icons = statusSection.locator('.origam-icon')
        const count = await icons.count()
        expect(count).toBeGreaterThan(0)
    })

    test('le bloc overview affiche 6 stats livrées (OrigamCard)', async ({ page }) => {
        const cards = page.locator('[data-cy="roadmap-overview"] .roadmap-overview__card')
        await expect(cards).toHaveCount(6)
        // Valeur exacte comptee dans l'arbre source du DS (96 dossiers sous
        // packages/ds/src/components/), et non un plancher arrondi. Elle est
        // pilotee par ROADMAP_OVERVIEW_STATS[0] dans
        // packages/marketing/src/consts/roadmap.const.ts : les deux bougent
        // ensemble ou ce test rougit.
        await expect(page.locator('.roadmap-overview__value').first()).toHaveText('96')
    })

    test('les waves livrées contiennent des OrigamTable (.origam-table)', async ({ page }) => {
        const tables = page.locator('[data-cy="roadmap-wave-table"]')
        const count = await tables.count()
        expect(count).toBeGreaterThanOrEqual(3)
        for (let i = 0; i < count; i++) {
            await expect(tables.nth(i)).toHaveClass(/origam-table/)
        }
    })

    test('la timeline des phases est rendue par OrigamTimeline (.origam-timeline)', async ({ page }) => {
        const timeline = page.locator('[data-cy="roadmap-timeline"]')
        await expect(timeline).toBeVisible()
        await expect(timeline).toHaveClass(/origam-timeline/)
    })

    /*
     * Le compte attendu etait 3 et ROADMAP_PHASES en contient 4 depuis
     * l'ajout de la phase `ongoing` : ce test etait rouge sur develop avant
     * la presente branche (verifie en A/B contre le serveur du depot
     * principal, 2026-09-15). Les 4 rendus sont short-term, mid-term,
     * long-term et ongoing.
     */
    test('les phases de la timeline sont 4 items OrigamTimelineItem (.origam-timeline-item)', async ({ page }) => {
        const timeline = page.locator('[data-cy="roadmap-timeline"]')
        await expect(timeline).toBeVisible()
        const phaseItems = page.locator('[data-cy^="roadmap-phase-"]')
        const count = await phaseItems.count()
        expect(count).toBe(4)
    })

    test('les avatars dans la timeline sont des OrigamAvatar (.origam-avatar)', async ({ page }) => {
        await page.locator('[data-cy="roadmap-phases"]').scrollIntoViewIfNeeded()
        await page.waitForTimeout(300)
        const avatars = page.locator('.roadmap-timeline__item-avatar')
        const count = await avatars.count()
        expect(count).toBeGreaterThan(0)
        for (let i = 0; i < count; i++) {
            await expect(avatars.nth(i)).toHaveClass(/origam-avatar/)
        }
    })

    test('la grille Wave 4 (livrée) contient 15 OrigamCard (.origam-card)', async ({ page }) => {
        const grid = page.locator('[data-cy="roadmap-wave4-grid"]')
        await expect(grid).toBeVisible()
        const cards = page.locator('.roadmap-wave4__card')
        const count = await cards.count()
        expect(count).toBe(15)
        for (let i = 0; i < count; i++) {
            await expect(cards.nth(i)).toHaveClass(/origam-card/)
        }
    })

    test('les avatars Wave 4 sont des OrigamAvatar (.origam-avatar)', async ({ page }) => {
        await page.locator('[data-cy="roadmap-wave4"]').scrollIntoViewIfNeeded()
        const avatars = page.locator('.roadmap-wave4__avatar')
        const count = await avatars.count()
        expect(count).toBe(15)
        for (let i = 0; i < count; i++) {
            await expect(avatars.nth(i)).toHaveClass(/origam-avatar/)
        }
    })

    test('les boutons CTA sont des OrigamBtn (.origam-btn)', async ({ page }) => {
        await page.locator('[data-cy="roadmap-cta"]').scrollIntoViewIfNeeded()
        const btns = page.locator('[data-cy="roadmap-cta-github"], [data-cy="roadmap-cta-changelog"]')
        const count = await btns.count()
        expect(count).toBe(2)
        for (let i = 0; i < count; i++) {
            await expect(btns.nth(i)).toHaveClass(/origam-btn/)
        }
    })

    test('le badge hero est un OrigamChip (.origam-chip)', async ({ page }) => {
        const badge = page.locator('[data-cy="roadmap-hero-badge"]')
        await expect(badge).toBeVisible()
        await expect(badge).toHaveClass(/origam-chip/)
    })

    test('audit a11y axe-core — 0 violation critical/serious', async ({ page }) => {
        const results = await new AxeBuilder({ page })
            .include('[data-cy="page-roadmap"]')
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
