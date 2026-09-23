import { expect, test, type Page } from '@playwright/test'

import { fillHstText } from './_support/histoire-controls'

/**
 * OrigamChartMap — `defaultCountryFill` theme reachability (#411).
 *
 * Same defect and same fix as `borderColor` (see
 * `chart-map-border-color-theme.spec.ts`), one line above it in the same
 * `allCountries` computed: `defaultCountryFill` was applied to `fill`
 * verbatim, no `resolveColor()` pass. A `TIntent` name is invalid CSS for
 * `fill`, so the browser drops the declaration and every dataless country
 * disappears instead of repainting under the new colour.
 *
 * The default stays the literal `'rgba(0,0,0,0.08)'` on purpose — it is a
 * semi-transparent scrim composited over the chart's own `bgColor`, which no
 * fixed intent token reproduces (see the interface JSDoc). This spec proves
 * the INTENT PATH now works, not that the default changed — it hasn't.
 */

const MAP_STORY = '/stories/story/components-stories-chart-origamchartmap-story-vue'

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

test.describe('OrigamChartMap — defaultCountryFill repaints under a themed intent (#411)', () => {
    test('fill colour changes when defaultCountryFill switches between two intents, and each resolves to its own token', async ({ page }) => {
        await page.goto(MAP_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Design', { exact: true }).first().click()
        await page.waitForTimeout(500)

        const sandbox = sandboxOf(page)
        // FIXTURE_GDP does not cover every country, so a dataless one is
        // reachable — pick the last rendered path (WORLD_MAP_PATHS order is
        // stable and the GDP fixture only names a couple dozen of them).
        const country = sandbox.locator('[data-cy^="origam-chart-map-country-"]').last()
        await expect(country).toBeVisible({ timeout: 10000 })

        const defaultFill = await country.evaluate((el) => getComputedStyle(el).fill)
        expect(defaultFill).not.toBe('') // a real paint, not an invalid/dropped declaration
        expect(defaultFill).not.toBe('none')

        await fillHstText(page, 'No-Data Fill', 'danger')
        await page.waitForTimeout(300)

        const dangerFill = await country.evaluate((el) => getComputedStyle(el).fill)
        const dangerExpected = await page.evaluate(() => {
            const probe = document.createElement('div')
            document.body.appendChild(probe)
            probe.style.color = 'var(--origam-color__feedback--danger---bg)'
            const value = getComputedStyle(probe).color
            probe.remove()
            return value
        })

        expect(dangerFill).not.toBe('') // still a real paint under the new intent — the prior bug rendered NO fill at all
        expect(dangerFill).not.toBe(defaultFill) // the theme-shaped value actually repaints
        expect(dangerFill).toBe(dangerExpected)
    })

    test('an explicit custom CSS colour still overrides the theme/default path unchanged', async ({ page }) => {
        await page.goto(MAP_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Design', { exact: true }).first().click()
        await page.waitForTimeout(500)

        const sandbox = sandboxOf(page)
        const country = sandbox.locator('[data-cy^="origam-chart-map-country-"]').last()
        await expect(country).toBeVisible({ timeout: 10000 })

        await fillHstText(page, 'No-Data Fill', 'rgb(40, 50, 60)')
        await page.waitForTimeout(300)

        const fill = await country.evaluate((el) => getComputedStyle(el).fill)
        expect(fill).toBe('rgb(40, 50, 60)')
    })
})
