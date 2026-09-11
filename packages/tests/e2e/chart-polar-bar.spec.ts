import { expect, test, type Page } from '@playwright/test'

/**
 * E2E spec for OrigamChartPolarBar.
 *
 * Navigates to each Variant in the Histoire story and asserts:
 * 1. SVG is rendered with the expected number of wedge paths.
 * 2. Distinct props (innerRadius, startAngle, gap, colorScheme) produce
 *    visually distinct computed attributes on the rendered paths.
 * 3. Empty state renders the fallback slot text.
 * 4. point-click emit logs a line in the playground log.
 *
 * URL scheme: /story/components-stories-chart-origamchartpolarbar-story-vue
 * Elements live inside the Histoire sandbox iframe — accessed via frameLocator.
 */

const STORY_PATH = '/stories/story/components-stories-chart-origamchartpolarbar-story-vue'

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

			const chart = sandbox.locator('[data-cy="polar-bar-playground-chart"]').first()
			await expect(chart).toBeVisible({ timeout: 8000 })

			const paths = sandbox.locator('[data-cy="polar-bar-playground-chart"] [data-cy^="origam-chart-polar-bar-wedge-"]')
			await expect(paths).toHaveCount(7)
		})

		test('each wedge has a non-empty d attribute', async ({ page }) => {
			await openVariant(page, 'Default')
			const sandbox = sandboxOf(page)

			const chart = sandbox.locator('[data-cy="polar-bar-playground-chart"]').first()
			await expect(chart).toBeVisible({ timeout: 8000 })

			const wedges = sandbox.locator('[data-cy^="origam-chart-polar-bar-wedge-"]')
			const count = await wedges.count()
			expect(count).toBe(7)

			for (let i = 0; i < count; i++) {
				const d = await wedges.nth(i).getAttribute('d')
				expect(d).toBeTruthy()
				expect(d!.length).toBeGreaterThan(10)
			}
		})

		test('wedge click appends a line to the log', async ({ page }) => {
			await openVariant(page, 'Default')
			const sandbox = sandboxOf(page)

			const chart = sandbox.locator('[data-cy="polar-bar-playground-chart"]').first()
			await expect(chart).toBeVisible({ timeout: 8000 })

			const firstWedge = sandbox.locator('[data-cy="origam-chart-polar-bar-wedge-0"]').first()
			await firstWedge.click()

			const log = sandbox.locator('[data-cy="polar-bar-playground-log"]').first()
			await expect(log).toContainText('point-click')
		})
	})

	test.describe('Prop — innerRadius', () => {
		test('innerRadius=0 wedge reaches SVG center (d starts with "M 0,0")', async ({ page }) => {
			await openVariant(page, 'Prop — innerRadius (0 vs 0.4)')
			const sandbox = sandboxOf(page)

			const container = sandbox.locator('[data-cy="polar-bar-inner-radius"]').first()
			await expect(container).toBeVisible({ timeout: 8000 })

			const wedge0 = sandbox.locator('[data-cy="polar-bar-inner-radius-0"] [data-cy="origam-chart-polar-bar-wedge-0"]').first()
			const d0 = await wedge0.getAttribute('d')
			expect(d0).toMatch(/M 0,0/)
		})

		test('innerRadius=0.4 wedge d attribute does NOT start with M 0,0', async ({ page }) => {
			await openVariant(page, 'Prop — innerRadius (0 vs 0.4)')
			const sandbox = sandboxOf(page)

			const container = sandbox.locator('[data-cy="polar-bar-inner-radius"]').first()
			await expect(container).toBeVisible({ timeout: 8000 })

			const wedge04 = sandbox.locator('[data-cy="polar-bar-inner-radius-04"] [data-cy="origam-chart-polar-bar-wedge-0"]').first()
			const d04 = await wedge04.getAttribute('d')
			expect(d04).not.toMatch(/^M 0,0/)
		})

		test('d paths differ between innerRadius=0 and innerRadius=0.4', async ({ page }) => {
			await openVariant(page, 'Prop — innerRadius (0 vs 0.4)')
			const sandbox = sandboxOf(page)

			const container = sandbox.locator('[data-cy="polar-bar-inner-radius"]').first()
			await expect(container).toBeVisible({ timeout: 8000 })

			const w0 = sandbox.locator('[data-cy="polar-bar-inner-radius-0"] [data-cy="origam-chart-polar-bar-wedge-0"]').first()
			const w4 = sandbox.locator('[data-cy="polar-bar-inner-radius-04"] [data-cy="origam-chart-polar-bar-wedge-0"]').first()

			const d0 = await w0.getAttribute('d')
			const d4 = await w4.getAttribute('d')
			expect(d0).not.toBe(d4)
		})
	})

	test.describe('Prop — startAngle', () => {
		test('three angle variants each render 5 wedges', async ({ page }) => {
			await openVariant(page, 'Prop — startAngle (0 / -π÷2 / π÷4)')
			const sandbox = sandboxOf(page)

			const container = sandbox.locator('[data-cy="polar-bar-start-angle"]').first()
			await expect(container).toBeVisible({ timeout: 8000 })

			for (const cy of ['polar-bar-angle-0', 'polar-bar-angle-neg-half-pi', 'polar-bar-angle-quarter-pi']) {
				const count = await sandbox.locator(`[data-cy="${ cy }"] [data-cy^="origam-chart-polar-bar-wedge-"]`).count()
				expect(count).toBe(5)
			}
		})

		test('first wedge d attribute differs across startAngle values', async ({ page }) => {
			await openVariant(page, 'Prop — startAngle (0 / -π÷2 / π÷4)')
			const sandbox = sandboxOf(page)

			const container = sandbox.locator('[data-cy="polar-bar-start-angle"]').first()
			await expect(container).toBeVisible({ timeout: 8000 })

			const d0 = await sandbox.locator('[data-cy="polar-bar-angle-0"] [data-cy="origam-chart-polar-bar-wedge-0"]').first().getAttribute('d')
			const dNeg = await sandbox.locator('[data-cy="polar-bar-angle-neg-half-pi"] [data-cy="origam-chart-polar-bar-wedge-0"]').first().getAttribute('d')
			const dPos = await sandbox.locator('[data-cy="polar-bar-angle-quarter-pi"] [data-cy="origam-chart-polar-bar-wedge-0"]').first().getAttribute('d')

			expect(d0).not.toBe(dNeg)
			expect(d0).not.toBe(dPos)
		})
	})

	test.describe('Prop — gap', () => {
		test('gap=0 and gap=0.05 produce different d paths', async ({ page }) => {
			await openVariant(page, 'Prop — gap (0 vs 0.05)')
			const sandbox = sandboxOf(page)

			const container = sandbox.locator('[data-cy="polar-bar-gap"]').first()
			await expect(container).toBeVisible({ timeout: 8000 })

			const d0 = await sandbox.locator('[data-cy="polar-bar-gap-0"] [data-cy="origam-chart-polar-bar-wedge-0"]').first().getAttribute('d')
			const d5 = await sandbox.locator('[data-cy="polar-bar-gap-005"] [data-cy="origam-chart-polar-bar-wedge-0"]').first().getAttribute('d')

			expect(d0).not.toBe(d5)
		})
	})

	test.describe('Prop — colorScheme', () => {
		test('all three colour variants render 5 wedges', async ({ page }) => {
			await openVariant(page, 'Prop — colorScheme')
			const sandbox = sandboxOf(page)

			const container = sandbox.locator('[data-cy="polar-bar-color-scheme"]').first()
			await expect(container).toBeVisible({ timeout: 8000 })

			for (const cy of ['polar-bar-color-default', 'polar-bar-color-indigo', 'polar-bar-color-series']) {
				const count = await sandbox.locator(`[data-cy="${ cy }"] [data-cy^="origam-chart-polar-bar-wedge-"]`).count()
				expect(count).toBe(5)
			}
		})

		test('indigo ramp first wedge fill differs from intent default', async ({ page }) => {
			await openVariant(page, 'Prop — colorScheme')
			const sandbox = sandboxOf(page)

			const container = sandbox.locator('[data-cy="polar-bar-color-scheme"]').first()
			await expect(container).toBeVisible({ timeout: 8000 })

			const defaultWedge = sandbox.locator('[data-cy="polar-bar-color-default"] [data-cy="origam-chart-polar-bar-wedge-0"]').first()
			const indigoWedge = sandbox.locator('[data-cy="polar-bar-color-indigo"] [data-cy="origam-chart-polar-bar-wedge-0"]').first()

			const defaultStyle = await defaultWedge.getAttribute('style')
			const indigoStyle = await indigoWedge.getAttribute('style')

			expect(defaultStyle).not.toBe(indigoStyle)
		})
	})

	test.describe('Slot — empty', () => {
		test('custom empty slot text is rendered when series is empty', async ({ page }) => {
			await openVariant(page, 'Slot — empty')
			const sandbox = sandboxOf(page)

			const chart = sandbox.locator('[data-cy="polar-bar-slot-empty-chart"]').first()
			await expect(chart).toBeVisible({ timeout: 8000 })

			const empty = sandbox.locator('[data-cy="polar-bar-slot-empty-chart"] [data-cy="origam-chart-polar-bar-empty"]').first()
			await expect(empty).toBeVisible()
			await expect(empty).toContainText('No activity data available')
		})

		test('no wedge paths are rendered in empty state', async ({ page }) => {
			await openVariant(page, 'Slot — empty')
			const sandbox = sandboxOf(page)

			const chart = sandbox.locator('[data-cy="polar-bar-slot-empty-chart"]').first()
			await expect(chart).toBeVisible({ timeout: 8000 })

			const wedges = sandbox.locator('[data-cy="polar-bar-slot-empty-chart"] [data-cy^="origam-chart-polar-bar-wedge-"]')
			await expect(wedges).toHaveCount(0)
		})
	})

	test.describe('Slot — tooltip', () => {
		test('custom tooltip appears on wedge hover', async ({ page }) => {
			await openVariant(page, 'Slot — tooltip (custom card with percentage)')
			const sandbox = sandboxOf(page)

			const chart = sandbox.locator('[data-cy="polar-bar-slot-tooltip-chart"]').first()
			await expect(chart).toBeVisible({ timeout: 8000 })

			const firstWedge = sandbox.locator('[data-cy="polar-bar-slot-tooltip-chart"] [data-cy="origam-chart-polar-bar-wedge-0"]').first()
			await firstWedge.hover()

			const tooltip = sandbox.locator('.custom-tooltip').first()
			await expect(tooltip).toBeVisible()
			await expect(tooltip).toContainText('hrs')
		})
	})

	test.describe('Emit — point-click', () => {
		test('clicking a wedge fires point-click and logs the event', async ({ page }) => {
			await openVariant(page, 'Emit — point-click')
			const sandbox = sandboxOf(page)

			const chart = sandbox.locator('[data-cy="polar-bar-emit-chart"]').first()
			await expect(chart).toBeVisible({ timeout: 8000 })

			const wedge = sandbox.locator('[data-cy="polar-bar-emit-chart"] [data-cy="origam-chart-polar-bar-wedge-2"]').first()
			await wedge.click()

			const log = sandbox.locator('[data-cy="polar-bar-emit-log"]').first()
			await expect(log).toContainText('point-click')
		})

		test('keyboard Enter on a wedge fires point-click', async ({ page }) => {
			await openVariant(page, 'Emit — point-click')
			const sandbox = sandboxOf(page)

			const chart = sandbox.locator('[data-cy="polar-bar-emit-chart"]').first()
			await expect(chart).toBeVisible({ timeout: 8000 })

			const wedge = sandbox.locator('[data-cy="polar-bar-emit-chart"] [data-cy="origam-chart-polar-bar-wedge-0"]').first()
			await wedge.focus()
			await page.keyboard.press('Enter')

			const log = sandbox.locator('[data-cy="polar-bar-emit-log"]').first()
			await expect(log).toContainText('point-click')
		})
	})

	test.describe('Accessibility', () => {
		test('wedge paths have role=button and aria-label', async ({ page }) => {
			await openVariant(page, 'Default')
			const sandbox = sandboxOf(page)

			const chart = sandbox.locator('[data-cy="polar-bar-playground-chart"]').first()
			await expect(chart).toBeVisible({ timeout: 8000 })

			const wedge = sandbox.locator('[data-cy="origam-chart-polar-bar-wedge-0"]').first()
			await expect(wedge).toHaveAttribute('role', 'button')
			const label = await wedge.getAttribute('aria-label')
			expect(label).toBeTruthy()
			expect(label).toContain(':')
		})

		test('SVG has role=img', async ({ page }) => {
			await openVariant(page, 'Default')
			const sandbox = sandboxOf(page)

			const chart = sandbox.locator('[data-cy="polar-bar-playground-chart"]').first()
			await expect(chart).toBeVisible({ timeout: 8000 })

			const svg = sandbox.locator('[data-cy="origam-chart-polar-bar-svg"]').first()
			await expect(svg).toHaveAttribute('role', 'img')
		})
	})
})
