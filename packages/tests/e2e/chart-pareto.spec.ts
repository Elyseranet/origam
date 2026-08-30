import { expect, test, type Page } from '@playwright/test'

import { eventLogItems, openEventsTab, toggleHstCheckbox } from './_support/histoire-controls'

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
 *
 * The story restructuring (canonical Design/State/Functional/Events/Slots
 * layout, see root CLAUDE.md) removed every per-fixture root data-cy this
 * spec targeted (pareto-playground-chart, pareto-showline-*,
 * pareto-label-*, pareto-slot-empty-chart, pareto-emit-chart/-log) —
 * `OrigamChartPareto.vue` itself sets a static
 * `data-cy="origam-chart-pareto"` on its own root instead. showLine/
 * showLabel were static side-by-side comparisons, now single dynamic
 * checkboxes on "Design" (defaults: showLine=true, showLabel=false),
 * driven sequentially. "Emit — point-click on column" maps to "Events -
 * point-click"; the removed pareto-emit-log DOM shell is read back via
 * the shared `openEventsTab` / `eventLogItems` helpers — confirmed
 * empirically that the logged event carries the full payload (`x: Bad
 * welding, y: 89, …`), so the "correct x value" assertion still holds.
 */

const PARETO_STORY = '/stories/story/components-stories-chart-origamchartpareto-story-vue'
const CHART = '[data-cy="origam-chart-pareto"]'

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
		const host = sandbox.locator(CHART).first()
		await expect(host).toBeVisible({ timeout: 8000 })
		await expect(host).toHaveRole('figure') // #426 — root is a native <figure>, role is implicit, no explicit attribute any more
	})

	test('SVG carries role=img, title and desc', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)
		const svg = sandbox.locator(`${ CHART } svg`).first()
		await expect(svg).toBeVisible()
		await expect(svg).toHaveAttribute('role', 'img')
		await expect(svg.locator('title')).toHaveCount(1)
		await expect(svg.locator('desc')).toHaveCount(1)
	})

	test('renders exactly 10 bars (defect causes fixture has 10 categories)', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)
		await page.screenshot({ path: '/tmp/chart-pareto-default.png', fullPage: false })

		const bars = sandbox.locator(`${ CHART } [data-cy^="origam-chart-pareto-bar-"]`)
		await expect(bars).toHaveCount(10, { timeout: 6000 })
	})

	test('each bar has positive width and height attributes', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)
		const bars = sandbox.locator(`${ CHART } [data-cy^="origam-chart-pareto-bar-"]`)
		// Timing race found while repairing this spec's title drift,
		// unrelated to it (same class documented on chart-bullet.spec.ts's
		// axis-ticks test) — toHaveCount auto-retries.
		await expect(bars).toHaveCount(10, { timeout: 6000 })
		const count = await bars.count()
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
		const bars = sandbox.locator(`${ CHART } [data-cy^="origam-chart-pareto-bar-"]`)

		const hFirst = Number(await bars.nth(0).getAttribute('height'))
		const hLast = Number(await bars.nth(9).getAttribute('height'))
		expect(hFirst).toBeGreaterThan(hLast * 5)
	})

	test('cumulative line path is present by default', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)
		const line = sandbox.locator(`${ CHART } [data-cy="origam-chart-pareto-line"]`)
		await expect(line).toHaveCount(1, { timeout: 6000 })
	})

	test('cumulative dots are rendered for each bar (10 dots)', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)
		const dots = sandbox.locator(`${ CHART } [data-cy^="origam-chart-pareto-dot-"]`)
		await expect(dots).toHaveCount(10, { timeout: 6000 })
	})
})

test.describe('OrigamChartPareto — Prop showLine', () => {
	test('cumulative line is visible when showLine=true', async ({ page }) => {
		// Dedicated side-by-side fixture folded into "Design" — Show Line
		// checkbox already defaults to true (see
		// OrigamChartPareto.story.vue), so no control interaction is
		// needed for this half of the comparison.
		await openVariant(page, 'Design')
		const sandbox = sandboxOf(page)

		const lineOn = sandbox.locator(`${ CHART } [data-cy="origam-chart-pareto-line"]`)
		await expect(lineOn).toHaveCount(1, { timeout: 6000 })
	})

	test('cumulative line is absent when showLine=false', async ({ page }) => {
		await openVariant(page, 'Design')
		await toggleHstCheckbox(page, 'Show Line')
		await page.waitForTimeout(400)
		const sandbox = sandboxOf(page)
		const lineOff = sandbox.locator(`${ CHART } [data-cy="origam-chart-pareto-line"]`)
		await expect(lineOff).toHaveCount(0, { timeout: 6000 })
	})

	test('right y-axis is absent when showLine=false', async ({ page }) => {
		await openVariant(page, 'Design')
		await toggleHstCheckbox(page, 'Show Line')
		await page.waitForTimeout(400)
		const sandbox = sandboxOf(page)
		const rightAxis = sandbox.locator(`${ CHART } [data-cy="origam-chart-pareto-axis-y-right"]`)
		await expect(rightAxis).toHaveCount(0, { timeout: 6000 })
	})
})

