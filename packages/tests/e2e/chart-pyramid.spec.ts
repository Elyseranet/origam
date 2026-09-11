import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamChartPyramid — Playwright spec.
 *
 * Asserts:
 *  - N trapezoid `<path>` elements render for N data points.
 *  - `funnel` and `pyramid` variants both produce the expected
 *    number of paths.
 *  - The main OrigamChart shell story shows both types side-by-side.
 *  - Clicking a legend item hides the corresponding slice and
 *    applies the `--hidden` modifier on the legend item.
 *  - ARIA attributes (role="figure", role="img", title, desc) are
 *    present for screen-reader support.
 */

const PYRAMID_STORY = '/stories/story/components-stories-chart-origamchartpyramid-story-vue'
const CHART_STORY = '/stories/story/components-stories-chart-origamchart-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyUrl: string, title: string) => {
    await page.goto(storyUrl)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(500)
}

test.describe('OrigamChartPyramid — Default (funnel)', () => {
    test('renders figure root with role="figure"', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="pyramid-playground-chart"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'figure')
    })

    test('SVG carries role=img, title and desc', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator('[data-cy="pyramid-playground-chart"] svg').first()
        await expect(svg).toBeVisible()
        await expect(svg).toHaveAttribute('role', 'img')
        await expect(svg.locator('title')).toHaveCount(1)
        await expect(svg.locator('desc')).toHaveCount(1)
    })

    test('renders exactly 5 trapezoid slices (FIXTURE_FUNNEL has 5 data points)', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Default')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-pyramid-default.png', fullPage: false })

        const slices = sandbox.locator('[data-cy="pyramid-playground-chart"] [data-cy^="origam-chart-pyramid-slice-"]')
        await expect(slices).toHaveCount(5, { timeout: 6000 })
    })

    test('each slice path has a non-empty d attribute', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const slices = sandbox.locator('[data-cy="pyramid-playground-chart"] [data-cy^="origam-chart-pyramid-slice-"]')
        const count = await slices.count()
        expect(count).toBe(5)
        for (let i = 0; i < count; i++) {
            const d = await slices.nth(i).getAttribute('d')
            expect(d).toBeTruthy()
            expect(d!.startsWith('M')).toBe(true)
        }
    })
})

test.describe('OrigamChartPyramid — Funnel variant', () => {
    test('funnel type renders 5 slices', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Prop — type (funnel / pyramid side by side)')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-pyramid-funnel.png', fullPage: false })

        const slices = sandbox.locator('[data-cy="pyramid-type-funnel"] [data-cy^="origam-chart-pyramid-slice-"]')
        await expect(slices).toHaveCount(5, { timeout: 6000 })
    })

    test('pyramid type renders 5 slices', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Prop — type (funnel / pyramid side by side)')
        const sandbox = sandboxOf(page)
        const slices = sandbox.locator('[data-cy="pyramid-type-pyramid"] [data-cy^="origam-chart-pyramid-slice-"]')
        await expect(slices).toHaveCount(5, { timeout: 6000 })
    })

    test('funnel slice 0 is wider at the top than slice 4', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Prop — type (funnel / pyramid side by side)')
        const sandbox = sandboxOf(page)

        const slice0 = sandbox.locator('[data-cy="pyramid-type-funnel"] [data-cy="origam-chart-pyramid-slice-0"]')
        const slice4 = sandbox.locator('[data-cy="pyramid-type-funnel"] [data-cy="origam-chart-pyramid-slice-4"]')

        const d0 = await slice0.getAttribute('d')
        const d4 = await slice4.getAttribute('d')
        expect(d0).toBeTruthy()
        expect(d4).toBeTruthy()

        // Extract the first M x,y to get the left-edge x of each slice top.
        // Funnel: slice 0 top is widest → its left x (tl) is lower than slice 4's.
        const extractTopLeft = (d: string): number => {
            const m = d.match(/M\s*([\d.]+),/)
            return m ? parseFloat(m[1]) : 0
        }
        const tl0 = extractTopLeft(d0!)
        const tl4 = extractTopLeft(d4!)
        // Slice 0 top-left should be further left (smaller x) than slice 4.
        expect(tl0).toBeLessThan(tl4)
    })
})

test.describe('OrigamChartPyramid — series slice count variations', () => {
    test('3-slice variant renders exactly 3 paths', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Prop — series (3 / 5 / 8 slices)')
        const sandbox = sandboxOf(page)
        const slices = sandbox.locator('[data-cy="pyramid-series-3"] [data-cy^="origam-chart-pyramid-slice-"]')
        await expect(slices).toHaveCount(3, { timeout: 6000 })
    })

    test('8-slice variant renders exactly 8 paths', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Prop — series (3 / 5 / 8 slices)')
        const sandbox = sandboxOf(page)
        const slices = sandbox.locator('[data-cy="pyramid-series-8"] [data-cy^="origam-chart-pyramid-slice-"]')
        await expect(slices).toHaveCount(8, { timeout: 6000 })
    })
})

