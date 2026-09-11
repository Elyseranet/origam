import { expect, test } from '@playwright/test'

const STORY_PATH = '/stories/story/components-stories-datepicker-origamdatepicker-story-vue'

/**
 * OrigamDatePicker — e2e spec.
 *
 * Each test navigates to the matching Variant via sidebar click, then waits
 * for the data-cy anchor already present on the story root before asserting.
 * The 800 ms fixed wait was insufficient when the iframe sandbox was still
 * rendering the component chain (DatePicker → Picker → Sheet).  Waiting on
 * the known data-cy element instead gives an accurate "sandbox ready" signal
 * with a generous 10 s budget.
 */
test.describe('OrigamDatePicker', () => {
    test('Single date variant — calendar grid is visible', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — modelValue (single date)', { exact: true }).first().click()

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="date-picker-single"]').first()).toBeVisible({ timeout: 10000 })
    })

    test('Range variant — picker renders in range mode', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — range', { exact: true }).first().click()

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="date-picker-range"]').first()).toBeVisible({ timeout: 10000 })
    })

    test('Multiple variant — picker renders in multiple mode', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — multiple', { exact: true }).first().click()

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="date-picker-multiple"]').first()).toBeVisible({ timeout: 10000 })
    })

    test('Constraints variant — picker renders with min/max', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — min & max (date constraints)', { exact: true }).first().click()

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="date-picker-constraints"]').first()).toBeVisible({ timeout: 10000 })
    })

    test('Show week numbers — picker has show-week class', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — showWeek', { exact: true }).first().click()

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const picker = sandbox.locator('[data-cy="date-picker-show-week"]').first()
        await expect(picker).toBeVisible({ timeout: 10000 })
        await expect(picker).toHaveClass(/origam-date-picker--show-week/)
    })

    test('Slot — actions renders action buttons', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Slot — actions', { exact: true }).first().click()

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="date-picker-slot-actions"]').first()).toBeVisible({ timeout: 10000 })
        await expect(sandbox.getByRole('button', { name: /ok/i })).toBeVisible({ timeout: 5000 })
    })

    test('Emit — update:modelValue variant renders picker', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Emit — update:modelValue', { exact: true }).first().click()

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="date-picker-emit-model-value"]').first()).toBeVisible({ timeout: 10000 })
    })

    test('Playground — picker renders and allows date selection', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Default', { exact: true }).first().click()

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="date-picker-playground"]').first()).toBeVisible({ timeout: 10000 })
    })
})
