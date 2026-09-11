import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamChartBullet — Playwright spec.
 *
 * Asserts:
 *  - N bullet rows render for N series entries.
 *  - Each bullet renders range rects + value bar + target line.
 *  - `horizontal` and `vertical` orientations both produce bullets.
 *  - barThickness prop changes the bar's height fraction visually.
 *  - Clicking a bar fires the `point-click` emit (log updates).
 *  - Empty state renders when series is empty.
 *  - ARIA attributes (role="figure", role="img", title, desc) are
 *    present for screen-reader support.
 */

const BULLET_STORY = '/stories/story/components-stories-chart-origamchartbullet-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyUrl: string, title: string) => {
    await page.goto(storyUrl)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(500)
}

test.describe('OrigamChartBullet — Default', () => {
    test('renders figure root with role="figure"', async ({ page }) => {
        await openVariant(page, BULLET_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="bullet-playground-chart"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'figure')
    })

    test('SVG carries role=img, title and desc', async ({ page }) => {
        await openVariant(page, BULLET_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator('[data-cy="bullet-playground-chart"] svg').first()
        await expect(svg).toBeVisible()
        await expect(svg).toHaveAttribute('role', 'img')
        await expect(svg.locator('title')).toHaveCount(1)
        await expect(svg.locator('desc')).toHaveCount(1)
    })

    test('renders 3 bullet rows for 3 sales KPIs', async ({ page }) => {
        await openVariant(page, BULLET_STORY, 'Default')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-bullet-default.png', fullPage: false })

        const rows = sandbox.locator('[data-cy="bullet-playground-chart"] [data-cy^="origam-chart-bullet-row-"]')
        await expect(rows).toHaveCount(3, { timeout: 6000 })
    })

    test('each bullet row has range rects, a value bar, and a target line', async ({ page }) => {
        await openVariant(page, BULLET_STORY, 'Default')
        const sandbox = sandboxOf(page)

        for (let i = 0; i < 3; i++) {
            const bar = sandbox.locator(`[data-cy="origam-chart-bullet-bar-${ i }"]`)
            await expect(bar).toBeVisible()

            // SVG <line> elements with stroke defined via CSS variable may be considered
            // "hidden" by Playwright's visibility check even when rendered with non-zero
            // coordinates. Assert presence + non-zero span instead.
            const target = sandbox.locator(`[data-cy="origam-chart-bullet-target-${ i }"]`)
            await expect(target).toBeAttached()
            const y1 = await target.getAttribute('y1')
            const y2 = await target.getAttribute('y2')
            expect(Math.abs(Number(y2) - Number(y1))).toBeGreaterThan(0)

            const range0 = sandbox.locator(`[data-cy="origam-chart-bullet-range-${ i }-0"]`)
            await expect(range0).toBeVisible()
        }
    })

    test('bars are keyboard-focusable and have aria-label', async ({ page }) => {
        await openVariant(page, BULLET_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const bar = sandbox.locator('[data-cy="origam-chart-bullet-bar-0"]').first()
        await expect(bar).toHaveAttribute('tabindex', '0')
        await expect(bar).toHaveAttribute('aria-label')
    })

    test('axis ticks render when showAxis is true', async ({ page }) => {
        await openVariant(page, BULLET_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const axisTicks = sandbox.locator('[data-cy="bullet-playground-chart"] [data-cy^="origam-chart-bullet-tick-"]')
        const count = await axisTicks.count()
        expect(count).toBeGreaterThan(0)
    })
})

test.describe('OrigamChartBullet — Orientation', () => {
    test('horizontal and vertical variants both render 3 rows', async ({ page }) => {
        await openVariant(page, BULLET_STORY, 'Prop — orientation (horizontal vs vertical)')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-bullet-orientation.png', fullPage: false })

        const horizontal = sandbox.locator('[data-cy="bullet-orientation-horizontal"] [data-cy^="origam-chart-bullet-row-"]')
        await expect(horizontal).toHaveCount(3, { timeout: 6000 })

        const vertical = sandbox.locator('[data-cy="bullet-orientation-vertical"] [data-cy^="origam-chart-bullet-row-"]')
        await expect(vertical).toHaveCount(3, { timeout: 6000 })
    })
})

test.describe('OrigamChartBullet — barThickness', () => {
    test('slim and thick variants both render bar elements', async ({ page }) => {
        await openVariant(page, BULLET_STORY, 'Prop — barThickness (slim vs thick)')
        const sandbox = sandboxOf(page)

        const slimBar = sandbox.locator('[data-cy="bullet-thickness-slim"] [data-cy="origam-chart-bullet-bar-0"]')
        await expect(slimBar).toBeVisible({ timeout: 6000 })

        const thickBar = sandbox.locator('[data-cy="bullet-thickness-thick"] [data-cy="origam-chart-bullet-bar-0"]')
        await expect(thickBar).toBeVisible({ timeout: 6000 })

        const slimH = await slimBar.getAttribute('height')
        const thickH = await thickBar.getAttribute('height')

        expect(Number(thickH)).toBeGreaterThan(Number(slimH))
    })
})

test.describe('OrigamChartBullet — rangeColors', () => {
    test('intent and custom range color variants both render range rects', async ({ page }) => {
        await openVariant(page, BULLET_STORY, 'Prop — rangeColors (DS intents vs custom palette)')
        const sandbox = sandboxOf(page)

        const intentRange = sandbox.locator('[data-cy="bullet-range-intent"] [data-cy="origam-chart-bullet-range-0-0"]')
        await expect(intentRange).toBeVisible({ timeout: 6000 })

        const customRange = sandbox.locator('[data-cy="bullet-range-custom"] [data-cy="origam-chart-bullet-range-0-0"]')
        await expect(customRange).toBeVisible({ timeout: 6000 })

        const intentStyle = await intentRange.getAttribute('style')
        const customStyle = await customRange.getAttribute('style')
        expect(intentStyle).not.toBe(customStyle)
    })
})

test.describe('OrigamChartBullet — Emit point-click', () => {
    test('clicking a bar appends to the log', async ({ page }) => {
        await openVariant(page, BULLET_STORY, 'Emit — point-click on bullet')
        const sandbox = sandboxOf(page)

        const bar = sandbox.locator('[data-cy="origam-chart-bullet-bar-0"]').first()
        await bar.click()

        const log = sandbox.locator('[data-cy="bullet-emit-log"]').first()
        const logText = await log.textContent()
        expect(logText).toContain('point-click')
    })
})

test.describe('OrigamChartBullet — Empty state', () => {
    test('renders custom empty slot when series is empty', async ({ page }) => {
        await openVariant(page, BULLET_STORY, 'Slot — empty')
        const sandbox = sandboxOf(page)

        const empty = sandbox.locator('[data-cy="bullet-slot-empty-chart"] [data-cy="origam-chart-bullet-empty"]')
        await expect(empty).toBeVisible({ timeout: 6000 })
        const text = await empty.textContent()
        expect(text).toContain('No KPI data')
    })
})

test.describe('OrigamChartBullet — 5 KPI performance metrics', () => {
    test('renders 5 bullet rows', async ({ page }) => {
        await openVariant(page, BULLET_STORY, 'Prop — 5 KPI performance metrics')
        const sandbox = sandboxOf(page)

        const rows = sandbox.locator('[data-cy="bullet-performance-chart"] [data-cy^="origam-chart-bullet-row-"]')
        await expect(rows).toHaveCount(5, { timeout: 6000 })
    })
})