test.describe('OrigamChartPareto — Prop showLabel', () => {
	test('no bar-label elements when showLabel=false (default)', async ({ page }) => {
		// Dedicated fixture folded into "Design" — Show Label already
		// defaults to false, so no control interaction is needed.
		await openVariant(page, 'Design')
		const sandbox = sandboxOf(page)
		const labelsOff = sandbox.locator(`${ CHART } [data-cy^="origam-chart-pareto-label-"]`)
		await expect(labelsOff).toHaveCount(0, { timeout: 6000 })
	})

	test('10 bar-label elements when showLabel=true', async ({ page }) => {
		await openVariant(page, 'Design')
		await toggleHstCheckbox(page, 'Show Label')
		await page.waitForTimeout(400)
		const sandbox = sandboxOf(page)
		const labelsOn = sandbox.locator(`${ CHART } [data-cy^="origam-chart-pareto-label-"]`)
		await expect(labelsOn).toHaveCount(10, { timeout: 6000 })
	})
})

test.describe('OrigamChartPareto — Slot empty', () => {
	test('custom empty slot renders when series is empty', async ({ page }) => {
		// Canonical Variant is "Slots - Empty" — no story-level root
		// data-cy, anchored via the component's own static root.
		await openVariant(page, 'Slots - Empty')
		const sandbox = sandboxOf(page)
		const empty = sandbox.locator(`${ CHART } [data-cy="origam-chart-pareto-empty"]`)
		await expect(empty).toBeVisible({ timeout: 8000 })
		await expect(empty).toContainText('No defect data available')
	})

	test('no bars rendered when series is empty', async ({ page }) => {
		await openVariant(page, 'Slots - Empty')
		const sandbox = sandboxOf(page)
		const bars = sandbox.locator(`${ CHART } [data-cy^="origam-chart-pareto-bar-"]`)
		await expect(bars).toHaveCount(0, { timeout: 6000 })
	})
})

test.describe('OrigamChartPareto — Emit point-click', () => {
	test('clicking a bar appends a line to the event log', async ({ page }) => {
		// Canonical Variant is "Events - point-click". The old
		// "pareto-emit-log" DOM shell is gone — read back from Histoire's
		// own "Events" tab instead.
		await openVariant(page, 'Events - point-click')
		const sandbox = sandboxOf(page)

		const firstBar = sandbox.locator(`${ CHART } [data-cy="origam-chart-pareto-bar-0"]`)
		await firstBar.click()
		await page.waitForTimeout(300)

		await openEventsTab(page)
		await expect(eventLogItems(page).first()).toContainText('point-click', { timeout: 4000 })
	})

	test('clicked bar carries correct x value in the log', async ({ page }) => {
		// Confirmed empirically: the logged event payload includes the
		// full point data (`x: Bad welding, y: 89, …`).
		await openVariant(page, 'Events - point-click')
		const sandbox = sandboxOf(page)

		const firstBar = sandbox.locator(`${ CHART } [data-cy="origam-chart-pareto-bar-0"]`)
		await firstBar.click()
		await page.waitForTimeout(300)

		await openEventsTab(page)
		await expect(eventLogItems(page).first()).toContainText('Bad welding', { timeout: 4000 })
	})
})

test.describe('OrigamChartPareto — ARIA', () => {
	test('each bar rect has aria-label with category and cumulative info', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)
		const firstBar = sandbox.locator(`${ CHART } [data-cy="origam-chart-pareto-bar-0"]`)
		const ariaLabel = await firstBar.getAttribute('aria-label')
		expect(ariaLabel).toContain('Bad welding')
		expect(ariaLabel).toContain('%')
	})

	test('each bar rect has role=button for keyboard navigation', async ({ page }) => {
		await openVariant(page, 'Default')
		const sandbox = sandboxOf(page)
		const firstBar = sandbox.locator(`${ CHART } [data-cy="origam-chart-pareto-bar-0"]`)
		await expect(firstBar).toHaveAttribute('role', 'button')
	})
})
