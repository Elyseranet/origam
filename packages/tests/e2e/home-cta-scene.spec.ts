/**
 * home-cta-scene.spec.ts — le paysage du CTA « Crépuscule » (#1596)
 *
 * Contrat :
 *  - la scène est décorative (`aria-hidden`), sans <img> ni <svg> : trois plans
 *    en fond CSS, dans la variante du MODE du site (`/brand/enso/{mode}/cta-*`) ;
 *  - le parallaxe suit le défilement seul (aucun pointeur) : les plans bougent
 *    en sens inverse du défilement, le plus lointain le plus fort ; sous
 *    `prefers-reduced-motion: reduce` rien ne bouge ;
 *  - AUCUN pixel de paysage sous le texte ni sous un bouton : mesuré en
 *    comparant, pour chaque élément de texte, le rendu avec et sans les plans.
 *
 * La scène utilise le chemin JS du parallaxe (`easing="ease-out"`) : le chemin CSS du DS
 * (`linear`) anime aussi l'axe X et pose sa classe `--css-driven` côté client seulement
 * (hydration mismatch). Un test vérifie donc que le décalage est vertical seulement.
 */

import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const PLANES = ['mountains', 'ridge', 'foreground'] as const
/** Course maximale du parallaxe de chaque plan (px) : vitesse × hauteur de la section (800 px). */
/** Alpha en dessous duquel un pixel est invisible (moins d'un niveau sur 255). */
const ALPHA_INVISIBLE = 1 / 255
const MAX_SHIFT_PX = { mountains: 13.2, ridge: 8.4, foreground: 3.6 }
const TEXTS = ['cta-title', 'cta-description', 'cta-btn-components', 'cta-btn-docs']

async function openCta (page: Page, mode: 'light' | 'dark'): Promise<void> {
    const baseURL = test.info().project.use.baseURL!
    await page.context().addCookies([
        { name: 'origam-theme', value: 'origam', url: baseURL },
        { name: 'origam-mode', value: mode, url: baseURL }
    ])
    await page.goto('/', { waitUntil: 'load' })
    await page.locator('[data-cy="cta-plane-foreground"]').waitFor({ state: 'attached', timeout: 30_000 })
    // En dev, le SCSS des SFC est injecté APRÈS `load` (#1516) : sans sa règle de fond, la section et son titre
    // ne sont pas encore mis en forme et deux captures successives diffèrent.
    await page.waitForFunction(() => getComputedStyle(document.querySelector('section.home-cta')!).backgroundImage.includes('linear-gradient'), undefined, { timeout: 30_000 })
    // Polices chargées : un échange de police en cours de mesure déplace le texte entre deux captures.
    await page.evaluate(() => Promise.all(['400', '600', '700'].map(w => document.fonts.load(`${ w } 1em Sora`))).then(() => document.fonts.ready))
}

/** Décalage vertical (px) appliqué par le parallaxe à une couche. */
function layerShift (page: Page, plane: string): Promise<number> {
    return page.locator(`[data-cy="cta-plane-${ plane }"]`).evaluate((el) => {
        const t = getComputedStyle(el).transform
        return t === 'none' ? 0 : new DOMMatrix(t).m42
    })
}

/** Place la section pour que sa progression de `view()` vaille `progress` (0 = entre par le bas, 1 = sort par le haut). */
async function scrollToProgress (page: Page, progress: number): Promise<void> {
    await page.evaluate((p) => {
        const r = document.querySelector('section.home-cta')!.getBoundingClientRect()
        const top = r.top + scrollY
        // top de la section dans le viewport : de innerHeight (p = 0) à -hauteur (p = 1)
        const wanted = innerHeight - p * (innerHeight + r.height)
        window.scrollTo(0, top - wanted)
    }, progress)
    await page.waitForTimeout(250)
}

/**
 * Opacité maximale (0 à 1) que les plans peignent sous chaque élément de texte, lue sur l'ALPHA réel de chaque
 * image : le plan est dessiné à son rectangle courant (transformation du parallaxe comprise), on garde le plus
 * grand alpha qui recouvre la zone de l'élément, multiplié par l'opacité CSS du plan. Aucune capture d'écran :
 * rien ne dépend de la fin d'une transition ni d'un contenu chargé tard au-dessus.
 */
