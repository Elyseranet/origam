import { expect, test, type FrameLocator, type Page } from '@playwright/test'

import { selectHstOption } from './_support/histoire-controls'

/**
 * #1101 — `textTransform` (Commons passthrough prop of `ITypographyProps`)
 * must PAINT on `OrigamTitle`: the SCSS reads `--origam-title---text-transform`.
 * Declared-but-unread was the state before this lot (`useTypography` emitted the
 * variable, nothing consumed it). Measured in a real browser — jsdom cannot
 * resolve `var()`. Driven through the `Design` Variant's own control.
 */

const sandboxOf = (page: Page): FrameLocator => page.frameLocator('iframe[src*="__sandbox"]')

const openDesign = async (page: Page) => {
    await page.goto('/stories/story/components-stories-title-origamtitle-story-vue')
    await page.waitForLoadState('networkidle')
    await page.getByText('Design', { exact: true }).first().click()
    await page.waitForTimeout(800)
}

const readTransform = (page: Page) => sandboxOf(page).locator('.origam-title').first().evaluate((el) => ({
    own: getComputedStyle(el).textTransform,
    parent: getComputedStyle(el.parentElement!).textTransform
}))

test.describe('OrigamTitle textTransform (#1101)', () => {
    test('default: inherits the context (no override emitted)', async ({ page }) => {
        await openDesign(page)
        await expect(sandboxOf(page).locator('.origam-title').first()).toBeVisible({ timeout: 8000 })

        const m = await readTransform(page)

        expect(m.own).toBe(m.parent)
        expect(m.own).toBe('none')
    })

    test('textTransform changes the computed text-transform', async ({ page }) => {
        await openDesign(page)

        await selectHstOption(page, 'Text Transform', 'uppercase')
        await page.waitForTimeout(500)
        expect((await readTransform(page)).own).toBe('uppercase')

        await selectHstOption(page, 'Text Transform', 'capitalize')
        await page.waitForTimeout(500)
        expect((await readTransform(page)).own).toBe('capitalize')
    })
})
