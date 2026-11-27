import { expect, test } from '@playwright/test'
import type { FrameLocator, Page } from '@playwright/test'

/**
 * #1591 — OrigamParallaxLayer : souris x / y, amplitudes distinctes par plan
 * et par source, souris prise en compte en easing linear (chemin CSS),
 * tactile = defilement seul, reduced-motion = aucun ecouteur.
 *
 * Variant « Functional » (index 1) : hote `direction="both"`, easing par
 * defaut (linear), deux plans — back (mouseX 10, mouseY 6, speed 0.1) et
 * front (mouseX 40, mouseY 24, speed 0.3).
 *
 * Verdict navigateur reel : jsdom ne resout pas var() ni les transitions.
 * Chaque mesure lit le rect du plan relativement a l'hote, ce qui est
 * independant du mecanisme (transform / translate).
 */

const STORY_ID = 'components-stories-parallax-origamparallaxlayer-story-vue'
const URL = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-1`

const TOL = 1.5

async function open (page: Page): Promise<FrameLocator> {
    await page.goto(URL, { waitUntil: 'domcontentloaded' })
    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    await expect(sandbox.locator('[data-cy="parallax-layer-front"]')).toBeVisible({ timeout: 12000 })
    return sandbox
}

/** Position du plan dans l'hote (px), mesuree en une seule evaluation. */
async function offsetOf (sandbox: FrameLocator, cy: string) {
    return sandbox.locator(`[data-cy="${cy}"]`).evaluate((el) => {
        const host = el.closest('.origam-parallax') as HTMLElement
        const l = el.getBoundingClientRect()
        const h = host.getBoundingClientRect()
        return { x: l.left - h.left, y: l.top - h.top }
    })
}

async function moveTo (page: Page, sandbox: FrameLocator, fx: number, fy: number) {
    const box = (await sandbox.locator('.origam-parallax').first().boundingBox())!
    // fx / fy en ratio [-1, 1] depuis le centre de l'hote.
    // Le bord exact est hors de l'hote (intervalle ouvert) : on s'arrete 1 px avant.
    const edge = (f: number, size: number) => (Math.abs(f) === 1 ? f * (size / 2 - 1) : (f * size) / 2)
    await page.mouse.move(box.x + box.width / 2 + edge(fx, box.width), box.y + box.height / 2 + edge(fy, box.height))
}

test.describe('OrigamParallaxLayer — souris x / y (#1591)', () => {
    test('le chemin CSS est bien celui mesure (easing linear)', async ({ page }) => {
        const sandbox = await open(page)
        await expect(sandbox.locator('[data-cy="parallax-layer-front"]')).toHaveClass(/origam-parallax__layer--css-driven/)
    })

    test('le plan se translate en x ET en y selon le pointeur, avec ses propres amplitudes', async ({ page }) => {
        const sandbox = await open(page)

        await moveTo(page, sandbox, 0, 0)
        await page.waitForTimeout(700)
        const frontC = await offsetOf(sandbox, 'parallax-layer-front')
        const backC = await offsetOf(sandbox, 'parallax-layer-back')

        await moveTo(page, sandbox, 1, 1)
        await expect.poll(async () => (await offsetOf(sandbox, 'parallax-layer-front')).x - frontC.x, { timeout: 4000 }).toBeGreaterThan(30)
        await page.waitForTimeout(700)
        const frontE = await offsetOf(sandbox, 'parallax-layer-front')
        const backE = await offsetOf(sandbox, 'parallax-layer-back')

        // amplitude souris : mouseX / mouseY px au bord de l'hote.
        expect(frontE.x - frontC.x).toBeCloseTo(40, 0)
        expect(frontE.y - frontC.y).toBeCloseTo(24, 0)
        expect(Math.abs(backE.x - backC.x - 10)).toBeLessThan(TOL)
        expect(Math.abs(backE.y - backC.y - 6)).toBeLessThan(TOL)
        // amplitudes distinctes par plan ET par axe.
        expect(frontE.x - frontC.x).toBeGreaterThan(backE.x - backC.x + 10)
        expect(frontE.x - frontC.x).not.toBeCloseTo(frontE.y - frontC.y, 0)
    })

    test('le lissage n\'est pas instantane (transition CSS ~0,4 s)', async ({ page }) => {
        const sandbox = await open(page)
        await moveTo(page, sandbox, 0, 0)
        await page.waitForTimeout(700)
        const c = await offsetOf(sandbox, 'parallax-layer-front')
        await moveTo(page, sandbox, 1, 0)
        const early = await offsetOf(sandbox, 'parallax-layer-front')
        expect(early.x - c.x, 'lu juste apres le mouvement : pas encore a l\'amplitude cible').toBeLessThan(39)
        await page.waitForTimeout(700)
        const late = await offsetOf(sandbox, 'parallax-layer-front')
        expect(late.x - c.x).toBeCloseTo(40, 0)
    })
})

test.describe('OrigamParallaxLayer — reduced-motion (#1591)', () => {
    test('aucun ecouteur souris du runtime et plans figes', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.addInitScript(() => {
            const w = window as unknown as { __mm: number }
            w.__mm = 0
            const add = EventTarget.prototype.addEventListener
            // Le runtime pose `mousemove` en `{ passive: true }` ; l'invoker Vue du composant n'a pas d'options.
            EventTarget.prototype.addEventListener = function (type: string, fn: any, opts?: any) {
                if (type === 'mousemove' && opts && typeof opts === 'object' && opts.passive === true && (this as Element).classList?.contains('origam-parallax')) w.__mm++
                return add.call(this, type, fn, opts)
            }
        })
        const sandbox = await open(page)
        await page.waitForTimeout(300)
        const count = await page.frames().find(f => f.url().includes('__sandbox'))!.evaluate(() => (window as any).__mm)
        expect(count).toBe(0)

        const before = await offsetOf(sandbox, 'parallax-layer-front')
        await moveTo(page, sandbox, 1, 1)
        await page.waitForTimeout(700)
        const after = await offsetOf(sandbox, 'parallax-layer-front')
        expect(Math.abs(after.x - before.x)).toBeLessThan(0.5)
        expect(Math.abs(after.y - before.y)).toBeLessThan(0.5)
    })
})

test.describe('OrigamParallaxLayer — tactile (#1591)', () => {
    test.use({ hasTouch: true, isMobile: true })

    test('sans pointeur fin : la souris ne bouge rien, le defilement oui', async ({ page }) => {
        const sandbox = await open(page)
        expect(await sandbox.locator('body').evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches)).toBe(false)

        const start = await offsetOf(sandbox, 'parallax-layer-front')
        await moveTo(page, sandbox, 1, 1)
        await page.waitForTimeout(700)
        const afterMouse = await offsetOf(sandbox, 'parallax-layer-front')
        expect(Math.abs(afterMouse.x - start.x)).toBeLessThan(0.5)
        expect(Math.abs(afterMouse.y - start.y)).toBeLessThan(0.5)

        await sandbox.locator('body').evaluate(async () => {
            document.body.style.minHeight = '400vh'
            window.scrollTo({ top: 120, behavior: 'auto' })
            window.dispatchEvent(new Event('scroll'))
            await new Promise(r => setTimeout(r, 400))
        })
        const afterScroll = await offsetOf(sandbox, 'parallax-layer-front')
        expect(Math.abs(afterScroll.y - afterMouse.y), 'le defilement deplace toujours le plan').toBeGreaterThan(1)
    })
})
