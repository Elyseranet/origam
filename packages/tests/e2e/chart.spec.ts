import { expect, test, type Page } from '@playwright/test'

import { eventLogItems, openEventsTab, selectHstOption } from './_support/histoire-controls'

/**
 * OrigamChart — runtime probes for the chart type matrix, the
 * legend toggle pipeline, the click → point-click emit, and the
 * ARIA pattern (role="img" + title + desc). The chart paints a SVG
 * tree so we lean heavily on locator counts (`<path>` / `<rect>` /
 * `<circle>`) rather than CSS-class assertions.
 *
 * Story realignment (canonical Design/Functional/Events/Slots structure):
 * the old "Prop — type (29 primitives)" Variant rendered EACH type with
 * its own bespoke fixture (5-slice pie, 11-point scatter cohorts, etc.).
 * The canonical "Design" Variant instead drives `type` via a single
 * HstSelect over ONE shared fixture (FIXTURE_SALES_SERIES × FIXTURE_MONTHS
 * — 2 series, 12 categories) for every type. Counts that depended on the
 * old per-type fixtures (pie/donut slice count, scatter point count) were
 * re-derived empirically against the new shared fixture rather than
 * assumed — see inline comments on each test.
 *
 * The old single "Emit — point-click / legend-click / series-toggle"
 * Variant is now four Variants: three single-listener "Events - {name}"
 * fixtures, plus "Default" which still wires all three handlers together
 * — used here wherever a test needs more than one event logged from the
 * same click.
 */

const STORY = '/stories/story/components-stories-chart-origamchart-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, title: string) => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(400)
}

test.describe('OrigamChart — Default (root + ARIA)', () => {
    test('renders the figure root with the expected aria-label', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy~="origam-chart--line"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'figure')
        await expect(host).toHaveAttribute('aria-label', /sales/i)
    })

    test('SVG carries role=img + title + desc for screen readers', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator('[data-cy~="origam-chart--line"] svg').first()
        await expect(svg).toBeVisible()
        await expect(svg).toHaveAttribute('role', 'img')
        const title = svg.locator('title')
        const desc = svg.locator('desc')
        await expect(title).toHaveCount(1)
        await expect(desc).toHaveCount(1)
    })
})

test.describe('OrigamChart — type matrix', () => {
    // All tests share the "Design" Variant's single FIXTURE_SALES_SERIES ×
    // FIXTURE_MONTHS fixture (2 series, 12 categories), driven via the Type
    // control — not the type-specific fixtures the old side-by-side grid used.
    test('line chart renders one path per series', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Type', 'line')
        const paths = sandbox.locator('[data-cy~="origam-chart--line"] path[data-cy="origam-chart-path"]')
        // 2 series → 2 line paths
        const count = await paths.count()
        expect(count).toBeGreaterThanOrEqual(2)
    })

    test('area chart renders area + line paths', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Type', 'area')
        const paths = sandbox.locator('[data-cy~="origam-chart--area"] path[data-cy="origam-chart-path"]')
        // 2 series × (area + line) = 4 paths.
        const count = await paths.count()
        expect(count).toBeGreaterThanOrEqual(4)
    })

    test('column chart renders one <rect> per data point', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Type', 'column')
        const rects = sandbox.locator('[data-cy~="origam-chart--column"] rect.origam-chart__bar')
        // 12 months × 2 series = 24 bars.
        await expect(rects).toHaveCount(24)
    })

    test('pie chart renders one slice per category with arc commands', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Type', 'pie')
        const slices = sandbox.locator('[data-cy~="origam-chart--pie"] path.origam-chart__slice')
        // Verified empirically: pie renders one slice per (series × category) —
        // FIXTURE_SALES_SERIES has 2 series × 12 months (FIXTURE_MONTHS) = 24 slices,
        // not the old dedicated 5-category fixture's count.
        await expect(slices).toHaveCount(24)
        const d = await slices.first().getAttribute('d')
        expect(d).toContain('A')
    })

    test('donut chart slices contain two arc commands', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Type', 'donut')
        const slice = sandbox.locator('[data-cy~="origam-chart--donut"] path.origam-chart__slice').first()
        await expect(slice).toBeVisible()
        const d = await slice.getAttribute('d')
        const arcCount = (d?.match(/A/g) ?? []).length
        expect(arcCount).toBe(2)
    })

    test('scatter chart renders one <circle> per data point', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Type', 'scatter')
        const circles = sandbox.locator('[data-cy~="origam-chart--scatter"] circle.origam-chart__point')
        // FIXTURE_SALES_SERIES: 2 series × 12 months = 24 points (not the old
        // dedicated 11-point cohort A/B fixture).
        await expect(circles).toHaveCount(24)
    })

    test('radar chart renders a polygon plus rings + spokes', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Type', 'radar')
        const polygons = sandbox.locator('[data-cy~="origam-chart--radar"] polygon.origam-chart__polygon')
        // 2 series → 2 polygons.
        await expect(polygons).toHaveCount(2)
        const rings = sandbox.locator('[data-cy~="origam-chart--radar"] polygon.origam-chart__radar-ring')
        // 4 concentric rings (fixed chart configuration, independent of fixture).
        await expect(rings).toHaveCount(4)
    })
})

