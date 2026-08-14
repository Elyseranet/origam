import { expect, test, type Page } from '@playwright/test'

import { eventLogItems, fillHstNumber, openEventsTab } from './_support/histoire-controls'

/**
 * OrigamChartSankey — Playwright spec.
 *
 * Asserts:
 *  - N node `<rect>` elements render for N unique node names.
 *  - N link `<path>` elements render for N data entries.
 *  - Node rects carry non-empty `x`, `y`, `width`, `height` attributes.
 *  - Link paths carry a non-empty `d` attribute starting with `M`.
 *  - ARIA attributes (role="figure", role="img", title, desc) are present.
 *  - Empty state slot renders when series is empty.
 *  - point-click emit fires when a node or link is activated.
 *  - Label text elements render when showLabel is true.
 *  - Compact vs spaced node sizing produces visually distinct widths.
 *  - linkOpacity is applied as a fill-opacity style attribute on link paths (filled ribbons, not stroked).
 *
 * Story realignment (canonical Design/Functional/Events/Slots structure):
 * the old per-prop `Prop — …` Variants were folded into the `Functional`
 * Variant's Node Width / Node Padding / Link Opacity controls (HstNumber).
 * There is no longer a side-by-side compact/spaced fixture — each is
 * exercised as a single instance via the shared control helper. The old
 * bespoke `[data-cy="…-log"]` event log shell is gone too; emits are read
 * back from Histoire's own "Events" tab (see `openEventsTab` /
 * `eventLogItems` in `_support/histoire-controls.ts`).
 */

const SANKEY_STORY = '/stories/story/components-stories-chart-origamchartsankey-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyUrl: string, title: string) => {
    await page.goto(storyUrl)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(500)
}

test.describe('OrigamChartSankey — Default', () => {
    test('renders figure root with role="figure"', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="origam-chart-sankey"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'figure')
    })

    test('SVG carries role=img, title and desc', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator('[data-cy="origam-chart-sankey"] svg').first()
        await expect(svg).toBeVisible({ timeout: 8000 })
        await expect(svg).toHaveAttribute('role', 'img')
        await expect(svg.locator('title')).toHaveCount(1)
        await expect(svg.locator('desc')).toHaveCount(1)
    })

    test('renders 7 node rects for the web funnel fixture (7 unique nodes)', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Default')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-sankey-default.png', fullPage: false })

        // FIXTURE_WEB_FUNNEL unique nodes: Home, Catalogue, Cart, Exit, Checkout, Success, Failure = 7
        const nodes = sandbox.locator('[data-cy="origam-chart-sankey"] [data-cy^="origam-chart-sankey-node-"]')
        await expect(nodes).toHaveCount(7, { timeout: 8000 })
    })

    test('renders 7 link paths for the web funnel fixture (7 data entries)', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Default')
        const sandbox = sandboxOf(page)

        const links = sandbox.locator('[data-cy="origam-chart-sankey"] [data-cy^="origam-chart-sankey-link-"]')
        await expect(links).toHaveCount(7, { timeout: 8000 })
    })

    test('each link path has a non-empty d attribute starting with M', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const links = sandbox.locator('[data-cy="origam-chart-sankey"] [data-cy^="origam-chart-sankey-link-"]')
        await expect(links).toHaveCount(7, { timeout: 8000 })
        const count = await links.count()
        for (let i = 0; i < count; i++) {
            const d = await links.nth(i).getAttribute('d')
            expect(d).toBeTruthy()
            expect(d!.startsWith('M')).toBe(true)
        }
    })

    test('each node rect has positive width and height attributes', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const nodes = sandbox.locator('[data-cy="origam-chart-sankey"] [data-cy^="origam-chart-sankey-node-"]')
        await expect(nodes).toHaveCount(7, { timeout: 8000 })
        const count = await nodes.count()
        for (let i = 0; i < count; i++) {
            const width = await nodes.nth(i).getAttribute('width')
            const height = await nodes.nth(i).getAttribute('height')
            expect(Number(width)).toBeGreaterThan(0)
            expect(Number(height)).toBeGreaterThan(0)
        }
    })
})

test.describe('OrigamChartSankey — energy budget fixture', () => {
    // Story realignment: FIXTURE_ENERGY is no longer part of a dedicated
    // "compact vs spaced" comparison Variant — it now lives on "Slots -
    // node-label". Fixture content (7 unique nodes / 6 flows) is unchanged.
    test('renders 7 node rects for the energy budget fixture (7 unique nodes)', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Slots - node-label')
        const sandbox = sandboxOf(page)

        // FIXTURE_ENERGY unique nodes: Solar, Wind, Nuclear, Grid, Residential, Industrial, Commercial = 7
        const nodes = sandbox.locator('[data-cy="origam-chart-sankey"] [data-cy^="origam-chart-sankey-node-"]')
        await expect(nodes).toHaveCount(7, { timeout: 8000 })
    })

    test('renders 6 link paths for the energy budget fixture (6 data entries)', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Slots - node-label')
        const sandbox = sandboxOf(page)

        const links = sandbox.locator('[data-cy="origam-chart-sankey"] [data-cy^="origam-chart-sankey-link-"]')
        await expect(links).toHaveCount(6, { timeout: 8000 })
    })
})

