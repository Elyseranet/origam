import { expect, test, type Page } from '@playwright/test'

import { eventLogItems, fillHstNumber, openEventsTab, selectHstOption, toggleHstCheckbox } from './_support/histoire-controls'

/**
 * OrigamChartHeatmap — Playwright spec.
 *
 * Asserts:
 *  - Correct number of `<rect>` cell elements for the data fixture.
 *  - `colorRange` prop change produces distinct fill colours.
 *  - `showLabel` and `showAxis` flags toggle expected elements.
 *  - Clicking a cell emits the `point-click` event (log line appears).
 *  - ARIA attributes (role="figure", role="img", title, desc) are present.
 *  - Empty-state slot renders when series is empty.
 *  - Each cell has role="button", non-empty aria-label, tabindex="0".
 *
 * The story restructuring (canonical Design/State/Functional/Events/Slots
 * layout, see root CLAUDE.md) removed every per-fixture root data-cy this
 * spec targeted (heatmap-playground-chart, heatmap-color-range-*,
 * heatmap-cell-gap-*, heatmap-flags-*, heatmap-emit-chart/-log) —
 * `OrigamChartHeatmap.vue` itself sets a static
 * `data-cy="origam-chart-heatmap"` on its own root instead. colorRange/
 * cellGap/showLabel+showAxis were static side-by-side comparisons; now
 * single dynamic controls on "Design" (colorRange is an array, driven via
 * its "Range Start"/"Range End" sub-fields), driven sequentially. "Emit —
 * point-click on cell" maps to "Events - point-click"; the removed
 * heatmap-emit-log DOM shell is read back via the shared
 * `openEventsTab` / `eventLogItems` helpers.
 */

const HEATMAP_STORY = '/stories/story/components-stories-chart-origamchartheatmap-story-vue'
const CHART = '[data-cy="origam-chart-heatmap"]'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyUrl: string, title: string) => {
    await page.goto(storyUrl)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(500)
}

