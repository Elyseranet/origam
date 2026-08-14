import { expect, test, type Page } from '@playwright/test'

import { selectHstOption } from './_support/histoire-controls'

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
 *
 * The story restructuring (canonical Design/State/Functional/Events/Slots
 * layout, see root CLAUDE.md) removed every per-fixture root data-cy this
 * spec targeted (honeycomb-playground-chart, honeycomb-orientation-*,
 * honeycomb-color-mode-*, honeycomb-slot-empty-chart) —
 * `OrigamChartHoneycomb.vue` itself sets a static
 * `data-cy="origam-chart-honeycomb"` on its own root instead. orientation/
 * colorMode were static side-by-side comparisons, now single dynamic
 * controls on "Design" — which uses a DIFFERENT fixture (FIXTURE_HEATMAP,
 * 12 tiles / 4×3) than "Default"/"Functional" (FIXTURE_3X3, 9 tiles /
 * 3×3, see OrigamChartHoneycomb.story.vue) — so orientation/colorMode
 * tests now expect 12 tiles, not 9.
 */

const HONEYCOMB_STORY = '/stories/story/components-stories-chart-origamcharthoneycomb-story-vue'
const CHART_STORY = '/stories/story/components-stories-chart-origamchart-story-vue'
const CHART = '[data-cy="origam-chart-honeycomb"]'

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
        const host = sandbox.locator(CHART).first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'figure')
    })

    test('SVG carries role=img, title and desc', async ({ page }) => {
        await openVariant(page, HONEYCOMB_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator(`${ CHART } svg`).first()
        await expect(svg).toBeVisible()
        await expect(svg).toHaveAttribute('role', 'img')
        await expect(svg.locator('title')).toHaveCount(1)
        await expect(svg.locator('desc')).toHaveCount(1)
    })

    test('renders exactly 9 tiles for the 3×3 fixture', async ({ page }) => {
        await openVariant(page, HONEYCOMB_STORY, 'Default')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-honeycomb-default.png', fullPage: false })

        const tiles = sandbox.locator(`${ CHART } polygon[data-cy^="origam-chart-honeycomb-tile-"]`)
        await expect(tiles).toHaveCount(9, { timeout: 8000 })
    })

    test('each tile polygon has a non-empty points attribute', async ({ page }) => {
        await openVariant(page, HONEYCOMB_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const tiles = sandbox.locator(`${ CHART } polygon[data-cy^="origam-chart-honeycomb-tile-"]`)
        // Timing race found while repairing this spec's title drift,
        // unrelated to it (same class documented on chart-bullet.spec.ts's
        // axis-ticks test) — toHaveCount auto-retries.
        await expect(tiles).toHaveCount(9, { timeout: 6000 })
        const count = await tiles.count()
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
        const tiles = sandbox.locator(`${ CHART } polygon[data-cy^="origam-chart-honeycomb-tile-"]`)
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
        const tiles = sandbox.locator(`${ CHART } polygon[data-cy^="origam-chart-honeycomb-tile-"]`)
        const count = await tiles.count()
        for (let i = 0; i < count; i++) {
            await expect(tiles.nth(i)).toHaveAttribute('tabindex', '0')
        }
    })
})

test.describe('OrigamChartHoneycomb — orientation variant', () => {
    test('pointy-top and flat-top both render 12 tiles', async ({ page }) => {
        // Dedicated side-by-side fixture folded into "Design" — a single
        // dynamic "Orientation" control (default 'pointy-top'), driven
        // sequentially. Design uses FIXTURE_HEATMAP (12 tiles / 4×3), NOT
        // the 9-tile FIXTURE_3X3 the old fixture used — see file-level
        // comment.
        await openVariant(page, HONEYCOMB_STORY, 'Design')
        const sandbox = sandboxOf(page)
        const tiles = sandbox.locator(`${ CHART } polygon[data-cy^="origam-chart-honeycomb-tile-"]`)

        await expect(tiles).toHaveCount(12, { timeout: 8000 })

        await selectHstOption(page, 'Orientation', 'flat-top')
        await page.waitForTimeout(400)
        await expect(tiles).toHaveCount(12, { timeout: 8000 })
    })

    test('pointy-top and flat-top tile bounding boxes differ', async ({ page }) => {
        await openVariant(page, HONEYCOMB_STORY, 'Design')
        const sandbox = sandboxOf(page)
        const tile0 = sandbox.locator(`${ CHART } polygon[data-cy="origam-chart-honeycomb-tile-0"]`)

        const pointyPoints = await tile0.getAttribute('points')

        await selectHstOption(page, 'Orientation', 'flat-top')
        await page.waitForTimeout(400)
        const flatPoints = await tile0.getAttribute('points')

        expect(pointyPoints).toBeTruthy()
        expect(flatPoints).toBeTruthy()
        expect(pointyPoints).not.toBe(flatPoints)
    })
})

