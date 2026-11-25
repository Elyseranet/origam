import { expect, test } from '@playwright/test'

/**
 * #1177 — `.origam-ripple__container` n'etait style par AUCUNE feuille : le
 * conteneur restait `position: static`, en flux dans son hote, et l'ondulation
 * n'avait ni fond ni opacite. Appui maintenu sur un Btn (ripple par defaut) :
 * le conteneur doit etre absolu, clippe, sans effet sur la mise en page, et
 * l'ondulation doit peindre.
 */
const STORY_ID = 'components-stories-btn-origambtn-story-vue'

test.describe('Ripple — conteneur (#1177)', () => {
    test('appui maintenu : conteneur absolu, hote inchange, ondulation peinte', async ({ page }) => {
        await page.goto(`/stories/story/${STORY_ID}?variantId=${STORY_ID}-2`)
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const btn = sandbox.locator('.origam-btn').first()
        await expect(btn).toBeVisible()

        const before = await btn.evaluate((el) => el.getBoundingClientRect().width)

        await btn.hover()
        await page.mouse.down()
        await page.waitForTimeout(100)

        const m = await btn.evaluate((el) => {
            const c = el.querySelector('.origam-ripple__container') as HTMLElement
            const a = el.querySelector('.origam-ripple__animation') as HTMLElement
            const cs = getComputedStyle(c)
            const as = getComputedStyle(a)
            return {
                width: el.getBoundingClientRect().width,
                position: cs.position,
                overflow: cs.overflowX,
                pointer: cs.pointerEvents,
                animPosition: as.position,
                animBg: as.backgroundColor,
                animOpacity: Number(as.opacity)
            }
        })
        await page.screenshot({ path: process.env.RIPPLE_SHOT ?? 'test-results/ripple-press.png' })
        await page.mouse.up()

        expect(m.position).toBe('absolute')
        expect(m.overflow).toBe('hidden')
        expect(m.pointer).toBe('none')
        expect(m.width).toBe(before)
        expect(m.animPosition).toBe('absolute')
        expect(m.animBg).not.toBe('rgba(0, 0, 0, 0)')
        expect(m.animOpacity).toBeGreaterThan(0)
    })
})
