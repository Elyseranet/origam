import { expect, test, type Page } from '@playwright/test'

import { eventLogItems, fillHstNumber, fillHstText, openEventsTab, selectHstOption } from './_support/histoire-controls'

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
 *
 * The story restructuring (canonical Design/State/Functional/Events/Slots
 * layout, see root CLAUDE.md) removed every per-fixture root data-cy this
 * spec targeted (bullet-playground-chart, bullet-orientation-h/v,
 * bullet-thickness-slim/thick, bullet-range-intent/custom,
 * bullet-slot-empty-chart, bullet-performance-chart, bullet-emit-log) —
 * `OrigamChartBullet.vue` itself sets a static
 * `data-cy="origam-chart-bullet"` on its own root instead. Side-by-side
 * comparisons (orientation, barThickness, rangeColors) fold into single
 * dynamic controls on "Design", driven sequentially. "Emit — …" maps to
 * "Events - point-click"; its removed `bullet-emit-log` DOM shell is read
 * back via the shared `openEventsTab` / `eventLogItems` helpers.
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
        const host = sandbox.locator('[data-cy="origam-chart-bullet"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'figure')
    })

    test('SVG carries role=img, title and desc', async ({ page }) => {
        await openVariant(page, BULLET_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator('[data-cy="origam-chart-bullet"] svg').first()
        await expect(svg).toBeVisible()
        await expect(svg).toHaveAttribute('role', 'img')
        await expect(svg.locator('title')).toHaveCount(1)
        await expect(svg.locator('desc')).toHaveCount(1)
    })

    test('renders 3 bullet rows for 3 sales KPIs', async ({ page }) => {
        await openVariant(page, BULLET_STORY, 'Default')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-bullet-default.png', fullPage: false })

        const rows = sandbox.locator('[data-cy="origam-chart-bullet"] [data-cy^="origam-chart-bullet-row-"]')
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
        const axisTicks = sandbox.locator('[data-cy="origam-chart-bullet"] [data-cy^="origam-chart-bullet-tick-"]')
        // Flake found while repairing this spec's title drift, unrelated to
        // it: a synchronous `.count()` right after openVariant's fixed
        // 500ms wait intermittently reads 0 — the tick geometry depends on
        // a layout measurement (SVG width) that isn't always settled yet.
        // Reproduced consistently as a standalone run, then observed to
        // pass once extra `await` calls (even just console.log +
        // locator reads) pushed past the race — confirms timing, not a
        // missing/broken feature (ticks ARE present once settled, verified
        // via full axis-group HTML dump). `expect(...).toBeAttached()`
        // auto-retries instead of taking one synchronous snapshot.
        await expect(axisTicks.first()).toBeAttached({ timeout: 6000 })
        const count = await axisTicks.count()
        expect(count).toBeGreaterThan(0)
    })
})

test.describe('OrigamChartBullet — Orientation', () => {
    test('horizontal and vertical variants both render 3 rows', async ({ page }) => {
        // Dedicated side-by-side fixture folded into "Design" — a single
        // dynamic "Orientation" control (default 'Horizontal', see
        // OrigamChartBullet.story.vue), driven sequentially instead.
        await openVariant(page, BULLET_STORY, 'Design')
        const sandbox = sandboxOf(page)
        const rows = sandbox.locator('[data-cy="origam-chart-bullet"] [data-cy^="origam-chart-bullet-row-"]')

        await expect(rows).toHaveCount(3, { timeout: 6000 })

        await selectHstOption(page, 'Orientation', 'Vertical')
        await page.waitForTimeout(400)
        await expect(rows).toHaveCount(3, { timeout: 6000 })
    })
})