test.describe('OrigamChart — legend interaction', () => {
    // Not a title-drift fix: OrigamChartLegend.vue renders a native `<ul>`
    // with NO explicit `role="list"` attribute (verified in
    // packages/ds/src/components/Chart/OrigamChartLegend.vue) — correct per
    // this repo's HTML-semantic-first policy ("No ARIA is better than bad
    // ARIA": a native `<ul>` already carries the implicit list role, an
    // explicit attribute would be redundant). The original assertion tested
    // for a literal `role="list"` attribute that has never existed on this
    // element; adjusted to check the actual tag name instead.
    test('renders a native <ul> with one entry per series', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        // Single instance on the page for this Variant — no wrapper scoping needed.
        const legend = sandbox.locator('[data-cy="origam-chart-legend"]')
        await expect(legend).toBeVisible({ timeout: 8000 })
        const tagName = await legend.evaluate((el) => el.tagName.toLowerCase())
        expect(tagName).toBe('ul')
        // Each <li> carries role="button" (interactive toggle), not role="listitem".
        const items = legend.locator('[role="button"]')
        await expect(items).toHaveCount(2)
    })

    // Story realignment: the old single "Emit — point-click / legend-click /
    // series-toggle" Variant wired all three handlers on one instance. The
    // canonical structure splits that into three single-listener
    // "Events - {name}" Variants — none of which alone can show BOTH
    // legend-click and series-toggle firing from one click. "Default" still
    // wires all three handlers together, so it's the only Variant that can
    // exercise this combined assertion.
    test('clicking a legend item logs legend-click + series-toggle', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const firstLegend = sandbox.locator('[data-cy="origam-chart-legend-0"]')
        await firstLegend.click()

        await openEventsTab(page)
        const log = eventLogItems(page)
        await expect(log.filter({ hasText: 'legend-click' })).not.toHaveCount(0, { timeout: 4000 })
        await expect(log.filter({ hasText: 'series-toggle' })).not.toHaveCount(0, { timeout: 4000 })
    })
})

test.describe('OrigamChart — point-click emit', () => {
    test('clicking a column emits point-click', async ({ page }) => {
        await openVariant(page, 'Events - point-click')
        const sandbox = sandboxOf(page)
        const firstBar = sandbox.locator('rect.origam-chart__bar').first()
        await firstBar.click({ force: true })

        await openEventsTab(page)
        await expect(eventLogItems(page).first()).toContainText('point-click', { timeout: 4000 })
    })
})

test.describe('OrigamChart — empty state slot', () => {
    test('renders the #empty slot when series is empty', async ({ page }) => {
        await openVariant(page, 'Slots - Empty')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('.custom-empty')
        await expect(host).toBeVisible()
        await expect(host).toContainText(/no data yet/i)
    })
})
