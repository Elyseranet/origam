import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * #1428 — le texte des CTA primaires de l'accueil reste lisible (WCAG AA,
 * 4,5:1) sur la surface RÉELLEMENT peinte, pour le thème du site (origam) x 2 modes.
 *
 * Mesure : le texte est rendu transparent, le bouton est capturé, et le ratio
 * est calculé entre la couleur de texte résolue et chaque pixel sous la boîte
 * de `.origam-btn__content` (le minimum compte). Une lecture du seul
 * `background-color` serait aveugle à un dégradé (glass : texte blanc sur
 * `#a78bfa`, 2,72:1).
 */
// #1515 — le site rend toujours `origam` (le cookie de marque est ignoré).
const THEMES = ['origam']
const MODES = ['light', 'dark']
const CTAS = ['hero-cta-components', 'cta-btn-start']
const AA = 4.5

/**
 * Attente sur condition, jamais sur un delai : plus aucune transition/animation
 * en cours sur le bouton, ses descendants et ses ancetres, confirmee sur deux
 * frames consecutives.
 */
async function settled (page: Page, cy: string): Promise<void> {
    await page.waitForFunction(async (sel) => {
        const el = document.querySelector(sel)
        if (!el) return false
        const running = () => {
            for (let n: Element | null = el; n; n = n.parentElement) {
                if (n.getAnimations({ subtree: n === el }).some(a => a.playState !== 'finished')) return true
            }
            return false
        }
        const frame = () => new Promise(r => requestAnimationFrame(r))
        await frame()
        if (running()) return false
        await frame()
        return !running()
    }, `[data-cy="${ cy }"]`)
}

async function minRatio (page: Page, cy: string): Promise<number> {
    const loc = page.locator(`[data-cy="${ cy }"]`)
    await loc.scrollIntoViewIfNeeded()
    await settled(page, cy)
    const fg = await loc.evaluate(el => getComputedStyle(el).color)
    const box = await loc.evaluate(el => {
        const c = el.querySelector('.origam-btn__content') ?? el
        const r = c.getBoundingClientRect()
        const o = el.getBoundingClientRect()
        return { x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height, ow: o.width }
    })
    await loc.evaluate(el => el.style.setProperty('color', 'transparent', 'important'))
    await expect.poll(() => loc.evaluate(el => getComputedStyle(el.querySelector('.origam-btn__content') ?? el).color)).toMatch(/rgba\(0, 0, 0, 0\)|transparent/)
    await settled(page, cy)
    const buf = await loc.screenshot()

    return page.evaluate(async ([b64, fgColor, b]) => {
        const lum = (c: number[]) => {
            const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
            return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])
        }
        const ratio = (a: number[], c: number[]) => {
            const [hi, lo] = [lum(a), lum(c)].sort((m, n) => n - m)
            return (hi + 0.05) / (lo + 0.05)
        }
        const img = new Image()
        img.src = `data:image/png;base64,${ b64 }`
        await img.decode()
        const cv = new OffscreenCanvas(img.width, img.height)
        const ctx = cv.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        const dpr = img.width / Math.round(b.ow)
        const f = (fgColor as string).match(/[\d.]+/g)!.slice(0, 3).map(Number)
        let min = Infinity
        for (const fy of [0.2, 0.5, 0.8]) {
            const y = Math.floor((b.y + b.h * fy) * dpr)
            const d = ctx.getImageData(0, y, img.width, 1).data
            for (let k = Math.floor(b.x * dpr); k < (b.x + b.w) * dpr; k += 2) {
                min = Math.min(min, ratio(f, [d[k * 4], d[k * 4 + 1], d[k * 4 + 2]]))
            }
        }
        return min
    }, [buf.toString('base64'), fg, box] as const)
}

test.describe('#1428 — CTA primaires de l\'accueil : contraste AA', () => {
    for (const theme of THEMES) {
        for (const mode of MODES) {
            test(`${ theme } / ${ mode }`, async ({ page, context }) => {
                const baseURL = test.info().project.use.baseURL!
                await context.addCookies([
                    { name: 'origam-theme', value: theme, url: baseURL },
                    { name: 'origam-mode', value: mode, url: baseURL }
                ])
                await page.goto('/')
                await page.locator('[data-cy="hero-cta-components"]').waitFor()

                for (const cy of CTAS) {
                    const min = await minRatio(page, cy)
                    expect(min, `${ cy } (${ theme }/${ mode }) : ratio minimal ${ min.toFixed(2) }:1`).toBeGreaterThanOrEqual(AA)
                }
            })
        }
    }
})
