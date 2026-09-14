import { expect, test, type Page } from '@playwright/test'

import { fillHstText, selectHstOption } from './_support/histoire-controls'

/**
 * OrigamWindow — surface props (rounded/border/elevation/padding/margin).
 *
 * Classeur "divers" (2026-09-01) flagged this component as "globalement
 * solide" on this axis, with the target being C3/C4 — the unit spec
 * (`packages/tests/TU/components/Window/window-surface-props.spec.ts`)
 * proves the classes toggle correctly under jsdom (reliable there); this
 * file proves the CSS actually PAINTS in a real browser, since jsdom's
 * getComputedStyle never resolves `var()` (root CLAUDE.md).
 */

const STORY = '/stories/story/components-stories-window-origamwindow-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, title: string): Promise<void> => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(400)
}

test.describe('OrigamWindow — surface props paint in a real browser', () => {
    test('rounded paints a visible border-radius', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        const root = sandbox.locator('.origam-window').first()
        await expect(root).toBeVisible({ timeout: 8000 })

        const before = await root.evaluate((el) => getComputedStyle(el).borderRadius)

        await selectHstOption(page, 'Rounded', 'large (radius.xl / 16px)')

        const after = await root.evaluate((el) => getComputedStyle(el).borderRadius)
        expect(after).not.toBe(before)
        expect(parseFloat(after)).toBeGreaterThan(0)
    })

    test('border width prop actually changes the rendered border (not masked by the demo frame)', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        const root = sandbox.locator('.origam-window').first()
        await expect(root).toBeVisible({ timeout: 8000 })

        const before = await root.evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth))

        await selectHstOption(page, 'Border', 'Width — 8px')

        const after = await root.evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth))
        expect(after).toBe(8)
        expect(after).not.toBe(before)
    })

    test('elevation paints a box-shadow', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        const root = sandbox.locator('.origam-window').first()
        await expect(root).toBeVisible({ timeout: 8000 })

        const before = await root.evaluate((el) => getComputedStyle(el).boxShadow)

        await selectHstOption(page, 'Elevation', 'MD (8)')

        const after = await root.evaluate((el) => getComputedStyle(el).boxShadow)
        expect(after).not.toBe('none')
        expect(after).not.toBe(before)
    })

    test('padding paints a real inset', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        const root = sandbox.locator('.origam-window').first()
        await expect(root).toBeVisible({ timeout: 8000 })

        await fillHstText(page, 'Padding', '24px')

        const paddingTop = await root.evaluate((el) => getComputedStyle(el).paddingTop)
        expect(paddingTop).toBe('24px')
    })

    test('margin paints a real outset', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        const root = sandbox.locator('.origam-window').first()
        await expect(root).toBeVisible({ timeout: 8000 })

        await fillHstText(page, 'Margin', '12px')

        const marginTop = await root.evaluate((el) => getComputedStyle(el).marginTop)
        expect(marginTop).toBe('12px')
    })
})
