import { expect, test } from '@playwright/test'

/**
 * #859 — direct keyboard typing into `<OrigamColorPickerField>` never
 * reached `modelValue` (no `v-model` between the text field and the
 * internal model, `handleChange` was a copy-pasted empty stub, and
 * `modelValue` was excluded from the text-field forwarding). This spec
 * proves the wiring added to close that gap, in BOTH directions, and
 * that the popover path — the primary gesture, untouched by this fix —
 * still works.
 *
 * Pattern canonique — navigation directe par variantId (cf. btn.spec.ts).
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 */

const STORY_ID   = 'components-stories-colorpickerfield-origamcolorpickerfield-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID
const PLAYGROUND_VARIANT = 18

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamColorPickerField — direct typing (#859)', () => {
    test.setTimeout(45000)

    test('typing a complete hex value commits update:modelValue (swatch + text reflect it)', async ({ page }) => {
        await page.goto(variantUrl(PLAYGROUND_VARIANT), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const field = sandbox.locator('.origam-color-picker-field').first()
        await expect(field).toBeVisible({ timeout: 12000 })

        // No selection yet — no text span rendered.
        await expect(field.locator('.origam-color-picker-field__selection-text')).toHaveCount(0)

        const input = field.locator('input').first()
        await input.click()
        await input.pressSequentially('#ff00aa', { delay: 20 })
        await input.blur()

        const selectionText = field.locator('.origam-color-picker-field__selection-text')
        await expect(selectionText).toHaveText('#ff00aa', { timeout: 8000 })

        const swatch = field.locator('.origam-field__prepend-inner .origam-sheet').first()
        await expect.poll(async () => {
            return swatch.evaluate((el) => getComputedStyle(el).backgroundColor)
        }, { timeout: 8000 }).toBe('rgb(255, 0, 170)')
    })

    test('an incomplete/invalid typed value is never committed to the model', async ({ page }) => {
        await page.goto(variantUrl(PLAYGROUND_VARIANT), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const field = sandbox.locator('.origam-color-picker-field').first()
        await expect(field).toBeVisible({ timeout: 12000 })

        const input = field.locator('input').first()
        await input.click()
        // "#ff" is a syntactically INCOMPLETE hex (2 digits) — must be
        // rejected, never reach modelValue.
        await input.pressSequentially('#ff', { delay: 20 })
        await input.blur()
        await page.waitForTimeout(300)

        await expect(field.locator('.origam-color-picker-field__selection-text')).toHaveCount(0)

        // "not-a-color" is not a CSS color at all — same rejection.
        await input.click()
        await input.fill('')
        await input.pressSequentially('not-a-color', { delay: 10 })
        await input.blur()
        await page.waitForTimeout(300)

        await expect(field.locator('.origam-color-picker-field__selection-text')).toHaveCount(0)
    })

    test('the popover picker still commits update:modelValue (non-regression)', async ({ page }) => {
        await page.goto(variantUrl(PLAYGROUND_VARIANT), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const field = sandbox.locator('.origam-color-picker-field').first()
        await expect(field).toBeVisible({ timeout: 12000 })

        await expect(field.locator('.origam-color-picker-field__selection-text')).toHaveCount(0)

        await field.click()
        await expect(field).toHaveClass(/origam-color-picker-field--active-menu/, { timeout: 8000 })

        const popover = sandbox.locator('.origam-color-picker-field__content')
        const rInput = popover.locator('.origam-color-picker-edit__input').first()
        await expect(rInput).toBeVisible({ timeout: 8000 })

        await rInput.fill('10')
        await rInput.blur()
        await page.waitForTimeout(300)

        const selectionText = field.locator('.origam-color-picker-field__selection-text')
        await expect(selectionText).toBeVisible({ timeout: 8000 })
        await expect(selectionText).toHaveText(/^#/)
    })
})
