import { expect, test } from '@playwright/test'
import type { FrameLocator, Page } from '@playwright/test'

/**
 * #1603 — OrigamParallax : origine du defilement, axe du chemin CSS,
 * ancetre `overflow`, ecouteurs sous reduced-motion, gestionnaire legacy.
 *
 * Variants de OrigamParallaxLayer.story.vue :
 *   2 « Origin »           deux hotes ease-out (chemin JS) : origin viewport / page-top
 *   3 « Scroll container » deux hotes linear vertical : nu / dans un ancetre overflow:hidden
 *
 * Verdict navigateur reel : jsdom ne resout ni var() ni les timelines CSS.
 * Chaque mesure lit le rect du plan relativement a l'hote.
 */

const STORY_ID = 'components-stories-parallax-origamparallaxlayer-story-vue'
const urlOf = (idx: number) => `/stories/story/${STORY_ID}?variantId=${STORY_ID}-${idx}`

async function open (page: Page, idx: number, ready: string): Promise<FrameLocator> {
    await page.goto(urlOf(idx), { waitUntil: 'domcontentloaded' })
    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    await expect(sandbox.locator(`[data-cy="${ready}"]`)).toBeVisible({ timeout: 12000 })
    // Laisse passer le premier tick rAF / l'enregistrement des plans.
    await page.waitForTimeout(400)
    return sandbox
}

/** Position du plan dans son hote (px), en une seule evaluation. */
async function offsetOf (sandbox: FrameLocator, cy: string) {
    return sandbox.locator(`[data-cy="${cy}"]`).evaluate((el) => {
        const host = el.closest('.origam-parallax') as HTMLElement
        const l = el.getBoundingClientRect()
        const h = host.getBoundingClientRect()
        return { x: l.left - h.left, y: l.top - h.top }
    })
}

async function scrollTo (page: Page, sandbox: FrameLocator, top: number) {
    await sandbox.locator('body').evaluate(async (_b, y) => {
        window.scrollTo({ top: y, behavior: 'auto' })
        window.dispatchEvent(new Event('scroll'))
        await new Promise(r => setTimeout(r, 250))
    }, top)
    await page.waitForTimeout(300)
}

test.describe('#1603 defaut 4 — origine du defilement', () => {
    for (const height of [900, 640]) {
        test(`origin="page-top" : plan au repos sans decalage, ${height}px de haut`, async ({ page }) => {
            await page.setViewportSize({ width: 1440, height })
            const sandbox = await open(page, 2, 'parallax-origin-top-layer')
            const rest = await offsetOf(sandbox, 'parallax-origin-top-layer')
            expect(Math.abs(rest.y), 'decalage vertical au repos').toBeLessThan(0.5)
            expect(Math.abs(rest.x), 'decalage horizontal au repos').toBeLessThan(0.5)
        })
    }

    test('origin="page-top" : le defilement deplace bien le plan', async ({ page }) => {
        const sandbox = await open(page, 2, 'parallax-origin-top-layer')
        const rest = await offsetOf(sandbox, 'parallax-origin-top-layer')
        await scrollTo(page, sandbox, 200)
        const moved = await offsetOf(sandbox, 'parallax-origin-top-layer')
        expect(Math.abs(moved.y - rest.y)).toBeGreaterThan(5)
    })

    test('origin par defaut (viewport) : comportement inchange, decalage au repos', async ({ page }) => {
        const sandbox = await open(page, 2, 'parallax-origin-viewport-layer')
        const rest = await offsetOf(sandbox, 'parallax-origin-viewport-layer')
        expect(Math.abs(rest.y), 'le defaut garde l\'ancien repere').toBeGreaterThan(1)
    })

    test('le rendu serveur (transform d\'offset seul) et le repos client coincident', async ({ page }) => {
        // L'attribut `style` pose par le rendu initial ne porte que l'offset (0) ;
        // apres le premier tick, le plan `page-top` ne doit pas avoir saute.
        const sandbox = await open(page, 2, 'parallax-origin-top-layer')
        const t = await sandbox.locator('[data-cy="parallax-origin-top-layer"]').evaluate(el => (el as HTMLElement).style.transform)
        expect(t.replace(/\s/g, '')).toMatch(/^translate3d\(0(px)?,(-?0(\.0+)?)(px)?,0(px)?\)$/)
    })
})

