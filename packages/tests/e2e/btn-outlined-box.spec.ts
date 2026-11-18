import { expect, test } from '@playwright/test'

/**
 * #1261 — an `outlined` Btn must not be wider than a `flat` Btn of the same
 * size and text: its filet is a real `border`, which adds to the box.
 * Real browser only (var() is invisible to jsdom). The probe is a CLONE of a
 * rendered Btn (keeps the scoped data-v attribute), measured in one evaluate.
 */
const STORY_ID = 'components-stories-btn-origambtn-story-vue'
const URL = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-0`
const SIZES = ['x-small', 'small', 'default', 'large', 'x-large']

test.describe('OrigamBtn — outlined box (#1261)', () => {
    test('outlined and ghost have the same outer width as flat, default and 2px filet', async ({ page }) => {
        await page.goto(URL, { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const btn = sandbox.locator('.origam-btn').first()
        await expect(btn).toBeVisible()

        const rows = await btn.evaluate((el, sizes) => {
            const parent = el.parentElement as HTMLElement
            const measure = (variant: string, size: string, filet?: string) => {
                const c = el.cloneNode(true) as HTMLElement
                c.className = `origam-btn origam-btn--size-${size} origam-btn--variant-${variant}`
                c.removeAttribute('style')
                if (filet) c.style.setProperty(`--origam-btn---border-width-${variant}`, filet)
                c.textContent = 'Comparer deux joueurs'
                parent.appendChild(c)
                const r = c.getBoundingClientRect()
                const cs = getComputedStyle(c)
                const out = { w: r.width, h: r.height, pl: cs.paddingLeft, bl: cs.borderLeftWidth }
                c.remove()
                return out
            }
            return sizes.flatMap((s) => [undefined, '2px'].map((f) => ({
                size: `${s}/${f ?? 'default'}`,
                flat: measure('flat', s),
                outlined: measure('outlined', s, f),
                ghost: measure('ghost', s, f)
            })))
        }, SIZES)

        console.log(JSON.stringify(rows))
        for (const r of rows) {
            expect(r.outlined.w, `${r.size}: outlined width vs flat`).toBeCloseTo(r.flat.w, 1)
            expect(r.outlined.h, `${r.size}: outlined height vs flat`).toBeCloseTo(r.flat.h, 1)
            expect(r.ghost.w, `${r.size}: ghost width vs flat`).toBeCloseTo(r.flat.w, 1)
        }
    })
})
