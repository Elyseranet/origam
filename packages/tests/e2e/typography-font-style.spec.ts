import { expect, test, type FrameLocator, type Page } from '@playwright/test'

import { selectHstOption } from './_support/histoire-controls'

/**
 * #1119 — `fontStyle` (passthrough prop of `ITypographyProps`) must PAINT on
 * Title, TextMask and Blockquote: each SCSS reads `--origam-{prefix}---font-style`.
 * Measured in a real browser — jsdom cannot resolve `var()`. Driven through the
 * `Design` Variant's own `Font Style` control.
 */

const sandboxOf = (page: Page): FrameLocator => page.frameLocator('iframe[src*="__sandbox"]')

const CASES = [
    { name: 'OrigamTitle', story: 'components-stories-title-origamtitle-story-vue', sel: '.origam-title' },
    { name: 'OrigamTextMask', story: 'components-stories-textmask-origamtextmask-story-vue', sel: '.origam-text-mask' },
    { name: 'OrigamBlockquote', story: 'components-stories-blockquote-origamblockquote-story-vue', sel: '.origam-blockquote' }
]

for (const c of CASES) {
    test(`${c.name} fontStyle changes the computed font-style (#1119)`, async ({ page }) => {
        await page.goto(`/stories/story/${c.story}`)
        await page.waitForLoadState('networkidle')
        await page.getByText('Design', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const el = sandboxOf(page).locator(c.sel).first()
        await expect(el).toBeVisible({ timeout: 8000 })
        const read = () => el.evaluate((n) => getComputedStyle(n).fontStyle)

        expect(await read()).toBe('normal')

        await selectHstOption(page, 'Font Style', 'italic')
        await page.waitForTimeout(500)
        expect(await read()).toBe('italic')

        await selectHstOption(page, 'Font Style', 'normal')
        await page.waitForTimeout(500)
        expect(await read()).toBe('normal')
    })
}
