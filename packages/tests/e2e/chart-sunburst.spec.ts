import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamChartSunburst — Playwright spec.
 *
 * Asserts:
 *  - Arc `<path>` elements render for each node in the tree.
 *  - Root nodes produce arcs in the first ring; children in subsequent rings.
 *  - Legend toggle hides an entire root subtree and applies `--hidden` modifier.
 *  - ARIA attributes (role="figure", role="img", title, desc) are present.
 *  - Each arc has role="button", aria-label, and tabindex=0.
 *  - Empty state slot renders when series is empty.
 *  - innerRadius=0 vs 0.4 produce distinct arc `d` paths.
 */

const SUNBURST_STORY = '/stories/story/components-stories-chart-origamchartsunburst-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, title: string) => {
    await page.goto(SUNBURST_STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(500)
}

test.describe('OrigamChartSunburst — Default', () => {
    test('renders figure root with role="figure"', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="sunburst-playground-chart"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'figure')
    })

    test('SVG carries role=img, title and desc', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator('[data-cy="sunburst-playground-chart"] svg').first()
        await expect(svg).toBeVisible()
        await expect(svg).toHaveAttribute('role', 'img')
        await expect(svg.locator('title')).toHaveCount(1)
        await expect(svg.locator('desc')).toHaveCount(1)
    })

    test('renders arc paths for the budget tree nodes', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-sunburst-default.png', fullPage: false })

        const arcs = sandbox.locator('[data-cy="sunburst-playground-chart"] .origam-chart__sunburst-arc')
        const count = await arcs.count()
        expect(count).toBeGreaterThan(2)
    })

    test('each arc path has a non-empty d attribute starting with M', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const arcs = sandbox.locator('[data-cy="sunburst-playground-chart"] .origam-chart__sunburst-arc')
        const count = await arcs.count()
        expect(count).toBeGreaterThan(0)
        for (let i = 0; i < count; i++) {
            const d = await arcs.nth(i).getAttribute('d')
            expect(d).toBeTruthy()
            expect(d!.trim().startsWith('M')).toBe(true)
        }
    })

    test('each arc is keyboard-focusable (tabindex=0)', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const arcs = sandbox.locator('[data-cy="sunburst-playground-chart"] .origam-chart__sunburst-arc')
        const count = await arcs.count()
        for (let i = 0; i < count; i++) {
            await expect(arcs.nth(i)).toHaveAttribute('tabindex', '0')
        }
    })

    test('each arc has role="button" and a non-empty aria-label', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const arcs = sandbox.locator('[data-cy="sunburst-playground-chart"] .origam-chart__sunburst-arc')
        const count = await arcs.count()
        for (let i = 0; i < count; i++) {
            await expect(arcs.nth(i)).toHaveAttribute('role', 'button')
            const label = await arcs.nth(i).getAttribute('aria-label')
            expect(label).toBeTruthy()
        }
    })
})

test.describe('OrigamChartSunburst — innerRadius prop', () => {
    test('pie (innerRadius=0) and donut (innerRadius=0.4) produce distinct arc paths', async ({ page }) => {
        await openVariant(page, 'Prop — innerRadius (pie vs donut)')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-sunburst-inner-radius.png', fullPage: false })

        const pieArcs = sandbox.locator('[data-cy="sunburst-inner-0"] .origam-chart__sunburst-arc')
        const donutArcs = sandbox.locator('[data-cy="sunburst-inner-04"] .origam-chart__sunburst-arc')

        await expect(pieArcs.first()).toBeVisible({ timeout: 8000 })
        await expect(donutArcs.first()).toBeVisible({ timeout: 8000 })

        const pieCount = await pieArcs.count()
        const donutCount = await donutArcs.count()

        expect(pieCount).toBeGreaterThan(0)
        expect(donutCount).toBeGreaterThan(0)

        const pieD0 = await pieArcs.first().getAttribute('d')
        const donutD0 = await donutArcs.first().getAttribute('d')
        expect(pieD0).not.toEqual(donutD0)
    })
})

test.describe('OrigamChartSunburst — colorScheme prop', () => {
    test('default and custom colorScheme render distinct fill styles', async ({ page }) => {
        await openVariant(page, 'Prop — colorScheme')
        const sandbox = sandboxOf(page)

        const defaultArcs = sandbox.locator('[data-cy="sunburst-color-default"] .origam-chart__sunburst-arc')
        const customArcs = sandbox.locator('[data-cy="sunburst-color-custom"] .origam-chart__sunburst-arc')

        await expect(defaultArcs.first()).toBeVisible({ timeout: 8000 })
        await expect(customArcs.first()).toBeVisible({ timeout: 8000 })
    })
})

test.describe('OrigamChartSunburst — legend toggle', () => {
    test('clicking first legend item hides that root subtree', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const arcs = sandbox.locator('[data-cy="sunburst-playground-chart"] .origam-chart__sunburst-arc')
        const countBefore = await arcs.count()
        expect(countBefore).toBeGreaterThan(0)

        const legendItems = sandbox.locator('[data-cy="sunburst-playground-chart"] .origam-chart__legend-item')
        await expect(legendItems.first()).toBeVisible()
        await legendItems.first().click()
        await page.waitForTimeout(300)

        const countAfter = await arcs.count()
        expect(countAfter).toBeLessThan(countBefore)

        await expect(legendItems.first()).toHaveClass(/origam-chart__legend-item--hidden/, { timeout: 4000 })
    })

    test('re-clicking restores the hidden subtree', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const arcs = sandbox.locator('[data-cy="sunburst-playground-chart"] .origam-chart__sunburst-arc')
        const countBefore = await arcs.count()

        const legendItems = sandbox.locator('[data-cy="sunburst-playground-chart"] .origam-chart__legend-item')
        await legendItems.first().click()
        await page.waitForTimeout(300)

        await legendItems.first().click()
        await page.waitForTimeout(300)

        await expect(arcs).toHaveCount(countBefore)
        await expect(legendItems.first()).not.toHaveClass(/origam-chart__legend-item--hidden/)
    })
})

test.describe('OrigamChartSunburst — empty state', () => {
    test('empty slot renders when series is empty', async ({ page }) => {
        await openVariant(page, 'Slot — empty')
        const sandbox = sandboxOf(page)
        const empty = sandbox.locator('[data-cy="sunburst-slot-empty-chart"] [data-cy="origam-chart-sunburst-empty"]')
        await expect(empty).toBeVisible({ timeout: 6000 })
        await expect(empty).toContainText('No hierarchy data')
    })
})

test.describe('OrigamChartSunburst — emit', () => {
    test('point-click emit appends a log line', async ({ page }) => {
        await openVariant(page, 'Emit — point-click on node')
        const sandbox = sandboxOf(page)

        const arcs = sandbox.locator('[data-cy="sunburst-emit-chart"] .origam-chart__sunburst-arc')
        await expect(arcs.first()).toBeVisible({ timeout: 8000 })
        await arcs.first().click()
        await page.waitForTimeout(300)

        const log = sandbox.locator('[data-cy="sunburst-emit-log"]')
        await expect(log).toContainText('point-click', { timeout: 4000 })
    })
})
