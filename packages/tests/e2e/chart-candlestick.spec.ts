import { expect, test, type Page } from '@playwright/test'

import { eventLogItems, fillHstNumber, openEventsTab } from './_support/histoire-controls'

/**
 * OrigamChartCandlestick — Playwright spec.
 *
 * Asserts:
 *  - N candle `<g>` elements render for N OHLC data points.
 *  - Each candle has a wick `<line>` and a body `<rect>`.
 *  - Bullish candles (close ≥ open) and bearish candles (close < open)
 *    carry distinct fill colours.
 *  - ARIA attributes (role="figure", role="img", title, desc) are
 *    present for screen-reader support.
 *  - Each candle group carries role="button", tabindex="0", aria-label.
 *  - The empty slot renders when series is empty.
 *  - point-click emit fires when a candle is activated.
 *
 * The story restructuring (canonical Design/State/Functional/Events/Slots
 * layout, see root CLAUDE.md) removed the old "candlestick-playground-
 * chart" fixture root data-cy — `OrigamChartCandlestick.vue` itself sets
 * a static `data-cy="origam-chart-candlestick"` on its own root instead.
 * candleWidth/wickWidth were static side-by-side comparisons, now single
 * dynamic controls on "Design", driven sequentially. The old
 * "candlestick-emit-log" DOM shell is gone — emits read back via the
 * shared `openEventsTab` / `eventLogItems` helpers.
 */

const CANDLESTICK_STORY = '/stories/story/components-stories-chart-origamchartcandlestick-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyUrl: string, title: string) => {
    await page.goto(storyUrl)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(500)
}

