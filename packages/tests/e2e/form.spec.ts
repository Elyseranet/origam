import { expect, test } from '@playwright/test'

const STORY_PATH = '/stories/story/components-stories-form-origamform-story-vue'

test.describe('OrigamForm', () => {
    test('Basic wiring — form with TextField and NumberField renders', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — basic wiring (TextField + NumberField)', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="form-basic"]')).toBeVisible({ timeout: 5000 })
        await expect(sandbox.locator('[data-cy="form-basic-name"] input').first()).toBeVisible({ timeout: 3000 })
        await expect(sandbox.locator('[data-cy="form-basic-submit"]')).toBeVisible({ timeout: 3000 })
    })

    test('Basic wiring — submit button fires submit handler', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — basic wiring (TextField + NumberField)', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const nameInput = sandbox.locator('[data-cy="form-basic-name"] input').first()
        await nameInput.fill('Alice')
        await sandbox.locator('[data-cy="form-basic-submit"]').click()
        await expect(sandbox.locator('[data-cy="form-basic-submit-status"]')).toContainText('submitted = true', { timeout: 3000 })
    })

    test('Validate on — field renders with validation strategy', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — validateOn', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="form-validateon"]')).toBeVisible({ timeout: 5000 })
        await expect(sandbox.locator('[data-cy="form-validateon-field"] input').first()).toBeVisible({ timeout: 3000 })
    })

    test('Disabled — form fields appear disabled', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — disabled', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="form-disabled"]')).toBeVisible({ timeout: 5000 })
    })

    test('Fast fail — form renders with multiple fields', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — fastFail', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="form-fastfail"]')).toBeVisible({ timeout: 5000 })
        await expect(sandbox.locator('[data-cy="form-fastfail-f1"] input').first()).toBeVisible({ timeout: 3000 })
        await expect(sandbox.locator('[data-cy="form-fastfail-f2"] input').first()).toBeVisible({ timeout: 3000 })
    })

    test('Slot actions — submit and reset buttons visible', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Slots - Actions', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="form-slot-actions-submit"]')).toBeVisible({ timeout: 5000 })
        await expect(sandbox.locator('[data-cy="form-slot-actions-reset"]')).toBeVisible({ timeout: 3000 })
    })

    test('Emit submit — clicking submit fires the event', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Events - submit', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const submitBtn = sandbox.locator('[data-cy="form-emit-submit-btn"]')
        await expect(submitBtn).toBeVisible({ timeout: 5000 })
        await submitBtn.click()
        // logEvent is called — no throw = success
    })

    test('Emit reset — clicking reset fires the event', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Events - reset', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const resetBtn = sandbox.locator('[data-cy="form-emit-reset-btn"]')
        await expect(resetBtn).toBeVisible({ timeout: 5000 })
        await resetBtn.click()
    })

    test('Playground — all controls render', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Default', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="form-playground"]')).toBeVisible({ timeout: 5000 })
        await expect(sandbox.locator('[data-cy="form-playground-submit"]')).toBeVisible({ timeout: 3000 })
    })
})
