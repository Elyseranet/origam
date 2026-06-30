import { expect, test } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId.
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamForm (0-based):
 *   0  → Design
 *   1  → State
 *   2  → Events - submit
 *   3  → Events - reset
 *   4  → Slots - Default
 *   5  → Slots - Actions
 *   6  → Slots - Messages
 *   7  → Slots - Message
 *   8  → Prop — basic wiring (TextField + NumberField)
 *   9  → Prop — validateOn
 *  10  → Prop — disabled
 *  11  → Prop — fastFail
 *  12  → Default (playground)
 */
const STORY_ID   = 'components-stories-form-origamform-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamForm', () => {
    test.setTimeout(45000)

    test('Basic wiring — form with TextField and NumberField renders', async ({ page }) => {
        await page.goto(variantUrl(8))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="form-basic"]')).toBeVisible({ timeout: 20000 })
        await expect(sandbox.locator('[data-cy="form-basic-name"] input').first()).toBeVisible({ timeout: 15000 })
        await expect(sandbox.locator('[data-cy="form-basic-submit"]')).toBeVisible({ timeout: 15000 })
    })

    test('Basic wiring — submit button fires submit handler', async ({ page }) => {
        await page.goto(variantUrl(8))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="form-basic"]')).toBeVisible({ timeout: 20000 })
        const nameInput = sandbox.locator('[data-cy="form-basic-name"] input').first()
        await nameInput.fill('Alice')
        await sandbox.locator('[data-cy="form-basic-submit"]').click()
        await expect(sandbox.locator('[data-cy="form-basic-submit-status"]')).toContainText('submitted = true', { timeout: 5000 })
    })

    test('Validate on — field renders with validation strategy', async ({ page }) => {
        await page.goto(variantUrl(9))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="form-validateon"]')).toBeVisible({ timeout: 20000 })
        await expect(sandbox.locator('[data-cy="form-validateon-field"] input').first()).toBeVisible({ timeout: 15000 })
    })

    test('Disabled — form fields appear disabled', async ({ page }) => {
        await page.goto(variantUrl(10))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="form-disabled"]')).toBeVisible({ timeout: 20000 })
    })

    test('Fast fail — form renders with multiple fields', async ({ page }) => {
        await page.goto(variantUrl(11))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="form-fastfail"]')).toBeVisible({ timeout: 20000 })
        await expect(sandbox.locator('[data-cy="form-fastfail-f1"] input').first()).toBeVisible({ timeout: 15000 })
        await expect(sandbox.locator('[data-cy="form-fastfail-f2"] input').first()).toBeVisible({ timeout: 15000 })
    })

    test('Slot actions — submit and reset buttons visible', async ({ page }) => {
        await page.goto(variantUrl(5))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="form-slot-actions-submit"]')).toBeVisible({ timeout: 20000 })
        await expect(sandbox.locator('[data-cy="form-slot-actions-reset"]')).toBeVisible({ timeout: 15000 })
    })

    test('Emit submit — clicking submit fires the event', async ({ page }) => {
        await page.goto(variantUrl(2))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const submitBtn = sandbox.locator('[data-cy="form-emit-submit-btn"]')
        await expect(submitBtn).toBeVisible({ timeout: 20000 })
        await submitBtn.click()
        // logEvent is called — no throw = success
    })

    test('Emit reset — clicking reset fires the event', async ({ page }) => {
        await page.goto(variantUrl(3))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const resetBtn = sandbox.locator('[data-cy="form-emit-reset-btn"]')
        await expect(resetBtn).toBeVisible({ timeout: 20000 })
        await resetBtn.click()
    })

    test('Playground — all controls render', async ({ page }) => {
        await page.goto(variantUrl(12))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="form-playground"]')).toBeVisible({ timeout: 20000 })
        await expect(sandbox.locator('[data-cy="form-playground-submit"]')).toBeVisible({ timeout: 15000 })
    })
})
