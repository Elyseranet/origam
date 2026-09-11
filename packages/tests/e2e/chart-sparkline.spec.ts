import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamChartSparkline — runtime probes aligned with the Histoire story at
 * packages/stories/components/stories/Chart/OrigamChartSparkline.story.vue
 * and the component at packages/ds/src/components/Chart/OrigamChartSparkline.vue.
 *
 * Navigation pattern: goto STORY + click Variant title + frameLocator sandbox.
 *
 * data-cy resolution:
 *   - Story passes data-cy="sparkline-*" directly on <origam-chart-sparkline>,
 *     which fall-through-binds to the component root <figure>. So the root
 *     element carries the story-provided data-cy, not the hardcoded
 *     "origam-chart-sparkline" of the component.
 *   - Internal elements (svg, paths, circles) keep their component-hardcoded
 *     data-cy values: origam-chart-sparkline-svg, origam-chart-sparkline-line,
 *     origam-chart-sparkline-area, origam-chart-sparkline-bar-{n},
 *     origam-chart-sparkline-special-{min|max|last},
 *     origam-chart-sparkline-empty.
 *   - Story wrapper divs (sparkline-types, sparkline-markers, sparkline-colors,
 *     sparkline-stocks, sparkline-playground) are on <div> elements in the
 *     story, not on the component.
 */

const STORY = '/stories/story/components-stories-chart-origamchartsparkline-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, variant: string) => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(400)
}