test.describe('OrigamChartBullet — barThickness', () => {
    test('slim and thick variants both render bar elements', async ({ page }) => {
        // Dedicated side-by-side fixture folded into "Design" — a single
        // dynamic "Bar Thickness" control (default 0.45), driven
        // sequentially instead.
        await openVariant(page, BULLET_STORY, 'Design')
        const sandbox = sandboxOf(page)
        const bar = sandbox.locator('[data-cy="origam-chart-bullet"] [data-cy="origam-chart-bullet-bar-0"]')

        await fillHstNumber(page, 'Bar Thickness', 0.15)
        await page.waitForTimeout(400)
        await expect(bar).toBeVisible({ timeout: 6000 })
        const slimH = await bar.getAttribute('height')

        await fillHstNumber(page, 'Bar Thickness', 0.85)
        await page.waitForTimeout(400)
        const thickH = await bar.getAttribute('height')

        expect(Number(thickH)).toBeGreaterThan(Number(slimH))
    })
})

test.describe('OrigamChartBullet — rangeColors', () => {
    test('intent and custom range color variants both render range rects', async ({ page }) => {
        // Dedicated side-by-side fixture folded into "Design" — 3
        // individual HstText fields ("Range 1 (poor)" etc.), defaulting
        // to DS intents ('danger'/'warning'/'success'). Driven
        // sequentially: capture the intent-driven style, switch the
        // first range to a raw hex, capture again, compare.
        await openVariant(page, BULLET_STORY, 'Design')
        const sandbox = sandboxOf(page)
        const range = sandbox.locator('[data-cy="origam-chart-bullet"] [data-cy="origam-chart-bullet-range-0-0"]')

        await expect(range).toBeVisible({ timeout: 6000 })
        const intentStyle = await range.getAttribute('style')

        await fillHstText(page, 'Range 1 (poor)', '#123456')
        await page.waitForTimeout(400)
        const customStyle = await range.getAttribute('style')

        expect(intentStyle).not.toBe(customStyle)
    })
})

test.describe('OrigamChartBullet — Emit point-click', () => {
    test('clicking a bar appends to the log', async ({ page }) => {
        // Canonical Variant is "Events - point-click". The old
        // `bullet-emit-log` DOM shell is gone — read back from Histoire's
        // own "Events" tab instead.
        await openVariant(page, BULLET_STORY, 'Events - point-click')
        const sandbox = sandboxOf(page)

        const bar = sandbox.locator('[data-cy="origam-chart-bullet-bar-0"]').first()
        await bar.click()
        await page.waitForTimeout(300)

        await openEventsTab(page)
        await expect(eventLogItems(page).first()).toContainText('point-click', { timeout: 4000 })
    })
})

test.describe('OrigamChartBullet — Empty state', () => {
    test('renders custom empty slot when series is empty', async ({ page }) => {
        // Canonical Variant is "Slots - empty" (lowercase 'e', unlike most
        // other charts' "Slots - Empty" — see available Variant titles).
        await openVariant(page, BULLET_STORY, 'Slots - empty')
        const sandbox = sandboxOf(page)

        const empty = sandbox.locator('[data-cy="origam-chart-bullet"] [data-cy="origam-chart-bullet-empty"]')
        await expect(empty).toBeVisible({ timeout: 6000 })
        const text = await empty.textContent()
        expect(text).toContain('No KPI data')
    })
})

test.describe('OrigamChartBullet — 5 KPI performance metrics', () => {
    test('renders 5 bullet rows', async () => {
        // STORY GAP found while repairing this spec: the migrated story
        // has only ONE fixture set left (FIXTURE_SALES /
        // FIXTURE_SALES_CATEGORIES, 3 entries — "Revenue" / "Profit
        // Margin" / "Customer Satisfaction") — the separate 5-KPI
        // "performance" fixture this test targeted no longer exists
        // anywhere in OrigamChartBullet.story.vue (verified via grep: no
        // second FIXTURE_* array, no "performance" reference). Since row
        // count is driven directly by the hardcoded series/categories
        // array length, this can't be reproduced from the spec without
        // editing the story.
        test.skip(true, 'STORY GAP: OrigamChartBullet.story.vue no longer has a 5-entry fixture ("performance" KPIs) after the canonical-structure migration — only the 3-entry FIXTURE_SALES remains. Needs a dedicated story fixture, not a spec change.')
    })
})
