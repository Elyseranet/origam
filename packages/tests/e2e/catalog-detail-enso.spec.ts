/**
 * catalog-detail-enso.spec.ts — les fiches du catalogue `[slug]` dans l'identité enso (#1586)
 *
 * ⛔ Vise le site Nuxt servi (build de production), jamais Histoire. Lit la base : sans Postgres semé,
 * `/api/reference/**` répond 503.
 *
 * Contrat, pour UNE fiche de chacune des 8 familles, en clair ET en sombre :
 *  - l'en-tête commun « Vallée » famille `catalog` (fil d'Ariane, eyebrow = famille, h1 = nom, intro) ;
 *  - UN seul h1, relié à son id, qui porte le nom de l'entrée ;
 *  - le décor reste dans l'en-tête : ni pétale, ni fond illustré dans le corps de la fiche ;
 *  - le bord gauche de l'en-tête, du fil d'Ariane et du corps sont le même (maquette : un seul bord gauche) ;
 *  - 1440 px et 390 px : aucun débordement horizontal ;
 *  - axe-core : 0 violation critical / serious sur l'en-tête et le fil d'Ariane.
 */

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const FAMILIES = [
    { kind: 'component', route: 'components', label: 'Components' },
    { kind: 'composable', route: 'composables', label: 'Composables' },
    { kind: 'directive', route: 'directives', label: 'Directives' },
    { kind: 'enum', route: 'enums', label: 'Enums' },
    { kind: 'interface', route: 'interfaces', label: 'Interfaces' },
    { kind: 'type', route: 'types', label: 'Types' },
    { kind: 'util', route: 'utils', label: 'Utils' },
    { kind: 'const', route: 'consts', label: 'Constants' }
] as const

const MODES = ['light', 'dark'] as const

interface ICatalogRow { slug: string; parentSlug?: string | null }

async function openDetail (page: Page, kind: string, route: string, mode: 'light' | 'dark'): Promise<string> {
    const baseURL = test.info().project.use.baseURL!
    const rows: ICatalogRow[] = await (await page.request.get(`/api/reference/${ kind }`)).json()
    const slug = rows.filter(r => !r.parentSlug)[Math.min(5, rows.length - 1)].slug

    await page.context().addCookies([
        { name: 'origam-theme', value: 'origam', url: baseURL },
        { name: 'origam-mode', value: mode, url: baseURL }
    ])
    await page.goto(`/${ route }/${ slug }`, { waitUntil: 'load' })
    await page.locator('[data-cy="enso-page-header"]').waitFor({ state: 'visible', timeout: 30_000 })
    await page.evaluate(() => document.fonts.ready)

    return slug
}

for (const family of FAMILIES) {
    for (const mode of MODES) {
        test.describe(`fiche ${ family.kind } — ${ mode }`, () => {
            test('en-tête « Vallée » catalogue : fil d\'Ariane, eyebrow, h1, intro', async ({ page }) => {
                await page.setViewportSize({ width: 1440, height: 900 })
                await openDetail(page, family.kind, family.route, mode)

                const header = page.locator('[data-cy="enso-page-header"]')
                await expect(header).toHaveAttribute('data-family', 'catalog')
                await expect(header.locator('[data-cy="page-header-breadcrumb"] .catalog-breadcrumb')).toBeVisible()
                await expect(header.locator('[data-cy="page-header-eyebrow"]')).toHaveText(family.label)
                // Une entrée sans description n'a pas d'intro (le <p> n'est pas rendu) ; sinon elle n'est jamais vide.
                if (await header.locator('[data-cy="page-header-intro"]').count()) {
                    await expect(header.locator('[data-cy="page-header-intro"]')).not.toBeEmpty()
                }

                const h1 = page.locator('h1')
                await expect(h1).toHaveCount(1)
                await expect(h1).toBeVisible()
                await expect(h1).not.toBeEmpty()
                await expect(header.locator('h1')).toHaveCount(1)
                expect(await h1.getAttribute('id')).toBe(`${ family.kind }-title`)
            })

            test('le décor reste dans l\'en-tête : aucun pétale ni fond illustré dans le corps', async ({ page }) => {
                await openDetail(page, family.kind, family.route, mode)

                await expect(page.locator('[data-cy="enso-petals"], .enso-backdrop, [data-cy="enso-backdrop"]')).toHaveCount(0)

                const outside = await page.evaluate(() => {
                    const header = document.querySelector('[data-cy="enso-page-header"]')!
                    return [...document.querySelectorAll('article *')]
                        .filter(el => !header.contains(el))
                        .filter(el => /url\(/.test(getComputedStyle(el).backgroundImage) && !/gold-tick/.test(getComputedStyle(el).backgroundImage))
                        .map(el => `${ el.tagName }.${ String(el.className).slice(0, 40) }`)
                })
                // Les images de fond hors en-tête ne sont que les marques dorées d'eyebrow (via ::before) — jamais un élément réel.
                expect(outside).toEqual([])
            })

            test('un seul bord gauche : en-tête, fil d\'Ariane et corps', async ({ page }) => {
                await page.setViewportSize({ width: 1440, height: 900 })
                await openDetail(page, family.kind, family.route, mode)

                const lefts = await page.evaluate(() => {
                    const left = (sel: string) => document.querySelector(sel)!.getBoundingClientRect().left
                    // Le premier maillon est un bouton à padding : c'est le TEXTE qui doit tomber sur le bord gauche.
                    const textLeft = (sel: string) => {
                        const walker = document.createTreeWalker(document.querySelector(sel)!, NodeFilter.SHOW_TEXT)
                        let node = walker.nextNode()
                        while (node && !node.textContent?.trim()) node = walker.nextNode()
                        const range = document.createRange()
                        range.selectNodeContents(node!)
                        return range.getBoundingClientRect().left
                    }
                    const box = (sel: string) => {
                        const el = document.querySelector(sel)!
                        const cs = getComputedStyle(el)
                        return el.getBoundingClientRect().left + parseFloat(cs.paddingLeft)
                    }
                    return {
                        eyebrow: left('[data-cy="page-header-eyebrow"]'),
                        title: left('[data-cy="page-header-title"]'),
                        crumb: textLeft('.catalog-breadcrumb button, .catalog-breadcrumb a'),
                        body: box('article .home-container:not(.enso-page-header__inner)')
                    }
                })

                expect(Math.abs(lefts.eyebrow - lefts.title)).toBeLessThan(1.5)
                expect(Math.abs(lefts.crumb - lefts.title)).toBeLessThan(4)
                expect(Math.abs(lefts.body - lefts.title)).toBeLessThan(1.5)
            })

            for (const width of [1440, 390]) {
                test(`aucun débordement horizontal à ${ width } px`, async ({ page }) => {
                    await page.setViewportSize({ width, height: 900 })
                    await openDetail(page, family.kind, family.route, mode)

                    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
                    expect(overflow).toBeLessThanOrEqual(0)
                })
            }

            test('axe : 0 violation critical / serious sur l\'en-tête', async ({ page }) => {
                await openDetail(page, family.kind, family.route, mode)
                // Fondu d'apparition du décor (0,9 s) terminé : axe mesure des opacités.
                await page.waitForTimeout(1200)

                const results = await new AxeBuilder({ page })
                    .include('[data-cy="enso-page-header"]')
                    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
                    .analyze()
                const blocking = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious')

                expect(blocking.map(v => `${ v.id }: ${ v.nodes.map(n => n.target.join(' ')).join(' | ') }`)).toEqual([])
            })
        })
    }
}
