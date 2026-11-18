import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * #1318 / #1153 — a chart `<svg>` must not be `role="img"` while its data
 * points are focusable `role="button"` (axe `nested-interactive`, WCAG 4.1.2).
 *
 * Measured BEFORE the fix (Chromium, `histoire dev`, 2-3 Variants per story):
 * every chart below reported one violation per Variant — Cartesian 48 buttons
 * in the sampled Variants, Heatmap 504, Sankey 42, Candlestick 42… The root
 * `<svg>` is now `role="group"` (`CHART_SVG_ROLE`), the points keep
 * `role="button"` + `tabindex="0"`.
 *
 * The sweep reads the served catalogue (`histoire.json`, needs `E2E_STATIC=1`)
 * and checks the first VARIANTS_PER_STORY Variants of every chart story. The
 * positive control proves the probe sees focusable points at all: a green
 * sweep over charts with no button would prove nothing.
 */

const CHART_SUFFIXES = [
    '', 'boxplot', 'bullet', 'candlestick', 'cartesian', 'gauge', 'heatmap', 'honeycomb', 'map',
    'pareto', 'pictorial', 'polar', 'polarbar', 'pyramid', 'radar', 'sankey', 'sparkline',
    'streamgraph', 'sunburst', 'treemap', 'variwide', 'wordcloud'
]
const storyIdOf = (suffix: string) => `components-stories-chart-origamchart${suffix}-story-vue`
// Charts measured with focusable points before the fix.
const WITH_POINTS = ['cartesian', 'heatmap', 'sankey']

const VARIANTS_PER_STORY = 4

for (const suffix of CHART_SUFFIXES) {
    const storyId = storyIdOf(suffix)
    test(`${storyId} : no nested-interactive`, async ({ page, request }) => {
        test.setTimeout(120_000)
        const manifest = await request.get('/stories/histoire.json')
        expect(manifest.ok(), 'histoire.json (run with E2E_STATIC=1)').toBe(true)
        const { stories } = await manifest.json() as { stories: Array<{ story?: { id: string, variants: Array<{ id: string }> }, id?: string, variants?: Array<{ id: string }> }> }
        const entry = stories.map((s) => s.story ?? s).find((s) => s.id === storyId)
        expect(entry, `story ${storyId} served`).toBeTruthy()

        let swept = 0
        let focusablePoints = 0
        for (const variant of entry!.variants!.slice(0, VARIANTS_PER_STORY)) {
            await page.goto(`/stories/__sandbox.html?storyId=${storyId}&variantId=${variant.id}`)
            if (!(await page.locator('svg').first().waitFor({ timeout: 8_000 }).then(() => true, () => false))) continue
            swept++
            focusablePoints += await page.locator('svg [role="button"]').count()
            // The roots that hold points must not be an image.
            expect(await page.locator('svg[role="img"] [role="button"]').count()).toBe(0)
            const results = await new AxeBuilder({ page }).withRules(['nested-interactive']).analyze()
            expect(results.violations.map((v) => v.nodes.map((n) => n.target.join(' ')))).toEqual([])
        }
        expect(swept, `${storyId}: at least one Variant rendered an svg`).toBeGreaterThan(0)
        // Positive control: the probe must actually see focusable points.
        if (WITH_POINTS.includes(suffix)) expect(focusablePoints).toBeGreaterThan(0)
    })
}