function landscapeAlphaUnder (page: Page): Promise<Record<string, number>> {
    return page.evaluate(async ([texts]) => {
        const rects = Object.fromEntries(texts.map(cy => [cy, document.querySelector(`[data-cy="${ cy }"]`)!.getBoundingClientRect()]))
        const worst: Record<string, number> = Object.fromEntries(texts.map(cy => [cy, 0]))

        for (const plane of document.querySelectorAll<HTMLElement>('.home-cta__plane')) {
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

test.describe('HomeCta — scène de paysage', () => {

    for (const mode of ['light', 'dark'] as const) {
        test(`${ mode } : trois plans décoratifs, variante du mode, aucune image`, async ({ page }) => {
            await openCta(page, mode)

            await expect(page.locator('[data-cy="cta-scene"]')).toHaveAttribute('aria-hidden', 'true')
            await expect(page.locator('section.home-cta img, section.home-cta svg')).toHaveCount(0)

            for (const plane of PLANES) {
                const bg = await page.locator(`[data-cy="cta-plane-${ plane }"] .home-cta__plane`).evaluate(el => getComputedStyle(el).backgroundImage)
                expect(bg, `${ plane } (${ mode })`).toContain(`/brand/enso/${ mode }/cta-${ plane }-`)
            }
        })
    }

    test('le parallaxe suit le défilement : sens inverse, le plus lointain le plus fort', async ({ page }) => {
        await openCta(page, 'light')

        await scrollToProgress(page, 0.15)
        await expect.poll(() => layerShift(page, 'mountains'), { timeout: 5_000 }).toBeGreaterThan(0)
        const enter = await Promise.all(PLANES.map(p => layerShift(page, p)))
        await scrollToProgress(page, 0.85)
        await expect.poll(() => layerShift(page, 'mountains'), { timeout: 5_000 }).toBeLessThan(0)
        const leave = await Promise.all(PLANES.map(p => layerShift(page, p)))

        PLANES.forEach((plane, i) => {
            expect(enter[i], `${ plane } à l'entrée`).toBeGreaterThan(0)
            expect(leave[i], `${ plane } à la sortie`).toBeLessThan(0)
        })
        // 13 / 8 / 4 px de course maximale dans la maquette (0,22 / 0,14 / 0,06 × 60).
        expect(Math.abs(enter[0])).toBeGreaterThan(Math.abs(enter[1]))
        expect(Math.abs(enter[1])).toBeGreaterThan(Math.abs(enter[2]))
        expect(Math.abs(enter[0])).toBeLessThan(16)
    })

    test('le décalage est vertical seulement (aucun mouvement horizontal)', async ({ page }) => {
        await openCta(page, 'light')
        await scrollToProgress(page, 0.3)
        const x = await page.locator('[data-cy="cta-plane-mountains"]').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m41)
        expect(x).toBe(0)
    })

    test.describe('prefers-reduced-motion: reduce', () => {
        test.use({ reducedMotion: 'reduce' })

        test('les plans ne bougent pas', async ({ page }) => {
            await openCta(page, 'light')

            const shifts = () => Promise.all(PLANES.map(p => layerShift(page, p)))

            await scrollToProgress(page, 0.15)
            await expect.poll(shifts, { timeout: 4_000 }).toEqual([0, 0, 0])
            await scrollToProgress(page, 0.85)
            await expect.poll(shifts, { timeout: 4_000 }).toEqual([0, 0, 0])
        })
    })

    for (const width of [1440, 1024, 768, 390]) {
        for (const mode of ['light', 'dark'] as const) {
            test(`${ width }px ${ mode } : aucun pixel de paysage sous le texte ni sous un bouton`, async ({ page }) => {
                await page.setViewportSize({ width, height: 900 })
                await openCta(page, mode)
                await page.locator('section.home-cta').scrollIntoViewIfNeeded()

                // Les trois positions du parallaxe : neutre et les deux extrêmes (course maximale de chaque plan, posée
                // en ligne : on mesure le décor, pas l'état d'un moteur de défilement).
                for (const sign of [0, 1, -1]) {
                    await page.evaluate(([sg, shifts]) => {
                        for (const [plane, px] of Object.entries(shifts)) {
                            document.querySelector<HTMLElement>(`[data-cy="cta-plane-${ plane }"]`)!.style.setProperty('transform', `translate3d(0, ${ sg * px }px, 0)`, 'important')
                        }
                    }, [sign, MAX_SHIFT_PX] as const)

                    const worst = await landscapeAlphaUnder(page)
                    for (const cy of TEXTS) {
                        expect(
                            worst[cy],
                            `${ cy } (${ width }px, ${ mode }, parallaxe ${ sign }) : un plan du paysage passe sous cet élément (alpha ${ worst[cy].toFixed(3) })`
                        ).toBeLessThanOrEqual(ALPHA_INVISIBLE)
                    }
                }
            })
        }
    }
})
