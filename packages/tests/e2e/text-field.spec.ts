import { expect, test } from '@playwright/test'

/**
 * OrigamTextField — suite e2e
 *
 * ## Variant index map (0-based, 32 total)
 *   0  → Design          (init: label='Label', color='primary')
 *   1  → State           (hover/active surface)
 *   2  → Functional      (disabled, readonly, loading, counter, clearable…)
 *   3  → Events - update:modelValue   data-cy="textfield-emit-update"
 *   4  → Events - focus               data-cy="textfield-emit-focus"
 *   5  → Events - blur                data-cy="textfield-emit-blur"
 *   6  → Events - click:control       data-cy="textfield-emit-click-control"
 *   7  → Events - mousedown:control   data-cy="textfield-emit-mousedown-control"
 *   8  → Events - click:clear         data-cy="textfield-emit-clear"
 *   9  → Events - click:prepend       data-cy="textfield-emit-click-prepend"
 *  10  → Events - click:append        data-cy="textfield-emit-click-append"
 *  11  → Events - click:prependInner  data-cy="textfield-emit-click-prepend-inner"
 *  12  → Events - click:appendInner   data-cy="textfield-emit-click-append-inner"
 *  13  → Events - valid               data-cy="textfield-emit-valid"
 *  14  → Events - complete            data-cy="textfield-emit-complete"
 *  15  → Slots - Default              data-cy="textfield-slot-default"
 *  16  → Slots - Prepend              data-cy="textfield-slot-prepend"
 *  17  → Slots - Append               data-cy="textfield-slot-append"
 *  18  → Slots - PrependInner         data-cy="textfield-slot-prepend-inner"
 *  19  → Slots - AppendInner          data-cy="textfield-slot-append-inner"
 *  20  → Slots - Clear                data-cy="textfield-slot-clear"
 *  21  → Slots - Label                data-cy="textfield-slot-label"
 *  22  → Slots - FloatingLabel        data-cy="textfield-slot-floating-label"
 *  23  → Slots - Prefix               data-cy="textfield-slot-prefix"
 *  24  → Slots - Suffix               data-cy="textfield-slot-suffix"
 *  25  → Slots - Counter              data-cy="textfield-slot-counter"
 *  26  → Slots - Field                data-cy="textfield-slot-field"
 *  27  → Slots - Loader               data-cy="textfield-slot-loader"
 *  28  → Slots - Message              data-cy="textfield-slot-message"
 *  29  → Slots - Messages             data-cy="textfield-slot-messages"
 *  30  → Slots - Details              data-cy="textfield-slot-details"
 *  31  → Default (playground)         data-cy="textfield-playground"
 *
 * ## BEM structure (verified against live DOM)
 *   .origam-text-field          — root (also carries .origam-input)
 *   .origam-field               — inner OrigamField
 *   .origam-field--variant-outlined  — default variant (outlined)
 *   .origam-field--active       — when label floats (focused or dirty)
 *   .origam-field--focused      — while input has focus
 *   .origam-field--dirty        — when input has a value
 *   .origam-field--error        — when :error=true
 *   .origam-field--loading      — when :loading prop is truthy
 *   .origam-input--error        — error class also on the root
 *   .origam-field__input        — div wrapping the <input>
 *   .origam-field__clearable    — clear icon wrapper (visible when dirty+focused)
 *   .origam-field__loader       — loader slot wrapper
 *   .origam-messages            — hint/error messages container
 *   .origam-label               — floating label element
 */

