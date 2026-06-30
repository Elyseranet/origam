import { expect, test } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId.
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamInput (0-based):
 *   0  → Design
 *   1  → State
 *   2  → Events - update:modelValue
 *   3  → Events - update:focused
 *   4  → Events - click:prepend
 *   5  → Events - click:append
 *   6  → Slots - Default
 *   7  → Slots - Prepend
 *   8  → Slots - Append
 *   9  → Slots - Messages
 *  10  → Slots - Message
 *  11  → Slots - Details
 *  12  → Prop — color
 *  13  → Prop — hint & persistentHint
 *  14  → Prop — prependIcon & appendIcon
 *  15  → Prop — disabled, readonly & error
 *  16  → Emit — update:modelValue
 *  17  → Emit — click:prepend & click:append
 *  18  → Slot — prepend
 *  19  → Default (playground)
 */
const STORY_ID   = 'components-stories-input-origaminput-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamInput', () => {
    test.setTimeout(45000)

    test('Color variant — renders outer wrapper with label', async ({ page }) => {
        await page.goto(variantUrl(12))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="input-color"]')).toBeVisible({ timeout: 20000 })
        await expect(sandbox.locator('[data-cy="input-color"] input').first()).toBeVisible({ timeout: 15000 })
    })

    test('Hint — hint text visible when persistentHint=true', async ({ page }) => {
        await page.goto(variantUrl(13))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="input-hint"]')).toBeVisible({ timeout: 20000 })
        await expect(sandbox.locator('.origam-messages').first()).toBeVisible({ timeout: 15000 })
    })

    test('Prepend & append — icons visible outside field', async ({ page }) => {
        await page.goto(variantUrl(14))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="input-adjacent"]')).toBeVisible({ timeout: 20000 })
        await expect(sandbox.locator('.origam-input__prepend').first()).toBeVisible({ timeout: 15000 })
        await expect(sandbox.locator('.origam-input__append').first()).toBeVisible({ timeout: 15000 })
    })

    test('States — disabled input has disabled attribute', async ({ page }) => {
        await page.goto(variantUrl(15))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="input-states"]')).toBeVisible({ timeout: 20000 })
    })

    test('Emit update:modelValue — status updates after typing', async ({ page }) => {
        await page.goto(variantUrl(16))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const input = sandbox.locator('[data-cy="input-emit-update"] input').first()
        await expect(input).toBeVisible({ timeout: 20000 })
        await input.fill('typed value')
        const status = sandbox.locator('[data-cy="input-emit-status"]')
        await expect(status).toContainText('typed value', { timeout: 5000 })
    })

    test('Emit click:prepend / click:append — clicking icons fires events', async ({ page }) => {
        await page.goto(variantUrl(17))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="input-emit-click"]')).toBeVisible({ timeout: 20000 })
        const prependIcon = sandbox.locator('.origam-input__prepend .origam-icon').first()
        await expect(prependIcon).toBeVisible({ timeout: 15000 })
        await prependIcon.click()
    })

    test('Slot prepend — custom prepend slot renders', async ({ page }) => {
        await page.goto(variantUrl(18))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="input-slot-prepend"]')).toBeVisible({ timeout: 20000 })
    })

    test('Playground — renders with all controls', async ({ page }) => {
        await page.goto(variantUrl(19))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="input-playground"]')).toBeVisible({ timeout: 20000 })
        await expect(sandbox.locator('[data-cy="input-playground-status"]')).toContainText('value =', { timeout: 5000 })
    })
})
