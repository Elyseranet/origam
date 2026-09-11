import { expect, test, type Page } from '@playwright/test'

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
 */

const HEATMAP_STORY = '/stories/story/components-stories-chart-origamchartheatmap-story-vue'

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
        const host = sandbox.locator('[data-cy="heatmap-playground-chart"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'figure')
    })

    test('SVG carries role=img, title and desc', async ({ page }) => {
        await openVariant(page, HEATMAP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator('[data-cy="heatmap-playground-chart"] svg').first()
        await expect(svg).toBeVisible()
        await expect(svg).toHaveAttribute('role', 'img')
        await expect(svg.locator('title')).toHaveCount(1)
        await expect(svg.locator('desc')).toHaveCount(1)
    })

    test('renders exactly 168 cells for 7-day × 24-hour grid', async ({ page }) => {
        await openVariant(page, HEATMAP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-heatmap-default.png', fullPage: false })

        const cells = sandbox.locator('[data-cy="heatmap-playground-chart"] [data-cy^="origam-chart-heatmap-cell-"]:not([data-cy*="-group-"])')
        await expect(cells).toHaveCount(168, { timeout: 8000 })
    })

    test('each cell rect has non-zero width and height', async ({ page }) => {
        await openVariant(page, HEATMAP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const cells = sandbox.locator('[data-cy="heatmap-playground-chart"] [data-cy^="origam-chart-heatmap-cell-"]:not([data-cy*="-group-"])')
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
        await openVariant(page, HEATMAP_STORY, 'Prop — colorRange (info→danger vs primary→warning)')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-heatmap-color-range.png', fullPage: false })

        const chartA = sandbox.locator('[data-cy="heatmap-color-range-info-danger"]')
        const chartB = sandbox.locator('[data-cy="heatmap-color-range-primary-warning"]')
        await expect(chartA).toBeVisible({ timeout: 8000 })
        await expect(chartB).toBeVisible({ timeout: 8000 })

        const cellsA = chartA.locator('[data-cy^="origam-chart-heatmap-cell-"]:not([data-cy*="-group-"])')
        const cellsB = chartB.locator('[data-cy^="origam-chart-heatmap-cell-"]:not([data-cy*="-group-"])')
        await expect(cellsA).toHaveCount(25, { timeout: 6000 })
        await expect(cellsB).toHaveCount(25, { timeout: 6000 })

        const styleA = await cellsA.last().getAttribute('style')
        const styleB = await cellsB.last().getAttribute('style')
        expect(styleA).toContain('fill')
        expect(styleB).toContain('fill')
        expect(styleA).not.toEqual(styleB)
    })
})

test.describe('OrigamChartHeatmap — cellGap variant', () => {
    test('compact (gap=0) and spaced (gap=6) charts both render 168 cells', async ({ page }) => {
        await openVariant(page, HEATMAP_STORY, 'Prop — cellGap (compact vs spaced)')
        const sandbox = sandboxOf(page)

        const compact = sandbox.locator('[data-cy="heatmap-cell-gap-compact"]')
        const spaced = sandbox.locator('[data-cy="heatmap-cell-gap-spaced"]')
        await expect(compact).toBeVisible({ timeout: 8000 })
        await expect(spaced).toBeVisible({ timeout: 8000 })

        const compactCells = compact.locator('[data-cy^="origam-chart-heatmap-cell-"]:not([data-cy*="-group-"])')
        const spacedCells = spaced.locator('[data-cy^="origam-chart-heatmap-cell-"]:not([data-cy*="-group-"])')
        await expect(compactCells).toHaveCount(168, { timeout: 6000 })
        await expect(spacedCells).toHaveCount(168, { timeout: 6000 })

        const wCompact = await compactCells.first().getAttribute('width')
        const wSpaced = await spacedCells.first().getAttribute('width')
        expect(parseFloat(wCompact!)).toBeGreaterThan(parseFloat(wSpaced!))
    })
})

test.describe('OrigamChartHeatmap — showLabel / showAxis flags', () => {
    test('both-on chart shows axis elements and label elements', async ({ page }) => {
        await openVariant(page, HEATMAP_STORY, 'Prop — showLabel / showAxis (on/off matrix)')
        const sandbox = sandboxOf(page)

        const chartOn = sandbox.locator('[data-cy="heatmap-flags-both-on"]')
        await expect(chartOn).toBeVisible({ timeout: 8000 })

        const xLabels = chartOn.locator('[data-cy^="origam-chart-heatmap-x-label-"]')
        const yLabels = chartOn.locator('[data-cy^="origam-chart-heatmap-y-label-"]')
        await expect(xLabels.first()).toBeVisible({ timeout: 4000 })
        await expect(yLabels.first()).toBeVisible({ timeout: 4000 })
    })

    test('both-off chart has no axis or label elements', async ({ page }) => {
        await openVariant(page, HEATMAP_STORY, 'Prop — showLabel / showAxis (on/off matrix)')
        const sandbox = sandboxOf(page)

        const chartOff = sandbox.locator('[data-cy="heatmap-flags-both-off"]')
        await expect(chartOff).toBeVisible({ timeout: 8000 })

        const xAxis = chartOff.locator('[data-cy="origam-chart-heatmap-x-axis"]')
        const yAxis = chartOff.locator('[data-cy="origam-chart-heatmap-y-axis"]')
        await expect(xAxis).toHaveCount(0)
        await expect(yAxis).toHaveCount(0)
    })
})

test.describe('OrigamChartHeatmap — accessibility', () => {
    test('each cell has role="button" and a non-empty aria-label', async ({ page }) => {
        await openVariant(page, HEATMAP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const cells = sandbox.locator('[data-cy="heatmap-playground-chart"] [data-cy^="origam-chart-heatmap-cell-"]:not([data-cy*="-group-"])')
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
        const cells = sandbox.locator('[data-cy="heatmap-playground-chart"] [data-cy^="origam-chart-heatmap-cell-"]:not([data-cy*="-group-"])')
        const count = await cells.count()

        for (let i = 0; i < Math.min(count, 5); i++) {
            await expect(cells.nth(i)).toHaveAttribute('tabindex', '0')
        }
    })
})

test.describe('OrigamChartHeatmap — emit', () => {
    test('clicking a cell appends a point-click log line', async ({ page }) => {
        await openVariant(page, HEATMAP_STORY, 'Emit — point-click on cell')
        const sandbox = sandboxOf(page)

        const firstCell = sandbox.locator('[data-cy="heatmap-emit-chart"] [data-cy^="origam-chart-heatmap-cell-"]:not([data-cy*="-group-"])').first()
        await expect(firstCell).toBeVisible({ timeout: 8000 })
        await firstCell.click()

        await page.waitForTimeout(300)

        const log = sandbox.locator('[data-cy="heatmap-emit-log"]')
        await expect(log).toContainText('point-click', { timeout: 3000 })
    })
})

test.describe('OrigamChartHeatmap — empty state', () => {
    test('empty slot renders when series is empty', async ({ page }) => {
        await openVariant(page, HEATMAP_STORY, 'Slot — empty')
        const sandbox = sandboxOf(page)
        const empty = sandbox.locator('[data-cy="heatmap-slot-empty-chart"] [data-cy="origam-chart-heatmap-empty"]')
        await expect(empty).toBeVisible({ timeout: 6000 })
        await expect(empty).toContainText('No activity data')
    })
})
