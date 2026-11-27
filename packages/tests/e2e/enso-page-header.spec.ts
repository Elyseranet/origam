/**
 * enso-page-header.spec.ts — l'en-tête commun « Vallée » (#1584), piloté sur /why-origam
 *
 * Contrat :
 *  - décor décoratif (`aria-hidden`), sans <img> ni <svg> : deux plans en fond CSS, dans la variante du
 *    MODE du site, et jamais le Fuji (`hero-mountains`, `hero-sky`, `cta-mountains`) ;
 *  - légère parallaxe au défilement, verticale seulement, le plan lointain plus fort que le proche, et
 *    modeste (< 30 px pour 300 px défilés) ; figée sous `prefers-reduced-motion: reduce` ;
 *  - AUCUN pixel du paysage sous le texte ni sous un lien d'action : alpha réel de chaque image ;
 *  - un seul h1, relié à son id ; ≤ 860 px le décor passe en bande basse de 110 px.
 */

import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const PLANES = ['back', 'front'] as const
const ALPHA_INVISIBLE = 1 / 255
const TEXTS = ['page-header-breadcrumb', 'page-header-eyebrow', 'page-header-title', 'page-header-intro', 'why-hero-demo-link', 'why-hero-usecases-link']
const FUJI = /hero-mountains|hero-sky|hero-sun|cta-mountains/

async function openPage (page: Page, mode: 'light' | 'dark'): Promise<void> {
    const baseURL = test.info().project.use.baseURL!
    await page.context().addCookies([
        { name: 'origam-theme', value: 'origam', url: baseURL },
        { name: 'origam-mode', value: mode, url: baseURL }
    ])
    await page.goto('/why-origam', { waitUntil: 'load' })
    await page.locator('[data-cy="page-header-plane-front"]').waitFor({ state: 'attached', timeout: 30_000 })
    // En dev, le SCSS des SFC est injecté APRÈS `load` : on attend la règle de fond des plans.
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.enso-page-header__plane--front')!).backgroundImage.includes('url('), undefined, { timeout: 30_000 })
    // Fondu d'apparition (0,9 s) terminé et décor mis en page : une mesure en cours de fondu lit une opacité fausse.
    await page.waitForFunction(() => {
        const art = document.querySelector('.enso-page-header__art')!.getBoundingClientRect()
        const back = Number(getComputedStyle(document.querySelector('.enso-page-header__plane--back')!).opacity)
        return art.height > 0 && back >= 0.4
    }, undefined, { timeout: 30_000 })
    await page.evaluate(() => Promise.all(['400', '600', '700'].map(w => document.fonts.load(`${ w } 1em Sora`))).then(() => document.fonts.ready))
}

/** Défile jusqu'à `y` : Nuxt remonte en haut de page à l'hydratation, on répète jusqu'à ce que la position tienne. */
async function scrollToY (page: Page, y: number): Promise<void> {
    await expect.poll(async () => {
        await page.evaluate(v => window.scrollTo({ top: v, behavior: 'instant' }), y)
        return page.evaluate(() => Math.round(window.scrollY))
    }, { timeout: 15_000 }).toBe(y)
}

function layerShift (page: Page, plane: string): Promise<number> {
    return page.locator(`[data-cy="page-header-plane-${ plane }"]`).evaluate((el) => {
        const t = getComputedStyle(el).transform
        return t === 'none' ? 0 : new DOMMatrix(t).m42
    })
}

/** Opacité maximale que les plans peignent sous chaque élément de texte, lue sur l'ALPHA réel de chaque image. */
function landscapeAlphaUnder (page: Page): Promise<Record<string, number>> {
    return page.evaluate(async ([texts]) => {
        const rects = Object.fromEntries(texts.map(cy => [cy, document.querySelector(`[data-cy="${ cy }"]`)!.getBoundingClientRect()]))
        const worst: Record<string, number> = Object.fromEntries(texts.map(cy => [cy, 0]))

        for (const plane of document.querySelectorAll<HTMLElement>('.enso-page-header__plane')) {
            const url = /url\("?([^")]+)"?\)/.exec(getComputedStyle(plane).backgroundImage)?.[1]
            if (!url) continue
            const img = new Image()
            img.src = url
            await img.decode()

            const box = plane.getBoundingClientRect()
            const w = Math.max(1, Math.round(box.width))
            const h = Math.max(1, Math.round(box.height))
            const ctx = new OffscreenCanvas(w, h).getContext('2d', { willReadFrequently: true })!
            ctx.drawImage(img, 0, 0, w, h)
            const opacity = Number(getComputedStyle(plane).opacity)

            for (const cy of texts) {
                const r = rects[cy]
                const x0 = Math.max(0, Math.floor(r.left - box.left)), x1 = Math.min(w, Math.ceil(r.right - box.left))
                const y0 = Math.max(0, Math.floor(r.top - box.top)), y1 = Math.min(h, Math.ceil(r.bottom - box.top))
                if (x1 <= x0 || y1 <= y0) continue
                const data = ctx.getImageData(x0, y0, x1 - x0, y1 - y0).data
                for (let i = 3; i < data.length; i += 4) worst[cy] = Math.max(worst[cy], (data[i] / 255) * opacity)
            }
        }

        return worst
    }, [TEXTS] as const)
}