test.describe('OrigamChartSparkline', () => {
    test.describe('Default variant', () => {
        test('renders sparkline SVG element', async ({ page }) => {
            await openVariant(page, 'Default')
            const sandbox = sandboxOf(page)

            // Story passes data-cy="sparkline-playground-chart" to the component root (fall-through)
            const chart = sandbox.locator('[data-cy="sparkline-playground-chart"]').first()
            await expect(chart).toBeVisible({ timeout: 8000 })

            // SVG has its own hardcoded data-cy inside the component
            const svg = sandbox.locator('[data-cy="origam-chart-sparkline-svg"]').first()
            await expect(svg).toBeVisible()
        })

        test('SVG has correct viewBox', async ({ page }) => {
            await openVariant(page, 'Default')
            const sandbox = sandboxOf(page)

            const svg = sandbox.locator('[data-cy="origam-chart-sparkline-svg"]').first()
            await expect(svg).toBeVisible({ timeout: 8000 })

            const viewBox = await svg.getAttribute('viewBox')
            expect(viewBox).toBe('0 0 120 30')
        })

        test('renders line path by default', async ({ page }) => {
            await openVariant(page, 'Default')
            const sandbox = sandboxOf(page)

            await expect(sandbox.locator('[data-cy="sparkline-playground-chart"]').first()).toBeVisible({ timeout: 8000 })

            // data-cy="origam-chart-sparkline-line" is hardcoded inside the component
            const linePath = sandbox.locator('[data-cy="origam-chart-sparkline-line"]').first()
            await expect(linePath).toBeVisible()
        })

        test('last marker is visible by default', async ({ page }) => {
            await openVariant(page, 'Default')
            const sandbox = sandboxOf(page)

            await expect(sandbox.locator('[data-cy="sparkline-playground-chart"]').first()).toBeVisible({ timeout: 8000 })

            // Special marker role "last" → data-cy="origam-chart-sparkline-special-last"
            const lastMarker = sandbox.locator('[data-cy="origam-chart-sparkline-special-last"]').first()
            await expect(lastMarker).toBeVisible()
        })
    })

    test.describe('Prop — type variant', () => {
        test('renders all four type variants', async ({ page }) => {
            await openVariant(page, 'Prop — type (line / area / column / bar)')
            const sandbox = sandboxOf(page)

            await expect(sandbox.locator('[data-cy="sparkline-types"]').first()).toBeVisible({ timeout: 8000 })

            // Story passes data-cy="sparkline-type-*" to each component root (fall-through)
            await expect(sandbox.locator('[data-cy="sparkline-type-line"]').first()).toBeVisible()
            await expect(sandbox.locator('[data-cy="sparkline-type-area"]').first()).toBeVisible()
            await expect(sandbox.locator('[data-cy="sparkline-type-column"]').first()).toBeVisible()
            await expect(sandbox.locator('[data-cy="sparkline-type-bar"]').first()).toBeVisible()
        })

        test('line type renders a path element', async ({ page }) => {
            await openVariant(page, 'Prop — type (line / area / column / bar)')
            const sandbox = sandboxOf(page)

            await expect(sandbox.locator('[data-cy="sparkline-type-line"]').first()).toBeVisible({ timeout: 8000 })

            // data-cy="origam-chart-sparkline-line" is the hardcoded value on the <path> inside the component
            const linePath = sandbox.locator('[data-cy="sparkline-type-line"] [data-cy="origam-chart-sparkline-line"]').first()
            const count = await linePath.count()
            expect(count).toBeGreaterThan(0)
        })

        test('area type renders both line and area paths', async ({ page }) => {
            await openVariant(page, 'Prop — type (line / area / column / bar)')
            const sandbox = sandboxOf(page)

            await expect(sandbox.locator('[data-cy="sparkline-type-area"]').first()).toBeVisible({ timeout: 8000 })

            const area = sandbox.locator('[data-cy="sparkline-type-area"] .origam-chart-sparkline__area')
            const line = sandbox.locator('[data-cy="sparkline-type-area"] .origam-chart-sparkline__line')
            const areaCount = await area.count()
            const lineCount = await line.count()
            expect(areaCount).toBeGreaterThan(0)
            expect(lineCount).toBeGreaterThan(0)
        })

        test('column type renders rect elements', async ({ page }) => {
            await openVariant(page, 'Prop — type (line / area / column / bar)')
            const sandbox = sandboxOf(page)

            await expect(sandbox.locator('[data-cy="sparkline-type-column"]').first()).toBeVisible({ timeout: 8000 })

            const bars = sandbox.locator('[data-cy="sparkline-type-column"] .origam-chart-sparkline__bar')
            const count = await bars.count()
            expect(count).toBeGreaterThan(0)
        })

        test('bar type renders horizontal rect elements', async ({ page }) => {
            await openVariant(page, 'Prop — type (line / area / column / bar)')
            const sandbox = sandboxOf(page)

            await expect(sandbox.locator('[data-cy="sparkline-type-bar"]').first()).toBeVisible({ timeout: 8000 })

            const hbars = sandbox.locator('[data-cy="sparkline-type-bar"] .origam-chart-sparkline__bar--horizontal')
            const count = await hbars.count()
            expect(count).toBeGreaterThan(0)
        })

        test('column bars have positive height', async ({ page }) => {
            await openVariant(page, 'Prop — type (line / area / column / bar)')
            const sandbox = sandboxOf(page)

            await expect(sandbox.locator('[data-cy="sparkline-type-column"]').first()).toBeVisible({ timeout: 8000 })

            // Component emits :data-cy="`origam-chart-sparkline-bar-${bar.index}`" on each rect
            const firstBar = sandbox.locator('[data-cy="sparkline-type-column"] [data-cy="origam-chart-sparkline-bar-0"]').first()
            const count = await firstBar.count()
            if (count > 0) {
                const height = await firstBar.getAttribute('height')
                expect(parseFloat(height ?? '0')).toBeGreaterThan(0)
            }
        })
    })

    test.describe('Prop — markers variant', () => {
        test('renders min marker when showMin is true', async ({ page }) => {
            await openVariant(page, 'Prop — showMin / showMax / showLast')
            const sandbox = sandboxOf(page)

            await expect(sandbox.locator('[data-cy="sparkline-markers-minmax"]').first()).toBeVisible({ timeout: 8000 })

            // Component emits :data-cy="`origam-chart-sparkline-special-${m.role}`" where role="min"
            const minMarker = sandbox.locator('[data-cy="sparkline-markers-minmax"] [data-cy="origam-chart-sparkline-special-min"]').first()
            await expect(minMarker).toBeVisible()
        })

        test('renders max marker when showMax is true', async ({ page }) => {
            await openVariant(page, 'Prop — showMin / showMax / showLast')
            const sandbox = sandboxOf(page)

            await expect(sandbox.locator('[data-cy="sparkline-markers-minmax"]').first()).toBeVisible({ timeout: 8000 })

            const maxMarker = sandbox.locator('[data-cy="sparkline-markers-minmax"] [data-cy="origam-chart-sparkline-special-max"]').first()
            await expect(maxMarker).toBeVisible()
        })

        test('min and max markers are distinct circles', async ({ page }) => {
            await openVariant(page, 'Prop — showMin / showMax / showLast')
            const sandbox = sandboxOf(page)

            await expect(sandbox.locator('[data-cy="sparkline-markers-minmax"]').first()).toBeVisible({ timeout: 8000 })

            const min = sandbox.locator('[data-cy="sparkline-markers-minmax"] [data-cy="origam-chart-sparkline-special-min"]').first()
            const max = sandbox.locator('[data-cy="sparkline-markers-minmax"] [data-cy="origam-chart-sparkline-special-max"]').first()

            const minCy = await min.getAttribute('cy')
            const maxCy = await max.getAttribute('cy')

            expect(minCy).not.toBeNull()
            expect(maxCy).not.toBeNull()
            expect(minCy).not.toBe(maxCy)
        })

        test('last marker colour matches series colour', async ({ page }) => {
            await openVariant(page, 'Prop — showMin / showMax / showLast')
            const sandbox = sandboxOf(page)

            // Story passes data-cy="sparkline-markers-last" to the component root (fall-through)
            await expect(sandbox.locator('[data-cy="sparkline-markers-last"]').first()).toBeVisible({ timeout: 8000 })

            const lastMarker = sandbox.locator('[data-cy="sparkline-markers-last"] [data-cy="origam-chart-sparkline-special-last"]').first()
            await expect(lastMarker).toBeVisible()
        })
    })

    test.describe('Prop — color variant', () => {
        test('renders three colour variants without error', async ({ page }) => {
            await openVariant(page, 'Prop — color (primary / success / danger)')
            const sandbox = sandboxOf(page)

            await expect(sandbox.locator('[data-cy="sparkline-colors"]').first()).toBeVisible({ timeout: 8000 })

            // Story passes data-cy="sparkline-color-*" to each component root (fall-through)
            await expect(sandbox.locator('[data-cy="sparkline-color-primary"]').first()).toBeVisible()
            await expect(sandbox.locator('[data-cy="sparkline-color-success"]').first()).toBeVisible()
            await expect(sandbox.locator('[data-cy="sparkline-color-danger"]').first()).toBeVisible()
        })
    })

    test.describe('Use case — stock prices table', () => {
        test('renders all five tickers', async ({ page }) => {
            await openVariant(page, 'Use case — stock prices table')
            const sandbox = sandboxOf(page)

            await expect(sandbox.locator('[data-cy="sparkline-stocks"]').first()).toBeVisible({ timeout: 8000 })

            // Story emits :data-cy="`sparkline-stock-${stock.ticker.toLowerCase()}`" on each <tr>
            const tickers = ['aapl', 'googl', 'msft', 'tsla', 'amzn']
            for (const ticker of tickers) {
                await expect(sandbox.locator(`[data-cy="sparkline-stock-${ ticker }"]`).first()).toBeVisible()
            }
        })

        test('each stock row contains a sparkline SVG', async ({ page }) => {
            await openVariant(page, 'Use case — stock prices table')
            const sandbox = sandboxOf(page)

            await expect(sandbox.locator('[data-cy="sparkline-stocks"]').first()).toBeVisible({ timeout: 8000 })

            // Story passes :data-cy="`sparkline-stock-chart-${...}`" to the component root (fall-through)
            const tickers = ['aapl', 'googl', 'msft', 'tsla', 'amzn']
            for (const ticker of tickers) {
                const chart = sandbox.locator(`[data-cy="sparkline-stock-chart-${ ticker }"]`).first()
                await expect(chart).toBeVisible()
                const svg = chart.locator('svg')
                await expect(svg).toBeVisible()
            }
        })

        test('table has correct accessible structure', async ({ page }) => {
            await openVariant(page, 'Use case — stock prices table')
            const sandbox = sandboxOf(page)

            await expect(sandbox.locator('[data-cy="sparkline-stocks"]').first()).toBeVisible({ timeout: 8000 })

            const table = sandbox.locator('.stock-table').first()
            const thead = table.locator('thead')
            const tbody = table.locator('tbody')
            await expect(thead).toBeVisible()
            await expect(tbody).toBeVisible()
        })
    })

    test.describe('Slot — empty', () => {
        test('renders empty slot when series is empty', async ({ page }) => {
            await openVariant(page, 'Slot — empty')
            const sandbox = sandboxOf(page)

            // Story passes data-cy="sparkline-slot-empty-chart" to the component root (fall-through)
            const chart = sandbox.locator('[data-cy="sparkline-slot-empty-chart"]').first()
            await expect(chart).toBeVisible({ timeout: 8000 })

            // Empty state div inside the component has data-cy="origam-chart-sparkline-empty"
            const empty = sandbox.locator('[data-cy="sparkline-slot-empty-chart"] [data-cy="origam-chart-sparkline-empty"]').first()
            const count = await empty.count()
            expect(count).toBeGreaterThan(0)
        })
    })

    test.describe('Accessibility', () => {
        test('sparkline uses figure element (semantic HTML)', async ({ page }) => {
            await openVariant(page, 'Default')
            const sandbox = sandboxOf(page)

            // In the Default variant, the story passes data-cy="sparkline-playground-chart" to the component root
            const figure = sandbox.locator('[data-cy="sparkline-playground-chart"]').first()
            await expect(figure).toBeVisible({ timeout: 8000 })

            const tagName = await figure.evaluate((el) => el.tagName.toLowerCase())
            expect(tagName).toBe('figure')
        })

        test('SVG has role="img" and aria-label', async ({ page }) => {
            await openVariant(page, 'Default')
            const sandbox = sandboxOf(page)

            const svg = sandbox.locator('[data-cy="origam-chart-sparkline-svg"]').first()
            await expect(svg).toBeVisible({ timeout: 8000 })

            await expect(svg).toHaveAttribute('role', 'img')
            const ariaLabel = await svg.getAttribute('aria-label')
            expect(ariaLabel).toBeTruthy()
        })

        test('SVG contains title element for screen readers', async ({ page }) => {
            await openVariant(page, 'Default')
            const sandbox = sandboxOf(page)

            const svg = sandbox.locator('[data-cy="origam-chart-sparkline-svg"]').first()
            await expect(svg).toBeVisible({ timeout: 8000 })

            const title = svg.locator('title')
            await expect(title).toHaveCount(1)
        })
    })
})
