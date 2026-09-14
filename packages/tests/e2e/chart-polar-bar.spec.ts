import { expect, test, type Page } from '@playwright/test'

import { eventLogItems, fillHstNumber, fillHstText, openEventsTab } from './_support/histoire-controls'

/**
 * E2E spec for OrigamChartPolarBar.
 *
 * Navigates to each Variant in the Histoire story and asserts:
 * 1. SVG is rendered with the expected number of wedge paths.
 * 2. Distinct props (innerRadius, startAngle, gap, colorScheme) produce
 *    visually distinct computed attributes on the rendered paths.
 * 3. Empty state renders the fallback slot text.
 * 4. point-click emit logs a line in the event log.
 *
 * The story restructuring (canonical Design/State/Functional/Events/Slots
 * layout, see root CLAUDE.md) removed every per-fixture root data-cy this
 * spec targeted (polar-bar-playground-chart/-log, polar-bar-inner-radius-*,
 * polar-bar-start-angle/-angle-*, polar-bar-gap-*, polar-bar-color-scheme/
 * -color-*, polar-bar-slot-empty-chart, polar-bar-slot-tooltip-chart,
 * polar-bar-emit-chart/-log) — `OrigamChartPolarBar.vue` itself sets a
 * static `data-cy="origam-chart-polar-bar"` on its own root, unconditionally
 * (no Variant in the migrated story overrides it via attrs fallthrough), so
 * every test below anchors on that single CHART constant regardless of
 * which Variant is open.
 *
 * innerRadius/startAngle/gap were static side-by-side comparisons, now
 * single dynamic HstNumber controls on "Functional" (defaults 0.1 / 0 /
 * 0.02 respectively), driven sequentially. colorScheme was a 3-way
 * side-by-side (default/indigo/series); now a single dynamic HstText field
 * on "Design" ("colorScheme (single intent or CSS color)", empty by
 * default → DEFAULT_PALETTE), driven sequentially between empty and
 * "indigo" — the old "series" leg (per-series colour cycling) doesn't
 * apply to this fixture (FIXTURE_WEEKLY has a single series), so that leg
 * is dropped rather than faked.
 *
 * FIXTURE_WEEKLY (7 categories: Mon..Sun, 1 series) is used by every
 * Variant that renders the chart (Design, Functional, Events- Variants,
 * Default) — so every wedge-count assertion below expects 7, including the
 * ones that
 * previously expected 5 under the old, now-removed multi-fixture Variants.
 *
 * "Emit — point-click" maps to "Events - point-click"; the removed
 * polar-bar-emit-log DOM shell is read back via the shared
 * `openEventsTab` / `eventLogItems` helpers.
 */

const STORY_PATH = '/stories/story/components-stories-chart-origamchartpolarbar-story-vue'
const CHART = '[data-cy="origam-chart-polar-bar"]'

const sandboxOf = (page: Page) =>
	page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, title: string) => {
	await page.goto(STORY_PATH)
	await page.waitForLoadState('networkidle')
	await page.getByText(title, { exact: true }).first().click()
	await page.waitForTimeout(500)
}

