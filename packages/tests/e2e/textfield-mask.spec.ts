import { expect, test } from '@playwright/test'

const STORY_PATH = '/stories/story/components-stories-textfield-origamtextfield-story-vue'

// NOTE ON SCOPE: this file used to carry 6 additional `test.fixme` cases
// (phone:fr @complete, credit-card Luhn valid/invalid, backspace, @valid
// emit, custom pattern) blamed on either "Playwright synthetic input" or a
// "DS race condition". Both diagnoses were wrong — the actual cause is a
// Histoire double-mount of the story's `<script setup>` (2 Vue Suspense
// warnings for a single `<input>` in the DOM), which puts two component
// instances in control of one native input element. That topology cannot
// occur in a real consumer app (a single `<OrigamTextField>` mount never
// shares its `<input>` with a second instance), so it belongs to Histoire's
// dev harness, not the design system.
//
// That coverage now lives in
// `packages/tests/TU/components/TextField/OrigamTextField.mask.spec.ts`
// (Vitest + `@vue/test-utils`), which mounts exactly one component instance
// per test — the realistic topology, and the one that removes the
// double-mount confound entirely. See that file's header comment for the
// full measurement writeup. Do not re-add masked-input keystroke coverage
// here without re-reading it first: promoting it back to a live Histoire
// e2e spec resurrects the same false positive.
test.describe('OrigamTextField — mask', () => {
    // We cannot reliably interact with the Histoire HstSelect picker via
    // its custom DOM, so each test navigates via the variant title link
    // and exercises the `data-cy`-tagged fixture directly.

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
})
