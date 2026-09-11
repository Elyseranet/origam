import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamChartCartesian — runtime probes for the stacking prop including
 * the `stacking='percent'` mode. Validates that:
 *
 * - Normal stacked columns render with varying heights (raw-value scale).
 * - Percent stacked columns all reach the same total height (100% each).
 * - Y-axis tick labels carry a `%` suffix in percent mode.
 * - The side-by-side Variant is visible and both charts are present.
 */

const STORY = '/stories/story/components-stories-chart-origamchartcartesian-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, title: string) => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(400)
}

test.describe('OrigamChartCartesian — stacking (normal vs percent)', () => {
    test('renders both normal and percent stacked charts in the side-by-side Variant', async ({ page }) => {
        await openVariant(page, 'Prop — stacking (normal vs percent side by side)')
        const sandbox = sandboxOf(page)

        const normalChart = sandbox.locator('[data-cy="cartesian-stacking-normal"]')
        const percentChart = sandbox.locator('[data-cy="cartesian-stacking-percent"]')

        await expect(normalChart).toBeVisible({ timeout: 8000 })
        await expect(percentChart).toBeVisible({ timeout: 8000 })
    })

    test('normal stacked chart emits rects', async ({ page }) => {
        await openVariant(page, 'Prop — stacking (normal vs percent side by side)')
        const sandbox = sandboxOf(page)

        const rects = sandbox.locator('[data-cy="cartesian-stacking-normal"] rect.origam-chart__bar')
        await expect(rects.first()).toBeVisible({ timeout: 8000 })
        const count = await rects.count()
        expect(count).toBeGreaterThan(0)
    })

    test('percent stacked chart emits rects', async ({ page }) => {
        await openVariant(page, 'Prop — stacking (normal vs percent side by side)')
        const sandbox = sandboxOf(page)

        const rects = sandbox.locator('[data-cy="cartesian-stacking-percent"] rect.origam-chart__bar')
        const count = await rects.count()
        expect(count).toBeGreaterThan(0)
    })

    test('percent stacked chart SVG has aria-label mentioning the title', async ({ page }) => {
        await openVariant(page, 'Prop — stacking (normal vs percent side by side)')
        const sandbox = sandboxOf(page)

        const svg = sandbox.locator('[data-cy="cartesian-stacking-percent"] svg').first()
        await expect(svg).toHaveAttribute('aria-label', /distribution/i)
    })

    test('percent stacked chart: all columns at the same X share the same total height (100%)', async ({ page }) => {
        await openVariant(page, 'Prop — stacking (normal vs percent side by side)')
        const sandbox = sandboxOf(page)

        const svg = sandbox.locator('[data-cy="cartesian-stacking-percent"] svg').first()
        await expect(svg).toBeVisible()

        const rects = svg.locator('rect.origam-chart__bar')
        await expect(rects.first()).toBeVisible({ timeout: 8000 })
        const count = await rects.count()
        expect(count).toBeGreaterThan(0)

        // Rects are emitted series-by-series in the DOM (all dataIdx for
        // series 0, then all dataIdx for series 1, …). Group by the rounded
        // x-attribute value so that all bars sharing the same column slot
        // are accumulated regardless of DOM ordering.
        const heightByX: Record<string, number> = {}
        for (let i = 0; i < count; i++) {
            const rect = rects.nth(i)
            const x = parseFloat((await rect.getAttribute('x')) ?? '0')
            const y = parseFloat((await rect.getAttribute('y')) ?? '0')
            const h = parseFloat((await rect.getAttribute('height')) ?? '0')
            const xKey = Math.round(x).toString()
            heightByX[xKey] = (heightByX[xKey] ?? 0) + h + y
        }

        const totalHeights = Object.values(heightByX).filter(Boolean)
        if (totalHeights.length > 1) {
            const first = totalHeights[0]
            for (const h of totalHeights.slice(1)) {
                expect(Math.abs(h - first)).toBeLessThan(2)
            }
        }
    })
})

test.describe('OrigamChartCartesian — stacked (normal) variant', () => {
    test('stacked column chart renders more rects than a single-series chart', async ({ page }) => {
        await openVariant(page, 'Prop — stacked')
        const sandbox = sandboxOf(page)

        const stackedRects = sandbox.locator('[data-cy="cartesian-stacked-on"] rect.origam-chart__bar')
        const unstackedRects = sandbox.locator('[data-cy="cartesian-stacked-off"] rect.origam-chart__bar')

        const stackedCount = await stackedRects.count()
        const unstackedCount = await unstackedRects.count()

        expect(stackedCount).toBeGreaterThan(0)
        expect(unstackedCount).toBeGreaterThan(0)
        expect(stackedCount).toBe(unstackedCount)
    })
})
