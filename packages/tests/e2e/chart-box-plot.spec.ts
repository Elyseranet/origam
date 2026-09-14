import { expect, test, type Page } from '@playwright/test'

import { eventLogItems, fillHstNumber, openEventsTab, toggleHstCheckbox } from './_support/histoire-controls'

/**
 * OrigamChartBoxPlot — Playwright spec.
 *
 * Asserts:
 *  - N box groups render for N categories (pre-aggregated fixture has 5).
 *  - Each box group contains a rect, a median line, upper/lower whiskers and caps.
 *  - showOutliers=false removes outlier circles.
 *  - boxWidth prop visually changes the rect width (0.3 < 0.9).
 *  - ARIA attributes (role="figure", role="img", title, desc) are present.
 *  - Each box group has role="button" and a non-empty aria-label.
 *  - Each box group is keyboard-focusable (tabindex=0).
 *  - Empty slot renders when series is empty.
 *  - Clicking a box fires into the emit log.
 *
 * The story restructuring (canonical Design/State/Functional/Events/Slots
 * layout, see root CLAUDE.md) removed every per-fixture root data-cy this
 * spec targeted (box-plot-playground-chart, box-plot-raw-samples-chart,
 * box-plot-slim/wide, box-plot-outliers-on/off, box-plot-slot-empty-chart,
 * box-plot-emit-chart/-log) — `OrigamChartBoxPlot.vue` itself sets a
 * static `data-cy="origam-chart-box-plot"` on its own root instead (no
 * story override present in any Variant used below). "boxWidth" and
 * "showOutliers" used to be static side-by-side comparisons; they're now
 * single dynamic controls, driven sequentially instead. The old
 * `box-plot-emit-log` DOM shell is gone — emits are read back from
 * Histoire's own "Events" tab (`openEventsTab` / `eventLogItems`).
 */

const BOX_PLOT_STORY = '/stories/story/components-stories-chart-origamchartboxplot-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, title: string) => {
    await page.goto(BOX_PLOT_STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(500)
}

test.describe('OrigamChartBoxPlot — Default (pre-aggregated)', () => {
    test('renders figure root with role="figure"', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="origam-chart-box-plot"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveRole('figure') // #426 — root is a native <figure>, role is implicit, no explicit attribute any more
    })

    test('SVG carries role=img, title and desc', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator('[data-cy="origam-chart-box-plot"] svg').first()
        await expect(svg).toBeVisible()
        await expect(svg).toHaveAttribute('role', 'img')
        await expect(svg.locator('title')).toHaveCount(1)
        await expect(svg.locator('desc')).toHaveCount(1)
    })

    test('renders exactly 5 box groups for 5 API categories', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-box-plot-default.png', fullPage: false })

        const boxes = sandbox.locator('[data-cy="origam-chart-box-plot"] [data-cy^="origam-chart-box-group-"]')
        await expect(boxes).toHaveCount(5, { timeout: 6000 })
    })

    test('each box group has a rect element', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        for (let i = 0; i < 5; i++) {
            const rect = sandbox.locator(`[data-cy="origam-chart-box-rect-${ i }"]`)
            await expect(rect).toBeVisible({ timeout: 6000 })
        }
    })

    test('each box group has a median line', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        // SVG <line> elements have zero-area bounding boxes (height=0 for horizontal lines),
        // so toBeVisible() times out. Use toBeAttached() + attribute check instead.
        for (let i = 0; i < 5; i++) {
            const median = sandbox.locator(`[data-cy="origam-chart-box-median-${ i }"]`)
            await expect(median).toBeAttached({ timeout: 6000 })
            await expect(median).toHaveAttribute('x1')
        }
    })

    test('each box group has upper and lower whiskers', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        // SVG <line> elements (vertical whiskers) have zero-width bounding boxes.
        // Use toBeAttached() + coordinate attribute check instead of toBeVisible().
        for (let i = 0; i < 5; i++) {
            const upper = sandbox.locator(`[data-cy="origam-chart-box-whisker-upper-${ i }"]`)
            const lower = sandbox.locator(`[data-cy="origam-chart-box-whisker-lower-${ i }"]`)
            await expect(upper).toBeAttached({ timeout: 6000 })
            await expect(upper).toHaveAttribute('y1')
            await expect(lower).toBeAttached({ timeout: 6000 })
            await expect(lower).toHaveAttribute('y1')
        }
    })
})

test.describe('OrigamChartBoxPlot — raw samples', () => {
    test('renders exactly 3 boxes for Mon/Wed/Fri fixture', async () => {
        // STORY GAP found while repairing this spec: the migrated story
        // has NO raw-samples fixture anywhere — FIXTURE_API_SERIES (used
        // by every remaining Variant) is exclusively pre-aggregated
        // (IChartBoxPlotDatum: min/q1/median/q3/max/outliers). Raw-sample
        // input (IChartBoxPlotRawDatum: `samples: Array<number>`, the
        // component computes the five-number summary itself) is a real,
        // documented, implemented input mode — see
        // chart-box-plot.interface.ts — but it's a hardcoded array baked
        // into the story with no control to switch input shape, and specs
        // must not edit stories. Cannot be worked around from here.
        test.skip(true, 'STORY GAP: OrigamChartBoxPlot.story.vue has no raw-samples (IChartBoxPlotRawDatum) fixture after the canonical-structure migration — only pre-aggregated FIXTURE_API_SERIES remains. Needs a dedicated story fixture, not a spec change.')
    })

    test('each raw-samples box has a rect and median line', async () => {
        test.skip(true, 'STORY GAP: same as above — no raw-samples fixture exists to exercise this assertion against.')
    })
})

