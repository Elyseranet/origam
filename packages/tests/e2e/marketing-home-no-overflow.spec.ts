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
    // #1516 — en dev, le SCSS des SFC est injecte APRES `load`, par salves (186
    // balises <style> au premier rendu, 441 une fois layout et home charges,
    // mesure a froid). Tant qu'il manque, le footer et le tableau de la home
    // debordent de 10 a 79px a 375px ; sur un runner lent, la fenetre de
    // stabilite ci-dessous peut se refermer AVANT la salve et retenir cette
    // valeur transitoire. On attend donc le signal que le CSS du layout est la
    // (la regle scopee `.site-footer { display: flex }`), et on exige aussi que
    // le nombre de balises <style> soit stable.
    await page.waitForFunction(() => {
        const footer = document.querySelector('.site-footer')
        return footer !== null && getComputedStyle(footer).display === 'flex'
    }, undefined, { timeout: 30_000 })

    let last = Number.NaN
    let lastStyles = Number.NaN
    let stable = 0
    for (let i = 0; i < 40 && stable < STABLE_SAMPLES; i++) {
        const [now, styles] = await page.evaluate(() => [
            (document.scrollingElement as Element).scrollWidth - document.documentElement.clientWidth,
            document.querySelectorAll('style').length
        ])
        stable = now === last && styles === lastStyles ? stable + 1 : 0
        last = now
        lastStyles = styles
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
            // Releve AVANT l'assertion : un echec en CI (Linux) ne laisse sinon
            // aucune trace de l'element fautif, seulement « Received: 1 ».
            const widest = await page.evaluate(() => {
                const clientWidth = document.documentElement.clientWidth
                return [...document.querySelectorAll('body *')]
                    .map(e => ({ e, r: e.getBoundingClientRect() }))
                    .filter(({ r }) => r.width > 0 && r.right > clientWidth)
                    .sort((a, b) => b.r.right - a.r.right)
                    .slice(0, 5)
                    .map(({ e, r }) => `${e.tagName.toLowerCase()}.${String(e.className).slice(0, 40)} right=${r.right.toFixed(2)} width=${r.width.toFixed(2)}`)
            })
            expect(overflow, `debordement horizontal de la home ${name} a ${width}px — ${widest.join(' | ')}`).toBeLessThanOrEqual(0)

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
