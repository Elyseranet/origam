import { expect, test, type Page } from '@playwright/test'
import { selectHstOption } from './_support/histoire-controls'

/**
 * Regression — `OrigamBottomNav`'s `height` override must preserve the
 * consumer's CSS unit, not silently re-serialise it as a bare px number.
 *
 * #384's first fix pass replaced `Number(props.height)` with `int()` to stop
 * producing an invalid `height: NaN` declaration for CSS-length strings
 * (`Number('96px')` === NaN). That removed the NaN, but the numeric result
 * was still fed through `convertToUnit(height.value)` for the ACTUAL CSS
 * declaration — and `convertToUnit` of a plain JS number always appends
 * `px`. Passing `height="50vh"` therefore rendered a FIXED `50px`, not a
 * viewport-relative `50vh`: silently wrong, on every render, independent of
 * `density`. This is worse than the original NaN bug — a dropped invalid
 * declaration is at least harmless (the earlier, correct `dimensionStyles`
 * value survives); a valid-but-wrong declaration wins outright.
 *
 * Fix: the override only exists at all when `density === 'compact'` (the
 * one case that needs a value different from what `dimensionStyles` already
 * emits); when it applies, the subtraction is expressed as a native CSS
 * `calc(<unit-preserving-value> - 8px)`, which the browser resolves
 * correctly for ANY unit — not a JS-side numeric coercion.
 */

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const openDesign = async (page: Page) => {
    await page.goto('/stories/story/components-stories-bottomnav-origambottomnav-story-vue')
    await page.waitForLoadState('networkidle')
    await page.getByText('Design', { exact: true }).first().click()
    await page.waitForTimeout(500)
}

test('height="50vh", default density: computed height stays viewport-relative, not coerced to 50px', async ({ page }) => {
    await openDesign(page)
    const heightInput = page.getByLabel('Height')
    await heightInput.fill('50vh')
    await heightInput.blur()
    await page.waitForTimeout(400)

    const sandbox = sandboxOf(page)
    const nav = sandbox.locator('.origam-bottom-nav').first()
    await expect(nav).toBeVisible({ timeout: 8000 })

    const viewportHeight = await sandbox.locator('body').evaluate(() => window.innerHeight)
    const computed = await nav.evaluate(el => getComputedStyle(el).height)

    // Pre-fix this measured a flat "50px" regardless of viewport size —
    // proof the override was re-serialising the value as px. Post-fix it
    // tracks 50% of the sandbox viewport height (±2px rounding slack).
    expect(Math.abs(parseFloat(computed) - viewportHeight * 0.5)).toBeLessThan(2)
})

test('height="96px" + density="compact": computed height is 88px (calc() resolves to the documented contract)', async ({ page }) => {
    await openDesign(page)
    const heightInput = page.getByLabel('Height')
    await heightInput.fill('96px')
    await heightInput.blur()

    await selectHstOption(page, 'Density', 'Compact')
    await page.waitForTimeout(400)

    const sandbox = sandboxOf(page)
    const nav = sandbox.locator('.origam-bottom-nav').first()
    await expect(nav).toBeVisible({ timeout: 8000 })

    const computed = await nav.evaluate(el => getComputedStyle(el).height)
    expect(computed).toBe('88px')
})

test('height="10rem" + density="compact": computed height resolves calc(10rem - 8px), not a broken px value', async ({ page }) => {
    await openDesign(page)
    const heightInput = page.getByLabel('Height')
    await heightInput.fill('10rem')
    await heightInput.blur()

    await selectHstOption(page, 'Density', 'Compact')
    await page.waitForTimeout(400)

    const sandbox = sandboxOf(page)
    const nav = sandbox.locator('.origam-bottom-nav').first()
    await expect(nav).toBeVisible({ timeout: 8000 })

    const rootFontSize = await sandbox.locator('html').evaluate(el => parseFloat(getComputedStyle(el).fontSize))
    const computed = await nav.evaluate(el => getComputedStyle(el).height)
    const expected = rootFontSize * 10 - 8

    expect(Math.abs(parseFloat(computed) - expected)).toBeLessThan(1)
})