test.describe('OrigamChartBoxPlot — boxWidth prop', () => {
    test('slim (0.3) rect is narrower than wide (0.9) rect', async ({ page }) => {
        // Dedicated side-by-side fixture folded into "Design" — a single
        // dynamic "Box Width [0..1]" control (default 0.6, see
        // OrigamChartBoxPlot.story.vue), driven sequentially instead.
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        const rect = sandbox.locator('[data-cy="origam-chart-box-plot"] [data-cy="origam-chart-box-rect-0"]')

        await fillHstNumber(page, 'Box Width [0..1]', 0.3)
        await page.waitForTimeout(400)
        await expect(rect).toBeVisible({ timeout: 6000 })
        const slimWidth = await rect.getAttribute('width')

        await fillHstNumber(page, 'Box Width [0..1]', 0.9)
        await page.waitForTimeout(400)
        const wideWidth = await rect.getAttribute('width')

        expect(Number(slimWidth)).toBeLessThan(Number(wideWidth))
    })
})

test.describe('OrigamChartBoxPlot — showOutliers prop', () => {
    test('showOutliers=true: /users box (index 0) has outlier circles', async ({ page }) => {
        // Dedicated fixture folded into "Functional" — Show Outliers
        // checkbox already defaults to true (see
        // OrigamChartBoxPlot.story.vue), no control interaction needed.
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)

        const outliers = sandbox.locator('[data-cy="origam-chart-box-plot"] [data-cy^="origam-chart-box-outlier-0-"]')
        await expect(outliers).toHaveCount(2, { timeout: 6000 })
    })

    test('showOutliers=false: no outlier circles anywhere', async ({ page }) => {
        // Dedicated fixture folded into "Functional" — Show Outliers
        // defaults to true, flip it off.
        await openVariant(page, 'Functional')
        await toggleHstCheckbox(page, 'Show Outliers')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)

        const outliers = sandbox.locator('[data-cy="origam-chart-box-plot"] [data-cy^="origam-chart-box-outlier-"]')
        await expect(outliers).toHaveCount(0, { timeout: 6000 })
    })
})

test.describe('OrigamChartBoxPlot — accessibility', () => {
    test('each box group has role="button" and a non-empty aria-label', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const boxes = sandbox.locator('[data-cy="origam-chart-box-plot"] [data-cy^="origam-chart-box-group-"]')
        // Use Playwright's auto-retrying toHaveCount instead of synchronous boxes.count()
        // to guarantee the DOM is settled before we iterate.
        await expect(boxes).toHaveCount(5, { timeout: 6000 })

        for (let i = 0; i < 5; i++) {
            await expect(boxes.nth(i)).toHaveAttribute('role', 'button')
            const label = await boxes.nth(i).getAttribute('aria-label')
            expect(label).toBeTruthy()
        }
    })

    test('each box group is keyboard-focusable (tabindex=0)', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const boxes = sandbox.locator('[data-cy="origam-chart-box-plot"] [data-cy^="origam-chart-box-group-"]')
        const count = await boxes.count()

        for (let i = 0; i < count; i++) {
            await expect(boxes.nth(i)).toHaveAttribute('tabindex', '0')
        }
    })
})

test.describe('OrigamChartBoxPlot — empty state', () => {
    test('empty slot renders when series is empty', async ({ page }) => {
        // Canonical Variant is "Slots - Empty" — no story-level root
        // data-cy, anchored via the component's own static root.
        await openVariant(page, 'Slots - Empty')
        const sandbox = sandboxOf(page)
        const empty = sandbox.locator('[data-cy="origam-chart-box-plot"] [data-cy="origam-chart-box-plot-empty"]')
        await expect(empty).toBeVisible({ timeout: 6000 })
        await expect(empty).toContainText('No distribution data available')
    })
})

test.describe('OrigamChartBoxPlot — emit', () => {
    test('clicking a box appends to the emit log', async ({ page }) => {
        // Canonical Variant is "Events - point-click". The old
        // `box-plot-emit-log` DOM shell is gone — read back from
        // Histoire's own "Events" tab instead.
        await openVariant(page, 'Events - point-click')
        const sandbox = sandboxOf(page)

        const firstBox = sandbox.locator('[data-cy="origam-chart-box-plot"] [data-cy="origam-chart-box-group-0"]')
        // SVG <g> elements may have zero-area bounding boxes in Playwright's visibility model
        // when children are zero-height lines; use toBeAttached() then force-click the rect child.
        await expect(firstBox).toBeAttached({ timeout: 6000 })
        const boxRect = sandbox.locator('[data-cy="origam-chart-box-plot"] [data-cy="origam-chart-box-rect-0"]')
        await expect(boxRect).toBeVisible({ timeout: 6000 })
        await boxRect.click()
        await page.waitForTimeout(300)

        await openEventsTab(page)
        await expect(eventLogItems(page).first()).toContainText('point-click', { timeout: 4000 })
    })
})
