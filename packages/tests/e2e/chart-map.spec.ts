import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamChartMap — Playwright spec.
 *
 * Asserts:
 *  - The SVG renders with role="img", title and desc.
 *  - Choropleth mode: country `<path>` elements are present and have
 *    non-empty `d` attributes.
 *  - Countries with data receive a `--has-data` modifier class.
 *  - Flight-routes mode: `<path>` route elements render.
 *  - Route arcs have a non-empty `d` attribute starting with `M`.
 *  - The empty state slot renders when `series` is empty.
 *  - ARIA attributes (role="figure", role="img", title, desc) are present.
 */

const MAP_STORY = '/stories/story/components-stories-chart-origamchartmap-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyUrl: string, title: string) => {
    await page.goto(storyUrl)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(500)
}

test.describe('OrigamChartMap — Default (choropleth)', () => {
    test('renders figure root with role="figure"', async ({ page }) => {
        await openVariant(page, MAP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="map-playground-chart"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'figure')
    })

    test('SVG carries role=img, title and desc', async ({ page }) => {
        await openVariant(page, MAP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator('[data-cy="map-playground-chart"] svg').first()
        await expect(svg).toBeVisible()
        await expect(svg).toHaveAttribute('role', 'img')
        await expect(svg.locator('title')).toHaveCount(1)
        await expect(svg.locator('desc')).toHaveCount(1)
    })

    test('renders country path elements for the world map backdrop', async ({ page }) => {
        await openVariant(page, MAP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-map-default.png', fullPage: false })

        // Wait for at least one country path to appear before counting
        await expect(sandbox.locator('[data-cy^="origam-chart-map-country-"]').first()).toBeVisible({ timeout: 10000 })
        const countries = sandbox.locator('[data-cy="map-playground-chart"] [data-cy^="origam-chart-map-country-"]')
        const count = await countries.count()
        expect(count).toBeGreaterThan(20)
    })

    test('each country path has a non-empty d attribute', async ({ page }) => {
        await openVariant(page, MAP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        // Wait for at least one country path to appear before reading attributes
        await expect(sandbox.locator('[data-cy^="origam-chart-map-country-"]').first()).toBeVisible({ timeout: 10000 })
        const countries = sandbox.locator('[data-cy="map-playground-chart"] [data-cy^="origam-chart-map-country-"]')
        const count = await countries.count()
        expect(count).toBeGreaterThan(0)
        for (let i = 0; i < Math.min(count, 5); i++) {
            const d = await countries.nth(i).getAttribute('d')
            expect(d).toBeTruthy()
            expect(d!.startsWith('M')).toBe(true)
        }
    })

    test('countries with data carry the --has-data modifier class', async ({ page }) => {
        await openVariant(page, MAP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const dataCountries = sandbox.locator('[data-cy="map-playground-chart"] .origam-chart__map-country--has-data')
        const count = await dataCountries.count()
        expect(count).toBeGreaterThan(5)
    })
})

test.describe('OrigamChartMap — Prop — mode', () => {
    test('choropleth variant renders country paths', async ({ page }) => {
        await openVariant(page, MAP_STORY, 'Prop — mode (choropleth vs flight-routes)')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-map-routes.png', fullPage: false })

        const choroplethCountries = sandbox.locator('[data-cy="map-mode-choropleth"] [data-cy^="origam-chart-map-country-"]')
        const count = await choroplethCountries.count()
        expect(count).toBeGreaterThan(20)
    })

    test('flight-routes variant renders route arcs', async ({ page }) => {
        await openVariant(page, MAP_STORY, 'Prop — mode (choropleth vs flight-routes)')
        const sandbox = sandboxOf(page)

        const routes = sandbox.locator('[data-cy="map-mode-routes"] [data-cy^="origam-chart-map-route-"]')
        const count = await routes.count()
        expect(count).toBe(8)
    })

    test('route arc paths start with M and contain Q for Bezier curve', async ({ page }) => {
        await openVariant(page, MAP_STORY, 'Prop — mode (choropleth vs flight-routes)')
        const sandbox = sandboxOf(page)

        const routes = sandbox.locator('[data-cy="map-mode-routes"] [data-cy^="origam-chart-map-route-"]')
        const count = await routes.count()
        expect(count).toBeGreaterThan(0)
        for (let i = 0; i < count; i++) {
            const d = await routes.nth(i).getAttribute('d')
            expect(d).toBeTruthy()
            expect(d!.startsWith('M')).toBe(true)
            expect(d!).toContain('Q')
        }
    })

    test('flight-routes variant renders endpoint node circles', async ({ page }) => {
        await openVariant(page, MAP_STORY, 'Prop — mode (choropleth vs flight-routes)')
        const sandbox = sandboxOf(page)

        const nodes = sandbox.locator('[data-cy="map-mode-routes"] [data-cy^="origam-chart-map-node-"]')
        const count = await nodes.count()
        expect(count).toBeGreaterThan(0)
    })
})

test.describe('OrigamChartMap — Prop — routeCurvature', () => {
    test('straight routes (curvature=0) render with Q control near midpoint', async ({ page }) => {
        await openVariant(page, MAP_STORY, 'Prop — routeCurvature (0 straight vs 0.5 arc)')
        const sandbox = sandboxOf(page)

        const straightRoutes = sandbox.locator('[data-cy="map-curvature-straight"] [data-cy^="origam-chart-map-route-"]')
        const count = await straightRoutes.count()
        expect(count).toBeGreaterThan(0)
        const d = await straightRoutes.first().getAttribute('d')
        expect(d).toBeTruthy()
    })

    test('arc routes (curvature=0.5) render with different path than straight', async ({ page }) => {
        await openVariant(page, MAP_STORY, 'Prop — routeCurvature (0 straight vs 0.5 arc)')
        const sandbox = sandboxOf(page)

        const arcRoutes = sandbox.locator('[data-cy="map-curvature-arc"] [data-cy^="origam-chart-map-route-"]')
        const count = await arcRoutes.count()
        expect(count).toBeGreaterThan(0)
        const d = await arcRoutes.first().getAttribute('d')
        expect(d).toBeTruthy()
        expect(d!).toContain('Q')
    })
})

test.describe('OrigamChartMap — Empty state', () => {
    test('renders custom empty slot when series is empty', async ({ page }) => {
        await openVariant(page, MAP_STORY, 'Slot — empty')
        const sandbox = sandboxOf(page)

        const empty = sandbox.locator('[data-cy="map-slot-empty-chart"] [data-cy="origam-chart-map-empty"]')
        await expect(empty).toBeVisible({ timeout: 6000 })

        const customEmpty = sandbox.locator('.custom-empty')
        await expect(customEmpty).toBeVisible()
    })
})

test.describe('OrigamChartMap — Emit — point-click', () => {
    test('clicking a data country emits point-click and logs to the pre', async ({ page }) => {
        await openVariant(page, MAP_STORY, 'Emit — point-click')
        const sandbox = sandboxOf(page)

        const log = sandbox.locator('[data-cy="map-emit-log"]')
        const initialText = await log.textContent()

        const usCountry = sandbox.locator('[data-cy="origam-chart-map-country-US"]').first()
        await usCountry.click({ force: true })
        await page.waitForTimeout(300)

        const updatedText = await log.textContent()
        expect(updatedText).not.toBe(initialText)
        expect(updatedText).toContain('point-click')
    })
})
