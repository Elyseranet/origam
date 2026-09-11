import { expect, test } from '@playwright/test'
import { eventLogItems, openEventsTab } from './_support/histoire-controls'

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

    // Pre-fix, this test clicked the submit button and asserted NOTHING —
    // "logEvent is called — no throw = success" was a comment, not an
    // assertion, and stayed green regardless of whether the DS actually
    // emitted `submit`. Fixed (issue #415) to read Histoire's own "Events"
    // tab (see `_support/histoire-controls.ts`), the one place a
    // `logEvent()` side-effect fired inside the sandboxed iframe is
    // observable from the outer Playwright page.
    test('Emit submit — clicking submit fires the submit event', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Events - submit', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const submitBtn = sandbox.locator('[data-cy="form-emit-submit-btn"]')
        await expect(submitBtn).toBeVisible({ timeout: 5000 })
        await submitBtn.click()
        await page.waitForTimeout(300)

        await openEventsTab(page)
        await expect(eventLogItems(page).filter({ hasText: 'submit' })).toHaveCount(1)
    })

    // Pre-fix, `handleReset` never called `emits('reset', …)` — this test
    // clicked the reset button and asserted nothing at all, so it stayed
    // green whether or not the component actually emitted `reset`. Fixed
    // (issue #415) alongside the component fix: same Events-tab assertion
    // as the submit test above.
    test('Emit reset — clicking reset fires the reset event', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Events - reset', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const resetBtn = sandbox.locator('[data-cy="form-emit-reset-btn"]')
        await expect(resetBtn).toBeVisible({ timeout: 5000 })
        await resetBtn.click()
        await page.waitForTimeout(300)

        await openEventsTab(page)
        await expect(eventLogItems(page).filter({ hasText: 'reset' })).toHaveCount(1)
    })

    // `hint` was declared on IFormProps and consumed by useMessage()'s
    // `messages` computed, but `hasMessages` never tested it (issue #415):
    // the `.origam-form__details` container was never rendered for a hint
    // passed alone, so the text never reached the screen. Fixed alongside
    // `reset` in the same composable used exclusively by OrigamForm.
    test('Hint — renders the hint text with no errorMessages set', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — hint', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="form-hint"]')).toBeVisible({ timeout: 5000 })
        await expect(sandbox.locator('[data-cy="form-hint"] .origam-form__details')).toBeVisible({ timeout: 3000 })
        await expect(sandbox.locator('[data-cy="form-hint"] .origam-form__details')).toContainText('All fields are optional unless marked otherwise')
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
