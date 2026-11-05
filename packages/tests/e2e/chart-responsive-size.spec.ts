import { expect, test, type Page } from '@playwright/test'

/**
 * Charts hors cartesien — la surface de dessin suit-elle le conteneur ? (#1324)
 *
 * Mesure dans un vrai navigateur : le `viewBox` du SVG vs la boite rendue.
 * Tant que le `viewBox` est fige (600 x 400...), une unite de viewBox ne vaut
 * pas un pixel : le trace est mis a l'echelle et le texte avec lui.
 * - charts rectangulaires : viewBox = boite rendue (largeur ET hauteur) ;
 * - charts radiaux : la largeur suit le conteneur, la hauteur lui est egale
 *   (ratio 1:1, le cercle n'est jamais ecrase).
 */
const slugOf = (name: string) => `/stories/story/components-stories-chart-origamchart${ name.toLowerCase() }-story-vue`
const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const RECTANGULAR = [
	['BoxPlot', 'box-plot'], ['Bullet', 'bullet'], ['Candlestick', 'candlestick'],
	['Heatmap', 'heatmap'], ['Pareto', 'pareto'], ['Pictorial', 'pictorial'],
	['Pyramid', 'pyramid'], ['Sankey', 'sankey'], ['Streamgraph', 'streamgraph'],
	['Treemap', 'treemap'], ['Variwide', 'variwide'], ['WordCloud', 'word-cloud']
] as const
const RADIAL = [
	['Gauge', 'gauge'], ['Polar', 'polar'], ['PolarBar', 'polar-bar'],
	['Radar', 'radar'], ['Sunburst', 'sunburst']
] as const

const measure = async (page: Page, tag: string, width: number) => {
	const svg = sandboxOf(page).locator(`[data-cy="origam-chart-${ tag }-responsive-${ width }"] [data-cy="origam-chart-${ tag }-svg"]`)
	await svg.waitFor()
	// Laisse le ResizeObserver converger (deux passes au plus pour le mode carre).
	await page.waitForTimeout(400)
	return svg.evaluate((el: SVGSVGElement, cy: string) => {
		const box = el.getBoundingClientRect()
		const host = el.closest(`[data-cy="${ cy }"]`)!.getBoundingClientRect()
		return { hostWidth: host.width, svgWidth: box.width, svgHeight: box.height, vbWidth: el.viewBox.baseVal.width, vbHeight: el.viewBox.baseVal.height }
	}, `origam-chart-${ tag }-responsive-${ width }`)
}

const open = async (page: Page, name: string) => {
	await page.setViewportSize({ width: 1400, height: 1000 })
	await page.goto(slugOf(name))
	await page.getByText('Responsive width').first().click()
}

for (const [name, tag] of RECTANGULAR) {
	for (const width of [480, 960]) {
		test(`#1324 ${ name } : le viewBox suit la boite du conteneur a ${ width }px`, async ({ page }) => {
			await open(page, name)
			const m = await measure(page, tag, width)
			console.log(name, width, JSON.stringify(m))
			// L'iframe du bac a sable peut etre plus etroite que `width` : on compare au conteneur rendu.
			expect(m.hostWidth - m.svgWidth).toBeLessThan(40)
			expect(Math.abs(m.vbWidth - m.svgWidth)).toBeLessThan(2)
			expect(Math.abs(m.vbHeight - m.svgHeight)).toBeLessThan(2)
		})
	}
}

for (const [name, tag] of RADIAL) {
	for (const width of [480, 960]) {
		test(`#1324 ${ name } : largeur = conteneur, hauteur = largeur a ${ width }px`, async ({ page }) => {
			await open(page, name)
			const m = await measure(page, tag, width)
			console.log(name, width, JSON.stringify(m))
			// L'iframe du bac a sable peut etre plus etroite que `width` : on compare au conteneur rendu.
			expect(m.hostWidth - m.svgWidth).toBeLessThan(40)
			expect(Math.abs(m.vbWidth - m.svgWidth)).toBeLessThan(2)
			expect(Math.abs(m.vbHeight - m.vbWidth)).toBeLessThan(2)
			expect(Math.abs(m.svgHeight - m.svgWidth)).toBeLessThan(2)
		})
	}
}
