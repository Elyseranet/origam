import { expect, test, type Page } from '@playwright/test'

import { selectHstOption, toggleHstCheckbox } from './_support/histoire-controls'

/**
 * OrigamChartSparkline — runtime probes aligned with the Histoire story at
 * packages/stories/components/stories/Chart/OrigamChartSparkline.story.vue
 * and the component at packages/ds/src/components/Chart/OrigamChartSparkline.vue.
 *
 * Navigation pattern: goto STORY + click Variant title + frameLocator sandbox.
 *
 * Story realignment (canonical Design/Functional/Events/Slots structure):
 * the story no longer passes any story-side `data-cy="sparkline-*"` fall-
 * through onto the component root, nor does it render side-by-side
 * comparison fixtures (type/markers/colors) or the stock-prices table use
 * case — all folded into (or dropped from) the single "Design" Variant's
 * controls. Root data-cy is now always the component's own hardcoded
 * "origam-chart-sparkline" (single instance per Variant); type/color/marker
 * comparisons are driven via `selectHstOption` / `toggleHstCheckbox`
 * instead of navigating to a dedicated fixture Variant. The "Use case —
 * stock prices table" Variant has no surviving equivalent at all — see the
 * `test.fixme` block below.
 *
 * data-cy resolution:
 *   - Component root (a <figure>): data-cy="origam-chart-sparkline".
 *   - Internal elements (svg, paths, circles) keep their component-hardcoded
 *     data-cy values: origam-chart-sparkline-svg, origam-chart-sparkline-line,
 *     origam-chart-sparkline-area, origam-chart-sparkline-bar-{n} (column),
 *     origam-chart-sparkline-hbar-{n} (bar/horizontal),
 *     origam-chart-sparkline-special-{min|max|last},
 *     origam-chart-sparkline-empty.
 */