test.describe('OrigamChartPolarBar', () => {
	test.describe('Default variant — playground renders 7 wedges', () => {
		test('SVG is present and has 7 wedge paths', async ({ page }) => {
			await openVariant(page, 'Default')
			const sandbox = sandboxOf(page)

			const chart = sandbox.locator(CHART).first()
			await expect(chart).toBeVisible({ timeout: 8000 })

			const paths = sandbox.locator(`${ CHART } [data-cy^="origam-chart-polar-bar-wedge-"]`)
			await expect(paths).toHaveCount(7, { timeout: 6000 })
		})

		test('each wedge has a non-empty d attribute', async ({ page }) => {
			await openVariant(page, 'Default')
			const sandbox = sandboxOf(page)

			const chart = sandbox.locator(CHART).first()
			await expect(chart).toBeVisible({ timeout: 8000 })

			const wedges = sandbox.locator(`${ CHART } [data-cy^="origam-chart-polar-bar-wedge-"]`)
			// Timing race found while repairing this spec's title drift,
			// unrelated to it (same class documented on chart-bullet.spec.ts's
			// axis-ticks test) — toHaveCount auto-retries.
			await expect(wedges).toHaveCount(7, { timeout: 6000 })
			const count = await wedges.count()

			for (let i = 0; i < count; i++) {
				const d = await wedges.nth(i).getAttribute('d')
				expect(d).toBeTruthy()
				expect(d!.length).toBeGreaterThan(10)
			}
		})

		test('wedge click appends a point-click line to the event log', async ({ page }) => {
			// Canonical Variant is "Events - point-click" — the Default
			// playground has no logging wiring for this in the migrated
			// story. The removed polar-bar-playground-log DOM shell is gone
			// — read back from Histoire's own "Events" tab instead.
			await openVariant(page, 'Events - point-click')
			const sandbox = sandboxOf(page)

			const chart = sandbox.locator(CHART).first()
			await expect(chart).toBeVisible({ timeout: 8000 })

			const firstWedge = sandbox.locator(`${ CHART } [data-cy="origam-chart-polar-bar-wedge-0"]`).first()
			await firstWedge.click()
			await page.waitForTimeout(300)

			await openEventsTab(page)
			await expect(eventLogItems(page).first()).toContainText('point-click', { timeout: 4000 })
		})
	})

	test.describe('Prop — innerRadius', () => {
		test('innerRadius=0 wedge reaches SVG center (d starts with "M 0,0")', async ({ page }) => {
			// Dedicated side-by-side fixture folded into "Functional" — a
			// single dynamic "Inner Radius" control (default 0.1), driven
			// to 0.
			await openVariant(page, 'Functional')
			await fillHstNumber(page, 'Inner Radius', 0)
			await page.waitForTimeout(400)
			const sandbox = sandboxOf(page)

			const wedge0 = sandbox.locator(`${ CHART } [data-cy="origam-chart-polar-bar-wedge-0"]`).first()
			const d0 = await wedge0.getAttribute('d')
			expect(d0).toMatch(/M 0,0/)
		})

		test('innerRadius=0.4 wedge d attribute does NOT start with M 0,0', async ({ page }) => {
			await openVariant(page, 'Functional')
			await fillHstNumber(page, 'Inner Radius', 0.4)
			await page.waitForTimeout(400)
			const sandbox = sandboxOf(page)

			const wedge04 = sandbox.locator(`${ CHART } [data-cy="origam-chart-polar-bar-wedge-0"]`).first()
			const d04 = await wedge04.getAttribute('d')
			expect(d04).not.toMatch(/^M 0,0/)
		})

		test('d paths differ between innerRadius=0 and innerRadius=0.4', async ({ page }) => {
			await openVariant(page, 'Functional')
			const sandbox = sandboxOf(page)
			const wedge0 = sandbox.locator(`${ CHART } [data-cy="origam-chart-polar-bar-wedge-0"]`).first()

			await fillHstNumber(page, 'Inner Radius', 0)
			await page.waitForTimeout(400)
			const d0 = await wedge0.getAttribute('d')

			await fillHstNumber(page, 'Inner Radius', 0.4)
			await page.waitForTimeout(400)
			const d4 = await wedge0.getAttribute('d')

			expect(d0).not.toBe(d4)
		})
	})

	test.describe('Prop — startAngle', () => {
		test('three angle values each render 7 wedges', async ({ page }) => {
			// Dedicated side-by-side fixture folded into "Functional" — a
			// single dynamic "Start Angle (rad)" control (default 0), driven
			// sequentially. Functional uses FIXTURE_WEEKLY (7 categories),
			// not the 5-category fixture the old side-by-side used.
			await openVariant(page, 'Functional')
			const sandbox = sandboxOf(page)
			const wedges = sandbox.locator(`${ CHART } [data-cy^="origam-chart-polar-bar-wedge-"]`)

			for (const angle of [0, -Math.PI / 2, Math.PI / 4]) {
				await fillHstNumber(page, 'Start Angle (rad)', angle)
				await page.waitForTimeout(400)
				await expect(wedges).toHaveCount(7, { timeout: 6000 })
			}
		})

		test('first wedge d attribute differs across startAngle values', async ({ page }) => {
			await openVariant(page, 'Functional')
			const sandbox = sandboxOf(page)
			const wedge0 = sandbox.locator(`${ CHART } [data-cy="origam-chart-polar-bar-wedge-0"]`).first()

			await fillHstNumber(page, 'Start Angle (rad)', 0)
			await page.waitForTimeout(400)
			const d0 = await wedge0.getAttribute('d')

			await fillHstNumber(page, 'Start Angle (rad)', -Math.PI / 2)
			await page.waitForTimeout(400)
			const dNeg = await wedge0.getAttribute('d')

			await fillHstNumber(page, 'Start Angle (rad)', Math.PI / 4)
			await page.waitForTimeout(400)
			const dPos = await wedge0.getAttribute('d')

			expect(d0).not.toBe(dNeg)
			expect(d0).not.toBe(dPos)
		})
	})

	test.describe('Prop — gap', () => {
		test('gap=0 and gap=0.05 produce different d paths', async ({ page }) => {
			// Dedicated side-by-side fixture folded into "Functional" — a
			// single dynamic "Gap (rad)" control (default 0.02), driven
			// sequentially.
			await openVariant(page, 'Functional')
			const sandbox = sandboxOf(page)
			const wedge0 = sandbox.locator(`${ CHART } [data-cy="origam-chart-polar-bar-wedge-0"]`).first()

			await fillHstNumber(page, 'Gap (rad)', 0)
			await page.waitForTimeout(400)
			const d0 = await wedge0.getAttribute('d')

			await fillHstNumber(page, 'Gap (rad)', 0.05)
			await page.waitForTimeout(400)
			const d5 = await wedge0.getAttribute('d')

			expect(d0).not.toBe(d5)
		})
	})

	test.describe('Prop — colorScheme', () => {
		test('changing colorScheme still renders 7 wedges', async ({ page }) => {
			// Dedicated 3-way side-by-side (default/indigo/series) folded
			// into "Design" — a single dynamic "colorScheme (single intent
			// or CSS color)" HstText field, empty by default (falls back to
			// DEFAULT_PALETTE). The old "series" leg (per-series colour
			// cycling) doesn't apply to FIXTURE_WEEKLY (single series), so
			// it's dropped rather than faked — only default vs. a custom
			// value are compared.
			await openVariant(page, 'Design')
			const sandbox = sandboxOf(page)
			const wedges = sandbox.locator(`${ CHART } [data-cy^="origam-chart-polar-bar-wedge-"]`)
			await expect(wedges).toHaveCount(7, { timeout: 6000 })

			await fillHstText(page, 'colorScheme (single intent or CSS color)', 'indigo')
			await page.waitForTimeout(400)
			await expect(wedges).toHaveCount(7, { timeout: 6000 })
		})

		test('indigo ramp first wedge fill differs from intent default', async ({ page }) => {
			await openVariant(page, 'Design')
			const sandbox = sandboxOf(page)
			const wedge0 = sandbox.locator(`${ CHART } [data-cy="origam-chart-polar-bar-wedge-0"]`).first()

			const defaultStyle = await wedge0.getAttribute('style')

			await fillHstText(page, 'colorScheme (single intent or CSS color)', 'indigo')
			await page.waitForTimeout(400)
			const indigoStyle = await wedge0.getAttribute('style')

			expect(defaultStyle).not.toBe(indigoStyle)
		})
	})

	test.describe('Slots - Empty', () => {
		test('custom empty slot text is rendered when series is empty', async ({ page }) => {
			await openVariant(page, 'Slots - Empty')
			const sandbox = sandboxOf(page)

			const chart = sandbox.locator(CHART).first()
			await expect(chart).toBeVisible({ timeout: 8000 })

			const empty = sandbox.locator(`${ CHART } [data-cy="origam-chart-polar-bar-empty"]`).first()
			await expect(empty).toBeVisible()
			await expect(empty).toContainText('No activity data available')
		})

		test('no wedge paths are rendered in empty state', async ({ page }) => {
			await openVariant(page, 'Slots - Empty')
			const sandbox = sandboxOf(page)

			const chart = sandbox.locator(CHART).first()
			await expect(chart).toBeVisible({ timeout: 8000 })

			const wedges = sandbox.locator(`${ CHART } [data-cy^="origam-chart-polar-bar-wedge-"]`)
			await expect(wedges).toHaveCount(0)
		})
	})

	test.describe('Slots - Tooltip', () => {
		test('custom tooltip appears on wedge hover', async ({ page }) => {
			await openVariant(page, 'Slots - Tooltip')
			const sandbox = sandboxOf(page)

			const chart = sandbox.locator(CHART).first()
			await expect(chart).toBeVisible({ timeout: 8000 })

			const firstWedge = sandbox.locator(`${ CHART } [data-cy="origam-chart-polar-bar-wedge-0"]`).first()
			await firstWedge.hover()

			const tooltip = sandbox.locator('.custom-tooltip').first()
			await expect(tooltip).toBeVisible()
			await expect(tooltip).toContainText('hrs')
		})
	})

	test.describe('Events - point-click', () => {
		test('clicking a wedge fires point-click and logs the event', async ({ page }) => {
			// The removed polar-bar-emit-log DOM shell is gone — read back
			// from Histoire's own "Events" tab instead.
			await openVariant(page, 'Events - point-click')
			const sandbox = sandboxOf(page)

			const chart = sandbox.locator(CHART).first()
			await expect(chart).toBeVisible({ timeout: 8000 })

			const wedge = sandbox.locator(`${ CHART } [data-cy="origam-chart-polar-bar-wedge-2"]`).first()
			await wedge.click()
			await page.waitForTimeout(300)

			await openEventsTab(page)
			await expect(eventLogItems(page).first()).toContainText('point-click', { timeout: 4000 })
		})

		test('keyboard Enter on a wedge fires point-click', async ({ page }) => {
			await openVariant(page, 'Events - point-click')
			const sandbox = sandboxOf(page)

			const chart = sandbox.locator(CHART).first()
			await expect(chart).toBeVisible({ timeout: 8000 })

			const wedge = sandbox.locator(`${ CHART } [data-cy="origam-chart-polar-bar-wedge-0"]`).first()
			await wedge.focus()
			await page.keyboard.press('Enter')
			await page.waitForTimeout(300)

			await openEventsTab(page)
			await expect(eventLogItems(page).first()).toContainText('point-click', { timeout: 4000 })
		})
	})

	test.describe('Accessibility', () => {
		test('wedge paths have role=button and aria-label', async ({ page }) => {
			await openVariant(page, 'Default')
			const sandbox = sandboxOf(page)

			const chart = sandbox.locator(CHART).first()
			await expect(chart).toBeVisible({ timeout: 8000 })

			const wedge = sandbox.locator(`${ CHART } [data-cy="origam-chart-polar-bar-wedge-0"]`).first()
			await expect(wedge).toHaveAttribute('role', 'button')
			const label = await wedge.getAttribute('aria-label')
			expect(label).toBeTruthy()
			expect(label).toContain(':')
		})

		test('SVG has role=img', async ({ page }) => {
			await openVariant(page, 'Default')
			const sandbox = sandboxOf(page)

			const chart = sandbox.locator(CHART).first()
			await expect(chart).toBeVisible({ timeout: 8000 })

			const svg = sandbox.locator(`${ CHART } [data-cy="origam-chart-polar-bar-svg"]`).first()
			await expect(svg).toHaveAttribute('role', 'img')
		})
	})
})
