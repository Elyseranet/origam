/**
 * T4 — HomePlayground e2e spec (SPEC-028) — v5-phase1 rebuild
 *
 * Targets: http://localhost:3000 (Nuxt dev or preview server)
 *
 * Run with the marketing Playwright config:
 *   pnpm -F @origam/tests playwright test \
 *     --config=playwright.marketing.config.ts \
 *     home-playground.spec.ts
 *
 * v5-phase1 rework: le REPL live-editor (supprimé) avait été remplacé par un split
 * statique OrigamCode (gauche, data-cy="playground-code") | preview card (droite,
 * data-cy="playground-preview"). Les boutons SHARE / OPEN et le
 * data-cy="playground-repl" ont été supprimés intentionnellement.
 */

import { expect, test } from '@playwright/test'

const BASE = process.env.MARKETING_BASE_URL ?? 'http://localhost:3000'

test.describe('HomePlayground section', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    })

    test('section is rendered by SSR — returns HTTP 200', async ({ page, request }) => {
        const response = await request.get(BASE)
        expect(response.status()).toBe(200)

        const section = page.locator('section#playground')
        await expect(section).toBeVisible()
    })

    test('eyebrow text is present', async ({ page }) => {
        const eyebrow = page.locator('section#playground .home-playground__eyebrow')
        await expect(eyebrow).toContainText('CODE EXAMPLE')
    })

    test('h2 title is present', async ({ page }) => {
        const title = page.locator('section#playground h2')
        await expect(title).toContainText('A few lines, real components.')
    })

    test('toolbar shows file tab (App.vue) — no SHARE/OPEN buttons', async ({ page }) => {
        const toolbar = page.locator('section#playground .home-playground__toolbar')
        await expect(toolbar).toBeVisible()

        const tab = toolbar.locator('.home-playground__tab')
        await expect(tab).toContainText('App.vue')

        // SHARE / OPEN supprimés en v5-phase1 (split statique OrigamCode + preview)
        await expect(page.locator('[data-cy="playground-btn-share"]')).toHaveCount(0)
        await expect(page.locator('[data-cy="playground-btn-open"]')).toHaveCount(0)
    })

    test('OrigamCode pane is present (left split)', async ({ page }) => {
        const codePane = page.locator('[data-cy="playground-code"]')
        await expect(codePane).toBeVisible()
        // OrigamCode renders a <pre><code> block
        const pre = codePane.locator('pre code')
        await expect(pre).toBeAttached()
    })

    test('preview card pane is present (right split)', async ({ page }) => {
        const previewPane = page.locator('[data-cy="playground-preview"]')
        await expect(previewPane).toBeVisible()
    })

    test('caption figcaption is present', async ({ page }) => {
        const caption = page.locator('section#playground .home-playground__caption')
        await expect(caption).toBeVisible()
        await expect(caption).not.toBeEmpty()
    })

    test('no legacy REPL container (playground-repl) — replaced by static split', async ({ page }) => {
        await expect(page.locator('[data-cy="playground-repl"]')).toHaveCount(0)
    })

    test('section has no duplicate h1 — heading hierarchy is valid', async ({ page }) => {
        const h1Count = await page.locator('h1').count()
        expect(h1Count).toBeLessThanOrEqual(1)

        const playgroundH2 = page.locator('section#playground h2')
        await expect(playgroundH2).toHaveCount(1)
    })

    test('SSR does not inject hydration mismatch warning', async ({ page }) => {
        const errors: string[] = []
        page.on('console', msg => {
            if (msg.type() === 'error' || msg.text().includes('Hydration') || msg.text().includes('hydration')) {
                errors.push(msg.text())
            }
        })

        await page.goto(BASE, { waitUntil: 'networkidle' })

        const hydrationErrors = errors.filter(e =>
            e.toLowerCase().includes('hydration') ||
            e.toLowerCase().includes('mismatch')
        )
        expect(hydrationErrors).toHaveLength(0)
    })
})
