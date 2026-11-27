/**
 * enso-legal-pages.spec.ts — pages legal, privacy, contact, wireframe dans l'identité enso (#1588)
 *
 * Contrat, clair ET sombre, à 1440 et 390 px :
 *  - l'en-tête commun « Vallée » (#1584) ouvre la page, dans la famille attendue ;
 *  - un seul h1, celui de l'en-tête, relié à son id ; fil d'Ariane et intro présents ;
 *  - plus aucun reste de l'ancien hero (pastille centrée, grille, halo) ;
 *  - le corps partage le bord gauche de l'en-tête (même gouttière) ;
 *  - aucun défilement horizontal, aucune violation axe serious/critical.
 */

import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PAGES = [
    { route: '/legal', name: 'legal', family: 'legal', section: '.legal-notice__section' },
    { route: '/privacy', name: 'privacy', family: 'legal', section: '.privacy-block' },
    { route: '/contact', name: 'contact', family: 'legal', section: '.contact-block' },
    { route: '/wireframe', name: 'wireframe', family: 'catalog', section: '.wireframe-gallery' }
] as const

const MODES = ['light', 'dark'] as const
const VIEWPORTS = [{ width: 1440, height: 900 }, { width: 390, height: 844 }] as const

async function open (page: Page, route: string, mode: 'light' | 'dark'): Promise<void> {
    const baseURL = test.info().project.use.baseURL!
    await page.context().addCookies([
        { name: 'origam-theme', value: 'origam', url: baseURL },
        { name: 'origam-mode', value: mode, url: baseURL }
    ])
    await page.goto(route, { waitUntil: 'load' })
    await page.locator('[data-cy="enso-page-header"]').waitFor({ state: 'visible', timeout: 30_000 })
    await page.evaluate(() => document.fonts.ready)
}

for (const { route, name, family, section } of PAGES) {
    for (const mode of MODES) {
        for (const viewport of VIEWPORTS) {
            test.describe(`${ route } — ${ mode } ${ viewport.width }px`, () => {
                test.use({ viewport })

                test('en-tête commun, un seul h1, aucun reste de l\'ancien hero', async ({ page }) => {
                    await open(page, route, mode)
                    await expect(page.locator('[data-cy="enso-page-header"]')).toHaveAttribute('data-family', family)
                    await expect(page.locator('h1')).toHaveCount(1)
                    await expect(page.locator('[data-cy="page-header-title"]')).toHaveAttribute('id', `${ name }-title`)
                    await expect(page.locator(`[data-cy="${ name }-breadcrumb"]`)).toBeVisible()
                    await expect(page.locator('[data-cy="page-header-intro"]')).toBeVisible()
                    await expect(page.locator(`.${ name }-hero, .wireframe-hero, .legal-notice__hero`)).toHaveCount(0)
                })

                test('le corps partage le bord gauche de l\'en-tête, sans défilement horizontal', async ({ page }) => {
                    await open(page, route, mode)
                    const edges = await page.evaluate((sel) => {
                        const title = document.querySelector('[data-cy="page-header-title"]')!
                        const body = document.querySelector(`${ sel } .home-container`)!
                        const cs = getComputedStyle(body)
                        return {
                            title: Math.round(title.getBoundingClientRect().left),
                            body: Math.round(body.getBoundingClientRect().left + parseFloat(cs.paddingLeft)),
                            overflow: document.documentElement.scrollWidth - window.innerWidth
                        }
                    }, section)
                    expect(edges.body).toBe(edges.title)
                    expect(edges.overflow).toBeLessThanOrEqual(0)
                })

                test('axe : aucune violation serious/critical', async ({ page }) => {
                    await open(page, route, mode)
                    // Le bouton « Change language » du header échoue `label-content-name-mismatch` sur toutes les pages (#1606, hors périmètre).
                    const { violations } = await new AxeBuilder({ page }).exclude('button[aria-label="Change language"]').analyze()
                    const blocking = violations.filter(v => v.impact === 'serious' || v.impact === 'critical')
                    expect(blocking.map(v => `${ v.id }: ${ v.nodes.map(n => n.target.join(' ')).join(' | ') }`)).toEqual([])
                })
            })
        }
    }
}