test.describe('OrigamChartSankey — nodeWidth / nodePadding', () => {
    // Story realignment: the old side-by-side "compact vs spaced" fixture
    // was folded into the "Functional" Variant's Node Width HstNumber
    // control (init value 16). Compared here as two separate instances
    // (two page loads) instead of two DOM siblings.
    test('compact node width (8) and spaced node width (32) are distinct', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Functional')
        const sandboxCompact = sandboxOf(page)
        await fillHstNumber(page, 'Node Width', 8)
        await page.waitForTimeout(300)
        const compactNodes = sandboxCompact.locator('[data-cy="origam-chart-sankey"] [data-cy^="origam-chart-sankey-node-"]')
        await expect(compactNodes.first()).toBeVisible({ timeout: 8000 })
        const compactWidth = await compactNodes.first().getAttribute('width')

        await openVariant(page, SANKEY_STORY, 'Functional')
        const sandboxSpaced = sandboxOf(page)
        await fillHstNumber(page, 'Node Width', 32)
        await page.waitForTimeout(300)
        const spacedNodes = sandboxSpaced.locator('[data-cy="origam-chart-sankey"] [data-cy^="origam-chart-sankey-node-"]')
        await expect(spacedNodes.first()).toBeVisible({ timeout: 8000 })
        const spacedWidth = await spacedNodes.first().getAttribute('width')

        expect(Number(compactWidth)).toBeLessThan(Number(spacedWidth))
    })
})

test.describe('OrigamChartSankey — accessibility', () => {
    test('each node has role="button" and a non-empty aria-label', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const nodes = sandbox.locator('[data-cy="origam-chart-sankey"] [data-cy^="origam-chart-sankey-node-"]')
        const count = await nodes.count()
        for (let i = 0; i < count; i++) {
            await expect(nodes.nth(i)).toHaveAttribute('role', 'button')
            const label = await nodes.nth(i).getAttribute('aria-label')
            expect(label).toBeTruthy()
        }
    })

    test('each link has role="button" and a non-empty aria-label', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const links = sandbox.locator('[data-cy="origam-chart-sankey"] [data-cy^="origam-chart-sankey-link-"]')
        const count = await links.count()
        for (let i = 0; i < count; i++) {
            await expect(links.nth(i)).toHaveAttribute('role', 'button')
            const label = await links.nth(i).getAttribute('aria-label')
            expect(label).toBeTruthy()
        }
    })

    test('each node is keyboard-focusable (tabindex=0)', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const nodes = sandbox.locator('[data-cy="origam-chart-sankey"] [data-cy^="origam-chart-sankey-node-"]')
        const count = await nodes.count()
        for (let i = 0; i < count; i++) {
            await expect(nodes.nth(i)).toHaveAttribute('tabindex', '0')
        }
    })

    test('each link is keyboard-focusable (tabindex=0)', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const links = sandbox.locator('[data-cy="origam-chart-sankey"] [data-cy^="origam-chart-sankey-link-"]')
        const count = await links.count()
        for (let i = 0; i < count; i++) {
            await expect(links.nth(i)).toHaveAttribute('tabindex', '0')
        }
    })
})

test.describe('OrigamChartSankey — labels', () => {
    test('label text elements are present when showLabel is true (default)', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Default')
        const sandbox = sandboxOf(page)
        // One label per node: FIXTURE_WEB_FUNNEL has 7 unique nodes
        const labels = sandbox.locator('[data-cy="origam-chart-sankey"] [data-cy^="origam-chart-sankey-label-"]')
        await expect(labels).toHaveCount(7, { timeout: 6000 })
    })
})

test.describe('OrigamChartSankey — emit', () => {
    // Story realignment: the bespoke `[data-cy="sankey-emit-log"]` shell is
    // gone — emits are read back from Histoire's own "Events" tab (see
    // `openEventsTab` / `eventLogItems`).
    test('clicking a node appends a point-click line to the log', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Events - point-click')
        const sandbox = sandboxOf(page)

        const nodes = sandbox.locator('[data-cy^="origam-chart-sankey-node-"]')
        await expect(nodes.first()).toBeVisible({ timeout: 8000 })
        await nodes.first().click()
        await page.waitForTimeout(300)

        await openEventsTab(page)
        await expect(eventLogItems(page).first()).toContainText('point-click', { timeout: 4000 })
    })

    test('clicking a link appends a point-click line to the log', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Events - point-click')
        const sandbox = sandboxOf(page)

        const links = sandbox.locator('[data-cy^="origam-chart-sankey-link-"]')
        await expect(links.first()).toBeVisible({ timeout: 8000 })
        await links.first().click()
        await page.waitForTimeout(300)

        await openEventsTab(page)
        await expect(eventLogItems(page).first()).toContainText('point-click', { timeout: 4000 })
    })
})

test.describe('OrigamChartSankey — empty state', () => {
    test('empty slot renders when series is empty', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Slots - empty')
        const sandbox = sandboxOf(page)
        const empty = sandbox.locator('[data-cy="origam-chart-sankey-empty"]')
        await expect(empty).toBeVisible({ timeout: 6000 })
        await expect(empty).toContainText('No flow data')
    })
})

test.describe('OrigamChartSankey — linkOpacity', () => {
    // Story realignment: the old side-by-side "translucent vs opaque"
    // fixture was folded into the "Functional" Variant's Link Opacity
    // HstNumber control (init value 0.4) — its default already exercises a
    // non-1 opacity, so no control change is needed to assert the style is
    // applied.
    test('link paths carry a fillOpacity style attribute', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Functional')
        const sandbox = sandboxOf(page)

        // The sankey renders links as filled ribbons (fill + fill-opacity, stroke: none),
        // not stroked paths. The linkOpacity prop is applied as fill-opacity on the path style.
        const links = sandbox.locator('[data-cy="origam-chart-sankey"] [data-cy^="origam-chart-sankey-link-"]')
        await expect(links.first()).toBeVisible({ timeout: 8000 })

        const style = await links.first().getAttribute('style')
        expect(style).toBeTruthy()
        expect(style).toContain('fill-opacity')
    })
})
