import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamChartCartesian — les etiquettes de l'axe X se chevauchent-elles ? (#1325)
 * Mesure dans un vrai navigateur : boites des <text> de l'axe X, deux a deux.
 */
const STORY = '/stories/story/components-stories-chart-origamchartcartesian-story-vue'
const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const measure = (page: Page, width: number) =>
	sandboxOf(page).locator(`[data-cy="origam-chart-cartesian-responsive-${ width }"] [data-cy="origam-chart-cartesian-svg"]`).evaluate((svg: SVGSVGElement) => {
		const boxes = (Array.from(svg.querySelectorAll('.origam-chart__axis-label--x')) as SVGGraphicsElement[])
			.map((e) => e.getBoundingClientRect())
			.filter((r) => r.width > 0)
		let overlaps = 0
		for (let i = 0; i < boxes.length; i++) {
			for (let j = i + 1; j < boxes.length; j++) {
				const a = boxes[i]
				const b = boxes[j]
				if (a.left < b.right && b.left < a.right) overlaps++
			}
		}
		return { count: boxes.length, overlaps, widths: boxes.map((r) => Math.round(r.width * 10) / 10), lefts: boxes.map((r) => Math.round(r.left)) }
	})

for (const width of [320, 600, 960]) {
	test(`#1325 aucune paire d'etiquettes X ne se chevauche a ${ width }px`, async ({ page }) => {
		await page.setViewportSize({ width: 1200, height: 900 })
		await page.goto(STORY)
		await page.getByText('Responsive width').first().click()
		await sandboxOf(page).locator(`[data-cy="origam-chart-cartesian-responsive-${ width }"] [data-cy="origam-chart-cartesian-svg"]`).waitFor()
		const m = await measure(page, width)
		console.log(width, JSON.stringify(m))
		expect(m.count).toBeGreaterThan(1)
		expect(m.overlaps).toBe(0)
	})
}
