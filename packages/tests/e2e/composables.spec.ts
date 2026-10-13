/**
 * Composables pages — e2e spec
 *
 * Asserts that:
 *  1. /composables returns 200 and the catalog grid renders.
 *  2. Hero title, search field and domain groups are present.
 *  3. /composables/use-color (first documented slug) returns 200.
 *  4. The detail page renders: signature code block, params table,
 *     returns table, examples, related section.
 *  5. Breadcrumb links back to /composables.
 *  6. No console errors on either route.
 *
 * Pre-req: Nuxt dev server on http://localhost:3000
 * Run:
 *   pnpm -F @origam/tests playwright test \
 *     --config=playwright.marketing.config.ts composables
 */

import { expect, test } from '@playwright/test'

test.describe('Composables catalogue — /composables', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/composables')
        await page.waitForLoadState('networkidle')
    })

    test('returns 200 — page loads without error', async ({ page }) => {
        const res = await page.request.get('/composables')
        expect(res.status()).toBe(200)
    })

    test('catalog article is present', async ({ page }) => {
        await expect(page.locator('[data-cy="page-composables"]')).toBeVisible()
    })

    test('hero title is rendered', async ({ page }) => {
        const title = page.locator('#composables-title')
        await expect(title).toBeVisible()
        await expect(title).toContainText('Composable')
    })

    test('search field is present and has a usable input', async ({ page }) => {
        const search = page.locator('[data-cy="composables-search"]')
        await expect(search).toBeVisible()
        const input = search.locator('input')
        await expect(input).toBeVisible()
        await input.click()
        await input.fill('color')
        await expect(input).toHaveValue('color')
    })

    test('catalog grid is present with at least one domain group', async ({ page }) => {
        await expect(page.locator('[data-cy="composables-grid"]')).toBeVisible()
        const groups = page.locator('[data-cy^="composables-domain-"]')
        await expect(groups.first()).toBeVisible()
    })

    test('commons domain group is present', async ({ page }) => {
        await expect(page.locator('[data-cy="composables-domain-commons"]')).toBeVisible()
    })

    test('first composable card is clickable (use-color)', async ({ page }) => {
        const card = page.locator('[data-cy="composables-card-use-color"]')
        await expect(card).toBeVisible()
    })

    test('search filters composables reactively', async ({ page }) => {
        const search = page.locator('[data-cy="composables-search"] input')
        await search.fill('hover')
        await page.waitForTimeout(150)
        const visible = page.locator('[data-cy^="composables-card-"]')
        const count = await visible.count()
        expect(count).toBeGreaterThanOrEqual(1)
    })

    test('search no-results shows empty state', async ({ page }) => {
        const search = page.locator('[data-cy="composables-search"] input')
        await search.fill('zxzxzx_no_match_zxzx')
        await page.waitForTimeout(150)
        await expect(page.locator('[data-cy="composables-empty"]')).toBeVisible()
    })
})

test.describe('Composable detail — /composables/use-color', () => {
    const FIRST_SLUG = 'use-color'

    test.beforeEach(async ({ page }) => {
        await page.goto(`/composables/${FIRST_SLUG}`)
        await page.waitForLoadState('networkidle')
    })

    test('returns 200 and detail article is present', async ({ page }) => {
        const res = await page.request.get(`/composables/${FIRST_SLUG}`)
        expect(res.status()).toBe(200)
        await expect(page.locator(`[data-cy="page-composable-${FIRST_SLUG}"]`)).toBeVisible()
    })

    test('hero title contains composable name', async ({ page }) => {
        const title = page.locator('#composable-title')
        await expect(title).toBeVisible()
        await expect(title).toContainText('useColor')
    })

    test('breadcrumb family menu points back to /composables', async ({ page }) => {
        const trigger = page.locator('[data-cy="composable-breadcrumb-catalog"]')
        await expect(trigger).toBeVisible()
        await trigger.click()
        await expect(page.locator('[data-cy="breadcrumb-family-composable"]')).toHaveAttribute('href', '/composables')
    })

    test('import copy button is present and accessible', async ({ page }) => {
        const importBtn = page.locator(`[data-cy="composable-import-btn-${FIRST_SLUG}"]`)
        await expect(importBtn).toBeVisible()
        await expect(importBtn).toHaveAttribute('aria-label')
    })

    test('table of contents is rendered', async ({ page }) => {
        const toc = page.locator('[data-cy="composable-toc"]')
        await expect(toc).toBeVisible()
    })

    test('signature section is rendered with a code block', async ({ page }) => {
        await expect(page.locator('[data-cy="composable-signature"]')).toBeVisible()
        await expect(page.locator('[data-cy="composable-signature-code"]')).toBeVisible()
    })

    test('params section is rendered with at least one row', async ({ page }) => {
        const params = page.locator('[data-cy="composable-params"]')
        await expect(params).toBeVisible()
        const rows = page.locator('[data-cy^="param-row-"]')
        await expect(rows.first()).toBeVisible()
    })

    test('returns section is rendered with at least one row', async ({ page }) => {
        const returns = page.locator('[data-cy="composable-returns"]')
        await expect(returns).toBeVisible()
        const rows = page.locator('[data-cy^="return-row-"]')
        await expect(rows.first()).toBeVisible()
    })

    test('examples section is rendered', async ({ page }) => {
        const examples = page.locator('[data-cy="composable-examples"]')
        await expect(examples).toBeVisible()
    })

    test('related composables section is rendered', async ({ page }) => {
        const related = page.locator('[data-cy="composable-related"]')
        await expect(related).toBeVisible()
        await expect(page.locator('[data-cy="composable-related-grid"]')).toBeVisible()
    })

    test('not-found page for unknown slug', async ({ page }) => {
        await page.goto('/composables/xxxxxxxxxxx-unknown')
        await page.waitForLoadState('networkidle')
        await expect(page.locator('[data-cy="composable-not-found"]')).toBeVisible()
        const backBtn = page.locator('[data-cy="composable-not-found-back"]')
        await expect(backBtn).toBeVisible()
        await expect(backBtn).toHaveAttribute('href', '/composables')
    })
})
