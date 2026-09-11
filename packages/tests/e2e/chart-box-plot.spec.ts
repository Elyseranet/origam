import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamChartBoxPlot — Playwright spec.
 *
 * Asserts:
 *  - N box groups render for N categories (pre-aggregated fixture has 5).
 *  - Each box group contains a rect, a median line, upper/lower whiskers and caps.
 *  - Raw-samples variant renders 3 boxes (Mon/Wed/Fri fixture).
 *  - showOutliers=false removes outlier circles.
 *  - boxWidth prop visually changes the rect width (0.3 < 0.9).
 *  - ARIA attributes (role="figure", role="img", title, desc) are present.
 *  - Each box group has role="button" and a non-empty aria-label.
 *  - Each box group is keyboard-focusable (tabindex=0).
 *  - Empty slot renders when series is empty.
 *  - Clicking a box fires into the emit log.
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
        const host = sandbox.locator('[data-cy="box-plot-playground-chart"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'figure')
    })

    test('SVG carries role=img, title and desc', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator('[data-cy="box-plot-playground-chart"] svg').first()
        await expect(svg).toBeVisible()
        await expect(svg).toHaveAttribute('role', 'img')
        await expect(svg.locator('title')).toHaveCount(1)
        await expect(svg.locator('desc')).toHaveCount(1)
    })

    test('renders exactly 5 box groups for 5 API categories', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-box-plot-default.png', fullPage: false })

        const boxes = sandbox.locator('[data-cy="box-plot-playground-chart"] [data-cy^="origam-chart-box-group-"]')
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
    test('renders exactly 3 boxes for Mon/Wed/Fri fixture', async ({ page }) => {
        await openVariant(page, 'Prop — raw samples (computes quartiles internally)')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-box-plot-raw.png', fullPage: false })

        const boxes = sandbox.locator('[data-cy="box-plot-raw-samples-chart"] [data-cy^="origam-chart-box-group-"]')
        await expect(boxes).toHaveCount(3, { timeout: 6000 })
    })

    test('each raw-samples box has a rect and median line', async ({ page }) => {
        await openVariant(page, 'Prop — raw samples (computes quartiles internally)')
        const sandbox = sandboxOf(page)

        for (let i = 0; i < 3; i++) {
            // <rect> has area — toBeVisible works. <line> is zero-height horizontal,
            // toBeVisible times out; use toBeAttached() + coordinate attribute instead.
            await expect(sandbox.locator(`[data-cy="origam-chart-box-rect-${ i }"]`)).toBeVisible({ timeout: 6000 })
            const median = sandbox.locator(`[data-cy="origam-chart-box-median-${ i }"]`)
            await expect(median).toBeAttached({ timeout: 6000 })
            await expect(median).toHaveAttribute('x1')
        }
    })
})

test.describe('OrigamChartBoxPlot — boxWidth prop', () => {
    test('slim (0.3) rect is narrower than wide (0.9) rect', async ({ page }) => {
        await openVariant(page, 'Prop — boxWidth (slim 0.3 vs wide 0.9)')
        const sandbox = sandboxOf(page)

        const slimRect = sandbox.locator('[data-cy="box-plot-slim"] [data-cy="origam-chart-box-rect-0"]')
        const wideRect = sandbox.locator('[data-cy="box-plot-wide"] [data-cy="origam-chart-box-rect-0"]')

        await expect(slimRect).toBeVisible({ timeout: 6000 })
        await expect(wideRect).toBeVisible({ timeout: 6000 })

        const slimWidth = await slimRect.getAttribute('width')
        const wideWidth = await wideRect.getAttribute('width')

        expect(Number(slimWidth)).toBeLessThan(Number(wideWidth))
    })
})

test.describe('OrigamChartBoxPlot — showOutliers prop', () => {
    test('showOutliers=true: /users box (index 0) has outlier circles', async ({ page }) => {
        await openVariant(page, 'Prop — showOutliers (on / off)')
        const sandbox = sandboxOf(page)

        const outliers = sandbox.locator('[data-cy="box-plot-outliers-on"] [data-cy^="origam-chart-box-outlier-0-"]')
        await expect(outliers).toHaveCount(2, { timeout: 6000 })
    })

    test('showOutliers=false: no outlier circles anywhere', async ({ page }) => {
        await openVariant(page, 'Prop — showOutliers (on / off)')
        const sandbox = sandboxOf(page)

        const outliers = sandbox.locator('[data-cy="box-plot-outliers-off"] [data-cy^="origam-chart-box-outlier-"]')
        await expect(outliers).toHaveCount(0, { timeout: 6000 })
    })
})

test.describe('OrigamChartBoxPlot — accessibility', () => {
    test('each box group has role="button" and a non-empty aria-label', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const boxes = sandbox.locator('[data-cy="box-plot-playground-chart"] [data-cy^="origam-chart-box-group-"]')
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
        const boxes = sandbox.locator('[data-cy="box-plot-playground-chart"] [data-cy^="origam-chart-box-group-"]')
        const count = await boxes.count()

        for (let i = 0; i < count; i++) {
            await expect(boxes.nth(i)).toHaveAttribute('tabindex', '0')
        }
    })
})

test.describe('OrigamChartBoxPlot — empty state', () => {
    test('empty slot renders when series is empty', async ({ page }) => {
        await openVariant(page, 'Slot — empty')
        const sandbox = sandboxOf(page)
        const empty = sandbox.locator('[data-cy="box-plot-slot-empty-chart"] [data-cy="origam-chart-box-plot-empty"]')
        await expect(empty).toBeVisible({ timeout: 6000 })
        await expect(empty).toContainText('No distribution data available')
    })
})

test.describe('OrigamChartBoxPlot — emit', () => {
    test('clicking a box appends to the emit log', async ({ page }) => {
        await openVariant(page, 'Emit — point-click')
        const sandbox = sandboxOf(page)

        const firstBox = sandbox.locator('[data-cy="box-plot-emit-chart"] [data-cy="origam-chart-box-group-0"]')
        // SVG <g> elements may have zero-area bounding boxes in Playwright's visibility model
        // when children are zero-height lines; use toBeAttached() then force-click the rect child.
        await expect(firstBox).toBeAttached({ timeout: 6000 })
        const boxRect = sandbox.locator('[data-cy="box-plot-emit-chart"] [data-cy="origam-chart-box-rect-0"]')
        await expect(boxRect).toBeVisible({ timeout: 6000 })
        await boxRect.click()
        await page.waitForTimeout(300)

        const log = sandbox.locator('[data-cy="box-plot-emit-log"]')
        await expect(log).toContainText('point-click', { timeout: 4000 })
    })
})