test.describe('OrigamChartHoneycomb — colorMode variant', () => {
    test('categorical and heatmap both render tiles', async ({ page }) => {
        // Dedicated side-by-side fixture folded into "Design" — a single
        // dynamic "Color Mode" control (default 'categorical'), driven
        // sequentially. Design's FIXTURE_HEATMAP has 12 tiles — matches
        // the original expectation unchanged.
        await openVariant(page, HONEYCOMB_STORY, 'Design')
        const sandbox = sandboxOf(page)
        const tiles = sandbox.locator(`${ CHART } polygon[data-cy^="origam-chart-honeycomb-tile-"]`)

        await expect(tiles).toHaveCount(12, { timeout: 8000 })

        await selectHstOption(page, 'Color Mode', 'heatmap')
        await page.waitForTimeout(400)
        await expect(tiles).toHaveCount(12, { timeout: 8000 })
    })

    test('at least 2 tiles have distinct style fill values (categorical)', async ({ page }) => {
        // Dedicated fixture folded into "Design" — its default init-state
        // already sets colorMode: 'categorical', so no control
        // interaction is needed.
        await openVariant(page, HONEYCOMB_STORY, 'Design')
        const sandbox = sandboxOf(page)

        const tiles = sandbox.locator(`${ CHART } polygon[data-cy^="origam-chart-honeycomb-tile-"]`)
        // Same timing race as above.
        await expect(tiles.first()).toBeAttached({ timeout: 6000 })
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
        // Canonical Variant is "Slots - Empty" — no story-level root
        // data-cy, anchored via the component's own static root.
        await openVariant(page, HONEYCOMB_STORY, 'Slots - Empty')
        const sandbox = sandboxOf(page)
        const empty = sandbox.locator(`${ CHART } [data-cy="origam-chart-honeycomb-empty"]`)
        await expect(empty).toBeVisible({ timeout: 6000 })
        await expect(empty).toContainText('No hex tile data')
    })
})

test.describe('OrigamChart shell — honeycomb dispatch', () => {
    test('OrigamChart dispatches type=honeycomb and renders tiles', async ({ page }) => {
        // The dedicated "14-primitives grid" / "honeycomb tile-map"
        // fixtures (each producing exactly 9 tiles) no longer exist in
        // the generic OrigamChart.story.vue — only "Design"'s single
        // dynamic "Type" control remains, defaulting to `series:
        // FIXTURE_SALES_SERIES` (12 monthly category points, a LINE-
        // shaped dataset, not a 3×3 hex grid). Verified empirically:
        // switching Type to 'honeycomb' with that data renders 12 tiles
        // (one per month), not 9 — the shape comes from the data length,
        // not a hex-grid-specific fixture. Adapted to check the shell
        // dispatch CONTRACT that's still meaningful and verifiable
        // (OrigamChart correctly routes type=honeycomb to the honeycomb
        // renderer, which mounts real tiles) rather than an exact count
        // tied to a fixture that's gone.
        await openVariant(page, CHART_STORY, 'Design')
        await selectHstOption(page, 'Type', 'honeycomb')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)

        const tiles = sandbox.locator('polygon[data-cy^="origam-chart-honeycomb-tile-"]')
        await expect(tiles.first()).toBeAttached({ timeout: 8000 })
        const count = await tiles.count()
        expect(count).toBeGreaterThan(0)
    })

    test('honeycomb tile-map Variant renders 9 tiles', async () => {
        // STORY GAP found while repairing this spec: the dedicated 9-tile
        // "honeycomb tile-map" fixture (distinct from the generic type
        // dispatch above) no longer exists anywhere in
        // OrigamChart.story.vue. Cannot be reproduced without editing the
        // story.
        test.skip(true, 'STORY GAP: OrigamChart.story.vue no longer has a dedicated 9-tile "honeycomb tile-map" fixture after the canonical-structure migration — only the generic Type=honeycomb dispatch (12 tiles, via FIXTURE_SALES_SERIES) remains. Needs a dedicated story fixture, not a spec change.')
    })
})
