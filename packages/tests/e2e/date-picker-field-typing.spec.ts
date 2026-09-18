import { expect, test } from '@playwright/test'

/**
 * #859 — direct keyboard typing into `<OrigamDatePickerField>` never
 * reached `modelValue`, by the exact same three-piece mechanism as
 * `OrigamColorPickerField` (copy-pasted `handleChange` stub, no
 * `v-model` bridge, `modelValue` excluded from forwarding). This spec
 * proves the wiring added to close that gap, in BOTH directions, and
 * that the popover calendar path — the primary gesture, untouched by
 * this fix — still works.
 *
 * Pattern canonique — navigation directe par variantId (cf. btn.spec.ts).
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 */

const STORY_ID   = 'components-stories-datepickerfield-origamdatepickerfield-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID
const PLAYGROUND_VARIANT = 28

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamDatePickerField — direct typing (#859)', () => {
    test.setTimeout(45000)

    test('typing a complete, valid date commits update:modelValue (selection text reflects it)', async ({ page }) => {
        await page.goto(variantUrl(PLAYGROUND_VARIANT), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const field = sandbox.locator('.origam-date-picker-field').first()
        await expect(field).toBeVisible({ timeout: 12000 })

        await expect(field.locator('.origam-date-picker-field__selection-text')).toHaveCount(0)

        const input = field.locator('input').first()
        await input.click()
        await input.pressSequentially('09/18/2026', { delay: 20 })
        await input.blur()

        const selectionText = field.locator('.origam-date-picker-field__selection-text')
        await expect(selectionText).toHaveText('09/18/2026', { timeout: 8000 })
    })

    test('an incomplete/invalid typed date is never committed to the model', async ({ page }) => {
        await page.goto(variantUrl(PLAYGROUND_VARIANT), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const field = sandbox.locator('.origam-date-picker-field').first()
        await expect(field).toBeVisible({ timeout: 12000 })

        const input = field.locator('input').first()
        await input.click()
        // "09/1" is a partial date — must be rejected, never reach modelValue.
        await input.pressSequentially('09/1', { delay: 20 })
        await input.blur()
        await page.waitForTimeout(300)

        await expect(field.locator('.origam-date-picker-field__selection-text')).toHaveCount(0)

        // "not-a-date" is not parseable at all — same rejection.
        await input.click()
        await input.fill('')
        await input.pressSequentially('not-a-date', { delay: 10 })
        await input.blur()
        await page.waitForTimeout(300)

        await expect(field.locator('.origam-date-picker-field__selection-text')).toHaveCount(0)
    })

    test('the popover calendar still commits update:modelValue (non-regression)', async ({ page }) => {
        await page.goto(variantUrl(PLAYGROUND_VARIANT), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const field = sandbox.locator('.origam-date-picker-field').first()
        await expect(field).toBeVisible({ timeout: 12000 })

        await expect(field.locator('.origam-date-picker-field__selection-text')).toHaveCount(0)

        await field.click()
        await expect(field).toHaveClass(/origam-date-picker-field--active-menu/, { timeout: 8000 })

        const popover = sandbox.locator('.origam-date-picker-field__content')
        const selectableDay = popover.locator('.origam-date-picker-month__day-btn:not([disabled])').first()
        await expect(selectableDay).toBeVisible({ timeout: 8000 })
        await selectableDay.click()
        await page.waitForTimeout(300)

        const selectionText = field.locator('.origam-date-picker-field__selection-text')
        await expect(selectionText).toBeVisible({ timeout: 8000 })
    })
})
