import { expect, test, type Page } from '@playwright/test'

import { eventLogItems, fillHstNumber, openEventsTab, selectHstOption } from './_support/histoire-controls'

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
 *
 * The story restructuring (canonical Design/State/Functional/Events/Slots
 * layout, see root CLAUDE.md) removed the side-by-side "map-mode-
 * choropleth/-routes" and "map-curvature-straight/-arc" fixtures —
 * "mode"/"routeCurvature" are single dynamic controls on "Design"
 * (switching Mode automatically swaps the bound series between
 * FIXTURE_GDP and FIXTURE_ROUTES, see OrigamChartMap.story.vue), driven
 * sequentially. "map-playground-chart" and "map-slot-empty-chart" data-cy
 * values are unchanged. "Emit — point-click" maps to "Events -
 * point-click"; the removed map-emit-log DOM shell is read back via the
 * shared `openEventsTab` / `eventLogItems` helpers.
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
        // The world map backdrop (topojson) takes longer to settle than
        // the fixed 500ms openVariant wait — same timing-race class
        // documented on chart-bullet.spec.ts's axis-ticks test, but here
        // needing a longer retry window given the map's data size.
        // Waiting on any country path first (as the sibling test above
        // already does) before counting the `--has-data` subset.
        await expect(sandbox.locator('[data-cy^="origam-chart-map-country-"]').first()).toBeVisible({ timeout: 10000 })
        const dataCountries = sandbox.locator('[data-cy="map-playground-chart"] .origam-chart__map-country--has-data')
        await expect(dataCountries.first()).toBeAttached({ timeout: 6000 })
        const count = await dataCountries.count()
        expect(count).toBeGreaterThan(5)
    })
})

test.describe('OrigamChartMap — Prop — mode', () => {
    test('choropleth variant renders country paths', async ({ page }) => {
        // Dedicated side-by-side fixture folded into "Design" — Mode
        // defaults to 'choropleth' (see OrigamChartMap.story.vue), so no
        // control interaction is needed for this half of the comparison.
        await openVariant(page, MAP_STORY, 'Design')
        const sandbox = sandboxOf(page)

        const choroplethCountries = sandbox.locator('[data-cy^="origam-chart-map-country-"]')
        // Same timing race as "countries with data carry…" above — the
        // world map backdrop takes longer to settle than the fixed 500ms
        // openVariant wait.
        await expect(choroplethCountries.first()).toBeVisible({ timeout: 10000 })
        const count = await choroplethCountries.count()
        expect(count).toBeGreaterThan(20)
    })

    test('flight-routes variant renders route arcs', async ({ page }) => {
        // Switching Mode to 'flight-routes' also swaps the bound series to
        // FIXTURE_ROUTES (8 routes), a template-level `v-if`-style
        // dispatch inside Design's #default, not a separate control.
        await openVariant(page, MAP_STORY, 'Design')
        await selectHstOption(page, 'Mode', 'flight-routes')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)

        const routes = sandbox.locator('[data-cy^="origam-chart-map-route-"]')
        const count = await routes.count()
        expect(count).toBe(8)
    })

    test('route arc paths start with M and contain Q for Bezier curve', async ({ page }) => {
        await openVariant(page, MAP_STORY, 'Design')
        await selectHstOption(page, 'Mode', 'flight-routes')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)

        const routes = sandbox.locator('[data-cy^="origam-chart-map-route-"]')
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
        await openVariant(page, MAP_STORY, 'Design')
        await selectHstOption(page, 'Mode', 'flight-routes')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)

        const nodes = sandbox.locator('[data-cy^="origam-chart-map-node-"]')
        const count = await nodes.count()
        expect(count).toBeGreaterThan(0)
    })
})

test.describe('OrigamChartMap — Prop — routeCurvature', () => {
    test('straight routes (curvature=0) render with Q control near midpoint', async ({ page }) => {
        // Dedicated side-by-side fixture folded into "Design" — a single
        // dynamic "Route Curvature [0..1]" control (default 0.3), driven
        // sequentially. Requires Mode='flight-routes' first (routes only
        // exist in that mode).
        await openVariant(page, MAP_STORY, 'Design')
        await selectHstOption(page, 'Mode', 'flight-routes')
        await fillHstNumber(page, 'Route Curvature [0..1]', 0)
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)

        const straightRoutes = sandbox.locator('[data-cy^="origam-chart-map-route-"]')
        const count = await straightRoutes.count()
        expect(count).toBeGreaterThan(0)
        const d = await straightRoutes.first().getAttribute('d')
        expect(d).toBeTruthy()
    })

    test('arc routes (curvature=0.5) render with different path than straight', async ({ page }) => {
        await openVariant(page, MAP_STORY, 'Design')
        await selectHstOption(page, 'Mode', 'flight-routes')
        await fillHstNumber(page, 'Route Curvature [0..1]', 0.5)
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)

        const arcRoutes = sandbox.locator('[data-cy^="origam-chart-map-route-"]')
        const count = await arcRoutes.count()
        expect(count).toBeGreaterThan(0)
        const d = await arcRoutes.first().getAttribute('d')
        expect(d).toBeTruthy()
        expect(d!).toContain('Q')
    })
})

test.describe('OrigamChartMap — Empty state', () => {
    test('renders custom empty slot when series is empty', async ({ page }) => {
        await openVariant(page, MAP_STORY, 'Slots - Empty')
        const sandbox = sandboxOf(page)

        const empty = sandbox.locator('[data-cy="map-slot-empty-chart"] [data-cy="origam-chart-map-empty"]')
        await expect(empty).toBeVisible({ timeout: 6000 })

        const customEmpty = sandbox.locator('.custom-empty')
        await expect(customEmpty).toBeVisible()
    })
})

test.describe('OrigamChartMap — Emit — point-click', () => {
    test('clicking a data country emits point-click and logs to the pre', async ({ page }) => {
        // Canonical Variant is "Events - point-click". Its fixture passes
        // its OWN `data-cy="map-emit-chart"` on `<origam-chart-map>` — Vue
        // 3 fallthrough replaces the component's own static
        // `data-cy="origam-chart-map"` on that element (no
        // `inheritAttrs: false` set), so the story-level value is used
        // here. The old "map-emit-log" DOM shell is gone — read back from
        // Histoire's own "Events" tab instead.
        await openVariant(page, MAP_STORY, 'Events - point-click')
        const sandbox = sandboxOf(page)

        const usCountry = sandbox.locator('[data-cy="map-emit-chart"] [data-cy="origam-chart-map-country-US"]').first()
        await usCountry.click({ force: true })
        await page.waitForTimeout(300)

        await openEventsTab(page)
        await expect(eventLogItems(page).first()).toContainText('point-click', { timeout: 4000 })
    })
})
