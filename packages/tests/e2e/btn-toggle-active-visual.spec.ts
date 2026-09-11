import { expect, test, type Page } from '@playwright/test'

/**
 * Regression spec — the active button inside an `OrigamBtnToggle` must
 * be visually distinct from its non-selected siblings. Pre-fix the
 * `--active` overlay opacity reused `--overlay-opacity-hover` (0.12),
 * which made the selected option indistinguishable from a hovered
 * non-selected one — the user couldn't see which option was current.
 *
 * The fix introduced a dedicated `--overlay-opacity-active` token
 * (default 0.2) so selected gets a stronger overlay than hover. We
 * assert the runtime opacity differs between an active sibling and a
 * non-active sibling.
 */

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyPath: string, variant: string) => {
    await page.goto(storyPath)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

const STORY = '/stories/story/components-stories-btn-origambtntoggle-story-vue'

test('active button overlay opacity > non-active sibling opacity', async ({ page }) => {
    await openVariant(page, STORY, 'Prop — modelValue (single selection)')
    const sandbox = sandboxOf(page)
    await expect(sandbox.locator('.origam-btn-toggle').first()).toBeVisible({ timeout: 8000 })

    // Story default: `center` is selected (defaultValue = ref('center')).
    const activeOverlayOpacity = await sandbox
        .locator('.origam-btn--active .origam-btn__overlay')
        .first()
        .evaluate(el => parseFloat(getComputedStyle(el).opacity))

    const inactiveOverlayOpacity = await sandbox
        .locator('.origam-btn:not(.origam-btn--active) .origam-btn__overlay')
        .first()
        .evaluate(el => parseFloat(getComputedStyle(el).opacity))

    console.log('[active overlay opacity]:', activeOverlayOpacity)
    console.log('[inactive overlay opacity]:', inactiveOverlayOpacity)

    // The active overlay must be visible (≥ 0.15 to clear the noise floor).
    expect(activeOverlayOpacity).toBeGreaterThanOrEqual(0.15)
    // Inactive btn overlay is invisible at rest.
    expect(inactiveOverlayOpacity).toBeLessThan(0.05)
    // Active is strictly stronger than inactive.
    expect(activeOverlayOpacity).toBeGreaterThan(inactiveOverlayOpacity)
})

test('active button overlay > hover overlay (selected reads as "more present")', async ({ page }) => {
    await openVariant(page, STORY, 'Prop — modelValue (single selection)')
    const sandbox = sandboxOf(page)
    await expect(sandbox.locator('.origam-btn-toggle').first()).toBeVisible({ timeout: 8000 })

    const activeOverlayOpacity = await sandbox
        .locator('.origam-btn--active .origam-btn__overlay')
        .first()
        .evaluate(el => parseFloat(getComputedStyle(el).opacity))

    // Hover the FIRST non-active sibling, sample its overlay.
    const inactiveBtn = sandbox.locator('.origam-btn:not(.origam-btn--active)').first()
    await inactiveBtn.hover()
    await page.waitForTimeout(250)
    const hoverOverlayOpacity = await inactiveBtn
        .locator('.origam-btn__overlay')
        .evaluate(el => parseFloat(getComputedStyle(el).opacity))

    console.log('[active overlay]:', activeOverlayOpacity, ' [hover overlay]:', hoverOverlayOpacity)

    // Pre-fix both equalled 0.12 → indistinguishable. Post-fix active = 0.2,
    // hover = 0.12, so active reads as the dominant state.
    expect(activeOverlayOpacity).toBeGreaterThan(hoverOverlayOpacity)
})
