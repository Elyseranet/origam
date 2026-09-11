import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamChartHoneycomb — Playwright spec.
 *
 * Asserts:
 *  - 9 hexagonal `<polygon>` tiles render for the 3×3 fixture.
 *  - At least 2 distinct fill colours are present (categorical mode).
 *  - The orientation Variant's two grids differ geometrically
 *    (pointy-top and flat-top polygons have different bounding boxes).
 *  - ARIA attributes (role="figure", role="img", title, desc) are
 *    present for screen-reader support.
 *  - Each tile carries role="button" and aria-label.
 *  - Empty slot renders when series is empty.
 */

const HONEYCOMB_STORY = '/stories/story/components-stories-chart-origamcharthoneycomb-story-vue'
const CHART_STORY = '/stories/story/components-stories-chart-origamchart-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyUrl: string, title: string) => {
    await page.goto(storyUrl)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(500)
}

test.describe('OrigamChartHoneycomb — Default', () => {
    test('renders figure root with role="figure"', async ({ page }) => {
        await openVariant(page, HONEYCOMB_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="honeycomb-playground-chart"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'figure')
    })

    test('SVG carries role=img, title and desc', async ({ page }) => {
        await openVariant(page, HONEYCOMB_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator('[data-cy="honeycomb-playground-chart"] svg').first()
        await expect(svg).toBeVisible()
        await expect(svg).toHaveAttribute('role', 'img')
        await expect(svg.locator('title')).toHaveCount(1)
        await expect(svg.locator('desc')).toHaveCount(1)
    })

    test('renders exactly 9 tiles for the 3×3 fixture', async ({ page }) => {
        await openVariant(page, HONEYCOMB_STORY, 'Default')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-honeycomb-default.png', fullPage: false })

        const tiles = sandbox.locator('[data-cy="honeycomb-playground-chart"] polygon[data-cy^="origam-chart-honeycomb-tile-"]')
        await expect(tiles).toHaveCount(9, { timeout: 8000 })
    })

    test('each tile polygon has a non-empty points attribute', async ({ page }) => {
        await openVariant(page, HONEYCOMB_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const tiles = sandbox.locator('[data-cy="honeycomb-playground-chart"] polygon[data-cy^="origam-chart-honeycomb-tile-"]')
        const count = await tiles.count()
        expect(count).toBe(9)
        for (let i = 0; i < count; i++) {
            const pts = await tiles.nth(i).getAttribute('points')
            expect(pts).toBeTruthy()
            expect(pts!.includes(',')).toBe(true)
        }
    })
})

test.describe('OrigamChartHoneycomb — accessibility', () => {
    test('each tile has role="button" and a non-empty aria-label', async ({ page }) => {
        await openVariant(page, HONEYCOMB_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const tiles = sandbox.locator('[data-cy="honeycomb-playground-chart"] polygon[data-cy^="origam-chart-honeycomb-tile-"]')
        const count = await tiles.count()
        for (let i = 0; i < count; i++) {
            await expect(tiles.nth(i)).toHaveAttribute('role', 'button')
            const label = await tiles.nth(i).getAttribute('aria-label')
            expect(label).toBeTruthy()
        }
    })

    test('each tile is keyboard-focusable (tabindex=0)', async ({ page }) => {
        await openVariant(page, HONEYCOMB_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const tiles = sandbox.locator('[data-cy="honeycomb-playground-chart"] polygon[data-cy^="origam-chart-honeycomb-tile-"]')
        const count = await tiles.count()
        for (let i = 0; i < count; i++) {
            await expect(tiles.nth(i)).toHaveAttribute('tabindex', '0')
        }
    })
})

test.describe('OrigamChartHoneycomb — orientation variant', () => {
    test('pointy-top and flat-top both render 9 tiles', async ({ page }) => {
        await openVariant(page, HONEYCOMB_STORY, 'Prop — orientation (pointy-top vs flat-top side by side)')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-honeycomb-orientation.png', fullPage: false })

        const pointyTiles = sandbox.locator('[data-cy="honeycomb-orientation-pointy"] polygon[data-cy^="origam-chart-honeycomb-tile-"]')
        const flatTiles = sandbox.locator('[data-cy="honeycomb-orientation-flat"] polygon[data-cy^="origam-chart-honeycomb-tile-"]')

        await expect(pointyTiles).toHaveCount(9, { timeout: 8000 })
        await expect(flatTiles).toHaveCount(9, { timeout: 8000 })
    })

    test('pointy-top and flat-top tile bounding boxes differ', async ({ page }) => {
        await openVariant(page, HONEYCOMB_STORY, 'Prop — orientation (pointy-top vs flat-top side by side)')
        const sandbox = sandboxOf(page)

        const pointyTile0 = sandbox.locator('[data-cy="honeycomb-orientation-pointy"] polygon[data-cy="origam-chart-honeycomb-tile-0"]')
        const flatTile0 = sandbox.locator('[data-cy="honeycomb-orientation-flat"] polygon[data-cy="origam-chart-honeycomb-tile-0"]')

        const pointyPoints = await pointyTile0.getAttribute('points')
        const flatPoints = await flatTile0.getAttribute('points')

        expect(pointyPoints).toBeTruthy()
        expect(flatPoints).toBeTruthy()
        expect(pointyPoints).not.toBe(flatPoints)
    })
})

test.describe('OrigamChartHoneycomb — colorMode variant', () => {
    test('categorical and heatmap both render tiles', async ({ page }) => {
        await openVariant(page, HONEYCOMB_STORY, 'Prop — colorMode (categorical vs heatmap side by side)')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-honeycomb-heatmap.png', fullPage: false })

        const catTiles = sandbox.locator('[data-cy="honeycomb-color-mode-categorical"] polygon[data-cy^="origam-chart-honeycomb-tile-"]')
        const heatTiles = sandbox.locator('[data-cy="honeycomb-color-mode-heatmap"] polygon[data-cy^="origam-chart-honeycomb-tile-"]')

        await expect(catTiles).toHaveCount(12, { timeout: 8000 })
        await expect(heatTiles).toHaveCount(12, { timeout: 8000 })
    })

    test('at least 2 tiles have distinct style fill values (categorical)', async ({ page }) => {
        await openVariant(page, HONEYCOMB_STORY, 'Prop — colorMode (categorical vs heatmap side by side)')
        const sandbox = sandboxOf(page)

        const tiles = sandbox.locator('[data-cy="honeycomb-color-mode-categorical"] polygon[data-cy^="origam-chart-honeycomb-tile-"]')
        const count = await tiles.count()
        expect(count).toBeGreaterThanOrEqual(2)

        const fills = new Set<string>()
        for (let i = 0; i < Math.min(count, 6); i++) {
            const style = await tiles.nth(i).getAttribute('style')
            if (style) fills.add(style)
        }
        expect(fills.size).toBeGreaterThanOrEqual(2)
    })
})

test.describe('OrigamChartHoneycomb — empty state', () => {
    test('empty slot renders when series is empty', async ({ page }) => {
        await openVariant(page, HONEYCOMB_STORY, 'Slot — empty (custom CTA)')
        const sandbox = sandboxOf(page)
        const empty = sandbox.locator('[data-cy="honeycomb-slot-empty-chart"] [data-cy="origam-chart-honeycomb-empty"]')
        await expect(empty).toBeVisible({ timeout: 6000 })
        await expect(empty).toContainText('No hex tile data')
    })
})

test.describe('OrigamChart shell — honeycomb dispatch', () => {
    test('honeycomb tile in 14-primitives grid renders 9 tiles', async ({ page }) => {
        await openVariant(page, CHART_STORY, 'Prop — type (29 primitives)')
        const sandbox = sandboxOf(page)

        const tiles = sandbox.locator('[data-cy="chart-type-honeycomb"] polygon[data-cy^="origam-chart-honeycomb-tile-"]')
        await expect(tiles).toHaveCount(9, { timeout: 8000 })
    })

    test('honeycomb tile-map Variant renders 9 tiles', async ({ page }) => {
        await openVariant(page, CHART_STORY, 'Prop — honeycomb tile-map')
        const sandbox = sandboxOf(page)

        const tiles = sandbox.locator('[data-cy="chart-honeycomb-9tiles"] polygon[data-cy^="origam-chart-honeycomb-tile-"]')
        await expect(tiles).toHaveCount(9, { timeout: 8000 })
    })
})
