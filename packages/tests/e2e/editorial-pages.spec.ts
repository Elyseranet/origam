/**
 * editorial-pages.spec.ts — les cinq pages éditoriales dans l'identité enso (#1587)
 *
 * Contrat, sur installation, stabilité, roadmap, changelog et support :
 *  - l'en-tête commun « Vallée » de la famille `editorial` : un seul h1, relié à son id ;
 *  - la page se TERMINE par la scène « Crépuscule » (`section.home-cta`), dernier enfant de
 *    l'`<article>`, dont le ciel part du fond de la section qui la précède (`surface=overlay`) :
 *    ce fond est bien `surface---overlay`, sans quoi le ciel aurait une couture ;
 *  - le titre de la scène est celui de la page ;
 *  - les fonds alternent (une section `overlay` avant la scène, et une `default` s'il y en a plusieurs) ;
 *  - aucun débordement horizontal à 1440 et à 390 px, clair comme sombre ;
 *  - axe : 0 violation critical/serious.
 */

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const PAGES = [
    { path: '/installation', scene: 'Ready to build?', root: 'page-installation', title: 'installation-title', cta: 'installation-cta-title' },
    { path: '/stability', scene: 'Every change is written down.', root: 'page-stability', title: 'stability-title', cta: 'cta-title' },
    { path: '/roadmap', scene: 'Follow the progress.', root: 'page-roadmap', title: 'roadmap-title', cta: 'roadmap-cta-title' },
    { path: '/changelog', scene: 'Stay in the loop.', root: 'page-changelog', title: 'changelog-title', cta: 'changelog-cta-title' },
    { path: '/support', scene: 'Keep origam moving.', root: 'page-support', title: 'support-title', cta: 'cta-title' }
] as const

const VIEWPORTS = [{ width: 1440, height: 900 }, { width: 390, height: 844 }] as const

async function open (page: Page, path: string, mode: 'light' | 'dark'): Promise<void> {
    const baseURL = test.info().project.use.baseURL!
    await page.context().addCookies([{ name: 'origam-mode', value: mode, url: baseURL }])
    await page.goto(path, { waitUntil: 'load' })
    await page.locator('section.home-cta').waitFor({ state: 'attached', timeout: 30_000 })
}

/** Couleur résolue d'un token de surface : on la lit sur une sonde, `getComputedStyle` ne résout pas un `var()` brut. */
function surfaceColors (page: Page): Promise<{ overlay: string, default: string }> {
    return page.evaluate(() => {
        const read = (token: string): string => {
            const probe = document.createElement('div')
            probe.style.backgroundColor = `var(${ token })`
            document.body.append(probe)
            const color = getComputedStyle(probe).backgroundColor
            probe.remove()
            return color
        }
        return { overlay: read('--origam-color__surface---overlay'), default: read('--origam-color__surface---default') }
    })
}

for (const entry of PAGES) {
    test.describe(`${ entry.path } — page éditoriale enso`, () => {
        test('en-tête « Vallée » éditorial, un seul h1 relié à son id', async ({ page }) => {
            await open(page, entry.path, 'light')
            await expect(page.locator('[data-cy="enso-page-header"]')).toHaveCount(1)
            await expect(page.locator('[data-cy="enso-page-header"]')).toHaveAttribute('data-family', 'editorial')
            await expect(page.locator('h1')).toHaveCount(1)
            await expect(page.locator(`h1#${ entry.title }`)).toBeVisible()
        })

        test('la scène Crépuscule clôt la page et part du fond overlay de la section précédente', async ({ page }) => {
            await open(page, entry.path, 'light')

            const closing = await page.locator(`[data-cy="${ entry.root }"]`).evaluate((article) => {
                const last = article.lastElementChild as HTMLElement
                const previous = last.previousElementSibling as HTMLElement
                return {
                    lastIsScene: last.matches('section.home-cta'),
                    labelledBy: last.getAttribute('aria-labelledby'),
                    skyFrom: last.style.getPropertyValue('--home-cta-bg'),
                    previousBg: getComputedStyle(previous).backgroundColor
                }
            })

            expect(closing.lastIsScene).toBe(true)
            expect(closing.labelledBy).toBe(entry.cta)
            expect(closing.skyFrom).toContain('--origam-color__surface---overlay')
            expect(closing.previousBg).toBe((await surfaceColors(page)).overlay)
        })

        test('la scène porte le titre propre à la page, pas celui de la home', async ({ page }) => {
            await open(page, entry.path, 'light')
            await expect(page.locator(`h2#${ entry.cta }`)).toHaveText(entry.scene)
        })

        test('les fonds alternent : une section overlay avant la scène, et une default quand il y en a plusieurs', async ({ page }) => {
            await open(page, entry.path, 'light')
            const colors = await surfaceColors(page)
            const backgrounds = await page.locator(`[data-cy="${ entry.root }"] > section:not(.home-cta)`)
                .evaluateAll(sections => sections.map(s => getComputedStyle(s).backgroundColor))

            expect(backgrounds).toContain(colors.overlay)
            if (backgrounds.length > 1) expect(backgrounds).toContain(colors.default)
        })

        for (const mode of ['light', 'dark'] as const) {
            for (const viewport of VIEWPORTS) {
                test(`aucun débordement horizontal (${ mode }, ${ viewport.width } px)`, async ({ page }) => {
                    await page.setViewportSize(viewport)
                    await open(page, entry.path, mode)
                    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
                    expect(overflow).toBeLessThanOrEqual(0)
                })
            }
        }

        test('axe : 0 violation critical/serious', async ({ page }) => {
            await open(page, entry.path, 'light')
            const results = await new AxeBuilder({ page })
                .include(`[data-cy="${ entry.root }"]`)
                .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
                .analyze()
            expect(results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious')).toEqual([])
        })
    })
}
