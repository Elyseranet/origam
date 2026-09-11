import { expect, test, type Page } from '@playwright/test'

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

// Deep-link straight to the variant (root-relative `/stories/story/...`,
// resolved against baseURL). The old form hit `/story/<slug>` (missing the
// `/stories` base → 404), then `waitForLoadState('networkidle')` (never resolves
// under Histoire's HMR websocket) + a brittle `getByText(...).click()`.
const open = async (page: Page, slug: string, variantIdx: number) => {
    await page.goto(`/stories/story/${slug}?variantId=${slug}-${variantIdx}`)
}

/**
 * Pre-fix `.origam-field__input` defaulted to `box-sizing: content-box`
 * so the inline padding stacked ON TOP of the min-height target.
 * Switching to `border-box` keeps the rendered height aligned with the
 * design-token-driven scale (P1·B: xs=28 / sm=36 / md=44 / lg=52, default
 * is `md`-equivalent = 36 px, down from the legacy Material 56 baseline).
 */

test('OrigamTextField — field renders at 36px default (P1·B size scale)', async ({ page }) => {
    await open(page, 'components-stories-textfield-origamtextfield-story-vue', 0)
    const sandbox = sandboxOf(page)
    const field = sandbox.locator('.origam-field').first()
    await expect(field).toBeVisible({ timeout: 8000 })
    const h = await field.evaluate(el => Math.round(el.getBoundingClientRect().height))
    expect(h).toBe(36)

    const inputBoxSizing = await sandbox.locator('.origam-field__input').first().evaluate(el => getComputedStyle(el).boxSizing)
    expect(inputBoxSizing).toBe('border-box')
})