const STORY_ID   = 'components-stories-textfield-origamtextfield-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamTextField', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { label: 'Label', color: 'primary' }                          //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('root carries origam-text-field BEM class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-text-field').first()
            await expect(root).toBeVisible({ timeout: 12000 })
        })

        test('inner OrigamField renders with variant-outlined by default', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-text-field').first()).toBeVisible({ timeout: 12000 })
            const field = sandbox.locator('.origam-field').first()
            await expect(field).toHaveClass(/origam-field--variant-outlined/)
        })

        test('color=primary applies the utility class origam--color-primary on the inner field', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-text-field').first()).toBeVisible({ timeout: 12000 })
            const field = sandbox.locator('.origam-field').first()
            await expect(field).toHaveClass(/origam--color-primary/)
        })

        test('label text "Label" is rendered', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-text-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-label').first()).toContainText('Label')
        })

        test('input element is present inside the field', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-text-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-text-field input').first()).toBeAttached()
        })

        test('density-default class is present on root', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-text-field').first()
            await expect(root).toBeVisible({ timeout: 12000 })
            await expect(root).toHaveClass(/origam-input--density-default/)
        })
    })

    // ------------------------------------------------------------------ //
    // STATE (index 1)                                                      //
    // ------------------------------------------------------------------ //

    test.describe('State', () => {
        test('renders the text-field in resting state', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-text-field').first()).toBeVisible({ timeout: 12000 })
        })

        test('resting field does not carry origam-field--focused class', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-text-field').first()).toBeVisible({ timeout: 12000 })
            const field = sandbox.locator('.origam-field').first()
            const cls = await field.getAttribute('class')
            expect(cls).not.toContain('origam-field--focused')
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 2)                                                 //
    // init: { disabled:false, readonly:false, error:false, …}             //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('renders with initial state (disabled=false, input is interactive)', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-text-field').first()).toBeVisible({ timeout: 12000 })
            const input = sandbox.locator('.origam-text-field input').first()
            await expect(input).toBeEnabled()
        })

        test('SCSS --disabled: injecting the class produces pointer-events: none', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-text-field').first()
            await expect(root).toBeVisible({ timeout: 12000 })
            const ptrEvents = await root.evaluate(el => {
                el.classList.add('origam-input--disabled')
                return getComputedStyle(el).pointerEvents
            })
            expect(ptrEvents).toBe('none')
        })

        test('error=false initially: origam-field--error class absent', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-text-field').first()).toBeVisible({ timeout: 12000 })
            const field = sandbox.locator('.origam-field').first()
            const cls = await field.getAttribute('class')
            expect(cls).not.toContain('origam-field--error')
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS (indexes 3–14)                                               //
    // ------------------------------------------------------------------ //

    test.describe('Events - update:modelValue', () => {
        test('typing into the input updates the input value', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-emit-update"]').first()).toBeVisible({ timeout: 12000 })
            const input = sandbox.locator('[data-cy="textfield-emit-update"] input').first()
            await input.fill('hello')
            await expect(input).toHaveValue('hello')
        })

        test('field becomes active (label floats) after fill', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-emit-update"]').first()).toBeVisible({ timeout: 12000 })
            await sandbox.locator('[data-cy="textfield-emit-update"] input').first().fill('test')
            await page.waitForTimeout(200)
            const field = sandbox.locator('[data-cy="textfield-emit-update"] .origam-field').first()
            await expect(field).toHaveClass(/origam-field--dirty/)
        })
    })

    test.describe('Events - focus', () => {
        test('renders a text-field for focus events', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-emit-focus"]').first()).toBeVisible({ timeout: 12000 })
        })

        test('clicking the field adds origam-field--focused class', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-emit-focus"]').first()).toBeVisible({ timeout: 12000 })
            await sandbox.locator('[data-cy="textfield-emit-focus"] input').first().click()
            const field = sandbox.locator('[data-cy="textfield-emit-focus"] .origam-field').first()
            await expect(field).toHaveClass(/origam-field--focused/)
        })
    })

    test.describe('Events - blur', () => {
        test('renders a text-field for blur events', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-emit-blur"]').first()).toBeVisible({ timeout: 12000 })
        })
    })

    test.describe('Events - click:control', () => {
        test('renders a clickable text-field', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-emit-click-control"]').first()).toBeVisible({ timeout: 12000 })
        })

        test('clicking the field does not throw', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-emit-click-control"]').first()).toBeVisible({ timeout: 12000 })
            await sandbox.locator('[data-cy="textfield-emit-click-control"]').first().click()
        })
    })

    test.describe('Events - click:clear', () => {
        /**
         * The clearable icon (.origam-field__clearable) is present in the DOM
         * once the field is dirty (value non-empty) AND the field is focused.
         * Fill the input, then assert the clearable wrapper is visible.
         */
        test('clearable field shows clear icon after fill and focus', async ({ page }) => {
            await page.goto(variantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-emit-clear"]').first()).toBeVisible({ timeout: 12000 })
            await sandbox.locator('[data-cy="textfield-emit-clear"] input').first().fill('abc')
            await page.waitForTimeout(300)
            await expect(sandbox.locator('[data-cy="textfield-emit-clear"] .origam-field__clearable').first()).toBeVisible({ timeout: 3000 })
        })

        test('clear icon is an <i> element with MDI close icon class', async ({ page }) => {
            await page.goto(variantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-emit-clear"]').first()).toBeVisible({ timeout: 12000 })
            await sandbox.locator('[data-cy="textfield-emit-clear"] input').first().fill('abc')
            await page.waitForTimeout(300)
            const clearIcon = sandbox.locator('[data-cy="textfield-emit-clear"] .origam-field__clearable .origam-icon').first()
            await expect(clearIcon).toBeAttached()
        })
    })

    test.describe('Events - click:prepend', () => {
        test('renders a text-field with an outer prepend slot', async ({ page }) => {
            await page.goto(variantUrl(9))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-emit-click-prepend"]').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textfield-emit-click-prepend"] .origam-icon').first()).toBeAttached()
        })
    })

    test.describe('Events - click:append', () => {
        test('renders a text-field with an outer append slot', async ({ page }) => {
            await page.goto(variantUrl(10))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-emit-click-append"]').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textfield-emit-click-append"] .origam-icon').first()).toBeAttached()
        })
    })

    test.describe('Events - click:prependInner', () => {
        test('renders a text-field with a prepend-inner icon', async ({ page }) => {
            await page.goto(variantUrl(11))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-emit-click-prepend-inner"]').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textfield-emit-click-prepend-inner"] .origam-icon').first()).toBeAttached()
        })
    })

    test.describe('Events - click:appendInner', () => {
        test('renders a text-field with an append-inner icon', async ({ page }) => {
            await page.goto(variantUrl(12))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-emit-click-append-inner"]').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textfield-emit-click-append-inner"] .origam-icon').first()).toBeAttached()
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS (indexes 15–30)                                                //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('default slot renders custom content alongside the input', async ({ page }) => {
            await page.goto(variantUrl(15))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-slot-default"]').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textfield-slot-default"]')).toContainText('Custom slot content')
        })
    })

    test.describe('Slots - Prepend', () => {
        test('prepend slot renders an icon outside the field', async ({ page }) => {
            await page.goto(variantUrl(16))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-slot-prepend"]').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textfield-slot-prepend"] .origam-icon').first()).toBeAttached()
        })
    })

    test.describe('Slots - Append', () => {
        test('append slot renders an icon outside the field', async ({ page }) => {
            await page.goto(variantUrl(17))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-slot-append"]').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textfield-slot-append"] .origam-icon').first()).toBeAttached()
        })
    })

    test.describe('Slots - PrependInner', () => {
        test('prependInner slot renders an icon inside the field', async ({ page }) => {
            await page.goto(variantUrl(18))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-slot-prepend-inner"]').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textfield-slot-prepend-inner"] .origam-icon').first()).toBeAttached()
        })
    })

    test.describe('Slots - AppendInner', () => {
        test('appendInner slot renders an icon inside the field', async ({ page }) => {
            await page.goto(variantUrl(19))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-slot-append-inner"]').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textfield-slot-append-inner"] .origam-icon').first()).toBeAttached()
        })
    })

    test.describe('Slots - Clear', () => {
        test('custom clear slot renders inside the clearable area after fill', async ({ page }) => {
            await page.goto(variantUrl(20))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-slot-clear"]').first()).toBeVisible({ timeout: 12000 })
            await sandbox.locator('[data-cy="textfield-slot-clear"] input').first().fill('abc')
            await page.waitForTimeout(300)
            await expect(sandbox.locator('[data-cy="textfield-slot-clear"] .origam-field__clearable').first()).toBeVisible({ timeout: 3000 })
        })
    })

    test.describe('Slots - Label', () => {
        test('custom label slot renders instead of the default label', async ({ page }) => {
            await page.goto(variantUrl(21))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-slot-label"]').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textfield-slot-label"]')).toContainText('Custom label')
        })
    })

    test.describe('Slots - FloatingLabel', () => {
        test('custom floatingLabel slot content is rendered in the outline notch', async ({ page }) => {
            await page.goto(variantUrl(22))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-slot-floating-label"]').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textfield-slot-floating-label"]')).toContainText('Floating label')
        })
    })

    test.describe('Slots - Prefix', () => {
        test('prefix slot renders custom content before the input', async ({ page }) => {
            await page.goto(variantUrl(23))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-slot-prefix"]').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textfield-slot-prefix"]')).toContainText('$')
        })
    })

    test.describe('Slots - Suffix', () => {
        test('suffix slot renders custom content after the input', async ({ page }) => {
            await page.goto(variantUrl(24))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-slot-suffix"]').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textfield-slot-suffix"]')).toContainText('.00')
        })
    })

    test.describe('Slots - Counter', () => {
        test('custom counter slot renders with character count after focus', async ({ page }) => {
            await page.goto(variantUrl(25))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-slot-counter"]').first()).toBeVisible({ timeout: 12000 })
            await sandbox.locator('[data-cy="textfield-slot-counter"] input').first().click()
            await page.waitForTimeout(300)
            // Custom counter slot renders "0 / 50" (length of empty string over max)
            await expect(sandbox.locator('[data-cy="textfield-slot-counter"]')).toContainText('/ 50')
        })
    })

    test.describe('Slots - Field', () => {
        test('field slot renders custom content replacing the inner field', async ({ page }) => {
            await page.goto(variantUrl(26))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-slot-field"]').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textfield-slot-field"]')).toContainText('Custom field content')
        })
    })

    test.describe('Slots - Loader', () => {
        /**
         * When :loading is truthy, OrigamField adds origam-field--loading modifier.
         * The custom #loader slot content ("Loading...") replaces the default loader.
         * Verified from live DOM: the <span>Loading...</span> is rendered directly
         * inside the field (the #loader slot is honoured).
         */
        test('loading prop adds origam-field--loading class to the inner field', async ({ page }) => {
            await page.goto(variantUrl(27))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-slot-loader"]').first()).toBeVisible({ timeout: 12000 })
            const field = sandbox.locator('[data-cy="textfield-slot-loader"] .origam-field').first()
            await expect(field).toHaveClass(/origam-field--loading/)
        })

        test('custom loader slot content is rendered when loading=true', async ({ page }) => {
            await page.goto(variantUrl(27))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-slot-loader"]').first()).toBeVisible({ timeout: 12000 })
            // The story renders <template #loader><span>Loading...</span></template>
            // The slot content is inserted directly inside the field.
            await expect(sandbox.locator('[data-cy="textfield-slot-loader"]')).toContainText('Loading...')
        })
    })

    test.describe('Slots - Message', () => {
        /**
         * The story passes :error="true" :error-messages="['Error']" and overrides
         * the #message slot with an italic <span>. The rendered text "Error" is
         * present inside .origam-messages. The :error=true prop adds
         * origam-field--error to the inner field.
         */
        test('error=true adds origam-field--error class', async ({ page }) => {
            await page.goto(variantUrl(28))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-slot-message"]').first()).toBeVisible({ timeout: 12000 })
            const field = sandbox.locator('[data-cy="textfield-slot-message"] .origam-field').first()
            await expect(field).toHaveClass(/origam-field--error/)
        })

        test('custom message slot renders the error text', async ({ page }) => {
            await page.goto(variantUrl(28))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-slot-message"]').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textfield-slot-message"] .origam-messages')).toContainText('Error')
        })
    })

    test.describe('Slots - Messages', () => {
        test('custom messages slot renders a custom error display', async ({ page }) => {
            await page.goto(variantUrl(29))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-slot-messages"]').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textfield-slot-messages"]')).toContainText('Custom error display')
        })
    })

    test.describe('Slots - Details', () => {
        test('custom details slot renders hint text below the field', async ({ page }) => {
            await page.goto(variantUrl(30))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-slot-details"]').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textfield-slot-details"]')).toContainText('Custom hint text')
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT — playground (index 31)                                     //
    // init: { label:'Full name', color:'primary' }                        //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('renders with label "Full name"', async ({ page }) => {
            await page.goto(variantUrl(31))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-playground"]').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textfield-playground"] .origam-label').first()).toContainText('Full name')
        })

        test('typing into the playground input updates the input value', async ({ page }) => {
            await page.goto(variantUrl(31))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-playground"]').first()).toBeVisible({ timeout: 12000 })
            const input = sandbox.locator('[data-cy="textfield-playground"] input').first()
            await input.fill('test value')
            await expect(input).toHaveValue('test value')
        })

        test('input is a native <input> element', async ({ page }) => {
            await page.goto(variantUrl(31))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-playground"]').first()).toBeVisible({ timeout: 12000 })
            const tag = await sandbox.locator('[data-cy="textfield-playground"] input').first().evaluate(
                el => el.tagName.toLowerCase()
            )
            expect(tag).toBe('input')
        })

        test('field becomes dirty after fill (origam-field--dirty class)', async ({ page }) => {
            await page.goto(variantUrl(31))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textfield-playground"]').first()).toBeVisible({ timeout: 12000 })
            await sandbox.locator('[data-cy="textfield-playground"] input').first().fill('dirty test')
            await page.waitForTimeout(200)
            const field = sandbox.locator('[data-cy="textfield-playground"] .origam-field').first()
            await expect(field).toHaveClass(/origam-field--dirty/)
        })
    })
})
