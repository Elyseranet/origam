import { expect, test } from '@playwright/test'

/**
 * #1086 — circular loading keeps the label VISIBLE. With a prepend / an icon the spinner REPLACES it
 * (width identical to rest); without, the button grows. Story variant 4 = "Loading".
 */
const STORY_ID = 'components-stories-btn-origambtn-story-vue'
const url = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-4`

const measure = (page: import('@playwright/test').Page, cy: string) =>
    page.frameLocator('iframe[src*="__sandbox"]').locator(`[data-cy="${cy}"]`).first().evaluate((el) => {
        const b = el.getBoundingClientRect()
        const p = el.querySelector('.origam-btn__progress')?.getBoundingClientRect()
        const c = el.querySelector('.origam-btn__content')!
        const cr = c.getBoundingClientRect()
        const hasText = (c.textContent ?? '').trim().length > 0
        return {
            w: b.width,
            contentOpacity: getComputedStyle(c).opacity,
            hasText,
            progressInside: !p || (p.left >= b.left - 0.5 && p.right <= b.right + 0.5),
            // the spinner must not cover the label text
            overlapsLabel: !!p && hasText && p.left < cr.right && p.right > cr.left
        }
    })

test.describe('btn circular loading (#1086)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        await page.frameLocator('iframe[src*="__sandbox"]').locator('[data-cy="btn-loading-plain"]').first().waitFor()
    })

    test('prepend icon: spinner replaces it, same width as at rest, label visible', async ({ page }) => {
        const rest = await measure(page, 'btn-rest-prepend')
        const load = await measure(page, 'btn-loading-prepend')
        console.log('prepend', rest.w, load.w)
        expect(Math.abs(load.w - rest.w)).toBeLessThanOrEqual(0.5)
        expect(load.contentOpacity).toBe('1')
        expect(load.overlapsLabel).toBe(false)
        expect(load.progressInside).toBe(true)
    })

    test('icon button: spinner replaces the icon, same width as at rest', async ({ page }) => {
        const rest = await measure(page, 'btn-rest-icon')
        const load = await measure(page, 'btn-loading-icon')
        console.log('icon', rest.w, load.w)
        expect(Math.abs(load.w - rest.w)).toBeLessThanOrEqual(0.5)
        expect(load.progressInside).toBe(true)
    })

    test('no icon: label visible, button wider, no overlap, accessible name kept', async ({ page }) => {
        const rest = await measure(page, 'btn-rest-plain')
        const load = await measure(page, 'btn-loading-plain')
        console.log('plain', rest.w, load.w)
        expect(load.w).toBeGreaterThan(rest.w)
        expect(load.contentOpacity).toBe('1')
        expect(load.overlapsLabel).toBe(false)
        expect(load.progressInside).toBe(true)
        await expect(page.frameLocator('iframe[src*="__sandbox"]').locator('[data-cy="btn-loading-plain"]').first()).toHaveAccessibleName(/Save/)
    })
})