test.describe('EnsoPageHeader — en-tête « Vallée » sur /why-origam', () => {
    for (const mode of ['light', 'dark'] as const) {
        test(`${ mode } : décor décoratif, deux plans de la variante du mode, jamais le Fuji`, async ({ page }) => {
            await openPage(page, mode)

            await expect(page.locator('[data-cy="page-header-art"]')).toHaveAttribute('aria-hidden', 'true')
            await expect(page.locator('.enso-page-header img, .enso-page-header svg')).toHaveCount(0)

            for (const plane of PLANES) {
                const bg = await page.locator(`[data-cy="page-header-plane-${ plane }"] .enso-page-header__plane`).evaluate(el => getComputedStyle(el).backgroundImage)
                expect(bg, `${ plane } (${ mode })`).toContain(`/brand/enso/${ mode }/`)
                expect(bg, `${ plane } (${ mode })`).not.toMatch(FUJI)
            }
        })
    }

    test('un seul h1, relié à son id, dans un en-tête de famille éditoriale', async ({ page }) => {
        await openPage(page, 'light')

        await expect(page.locator('h1')).toHaveCount(1)
        await expect(page.locator('#why-title')).toHaveText(/Why origam|Pourquoi origam/)
        await expect(page.locator('[data-cy="enso-page-header"]')).toHaveAttribute('data-family', 'editorial')
    })

    test('la parallaxe suit le défilement : verticale, le plan lointain plus fort, modeste', async ({ page }) => {
        await openPage(page, 'light')

        expect(await layerShift(page, 'back')).toBe(0)
        // Nuxt remonte en haut de page à l'hydratation (mesuré avec un CPU ralenti x10 : scrollY 300 -> 0, plans à 0) : tant que la
        // parallaxe n'est pas montée, on redéfile à chaque lecture, jusqu'à ce que le plan bouge.
        await expect.poll(async () => {
            await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }))
            await page.waitForTimeout(150)
            return layerShift(page, 'back')
        }, { timeout: 20_000 }).toBeGreaterThan(0)

        const back = await layerShift(page, 'back')
        const front = await layerShift(page, 'front')
        expect(back).toBeGreaterThan(front)
        expect(front).toBeGreaterThan(0)
        expect(back).toBeLessThan(30)

        const x = await page.locator('[data-cy="page-header-plane-back"]').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m41)
        expect(x).toBe(0)
    })

    test.describe('prefers-reduced-motion: reduce', () => {
        test('les plans ne bougent pas', async ({ page }) => {
            await page.emulateMedia({ reducedMotion: 'reduce' })
            await openPage(page, 'light')

            // Le DS pose `--reduced-motion` après le montage : on attend l'état figé avant de défiler.
            await page.locator('.origam-parallax__layer--reduced-motion').first().waitFor({ state: 'attached', timeout: 15_000 })
            await scrollToY(page, 300)
            await page.waitForTimeout(500)
            expect(await layerShift(page, 'back')).toBe(0)
            expect(await layerShift(page, 'front')).toBe(0)
        })
    })

    for (const width of [1440, 1024, 768, 390]) {
        for (const mode of ['light', 'dark'] as const) {
            test(`${ width }px ${ mode } : aucun pixel de paysage sous le texte ni sous un lien`, async ({ page }) => {
                await page.setViewportSize({ width, height: 900 })
                await openPage(page, mode)

                // Neutre et course extrême de chaque plan (posée en ligne : on mesure le décor, pas un moteur de défilement).
                for (const [back, front] of [[0, 0], [20, 8]]) {
                    await page.evaluate(([b, f]) => {
                        document.querySelector<HTMLElement>('[data-cy="page-header-plane-back"]')!.style.setProperty('transform', `translate3d(0, ${ b }px, 0)`, 'important')
                        document.querySelector<HTMLElement>('[data-cy="page-header-plane-front"]')!.style.setProperty('transform', `translate3d(0, ${ f }px, 0)`, 'important')
                    }, [back, front])

                    const worst = await landscapeAlphaUnder(page)
                    for (const cy of TEXTS) {
                        expect(
                            worst[cy],
                            `${ cy } (${ width }px, ${ mode }, parallaxe ${ back }) : un plan du paysage passe sous cet élément (alpha ${ worst[cy].toFixed(3) })`
                        ).toBeLessThanOrEqual(ALPHA_INVISIBLE)
                    }
                }
            })
        }
    }

    test('≤ 860 px : le décor passe en bande basse de 110 px, sous le texte', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 900 })
        await openPage(page, 'light')

        const metrics = await page.evaluate(() => {
            const plane = document.querySelector('.enso-page-header__plane--back')!.getBoundingClientRect()
            const intro = document.querySelector('[data-cy="page-header-intro"]')!.getBoundingClientRect()
            return { height: plane.height, top: plane.top, introBottom: intro.bottom }
        })
        expect(metrics.height).toBe(110)
        expect(metrics.top + metrics.height / 2).toBeGreaterThan(metrics.introBottom)
    })
})
