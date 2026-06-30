import { expect, test } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId.
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamItemGroup (0-based, APRÈS ajout des 4 Prop Variants):
 *   0  → Functional
 *   1  → Prop — default (single selection)
 *   2  → Prop — multiple (checkbox-style)
 *   3  → Prop — mandatory (always keeps one selected)
 *   4  → Prop — selectedClass (custom active class)
 *   5  → Events - update:modelValue
 *   6  → Slots - Default
 *   7  → Default (playground)
 */

const STORY_ID   = 'components-stories-itemgroup-origamitemgroup-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamItemGroup', () => {
    test.setTimeout(45000)

    test('single selection — clicking an item selects it and updates the status', async ({ page }) => {
        await page.goto(variantUrl(1))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const status = sandbox.locator('[data-cy="ig-default-status"]')
        await expect(status).toBeVisible({ timeout: 20000 })

        // Pre-selected value is "m" (Medium). Verify it shows up.
        await expect(status).toContainText('"m"', { timeout: 10000 })

        // Click the first card (Small — value "s") to change selection.
        const firstCard = sandbox.locator('.ig-card').first()
        await firstCard.click()
        await expect(status).toContainText('"s"', { timeout: 5000 })
    })

    test('single selection — clicking the active item deselects it', async ({ page }) => {
        await page.goto(variantUrl(1))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const status = sandbox.locator('[data-cy="ig-default-status"]')
        await expect(status).toBeVisible({ timeout: 20000 })

        // Click Medium (pre-selected) to deselect.
        const mediumCard = sandbox.locator('.ig-card').nth(1)
        await mediumCard.click()
        // After deselection, the value should be null / undefined / empty.
        await expect(status).not.toContainText('"m"', { timeout: 5000 })
    })

    test('multiple prop — two items can be selected simultaneously', async ({ page }) => {
        await page.goto(variantUrl(2))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const status = sandbox.locator('[data-cy="ig-multiple-status"]')
        await expect(status).toBeVisible({ timeout: 20000 })

        // Pre-selected: ["s", "m"]. Both should appear in the status.
        await expect(status).toContainText('"s"', { timeout: 10000 })
        await expect(status).toContainText('"m"', { timeout: 5000 })

        // Both cards should carry the active class.
        const activeCards = sandbox.locator('.ig-card--active')
        const count = await activeCards.count()
        expect(count).toBeGreaterThanOrEqual(2)
    })

    test('multiple prop — clicking a third item adds it to the selection', async ({ page }) => {
        await page.goto(variantUrl(2))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const status = sandbox.locator('[data-cy="ig-multiple-status"]')
        await expect(status).toBeVisible({ timeout: 20000 })

        // Click Large (not pre-selected).
        const largeCard = sandbox.locator('.ig-card').last()
        await largeCard.click()
        await expect(status).toContainText('"l"', { timeout: 5000 })
    })

    test('mandatory prop — clicking the selected item does NOT deselect', async ({ page }) => {
        await page.goto(variantUrl(3))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // Pre-selected value is "bold".
        const activeCard = sandbox.locator('.ig-card--active').first()
        await expect(activeCard).toBeVisible({ timeout: 20000 })

        // Click the active card — with mandatory=true, it must stay selected.
        await activeCard.click()
        const stillActive = sandbox.locator('.ig-card--active')
        await expect(stillActive.first()).toBeVisible({ timeout: 5000 })
    })

    test('mandatory prop — clicking a different item switches selection', async ({ page }) => {
        await page.goto(variantUrl(3))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.ig-card').first()).toBeVisible({ timeout: 20000 })

        // Click the last format card (Underline).
        const lastCard = sandbox.locator('.ig-card').last()
        await lastCard.click()
        await expect(lastCard).toHaveClass(/ig-card--active/, { timeout: 5000 })
    })

    test('selectedClass prop — active items carry the custom class', async ({ page }) => {
        await page.goto(variantUrl(4))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // Pre-selected value is "m".
        await expect(sandbox.locator('.ig-card').first()).toBeVisible({ timeout: 20000 })

        // The medium card should have `.my-custom-active` (not `.ig-card--active`).
        const mediumCard = sandbox.locator('.ig-card').nth(1)
        const cls = await mediumCard.getAttribute('class')
        expect(cls).toMatch(/my-custom-active/)
    })

    test('selectedClass prop — unselected items do NOT carry the custom class', async ({ page }) => {
        await page.goto(variantUrl(4))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.ig-card').first()).toBeVisible({ timeout: 20000 })

        // Small card (not selected) should NOT have the custom class.
        const smallCard = sandbox.locator('.ig-card').first()
        const cls = await smallCard.getAttribute('class')
        expect(cls).not.toMatch(/my-custom-active/)
    })

    test('update:modelValue emit — event fires on click with new value', async ({ page }) => {
        await page.goto(variantUrl(5))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const statusEl = sandbox.locator('.ig-status').first()
        await expect(statusEl).toBeVisible({ timeout: 20000 })

        // Click any card and verify the status text changes (emit fired → v-model updated).
        const firstCard = sandbox.locator('.ig-card').first()
        await firstCard.click()
        const text = await statusEl.innerText()
        expect(text).not.toBe('selected = ')
    })

    test('slots — default slot receives isSelected and toggle callbacks', async ({ page }) => {
        await page.goto(variantUrl(6))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.ig-card').first()).toBeVisible({ timeout: 20000 })

        // Toggle the first item.
        await sandbox.locator('.ig-card').first().click()
        const activeCard = sandbox.locator('.ig-card--active')
        await expect(activeCard.first()).toBeVisible({ timeout: 5000 })
    })

    test('playground — renders and shows initial selection', async ({ page }) => {
        await page.goto(variantUrl(7))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const status = sandbox.locator('.ig-status').first()
        await expect(status).toBeVisible({ timeout: 20000 })
        await expect(status).toContainText('"m"', { timeout: 10000 })
    })
})
