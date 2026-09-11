import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamChartTreemap — Playwright spec.
 *
 * Asserts:
 *  - N `<rect>` tiles render for N data items.
 *  - Squarified and slice-dice variants both produce the expected tile count.
 *  - Clicking a legend item hides the corresponding tile and applies
 *    the `--hidden` modifier on the legend item.
 *  - ARIA attributes (role="figure", role="img", title, desc) are present.
 *  - Label text renders inside large-enough tiles (showLabel=true).
 *  - Empty slot renders when series is empty.
 */

const TREEMAP_STORY = '/stories/story/components-stories-chart-origamcharttreemap-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyUrl: string, title: string) => {
    await page.goto(storyUrl)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(500)
}

test.describe('OrigamChartTreemap — Default', () => {
    test('renders figure root with role="figure"', async ({ page }) => {
        await openVariant(page, TREEMAP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="treemap-playground-chart"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'figure')
    })

    test('SVG carries role=img, title and desc', async ({ page }) => {
        await openVariant(page, TREEMAP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator('[data-cy="treemap-playground-chart"] svg').first()
        await expect(svg).toBeVisible()
        await expect(svg).toHaveAttribute('role', 'img')
        await expect(svg.locator('title')).toHaveCount(1)
        await expect(svg.locator('desc')).toHaveCount(1)
    })

    test('renders exactly 10 tiles for the FIXTURE_TECH (10 data items)', async ({ page }) => {
        await openVariant(page, TREEMAP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-treemap-default.png', fullPage: false })

        // Use `rect[data-cy^=...]` to target only the <rect> tile elements and exclude
        // the <g> wrapper groups which share the same data-cy prefix ("origam-chart-treemap-tile-group-N"
        // also starts with "origam-chart-treemap-tile-"), causing a 2× count.
        const tiles = sandbox.locator('[data-cy="treemap-playground-chart"] rect[data-cy^="origam-chart-treemap-tile-"]')
        await expect(tiles).toHaveCount(10, { timeout: 6000 })
    })

    test('each tile rect has positive width and height attributes', async ({ page }) => {
        await openVariant(page, TREEMAP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const tiles = sandbox.locator('[data-cy="treemap-playground-chart"] rect[data-cy^="origam-chart-treemap-tile-"]')
        await expect(tiles).toHaveCount(10, { timeout: 6000 })
        const count = await tiles.count()
        expect(count).toBe(10)
        for (let i = 0; i < count; i++) {
            const w = await tiles.nth(i).getAttribute('width')
            const h = await tiles.nth(i).getAttribute('height')
            expect(parseFloat(w ?? '0')).toBeGreaterThan(0)
            expect(parseFloat(h ?? '0')).toBeGreaterThan(0)
        }
    })
})

test.describe('OrigamChartTreemap — algorithm variants', () => {
    test('squarified variant renders 10 tiles', async ({ page }) => {
        await openVariant(page, TREEMAP_STORY, 'Prop — algorithm (squarified vs slice-dice)')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-treemap-algorithm.png', fullPage: false })

        const tiles = sandbox.locator('[data-cy="treemap-algorithm-squarified"] rect[data-cy^="origam-chart-treemap-tile-"]')
        await expect(tiles).toHaveCount(10, { timeout: 6000 })
    })

    test('slice-dice variant renders 10 tiles', async ({ page }) => {
        await openVariant(page, TREEMAP_STORY, 'Prop — algorithm (squarified vs slice-dice)')
        const sandbox = sandboxOf(page)
        const tiles = sandbox.locator('[data-cy="treemap-algorithm-slice-dice"] rect[data-cy^="origam-chart-treemap-tile-"]')
        await expect(tiles).toHaveCount(10, { timeout: 6000 })
    })

    test('squarified and slice-dice produce different tile geometries', async ({ page }) => {
        await openVariant(page, TREEMAP_STORY, 'Prop — algorithm (squarified vs slice-dice)')
        const sandbox = sandboxOf(page)

        const sqTile0 = sandbox.locator('[data-cy="treemap-algorithm-squarified"] [data-cy="origam-chart-treemap-tile-0"]')
        const sdTile0 = sandbox.locator('[data-cy="treemap-algorithm-slice-dice"] [data-cy="origam-chart-treemap-tile-0"]')

        const sqW = await sqTile0.getAttribute('width')
        const sdW = await sdTile0.getAttribute('width')

        expect(sqW).toBeTruthy()
        expect(sdW).toBeTruthy()
        expect(sqW).not.toEqual(sdW)
    })
})

test.describe('OrigamChartTreemap — showLabel', () => {
    test('showLabel=true renders name and value labels for large tiles', async ({ page }) => {
        await openVariant(page, TREEMAP_STORY, 'Prop — showLabel (on / off)')
        const sandbox = sandboxOf(page)
        const labels = sandbox.locator('[data-cy="treemap-label-on"] [data-cy^="origam-chart-treemap-label-name-"]')
        // Use not.toHaveCount(0) so Playwright retries until at least one label appears (up to 6 s).
        // Plain count() is synchronous and races with the chart's first render frame.
        await expect(labels).not.toHaveCount(0, { timeout: 6000 })
    })

    test('showLabel=false renders no name labels', async ({ page }) => {
        await openVariant(page, TREEMAP_STORY, 'Prop — showLabel (on / off)')
        const sandbox = sandboxOf(page)
        const labels = sandbox.locator('[data-cy="treemap-label-off"] [data-cy^="origam-chart-treemap-label-name-"]')
        await expect(labels).toHaveCount(0, { timeout: 4000 })
    })
})

test.describe('OrigamChartTreemap — legend toggle', () => {
    test('clicking first legend item hides one tile and applies --hidden modifier', async ({ page }) => {
        await openVariant(page, TREEMAP_STORY, 'Default')
        const sandbox = sandboxOf(page)

        const tiles = sandbox.locator('[data-cy="treemap-playground-chart"] rect[data-cy^="origam-chart-treemap-tile-"]')
        await expect(tiles).toHaveCount(10, { timeout: 6000 })

        const legendItems = sandbox.locator('[data-cy="treemap-playground-chart"] .origam-chart__legend-item')
        await expect(legendItems.first()).toBeVisible()
        await legendItems.first().click()
        await page.waitForTimeout(300)

        await expect(tiles).toHaveCount(9, { timeout: 4000 })
        await expect(legendItems.first()).toHaveClass(/origam-chart__legend-item--hidden/, { timeout: 4000 })
    })

    test('re-clicking the hidden legend item restores all 10 tiles', async ({ page }) => {
        await openVariant(page, TREEMAP_STORY, 'Default')
        const sandbox = sandboxOf(page)

        const tiles = sandbox.locator('[data-cy="treemap-playground-chart"] rect[data-cy^="origam-chart-treemap-tile-"]')
        const legendItems = sandbox.locator('[data-cy="treemap-playground-chart"] .origam-chart__legend-item')

        await legendItems.first().click()
        await page.waitForTimeout(300)
        await expect(tiles).toHaveCount(9, { timeout: 4000 })

        await legendItems.first().click()
        await page.waitForTimeout(300)
        await expect(tiles).toHaveCount(10, { timeout: 4000 })
        await expect(legendItems.first()).not.toHaveClass(/origam-chart__legend-item--hidden/)
    })
})

test.describe('OrigamChartTreemap — accessibility', () => {
    test('each tile has role="button" and a non-empty aria-label', async ({ page }) => {
        await openVariant(page, TREEMAP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const tiles = sandbox.locator('[data-cy="treemap-playground-chart"] rect[data-cy^="origam-chart-treemap-tile-"]')
        await expect(tiles).toHaveCount(10, { timeout: 6000 })
        const count = await tiles.count()
        for (let i = 0; i < count; i++) {
            await expect(tiles.nth(i)).toHaveAttribute('role', 'button')
            const label = await tiles.nth(i).getAttribute('aria-label')
            expect(label).toBeTruthy()
        }
    })

    test('each tile is keyboard-focusable (tabindex=0)', async ({ page }) => {
        await openVariant(page, TREEMAP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const tiles = sandbox.locator('[data-cy="treemap-playground-chart"] rect[data-cy^="origam-chart-treemap-tile-"]')
        await expect(tiles).toHaveCount(10, { timeout: 6000 })
        const count = await tiles.count()
        for (let i = 0; i < count; i++) {
            await expect(tiles.nth(i)).toHaveAttribute('tabindex', '0')
        }
    })
})

test.describe('OrigamChartTreemap — empty state', () => {
    test('empty slot renders when series is empty', async ({ page }) => {
        await openVariant(page, TREEMAP_STORY, 'Slot — empty')
        const sandbox = sandboxOf(page)
        const empty = sandbox.locator('[data-cy="treemap-slot-empty-chart"] [data-cy="origam-chart-treemap-empty"]')
        await expect(empty).toBeVisible({ timeout: 6000 })
        await expect(empty).toContainText('No portfolio data')
    })
})

test.describe('OrigamChartTreemap — budget fixture (5 tiles)', () => {
    test('budget fixture renders exactly 5 tiles', async ({ page }) => {
        await openVariant(page, TREEMAP_STORY, 'Emit — point-click / legend-click / series-toggle')
        const sandbox = sandboxOf(page)
        const tiles = sandbox.locator('[data-cy="treemap-emit-chart"] rect[data-cy^="origam-chart-treemap-tile-"]')
        await expect(tiles).toHaveCount(5, { timeout: 6000 })
    })
})
