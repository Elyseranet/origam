import { expect, test } from '@playwright/test'

/**
 * OrigamBracketCompetitor — #513 regression: `__seed`, `--loser`, `--tbd`
 * and `--forfeit .__name` used to de-emphasise their text via `opacity` on
 * top of `currentColor`. Contrast is a property of the COMPOSITED color,
 * not the declared one — opacity multiplies whatever hue `currentColor`
 * carries (any `TIntent` the row is given) against the surface behind it.
 *
 * Measured independently (WCAG 2.x relative-luminance formula) before the
 * fix, with `color="primary"` (primary.700 `#6D28D9`, 7.10:1 on white
 * unstyled): seed/tbd/forfeit dimmed to opacity 0.7 composited to 3.84:1
 * (fails AA 4.5:1); loser at opacity 0.85 composited to 5.30:1 (passed by
 * chance, not by design — a different intent, e.g. `warning` at 5.02:1
 * baseline, would not have).
 *
 * The fix drops `opacity` entirely and paints a fixed, pre-vetted neutral
 * (`--origam-color__text---secondary`, 7.81:1 on white) instead of dimming
 * whatever color was already there — safe for any intent, including ones
 * set via inline style (which wins over the class-based fallback for
 * `color`, but never carried `opacity` to begin with).
 */

const STORY_PATH = '/stories/story/components-stories-bracket-origambracketcompetitor-story-vue'

async function openVariant(page: import('@playwright/test').Page, name: string) {
    await page.goto(STORY_PATH)
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name, exact: true }).click()
    await page.waitForTimeout(600)
    return page.frameLocator('iframe[src*="__sandbox"]')
}

test.describe('OrigamBracketCompetitor — #513 contrast regression', () => {
    test('seed number renders at opacity 1 with the compliant secondary text color', async ({ page }) => {
        const frame = await openVariant(page, 'Default')

        const seed = frame.locator('.origam-bracket-competitor__seed').first()
        await expect(seed).toBeVisible({ timeout: 5000 })

        const { opacity, color } = await seed.evaluate((node) => {
            const cs = getComputedStyle(node)
            return { opacity: cs.opacity, color: cs.color }
        })

        expect(opacity).toBe('1')
        // --origam-color__text---secondary (neutral.600) = #525252 = rgb(82, 82, 82)
        expect(color).toBe('rgb(82, 82, 82)')
    })

    test('loser row renders its name at opacity 1 (no compounding on top of the chosen intent color)', async ({ page }) => {
        const frame = await openVariant(page, 'Default')

        await page.getByText('Is Loser').click()
        await page.waitForTimeout(300)

        const name = frame.locator('.origam-bracket-competitor__name').first()
        const opacity = await name.evaluate((node) => getComputedStyle(node).opacity)

        expect(opacity).toBe('1')
    })
})
