import { expect, test } from '@playwright/test'

const STORY_PATH = '/stories/story/components-stories-textfield-origamtextfield-story-vue'

test.describe('OrigamTextField — mask', () => {
    // We cannot reliably interact with the Histoire HstSelect picker via
    // its custom DOM, so each test navigates via the variant title link
    // and exercises the `data-cy`-tagged fixture directly.

    test('phone:fr — typing 0612345678 formats to "06 12 34 56 78"', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByRole('link', { name: 'Prop — mask (built-in patterns)', exact: true }).click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const wrapper = sandbox.locator('[data-cy="textfield-mask-builtin"]')
        await expect(wrapper).toBeVisible({ timeout: 5000 })

        const input = wrapper.locator('input').first()
        await input.click()
        await input.fill('')
        await input.type('0612345678', { delay: 10 })

        // DOM displays the masked version
        await expect(input).toHaveValue('06 12 34 56 78', { timeout: 3000 })

        // v-model (status line) shows the unmasked version
        const status = sandbox.locator('[data-cy="textfield-mask-builtin-status"]')
        await expect(status).toContainText('unmasked = 0612345678')
        await expect(status).toContainText('complete = true')
        await expect(status).toContainText('valid = true')
    })

    test('phone:fr — partial value (4 digits) is not complete', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByRole('link', { name: 'Prop — mask (built-in patterns)', exact: true }).click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const wrapper = sandbox.locator('[data-cy="textfield-mask-builtin"]')
        const input = wrapper.locator('input').first()
        await input.click()
        await input.fill('')
        await input.type('1234', { delay: 10 })

        const status = sandbox.locator('[data-cy="textfield-mask-builtin-status"]')
        await expect(status).toContainText('complete = false')
    })

    test('creditcard — valid Luhn 4111... passes', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByRole('link', { name: 'Prop — mask (credit card with Luhn)', exact: true }).click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const wrapper = sandbox.locator('[data-cy="textfield-mask-creditcard"]')
        const input = wrapper.locator('input').first()
        await input.click()
        await input.fill('')
        await input.type('4111111111111111', { delay: 5 })

        await expect(input).toHaveValue('4111 1111 1111 1111')
        // Valid Luhn → no aria-invalid="true"
        const ariaInvalid = await input.getAttribute('aria-invalid')
        expect(ariaInvalid).not.toBe('true')
    })

    test('creditcard — invalid Luhn fails validation', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByRole('link', { name: 'Prop — mask (credit card with Luhn)', exact: true }).click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const wrapper = sandbox.locator('[data-cy="textfield-mask-creditcard"]')
        const input = wrapper.locator('input').first()
        await input.click()
        await input.fill('')
        await input.type('1234567890123456', { delay: 5 })

        await expect(input).toHaveValue('1234 5678 9012 3456')
        await expect(input).toHaveAttribute('aria-invalid', 'true', { timeout: 3000 })
    })

    test('paste "06.12.34.56.78" — dots are stripped and mask is applied', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByRole('link', { name: 'Prop — mask (built-in patterns)', exact: true }).click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const wrapper = sandbox.locator('[data-cy="textfield-mask-builtin"]')
        const input = wrapper.locator('input').first()
        await input.click()
        await input.fill('')

        // Programmatic paste — set clipboard via evaluate then dispatch
        await input.evaluate((el: HTMLInputElement) => {
            const ev = new ClipboardEvent('paste', {
                clipboardData: new DataTransfer(),
                bubbles: true,
                cancelable: true,
            })
            ev.clipboardData?.setData('text', '06.12.34.56.78')
            el.dispatchEvent(ev)
        })

        // After paste, input should display the formatted value.
        await expect(input).toHaveValue('06 12 34 56 78', { timeout: 3000 })
    })

    test('backspace — preserves unmasked semantics (deletes digit, skips literal)', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByRole('link', { name: 'Prop — mask (built-in patterns)', exact: true }).click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const wrapper = sandbox.locator('[data-cy="textfield-mask-builtin"]')
        const input = wrapper.locator('input').first()
        await input.click()
        await input.fill('')
        await input.type('0612345678', { delay: 10 })
        await expect(input).toHaveValue('06 12 34 56 78')

        await input.press('Backspace')
        // The last digit is gone; the mask now shows 9 digits.
        // Depending on caret behaviour, we accept either "06 12 34 56 7"
        // or trailing-literal-stripped variant. The unmasked is "061234567".
        const status = sandbox.locator('[data-cy="textfield-mask-builtin-status"]')
        await expect(status).toContainText('unmasked = 061234567')
    })

    test('@valid emit fires when validity flips', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByRole('link', { name: 'Emit — valid / complete', exact: true }).click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const wrapper = sandbox.locator('[data-cy="textfield-mask-emit"]')
        const input = wrapper.locator('input').first()
        await input.click()
        await input.fill('')
        await input.type('0612345678', { delay: 10 })

        const status = sandbox.locator('[data-cy="textfield-mask-emit-status"]')
        // At least one valid emit should have fired
        const text = await status.textContent()
        const match = text?.match(/valid-emits = (\d+)/)
        const count = match ? Number(match[1]) : 0
        expect(count).toBeGreaterThan(0)
    })

    test('custom pattern (##) ###-#### formats US-style phone', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByRole('link', { name: 'Prop — mask (custom pattern)', exact: true }).click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const wrapper = sandbox.locator('[data-cy="textfield-mask-custom"]')
        const input = wrapper.locator('input').first()
        await input.click()
        await input.fill('')
        await input.type('1234567890', { delay: 5 })

        // Pattern (##) ###-#### has 9 digit slots; the 10th is dropped.
        await expect(input).toHaveValue('(12) 345-6789')
        const status = sandbox.locator('[data-cy="textfield-mask-custom-status"]')
        await expect(status).toContainText('unmasked = 123456789')
    })
})
