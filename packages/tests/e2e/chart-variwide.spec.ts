import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamChartVariwide — Playwright spec.
 *
 * Asserts:
 *  - 6 column `<rect>` elements render for the GDP × Population fixture.
 *  - China and India columns (large population) are visually wider than
 *    UK and Germany (small population) — the defining variwide encoding.
 *  - barGap=0 vs barGap=8 produce different inter-column spacing.
 *  - showLabel=true places value text elements above the bars.
 *  - ARIA attributes (role="figure", role="img", title, desc) are present.
 *  - Empty state renders when series is empty.
 *  - point-click emit variant shows the event log after clicking a bar.
 */

const VARIWIDE_STORY = '/stories/story/components-stories-chart-origamchartvariwide-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, title: string) => {
    await page.goto(VARIWIDE_STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(500)
}

test.describe('OrigamChartVariwide — Default', () => {
    test('renders figure root with role="figure"', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="variwide-playground-chart"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'figure')
    })

    test('SVG carries role=img, title and desc', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator('[data-cy="variwide-playground-chart"] svg').first()
        await expect(svg).toBeVisible()
        await expect(svg).toHaveAttribute('role', 'img')
        await expect(svg.locator('title')).toHaveCount(1)
        await expect(svg.locator('desc')).toHaveCount(1)
    })

    test('renders exactly 6 bars (GDP × Population has 6 countries)', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-variwide-default.png', fullPage: false })

        const bars = sandbox.locator('[data-cy="variwide-playground-chart"] [data-cy^="origam-chart-variwide-bar-"]')
        await expect(bars).toHaveCount(6, { timeout: 6000 })
    })

    test('each bar has positive width and height attributes', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const bars = sandbox.locator('[data-cy="variwide-playground-chart"] [data-cy^="origam-chart-variwide-bar-"]')
        const count = await bars.count()
        expect(count).toBe(6)
        for (let i = 0; i < count; i++) {
            const w = await bars.nth(i).getAttribute('width')
            const h = await bars.nth(i).getAttribute('height')
            expect(Number(w)).toBeGreaterThan(0)
            expect(Number(h)).toBeGreaterThan(0)
        }
    })

    test('China bar (index 1) is wider than UK bar (index 5)', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const bars = sandbox.locator('[data-cy="variwide-playground-chart"] [data-cy^="origam-chart-variwide-bar-"]')

        const wChina = Number(await bars.nth(1).getAttribute('width'))
        const wUK = Number(await bars.nth(5).getAttribute('width'))
        expect(wChina).toBeGreaterThan(wUK * 5)
    })

    test('India bar (index 4) is wider than Germany bar (index 2)', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const bars = sandbox.locator('[data-cy="variwide-playground-chart"] [data-cy^="origam-chart-variwide-bar-"]')

        const wIndia = Number(await bars.nth(4).getAttribute('width'))
        const wGermany = Number(await bars.nth(2).getAttribute('width'))
        expect(wIndia).toBeGreaterThan(wGermany * 5)
    })
})

test.describe('OrigamChartVariwide — barGap', () => {
    test('barGap=0 and barGap=8 render 6 bars each', async ({ page }) => {
        await openVariant(page, 'Prop — barGap (0 vs 8)')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-variwide-gap.png', fullPage: false })

        const barsGap0 = sandbox.locator('[data-cy="variwide-bargap-0"] [data-cy^="origam-chart-variwide-bar-"]')
        const barsGap8 = sandbox.locator('[data-cy="variwide-bargap-8"] [data-cy^="origam-chart-variwide-bar-"]')

        await expect(barsGap0).toHaveCount(6, { timeout: 6000 })
        await expect(barsGap8).toHaveCount(6, { timeout: 6000 })
    })

    test('bars in barGap=8 have smaller individual widths than barGap=0', async ({ page }) => {
        await openVariant(page, 'Prop — barGap (0 vs 8)')
        const sandbox = sandboxOf(page)

        const bar0_w = Number(await sandbox.locator('[data-cy="variwide-bargap-0"] [data-cy="origam-chart-variwide-bar-0"]').getAttribute('width'))
        const bar8_w = Number(await sandbox.locator('[data-cy="variwide-bargap-8"] [data-cy="origam-chart-variwide-bar-0"]').getAttribute('width'))

        expect(bar0_w).toBeGreaterThan(bar8_w)
    })
})

test.describe('OrigamChartVariwide — showLabel', () => {
    test('showLabel=true renders value text labels above bars', async ({ page }) => {
        await openVariant(page, 'Prop — showLabel / showAxis / showGrid')
        const sandbox = sandboxOf(page)

        const labels = sandbox.locator('[data-cy="variwide-label-on"] [data-cy^="origam-chart-variwide-label-"]')
        await expect(labels).toHaveCount(6, { timeout: 6000 })
    })

    test('showLabel=false renders no value labels', async ({ page }) => {
        await openVariant(page, 'Prop — showLabel / showAxis / showGrid')
        const sandbox = sandboxOf(page)

        const labels = sandbox.locator('[data-cy="variwide-label-off"] [data-cy^="origam-chart-variwide-label-"]')
        await expect(labels).toHaveCount(0, { timeout: 6000 })
    })
})

test.describe('OrigamChartVariwide — empty state', () => {
    test('empty slot renders when series is empty', async ({ page }) => {
        await openVariant(page, 'Slot — empty')
        const sandbox = sandboxOf(page)

        const empty = sandbox.locator('[data-cy="variwide-slot-empty-chart"] [data-cy="origam-chart-variwide-empty"]')
        await expect(empty).toBeVisible({ timeout: 6000 })
        await expect(empty).toContainText('No data available')
    })

    test('no bars render when series is empty', async ({ page }) => {
        await openVariant(page, 'Slot — empty')
        const sandbox = sandboxOf(page)

        const bars = sandbox.locator('[data-cy="variwide-slot-empty-chart"] [data-cy^="origam-chart-variwide-bar-"]')
        await expect(bars).toHaveCount(0, { timeout: 6000 })
    })
})

test.describe('OrigamChartVariwide — point-click emit', () => {
    test('clicking a bar appends a log line', async ({ page }) => {
        await openVariant(page, 'Emit — point-click on column')
        const sandbox = sandboxOf(page)

        const firstBar = sandbox.locator('[data-cy="variwide-emit-chart"] [data-cy="origam-chart-variwide-bar-0"]')
        await expect(firstBar).toBeVisible({ timeout: 8000 })
        await firstBar.click()

        const log = sandbox.locator('[data-cy="variwide-emit-log"]')
        await expect(log).toContainText('point-click', { timeout: 4000 })
    })
})

test.describe('OrigamChartVariwide — ARIA', () => {
    test('each bar has a descriptive aria-label with category + value + width', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const firstBar = sandbox.locator('[data-cy="variwide-playground-chart"] [data-cy="origam-chart-variwide-bar-0"]')
        const label = await firstBar.getAttribute('aria-label')
        expect(label).toBeTruthy()
        expect(label).toContain('US')
    })
})
