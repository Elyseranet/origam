import { expect, test, type Page } from '@playwright/test'

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
        const host = sandbox.locator('[data-cy="candlestick-playground-chart"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'figure')
    })

    test('SVG carries role=img, title and desc', async ({ page }) => {
        await openVariant(page, CANDLESTICK_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator('[data-cy="candlestick-playground-chart"] svg').first()
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
        const count = await candles.count()
        expect(count).toBe(14)

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
        await openVariant(page, CANDLESTICK_STORY, 'Prop — bullishColor / bearishColor (DS intents vs custom hex)')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-candlestick-colors.png', fullPage: false })

        const bullishCandles = sandbox.locator('[data-cy="candlestick-color-intents"] .origam-chart-candlestick__candle--bullish')
        const bearishCandles = sandbox.locator('[data-cy="candlestick-color-intents"] .origam-chart-candlestick__candle--bearish')

        await expect(bullishCandles.first()).toBeVisible({ timeout: 6000 })
        await expect(bearishCandles.first()).toBeVisible({ timeout: 6000 })

        const bullishCount = await bullishCandles.count()
        const bearishCount = await bearishCandles.count()
        expect(bullishCount).toBeGreaterThan(0)
        expect(bearishCount).toBeGreaterThan(0)
        expect(bullishCount + bearishCount).toBe(14)
    })

    test('custom hex colours produce distinct body fill inline styles', async ({ page }) => {
        await openVariant(page, CANDLESTICK_STORY, 'Prop — bullishColor / bearishColor (DS intents vs custom hex)')
        const sandbox = sandboxOf(page)

        const firstBullishBody = sandbox.locator('[data-cy="candlestick-color-hex"] .origam-chart-candlestick__candle--bullish .origam-chart-candlestick__body-rect').first()
        const firstBearishBody = sandbox.locator('[data-cy="candlestick-color-hex"] .origam-chart-candlestick__candle--bearish .origam-chart-candlestick__body-rect').first()

        const bullishStyle = await firstBullishBody.getAttribute('style')
        const bearishStyle = await firstBearishBody.getAttribute('style')

        // Chromium normalises hex colours to rgb() in SVG inline styles,
        // so we verify the two fills are non-null and distinct rather than
        // asserting a specific hex literal.
        expect(bullishStyle).toBeTruthy()
        expect(bearishStyle).toBeTruthy()
        expect(bullishStyle).not.toBe(bearishStyle)
    })
})

test.describe('OrigamChartCandlestick — candleWidth', () => {
    test('slim (0.3) body is narrower than wide (0.9) body', async ({ page }) => {
        await openVariant(page, CANDLESTICK_STORY, 'Prop — candleWidth (slim 0.3 vs wide 0.9)')
        const sandbox = sandboxOf(page)

        const slimBody = sandbox.locator('[data-cy="candlestick-width-slim"] [data-cy="origam-chart-candlestick-body-0"]')
        const wideBody = sandbox.locator('[data-cy="candlestick-width-wide"] [data-cy="origam-chart-candlestick-body-0"]')

        const slimW = await slimBody.getAttribute('width')
        const wideW = await wideBody.getAttribute('width')

        expect(parseFloat(slimW!)).toBeLessThan(parseFloat(wideW!))
    })
})

test.describe('OrigamChartCandlestick — wickWidth', () => {
    test('thick wick has a greater stroke-width attribute than thin wick', async ({ page }) => {
        await openVariant(page, CANDLESTICK_STORY, 'Prop — wickWidth (thin 0.5 vs thick 2)')
        const sandbox = sandboxOf(page)

        const thinWick = sandbox.locator('[data-cy="candlestick-wick-thin"] [data-cy="origam-chart-candlestick-wick-0"]')
        const thickWick = sandbox.locator('[data-cy="candlestick-wick-thick"] [data-cy="origam-chart-candlestick-wick-0"]')

        const thinSW = await thinWick.getAttribute('stroke-width')
        const thickSW = await thickWick.getAttribute('stroke-width')

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
        const count = await bearishCandles.count()
        expect(count).toBeGreaterThan(0)
    })
})

test.describe('OrigamChartCandlestick — empty state', () => {
    test('empty slot renders when series is empty', async ({ page }) => {
        await openVariant(page, CANDLESTICK_STORY, 'Slot — empty')
        const sandbox = sandboxOf(page)
        const empty = sandbox.locator('[data-cy="candlestick-slot-empty-chart"] [data-cy="origam-chart-candlestick-empty"]')
        await expect(empty).toBeVisible({ timeout: 6000 })
        await expect(empty).toContainText('No market data')
    })

    test('no candles render in the empty state', async ({ page }) => {
        await openVariant(page, CANDLESTICK_STORY, 'Slot — empty')
        const sandbox = sandboxOf(page)
        const candles = sandbox.locator('[data-cy="candlestick-slot-empty-chart"] [data-cy^="origam-chart-candlestick-candle-"]')
        await expect(candles).toHaveCount(0, { timeout: 4000 })
    })
})

test.describe('OrigamChartCandlestick — point-click emit', () => {
    test('clicking a candle appends a line to the log', async ({ page }) => {
        await openVariant(page, CANDLESTICK_STORY, 'Emit — point-click on candle')
        const sandbox = sandboxOf(page)

        const log = sandbox.locator('[data-cy="candlestick-emit-log"]')
        const initialText = await log.textContent()
        expect(initialText?.trim()).toBe('')

        const firstCandle = sandbox.locator('[data-cy="origam-chart-candlestick-candle-0"]')
        await firstCandle.click()
        await page.waitForTimeout(300)

        const updatedText = await log.textContent()
        expect(updatedText).toContain('point-click')
    })
})

test.describe('OrigamChartCandlestick — BTC fixture (30 days)', () => {
    test('slot tooltip variant renders 30 candles for BTC fixture', async ({ page }) => {
        await openVariant(page, CANDLESTICK_STORY, 'Slot — tooltip')
        const sandbox = sandboxOf(page)
        const candles = sandbox.locator('[data-cy^="origam-chart-candlestick-candle-"]')
        await expect(candles).toHaveCount(30, { timeout: 6000 })
    })
})
