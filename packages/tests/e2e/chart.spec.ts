import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamChart — runtime probes for the eight chart primitives, the
 * legend toggle pipeline, the click → point-click emit, and the
 * ARIA pattern (role="img" + title + desc). The chart paints a SVG
 * tree so we lean heavily on locator counts (`<path>` / `<rect>` /
 * `<circle>`) rather than CSS-class assertions.
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
        const host = sandbox.locator('[data-cy="chart-playground-chart"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'figure')
        await expect(host).toHaveAttribute('aria-label', /sales/i)
    })

    test('SVG carries role=img + title + desc for screen readers', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator('[data-cy="chart-playground-chart"] svg').first()
        await expect(svg).toBeVisible()
        await expect(svg).toHaveAttribute('role', 'img')
        const title = svg.locator('title')
        const desc = svg.locator('desc')
        await expect(title).toHaveCount(1)
        await expect(desc).toHaveCount(1)
    })
})

test.describe('OrigamChart — type matrix', () => {
    test('line chart renders one path per series', async ({ page }) => {
        await openVariant(page, 'Prop — type (29 primitives)')
        const sandbox = sandboxOf(page)
        // OrigamChart computes data-cy="origam-chart origam-chart--<type>" on its cartesian root;
        // the story-level data-cy="chart-type-line" is lost because OrigamChart has multiple roots
        // (v-if/v-else-if) and does not forward $attrs.
        const paths = sandbox.locator('[data-cy="origam-chart origam-chart--line"] path[data-cy="origam-chart-path"]')
        // 2 series → 2 line paths
        const count = await paths.count()
        expect(count).toBeGreaterThanOrEqual(2)
    })

    test('area chart renders area + line paths', async ({ page }) => {
        await openVariant(page, 'Prop — type (29 primitives)')
        const sandbox = sandboxOf(page)
        // Same root data-cy pattern: "origam-chart origam-chart--area"
        const paths = sandbox.locator('[data-cy="origam-chart origam-chart--area"] path[data-cy="origam-chart-path"]')
        // 2 series × (area + line) = 4 paths.
        const count = await paths.count()
        expect(count).toBeGreaterThanOrEqual(4)
    })

    test('column chart renders one <rect> per data point', async ({ page }) => {
        await openVariant(page, 'Prop — type (29 primitives)')
        const sandbox = sandboxOf(page)
        const rects = sandbox.locator('[data-cy="chart-type-column"] rect.origam-chart__bar')
        // 12 months × 2 series = 24 bars.
        await expect(rects).toHaveCount(24)
    })

    test('pie chart renders one slice per category with arc commands', async ({ page }) => {
        await openVariant(page, 'Prop — type (29 primitives)')
        const sandbox = sandboxOf(page)
        const slices = sandbox.locator('[data-cy="chart-type-pie"] path.origam-chart__slice')
        await expect(slices).toHaveCount(5)
        const d = await slices.first().getAttribute('d')
        expect(d).toContain('A')
    })

    test('donut chart slices contain two arc commands', async ({ page }) => {
        await openVariant(page, 'Prop — type (29 primitives)')
        const sandbox = sandboxOf(page)
        const slice = sandbox.locator('[data-cy="chart-type-donut"] path.origam-chart__slice').first()
        await expect(slice).toBeVisible()
        const d = await slice.getAttribute('d')
        const arcCount = (d?.match(/A/g) ?? []).length
        expect(arcCount).toBe(2)
    })

    test('scatter chart renders one <circle> per data point', async ({ page }) => {
        await openVariant(page, 'Prop — type (29 primitives)')
        const sandbox = sandboxOf(page)
        const circles = sandbox.locator('[data-cy="chart-type-scatter"] circle.origam-chart__point')
        // Cohort A (6) + Cohort B (5) = 11 dots.
        await expect(circles).toHaveCount(11)
    })

    test('radar chart renders a polygon plus rings + spokes', async ({ page }) => {
        await openVariant(page, 'Prop — type (29 primitives)')
        const sandbox = sandboxOf(page)
        const polygons = sandbox.locator('[data-cy="chart-type-radar"] polygon.origam-chart__polygon')
        // 2 series → 2 polygons.
        await expect(polygons).toHaveCount(2)
        const rings = sandbox.locator('[data-cy="chart-type-radar"] polygon.origam-chart__radar-ring')
        // 4 concentric rings.
        await expect(rings).toHaveCount(4)
    })
})

test.describe('OrigamChart — legend interaction', () => {
    test('renders a <ul role="list"> with one entry per series', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        // Scope via the story wrapper div (data-cy="chart-playground") rather than the
        // component root (data-cy="chart-playground-chart") which competes with the
        // OrigamChart shell's own :data-cy binding and may not survive attr merging.
        const legend = sandbox.locator('[data-cy="chart-playground"] [data-cy="origam-chart-legend"]')
        await expect(legend).toHaveAttribute('role', 'list')
        // Each <li> carries role="button" (interactive toggle), not role="listitem".
        const items = legend.locator('[role="button"]')
        await expect(items).toHaveCount(2)
    })

    test('clicking a legend item logs legend-click + series-toggle', async ({ page }) => {
        await openVariant(page, 'Emit — point-click / legend-click / series-toggle')
        const sandbox = sandboxOf(page)
        const log = sandbox.locator('[data-cy="chart-emits-log"]')
        const firstLegend = sandbox.locator('[data-cy="chart-emits-chart"] [data-cy="origam-chart-legend-0"]')
        await firstLegend.click()
        await expect(log).toContainText('legend-click')
        await expect(log).toContainText('series-toggle')
    })
})

test.describe('OrigamChart — point-click emit', () => {
    test('clicking a column emits point-click', async ({ page }) => {
        await openVariant(page, 'Emit — point-click / legend-click / series-toggle')
        const sandbox = sandboxOf(page)
        const firstBar = sandbox.locator('[data-cy="chart-emits-chart"] rect.origam-chart__bar').first()
        await firstBar.click({ force: true })
        const log = sandbox.locator('[data-cy="chart-emits-log"]')
        await expect(log).toContainText('point-click')
    })
})

test.describe('OrigamChart — empty state slot', () => {
    test('renders the #empty slot when series is empty', async ({ page }) => {
        await openVariant(page, 'Slot — empty (custom CTA)')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="chart-slot-empty-chart"]')
        await expect(host).toBeVisible()
        await expect(host).toContainText(/no data yet/i)
    })
})