test.describe('#1603 defaut 1 — chemin CSS, axe', () => {
    test('direction vertical : aucun decalage horizontal pendant le defilement', async ({ page }) => {
        const sandbox = await open(page, 3, 'parallax-plain-layer')
        await expect(sandbox.locator('[data-cy="parallax-plain-layer"]')).toHaveClass(/origam-parallax__layer--css-driven/)
        const xs: number[] = []
        for (const top of [60, 160, 260]) {
            await scrollTo(page, sandbox, top)
            xs.push((await offsetOf(sandbox, 'parallax-plain-layer')).x)
        }
        for (const x of xs) expect(Math.abs(x)).toBeLessThan(0.5)
    })

    test('direction vertical : le plan se deplace bien en Y (chemin CSS)', async ({ page }) => {
        const sandbox = await open(page, 3, 'parallax-plain-layer')
        await scrollTo(page, sandbox, 60)
        const a = await offsetOf(sandbox, 'parallax-plain-layer')
        await scrollTo(page, sandbox, 260)
        const b = await offsetOf(sandbox, 'parallax-plain-layer')
        expect(Math.abs(b.y - a.y)).toBeGreaterThan(3)
    })
})

test.describe('#1603 defaut 3 — ancetre overflow', () => {
    test('un ancetre overflow:hidden ne fige plus le defilement', async ({ page }) => {
        const sandbox = await open(page, 3, 'parallax-clipped-layer')
        await scrollTo(page, sandbox, 60)
        const a = await offsetOf(sandbox, 'parallax-clipped-layer')
        await scrollTo(page, sandbox, 260)
        const b = await offsetOf(sandbox, 'parallax-clipped-layer')
        expect(Math.abs(b.y - a.y), 'le plan bouge avec le defilement de la page').toBeGreaterThan(3)
    })
})

test.describe('#1603 — reduced-motion : aucun ecouteur inutile', () => {
    test('sans @scroll-progress, aucun ecouteur scroll du runtime sur window', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.addInitScript(() => {
            const w = window as unknown as { __ev: string[] }
            w.__ev = []
            const add = EventTarget.prototype.addEventListener
            EventTarget.prototype.addEventListener = function (type: string, fn: any, opts?: any) {
                // Le runtime pose ses ecouteurs en `{ passive: true }` sur window.
                if ((type === 'scroll' || type === 'resize') && this === window && opts && typeof opts === 'object' && opts.passive === true) w.__ev.push(type)
                return add.call(this, type, fn, opts)
            }
        })
        await open(page, 3, 'parallax-plain-layer')
        const ev = await page.frames().find(f => f.url().includes('__sandbox'))!.evaluate(() => (window as any).__ev)
        // `resize` n'est pas assertable : l'iframe Histoire en pose elle-meme deux
        // (passifs) — mesure A/B : 4 avant correctif, 2 apres, les 2 du runtime ont disparu.
        expect(ev.filter((t: string) => t === 'scroll')).toEqual([])
    })
})

test.describe('#1603 — gestionnaire mousemove legacy', () => {
    test('un hote sans <origam-parallax-element> ne mesure pas l\'hote a chaque mouvement', async ({ page }) => {
        const sandbox = await open(page, 3, 'parallax-plain-layer')
        const frame = page.frames().find(f => f.url().includes('__sandbox'))!
        await frame.evaluate(() => {
            const w = window as unknown as { __rects: number }
            w.__rects = 0
            const host = document.querySelector('[data-cy="parallax-plain"]') as HTMLElement
            const orig = host.getBoundingClientRect.bind(host)
            host.getBoundingClientRect = () => { w.__rects++; return orig() }
        })
        const box = (await sandbox.locator('[data-cy="parallax-plain"]').boundingBox())!
        for (let i = 0; i < 12; i++) {
            await page.mouse.move(box.x + 40 + i * 20, box.y + 60 + i * 5)
            await page.waitForTimeout(60)
        }
        expect(await frame.evaluate(() => (window as any).__rects)).toBe(0)
    })
})