test.describe('OrigamChartPyramid — legend toggle', () => {
    test('clicking first legend item hides slice 0 and applies --hidden modifier', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Default')
        const sandbox = sandboxOf(page)

        // Verify 5 slices visible before toggle.
        const slices = sandbox.locator('[data-cy="pyramid-playground-chart"] [data-cy^="origam-chart-pyramid-slice-"]')
        await expect(slices).toHaveCount(5, { timeout: 6000 })

        // Click the first legend item.
        const legendItems = sandbox.locator('[data-cy="pyramid-playground-chart"] .origam-chart__legend-item')
        await expect(legendItems.first()).toBeVisible()
        await legendItems.first().click()
        await page.waitForTimeout(300)

        // After toggling the first entry, only 4 slices should remain visible.
        await expect(slices).toHaveCount(4, { timeout: 4000 })

        // The clicked legend item should carry the --hidden modifier.
        await expect(legendItems.first()).toHaveClass(/origam-chart__legend-item--hidden/, { timeout: 4000 })
    })

    test('re-clicking the hidden legend item restores 5 slices', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Default')
        const sandbox = sandboxOf(page)

        const slices = sandbox.locator('[data-cy="pyramid-playground-chart"] [data-cy^="origam-chart-pyramid-slice-"]')
        const legendItems = sandbox.locator('[data-cy="pyramid-playground-chart"] .origam-chart__legend-item')

        // Hide first slice.
        await legendItems.first().click()
        await page.waitForTimeout(300)
        await expect(slices).toHaveCount(4)

        // Show it again.
        await legendItems.first().click()
        await page.waitForTimeout(300)
        await expect(slices).toHaveCount(5)
        await expect(legendItems.first()).not.toHaveClass(/origam-chart__legend-item--hidden/)
    })
})

test.describe('OrigamChartPyramid — accessibility', () => {
    test('each slice has role="button" and a non-empty aria-label', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const slices = sandbox.locator('[data-cy="pyramid-playground-chart"] [data-cy^="origam-chart-pyramid-slice-"]')
        const count = await slices.count()
        for (let i = 0; i < count; i++) {
            await expect(slices.nth(i)).toHaveAttribute('role', 'button')
            const label = await slices.nth(i).getAttribute('aria-label')
            expect(label).toBeTruthy()
        }
    })

    test('each slice is keyboard-focusable (tabindex=0)', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const slices = sandbox.locator('[data-cy="pyramid-playground-chart"] [data-cy^="origam-chart-pyramid-slice-"]')
        const count = await slices.count()
        for (let i = 0; i < count; i++) {
            await expect(slices.nth(i)).toHaveAttribute('tabindex', '0')
        }
    })
})

test.describe('OrigamChart shell — pyramid / funnel dispatch', () => {
    test('Prop — pyramid / funnel variant renders both charts side by side', async ({ page }) => {
        await openVariant(page, CHART_STORY, 'Prop — pyramid / funnel (side by side)')
        const sandbox = sandboxOf(page)

        const funnelSlices = sandbox.locator('[data-cy="chart-pyramid-funnel-funnel"] [data-cy^="origam-chart-pyramid-slice-"]')
        const pyramidSlices = sandbox.locator('[data-cy="chart-pyramid-funnel-pyramid"] [data-cy^="origam-chart-pyramid-slice-"]')

        await expect(funnelSlices).toHaveCount(5, { timeout: 8000 })
        await expect(pyramidSlices).toHaveCount(5, { timeout: 8000 })
    })

    test('funnel chart in 13-primitives grid renders 5 slices', async ({ page }) => {
        await openVariant(page, CHART_STORY, 'Prop — type (29 primitives)')
        const sandbox = sandboxOf(page)

        const slices = sandbox.locator('[data-cy="chart-type-funnel"] [data-cy^="origam-chart-pyramid-slice-"]')
        await expect(slices).toHaveCount(5, { timeout: 8000 })
    })

    test('pyramid chart in 13-primitives grid renders 5 slices', async ({ page }) => {
        await openVariant(page, CHART_STORY, 'Prop — type (29 primitives)')
        const sandbox = sandboxOf(page)

        const slices = sandbox.locator('[data-cy="chart-type-pyramid"] [data-cy^="origam-chart-pyramid-slice-"]')
        await expect(slices).toHaveCount(5, { timeout: 8000 })
    })
})

test.describe('OrigamChartPyramid — empty state', () => {
    test('empty slot renders when series is empty', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Slot — empty')
        const sandbox = sandboxOf(page)
        const empty = sandbox.locator('[data-cy="pyramid-slot-empty-chart"] [data-cy="origam-chart-pyramid-empty"]')
        await expect(empty).toBeVisible({ timeout: 6000 })
        await expect(empty).toContainText('No pipeline data')
    })
})