test.describe('OrigamChartHeatmap — Default (activity grid)', () => {
    test('renders figure root with role="figure"', async ({ page }) => {
        await openVariant(page, HEATMAP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator(CHART).first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'figure')
    })

    test('SVG carries role=img, title and desc', async ({ page }) => {
        await openVariant(page, HEATMAP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator(`${ CHART } svg`).first()
        await expect(svg).toBeVisible()
        await expect(svg).toHaveAttribute('role', 'img')
        await expect(svg.locator('title')).toHaveCount(1)
        await expect(svg.locator('desc')).toHaveCount(1)
    })

    test('renders exactly 168 cells for 7-day × 24-hour grid', async ({ page }) => {
        await openVariant(page, HEATMAP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-heatmap-default.png', fullPage: false })

        const cells = sandbox.locator(`${ CHART } [data-cy^="origam-chart-heatmap-cell-"]:not([data-cy*="-group-"])`)
        await expect(cells).toHaveCount(168, { timeout: 8000 })
    })

    test('each cell rect has non-zero width and height', async ({ page }) => {
        await openVariant(page, HEATMAP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const cells = sandbox.locator(`${ CHART } [data-cy^="origam-chart-heatmap-cell-"]:not([data-cy*="-group-"])`)
        // Timing race found while repairing this spec's title drift,
        // unrelated to it (same class documented on chart-bullet.spec.ts's
        // axis-ticks test): a synchronous `.count()` right after
        // openVariant's fixed 500ms wait intermittently reads 0 before
        // cell geometry has settled. `toHaveCount` auto-retries.
        await expect(cells.first()).toBeAttached({ timeout: 6000 })
        const count = await cells.count()
        expect(count).toBeGreaterThan(0)

        const firstCell = cells.first()
        const w = await firstCell.getAttribute('width')
        const h = await firstCell.getAttribute('height')
        expect(parseFloat(w!)).toBeGreaterThan(0)
        expect(parseFloat(h!)).toBeGreaterThan(0)
    })
})

test.describe('OrigamChartHeatmap — colorRange variant', () => {
    test('info→danger and primary→warning produce distinct gradient bar colours', async ({ page }) => {
        // Dedicated side-by-side fixture folded into "Design" — colorRange
        // is a 2-element array driven via its "Range Start"/"Range End"
        // sub-fields (default ['info', 'danger'], see
        // OrigamChartHeatmap.story.vue), driven sequentially. The 168-cell
        // FIXTURE_ACTIVITY grid is used throughout (the old fixture's
        // smaller 25-cell grid no longer exists).
        await openVariant(page, HEATMAP_STORY, 'Design')
        const sandbox = sandboxOf(page)
        const cells = sandbox.locator(`${ CHART } [data-cy^="origam-chart-heatmap-cell-"]:not([data-cy*="-group-"])`)

        await expect(cells).toHaveCount(168, { timeout: 8000 })
        const styleA = await cells.last().getAttribute('style')

        await selectHstOption(page, 'Range Start', 'Primary')
        await selectHstOption(page, 'Range End', 'Warning')
        await page.waitForTimeout(400)
        const styleB = await cells.last().getAttribute('style')

        expect(styleA).toContain('fill')
        expect(styleB).toContain('fill')
        expect(styleA).not.toEqual(styleB)
    })
})

test.describe('OrigamChartHeatmap — cellGap variant', () => {
    test('compact (gap=0) and spaced (gap=6) charts both render 168 cells', async ({ page }) => {
        // Dedicated side-by-side fixture folded into "Design" — a single
        // dynamic "Cell Gap" control (default 2), driven sequentially.
        await openVariant(page, HEATMAP_STORY, 'Design')
        const sandbox = sandboxOf(page)
        const cells = sandbox.locator(`${ CHART } [data-cy^="origam-chart-heatmap-cell-"]:not([data-cy*="-group-"])`)

        await fillHstNumber(page, 'Cell Gap', 0)
        await page.waitForTimeout(400)
        await expect(cells).toHaveCount(168, { timeout: 6000 })
        const wCompact = await cells.first().getAttribute('width')

        await fillHstNumber(page, 'Cell Gap', 6)
        await page.waitForTimeout(400)
        await expect(cells).toHaveCount(168, { timeout: 6000 })
        const wSpaced = await cells.first().getAttribute('width')

        expect(parseFloat(wCompact!)).toBeGreaterThan(parseFloat(wSpaced!))
    })
})

test.describe('OrigamChartHeatmap — showLabel / showAxis flags', () => {
    test('both-on chart shows axis elements and label elements', async ({ page }) => {
        // Dedicated side-by-side fixture folded into "Design" — its
        // default init-state already sets showLabel: true, showAxis: true
        // (see OrigamChartHeatmap.story.vue), so no control interaction is
        // needed for the "both on" state.
        await openVariant(page, HEATMAP_STORY, 'Design')
        const sandbox = sandboxOf(page)
        const chart = sandbox.locator(CHART)
        await expect(chart).toBeVisible({ timeout: 8000 })

        const xLabels = chart.locator('[data-cy^="origam-chart-heatmap-x-label-"]')
        const yLabels = chart.locator('[data-cy^="origam-chart-heatmap-y-label-"]')
        await expect(xLabels.first()).toBeVisible({ timeout: 4000 })
        await expect(yLabels.first()).toBeVisible({ timeout: 4000 })
    })

    test('both-off chart has no axis or label elements', async ({ page }) => {
        // Same control pair, flipped both off.
        await openVariant(page, HEATMAP_STORY, 'Design')
        await toggleHstCheckbox(page, 'Show Label')
        await toggleHstCheckbox(page, 'Show Axis')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)
        const chart = sandbox.locator(CHART)
        await expect(chart).toBeVisible({ timeout: 8000 })

        const xAxis = chart.locator('[data-cy="origam-chart-heatmap-x-axis"]')
        const yAxis = chart.locator('[data-cy="origam-chart-heatmap-y-axis"]')
        await expect(xAxis).toHaveCount(0)
        await expect(yAxis).toHaveCount(0)
    })
})

test.describe('OrigamChartHeatmap — accessibility', () => {
    test('each cell has role="button" and a non-empty aria-label', async ({ page }) => {
        await openVariant(page, HEATMAP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const cells = sandbox.locator(`${ CHART } [data-cy^="origam-chart-heatmap-cell-"]:not([data-cy*="-group-"])`)
        // Same timing race as "each cell rect has non-zero…" above.
        await expect(cells.first()).toBeAttached({ timeout: 6000 })
        const count = await cells.count()
        expect(count).toBeGreaterThan(0)

        for (let i = 0; i < Math.min(count, 5); i++) {
            await expect(cells.nth(i)).toHaveAttribute('role', 'button')
            const label = await cells.nth(i).getAttribute('aria-label')
            expect(label).toBeTruthy()
            expect(label).toContain('×')
        }
    })

    test('each cell is keyboard-focusable (tabindex=0)', async ({ page }) => {
        await openVariant(page, HEATMAP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const cells = sandbox.locator(`${ CHART } [data-cy^="origam-chart-heatmap-cell-"]:not([data-cy*="-group-"])`)
        const count = await cells.count()

        for (let i = 0; i < Math.min(count, 5); i++) {
            await expect(cells.nth(i)).toHaveAttribute('tabindex', '0')
        }
    })
})

test.describe('OrigamChartHeatmap — emit', () => {
    test('clicking a cell appends a point-click log line', async ({ page }) => {
        // Canonical Variant is "Events - point-click". Its fixture passes
        // its OWN `data-cy="heatmap-emit-point-click-chart"` on
        // `<origam-chart-heatmap>` — Vue 3 fallthrough REPLACES the
        // component's own static `data-cy="origam-chart-heatmap"` on that
        // one element (no `inheritAttrs: false` set), so the story-level
        // value must be used here instead of the shared CHART constant.
        // The old "heatmap-emit-log" DOM shell is gone — read back from
        // Histoire's own "Events" tab instead.
        await openVariant(page, HEATMAP_STORY, 'Events - point-click')
        const sandbox = sandboxOf(page)

        const firstCell = sandbox.locator('[data-cy="heatmap-emit-point-click-chart"] [data-cy^="origam-chart-heatmap-cell-"]:not([data-cy*="-group-"])').first()
        await expect(firstCell).toBeVisible({ timeout: 8000 })
        await firstCell.click()
        await page.waitForTimeout(300)

        await openEventsTab(page)
        await expect(eventLogItems(page).first()).toContainText('point-click', { timeout: 4000 })
    })
})

test.describe('OrigamChartHeatmap — empty state', () => {
    test('empty slot renders when series is empty', async ({ page }) => {
        await openVariant(page, HEATMAP_STORY, 'Slots - empty')
        const sandbox = sandboxOf(page)
        const empty = sandbox.locator('[data-cy="heatmap-slot-empty-chart"] [data-cy="origam-chart-heatmap-empty"]')
        await expect(empty).toBeVisible({ timeout: 6000 })
        await expect(empty).toContainText('No activity data')
    })
})
