import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamChartPareto — Playwright spec.
 *
 * Asserts:
 *  - 10 column `<rect>` elements render for the defect causes fixture.
 *  - Bars are sorted descending (first bar taller than last bar).
 *  - Cumulative line `<path>` is present when showLine=true.
 *  - Cumulative line is absent when showLine=false.
 *  - showLabel=true places value text elements above the bars.
 *  - ARIA attributes (role="figure", role="img", title, desc) are present.
 *  - Empty state renders when series is empty.
 *  - point-click emit variant shows the event log after clicking a bar.
 */

const PARETO_STORY = '/stories/story/components-stories-chart-origamchartpareto-story-vue'

const sandboxOf = (page: Page) =>
	page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, title: string) => {
	await page.goto(PARETO_STORY)
	await page.waitForLoadState('networkidle')
	await page.getByText(title, { exact: true }).first().click()
	await page.waitForTimeout(500)
}

test.describe('OrigamChartPareto — Default', () => {
	test('renders figure root with role="figure"', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)
		const host = sandbox.locator('[data-cy="pareto-playground-chart"]').first()
		await expect(host).toBeVisible({ timeout: 8000 })
		await expect(host).toHaveAttribute('role', 'figure')
	})

	test('SVG carries role=img, title and desc', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)
		const svg = sandbox.locator('[data-cy="pareto-playground-chart"] svg').first()
		await expect(svg).toBeVisible()
		await expect(svg).toHaveAttribute('role', 'img')
		await expect(svg.locator('title')).toHaveCount(1)
		await expect(svg.locator('desc')).toHaveCount(1)
	})

	test('renders exactly 10 bars (defect causes fixture has 10 categories)', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)
		await page.screenshot({ path: '/tmp/chart-pareto-default.png', fullPage: false })

		const bars = sandbox.locator('[data-cy="pareto-playground-chart"] [data-cy^="origam-chart-pareto-bar-"]')
		await expect(bars).toHaveCount(10, { timeout: 6000 })
	})

	test('each bar has positive width and height attributes', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)
		const bars = sandbox.locator('[data-cy="pareto-playground-chart"] [data-cy^="origam-chart-pareto-bar-"]')
		const count = await bars.count()
		expect(count).toBe(10)
		for (let i = 0; i < count; i++) {
			const w = await bars.nth(i).getAttribute('width')
			const h = await bars.nth(i).getAttribute('height')
			expect(Number(w)).toBeGreaterThan(0)
			expect(Number(h)).toBeGreaterThan(0)
		}
	})

	test('first bar (Bad welding=89) is taller than last bar (Other=4)', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)
		const bars = sandbox.locator('[data-cy="pareto-playground-chart"] [data-cy^="origam-chart-pareto-bar-"]')

		const hFirst = Number(await bars.nth(0).getAttribute('height'))
		const hLast = Number(await bars.nth(9).getAttribute('height'))
		expect(hFirst).toBeGreaterThan(hLast * 5)
	})

	test('cumulative line path is present by default', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)
		const line = sandbox.locator('[data-cy="pareto-playground-chart"] [data-cy="origam-chart-pareto-line"]')
		await expect(line).toHaveCount(1, { timeout: 6000 })
	})

	test('cumulative dots are rendered for each bar (10 dots)', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)
		const dots = sandbox.locator('[data-cy="pareto-playground-chart"] [data-cy^="origam-chart-pareto-dot-"]')
		await expect(dots).toHaveCount(10, { timeout: 6000 })
	})
})