test.describe('OrigamChartCandlestick — Default (AAPL 14 days)', () => {
    test('renders figure root with role="figure"', async ({ page }) => {
        await openVariant(page, CANDLESTICK_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="origam-chart-candlestick"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveRole('figure') // #426 — root is a native <figure>, role is implicit, no explicit attribute any more
    })

    test('SVG carries role=img, title and desc', async ({ page }) => {
        await openVariant(page, CANDLESTICK_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator('[data-cy="origam-chart-candlestick"] svg').first()
        await expect(svg).toBeVisible()
        await expect(svg).toHaveAttribute('role', 'img')
        await expect(svg.locator('title')).toHaveCount(1)
        await expect(svg.locator('desc')).toHaveCount(1)
    })

    test('renders exactly 14 candles for AAPL fixture', async ({ page }) => {
        await openVariant(page, CANDLESTICK_STORY, 'Default')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-candlestick-default.png', fullPage: false })

        const candles = sandbox.locator('[data-cy^="origam-chart-candlestick-candle-"]')
        await expect(candles).toHaveCount(14, { timeout: 6000 })
    })

    test('each candle has a wick line and a body rect', async ({ page }) => {
        await openVariant(page, CANDLESTICK_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const candles = sandbox.locator('[data-cy^="origam-chart-candlestick-candle-"]')
        // Timing flake found while repairing this spec's title drift,
        // unrelated to it (same class of race documented on chart-
        // bullet.spec.ts's axis-ticks test): candle geometry depends on a
        // layout measurement that isn't always settled right after
        // openVariant's fixed 500ms wait. `toHaveCount` auto-retries.
        await expect(candles).toHaveCount(14, { timeout: 6000 })
        const count = await candles.count()

        for (let i = 0; i < count; i++) {
            const wick = sandbox.locator(`[data-cy="origam-chart-candlestick-wick-${ i }"]`)
            const body = sandbox.locator(`[data-cy="origam-chart-candlestick-body-${ i }"]`)
            await expect(wick).toBeAttached()
            await expect(body).toBeAttached()
        }
    })
})

test.describe('OrigamChartCandlestick — bullish / bearish colours', () => {
    test('bullish and bearish candles have distinct fill colours (default intents)', async ({ page }) => {
        // Dedicated fixture folded into "Design" — its default init-state
        // already sets bullishColor: 'success' / bearishColor: 'danger'
        // (see OrigamChartCandlestick.story.vue), so no control
        // interaction is needed.
        await openVariant(page, CANDLESTICK_STORY, 'Design')
        const sandbox = sandboxOf(page)

        const bullishCandles = sandbox.locator('[data-cy="origam-chart-candlestick"] .origam-chart-candlestick__candle--bullish')
        const bearishCandles = sandbox.locator('[data-cy="origam-chart-candlestick"] .origam-chart-candlestick__candle--bearish')

        await expect(bullishCandles.first()).toBeVisible({ timeout: 6000 })
        await expect(bearishCandles.first()).toBeVisible({ timeout: 6000 })

        const bullishCount = await bullishCandles.count()
        const bearishCount = await bearishCandles.count()
        expect(bullishCount).toBeGreaterThan(0)
        expect(bearishCount).toBeGreaterThan(0)
        expect(bullishCount + bearishCount).toBe(14)
    })

    test('custom hex colours produce distinct body fill inline styles', async () => {
        // STORY GAP found while repairing this spec: Design's Bullish/
        // Bearish Color controls are `HstSelect` bound to `INTENT_OPTIONS`
        // (named intents only — 'success'/'danger'/… — verified via
        // intent.const.ts, no free-form hex entry), unlike e.g. chart-
        // bullet's rangeColors which uses free-typing `HstText` fields.
        // The old side-by-side "DS intents vs custom hex" comparison had
        // its own hardcoded-hex fixture that no longer exists, and there's
        // no control path to inject a raw hex value into bullishColor/
        // bearishColor from this story. Can't be reproduced without
        // editing the story.
        test.skip(true, 'STORY GAP: OrigamChartCandlestick.story.vue only exposes bullishColor/bearishColor via an intent-only HstSelect (INTENT_OPTIONS) after the canonical-structure migration — no control accepts a raw hex value, and the old custom-hex fixture is gone. Needs a dedicated story fixture or an HstText control, not a spec change.')
    })
})

test.describe('OrigamChartCandlestick — candleWidth', () => {
    test('slim (0.3) body is narrower than wide (0.9) body', async ({ page }) => {
        // Dedicated side-by-side fixture folded into "Design" — a single
        // dynamic "Candle Width [0..1]" control (default 0.6), driven
        // sequentially instead.
        await openVariant(page, CANDLESTICK_STORY, 'Design')
        const sandbox = sandboxOf(page)
        const body = sandbox.locator('[data-cy="origam-chart-candlestick"] [data-cy="origam-chart-candlestick-body-0"]')

        await fillHstNumber(page, 'Candle Width [0..1]', 0.3)
        await page.waitForTimeout(400)
        const slimW = await body.getAttribute('width')

        await fillHstNumber(page, 'Candle Width [0..1]', 0.9)
        await page.waitForTimeout(400)
        const wideW = await body.getAttribute('width')

        expect(parseFloat(slimW!)).toBeLessThan(parseFloat(wideW!))
    })
})

test.describe('OrigamChartCandlestick — wickWidth', () => {
    test('thick wick has a greater stroke-width attribute than thin wick', async ({ page }) => {
        // Dedicated side-by-side fixture folded into "Design" — a single
        // dynamic "Wick Width (px)" control (default 1), driven
        // sequentially instead.
        await openVariant(page, CANDLESTICK_STORY, 'Design')
        const sandbox = sandboxOf(page)
        const wick = sandbox.locator('[data-cy="origam-chart-candlestick"] [data-cy="origam-chart-candlestick-wick-0"]')

        await fillHstNumber(page, 'Wick Width (px)', 0.5)
        await page.waitForTimeout(400)
        const thinSW = await wick.getAttribute('stroke-width')

        await fillHstNumber(page, 'Wick Width (px)', 2)
        await page.waitForTimeout(400)
        const thickSW = await wick.getAttribute('stroke-width')

        expect(parseFloat(thinSW!)).toBeLessThan(parseFloat(thickSW!))
    })
})

test.describe('OrigamChartCandlestick — accessibility', () => {
    test('each candle has role="button" and a non-empty aria-label', async ({ page }) => {
        await openVariant(page, CANDLESTICK_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const candles = sandbox.locator('[data-cy^="origam-chart-candlestick-candle-"]')
        const count = await candles.count()
        for (let i = 0; i < count; i++) {
            await expect(candles.nth(i)).toHaveAttribute('role', 'button')
            const label = await candles.nth(i).getAttribute('aria-label')
            expect(label).toBeTruthy()
            // Each candle carries either "bullish" or "bearish" in its aria-label
            // depending on close vs open — assert one of the two is present.
            expect(label).toMatch(/bullish|bearish/)
        }
    })

    test('each candle is keyboard-focusable (tabindex=0)', async ({ page }) => {
        await openVariant(page, CANDLESTICK_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const candles = sandbox.locator('[data-cy^="origam-chart-candlestick-candle-"]')
        const count = await candles.count()
        for (let i = 0; i < count; i++) {
            await expect(candles.nth(i)).toHaveAttribute('tabindex', '0')
        }
    })

    test('aria-label contains bearish for at least one candle', async ({ page }) => {
        await openVariant(page, CANDLESTICK_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const bearishCandles = sandbox.locator('[data-cy^="origam-chart-candlestick-candle-"][aria-label*="bearish"]')
        // Same timing race as "each candle has a wick line…" above —
        // `toBeAttached` auto-retries instead of one synchronous snapshot.
        await expect(bearishCandles.first()).toBeAttached({ timeout: 6000 })
        const count = await bearishCandles.count()
        expect(count).toBeGreaterThan(0)
    })
})

test.describe('OrigamChartCandlestick — empty state', () => {
    test('empty slot renders when series is empty', async ({ page }) => {
        await openVariant(page, CANDLESTICK_STORY, 'Slots - Empty')
        const sandbox = sandboxOf(page)
        const empty = sandbox.locator('[data-cy="candlestick-slot-empty-chart"] [data-cy="origam-chart-candlestick-empty"]')
        await expect(empty).toBeVisible({ timeout: 6000 })
        await expect(empty).toContainText('No market data')
    })

    test('no candles render in the empty state', async ({ page }) => {
        await openVariant(page, CANDLESTICK_STORY, 'Slots - Empty')
        const sandbox = sandboxOf(page)
        const candles = sandbox.locator('[data-cy="candlestick-slot-empty-chart"] [data-cy^="origam-chart-candlestick-candle-"]')
        await expect(candles).toHaveCount(0, { timeout: 4000 })
    })
})

test.describe('OrigamChartCandlestick — point-click emit', () => {
    test('clicking a candle appends a line to the log', async ({ page }) => {
        // Canonical Variant is "Events - point-click". The old
        // "candlestick-emit-log" DOM shell is gone — read back from
        // Histoire's own "Events" tab instead.
        await openVariant(page, CANDLESTICK_STORY, 'Events - point-click')
        const sandbox = sandboxOf(page)

        const firstCandle = sandbox.locator('[data-cy="origam-chart-candlestick-candle-0"]')
        await firstCandle.click()
        await page.waitForTimeout(300)

        await openEventsTab(page)
        await expect(eventLogItems(page).first()).toContainText('point-click', { timeout: 4000 })
    })
})

test.describe('OrigamChartCandlestick — BTC fixture (30 days)', () => {
    test('slot tooltip variant renders 30 candles for BTC fixture', async ({ page }) => {
        await openVariant(page, CANDLESTICK_STORY, 'Slots - Tooltip')
        const sandbox = sandboxOf(page)
        const candles = sandbox.locator('[data-cy^="origam-chart-candlestick-candle-"]')
        await expect(candles).toHaveCount(30, { timeout: 6000 })
    })
})
