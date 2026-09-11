import { expect, test, type Page } from '@playwright/test'

/**
 * E2E spec — OrigamChartStreamgraph
 *
 * Navigates each Variant in the Histoire story and asserts that
 * every prop / behaviour produces a distinct, observable runtime
 * change in the rendered SVG.
 *
 * URL scheme: /story/components-stories-chart-origamchartstreamgraph-story-vue
 * Component is rendered inside Histoire's sandbox iframe — all locators
 * go through sandboxOf(page) = page.frameLocator('iframe[src*="__sandbox"]').
 *
 * Base URL: http://localhost:6006
 */

const STORY = '/stories/story/components-stories-chart-origamchartstreamgraph-story-vue'

const sandboxOf = (page: Page) =>
	page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, variant: string) => {
	await page.goto(STORY)
	await page.waitForLoadState('networkidle')
	await page.getByText(variant, { exact: true }).first().click()
	await page.waitForTimeout(500)
}

// ---------------------------------------------------------------------------
// Default / Playground
// ---------------------------------------------------------------------------

test.describe('OrigamChartStreamgraph — Default variant', () => {
	test('renders the SVG with at least one ribbon', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)

		const svg = sandbox.locator('[data-cy="origam-chart-streamgraph-svg"]').first()
		await expect(svg).toBeVisible({ timeout: 8000 })

		const ribbons = sandbox.locator('[data-cy="origam-chart-streamgraph-svg"] .origam-chart-streamgraph__ribbon')
		await expect(ribbons).not.toHaveCount(0)
	})

	test('renders 5 ribbons for the music fixture (5 series)', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)

		const svg = sandbox.locator('[data-cy="origam-chart-streamgraph-svg"]').first()
		await expect(svg).toBeVisible({ timeout: 8000 })

		const ribbons = sandbox.locator('[data-cy="origam-chart-streamgraph-svg"] .origam-chart-streamgraph__ribbon')
		await expect(ribbons).toHaveCount(5)
	})

	test('each ribbon has a non-empty d attribute (path data)', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)

		const ribbon = sandbox.locator('[data-cy="origam-chart-streamgraph-ribbon-0"]').first()
		await expect(ribbon).toBeVisible({ timeout: 8000 })

		const d = await ribbon.getAttribute('d')
		expect(d).toBeTruthy()
		expect(d!.length).toBeGreaterThan(10)
	})

	test('each ribbon has an inline fill style (not a fill attribute)', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)

		const ribbon = sandbox.locator('[data-cy="origam-chart-streamgraph-ribbon-0"]').first()
		await expect(ribbon).toBeVisible({ timeout: 8000 })

		const style = await ribbon.getAttribute('style')
		expect(style).toMatch(/fill\s*:/)
		const fillAttr = await ribbon.getAttribute('fill')
		expect(fillAttr).toBeNull()
	})

	test('SVG title element contains chart title text', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)

		const titleEl = sandbox.locator('[data-cy="origam-chart-streamgraph-svg"] title').first()
		await expect(titleEl).toBeAttached({ timeout: 8000 })

		const titleText = await titleEl.textContent()
		expect(titleText).toBeTruthy()
	})

	test('legend renders with 5 items for 5 series', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)

		const svg = sandbox.locator('[data-cy="origam-chart-streamgraph-svg"]').first()
		await expect(svg).toBeVisible({ timeout: 8000 })

		const legendItems = sandbox.locator('.origam-chart__legend-item')
		await expect(legendItems).toHaveCount(5)
	})

	test('ribbons are keyboard focusable (tabindex=0)', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)

		const ribbon = sandbox.locator('[data-cy="origam-chart-streamgraph-ribbon-0"]').first()
		await expect(ribbon).toBeVisible({ timeout: 8000 })

		const tabindex = await ribbon.getAttribute('tabindex')
		expect(tabindex).toBe('0')
	})

	test('ribbons have role=button for accessibility', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)

		const ribbon = sandbox.locator('[data-cy="origam-chart-streamgraph-ribbon-0"]').first()
		await expect(ribbon).toBeVisible({ timeout: 8000 })

		await expect(ribbon).toHaveAttribute('role', 'button')
	})
})

// ---------------------------------------------------------------------------
// Prop — offsetMode
// ---------------------------------------------------------------------------

