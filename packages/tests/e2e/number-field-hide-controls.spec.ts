import { expect, test } from '@playwright/test'
import { toggleHstCheckbox } from './_support/histoire-controls'

/**
 * #1327 — with `hideControls` no empty `.origam-field__prepend-inner` column is rendered,
 * so the text starts where a plain text-field's does. Functional variant (index 1).
 */
const STORY_ID = 'components-stories-numberfield-origamnumberfield-story-vue'
const url = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-1`

test.describe('OrigamNumberField — hideControls (#1327)', () => {
    test.setTimeout(45000)

    test('no prepend-inner zone once controls are hidden', async ({ page }) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('.origam-number-field').first()
        await expect(root).toBeVisible({ timeout: 12000 })

        const measure = () => root.evaluate((el) => {
            return {
                zones: el.querySelectorAll('.origam-field__prepend-inner').length
            }
        })

        // controls live in prepend-inner only with `split` (#1449)
        await toggleHstCheckbox(page, 'Split')
        await expect.poll(async () => (await measure()).zones, { timeout: 8000 }).toBe(1)
        const withControls = await measure()
        await toggleHstCheckbox(page, 'Hide Controls')
        await expect.poll(async () => (await measure()).zones, { timeout: 8000 }).toBe(0)
        expect(withControls.zones).toBe(1)
    })
})
