import { expect, test } from '@playwright/test'
const sandboxOf = (page) => page.frameLocator('iframe[src*="__sandbox"]')
const open = async (page, path, variant) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

test('Alert: default has 0 border on every side', async ({ page }) => {
    await open(page, '/stories/story/components-stories-alert-origamalert-story-vue', 'Default')
    const sandbox = sandboxOf(page)
    const alert = sandbox.locator('[data-cy="alert-playground"]').first()
    await expect(alert).toBeVisible({ timeout: 10000 })
    const w = await alert.evaluate(el => {
        const cs = getComputedStyle(el)
        return [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].map(parseFloat)
    })
    console.log('[alert default border widths]:', w)
    for (const px of w) expect(px).toBe(0)
})

test('Sheet: default has 0 border on every side', async ({ page }) => {
    // Use the Default variant — it doesn't set the `border` prop, so the
    // computed border widths must all be 0 if the SCSS reads the
    // directional tokens correctly.
    await open(page, '/stories/story/components-stories-sheet-origamsheet-story-vue', 'Default')
    const sandbox = sandboxOf(page)
    const sheet = sandbox.locator('.origam-sheet').first()
    await expect(sheet).toBeVisible({ timeout: 10000 })
    const w = await sheet.evaluate(el => {
        const cs = getComputedStyle(el)
        return [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].map(parseFloat)
    })
    console.log('[sheet default border widths]:', w)
    for (const px of w) expect(px).toBe(0)
})
