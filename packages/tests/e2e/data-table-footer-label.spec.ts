import { expect, test } from '@playwright/test'

/**
 * SPEC — OrigamDataTableFooter, libelle « Items per page » (#1162)
 * Le libelle ne doit jamais etre rogne : son texte tient dans sa boite
 * (scrollWidth <= clientWidth) et dans le viewport (left >= 0).
 */
const STORY_ID = 'components-stories-datatable-origamdatatable-story-vue'
const url = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-0`

for (const width of [320, 375, 768, 1280]) {
    for (const mode of ['light', 'dark']) {
        test(`libelle non rogne — ${width}px ${mode}`, async ({ page }) => {
            await page.setViewportSize({ width, height: 800 })
            await page.goto(url, { waitUntil: 'domcontentloaded' })
            const label = page.frameLocator('iframe').first().locator('.origam-data-table-footer__items-per-page > span').first()
            await label.waitFor({ state: 'attached', timeout: 20000 })
            const m = await label.evaluate((el, mode) => {
                const doc = el.ownerDocument
                doc.documentElement.setAttribute('data-mode', mode)
                const rng = doc.createRange()
                rng.selectNodeContents(el)
                const t = rng.getBoundingClientRect()
                const r = el.getBoundingClientRect()
                return {
                    text: el.textContent, left: r.left, textLeft: t.left, cw: el.clientWidth, sw: el.scrollWidth,
                    vw: doc.documentElement.clientWidth, overflow: getComputedStyle(el).overflow
                }
            }, mode)
            console.log(JSON.stringify({ width, mode, ...m }))
            expect(m.textLeft).toBeGreaterThanOrEqual(0)
            expect(m.sw).toBeLessThanOrEqual(m.cw)
        })
    }
}