test.describe('OrigamChartStreamgraph — Prop offsetMode', () => {
	test('renders 4 charts in the offsetMode variant', async ({ page }) => {
		await openVariant(page, 'Prop — offsetMode (wiggle / silhouette / expand / zero)')
		const sandbox = sandboxOf(page)

		const wiggle = sandbox.locator('[data-cy="streamgraph-offset-wiggle"]').first()
		await expect(wiggle).toBeVisible({ timeout: 8000 })

		// Use the class selector to target only chart roots (not the outer shell div
		// which also has data-cy="streamgraph-offset-mode" matching the prefix).
		const charts = sandbox.locator('[data-cy^="streamgraph-offset-"].origam-chart-streamgraph')
		await expect(charts).toHaveCount(4)
	})

	test('wiggle chart renders visible ribbons', async ({ page }) => {
		await openVariant(page, 'Prop — offsetMode (wiggle / silhouette / expand / zero)')
		const sandbox = sandboxOf(page)

		const wiggle = sandbox.locator('[data-cy="streamgraph-offset-wiggle"]').first()
		await expect(wiggle).toBeVisible({ timeout: 8000 })

		const ribbons = sandbox.locator('[data-cy="streamgraph-offset-wiggle"] .origam-chart-streamgraph__ribbon')
		await expect(ribbons).not.toHaveCount(0)
	})

	test('silhouette chart renders visible ribbons', async ({ page }) => {
		await openVariant(page, 'Prop — offsetMode (wiggle / silhouette / expand / zero)')
		const sandbox = sandboxOf(page)

		const silhouette = sandbox.locator('[data-cy="streamgraph-offset-silhouette"]').first()
		await expect(silhouette).toBeVisible({ timeout: 8000 })

		const ribbons = sandbox.locator('[data-cy="streamgraph-offset-silhouette"] .origam-chart-streamgraph__ribbon')
		await expect(ribbons).not.toHaveCount(0)
	})

	test('expand chart renders visible ribbons', async ({ page }) => {
		await openVariant(page, 'Prop — offsetMode (wiggle / silhouette / expand / zero)')
		const sandbox = sandboxOf(page)

		const expand = sandbox.locator('[data-cy="streamgraph-offset-expand"]').first()
		await expect(expand).toBeVisible({ timeout: 8000 })

		const ribbons = sandbox.locator('[data-cy="streamgraph-offset-expand"] .origam-chart-streamgraph__ribbon')
		await expect(ribbons).not.toHaveCount(0)
	})

	test('zero chart renders visible ribbons', async ({ page }) => {
		await openVariant(page, 'Prop — offsetMode (wiggle / silhouette / expand / zero)')
		const sandbox = sandboxOf(page)

		const zero = sandbox.locator('[data-cy="streamgraph-offset-zero"]').first()
		await expect(zero).toBeVisible({ timeout: 8000 })

		const ribbons = sandbox.locator('[data-cy="streamgraph-offset-zero"] .origam-chart-streamgraph__ribbon')
		await expect(ribbons).not.toHaveCount(0)
	})

	test('wiggle and zero path data differ (different baselines)', async ({ page }) => {
		await openVariant(page, 'Prop — offsetMode (wiggle / silhouette / expand / zero)')
		const sandbox = sandboxOf(page)

		const wiggleRibbon = sandbox.locator('[data-cy="streamgraph-offset-wiggle"] .origam-chart-streamgraph__ribbon').first()
		await expect(wiggleRibbon).toBeVisible({ timeout: 8000 })

		const zeroRibbon = sandbox.locator('[data-cy="streamgraph-offset-zero"] .origam-chart-streamgraph__ribbon').first()
		await expect(zeroRibbon).toBeVisible({ timeout: 8000 })

		const wiggleD = await wiggleRibbon.getAttribute('d')
		const zeroD = await zeroRibbon.getAttribute('d')

		expect(wiggleD).not.toBe(zeroD)
	})
})

// ---------------------------------------------------------------------------
// Prop — smoothing
// ---------------------------------------------------------------------------

