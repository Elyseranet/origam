/**
 * marketing-catalog-index.spec.ts — les 8 index du catalogue dans l'identité enso (#1585)
 *
 * Contrat, pour chacune des 8 pages (`components`, `composables`, `consts`, `directives`, `enums`,
 * `interfaces`, `types`, `utils`) :
 *  - l'en-tête commun « Vallée » de la famille `catalog` : fil d'Ariane, eyebrow, UN h1 relié à son id,
 *    intro ; plus aucune pastille ni titre bicolore ;
 *  - le corps : recherche, ligne de compte, puces d'ancrage (≤ 12 groupes : en pratique `components` seul), cartes ;
 *  - AUCUN décor au milieu des grilles : ni pétales, ni fond illustré, ni scène hors de l'en-tête ;
 *  - hiérarchie h1 > h2 (groupes) > h3 (cartes) ; recherche sans résultat = état vide annoncé ;
 *  - pas de débordement horizontal à 1440 et 390 px, clair ET sombre ; axe sans violation.
 *
 * À lancer contre le BUILD DE PRODUCTION servi (`MARKETING_BASE_URL`), pas le serveur de dev.
 */

import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PAGES = [
    { route: 'components', grouped: true },
    { route: 'composables', grouped: true },
    { route: 'consts', grouped: true },
    { route: 'directives', grouped: false },
    { route: 'enums', grouped: true },
    { route: 'interfaces', grouped: true },
    { route: 'types', grouped: true },
    { route: 'utils', grouped: true }
] as const

const MODES = ['light', 'dark'] as const

async function openIndex (page: Page, route: string, mode: 'light' | 'dark'): Promise<void> {
    const baseURL = test.info().project.use.baseURL!
    await page.context().addCookies([
        { name: 'origam-theme', value: 'origam', url: baseURL },
        { name: 'origam-mode', value: mode, url: baseURL }
    ])
    await page.goto(`/${ route }`, { waitUntil: 'load' })
    await page.locator(`[data-cy^="${ route === 'directives' ? 'directive' : route }-card-"]`).first().waitFor({ state: 'visible', timeout: 30_000 })
    // Hydratation terminee avant de saisir : un `fill` sur le HTML serveur est perdu.
    await page.waitForLoadState('networkidle')
}

for (const { route, grouped } of PAGES) {
    test.describe(`/${ route } — index du catalogue`, () => {
        test('en-tête commun de la famille catalog, un seul h1 relié à son id', async ({ page }) => {
            await openIndex(page, route, 'light')

            const header = page.locator('[data-cy="enso-page-header"]')
            await expect(header).toHaveAttribute('data-family', 'catalog')
            await expect(page.locator('[data-cy="page-header-breadcrumb"] [aria-current="page"]')).toBeVisible()
            await expect(page.locator('[data-cy="page-header-eyebrow"]')).toBeVisible()
            await expect(page.locator('[data-cy="page-header-intro"]')).not.toBeEmpty()

            await expect(page.locator('h1')).toHaveCount(1)
            const h1 = page.locator(`#${ route }-title`)
            await expect(h1).toBeVisible()
            await expect(h1).toHaveClass(/origam-title/)
            // Plus de titre bicolore ni de pastille au-dessus du titre.
            await expect(h1.locator('span')).toHaveCount(0)
            await expect(page.locator(`[class*="${ route }-hero"]`)).toHaveCount(0)
        })

        test('aucun décor au milieu des grilles : rien de l\'illustration hors de l\'en-tête', async ({ page }) => {
            await openIndex(page, route, 'light')

            await expect(page.locator(`[data-cy="page-${ route }"] [class*="enso-petals"], [data-cy="page-${ route }"] [class*="enso-backdrop"], [data-cy="page-${ route }"] [class*="enso-divider"]`)).toHaveCount(0)
            const outside = await page.evaluate(() => {
                const header = document.querySelector('[data-cy="enso-page-header"]')!
                return [...document.querySelectorAll('main [data-cy^="page-"] *')]
                    .filter(el => !header.contains(el))
                    .filter(el => /url\(/.test(getComputedStyle(el).backgroundImage))
                    .length
            })
            expect(outside).toBe(0)
        })

        test('recherche, compte, cartes (h3) et groupes (h2)', async ({ page }) => {
            await openIndex(page, route, 'light')

            const search = page.locator(`[data-cy="${ route }-search"] input`)
            await expect(search).toBeVisible()
            await expect(page.locator(`[data-cy="${ route }-tools"] .catalog-tools__count`)).not.toBeEmpty()

            const cards = page.locator('.catalog-card')
            expect(await cards.count()).toBeGreaterThan(3)
            await expect(cards.first().locator('h3')).toBeVisible()
            const href = await cards.first().evaluate(el => (el as HTMLAnchorElement).getAttribute('href'))
            expect(href).toMatch(new RegExp(`/${ route }/[a-z0-9]`))

            if (grouped) {
                const titles = page.locator('.catalog-group__title')
                expect(await titles.count()).toBeGreaterThanOrEqual(2)
                expect(await titles.first().evaluate(el => el.tagName)).toBe('H2')
            } else {
                await expect(page.locator('.catalog-group__title')).toHaveCount(0)
            }
        })

        test('recherche sans résultat : état vide annoncé, puis retour à la liste', async ({ page }) => {
            await openIndex(page, route, 'light')
            const search = page.locator(`[data-cy="${ route }-search"] input`)
            await search.fill('zzzzqqqq')
            const empty = page.locator(`[data-cy="${ route }-empty"]`)
            await expect(empty).toBeVisible()
            await expect(empty).toHaveAttribute('role', 'status')
            await expect(page.locator('.catalog-card')).toHaveCount(0)
            await search.fill('')
            await expect(empty).toHaveCount(0)
            expect(await page.locator('.catalog-card').count()).toBeGreaterThan(3)
        })

        if (grouped) {
            test('puces d\'ancrage : une par groupe jusqu\'à 12 groupes, aucune au-delà (mur de puces)', async ({ page }) => {
                await openIndex(page, route, 'light')
                const jumps = page.locator(`[data-cy="${ route }-tools"] nav a`)
                const groupCount = await page.locator('.catalog-group').count()
                if (groupCount > 12) {
                    await expect(jumps).toHaveCount(0)
                    return
                }
                await expect(jumps).toHaveCount(groupCount)

                const last = jumps.last()
                const target = (await last.getAttribute('href'))!.slice(1)
                await last.click()
                await expect(page).toHaveURL(new RegExp(`#${ target }$`))
                await expect(page.locator(`#${ target }`)).toBeInViewport()
            })
        }

        for (const mode of MODES) {
            for (const width of [1440, 390]) {
                test(`${ mode } ${ width } px : pas de débordement horizontal`, async ({ page }) => {
                    await page.setViewportSize({ width, height: 900 })
                    await openIndex(page, route, mode)
                    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
                    expect(overflow).toBeLessThanOrEqual(0)
                })
            }

            test(`${ mode } : axe, 0 violation WCAG 2 A/AA`, async ({ page }) => {
                await openIndex(page, route, mode)
                const results = await new AxeBuilder({ page })
                    .include(`[data-cy="page-${ route }"]`)
                    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
                    .analyze()
                expect(results.violations.map(v => `${ v.id } (${ v.impact }) x${ v.nodes.length }`)).toEqual([])
            })
        }
    })
}