test.describe('OrigamChartPareto — Prop showLine', () => {
	test('cumulative line is visible when showLine=true', async ({ page }) => {
		await openVariant(page, 'Prop — showLine (on/off)')
		const sandbox = sandboxOf(page)
		await page.screenshot({ path: '/tmp/chart-pareto-line.png', fullPage: false })

		const lineOn = sandbox.locator('[data-cy="pareto-showline-on"] [data-cy="origam-chart-pareto-line"]')
		await expect(lineOn).toHaveCount(1, { timeout: 6000 })
	})

	test('cumulative line is absent when showLine=false', async ({ page }) => {
		await openVariant(page, 'Prop — showLine (on/off)')
		const sandbox = sandboxOf(page)
		const lineOff = sandbox.locator('[data-cy="pareto-showline-off"] [data-cy="origam-chart-pareto-line"]')
		await expect(lineOff).toHaveCount(0, { timeout: 6000 })
	})

	test('right y-axis is absent when showLine=false', async ({ page }) => {
		await openVariant(page, 'Prop — showLine (on/off)')
		const sandbox = sandboxOf(page)
		const rightAxis = sandbox.locator('[data-cy="pareto-showline-off"] [data-cy="origam-chart-pareto-axis-y-right"]')
		await expect(rightAxis).toHaveCount(0, { timeout: 6000 })
	})
})

test.describe('OrigamChartPareto — Prop showLabel', () => {
	test('no bar-label elements when showLabel=false (default)', async ({ page }) => {
		await openVariant(page, 'Prop — showLabel')
		const sandbox = sandboxOf(page)
		const labelsOff = sandbox.locator('[data-cy="pareto-label-off"] [data-cy^="origam-chart-pareto-label-"]')
		await expect(labelsOff).toHaveCount(0, { timeout: 6000 })
	})

	test('10 bar-label elements when showLabel=true', async ({ page }) => {
		await openVariant(page, 'Prop — showLabel')
		const sandbox = sandboxOf(page)
		const labelsOn = sandbox.locator('[data-cy="pareto-label-on"] [data-cy^="origam-chart-pareto-label-"]')
		await expect(labelsOn).toHaveCount(10, { timeout: 6000 })
	})
})

test.describe('OrigamChartPareto — Slot empty', () => {
	test('custom empty slot renders when series is empty', async ({ page }) => {
		await openVariant(page, 'Slot — empty')
		const sandbox = sandboxOf(page)
		const empty = sandbox.locator('[data-cy="pareto-slot-empty-chart"] [data-cy="origam-chart-pareto-empty"]')
		await expect(empty).toBeVisible({ timeout: 8000 })
		await expect(empty).toContainText('No defect data available')
	})

	test('no bars rendered when series is empty', async ({ page }) => {
		await openVariant(page, 'Slot — empty')
		const sandbox = sandboxOf(page)
		const bars = sandbox.locator('[data-cy="pareto-slot-empty-chart"] [data-cy^="origam-chart-pareto-bar-"]')
		await expect(bars).toHaveCount(0, { timeout: 6000 })
	})
})

test.describe('OrigamChartPareto — Emit point-click', () => {
	test('clicking a bar appends a line to the event log', async ({ page }) => {
		await openVariant(page, 'Emit — point-click on column')
		const sandbox = sandboxOf(page)

		const firstBar = sandbox.locator('[data-cy="pareto-emit-chart"] [data-cy="origam-chart-pareto-bar-0"]')
		await firstBar.click()

		const log = sandbox.locator('[data-cy="pareto-emit-log"]')
		await expect(log).toContainText('point-click', { timeout: 4000 })
	})

	test('clicked bar carries correct x value in the log', async ({ page }) => {
		await openVariant(page, 'Emit — point-click on column')
		const sandbox = sandboxOf(page)

		const firstBar = sandbox.locator('[data-cy="pareto-emit-chart"] [data-cy="origam-chart-pareto-bar-0"]')
		await firstBar.click()

		const log = sandbox.locator('[data-cy="pareto-emit-log"]')
		await expect(log).toContainText('Bad welding', { timeout: 4000 })
	})
})

test.describe('OrigamChartPareto — ARIA', () => {
	test('each bar rect has aria-label with category and cumulative info', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)
		const firstBar = sandbox.locator('[data-cy="pareto-playground-chart"] [data-cy="origam-chart-pareto-bar-0"]')
		const ariaLabel = await firstBar.getAttribute('aria-label')
		expect(ariaLabel).toContain('Bad welding')
		expect(ariaLabel).toContain('%')
	})

	test('each bar rect has role=button for keyboard navigation', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)
		const firstBar = sandbox.locator('[data-cy="pareto-playground-chart"] [data-cy="origam-chart-pareto-bar-0"]')
		await expect(firstBar).toHaveAttribute('role', 'button')
	})
})