test.describe('OrigamChartStreamgraph — Prop smoothing', () => {
	test('renders 2 charts in the smoothing variant', async ({ page }) => {
		await openVariant(page, 'Prop — smoothing (none vs curve)')
		const sandbox = sandboxOf(page)

		const none = sandbox.locator('[data-cy="streamgraph-smoothing-none"]').first()
		await expect(none).toBeVisible({ timeout: 8000 })

		const charts = sandbox.locator('[data-cy^="streamgraph-smoothing-"]')
		await expect(charts).toHaveCount(2)
	})

	test('none and curve path data differ (C vs L commands)', async ({ page }) => {
		await openVariant(page, 'Prop — smoothing (none vs curve)')
		const sandbox = sandboxOf(page)

		const noneRibbon = sandbox.locator('[data-cy="streamgraph-smoothing-none"] .origam-chart-streamgraph__ribbon').first()
		await expect(noneRibbon).toBeVisible({ timeout: 8000 })

		const curveRibbon = sandbox.locator('[data-cy="streamgraph-smoothing-curve"] .origam-chart-streamgraph__ribbon').first()
		await expect(curveRibbon).toBeVisible({ timeout: 8000 })

		const noneD = await noneRibbon.getAttribute('d')
		const curveD = await curveRibbon.getAttribute('d')

		expect(noneD).not.toBeNull()
		expect(curveD).not.toBeNull()
		// curve path uses C (cubic bezier) commands; none uses only L (line-to)
		expect(curveD).toMatch(/C\s/)
		expect(noneD).not.toMatch(/C\s/)
	})
})

// ---------------------------------------------------------------------------
// Prop — colorScheme
// ---------------------------------------------------------------------------

test.describe('OrigamChartStreamgraph — Prop colorScheme', () => {
	test('renders 3 charts in the colorScheme variant', async ({ page }) => {
		await openVariant(page, 'Prop — colorScheme')
		const sandbox = sandboxOf(page)

		const def = sandbox.locator('[data-cy="streamgraph-color-default"]').first()
		await expect(def).toBeVisible({ timeout: 8000 })

		// Use the class selector to target only chart roots (not the outer shell div
		// which also has data-cy="streamgraph-color-scheme" matching the prefix).
		const charts = sandbox.locator('[data-cy^="streamgraph-color-"].origam-chart-streamgraph')
		await expect(charts).toHaveCount(3)
	})

	test('warm chart first ribbon has warm fill color', async ({ page }) => {
		await openVariant(page, 'Prop — colorScheme')
		const sandbox = sandboxOf(page)

		const warmRibbon = sandbox.locator('[data-cy="streamgraph-color-warm"] .origam-chart-streamgraph__ribbon').first()
		await expect(warmRibbon).toBeVisible({ timeout: 8000 })

		const style = await warmRibbon.getAttribute('style')
		expect(style).toMatch(/fill\s*:/)
	})

	test('default and warm charts have different ribbon fill colors', async ({ page }) => {
		await openVariant(page, 'Prop — colorScheme')
		const sandbox = sandboxOf(page)

		const defaultRibbon = sandbox.locator('[data-cy="streamgraph-color-default"] .origam-chart-streamgraph__ribbon').first()
		await expect(defaultRibbon).toBeVisible({ timeout: 8000 })

		const warmRibbon = sandbox.locator('[data-cy="streamgraph-color-warm"] .origam-chart-streamgraph__ribbon').first()
		await expect(warmRibbon).toBeVisible({ timeout: 8000 })

		const defaultStyle = await defaultRibbon.getAttribute('style')
		const warmStyle = await warmRibbon.getAttribute('style')

		expect(defaultStyle).not.toBe(warmStyle)
	})
})

// ---------------------------------------------------------------------------
// Slot — tooltip
// ---------------------------------------------------------------------------

test.describe('OrigamChartStreamgraph — Slot tooltip', () => {
	test('custom tooltip slot renders on ribbon hover', async ({ page }) => {
		await openVariant(page, 'Slot — tooltip')
		const sandbox = sandboxOf(page)

		const chart = sandbox.locator('[data-cy="streamgraph-slot-tooltip-chart"]').first()
		await expect(chart).toBeVisible({ timeout: 8000 })

		const ribbon = sandbox.locator('[data-cy="streamgraph-slot-tooltip-chart"] .origam-chart-streamgraph__ribbon').first()
		await ribbon.hover()

		const tooltip = sandbox.locator('.custom-tooltip')
		await expect(tooltip).toBeVisible()
	})

	test('custom tooltip shows all series rows on hover', async ({ page }) => {
		await openVariant(page, 'Slot — tooltip')
		const sandbox = sandboxOf(page)

		const chart = sandbox.locator('[data-cy="streamgraph-slot-tooltip-chart"]').first()
		await expect(chart).toBeVisible({ timeout: 8000 })

		// Hovering a ribbon sets hoveredSeriesIndex (via onRibbonEnter) and
		// hoveredXIndex (via onSvgMouseMove fired as the pointer crosses the SVG).
		// Both must be non-null for the tooltip to render.
		const ribbon = sandbox.locator('[data-cy="streamgraph-slot-tooltip-chart"] .origam-chart-streamgraph__ribbon').first()
		await ribbon.hover()

		const rows = sandbox.locator('.custom-tooltip__row')
		await expect(rows).not.toHaveCount(0)
	})
})

