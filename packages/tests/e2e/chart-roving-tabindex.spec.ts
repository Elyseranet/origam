import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * #1333 — ONE tab stop per chart (roving tabindex), WCAG 2.1.1 / 2.4.3.
 *
 * Before the fix every point of the 20 charts below was `tabindex="0"`: the
 * keyboard had to cross one stop per point to get past a chart. Now the chart
 * is entered once, the arrows move between points, Home/End jump to the
 * extremities, Enter/Space activate (same emit as a click) and Tab leaves.
 *
 * The probe uses REAL `Tab` presses (never a count of `tabindex` attributes):
 * a focus order is a behaviour, not a markup. The emit is observed by
 * replacing the chart instance's `vnode.props` with a recorder — `emit()` reads
 * its handler there at call time — so one probe covers all 20 charts without a
 * dedicated "Events" Variant per story.
 *
 * Needs `E2E_STATIC=1` (reads the served `histoire.json`).
 */

const CHARTS = [
    'boxplot', 'bullet', 'candlestick', 'cartesian', 'heatmap', 'honeycomb', 'map', 'pareto',
    'pictorial', 'polar', 'polarbar', 'pyramid', 'radar', 'sankey', 'sparkline', 'streamgraph',
    'sunburst', 'treemap', 'variwide', 'wordcloud'
]
const storyIdOf = (suffix: string) => `components-stories-chart-origamchart${suffix}-story-vue`
const VARIANTS_PER_STORY = 4
const TAB_CAP = 700

// The zoom-reset button is a real, separate control: it keeps its own tab stop.
const POINTS = 'svg [role="button"]:not([data-cy="origam-chart-zoom-reset-btn"])'

type TManifest = { stories: Array<{ story?: { id: string, variants: Array<{ id: string }> }, id?: string, variants?: Array<{ id: string }> }> }

const tabStopsInSvg = async (page: Page): Promise<number> => {
    await page.evaluate(() => {
        document.getElementById('__pre')?.remove()
        const pre = document.createElement('button')
        pre.id = '__pre'
        pre.textContent = 'pre'
        document.body.prepend(pre)
        pre.focus()
    })
    const inSvg = () => page.evaluate(() => !!document.activeElement?.closest('svg'))
    let guard = 0
    while (!(await inSvg()) && guard++ < 40) await page.keyboard.press('Tab')
    let stops = 0
    while ((await inSvg()) && stops < TAB_CAP) {
        stops++
        await page.keyboard.press('Tab')
    }
    return stops
}

const activeIndex = (page: Page) => page.evaluate((sel) => {
    const items = [...document.querySelectorAll(sel)]
    return items.indexOf(document.activeElement as Element)
}, POINTS)

const tabbablePoints = (page: Page) => page.evaluate((sel) => (
    [...document.querySelectorAll(sel)].filter((el) => (el as HTMLElement).tabIndex >= 0).length
), POINTS)