const STORY = '/stories/story/components-stories-chart-origamchartsparkline-story-vue'
const ROOT = '[data-cy="origam-chart-sparkline"]'

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

            const chart = sandbox.locator(ROOT).first()
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

            await expect(sandbox.locator('[data-cy="origam-chart-sparkline"]').first()).toBeVisible({ timeout: 8000 })

            // data-cy="origam-chart-sparkline-line" is hardcoded inside the component
            const linePath = sandbox.locator('[data-cy="origam-chart-sparkline-line"]').first()
            await expect(linePath).toBeVisible()
        })

        test('last marker is visible by default', async ({ page }) => {
            await openVariant(page, 'Default')
            const sandbox = sandboxOf(page)

            await expect(sandbox.locator('[data-cy="origam-chart-sparkline"]').first()).toBeVisible({ timeout: 8000 })

            // Special marker role "last" → data-cy="origam-chart-sparkline-special-last"
            const lastMarker = sandbox.locator('[data-cy="origam-chart-sparkline-special-last"]').first()
            await expect(lastMarker).toBeVisible()
        })
    })

    // Story realignment: the old "Prop — type (line / area / column / bar)"
    // side-by-side Variant is gone — `type` is now the "Design" Variant's
    // Type HstSelect control (single instance, driven in sequence).
    test.describe('Design Variant — type control', () => {
        test('renders each of the four type variants without error', async ({ page }) => {
            await openVariant(page, 'Design')
            const sandbox = sandboxOf(page)
            const root = sandbox.locator(ROOT).first()

            for (const type of ['line', 'area', 'column', 'bar']) {
                await selectHstOption(page, 'Type', type)
                await expect(root).toBeVisible({ timeout: 8000 })
            }
        })

        test('line type renders a path element', async ({ page }) => {
            await openVariant(page, 'Design')
            const sandbox = sandboxOf(page)
            await selectHstOption(page, 'Type', 'line')

            const linePath = sandbox.locator(`${ ROOT } [data-cy="origam-chart-sparkline-line"]`).first()
            await expect(linePath).toBeVisible({ timeout: 8000 })
        })

        test('area type renders both line and area paths', async ({ page }) => {
            await openVariant(page, 'Design')
            const sandbox = sandboxOf(page)
            await selectHstOption(page, 'Type', 'area')

            const area = sandbox.locator(`${ ROOT } .origam-chart-sparkline__area`)
            const line = sandbox.locator(`${ ROOT } .origam-chart-sparkline__line`)
            await expect(area.first()).toBeVisible({ timeout: 8000 })
            await expect(line.first()).toBeVisible()
        })

        test('column type renders rect elements', async ({ page }) => {
            await openVariant(page, 'Design')
            const sandbox = sandboxOf(page)
            await selectHstOption(page, 'Type', 'column')

            const bars = sandbox.locator(`${ ROOT } .origam-chart-sparkline__bar`)
            await expect(bars.first()).toBeVisible({ timeout: 8000 })
        })

        test('bar type renders horizontal rect elements', async ({ page }) => {
            await openVariant(page, 'Design')
            const sandbox = sandboxOf(page)
            await selectHstOption(page, 'Type', 'bar')

            const hbars = sandbox.locator(`${ ROOT } .origam-chart-sparkline__bar--horizontal`)
            await expect(hbars.first()).toBeVisible({ timeout: 8000 })
        })

        test('column bars have positive height', async ({ page }) => {
            await openVariant(page, 'Design')
            const sandbox = sandboxOf(page)
            await selectHstOption(page, 'Type', 'column')

            // Component emits :data-cy="`origam-chart-sparkline-bar-${bar.index}`" on each rect
            const firstBar = sandbox.locator(`${ ROOT } [data-cy="origam-chart-sparkline-bar-0"]`).first()
            await expect(firstBar).toBeVisible({ timeout: 8000 })
            const height = await firstBar.getAttribute('height')
            expect(parseFloat(height ?? '0')).toBeGreaterThan(0)
        })
    })

    // Story realignment: the old "Prop — showMin / showMax / showLast"
    // fixture Variant is gone — these are now three HstCheckbox controls on
    // the "Design" Variant (init state: showMin=false, showMax=false,
    // showLast=true). showLast is already on by default; showMin/showMax
    // are toggled on via `toggleHstCheckbox`.
    test.describe('Design Variant — marker controls', () => {
        test('renders min and max markers once toggled on, distinct from each other', async ({ page }) => {
            await openVariant(page, 'Design')
            const sandbox = sandboxOf(page)
            await toggleHstCheckbox(page, 'Show Min')
            await toggleHstCheckbox(page, 'Show Max')
            await page.waitForTimeout(300)

            const min = sandbox.locator(`${ ROOT } [data-cy="origam-chart-sparkline-special-min"]`).first()
            const max = sandbox.locator(`${ ROOT } [data-cy="origam-chart-sparkline-special-max"]`).first()
            await expect(min).toBeVisible({ timeout: 8000 })
            await expect(max).toBeVisible()

            const minCy = await min.getAttribute('cy')
            const maxCy = await max.getAttribute('cy')
            expect(minCy).not.toBeNull()
            expect(maxCy).not.toBeNull()
            expect(minCy).not.toBe(maxCy)
        })

        test('last marker is visible by default (showLast=true on Design init-state)', async ({ page }) => {
            await openVariant(page, 'Design')
            const sandbox = sandboxOf(page)

            const lastMarker = sandbox.locator(`${ ROOT } [data-cy="origam-chart-sparkline-special-last"]`).first()
            await expect(lastMarker).toBeVisible({ timeout: 8000 })
        })
    })

    // Story realignment: the old "Prop — color (primary / success / danger)"
    // side-by-side Variant is gone — `color` is now the "Design" Variant's
    // Color HstSelect control, driven in sequence instead of comparing DOM
    // siblings.
    test.describe('Design Variant — color control', () => {
        test('renders three colour variants without error', async ({ page }) => {
            await openVariant(page, 'Design')
            const sandbox = sandboxOf(page)
            const root = sandbox.locator(ROOT).first()

            for (const color of ['Primary', 'Success', 'Danger']) {
                await selectHstOption(page, 'Color', color)
                await expect(root).toBeVisible({ timeout: 8000 })
            }
        })
    })

    // Story realignment: "Use case — stock prices table" has NO surviving
    // equivalent — OrigamChartSparkline.story.vue no longer has any
    // multi-ticker table fixture at all (Design/Functional/Events/Slots all
    // render a single sparkline instance against FIXTURE_SALES or
    // FIXTURE_VOLATILE). This is a genuine coverage gap, not a renamed
    // Variant — flagging via test.fixme rather than inventing a fixture the
    // story doesn't have. Needs a story-side decision: either reinstate a
    // "stock prices table" usage-example Variant, or accept the loss.
    test.describe('Use case — stock prices table [REMOVED FROM STORY]', () => {
        test('renders all five tickers', async ({ page }) => {
            test.fixme(true, 'Story no longer has any stock-prices-table fixture/Variant — see chart-sparkline.spec.ts header note')
            await openVariant(page, 'Default')
            const sandbox = sandboxOf(page)

            const tickers = ['aapl', 'googl', 'msft', 'tsla', 'amzn']
            for (const ticker of tickers) {
                await expect(sandbox.locator(`[data-cy="sparkline-stock-${ ticker }"]`).first()).toBeVisible()
            }
        })

        test('each stock row contains a sparkline SVG', async ({ page }) => {
            test.fixme(true, 'Story no longer has any stock-prices-table fixture/Variant — see chart-sparkline.spec.ts header note')
            await openVariant(page, 'Default')
            const sandbox = sandboxOf(page)

            const tickers = ['aapl', 'googl', 'msft', 'tsla', 'amzn']
            for (const ticker of tickers) {
                const chart = sandbox.locator(`[data-cy="sparkline-stock-chart-${ ticker }"]`).first()
                await expect(chart).toBeVisible()
                const svg = chart.locator('svg')
                await expect(svg).toBeVisible()
            }
        })

        test('table has correct accessible structure', async ({ page }) => {
            test.fixme(true, 'Story no longer has any stock-prices-table fixture/Variant — see chart-sparkline.spec.ts header note')
            await openVariant(page, 'Default')
            const sandbox = sandboxOf(page)

            await expect(sandbox.locator('[data-cy="sparkline-stocks"]').first()).toBeVisible({ timeout: 8000 })

            const table = sandbox.locator('.stock-table').first()
            const thead = table.locator('thead')
            const tbody = table.locator('tbody')
            await expect(thead).toBeVisible()
            await expect(tbody).toBeVisible()
        })
    })

    test.describe('Slots - Empty', () => {
        test('renders empty slot when series is empty', async ({ page }) => {
            await openVariant(page, 'Slots - Empty')
            const sandbox = sandboxOf(page)

            const chart = sandbox.locator(ROOT).first()
            await expect(chart).toBeVisible({ timeout: 8000 })

            // Empty state div inside the component has data-cy="origam-chart-sparkline-empty"
            const empty = sandbox.locator(`${ ROOT } [data-cy="origam-chart-sparkline-empty"]`).first()
            await expect(empty).toBeVisible({ timeout: 4000 })
        })
    })

    test.describe('Accessibility', () => {
        test('sparkline uses figure element (semantic HTML)', async ({ page }) => {
            await openVariant(page, 'Default')
            const sandbox = sandboxOf(page)

            const figure = sandbox.locator(ROOT).first()
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