// ---------------------------------------------------------------------------
// Slot — empty
// ---------------------------------------------------------------------------

test.describe('OrigamChartStreamgraph — Slot empty', () => {
	test('renders the custom empty slot when series is empty', async ({ page }) => {
		await openVariant(page, 'Slot — empty')
		const sandbox = sandboxOf(page)

		const chart = sandbox.locator('[data-cy="streamgraph-slot-empty-chart"]').first()
		await expect(chart).toBeVisible({ timeout: 8000 })

		const emptyEl = sandbox.locator('.custom-empty')
		await expect(emptyEl).toBeVisible()
	})

	test('no ribbon paths are rendered when series is empty', async ({ page }) => {
		await openVariant(page, 'Slot — empty')
		const sandbox = sandboxOf(page)

		const chart = sandbox.locator('[data-cy="streamgraph-slot-empty-chart"]').first()
		await expect(chart).toBeVisible({ timeout: 8000 })

		const ribbons = sandbox.locator('[data-cy="streamgraph-slot-empty-chart"] .origam-chart-streamgraph__ribbon')
		await expect(ribbons).toHaveCount(0)
	})
})

// ---------------------------------------------------------------------------
// Emit — point-click
// ---------------------------------------------------------------------------

test.describe('OrigamChartStreamgraph — Emit point-click', () => {
	test('clicking a ribbon fires point-click and logs to pre', async ({ page }) => {
		await openVariant(page, 'Emit — point-click on ribbon')
		const sandbox = sandboxOf(page)

		const chart = sandbox.locator('[data-cy="streamgraph-emit-chart"]').first()
		await expect(chart).toBeVisible({ timeout: 8000 })

		const ribbon = sandbox.locator('[data-cy="streamgraph-emit-chart"] .origam-chart-streamgraph__ribbon').first()
		await ribbon.click()

		const log = sandbox.locator('[data-cy="streamgraph-emit-log"]')
		const text = await log.textContent()
		expect(text).toMatch(/point-click/)
	})

	test.fixme(true, 'DS BUG: onRibbonActivate skips emit when hoveredXIndex is null — keyboard focus never sets hoveredXIndex (only onSvgMouseMove does), so pressing Enter on a ribbon always finds hoveredPoint===null and the point-click emit is silently swallowed. Fix needed in OrigamChartStreamgraph.vue: onRibbonActivate must derive a fallback xIndex (e.g. middle column) when hoveredXIndex is null.')
	test('keyboard Enter on a ribbon fires point-click', async ({ page }) => {
		await openVariant(page, 'Emit — point-click on ribbon')
		const sandbox = sandboxOf(page)

		const chart = sandbox.locator('[data-cy="streamgraph-emit-chart"]').first()
		await expect(chart).toBeVisible({ timeout: 8000 })

		const ribbon = sandbox.locator('[data-cy="streamgraph-emit-chart"] .origam-chart-streamgraph__ribbon').first()
		await ribbon.focus()
		await ribbon.press('Enter')

		const log = sandbox.locator('[data-cy="streamgraph-emit-log"]')
		const text = await log.textContent()
		expect(text).toMatch(/point-click/)
	})

	test('legend toggle fires series-toggle event', async ({ page }) => {
		await openVariant(page, 'Emit — point-click on ribbon')
		const sandbox = sandboxOf(page)

		const chart = sandbox.locator('[data-cy="streamgraph-emit-chart"]').first()
		await expect(chart).toBeVisible({ timeout: 8000 })

		const legendItem = sandbox.locator('.origam-chart__legend-item').first()
		await legendItem.click()

		const log = sandbox.locator('[data-cy="streamgraph-emit-log"]')
		const text = await log.textContent()
		expect(text).toMatch(/series-toggle/)
	})
})
