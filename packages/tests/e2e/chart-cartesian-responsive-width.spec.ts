import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamChartCartesian — le trace suit-il la largeur du conteneur ? (#1317)
 * Mesure dans un vrai navigateur : largeur de la boite du SVG vs largeur
 * occupee par ce qui est dessine dedans.
 */
const STORY = '/stories/story/components-stories-chart-origamchartcartesian-story-vue'
const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const measure = (page: Page) =>
	sandboxOf(page).locator('[data-cy="origam-chart-cartesian-responsive-960"] [data-cy="origam-chart-cartesian-svg"]').evaluate((svg: SVGSVGElement) => {
		const box = svg.getBoundingClientRect()
		const all = Array.from(svg.querySelectorAll('path, line, rect, circle')) as SVGGraphicsElement[]
		const rects = all.map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0 || r.height > 0)
		const drawn = Math.max(...rects.map((r) => r.right)) - Math.min(...rects.map((r) => r.left))
		const vbWidth = svg.viewBox.baseVal.width
		return { svgWidth: box.width, vbWidth, gap: box.width - drawn, drawn, ratio: drawn / box.width, count: rects.length }
	})

for (const width of [900, 1400]) {
	test(`#1317 le trace occupe la largeur du conteneur a ${ width }px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 })
		await page.goto(STORY)
		await page.getByText('Responsive width').first().click()
		await sandboxOf(page).locator('[data-cy="origam-chart-cartesian-responsive-960"] [data-cy="origam-chart-cartesian-svg"]').waitFor()
		const m = await measure(page)
		console.log(width, JSON.stringify(m))
		expect(m.count).toBeGreaterThan(3)
		// 1 unite de viewBox = 1 px, et seules les marges de l'axe (~72) restent hors trace.
		expect(Math.abs(m.vbWidth - m.svgWidth)).toBeLessThan(2)
		expect(m.gap).toBeLessThan(90)
	})
}
