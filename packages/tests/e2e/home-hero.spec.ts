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

    test('illustrations : plans décoratifs hors du flux de lecture, sans image dans l\'arbre', async ({ page }) => {
        await expect(page.locator('#hero .home-hero__visual')).toHaveAttribute('aria-hidden', 'true')
        await expect(page.locator('#hero img')).toHaveCount(0)
    })

    test('clair : six plans sur grand écran, le soleil sous les montagnes, variante claire en AVIF', async ({ browser }) => {
        const ctx = await browser.newContext({ colorScheme: 'light', viewport: { width: 1440, height: 900 } })
        const page = await ctx.newPage()
        await page.goto('/')
        for (const key of ['sun', 'mountains', 'landscape', 'pagoda', 'sakura', 'enso']) {
            await expect(page.locator(`#hero [data-cy="hero-plane-${key}"]`)).toBeVisible()
        }
        await expect(page.locator('#hero [data-cy="hero-plane-sky"]')).toHaveCount(0)
        const bg = await page.locator('#hero [data-cy="hero-plane-mountains"]').evaluate(el => getComputedStyle(el).backgroundImage)
        expect(bg).toMatch(/brand\/enso\/light\/hero-mountains-.*\.avif/)
        const order = await page.evaluate(() => [...document.querySelectorAll('#hero [data-cy^="hero-plane-"]')].map(el => (el as HTMLElement).dataset.cy))
        expect(order.indexOf('hero-plane-sun')).toBeLessThan(order.indexOf('hero-plane-mountains'))
        await ctx.close()
    })

    test('sous 860 px : enso et soleil retirés, les autres plans restent', async ({ browser }) => {
        const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
        const page = await ctx.newPage()
        await page.goto('/')
        for (const key of ['sun', 'enso']) {
            await expect(page.locator(`#hero [data-cy="hero-plane-${key}"]`)).toBeHidden()
        }
        for (const key of ['mountains', 'landscape', 'pagoda', 'sakura']) {
            await expect(page.locator(`#hero [data-cy="hero-plane-${key}"]`)).toBeVisible()
        }
        await ctx.close()
    })

    test('le texte du hero s\'aligne sur le bord commun de la home (178 px en 1440, maquette v12)', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 })
        await page.goto('/')
        const lefts = await page.evaluate(() => {
            const playground = document.querySelector('section#playground .home-container')!
            return {
                hero: Math.round(document.querySelector('#hero .home-hero__header')!.getBoundingClientRect().left),
                playground: Math.round(playground.getBoundingClientRect().left + parseFloat(getComputedStyle(playground).paddingLeft))
            }
        })
        // maquette v12 : (1440 - 1200) / 2 + 4vw = 177,6
        expect(lefts.hero).toBe(178)
        expect(lefts.hero).toBe(lefts.playground)
    })

    test('T3 — CTA x-large (52 px, 15 px / 600, 12 px de rayon), GitHub en contour avec son icône', async ({ page }) => {
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
            expect(b).toMatchObject({ h: 52, fs: '15px', fw: '600', radius: '12px', px: '32px', icon: true })
        }
        expect(m.github.border).toBe('1px')
        expect(m.start.border).toBe('0px')
    })

    test('T3 — H1 à 59,2 px (3,7rem, maquette v12), description à 15 px, eyebrow avec marque dorée inclinée', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 })
        await page.goto('/')
        const m = await page.evaluate(() => {
            const fs = (sel: string) => getComputedStyle(document.querySelector(sel)!).fontSize
            const mark = getComputedStyle(document.querySelector('#hero .home-hero__eyebrow')!, '::before')
            return { h1: fs('#hero h1'), description: fs('#hero .home-hero__description'), bg: mark.backgroundImage, transform: mark.transform }
        })
        expect(m.h1).toBe('59.2px')
        expect(m.description).toBe('15px')
        expect(m.bg).toContain('/brand/enso/shared/gold-tick-')
        expect(m.transform).not.toBe('none')
    })

    test('sombre : variantes sombres des plans (soleil partagé), texte lisible', async ({ browser }) => {
        const ctx = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1440, height: 900 } })
        const page = await ctx.newPage()
        await page.goto('/')
        const bg = (key: string) => page.locator(`#hero [data-cy="hero-plane-${key}"]`).evaluate(el => getComputedStyle(el).backgroundImage)
        expect(await bg('mountains')).toMatch(/brand\/enso\/dark\/hero-mountains-.*\.avif/)
        expect(await bg('enso')).toMatch(/brand\/enso\/dark\/enso-open-.*\.avif/)
        expect(await bg('sun')).toMatch(/brand\/enso\/shared\/sun-disc-.*\.avif/)
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
        expect(m.title).toBeGreaterThanOrEqual(4.5)
        expect(m.description).toBeGreaterThanOrEqual(4.5)
        expect(m.cta).toBeGreaterThanOrEqual(4.5)
        await ctx.close()
    })

    test('a11y — aucune violation axe-core (WCAG 2.0 A/AA, 2.1 A/AA) sur la section hero, clair et sombre', async ({ browser }) => {
        for (const colorScheme of ['light', 'dark'] as const) {
            const ctx = await browser.newContext({ colorScheme, viewport: { width: 1440, height: 900 } })
            const page = await ctx.newPage()
            await page.goto('/')
            await page.waitForLoadState('load')
            const results = await new AxeBuilder({ page }).include('#hero').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
            expect(
                results.violations,
                `${colorScheme} : ` + results.violations.map(v => `[${v.impact}] ${v.id}`).join(', ')
            ).toHaveLength(0)
            await ctx.close()
        }
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
