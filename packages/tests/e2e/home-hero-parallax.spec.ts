/**
 * Parallaxe du hero « enso » (#1593, spec v12 § 3) : pointeur en x ET en y, défilement,
 * tactile = défilement seul, reduced-motion = tout figé. Mesuré en navigateur
 * (`getComputedStyle` : `translate` porte le pointeur, `transform` le défilement).
 *
 *   pnpm -F @origam/tests exec playwright test \
 *     --config=playwright.marketing.config.ts home-hero-parallax
 */

import { expect, test, type Page } from '@playwright/test'

const BASE = process.env.MARKETING_BASE_URL ?? 'http://localhost:3000'

/** Amplitudes pointeur (px au bord du hero) attendues, spec § 3. */
const MOUSE: Record<string, [number, number]> = {
    sun: [10, 8], mountains: [12, 6], landscape: [20, 8], pagoda: [26, 10], sakura: [40, 14], enso: [28, 18]
}
/** Défilement (`speed`) attendu par plan. */
const SCROLL: Record<string, number> = { sun: 0.35, mountains: 0.28, landscape: 0.16, pagoda: 0.12, sakura: 0.05, enso: 0.2 }

interface IPlaneMove { mx: number, my: number, sy: number }

async function read (page: Page): Promise<Record<string, IPlaneMove>> {
    return page.evaluate(() => Object.fromEntries([...document.querySelectorAll('#hero .origam-parallax__layer')].map((layer) => {
        const key = (layer.querySelector('[data-cy]') as HTMLElement).dataset.cy!.replace('hero-plane-', '')
        const cs = getComputedStyle(layer)
        const matrix = new DOMMatrix(cs.transform === 'none' ? undefined : cs.transform)
        const [mx, my] = cs.translate === 'none' ? [0, 0] : cs.translate.split(' ').map(parseFloat)

        return [key, { mx: mx || 0, my: my || 0, sy: matrix.f }]
    })))
}

async function point (page: Page, fx: number, fy: number) {
    const box = (await page.locator('#hero').boundingBox())!
    await page.mouse.move(box.x + box.width * fx, box.y + box.height * fy, { steps: 4 })
    await page.waitForTimeout(900)
}

test.describe('Hero enso — parallaxe', () => {
    test('pointeur : chaque plan bouge en x ET en y, à l\'amplitude de la spec', async ({ browser }) => {
        const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
        const page = await ctx.newPage()
        await page.goto(BASE, { waitUntil: 'networkidle' })
        await point(page, 0.25, 0.25)
        const a = await read(page)
        await point(page, 0.75, 0.75)
        const b = await read(page)
        // de -0,5 a +0,5 : un rapport entier d amplitude, sur chaque axe
        for (const [key, [ax, ay]] of Object.entries(MOUSE)) {
            expect(b[key].mx - a[key].mx, `${key} x`).toBeCloseTo(ax, 0)
            expect(b[key].my - a[key].my, `${key} y`).toBeCloseTo(ay, 0)
        }
        await ctx.close()
    })

    test('défilement : chaque plan descend à sa vitesse, sans bouger en x', async ({ browser }) => {
        const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
        const page = await ctx.newPage()
        await page.goto(BASE, { waitUntil: 'networkidle' })
        await page.waitForTimeout(500)
        const before = await read(page)
        await page.evaluate(() => window.scrollTo(0, 400))
        await page.waitForTimeout(500)
        const after = await read(page)
        for (const [key, k] of Object.entries(SCROLL)) {
            const slope = (after[key].sy - before[key].sy) / 400
            // la pente du DS dépend de hero / fenêtre : tolérance 15 % de k
            expect(slope, `${key} défilement`).toBeGreaterThan(k * 0.85)
            expect(slope, `${key} défilement`).toBeLessThan(k * 1.15)
            expect(after[key].mx, `${key} x au défilement`).toBe(before[key].mx)
        }
        await ctx.close()
    })

    test('tactile : le pointeur ne fait rien, le défilement oui', async ({ browser }) => {
        const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
        const page = await ctx.newPage()
        await page.goto(BASE, { waitUntil: 'networkidle' })
        await page.evaluate(() => document.querySelector('#hero')!.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 50, bubbles: true })))
        await page.waitForTimeout(600)
        const still = await read(page)
        for (const m of Object.values(still)) {
            expect(m.mx).toBe(0)
            expect(m.my).toBe(0)
        }
        await page.evaluate(() => window.scrollTo(0, 300))
        await page.waitForTimeout(500)
        const scrolled = await read(page)
        expect(scrolled.mountains.sy).toBeGreaterThan(still.mountains.sy + 30)
        await ctx.close()
    })

    test('prefers-reduced-motion : tout reste figé, pointeur et défilement', async ({ browser }) => {
        const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
        const page = await ctx.newPage()
        await page.goto(BASE, { waitUntil: 'networkidle' })
        await point(page, 0.1, 0.1)
        await page.evaluate(() => window.scrollTo(0, 400))
        await page.waitForTimeout(500)
        for (const m of Object.values(await read(page))) {
            expect(m).toEqual({ mx: 0, my: 0, sy: 0 })
        }
        await ctx.close()
    })

    test('aucun écart d\'hydratation dans la console (pointeur fin)', async ({ browser }) => {
        const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
        const page = await ctx.newPage()
        const bad: string[] = []
        page.on('console', (m) => { if (/hydrat|mismatch/i.test(m.text())) bad.push(m.text()) })
        await page.goto(BASE, { waitUntil: 'networkidle' })
        expect(bad).toEqual([])
        await ctx.close()
    })

    // Défaut DS (useMediaQuery lit matchMedia à l'initialisation : classe `--reduced-motion`
    // absente du HTML serveur). Se corrige dans le DS, pas ici : retirer `fixme` à ce moment.
    test.fixme('aucun écart d\'hydratation sous prefers-reduced-motion', async ({ browser }) => {
        const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
        const page = await ctx.newPage()
        const bad: string[] = []
        page.on('console', (m) => { if (/hydrat|mismatch/i.test(m.text())) bad.push(m.text()) })
        await page.goto(BASE, { waitUntil: 'networkidle' })
        expect(bad).toEqual([])
        await ctx.close()
    })
})
