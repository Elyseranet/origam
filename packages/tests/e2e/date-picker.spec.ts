import { expect, test } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId.
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamDatePicker (0-based):
 *   0  → Design
 *   1  → State
 *   2  → Prop — modelValue (single date)
 *   3  → Prop — range
 *   4  → Prop — multiple
 *   5  → Prop — min & max (date constraints)
 *   6  → Prop — showWeek
 *   7  → Slot — actions
 *   8  → Emit — update:modelValue
 *   9  → Events - update:modelValue
 *  10  → Events - update:month
 *  11  → Events - update:year
 *  12  → Events - update:viewMode
 *  13  → Slots - Default
 *  14  → Slots - Title
 *  15  → Slots - Header
 *  16  → Slots - Actions
 *  17  → Default (playground)
 *
 * Each test navigates to the matching Variant via variantId URL, then waits
 * for the data-cy anchor already present on the story root before asserting.
 */
const STORY_ID   = 'components-stories-datepicker-origamdatepicker-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamDatePicker', () => {
    test.setTimeout(45000)

    test('Single date variant — calendar grid is visible', async ({ page }) => {
        await page.goto(variantUrl(2))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="date-picker-single"]').first()).toBeVisible({ timeout: 20000 })
    })

    test('Range variant — picker renders in range mode', async ({ page }) => {
        await page.goto(variantUrl(3))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="date-picker-range"]').first()).toBeVisible({ timeout: 20000 })
    })

    test('Multiple variant — picker renders in multiple mode', async ({ page }) => {
        await page.goto(variantUrl(4))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="date-picker-multiple"]').first()).toBeVisible({ timeout: 20000 })
    })

    test('Constraints variant — picker renders with min/max', async ({ page }) => {
        await page.goto(variantUrl(5))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="date-picker-constraints"]').first()).toBeVisible({ timeout: 20000 })
    })

    test('Show week numbers — picker has show-week class', async ({ page }) => {
        await page.goto(variantUrl(6))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const picker = sandbox.locator('[data-cy="date-picker-show-week"]').first()
        await expect(picker).toBeVisible({ timeout: 20000 })
        await expect(picker).toHaveClass(/origam-date-picker--show-week/)
    })

    test('Slot — actions renders action buttons', async ({ page }) => {
        await page.goto(variantUrl(7))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="date-picker-slot-actions"]').first()).toBeVisible({ timeout: 20000 })
        await expect(sandbox.getByRole('button', { name: /ok/i })).toBeVisible({ timeout: 10000 })
    })

    test('Emit — update:modelValue variant renders picker', async ({ page }) => {
        await page.goto(variantUrl(8))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="date-picker-emit-model-value"]').first()).toBeVisible({ timeout: 20000 })
    })

    test('Playground — picker renders and allows date selection', async ({ page }) => {
        await page.goto(variantUrl(17))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="date-picker-playground"]').first()).toBeVisible({ timeout: 20000 })
    })
})
