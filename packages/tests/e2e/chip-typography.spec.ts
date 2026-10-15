import { expect, test, type FrameLocator, type Page } from '@playwright/test'

import { selectHstOption } from './_support/histoire-controls'

/**
 * #1101 — `OrigamChip` typography surface: `fontFamily`, `letterSpacing`
 * (token props) and `textTransform` (Commons passthrough prop).
 *
 * #501 removed these props because they were INERT: the SCSS never read the
 * variable `useTypography` emits. This spec is the proof they are not any more
 * — each prop must change the COMPUTED style of the chip's text element, in a
 * real browser (jsdom cannot resolve `var()`).
 *
 * Driven through the `Design` Variant's own controls, read on the text element
 * (`.origam-chip__content`), which inherits from the chip root.
 */

const sandboxOf = (page: Page): FrameLocator => page.frameLocator('iframe[src*="__sandbox"]')

const openDesign = async (page: Page) => {
    await page.goto('/stories/story/components-stories-chip-origamchip-story-vue')
    await page.waitForLoadState('networkidle')
    await page.getByText('Design', { exact: true }).first().click()
    await page.waitForTimeout(800)
}

const readText = (page: Page) => sandboxOf(page).locator('.origam-chip__content').first().evaluate((el) => {
    const cs = getComputedStyle(el)
    const parent = getComputedStyle(el.closest('.origam-chip')!.parentElement!)

    return {
        fontFamily: cs.fontFamily,
        letterSpacing: cs.letterSpacing,
        textTransform: cs.textTransform,
        parentFontFamily: parent.fontFamily,
        parentLetterSpacing: parent.letterSpacing,
        parentTextTransform: parent.textTransform
    }
})

test.describe('OrigamChip typography (#1101)', () => {
    test('default: the chip inherits font-family / letter-spacing / text-transform from its context', async ({ page }) => {
        await openDesign(page)
        await expect(sandboxOf(page).locator('.origam-chip').first()).toBeVisible({ timeout: 8000 })

        const m = await readText(page)

        expect(m.fontFamily).toBe(m.parentFontFamily)
        expect(m.letterSpacing).toBe(m.parentLetterSpacing)
        expect(m.textTransform).toBe(m.parentTextTransform)
    })

    test('fontFamily changes the computed font-family', async ({ page }) => {
        await openDesign(page)
        const before = await readText(page)

        await selectHstOption(page, 'Font Family', 'Mono')
        await page.waitForTimeout(500)

        const after = await readText(page)

        expect(after.fontFamily).not.toBe(before.fontFamily)
        expect(after.fontFamily.toLowerCase()).toMatch(/mono|courier|menlo|consolas/)
    })

    test('letterSpacing changes the computed letter-spacing', async ({ page }) => {
        await openDesign(page)
        const before = await readText(page)

        await selectHstOption(page, 'Letter Spacing', 'widest (0.0893em)')
        await page.waitForTimeout(500)

        const after = await readText(page)

        expect(after.letterSpacing).not.toBe(before.letterSpacing)
        expect(parseFloat(after.letterSpacing)).toBeGreaterThan(0)
    })

    test('textTransform changes the computed text-transform', async ({ page }) => {
        await openDesign(page)
        const before = await readText(page)

        expect(before.textTransform).toBe('none')

        await selectHstOption(page, 'Text Transform', 'uppercase')
        await page.waitForTimeout(500)
        expect((await readText(page)).textTransform).toBe('uppercase')

        await selectHstOption(page, 'Text Transform', 'capitalize')
        await page.waitForTimeout(500)
        expect((await readText(page)).textTransform).toBe('capitalize')
    })
})
