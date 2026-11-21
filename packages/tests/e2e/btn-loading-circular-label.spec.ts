import { expect, test } from '@playwright/test'

/**
 * #1086 — circular loading keeps the label VISIBLE next to the spinner (decision n°2, #1073).
 * Story variant 4 = "Loading" (cf. btn-loader-debug.spec.ts).
 */
const STORY_ID = 'components-stories-btn-origambtn-story-vue'
const url = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-4`

test('circular loading: label visible, not covered by the spinner, accessible name kept', async ({ page }) => {
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    const btn = page.frameLocator('iframe[src*="__sandbox"]').locator('[data-cy="btn-loading-circular-success"]').first()
    await btn.scrollIntoViewIfNeeded()
    const m = await btn.evaluate((el) => {
        const r = (s: string) => el.querySelector(s)!.getBoundingClientRect()
        const content = el.querySelector('.origam-btn__content') as HTMLElement
        const p = r('.origam-btn__progress')
        const c = r('.origam-btn__content')
        const b = el.getBoundingClientRect()
        return {
            opacity: getComputedStyle(content).opacity,
            overlap: p.left < c.right && p.right > c.left && p.top < c.bottom && p.bottom > c.top,
            btnW: b.width,
            progressInsideBtn: p.left >= b.left && p.right <= b.right
        }
    })
    console.log(JSON.stringify(m))
    expect(m.opacity).toBe('1')
    expect(m.overlap).toBe(false)
    expect(m.progressInsideBtn).toBe(true)
    await expect(btn).toHaveAccessibleName(/Circular success/)
})
