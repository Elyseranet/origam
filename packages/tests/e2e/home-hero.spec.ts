/**
 * HomeHero — maquette A du brand kit (#1517, lot 4A).
 *
 * Contrat (#1543) : eyebrow, H1 « The Vue 3 design system that folds to your
 * brand », accroche « Props first, CSS second. », description, deux CTA, la
 * ligne `npm i origam` copiable, la ligne de preuves, et une illustration
 * purement décorative (aquarelle en clair, symbole A1 en sombre).
 *
 * Pré-requis : dev server marketing sur MARKETING_BASE_URL (défaut :3000).
 * Run :
 *   pnpm -F @origam/tests exec playwright test \
 *     --config=playwright.marketing.config.ts home-hero
 */

import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('HomeHero — maquette A', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('load')
    })

    test('section #hero référence son <h1> unique', async ({ page }) => {
        await expect(page.locator('#hero')).toHaveAttribute('aria-labelledby', 'hero-title')
        const h1 = page.locator('#hero h1')
        await expect(h1).toHaveCount(1)
        await expect(h1).toHaveText('The Vue 3 design system that folds to your brand')
        await expect(h1).toHaveAttribute('id', 'hero-title')
    })

    test('eyebrow, accroche et description sont visibles', async ({ page }) => {
        await expect(page.locator('[data-cy="hero-eyebrow"]')).toHaveText('VUE 3 DESIGN SYSTEM')
        await expect(page.locator('#hero .home-hero__tagline')).toHaveText('Props first, CSS second.')
        await expect(page.locator('#hero .home-hero__description')).toBeVisible()
    })

    test('CTA « Install » mène à /installation', async ({ page }) => {
        const cta = page.locator('[data-cy="hero-cta-start"]')
        await expect(cta).toBeVisible()
        await expect(cta).toContainText('Install')
        await expect(cta).toHaveAttribute('href', '/installation')
    })

    test('la ligne « npm i origam » est un OrigamCode copiable, invite hors du code', async ({ page }) => {
        const code = page.locator('[data-cy="hero-install-command"]')
        await expect(code).toBeVisible()
        await expect(code).toHaveClass(/origam-code/)
        await expect(code.locator('code')).toHaveText('npm i origam')
        await expect(code.locator('button')).toHaveCount(1)
    })

    test('la ligne de preuves cite la licence, Vue et Nuxt, sans compteur d\'adoption', async ({ page }) => {
        await expect(page.locator('[data-cy="hero-proof"]')).toHaveText('MIT license · Vue 3.5+ · Nuxt module included')
        await expect(page.locator('#hero')).not.toContainText(/stars|downloads|WCAG/i)
    })

    test('CTA GitHub est externe (target=_blank, rel noopener)', async ({ page }) => {
        const cta = page.locator('[data-cy="hero-cta-github"]')
        await expect(cta).toBeVisible()
        expect(await cta.getAttribute('href')).toMatch(/github\.com/)
        await expect(cta).toHaveAttribute('target', '_blank')
        expect(await cta.getAttribute('rel')).toContain('noopener')
    })

    test('les deux CTA sont dans un <nav> avec aria-label', async ({ page }) => {
        const nav = page.locator('#hero nav[aria-label]')
        await expect(nav).toBeAttached()
        expect(await nav.locator('a, button').count()).toBeGreaterThanOrEqual(2)
    })

    test('illustrations : décoratives (alt vide) et hors du flux de lecture', async ({ page }) => {
        const visual = page.locator('#hero .home-hero__visual')
        await expect(visual).toHaveAttribute('aria-hidden', 'true')
        for (const cy of ['hero-watercolor', 'hero-symbol']) {
            await expect(page.locator(`#hero [data-cy="${cy}"] img`)).toHaveAttribute('alt', '')
        }
    })

    test('clair : aquarelle AVIF avec srcset et symbole A1 en couleurs', async ({ browser }) => {
        const ctx = await browser.newContext({ colorScheme: 'light', viewport: { width: 1440, height: 900 } })
        const page = await ctx.newPage()
        await page.goto('/')
        const day = page.locator('#hero [data-cy="hero-watercolor"]')
        await expect(day).toBeVisible()
        expect(await day.locator('img').getAttribute('srcset')).toMatch(/hero-watercolor-836\.avif 836w.*1672w/)
        await expect(page.locator('#hero [data-cy="hero-symbol"]')).toBeVisible()
        await ctx.close()
    })

    test('le texte du hero s\'aligne sur le bord commun de la home (80 px en 1440)', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 })
        await page.goto('/')
        const lefts = await page.evaluate(() => {
            const playground = document.querySelector('section#playground')!
            return {
                hero: Math.round(document.querySelector('#hero .home-hero__header')!.getBoundingClientRect().left),
                playground: Math.round(playground.getBoundingClientRect().left + parseFloat(getComputedStyle(playground).paddingLeft))
            }
        })
        // (1440 - 1280) / 2 = 80
        expect(lefts.hero).toBe(80)
        expect(lefts.hero).toBe(lefts.playground)
    })

    test('T3 — CTA x-large (52 px, 16 px / 600, 12 px de rayon), GitHub en contour avec son icône', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 })
        await page.goto('/')
        const m = await page.evaluate(() => {
            const read = (cy: string) => {
                const el = document.querySelector(`[data-cy="${cy}"]`)!
                const s = getComputedStyle(el)
                return {
                    h: Math.round(el.getBoundingClientRect().height),
                    fs: s.fontSize,
                    fw: s.fontWeight,
                    radius: s.borderTopLeftRadius,
                    px: s.paddingLeft,
                    border: s.borderTopWidth,
                    icon: !!el.querySelector('.origam-icon')
                }
            }
            return { start: read('hero-cta-start'), github: read('hero-cta-github') }
        })
        for (const b of [m.start, m.github]) {
            expect(b).toMatchObject({ h: 52, fs: '16px', fw: '600', radius: '12px', px: '32px', icon: true })
        }
        expect(m.github.border).toBe('1px')
        expect(m.start.border).toBe('0px')
    })

    test('T3 — H1 à 56 px, description à 18 px, eyebrow avec trait jaune incliné', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 })
        await page.goto('/')
        const m = await page.evaluate(() => {
            const fs = (sel: string) => getComputedStyle(document.querySelector(sel)!).fontSize
            const mark = getComputedStyle(document.querySelector('#hero .home-hero__eyebrow')!, '::before')
            return { h1: fs('#hero h1'), description: fs('#hero .home-hero__description'), bg: mark.backgroundColor, transform: mark.transform }
        })
        expect(m.h1).toBe('56px')
        expect(m.description).toBe('18px')
        expect(m.bg).not.toBe('rgba(0, 0, 0, 0)')
        expect(m.transform).not.toBe('none')
    })

    test('T3 — symbole A1 : 36 % de la largeur, 74 % de la hauteur du hero, en haut', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 })
        await page.goto('/')
        // l'image arrive avec une animation d'entrée : on attend qu'elle se pose.
        await expect.poll(async () => page.evaluate(() => {
            const hero = document.querySelector('#hero')!.getBoundingClientRect()
            const sy = document.querySelector('#hero [data-cy="hero-symbol"]')!.getBoundingClientRect()
            return {
                w: Math.round(sy.width / hero.width * 100) / 100,
                h: Math.round(sy.height / hero.height * 100) / 100,
                top: Math.round((sy.top - hero.top) / hero.height * 100) / 100
            }
        })).toEqual({ w: 0.36, h: 0.74, top: 0.04 })
    })

    test('sombre : le hero reste en clair (aquarelle, symbole, texte encre lisible) sur une page sombre', async ({ browser }) => {
        const ctx = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1440, height: 900 } })
        const page = await ctx.newPage()
        await page.goto('/')
        await expect(page.locator('#hero [data-cy="hero-watercolor"]')).toBeVisible()
        await expect(page.locator('#hero [data-cy="hero-symbol"]')).toBeVisible()
        const m = await page.evaluate(() => {
            const lum = (c: string) => {
                const [r, g, b] = (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number).map(v => {
                    const x = v / 255
                    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
                })
                return 0.2126 * r + 0.7152 * g + 0.0722 * b
            }
            const ratio = (a: string, b: string) => {
                const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
                return (hi + 0.05) / (lo + 0.05)
            }
            const bg = getComputedStyle(document.querySelector('#hero')!).backgroundColor
            const color = (sel: string) => getComputedStyle(document.querySelector(sel)!).color
            const cta = getComputedStyle(document.querySelector('[data-cy="hero-cta-start"]')!)
            return {
                mode: document.querySelector('#hero')!.closest('[data-mode]')?.getAttribute('data-mode'),
                title: ratio(color('#hero .home-hero__title'), bg),
                description: ratio(color('#hero .home-hero__description'), bg),
                cta: ratio(cta.color, cta.backgroundColor)
            }
        })
        expect(m.mode).toBe('light')
        expect(m.title).toBeGreaterThanOrEqual(4.5)
        expect(m.description).toBeGreaterThanOrEqual(4.5)
        expect(m.cta).toBeGreaterThanOrEqual(4.5)
        await ctx.close()
    })

    test('a11y — pas de violation axe-core critique ou sérieuse sur la section hero', async ({ page }) => {
        const results = await new AxeBuilder({ page }).include('#hero').analyze()
        const critical = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious')
        expect(
            critical,
            `a11y violations critiques/sérieuses sur #hero :\n` +
            critical.map(v => `  [${v.impact}] ${v.id}: ${v.description}`).join('\n')
        ).toHaveLength(0)
    })

})
