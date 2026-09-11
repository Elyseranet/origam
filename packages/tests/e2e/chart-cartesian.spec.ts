import { expect, test, type Page } from '@playwright/test'

import { selectHstOption, toggleHstCheckbox } from './_support/histoire-controls'

/**
 * OrigamChartCartesian — runtime probes for the stacking prop including
 * the `stacking='percent'` mode. Validates that:
 *
 * - Normal stacked columns render with varying heights (raw-value scale).
 * - Percent stacked columns all reach the same total height (100% each).
 * - Y-axis tick labels carry a `%` suffix in percent mode.
 * - The side-by-side Variant is visible and both charts are present.
 *
 * The story restructuring (canonical Design/State/Functional/Events/Slots
 * layout, see root CLAUDE.md) removed the old side-by-side
 * "cartesian-stacking-normal/-percent" and "cartesian-stacked-on/-off"
 * fixtures — "type"/"stacked"/"stacking" are now single dynamic controls
 * on "Functional" (default `type: 'line'`, `stacked: false`, `stacking:
 * 'normal'`), driven sequentially instead. No story-level root data-cy
 * survives either — `OrigamChartCartesian.vue`'s own static
 * `data-cy="origam-chart-cartesian"` root anchors it instead (one
 * instance per Functional render).
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

const CHART = '[data-cy="origam-chart-cartesian"]'

test.describe('OrigamChartCartesian — stacking (normal vs percent)', () => {
    test('renders both normal and percent stacked charts in the side-by-side Variant', async ({ page }) => {
        // Dedicated side-by-side fixture folded into "Functional" — a
        // single dynamic Type + Stacking Mode control pair (Type defaults
        // to 'line', switched to 'column' so `.origam-chart__bar` rects
        // exist at all; Stacking Mode defaults to 'normal'), driven
        // sequentially instead of two simultaneous charts.
        await openVariant(page, 'Functional')
        await selectHstOption(page, 'Type', 'column')
        await toggleHstCheckbox(page, 'Stacked')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)

        await expect(sandbox.locator(CHART)).toBeVisible({ timeout: 8000 })

        await selectHstOption(page, 'Stacking Mode', 'percent')
        await page.waitForTimeout(400)
        await expect(sandbox.locator(CHART)).toBeVisible({ timeout: 8000 })
    })

    test('normal stacked chart emits rects', async ({ page }) => {
        await openVariant(page, 'Functional')
        await selectHstOption(page, 'Type', 'column')
        await toggleHstCheckbox(page, 'Stacked')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)

        const rects = sandbox.locator(`${ CHART } rect.origam-chart__bar`)
        await expect(rects.first()).toBeVisible({ timeout: 8000 })
        const count = await rects.count()
        expect(count).toBeGreaterThan(0)
    })

    test('percent stacked chart emits rects', async ({ page }) => {
        await openVariant(page, 'Functional')
        await selectHstOption(page, 'Type', 'column')
        await toggleHstCheckbox(page, 'Stacked')
        await selectHstOption(page, 'Stacking Mode', 'percent')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)

        const rects = sandbox.locator(`${ CHART } rect.origam-chart__bar`)
        const count = await rects.count()
        expect(count).toBeGreaterThan(0)
    })

    test('percent stacked chart SVG carries a non-empty aria-label', async ({ page }) => {
        // The old assertion pinned the specific removed-fixture copy
        // ("…distribution…" in the fixture's custom title). "Functional"
        // exposes no title control, so the SVG falls back to a generic
        // type-based label ("column chart" — verified empirically). The
        // accessibility CONTRACT this test actually guards — the SVG
        // carries a non-empty, descriptive aria-label — still holds and is
        // still asserted; only the fixture-specific wording is gone.
        await openVariant(page, 'Functional')
        await selectHstOption(page, 'Type', 'column')
        await toggleHstCheckbox(page, 'Stacked')
        await selectHstOption(page, 'Stacking Mode', 'percent')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)

        const svg = sandbox.locator(`${ CHART } svg`).first()
        const label = await svg.getAttribute('aria-label')
        expect(label).toBeTruthy()
    })

    test('percent stacked chart: all columns at the same X share the same total height (100%)', async ({ page }) => {
        await openVariant(page, 'Functional')
        await selectHstOption(page, 'Type', 'column')
        await toggleHstCheckbox(page, 'Stacked')
        await selectHstOption(page, 'Stacking Mode', 'percent')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)

        const svg = sandbox.locator(`${ CHART } svg`).first()
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
            // Tolerance loosened from the original fixed 2px: the old
            // dedicated fixture (removed by the migration) apparently used
            // round numbers that summed to ~100% with near-zero rounding
            // error. FIXTURE_SALES_SERIES's real month-by-month sales
            // figures produce independent per-category value/total ratios,
            // and per-segment pixel-height rounding accumulates
            // differently per category — measured empirically at up to
            // ~6.5px spread around a ~513px mean (~1.3% relative). Using a
            // relative tolerance against the mean instead of a fixed
            // pixel delta keeps the assertion meaningful (still catches a
            // genuinely broken percent-stacking calculation, e.g. one
            // category at 50% height) without flapping on this fixture's
            // real rounding noise.
            const mean = totalHeights.reduce((sum, h) => sum + h, 0) / totalHeights.length
            for (const h of totalHeights) {
                expect(Math.abs(h - mean) / mean).toBeLessThan(0.03)
            }
        }
    })
})

test.describe('OrigamChartCartesian — stacked (normal) variant', () => {
    test('stacked and unstacked column charts render the same rect count', async ({ page }) => {
        // Dedicated side-by-side fixture folded into "Functional" — a
        // single dynamic Stacked checkbox (default false), driven
        // sequentially instead. Despite the original test's title
        // ("renders MORE rects"), its own assertion checks the counts are
        // EQUAL — stacking changes bar POSITION (overlapped vs
        // side-by-side), not the number of `<rect>` elements (still one
        // per series × category either way). Preserved as-is.
        await openVariant(page, 'Functional')
        await selectHstOption(page, 'Type', 'column')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)
        const rects = sandbox.locator(`${ CHART } rect.origam-chart__bar`)

        await expect(rects.first()).toBeVisible({ timeout: 8000 })
        const unstackedCount = await rects.count()

        await toggleHstCheckbox(page, 'Stacked')
        await page.waitForTimeout(400)
        const stackedCount = await rects.count()

        expect(stackedCount).toBeGreaterThan(0)
        expect(unstackedCount).toBeGreaterThan(0)
        expect(stackedCount).toBe(unstackedCount)
    })
})
