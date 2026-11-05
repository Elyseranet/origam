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
/* Charts a rapport hauteur / largeur impose : cercle 1:1, jauge 280/360, carte 2:1. */
const RADIAL = [
	['Gauge', 'gauge', 280 / 360], ['Polar', 'polar', 1], ['PolarBar', 'polar-bar', 1],
	['Radar', 'radar', 1], ['Sunburst', 'sunburst', 1], ['Map', 'map', 0.5]
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

for (const [name, tag, ratio] of RADIAL) {
	for (const width of [480, 960]) {
		test(`#1324 ${ name } : largeur = conteneur, hauteur = largeur x ${ ratio.toFixed(3) } a ${ width }px`, async ({ page }) => {
			await open(page, name)
			const m = await measure(page, tag, width)
			console.log(name, width, JSON.stringify(m))
			// L'iframe du bac a sable peut etre plus etroite que `width` : on compare au conteneur rendu.
			expect(m.hostWidth - m.svgWidth).toBeLessThan(40)
			expect(Math.abs(m.vbWidth - m.svgWidth)).toBeLessThan(2)
			expect(Math.abs(m.vbHeight - m.vbWidth * ratio)).toBeLessThan(2)
			expect(Math.abs(m.svgHeight - m.svgWidth * ratio)).toBeLessThan(2)
		})
	}
}

/* Sparkline : le viewBox suit la boite et rien n'est deforme (marqueur rond, de taille constante). */
const markerBox = (page: Page, width: number) =>
	sandboxOf(page)
		.locator(`[data-cy="origam-chart-sparkline-responsive-${ width }"] .origam-chart-sparkline__marker`).first()
		.evaluate((c: SVGCircleElement) => { const r = c.getBoundingClientRect(); return { w: r.width, h: r.height } })

for (const width of [480, 960]) {
	test(`#1324 Sparkline : viewBox = boite, marqueur circulaire a ${ width }px`, async ({ page }) => {
		await open(page, 'Sparkline')
		const m = await measure(page, 'sparkline', width)
		const marker = await markerBox(page, width)
		console.log('Sparkline', width, JSON.stringify({ ...m, marker }))
		expect(Math.abs(m.vbWidth - m.svgWidth)).toBeLessThan(2)
		expect(Math.abs(m.vbHeight - m.svgHeight)).toBeLessThan(2)
		expect(Math.abs(marker.w - marker.h)).toBeLessThan(0.5)
	})
}

test('#1324 Sparkline : la taille du marqueur ne depend pas de la largeur', async ({ page }) => {
	await open(page, 'Sparkline')
	await measure(page, 'sparkline', 480)
	const narrow = await markerBox(page, 480)
	await measure(page, 'sparkline', 960)
	const wide = await markerBox(page, 960)
	expect(Math.abs(narrow.w - wide.w)).toBeLessThan(0.5)
})
