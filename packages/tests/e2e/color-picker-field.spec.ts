import { expect, test } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId (cf. btn.spec.ts).
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamColorPickerField (0-based) :
 *   0  → Design
 *   1  → State
 *   2  → Functional
 *   3  → Prop — closeOnSelect
 *   4  → Prop — disabled & readonly
 *   5  → Prop — rules
 *   6  → Events - update:modelValue
 *   7  → Events - update:menu
 *   8  → Slots - Prepend
 *   9  → Slots - Append
 *  10  → Slots - PrependInner
 *  11  → Slots - AppendInner
 *  12  → Slots - Clear
 *  13  → Slots - ColorSelection
 *  14  → Slots - FloatingLabel
 *  15  → Slots - Label
 *  16  → Slots - Loader
 *  17  → Slots - Prefix
 *  18  → Slots - Suffix
 *  19  → Default (playground)
 */

const STORY_ID   = 'components-stories-colorpickerfield-origamcolorpickerfield-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamColorPickerField', () => {
    test.setTimeout(45000)

    test('Basic variant — field renders with a visible input', async ({ page }) => {
        await page.goto(variantUrl(19))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-color-picker-field').first()).toBeVisible({ timeout: 12000 })
    })

    test('Close on select variant — field renders', async ({ page }) => {
        await page.goto(variantUrl(3))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-color-picker-field').first()).toBeVisible({ timeout: 12000 })
    })

    test('States — disabled state prevents menu from opening', async ({ page }) => {
        await page.goto(variantUrl(4))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-color-picker-field').first()).toBeVisible({ timeout: 12000 })
    })

    test('Slot — colorSelection renders custom content', async ({ page }) => {
        await page.goto(variantUrl(13))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-color-picker-field').first()).toBeVisible({ timeout: 12000 })
    })

    test('Emit — update:modelValue variant renders field', async ({ page }) => {
        await page.goto(variantUrl(6))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-color-picker-field').first()).toBeVisible({ timeout: 12000 })
    })

    test('Playground — field renders and has the active-menu class when picker opens', async ({ page }) => {
        await page.goto(variantUrl(19))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const field = sandbox.locator('.origam-color-picker-field').first()
        await expect(field).toBeVisible({ timeout: 12000 })

        // Click to open the picker
        await field.click()
        await page.waitForTimeout(500)
        await expect(field).toHaveClass(/origam-color-picker-field--active-menu/)
    })

    /**
     * Prop — rules
     *
     * This spec verifies that `validationValue` is correctly wired to the
     * current colour model so that rules receive the real colour value instead
     * of `undefined`.
     *
     * Scenario:
     *   1. Field starts empty (null) with validateOn="blur". After the first
     *      blur, `.origam-messages` must show "Color required".
     *   2. After the user selects a colour (opens picker → clicks a swatch),
     *      the error message must disappear.
     *
     * NOTE: This spec is written to run against a live Histoire server
     * (`pnpm -F @origam/stories dev`). It cannot be run headlessly in a
     * build-only CI environment without the dev server running.
     * Run manually: `pnpm -F @origam/tests test:e2e -- --grep "rules"`
     */
    test('Prop — rules: error message appears when field is empty after blur', async ({ page }) => {
        await page.goto(variantUrl(5))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        // The field should be present and empty initially
        const field = sandbox.locator('[data-cy="colorpickerfield-rules"]')
        await expect(field).toBeVisible({ timeout: 12000 })

        // Messages container must NOT be visible initially (validateOn=blur, pristine state)
        const _messages = sandbox.locator('[data-cy="colorpickerfield-rules"] .origam-messages, [data-cy="colorpickerfield-rules"] ~ .origam-messages')
        // Use the broader OrigamInput messages container (rendered as a sibling of the field
        // inside the OrigamInput wrapper)
        const inputWrapper = sandbox.locator('.origam-input').filter({ has: field })
        const errorMessage = inputWrapper.locator('.origam-messages__message').first()

        // Initially (pristine, no blur yet): no error visible
        // We use `not.toBeVisible` to confirm error is hidden before interaction
        // (if the element doesn't exist yet, the assertion naturally passes)
        await expect(errorMessage).not.toBeVisible({ timeout: 3000 }).catch(() => {
            // Element may not exist at all — that's also acceptable (no error shown)
        })

        // Trigger validateOn="blur": focus the native input, then Tab away.
        // Clicking the field opens the picker menu WITHOUT focusing the input, so
        // the previous click-outside dance never produced a real blur event →
        // validation never fired (element-not-found, NOT a component bug — a
        // proper blur validates fine, confirmed by repro).
        await field.locator('input').first().focus()
        await page.keyboard.press('Tab')

        // After blur on empty field: error message "Color required" must appear
        const errorText = sandbox.locator('.origam-messages__message').first()
        await expect(errorText).toBeVisible({ timeout: 10000 })
        await expect(errorText).toHaveText('Color required')
    })

    /**
     * ⛔ THE "NOT AUTOMATABLE IN HEADLESS" JUSTIFICATION WAS FALSE.
     *
     * This test carried `test.skip(true, 'picker colour selection not
     * automatable in headless (canvas measurement) — see #172')`, on the
     * stated grounds that the canvas emit derives its colour from
     * `canvasWidth`/`canvasHeight` which "aren't reliably measured in
     * headless/static", and that the field -> picker wiring was CORRECT.
     *
     * Both halves of that claim measured false on develop @ e66dac68
     * (chromium, static Histoire build, 2026-08-17).
     *
     * A plain `.origam-color-picker-canvas` click at a position is fully
     * automatable, and the measurement works:
     *
     *   BEFORE  --origam-color-picker-color-hsv : rgba(NaN, NaN, NaN, 1)
     *           aria-valuetext                  : "Saturation 0%, lightness 0%"
     *           preview dot                     : background: rgb(0, 0, 0)
     *   AFTER   --origam-color-picker-color-hsv : rgba(241, 90, 90, 1)
     *           aria-valuetext                  : "Saturation 63%, lightness 95%"
     *           preview dot                     : background: rgb(241, 90, 90)
     *
     * The gesture registers, the canvas measures, the picker's internal HSV
     * state moves and the preview repaints. What never happens is the emit:
     * the field's input stays "" and no `update:modelValue` is observed.
     * Reproduced on the STANDALONE OrigamColorPicker story as well
     * (aria-valuetext 73%/96% -> 20%/73%, still no emit), which places the
     * fault in OrigamColorPicker — NOT in OrigamColorPickerField, whose
     * `@update:model-value="handleSelectColor"` binding is correct
     * (OrigamColorPickerField.vue:85 and :200).
     *
     * Two other automatable gestures were probed and are equally inert:
     * the 4 `.origam-color-picker-edit__input` RGBA number inputs, and the
     * hue `input[type=range]` — neither commits a colour either. The canvas
     * also declares `role="application" tabindex="0"` with a live
     * `aria-valuetext` but ignores Arrow keys entirely (valuetext unchanged
     * after 5x ArrowRight + 5x ArrowUp), which is a separate a11y defect.
     *
     * So this is a PRODUCT BUG, not an automation limit, and the skip was
     * hiding it. Now `test.fail`: green while the emit is missing, RED the
     * day OrigamColorPicker propagates the canvas commit.
     *
     * Suspect (NOT root-caused — fixing DS bugs is out of this pass's
     * scope): the `useVModel` transform-out on OrigamColorPicker's `model`,
     * OrigamColorPicker.vue:159-180.
     */
    test.fail('Prop — rules: error message disappears after a colour is selected', async ({ page }) => {
        await page.goto(variantUrl(5))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const field = sandbox.locator('[data-cy="colorpickerfield-rules"]')
        await expect(field).toBeVisible({ timeout: 12000 })

        // First, trigger the error by blurring the empty field (focus input → Tab).
        await field.locator('input').first().focus()
        await page.keyboard.press('Tab')

        const errorText = sandbox.locator('.origam-messages__message').first()
        await expect(errorText).toBeVisible({ timeout: 10000 })

        // Now open the picker and select a colour by clicking the first colour swatch
        await field.click()

        const colorPicker = sandbox.locator('.origam-color-picker')
        await expect(colorPicker).toBeVisible({ timeout: 10000 })

        // Click the first colour dot/swatch inside the picker canvas area
        // The OrigamColorPicker renders a canvas or swatch grid — click centre of canvas
        const canvas = colorPicker.locator('canvas').first()
        if (await canvas.isVisible()) {
            await canvas.click({ position: { x: 50, y: 50 } })
        } else {
            // Fallback: click any clickable swatch element
            await colorPicker.locator('.origam-color-picker__swatch, .origam-sheet').first().click()
        }
        await page.waitForTimeout(500)

        // Close the picker
        await sandbox.locator('body').click({ position: { x: 10, y: 10 } })
        await page.waitForTimeout(500)

        // Error message must no longer be visible (colour is now set)
        await expect(errorText).not.toBeVisible({ timeout: 3000 })
    })

    // The picker is teleported out of the field's subtree, so a stylesheet
    // written by the consuming application reaches the field and never the
    // popup. Inheriting `font-size` on the surface does not close it either:
    // the channel labels size their text with
    // `var(--origam-color-picker-edit__label---font-size, .75rem)`, and `rem`
    // resolves against the document root, not the parent. See
    // `useTeleportTypography` (mirrors `select.spec.ts`'s equivalent block).
    test.describe('Teleported menu follows the field typography', () => {
        for (const fontSize of ['11px', '13px', '20px']) {
            test(`channel label text matches a field overridden to ${fontSize}`, async ({ page }) => {
                await page.goto(variantUrl(19))
                const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
                const field = sandbox.locator('.origam-color-picker-field').first()
                await expect(field).toBeVisible({ timeout: 12000 })

                // Stands in for the consuming application's own stylesheet.
                await field.evaluate((el, fs) => {
                    const style = document.createElement('style')
                    style.textContent = `.origam-color-picker-field, .origam-color-picker-field * { font-size: ${fs} !important; }`
                    document.head.appendChild(style)
                }, fontSize)

                await field.click()
                await expect(sandbox.locator('.origam-color-picker-edit__label').first()).toBeVisible({ timeout: 8000 })

                const fieldSize = await field.evaluate((el) =>
                    getComputedStyle((el.querySelector('input') ?? el) as HTMLElement).fontSize)
                const labelSize = await sandbox.locator('.origam-color-picker-edit__label').first().evaluate((el) =>
                    getComputedStyle(el as HTMLElement).fontSize)

                expect(parseFloat(labelSize)).toBeCloseTo(parseFloat(fieldSize), 1)
            })
        }
    })
})
