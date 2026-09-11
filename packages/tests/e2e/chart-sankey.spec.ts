import { expect, test, type Page } from '@playwright/test'

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
        const host = sandbox.locator('[data-cy="sankey-playground-chart"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'figure')
    })

    test('SVG carries role=img, title and desc', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator('[data-cy="sankey-playground-chart"] svg').first()
        await expect(svg).toBeVisible()
        await expect(svg).toHaveAttribute('role', 'img')
        await expect(svg.locator('title')).toHaveCount(1)
        await expect(svg.locator('desc')).toHaveCount(1)
    })

    test('renders 7 node rects for the web funnel fixture (7 unique nodes)', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Default')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-sankey-default.png', fullPage: false })

        // FIXTURE_WEB_FUNNEL unique nodes: Home, Catalogue, Cart, Exit, Checkout, Success, Failure = 7
        const nodes = sandbox.locator('[data-cy="sankey-playground-chart"] [data-cy^="origam-chart-sankey-node-"]')
        await expect(nodes).toHaveCount(7, { timeout: 8000 })
    })

    test('renders 7 link paths for the web funnel fixture (7 data entries)', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Default')
        const sandbox = sandboxOf(page)

        const links = sandbox.locator('[data-cy="sankey-playground-chart"] [data-cy^="origam-chart-sankey-link-"]')
        await expect(links).toHaveCount(7, { timeout: 8000 })
    })

    test('each link path has a non-empty d attribute starting with M', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const links = sandbox.locator('[data-cy="sankey-playground-chart"] [data-cy^="origam-chart-sankey-link-"]')
        const count = await links.count()
        expect(count).toBe(7)
        for (let i = 0; i < count; i++) {
            const d = await links.nth(i).getAttribute('d')
            expect(d).toBeTruthy()
            expect(d!.startsWith('M')).toBe(true)
        }
    })

    test('each node rect has positive width and height attributes', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const nodes = sandbox.locator('[data-cy="sankey-playground-chart"] [data-cy^="origam-chart-sankey-node-"]')
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
    test('renders 7 node rects for the energy budget fixture (7 unique nodes)', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Prop — nodeWidth / nodePadding (compact vs spaced)')
        const sandbox = sandboxOf(page)

        // FIXTURE_ENERGY unique nodes: Solar, Wind, Nuclear, Grid, Residential, Industrial, Commercial = 7
        const nodes = sandbox.locator('[data-cy="sankey-compact"] [data-cy^="origam-chart-sankey-node-"]')
        await expect(nodes).toHaveCount(7, { timeout: 8000 })
    })

    test('renders 6 link paths for the energy budget fixture (6 data entries)', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Prop — nodeWidth / nodePadding (compact vs spaced)')
        const sandbox = sandboxOf(page)

        const links = sandbox.locator('[data-cy="sankey-compact"] [data-cy^="origam-chart-sankey-link-"]')
        await expect(links).toHaveCount(6, { timeout: 8000 })
    })
})

test.describe('OrigamChartSankey — nodeWidth / nodePadding', () => {
    test('compact node width (8) and spaced node width (24) are distinct', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Prop — nodeWidth / nodePadding (compact vs spaced)')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-sankey-nodes.png', fullPage: false })

        const compactNodes = sandbox.locator('[data-cy="sankey-compact"] [data-cy^="origam-chart-sankey-node-"]')
        const spacedNodes = sandbox.locator('[data-cy="sankey-spaced"] [data-cy^="origam-chart-sankey-node-"]')

        const compactWidth = await compactNodes.first().getAttribute('width')
        const spacedWidth = await spacedNodes.first().getAttribute('width')

        expect(Number(compactWidth)).toBeLessThan(Number(spacedWidth))
    })
})

test.describe('OrigamChartSankey — accessibility', () => {
    test('each node has role="button" and a non-empty aria-label', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const nodes = sandbox.locator('[data-cy="sankey-playground-chart"] [data-cy^="origam-chart-sankey-node-"]')
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
        const links = sandbox.locator('[data-cy="sankey-playground-chart"] [data-cy^="origam-chart-sankey-link-"]')
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
        const nodes = sandbox.locator('[data-cy="sankey-playground-chart"] [data-cy^="origam-chart-sankey-node-"]')
        const count = await nodes.count()
        for (let i = 0; i < count; i++) {
            await expect(nodes.nth(i)).toHaveAttribute('tabindex', '0')
        }
    })

    test('each link is keyboard-focusable (tabindex=0)', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const links = sandbox.locator('[data-cy="sankey-playground-chart"] [data-cy^="origam-chart-sankey-link-"]')
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
        const labels = sandbox.locator('[data-cy="sankey-playground-chart"] [data-cy^="origam-chart-sankey-label-"]')
        await expect(labels).toHaveCount(7, { timeout: 6000 })
    })
})

test.describe('OrigamChartSankey — emit', () => {
    test('clicking a node appends a point-click line to the log', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Emit — point-click on node + link')
        const sandbox = sandboxOf(page)

        const nodes = sandbox.locator('[data-cy="sankey-emit-chart"] [data-cy^="origam-chart-sankey-node-"]')
        await expect(nodes.first()).toBeVisible({ timeout: 8000 })
        await nodes.first().click()
        await page.waitForTimeout(300)

        const log = sandbox.locator('[data-cy="sankey-emit-log"]')
        await expect(log).toContainText('point-click', { timeout: 4000 })
    })

    test('clicking a link appends a point-click line to the log', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Emit — point-click on node + link')
        const sandbox = sandboxOf(page)

        const links = sandbox.locator('[data-cy="sankey-emit-chart"] [data-cy^="origam-chart-sankey-link-"]')
        await expect(links.first()).toBeVisible({ timeout: 8000 })
        await links.first().click()
        await page.waitForTimeout(300)

        const log = sandbox.locator('[data-cy="sankey-emit-log"]')
        await expect(log).toContainText('point-click', { timeout: 4000 })
    })
})

test.describe('OrigamChartSankey — empty state', () => {
    test('empty slot renders when series is empty', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Slot — empty')
        const sandbox = sandboxOf(page)
        const empty = sandbox.locator('[data-cy="sankey-slot-empty-chart"] [data-cy="origam-chart-sankey-empty"]')
        await expect(empty).toBeVisible({ timeout: 6000 })
        await expect(empty).toContainText('No flow data')
    })
})

test.describe('OrigamChartSankey — linkOpacity', () => {
    test('link paths carry a fillOpacity style attribute', async ({ page }) => {
        await openVariant(page, SANKEY_STORY, 'Prop — linkOpacity (translucent vs opaque)')
        const sandbox = sandboxOf(page)

        // The sankey renders links as filled ribbons (fill + fill-opacity, stroke: none),
        // not stroked paths. The linkOpacity prop is applied as fill-opacity on the path style.
        const links = sandbox.locator('[data-cy="sankey-translucent"] [data-cy^="origam-chart-sankey-link-"]')
        await expect(links.first()).toBeVisible({ timeout: 8000 })

        const style = await links.first().getAttribute('style')
        expect(style).toBeTruthy()
        expect(style).toContain('fill-opacity')
    })
})
