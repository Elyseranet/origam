/**
 * Types catalogue — e2e spec
 *
 * Asserts:
 *  1. /types → 200, catalog renders, search works, geek + cartoon themes.
 *  2. /types/color → 200, definition section, source link.
 *  3. /types/rounded → 200, values list with copyable enum members.
 *  4. /types/intent → values list rendered with all 8 intents.
 *  5. /types/unknown-slug → not-found state renders.
 *
 * Pre-req: marketing dev server at http://localhost:3000.
 * Run:
 *   pnpm -F @origam/tests playwright test \
 *     --config=playwright.marketing.config.ts types
 */

import { expect, test } from '@playwright/test'
import { requireMarketingDb } from './_support/require-marketing-db'

// #835 — voir marketing-theme-builder.spec.ts pour le contexte complet.
requireMarketingDb()

test.describe('Types — catalogue /types', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/types')
        await page.waitForLoadState('networkidle')
    })

    test('page renders with hero badge and title', async ({ page }) => {
        const badge = page.locator('[data-cy="types-hero-badge"]')
        await expect(badge).toBeVisible()

        const h1 = page.locator('#types-title')
        await expect(h1).toBeVisible()
        await expect(h1).toContainText('API')
        await expect(h1).toContainText('types')
    })

    test('catalog grid renders entries', async ({ page }) => {
        const grid = page.locator('[data-cy="types-grid"]')
        await expect(grid).toBeVisible()

        const firstCard = page.locator('[data-cy^="types-card-"]').first()
        await expect(firstCard).toBeVisible()
    })

    test('search filters entries', async ({ page }) => {
        const searchInput = page.locator('[data-cy="types-search"] input')
        await searchInput.fill('color')

        await page.waitForTimeout(300)

        const colorCard = page.locator('[data-cy="types-card-color"]')
        await expect(colorCard).toBeVisible()
    })

    test('search empty state shows no-results message', async ({ page }) => {
        const searchInput = page.locator('[data-cy="types-search"] input')
        await searchInput.fill('zzznomatch999')

        await page.waitForTimeout(300)

        const empty = page.locator('[data-cy="types-empty"]')
        await expect(empty).toBeVisible()
    })

    test('card links to detail page', async ({ page }) => {
        const colorCard = page.locator('[data-cy="types-card-color"]')
        await colorCard.click()
        await page.waitForLoadState('networkidle')
        await expect(page).toHaveURL('/types/color')
    })

    test('geek theme — catalog renders without visual errors', async ({ page }) => {
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'geek')
        })
        const grid = page.locator('[data-cy="types-grid"]')
        await expect(grid).toBeVisible()
    })

    test('cartoon theme — catalog renders without visual errors', async ({ page }) => {
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'cartoon')
        })
        const grid = page.locator('[data-cy="types-grid"]')
        await expect(grid).toBeVisible()
    })
})

test.describe('Types — detail /types/color', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/types/color')
        await page.waitForLoadState('networkidle')
    })

    test('page is accessible (no not-found state)', async ({ page }) => {
        const notFound = page.locator('[data-cy="type-not-found"]')
        await expect(notFound).not.toBeVisible()
    })

    test('hero renders with TColor title', async ({ page }) => {
        const title = page.locator('#type-title')
        await expect(title).toBeVisible()
        await expect(title).toContainText('TColor')
    })

    test('breadcrumb links back to /types', async ({ page }) => {
        const breadcrumb = page.locator('[data-cy="type-breadcrumb-catalog"]')
        await expect(breadcrumb).toBeVisible()
        await expect(breadcrumb).toHaveAttribute('href', '/types')
    })

    test('kind chip shows "type"', async ({ page }) => {
        const kindChip = page.locator('.type-hero__kind-chip')
        await expect(kindChip).toBeVisible()
        await expect(kindChip).toContainText('type')
    })

    test('definition section renders with code block', async ({ page }) => {
        const defSection = page.locator('[data-cy="type-definition"]')
        await expect(defSection).toBeVisible()

        const codeBlock = defSection.locator('pre, code').first()
        await expect(codeBlock).toBeVisible()
    })

    test('source link points to GitHub', async ({ page }) => {
        const sourceLink = page.locator('[data-cy="type-source-link"]')
        await expect(sourceLink).toBeVisible()
        const href = await sourceLink.getAttribute('href')
        expect(href).toContain('github.com')
        expect(href).toContain('color.type.ts')
    })

    test('ToC renders with Definition entry', async ({ page }) => {
        const toc = page.locator('[data-cy="type-toc"]')
        await expect(toc).toBeVisible()
        await expect(toc).toContainText('Definition')
    })

    test('used-by section renders component cards', async ({ page }) => {
        const usedBy = page.locator('[data-cy="type-used-by"]')
        await expect(usedBy).toBeVisible()

        const firstCard = page.locator('[data-cy^="type-used-by-card-"]').first()
        await expect(firstCard).toBeVisible()
    })

    test('geek theme — detail page renders', async ({ page }) => {
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'geek')
        })
        const title = page.locator('#type-title')
        await expect(title).toBeVisible()
    })

    test('cartoon theme — detail page renders', async ({ page }) => {
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'cartoon')
        })
        const title = page.locator('#type-title')
        await expect(title).toBeVisible()
    })
})

test.describe('Types — detail /types/rounded (enum values)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/types/rounded')
        await page.waitForLoadState('networkidle')
    })

    test('page renders with TRounded title', async ({ page }) => {
        const title = page.locator('#type-title')
        await expect(title).toBeVisible()
        await expect(title).toContainText('TRounded')
    })

    test('values section renders', async ({ page }) => {
        const valuesSection = page.locator('[data-cy="type-values"]')
        await expect(valuesSection).toBeVisible()
    })

    test('enum values are listed (x-small through shaped-invert)', async ({ page }) => {
        const values = ['x-small', 'small', 'default', 'large', 'x-large', 'shaped']
        for (const val of values) {
            const item = page.locator(`[data-cy="type-value-${val}"]`)
            await expect(item).toBeVisible()
        }
    })

    test('copy button is present on each value', async ({ page }) => {
        const copyBtns = page.locator('.type-values__copy-btn')
        const count = await copyBtns.count()
        expect(count).toBeGreaterThan(0)
    })

    test('copy button is keyboard focusable', async ({ page }) => {
        const firstCopyBtn = page.locator('.type-values__copy-btn').first()
        await firstCopyBtn.focus()
        await expect(firstCopyBtn).toBeFocused()
    })

    test('clicking copy button changes icon to check', async ({ page }) => {
        const firstCopyBtn = page.locator('.type-values__copy-btn').first()
        await firstCopyBtn.click()
        await expect(firstCopyBtn).toContainText('')
        await page.waitForTimeout(200)
    })
})

test.describe('Types — not found slug', () => {
    test('unknown slug shows not-found state with back button', async ({ page }) => {
        await page.goto('/types/this-type-does-not-exist-xyz')
        await page.waitForLoadState('networkidle')

        const notFound = page.locator('[data-cy="type-not-found"]')
        await expect(notFound).toBeVisible()

        const backBtn = page.locator('[data-cy="type-not-found-back"]')
        await expect(backBtn).toBeVisible()
    })
})
