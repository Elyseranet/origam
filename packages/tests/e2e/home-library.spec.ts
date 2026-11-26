/**
 * HomeLibrary e2e spec (#1517, lot 4B) — the 6 category cards open the REAL
 * catalogue category they stand for (`/components#components-category-…`).
 *
 * Requires `<home-library>` to be mounted on the home page.
 *
 *   pnpm -F @origam/tests playwright test \
 *     --config=playwright.marketing.config.ts home-library.spec.ts
 */

import { expect, test } from '@playwright/test'

const BASE = process.env.MARKETING_BASE_URL ?? 'http://localhost:3000'

const CARDS: Array<[string, string]> = [
    ['forms', 'Form & Input'],
    ['navigation', 'Navigation'],
    ['data', 'Data Display'],
    ['feedback', 'Feedback & Status'],
    ['overlays', 'Overlay & Surface'],
    ['layout', 'Layout & Structure']
]

test.describe('HomeLibrary section', () => {
    test('renders 6 category cards under a single h2', async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'domcontentloaded' })
        const section = page.locator('section#library')
        await expect(section).toBeVisible()
        await expect(section.locator('h2')).toHaveCount(1)
        await expect(section.locator('[data-cy^="library-card-"]')).toHaveCount(6)
    })

    for (const [key, category] of CARDS) {
        test(`card "${key}" opens the "${category}" catalogue group`, async ({ page }) => {
            await page.goto(BASE, { waitUntil: 'domcontentloaded' })
            await page.locator(`[data-cy="library-card-${key}"]`).click()
            await page.waitForURL(/\/components#components-category-/)

            const anchor = page.url().split('#')[1]
            const group = page.locator(`#${anchor}`)
            await expect(group).toBeVisible()
            await expect(group.locator('h3').first()).toHaveText(category)
        })
    }
})
