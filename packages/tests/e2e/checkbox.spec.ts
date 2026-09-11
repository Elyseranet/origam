import { expect, test } from '@playwright/test'

/**
 * OrigamCheckbox — e2e spec
 *
 * ## Story Variants (0-based index)
 *
 *   Index → Titre
 *     0  → Design       init: { label: 'Checkbox', color: 'primary' }
 *     1  → State        init: { color: 'primary' }
 *     2  → Functional   init: disabled/readonly/indeterminate/error all false
 *     3  → Events - update:modelValue
 *     4  → Events - focus & blur
 *     5  → Events - click:label
 *     6  → Slots - Default   ⚠ slot #default REPLACES origam-input__control entirely
 *                              → no input[type=checkbox] in DOM
 *     7  → Slots - Label
 *     8  → Slots - Input     ⚠ slot #input REPLACES input[type=checkbox] with a <div>
 *     9  → Default (playground)  init: { label: 'Accept terms', color: 'primary' }
 *
 * ## DOM structure
 *
 *   .origam-checkbox (.origam-input)
 *     └─ .origam-input__control
 *         └─ .origam-checkbox-btn (.origam-selection-control)
 *             └─ .origam-selection-control__wrapper  (.origam--color-primary for color=primary)
 *                 └─ .origam-selection-control__input
 *                     └─ input[type=checkbox]        ← toggle target
 *             └─ .origam-selection-control__label
 *                 └─ .origam-label
 *
 * ## STORY_ID
 *   components-stories-checkbox-origamcheckbox-story-vue
 */

