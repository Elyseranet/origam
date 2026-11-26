/**
 * HomeHero — maquette A du brand kit (#1517, lot 4A).
 *
 * Contrat : eyebrow, H1 « Origam », accroche, description, deux CTA, et une
 * illustration purement décorative (aquarelle en clair, symbole A1 en sombre).
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
        await expect(h1).toHaveText('Origam')
        await expect(h1).toHaveAttribute('id', 'hero-title')
    })

    test('eyebrow, accroche et description sont visibles', async ({ page }) => {
        await expect(page.locator('[data-cy="hero-eyebrow"]')).toHaveText('DESIGN SYSTEM')
        await expect(page.locator('#hero .home-hero__tagline')).toBeVisible()
        await expect(page.locator('#hero .home-hero__description')).toBeVisible()
    })

    test('CTA « Get started » mène à /installation', async ({ page }) => {
        const cta = page.locator('[data-cy="hero-cta-start"]')
        await expect(cta).toBeVisible()
        await expect(cta).toHaveAttribute('href', '/installation')
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
        for (const cy of ['hero-watercolor', 'hero-symbol', 'hero-night']) {
            await expect(page.locator(`#hero [data-cy="${cy}"] img`)).toHaveAttribute('alt', '')
        }
    })

    test('clair : aquarelle AVIF avec srcset et symbole A1 en couleurs ; le symbole nuit est masqué', async ({ browser }) => {
        const ctx = await browser.newContext({ colorScheme: 'light', viewport: { width: 1440, height: 900 } })
        const page = await ctx.newPage()
        await page.goto('/')
        const day = page.locator('#hero [data-cy="hero-watercolor"]')
        await expect(day).toBeVisible()
        expect(await day.locator('img').getAttribute('srcset')).toMatch(/hero-watercolor-836\.avif 836w.*1672w/)
        await expect(page.locator('#hero [data-cy="hero-symbol"]')).toBeVisible()
        await expect(page.locator('#hero [data-cy="hero-night"]')).toBeHidden()
        await ctx.close()
    })

    test('le texte du hero s\'aligne sur le logo du header (gouttière du site)', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 })
        await page.goto('/')
        const gutter = await page.evaluate(() => {
            const logo = document.querySelector('[data-cy="site-logo"]') as HTMLElement
            const text = document.querySelector('#hero .home-hero__header') as HTMLElement
            return { logo: Math.round(logo.getBoundingClientRect().left), text: Math.round(text.getBoundingClientRect().left) }
        })
        expect(Math.abs(gutter.text - gutter.logo)).toBeLessThanOrEqual(2)
    })

    test('sombre : pas de paysage, symbole A1 seul', async ({ browser }) => {
        const ctx = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1440, height: 900 } })
        const page = await ctx.newPage()
        await page.goto('/')
        await expect(page.locator('#hero [data-cy="hero-watercolor"]')).toBeHidden()
        await expect(page.locator('#hero [data-cy="hero-symbol"]')).toBeHidden()
        await expect(page.locator('#hero [data-cy="hero-night"]')).toBeVisible()
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
