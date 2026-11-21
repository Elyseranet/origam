import { expect, test } from '@playwright/test'

// #1426 — Variant 31 « Items - subheader / divider » (appendue en dernier).
const STORY_ID = 'components-stories-select-origamselect-story-vue'
const URL = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-31`

test.describe('OrigamSelect — subheader / divider (#1426)', () => {
    test('structure rows are not options and the keyboard skips them', async ({ page }) => {
        await page.goto(URL, { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const select = sandbox.locator('[data-cy="select-grouped-items"]').first()
        await select.locator('.origam-field').click()

        const options = sandbox.locator('[role="option"]')
        await expect(options).toHaveText(['LinkedIn', 'Bluesky', 'Instagram'])
        await expect(sandbox.locator('.origam-list-subheader')).toHaveCount(2)

        const input = select.locator('input')
        const activeText = async () => {
            const id = await input.getAttribute('aria-activedescendant')
            return sandbox.locator(`[id="${id}"]`).innerText()
        }
        await input.press('ArrowDown')
        expect(await activeText()).toBe('LinkedIn')
        await input.press('ArrowDown')
        await input.press('ArrowDown')
        expect(await activeText()).toBe('Instagram')
        await input.press('ArrowDown')
        expect(await activeText()).toBe('LinkedIn')
        await input.press('End')
        expect(await activeText()).toBe('Instagram')
    })
})