const STORY_ID   = 'components-stories-checkbox-origamcheckbox-story-vue'
/**
 * Histoire is configured with vite.base = '/stories/' (histoire.config.js).
 * The dev server serves stories at /stories/story/... — NOT /story/...
 * We use the full path here; other specs that used '/stories/story/...' are broken
 * and need the same fix.
 */
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamCheckbox', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { label: 'Checkbox', color: 'primary' }                       //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders the checkbox root with BEM class origam-checkbox', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-checkbox').first()
            await expect(root).toBeVisible({ timeout: 12000 })
        })

        test('density=default class is present on the root', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-checkbox').first()
            await expect(root).toBeVisible({ timeout: 12000 })
            await expect(root).toHaveClass(/origam-input--density-default/)
        })

        test('color=primary applies origam--color-primary on the wrapper', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const wrapper = sandbox.locator('.origam-selection-control__wrapper').first()
            await expect(wrapper).toHaveClass(/origam--color-primary/)
        })

        test('label prop renders the label text "Checkbox"', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-label').first()).toContainText('Checkbox')
        })

        test('input has aria-label="Checkbox"', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const input = sandbox.locator('input[type=checkbox]').first()
            await expect(input).toHaveAttribute('aria-label', 'Checkbox')
        })

        test('input is not checked in initial state (modelValue=false)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const input = sandbox.locator('input[type=checkbox]').first()
            await expect(input).not.toBeChecked()
        })

        test('input has aria-disabled="false" by default', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const input = sandbox.locator('input[type=checkbox]').first()
            await expect(input).toHaveAttribute('aria-disabled', 'false')
        })
    })

    // ------------------------------------------------------------------ //
    // STATE (index 1)                                                      //
    // init: { color: 'primary' }                                          //
    // ------------------------------------------------------------------ //

    test.describe('State', () => {
        test('renders the checkbox with color=primary wrapper class', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const wrapper = sandbox.locator('.origam-selection-control__wrapper').first()
            await expect(wrapper).toHaveClass(/origam--color-primary/)
        })

        test('resting state: input is not checked', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const input = sandbox.locator('input[type=checkbox]').first()
            await expect(input).not.toBeChecked()
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 2)                                                 //
    // init: all functional flags false                                     //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('initial value is false (value div shows "value = false")', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const valueDiv = sandbox.locator('div').filter({ hasText: /^value =/ }).first()
            await expect(valueDiv).toContainText('value = false')
        })

        test('input is not disabled by default', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const input = sandbox.locator('input[type=checkbox]').first()
            await expect(input).toHaveAttribute('aria-disabled', 'false')
            const isDisabled = await input.evaluate((el: HTMLInputElement) => el.disabled)
            expect(isDisabled).toBe(false)
        })

        test('input is not checked by default', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const input = sandbox.locator('input[type=checkbox]').first()
            await expect(input).not.toBeChecked()
        })

        test('input is not indeterminate by default', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const input = sandbox.locator('input[type=checkbox]').first()
            const isIndeterminate = await input.evaluate((el: HTMLInputElement) => el.indeterminate)
            expect(isIndeterminate).toBe(false)
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS - update:modelValue (index 3)                                 //
    // ------------------------------------------------------------------ //

    test.describe('Events - update:modelValue', () => {
        test('clicking the input toggles checked state from false to true', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const input = sandbox.locator('input[type=checkbox]').first()
            await expect(input).not.toBeChecked()
            await input.click()
            await expect(input).toBeChecked()
        })

        test('toggling updates the value div from false to true', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const valueDiv = sandbox.locator('div').filter({ hasText: /^value =/ }).first()
            await expect(valueDiv).toContainText('value = false')
            const input = sandbox.locator('input[type=checkbox]').first()
            await input.click()
            await expect(valueDiv).toContainText('value = true')
        })

        test('second click toggles back to unchecked', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const input = sandbox.locator('input[type=checkbox]').first()
            await input.click()
            await expect(input).toBeChecked()
            await input.click()
            await expect(input).not.toBeChecked()
        })

        test('renders label "Toggle me"', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-label').first()).toContainText('Toggle me')
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS - focus & blur (index 4)                                      //
    // logEvent side-effects are Histoire-internal and not assertable       //
    // headlessly; we assert the input is focusable and keyboard-accessible //
    // ------------------------------------------------------------------ //

    test.describe('Events - focus & blur', () => {
        test('renders label "Focus & blur me"', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-label').first()).toContainText('Focus & blur me')
        })

        test('input is keyboard-focusable (focus does not throw)', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const input = sandbox.locator('input[type=checkbox]').first()
            await input.focus()
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS - click:label (index 5)                                       //
    // logEvent is not assertable headlessly; we assert the label renders  //
    // and clicking it does not throw                                       //
    // ------------------------------------------------------------------ //

    test.describe('Events - click:label', () => {
        test('renders label "Click the label"', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-label').first()).toContainText('Click the label')
        })

        test('clicking the label area does not throw', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            // Click the wrapper div — origam-selection-control__label intercepts pointer
            // events on the inner origam-label; clicking the wrapper achieves the same
            // label-click behaviour.
            const labelWrapper = sandbox.locator('.origam-selection-control__label').first()
            await labelWrapper.click()
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Default (index 6)                                            //
    //                                                                      //
    // ⚠ The #default slot REPLACES the origam-input__control entirely:    //
    //   origam-selection-control, origam-checkbox-btn, and                //
    //   input[type=checkbox] are NOT rendered. Only the custom slot        //
    //   content is rendered inside origam-input__control.                 //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('renders the checkbox root (.origam-checkbox) without the native input', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const inputCount = await sandbox.locator('input[type=checkbox]').count()
            expect(inputCount).toBe(0)
        })

        test('custom slot content "Custom slot content" is rendered', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-input__control span').first()).toContainText('Custom slot content')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Label (index 7)                                              //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Label', () => {
        test('renders the native input (slot #label does not remove the input)', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('input[type=checkbox]').first()).toBeAttached()
        })

        test('slot label renders a custom span with "I agree to"', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const labelArea = sandbox.locator('.origam-selection-control__label')
            await expect(labelArea).toContainText('I agree to')
        })

        test('value div shows initial value = false', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const valueDiv = sandbox.locator('div').filter({ hasText: /^value =/ }).first()
            await expect(valueDiv).toContainText('value = false')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Input (index 8)                                              //
    //                                                                      //
    // ⚠ The #input slot REPLACES input[type=checkbox] with a custom <div>.//
    //   The component passes inputProps (id, type, aria-*, disabled, etc) //
    //   to the div via v-bind="inputProps". We assert the div is present   //
    //   with the expected attributes and that no native input is rendered. //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Input', () => {
        test('renders the checkbox root (.origam-checkbox)', async ({ page }) => {
            await page.goto(variantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
        })

        test('no native input[type=checkbox] in DOM (slot replaces it)', async ({ page }) => {
            await page.goto(variantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const inputCount = await sandbox.locator('input[type=checkbox]').count()
            expect(inputCount).toBe(0)
        })

        test('custom div slot has type="checkbox" attribute forwarded by inputProps', async ({ page }) => {
            await page.goto(variantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const customInput = sandbox.locator('.origam-selection-control__input div[type=checkbox]').first()
            await expect(customInput).toBeAttached()
        })

        test('value div shows initial value = false', async ({ page }) => {
            await page.goto(variantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const valueDiv = sandbox.locator('div').filter({ hasText: /^value =/ }).first()
            await expect(valueDiv).toContainText('value = false')
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT — playground (index 9)                                       //
    // init: { label: 'Accept terms', color: 'primary' }                   //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('renders checkbox root with color=primary', async ({ page }) => {
            await page.goto(variantUrl(9))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const wrapper = sandbox.locator('.origam-selection-control__wrapper').first()
            await expect(wrapper).toHaveClass(/origam--color-primary/)
        })

        test('renders label "Accept terms"', async ({ page }) => {
            await page.goto(variantUrl(9))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-label').first()).toContainText('Accept terms')
        })

        test('value div shows initial value = false', async ({ page }) => {
            await page.goto(variantUrl(9))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const valueDiv = sandbox.locator('div').filter({ hasText: /^value =/ }).first()
            await expect(valueDiv).toContainText('value = false')
        })

        test('toggle updates the value div to true', async ({ page }) => {
            await page.goto(variantUrl(9))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })
            const input = sandbox.locator('input[type=checkbox]').first()
            await input.click()
            const valueDiv = sandbox.locator('div').filter({ hasText: /^value =/ }).first()
            await expect(valueDiv).toContainText('value = true')
        })
    })
})
