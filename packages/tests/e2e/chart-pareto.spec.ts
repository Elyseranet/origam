import { expect, test, type Page } from '@playwright/test'

import { eventLogItems, openEventsTab, selectHstOption, toggleHstCheckbox } from './_support/histoire-controls'

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

/**
 * #620 — le canal CLASSE de margin/padding, mesure en NAVIGATEUR.
 *
 * `useMargin` scinde sa sortie : la forme d'echelle (`margin="4"`) emet
 * SEULEMENT une classe utilitaire et laisse `marginStyles` vide. Pareto ne
 * destructurait que `marginStyles`, donc `margin="4"` etait totalement
 * inerte. Le spec Vitest voisin prouve que la CLASSE est desormais emise ;
 * celui-ci prouve qu'elle PEINT, ce que jsdom ne peut pas dire — il ne
 * resout jamais un `var()` et fabrique un `16px` de toute piece, valeur qui
 * se trouve etre exactement celle attendue ici. Mesurer cela sous jsdom
 * aurait donc produit un faux vert parfaitement credible.
 *
 * Valeur ABSOLUE et non un simple ecart : `.origam--m-4` resout
 * `var(--origam-space---4)`, declare a `16px` dans primitive.css:84.
 */
test.describe('OrigamChartPareto — margin/padding par classe utilitaire (#620)', () => {
	test('margin="4" emet .origam--m-4 ET peint 16px', async ({ page }) => {
		await openVariant(page, 'Design')
		await selectHstOption(page, 'Margin', '4')

		const host = sandboxOf(page).locator(CHART).first()
		await expect(host).toHaveClass(/origam--m-4/)
		await expect(host).toHaveCSS('margin-top', '16px')
		await expect(host).toHaveCSS('margin-left', '16px')
	})

	/**
	 * ⛔ MESURE, PAS SOUHAIT — le cote `padding` revele un SECOND defaut,
	 * distinct de #620 et hors de son perimetre.
	 *
	 * La classe `.origam--p-4` est bien emise depuis le correctif (assertion
	 * ci-dessous, et le spec Vitest voisin la prouve sur les six composants).
	 * Mais elle NE PEINT PAS : mesure reelle `12px` la ou l'echelle demande
	 * `16px`. Cause etablie, pas supposee — la regle scopee du composant
	 * (`OrigamChartPareto.vue:804`, `padding: var(--origam-chart---padding,
	 * 12px)`) compile en `.origam-chart-pareto[data-v-hash]`, soit une
	 * specificite (0,2,0), quand une utilitaire vaut (0,1,0). L'utilitaire
	 * perd la cascade, et l'ordre de chargement n'y change rien.
	 *
	 * Les SIX composants du lot declarent cette meme regle scopee — y compris
	 * Gauge, Heatmap et Pictorial, qui bindaient deja `paddingClasses`. Le
	 * `padding` d'echelle y etait donc DEJA inerte avant #620 : le correctif
	 * du canal classe etait necessaire, il n'est pas suffisant.
	 *
	 * Le canal INLINE reste intact — `padding="16px"` et `:padding="16"`
	 * passent par `paddingStyles`, donc par l'attribut `style`, qui bat
	 * n'importe quelle regle de feuille. Seule la forme d'ECHELLE est
	 * touchee. C'est ce que fige l'assertion negative ci-dessous : si un jour
	 * la cascade est corrigee (famille #391 / #514 / #607), ce test tombera
	 * et devra etre bascule en `16px`. C'est voulu — un test qui echoue
	 * quand un defaut est repare vaut mieux qu'un defaut sans temoin.
	 */
	test('padding="4" emet .origam--p-4, mais la regle scopee du composant l\'emporte', async ({ page }) => {
		await openVariant(page, 'Design')
		await selectHstOption(page, 'Padding', '4')

		const host = sandboxOf(page).locator(CHART).first()

		// Ce que #620 corrige : la classe EST emise.
		await expect(host).toHaveClass(/origam--p-4/)

		// Ce que #620 ne corrige pas : elle ne gagne pas la cascade.
		await expect(host).toHaveCSS('padding-top', '12px')
	})

	test('le canal INLINE du padding, lui, n\'est pas masque', async ({ page }) => {
		// Contre-epreuve : prouve que le blocage ci-dessus tient bien a la
		// specificite d'une regle de feuille, et non a un `padding` mort.
		await openVariant(page, 'Design')

		const painted = await sandboxOf(page).locator(CHART).first().evaluate((el) => {
			el.setAttribute('style', 'padding: 16px')

			return getComputedStyle(el).paddingTop
		})

		expect(painted).toBe('16px')
	})
})
