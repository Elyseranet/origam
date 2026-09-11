import { expect, test } from '@playwright/test'

const sandboxOf = (page) => page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page, variant) => {
    await page.goto('/stories/story/components-stories-bottomnav-origambottomnav-story-vue')
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

test('Default variant: BottomNav has NO visible border by default', async ({ page }) => {
    // The "Default" variant initialises border: false explicitly — border-widths
    // must resolve to 0 via CSS variable fallback.
    await openVariant(page, 'Default')
    const sandbox = sandboxOf(page)
    const nav = sandbox.locator('.origam-bottom-nav').first()
    await expect(nav).toBeVisible({ timeout: 8000 })

    const widths = await nav.evaluate(el => {
        const cs = getComputedStyle(el)
        return {
            top:    parseFloat(cs.borderTopWidth),
            right:  parseFloat(cs.borderRightWidth),
            bottom: parseFloat(cs.borderBottomWidth),
            left:   parseFloat(cs.borderLeftWidth)
        }
    })
    console.log('[bottom-nav default border widths]:', widths)
    expect(widths.top).toBe(0)
    expect(widths.right).toBe(0)
    expect(widths.bottom).toBe(0)
    expect(widths.left).toBe(0)
})

test('Border variant: enabling `border` prop produces a visible 1px border', async ({ page }) => {
    await openVariant(page, 'Prop — border')
    const sandbox = sandboxOf(page)
    const nav = sandbox.locator('.origam-bottom-nav').first()
    await expect(nav).toBeVisible({ timeout: 8000 })

    const widths = await nav.evaluate(el => {
        const cs = getComputedStyle(el)
        return {
            top:    parseFloat(cs.borderTopWidth),
            right:  parseFloat(cs.borderRightWidth),
            bottom: parseFloat(cs.borderBottomWidth),
            left:   parseFloat(cs.borderLeftWidth)
        }
    })
    console.log('[bottom-nav border-on widths]:', widths)
    // `thin` resolves to ~1px in modern browsers.
    expect(widths.top).toBeGreaterThanOrEqual(1)
})
