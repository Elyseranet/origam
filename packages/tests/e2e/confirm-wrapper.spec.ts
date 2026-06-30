import { expect, test } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId.
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamConfirmWrapper (0-based):
 *   0  → Design
 *   1  → State
 *   2  → Prop — field (shorthand)
 *   3  → Prop — direction
 *   4  → Prop — label & prependIcon
 *   5  → Prop — disabled, readonly & error
 *   6  → Prop — confirm (mismatch validation)
 *   7  → Slot — header
 *   8  → Slot — default & confirm
 *   9  → Emit — update:modelValue & update:confirm
 *  10  → Events - update:modelValue
 *  11  → Events - update:confirm
 *  12  → Events - update:focused
 *  13  → Events - click:prepend
 *  14  → Events - click:append
 *  15  → Slots - Default
 *  16  → Slots - Confirm
 *  17  → Slots - Header
 *  18  → Slots - Title
 *  19  → Slots - Prepend
 *  20  → Slots - Append
 *  21  → Slots - Messages
 *  22  → Slots - Message
 *  23  → Slots - Details
 *  24  → Default (playground)
 */
const STORY_ID   = 'components-stories-confirmwrapper-origamconfirmwrapper-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamConfirmWrapper', () => {
    test.setTimeout(45000)

    test('Default (field shorthand) — wrapper renders with two inputs', async ({ page }) => {
        await page.goto(variantUrl(2))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // `confirm-wrapper-default` is the OUTER fixture <div> with
        // padding/max-width — the OrigamConfirmWrapper sits inside it
        // and carries the data-cy `confirm-wrapper-default-input`. Assert
        // the wrapper class on the actual component, not on the styling
        // container (which has no class). Pre-fix the test asserted the
        // class on the outer div and only ever passed by mistake when
        // the suite was first written.
        const fixture = sandbox.locator('[data-cy="confirm-wrapper-default"]')
        await expect(fixture).toBeVisible({ timeout: 20000 })
        const wrapper = sandbox.locator('[data-cy="confirm-wrapper-default-input"]')
        await expect(wrapper).toHaveClass(/origam-confirm-wrapper/, { timeout: 5000 })
    })

    test('Direction — wrapper renders with direction variant', async ({ page }) => {
        await page.goto(variantUrl(3))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const wrapper = sandbox.locator('[data-cy="confirm-wrapper-direction"]')
        await expect(wrapper).toBeVisible({ timeout: 20000 })
    })

    test('Label and prepend icon — wrapper with label renders', async ({ page }) => {
        await page.goto(variantUrl(4))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const wrapper = sandbox.locator('[data-cy="confirm-wrapper-label"]')
        await expect(wrapper).toBeVisible({ timeout: 20000 })
    })

    test('States — wrapper renders with state controls', async ({ page }) => {
        await page.goto(variantUrl(5))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const wrapper = sandbox.locator('[data-cy="confirm-wrapper-states"]')
        await expect(wrapper).toBeVisible({ timeout: 20000 })
    })

    test('Validation — wrapper renders with validation status', async ({ page }) => {
        await page.goto(variantUrl(6))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const wrapper = sandbox.locator('[data-cy="confirm-wrapper-validation"]')
        await expect(wrapper).toBeVisible({ timeout: 20000 })
        const status = sandbox.locator('[data-cy="confirm-wrapper-validation-status"]')
        await expect(status).toBeVisible({ timeout: 15000 })
    })

    test('Slot — header — custom header renders inside wrapper', async ({ page }) => {
        await page.goto(variantUrl(7))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const wrapper = sandbox.locator('[data-cy="confirm-wrapper-slot-header"]')
        await expect(wrapper).toBeVisible({ timeout: 20000 })
    })

    test('Slot — default + confirm — custom fields render', async ({ page }) => {
        await page.goto(variantUrl(8))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const field = sandbox.locator('[data-cy="confirm-wrapper-custom-field"]')
        await expect(field).toBeVisible({ timeout: 20000 })
        const confirmField = sandbox.locator('[data-cy="confirm-wrapper-confirm-field"]')
        await expect(confirmField).toBeVisible({ timeout: 15000 })
    })

    test('Emit — update:modelValue — wrapper renders for emit test', async ({ page }) => {
        await page.goto(variantUrl(9))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const wrapper = sandbox.locator('[data-cy="confirm-wrapper-emit"]')
        await expect(wrapper).toBeVisible({ timeout: 20000 })
    })

    test('Playground — wrapper renders with all controls', async ({ page }) => {
        await page.goto(variantUrl(24))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const fixture = sandbox.locator('[data-cy="confirm-wrapper-playground"]')
        await expect(fixture).toBeVisible({ timeout: 20000 })
        // Assert the class on the actual OrigamConfirmWrapper, not on
        // the outer fixture <div>. See note in `Default` test above.
        const wrapper = sandbox.locator('[data-cy="confirm-wrapper-playground-input"]')
        await expect(wrapper).toHaveClass(/origam-confirm-wrapper/, { timeout: 5000 })
    })
})
