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
const TEXTS = ['cta-title', 'cta-description', 'cta-btn-components', 'cta-btn-docs']

async function openCta (page: Page, mode: 'light' | 'dark'): Promise<void> {
    const baseURL = test.info().project.use.baseURL!
    await page.context().addCookies([
        { name: 'origam-theme', value: 'origam', url: baseURL },
        { name: 'origam-mode', value: mode, url: baseURL }
    ])
    await page.goto('/', { waitUntil: 'load' })
    await page.locator('[data-cy="cta-plane-foreground"]').waitFor({ state: 'attached', timeout: 30_000 })
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

/** Capture de chaque élément de texte de la section (marge de 4 px), un par un pour ne dépendre d'aucun défilement. */
async function shootTexts (page: Page): Promise<Record<string, Buffer>> {
    const shots: Record<string, Buffer> = {}
    for (const cy of TEXTS) {
        const loc = page.locator(`[data-cy="${ cy }"]`)
        await loc.scrollIntoViewIfNeeded()
        const box = (await loc.boundingBox())!
        const width = page.viewportSize()!.width
        shots[cy] = await page.screenshot({
            clip: { x: Math.max(0, box.x - 4), y: box.y - 4, width: Math.min(width, box.width + 8), height: box.height + 8 },
            animations: 'disabled'
        })
    }
    return shots
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

            await scrollToProgress(page, 0.02)
            const enter = await Promise.all(PLANES.map(p => layerShift(page, p)))
            await scrollToProgress(page, 0.98)
            const leave = await Promise.all(PLANES.map(p => layerShift(page, p)))

            expect(enter).toEqual([0, 0, 0])
            expect(leave).toEqual([0, 0, 0])
        })
    })

    for (const width of [1440, 1024, 768, 390]) {
        for (const mode of ['light', 'dark'] as const) {
            test(`${ width }px ${ mode } : aucun pixel de paysage sous le texte ni sous un bouton`, async ({ page }) => {
                await page.setViewportSize({ width, height: 900 })
                await openCta(page, mode)
                await page.emulateMedia({ reducedMotion: 'reduce' })
                await page.locator('section.home-cta').scrollIntoViewIfNeeded()

                // Rendu avec les plans, puis sans ; le texte reste le même dans les deux.
                const withPlanes = await shootTexts(page)
                await page.addStyleTag({ content: '.home-cta__plane { visibility: hidden !important }' })
                const withoutPlanes = await shootTexts(page)

                for (const cy of TEXTS) {
                    expect(
                        withPlanes[cy].equals(withoutPlanes[cy]),
                        `${ cy } (${ width }px, ${ mode }) : un plan du paysage passe sous cet élément`
                    ).toBe(true)
                }
            })
        }
    }
})
