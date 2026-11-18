/**
 * marketing-home-no-overflow.spec.ts — la home ne defile jamais en
 * horizontal, a aucune largeur, en EN comme en FR (#1217).
 *
 * Cible le site Nuxt (`playwright.marketing.config.ts`), jamais Histoire.
 *
 * Defaut epingle : le titre du hero portait `white-space: nowrap` au-dessus de
 * 1080px. En FR (« qui marche, tout simplement. », 5.25rem) la ligne ne tient
 * pas dans 1280px : `scrollWidth` 1293 pour `clientWidth` 1280, le `<h1>`
 * debordant de 13px. L'EN tient, d'ou un defaut visible en FR seulement.
 *
 * On mesure une fois la mise en page STABLE (voir `settledOverflow`). Une mesure
 * immediate est fausse dans les deux sens : avant l'arrivee des feuilles
 * scopees (dev) le document deborde passagerement a 375px, et avant la regle
 * fautive elle-meme il ne deborde pas du tout — un `expect.poll` immediat etait
 * vert contre le parent.
 */

import { expect, test, type Page } from '@playwright/test'

const STABLE_SAMPLES = 6
const SAMPLE_INTERVAL_MS = 250

async function settledOverflow (page: Page): Promise<number> {
    let last = Number.NaN
    let stable = 0
    for (let i = 0; i < 40 && stable < STABLE_SAMPLES; i++) {
        const now = await page.evaluate(() =>
            (document.scrollingElement as Element).scrollWidth - document.documentElement.clientWidth)
        stable = now === last ? stable + 1 : 0
        last = now
        await page.waitForTimeout(SAMPLE_INTERVAL_MS)
    }
    return last
}

const WIDTHS = [375, 768, 1024, 1280]
const LOCALES = [
    { name: 'en', path: '/' },
    { name: 'fr', path: '/fr' }
]

for (const { name, path } of LOCALES) {
    for (const width of WIDTHS) {
        test(`home ${name} a ${width}px : scrollWidth == clientWidth`, async ({ page }) => {
            await page.setViewportSize({ width, height: 800 })
            await page.goto(path, { waitUntil: 'load' })
            await page.evaluate(() => document.fonts.ready)

            const overflow = await settledOverflow(page)
            expect(overflow, `debordement horizontal de la home ${name} a ${width}px`).toBeLessThanOrEqual(0)

            const offenders = await page.evaluate(() => {
                const clientWidth = document.documentElement.clientWidth
                return [...document.querySelectorAll('header, main, main *')]
                    .filter(e => e.getBoundingClientRect().right > clientWidth + 0.5 && !e.closest('[aria-hidden="true"]'))
                    .filter(e => {
                        for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) {
                            if (/(hidden|clip|auto|scroll)/.test(getComputedStyle(p).overflowX)) return false
                        }
                        return true
                    })
                    .map(e => `${e.tagName.toLowerCase()}.${String(e.className).slice(0, 40)}`)
            })
            expect(offenders, 'elements qui sortent du viewport sans ancetre qui les clippe').toEqual([])
        })
    }
}
