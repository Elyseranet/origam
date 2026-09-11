import { test } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId (cf. btn.spec.ts).
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamBtn (0-based) — état au 2026-06-30 :
 *   0  → Design
 *   1  → State
 *   2  → Functional
 *   3  → Prop — color & bgColor
 *   4  → Prop — loading (interactive)
 *   5  → Events - click
 *   …
 *  14  → Default (playground)
 */

const STORY_ID   = 'components-stories-btn-origambtn-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test('DEBUG btn loader — inspect line / circular / skeleton DOM + styles', async ({ page }) => {
    // Navigate directly to "Prop — loading (interactive)" (index 4).
    await page.goto(variantUrl(4))

    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

    for (const dataCy of ['btn-loading-line', 'btn-loading-line-primary', 'btn-loading-circular-override', 'btn-loading-circular-success', 'btn-loading-skeleton']) {
        const btn = sandbox.locator(`[data-cy="${dataCy}"]`).first()
        await btn.scrollIntoViewIfNeeded()
        const report = await btn.evaluate((el) => {
            const _cs = getComputedStyle(el)
            const rect = el.getBoundingClientRect()
            const progress = el.querySelector('.origam-btn__progress')
            const progressCs = progress ? getComputedStyle(progress as Element) : null
            const progressRect = progress ? (progress as Element).getBoundingClientRect() : null
            // The visible coloured bits inside the progress (linear has __background
            // / __bar; circular has __overlay / __underlay-strokes inside SVG).
            const bg = progress?.querySelector('.origam-progress__background') as Element | null
            const bar = progress?.querySelector('.origam-progress__bar')        as Element | null
            const underlay = progress?.querySelector('.origam-progress__underlay') as SVGElement | null
            const overlay  = progress?.querySelector('.origam-progress__overlay')  as SVGElement | null
            return {
                btnSize: { w: rect.width, h: rect.height },
                progressSize: progressRect ? { w: progressRect.width, h: progressRect.height } : null,
                progressColor: progressCs?.color ?? null,             // <- currentColor source
                bgComputed: bg ? getComputedStyle(bg).backgroundColor : null,
                barComputed: bar ? getComputedStyle(bar).backgroundColor : null,
                underlayStroke: underlay ? getComputedStyle(underlay).stroke : null,
                overlayStroke:  overlay  ? getComputedStyle(overlay).stroke  : null,
            }
        })

        console.log(`\n=== ${dataCy} ===`)

        console.log(JSON.stringify(report, null, 2))
    }
})
