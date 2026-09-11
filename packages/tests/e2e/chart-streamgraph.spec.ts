import { expect, test, type Page } from '@playwright/test'

import { eventLogItems, openEventsTab, selectHstOption } from './_support/histoire-controls'

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
 * Story realignment (canonical Design/Functional/Events/Slots structure):
 * the old side-by-side "Prop — offsetMode / smoothing / colorScheme"
 * Variants were folded into the "Design" Variant's controls (offsetMode,
 * smoothing) — driven in sequence via `selectHstOption` instead of
 * comparing DOM siblings. `colorScheme` has NO surviving control or fixture
 * anywhere in the story (bound in the template but never exposed) — see the
 * `test.fixme` block below. The bespoke `[data-cy="…-log"]` event log shell
 * is gone too; emits are read back from Histoire's own "Events" tab.
 */

const STORY = '/stories/story/components-stories-chart-origamchartstreamgraph-story-vue'
const ROOT = '[data-cy="origam-chart-streamgraph"]'

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

test.describe('OrigamChartStreamgraph — Design Variant offsetMode control', () => {
	test('cycles through all four offset modes without error', async ({ page }) => {
		await openVariant(page, 'Design')
		const sandbox = sandboxOf(page)
		const root = sandbox.locator(ROOT).first()
		await expect(root).toBeVisible({ timeout: 8000 })

		for (const label of ['wiggle (canonical)', 'silhouette (centered)', 'expand (100% normalised)', 'zero (stacked area)']) {
			await selectHstOption(page, 'Offset Mode', label)
			const ribbons = sandbox.locator(`${ ROOT } .origam-chart-streamgraph__ribbon`)
			await expect(ribbons).not.toHaveCount(0)
		}
	})

	test('wiggle and zero path data differ (different baselines)', async ({ page }) => {
		await openVariant(page, 'Design')
		const sandbox = sandboxOf(page)
		const ribbon = sandbox.locator(`${ ROOT } .origam-chart-streamgraph__ribbon`).first()

		await selectHstOption(page, 'Offset Mode', 'wiggle (canonical)')
		await expect(ribbon).toBeVisible({ timeout: 8000 })
		const wiggleD = await ribbon.getAttribute('d')

		await selectHstOption(page, 'Offset Mode', 'zero (stacked area)')
		await expect(ribbon).toBeVisible({ timeout: 8000 })
		const zeroD = await ribbon.getAttribute('d')

		expect(wiggleD).not.toBe(zeroD)
	})
})

// ---------------------------------------------------------------------------
// Design Variant — smoothing control
// ---------------------------------------------------------------------------

test.describe('OrigamChartStreamgraph — Design Variant smoothing control', () => {
	test('none and curve path data differ (C vs L commands)', async ({ page }) => {
		await openVariant(page, 'Design')
		const sandbox = sandboxOf(page)
		const ribbon = sandbox.locator(`${ ROOT } .origam-chart-streamgraph__ribbon`).first()

		await selectHstOption(page, 'Smoothing', 'none (linear)')
		await expect(ribbon).toBeVisible({ timeout: 8000 })
		const noneD = await ribbon.getAttribute('d')

		await selectHstOption(page, 'Smoothing', 'curve (Catmull-Rom)')
		await expect(ribbon).toBeVisible({ timeout: 8000 })
		const curveD = await ribbon.getAttribute('d')

		expect(noneD).not.toBeNull()
		expect(curveD).not.toBeNull()
		// curve path uses C (cubic bezier) commands; none uses only L (line-to)
		expect(curveD).toMatch(/C\s/)
		expect(noneD).not.toMatch(/C\s/)
	})
})

// ---------------------------------------------------------------------------
// Prop — colorScheme [REMOVED FROM STORY]
// ---------------------------------------------------------------------------

// Story realignment: `colorScheme` is bound in both the "Design" and
// "Default" Variant templates (`:color-scheme="state.colorScheme && ..."`)
// but NO control (HstSelect or otherwise) ever sets `state.colorScheme`,
// and no dedicated fixture Variant survives either. There is no way to
// drive this prop from the running story at all anymore — genuine coverage
// gap, not a renamed Variant. Needs a story-side decision: either add a
// Color Scheme control to the Design Variant, or accept the loss.
test.describe('OrigamChartStreamgraph — Prop colorScheme [REMOVED FROM STORY]', () => {
	test('renders 3 charts in the colorScheme variant', async ({ page }) => {
		test.fixme(true, 'No control anywhere in the story sets colorScheme — see chart-streamgraph.spec.ts header note')
		await openVariant(page, 'Design')
		const sandbox = sandboxOf(page)

		const def = sandbox.locator('[data-cy="streamgraph-color-default"]').first()
		await expect(def).toBeVisible({ timeout: 8000 })
	})

	test('warm chart first ribbon has warm fill color', async ({ page }) => {
		test.fixme(true, 'No control anywhere in the story sets colorScheme — see chart-streamgraph.spec.ts header note')
		await openVariant(page, 'Design')
		const sandbox = sandboxOf(page)

		const warmRibbon = sandbox.locator('[data-cy="streamgraph-color-warm"] .origam-chart-streamgraph__ribbon').first()
		await expect(warmRibbon).toBeVisible({ timeout: 8000 })
	})

	test('default and warm charts have different ribbon fill colors', async ({ page }) => {
		test.fixme(true, 'No control anywhere in the story sets colorScheme — see chart-streamgraph.spec.ts header note')
		await openVariant(page, 'Design')
		const sandbox = sandboxOf(page)

		const defaultRibbon = sandbox.locator('[data-cy="streamgraph-color-default"] .origam-chart-streamgraph__ribbon').first()
		const warmRibbon = sandbox.locator('[data-cy="streamgraph-color-warm"] .origam-chart-streamgraph__ribbon').first()
		await expect(defaultRibbon).toBeVisible({ timeout: 8000 })
		await expect(warmRibbon).toBeVisible({ timeout: 8000 })
	})
})