for (const suffix of CHARTS) {
    const storyId = storyIdOf(suffix)
    test(`${storyId} : one tab stop, arrows, Home/End, Enter`, async ({ page, request }) => {
        test.setTimeout(180_000)
        const manifest = await request.get('/stories/histoire.json')
        expect(manifest.ok(), 'histoire.json (run with E2E_STATIC=1)').toBe(true)
        const { stories } = await manifest.json() as TManifest
        const entry = stories.map((s) => s.story ?? s).find((s) => s.id === storyId)
        expect(entry, `story ${storyId} served`).toBeTruthy()

        const report: string[] = []
        void report
        let probed = 0
        for (const variant of entry!.variants!.slice(0, VARIANTS_PER_STORY)) {
            await page.goto(`/stories/__sandbox.html?storyId=${storyId}&variantId=${variant.id}`)
            if (!(await page.locator('svg').first().waitFor({ timeout: 8_000 }).then(() => true, () => false))) continue
            const points = await page.locator(POINTS).count()
            if (points === 0) continue
            probed++

            // Record every emit of the chart that owns the first svg.
            await page.evaluate(() => {
                const w = window as unknown as { __emitted: string[] }
                w.__emitted = []
                const svg = document.querySelector('svg [role="button"]')!.closest('svg') as unknown as { __vueParentComponent: { vnode: { props: object | null } } }
                const vnode = svg.__vueParentComponent.vnode
                vnode.props = new Proxy(vnode.props ?? {}, {
                    get: (t, k) => (typeof k === 'string' && /^on[A-Z]/.test(k)
                        ? () => { w.__emitted.push(k) }
                        : (t as Record<string | symbol, unknown>)[k])
                })
            })

            const stops = await tabStopsInSvg(page)
            report.push(`${stops}/${points}`)
            console.log(`TABSTOPS ${suffix} ${variant.id} ${stops}/${points}`)
            // 1. One stop for the whole chart.
            expect(stops, `${variant.id}: Tab stops across ${points} points`).toBe(1)
            expect(await tabbablePoints(page), `${variant.id}: tabbable points`).toBe(1)

            // Back to the single entry point.
            await page.evaluate(() => (document.getElementById('__pre') as HTMLElement).focus())
            let guard = 0
            while (!(await page.evaluate(() => !!document.activeElement?.closest('svg'))) && guard++ < 40) await page.keyboard.press('Tab')
            const first = await activeIndex(page)
            expect(first, `${variant.id}: entry point is a point`).toBeGreaterThanOrEqual(0)

            if (points > 1) {
                // 2. ArrowRight moves, still a single tab stop.
                await page.keyboard.press('ArrowRight')
                const next = await activeIndex(page)
                expect(next, `${variant.id}: ArrowRight`).not.toBe(first)
                expect(await tabbablePoints(page), `${variant.id}: roving`).toBe(1)
                await page.keyboard.press('ArrowLeft')
                expect(await activeIndex(page), `${variant.id}: ArrowLeft returns`).toBe(first)
                // 3. Home / End.
                await page.keyboard.press('End')
                expect(await activeIndex(page), `${variant.id}: End`).toBe(points - 1)
                await page.keyboard.press('Home')
                expect(await activeIndex(page), `${variant.id}: Home`).toBe(0)
            }

            // 4. Enter and Space emit like a click.
            await page.keyboard.press('Enter')
            const afterEnter = await page.evaluate(() => (window as unknown as { __emitted: string[] }).__emitted.length)
            expect(afterEnter, `${variant.id}: Enter emits`).toBeGreaterThan(0)
            await page.keyboard.press('Space')
            const afterSpace = await page.evaluate(() => (window as unknown as { __emitted: string[] }).__emitted.length)
            expect(afterSpace, `${variant.id}: Space emits`).toBeGreaterThan(afterEnter)

            // 5. Tab leaves the chart in one keystroke.
            await page.keyboard.press('Tab')
            expect(await page.evaluate(() => !!document.activeElement?.closest('svg')), `${variant.id}: Tab leaves`).toBe(false)
        }
        expect(probed, `${storyId}: at least one Variant with focusable points`).toBeGreaterThan(0)
    })
}

/*
 * Vertical arrows. A chart with several series moves between series at the
 * same position; a single-series chart treats Up/Down like Left/Right (the
 * listbox / radio-group behaviour), so a vertical key is never dead.
 */
test('cartesian : ArrowDown/ArrowUp change series at the same position', async ({ page, request }) => {
    test.setTimeout(120_000)
    const storyId = storyIdOf('cartesian')
    const manifest = await request.get('/stories/histoire.json')
    const { stories } = await manifest.json() as TManifest
    const entry = stories.map((s) => s.story ?? s).find((s) => s.id === storyId)!
    let tested = false
    for (const variant of entry.variants!.slice(0, 8)) {
        await page.goto(`/stories/__sandbox.html?storyId=${storyId}&variantId=${variant.id}`)
        if (!(await page.locator('svg').first().waitFor({ timeout: 8_000 }).then(() => true, () => false))) continue
        const series = await page.evaluate(() => new Set([...document.querySelectorAll('svg [data-cy^="origam-chart-point-"]')].map((e) => e.getAttribute('data-cy')!.split('-')[3])).size)
        if (series < 2) continue
        await page.evaluate(() => (document.querySelector('svg [data-cy="origam-chart-point-0-1"]') as HTMLElement).focus())
        await page.keyboard.press('ArrowDown')
        expect(await page.evaluate(() => document.activeElement?.getAttribute('data-cy'))).toBe('origam-chart-point-1-1')
        await page.keyboard.press('ArrowUp')
        expect(await page.evaluate(() => document.activeElement?.getAttribute('data-cy'))).toBe('origam-chart-point-0-1')
        tested = true
        break
    }
    expect(tested, 'a Variant with >= 2 point series').toBe(true)
})