// ---------------------------------------------------------------------------
// Slot — tooltip
// ---------------------------------------------------------------------------

test.describe('OrigamChartStreamgraph — Slot tooltip', () => {
	test('custom tooltip slot renders on ribbon hover', async ({ page }) => {
		await openVariant(page, 'Slots - Tooltip')
		const sandbox = sandboxOf(page)

		const chart = sandbox.locator('[data-cy="origam-chart-streamgraph"]').first()
		await expect(chart).toBeVisible({ timeout: 8000 })

		const ribbon = sandbox.locator('[data-cy="origam-chart-streamgraph"] .origam-chart-streamgraph__ribbon').first()
		await ribbon.hover()

		const tooltip = sandbox.locator('.custom-tooltip')
		await expect(tooltip).toBeVisible()
	})

	test('custom tooltip shows all series rows on hover', async ({ page }) => {
		await openVariant(page, 'Slots - Tooltip')
		const sandbox = sandboxOf(page)

		const chart = sandbox.locator('[data-cy="origam-chart-streamgraph"]').first()
		await expect(chart).toBeVisible({ timeout: 8000 })

		// Hovering a ribbon sets hoveredSeriesIndex (via onRibbonEnter) and
		// hoveredXIndex (via onSvgMouseMove fired as the pointer crosses the SVG).
		// Both must be non-null for the tooltip to render.
		const ribbon = sandbox.locator('[data-cy="origam-chart-streamgraph"] .origam-chart-streamgraph__ribbon').first()
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
		await openVariant(page, 'Slots - Empty')
		const sandbox = sandboxOf(page)

		const chart = sandbox.locator('[data-cy="origam-chart-streamgraph"]').first()
		await expect(chart).toBeVisible({ timeout: 8000 })

		const emptyEl = sandbox.locator('.custom-empty')
		await expect(emptyEl).toBeVisible()
	})

	test('no ribbon paths are rendered when series is empty', async ({ page }) => {
		await openVariant(page, 'Slots - Empty')
		const sandbox = sandboxOf(page)

		const chart = sandbox.locator('[data-cy="origam-chart-streamgraph"]').first()
		await expect(chart).toBeVisible({ timeout: 8000 })

		const ribbons = sandbox.locator('[data-cy="origam-chart-streamgraph"] .origam-chart-streamgraph__ribbon')
		await expect(ribbons).toHaveCount(0)
	})
})

// ---------------------------------------------------------------------------
// Emit — point-click
// ---------------------------------------------------------------------------

// Story realignment: the bespoke `[data-cy="streamgraph-emit-log"]` shell is
// gone — emits are read back from Histoire's own "Events" tab (see
// `openEventsTab` / `eventLogItems`). Each event now has its own dedicated
// "Events - {name}" Variant with only that one listener wired — the
// series-toggle assertion must navigate to "Events - series-toggle"
// (FIXTURE_MUSIC), not the point-click Variant (FIXTURE_TECH, no
// series-toggle listener at all).
test.describe('OrigamChartStreamgraph — Emit point-click', () => {
	test('clicking a ribbon fires point-click and logs to pre', async ({ page }) => {
		await openVariant(page, 'Events - point-click')
		const sandbox = sandboxOf(page)

		const chart = sandbox.locator(ROOT).first()
		await expect(chart).toBeVisible({ timeout: 8000 })

		const ribbon = sandbox.locator(`${ ROOT } .origam-chart-streamgraph__ribbon`).first()
		await ribbon.click()

		await openEventsTab(page)
		await expect(eventLogItems(page).first()).toContainText('point-click', { timeout: 4000 })
	})

	test('keyboard Enter on a ribbon fires point-click', async ({ page }) => {
		// ⛔ Ce test etait un `test.fail` : `onRibbonActivate` passait par
		// `hoveredPoint`, qui exige `hoveredXIndex` — un ref que SEUL le
		// mousemove renseigne. Au clavier il valait `null` et l'emit etait
		// avale en silence, alors que le ruban portait `tabindex="0"` et
		// `role="button"`. Corrige dans #426 : le point est resolu depuis le
		// ruban, sans dependre d'un etat de survol.
		await openVariant(page, 'Events - point-click')
		const sandbox = sandboxOf(page)

		const chart = sandbox.locator(ROOT).first()
		await expect(chart).toBeVisible({ timeout: 8000 })

		const ribbon = sandbox.locator(`${ ROOT } .origam-chart-streamgraph__ribbon`).first()
		await ribbon.focus()
		await ribbon.press('Enter')

		await openEventsTab(page)
		await expect(eventLogItems(page).first()).toContainText('point-click', { timeout: 4000 })
	})

	test('legend toggle fires series-toggle event', async ({ page }) => {
		await openVariant(page, 'Events - series-toggle')
		const sandbox = sandboxOf(page)

		const chart = sandbox.locator(ROOT).first()
		await expect(chart).toBeVisible({ timeout: 8000 })

		const legendItem = sandbox.locator('.origam-chart__legend-item').first()
		await legendItem.click()

		await openEventsTab(page)
		await expect(eventLogItems(page).first()).toContainText('series-toggle', { timeout: 4000 })
	})
})
