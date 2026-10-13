/**
 * Palette ⌘K du marketing — 8 familles + filtre de famille (#1032), et
 * disparition du rail de navigation.
 *
 * Ce que ce fichier épingle :
 *  - la palette trouve une interface, une util, une const et un enum (avant :
 *    seulement components / composables / directives / types) ;
 *  - le filtre de famille RESTREINT réellement les résultats, à la souris
 *    (puce) comme au clavier (Tab / Maj+Tab : la palette piège Tab, la
 *    navigation entre puces par tabulation est donc impossible) ;
 *  - le catalogue n'est PAS demandé avant la première ouverture (vérifié par
 *    interception réseau, la seule preuve qu'un appel n'a pas eu lieu) ;
 *  - aucune trace du rail retiré, et aucun défilement horizontal à 390 px.
 *
 * Attente d'hydratation : le premier ⌘K tombe dans le vide tant que Nuxt n'a
 * pas attaché ses écouteurs, d'où la boucle de ré-appui (cf.
 * marketing-primary-nav.spec.ts) plutôt qu'un `waitForTimeout`.
 *
 * Nécessite une base seedée : `requireMarketingDb()`.
 */
import AxeBuilder from '@axe-core/playwright'
import { expect as baseExpect, test, type Page } from '@playwright/test'

import { requireMarketingDb } from './_support/require-marketing-db'

requireMarketingDb()

// Les 8 familles se telechargent a la premiere ouverture (~1 Mo) : sur un runner
// de CI lent, les 5 s par defaut d'un `expect` ne suffisent pas (1 flaky mesure).
const expect = baseExpect.configure({ timeout: 15_000 })

const PALETTE = '[data-cy="global-command-palette"]'
const INPUT = `${PALETTE} input[role="combobox"]`
const OPTIONS = `${PALETTE} [role="option"]`

const PAGES_WITHOUT_RAIL = ['/', '/installation', '/components', '/components/btn']

async function openPalette (page: Page): Promise<void> {
    const input = page.locator(INPUT)

    await expect(async () => {
        await page.locator('body').click({ position: { x: 1, y: 1 } })
        await page.keyboard.press('Control+k')
        await expect(input).toBeVisible({ timeout: 800 })
    }).toPass({ timeout: 20_000 })
}

async function search (page: Page, text: string): Promise<void> {
    await page.locator(INPUT).fill(text)
}

test.describe('palette ⌘K — 8 familles', () => {
    test('trouve une interface, une util, une const et un enum', async ({ page }) => {
        await page.goto('/installation')
        await openPalette(page)

        const cases: Array<{ query: string, label: string }> = [
            { query: 'IAccentColorProps', label: 'IAccentColorProps' },
            { query: 'APCAcontrast', label: 'APCAcontrast' },
            { query: 'ACTIVE_TEXT_FIELD_TYPE', label: 'ACTIVE_TEXT_FIELD_TYPE' },
            { query: 'ADJACENT', label: 'ADJACENT' }
        ]

        for (const { query, label } of cases) {
            await search(page, query)
            await expect(page.locator(OPTIONS).filter({ hasText: label }).first()).toBeVisible()
        }
    })

    test('ouvre la fiche de la famille choisie', async ({ page }) => {
        await page.goto('/installation')
        await openPalette(page)
        await search(page, 'IAccentColorProps')
        await page.locator(OPTIONS).filter({ hasText: 'IAccentColorProps' }).first().click()
        await expect(page).toHaveURL(/\/interfaces\/i-accent-color-props$/)
    })

    test('ne demande aucune famille avant la première ouverture, puis les 8', async ({ page }) => {
        const requested = new Set<string>()

        page.on('request', (req) => {
            const m = new URL(req.url()).pathname.match(/^\/api\/reference\/(component|composable|directive|type|enum|interface|util|const)$/)

            if (m) requested.add(m[1]!)
        })

        await page.goto('/installation')
        await expect(page.locator('body')).toBeVisible()
        await page.waitForLoadState('load')
        expect([...requested], 'catalogue demandé avant ⌘K').toEqual([])

        await openPalette(page)
        await expect.poll(() => requested.size, { timeout: 15_000 }).toBe(8)
    })
})

test.describe('palette ⌘K — filtre de famille', () => {
    test('les 9 puces portent les noms COMPLETS des familles', async ({ page }) => {
        await page.goto('/installation')
        await openPalette(page)

        const chips = page.locator('[data-cy^="search-family-"]')

        await expect(chips).toHaveCount(9)
        await expect(chips).toHaveText([
            'All', 'Components', 'Composables', 'Directives', 'Interfaces', 'Types', 'Enums', 'Constants', 'Utils'
        ])
    })

    test('une puce restreint les résultats à sa famille', async ({ page }) => {
        await page.goto('/installation')
        await openPalette(page)
        await search(page, 'color')

        await expect(page.locator(OPTIONS).first()).toBeVisible()

        const all = await page.locator(OPTIONS).count()

        expect(all).toBeGreaterThan(0)

        await page.locator('[data-cy="search-family-interface"]').click()
        await expect(page.locator('[data-cy="search-family-interface"]')).toHaveAttribute('aria-pressed', 'true')
        await expect(page.locator(OPTIONS).first()).toBeVisible()

        const names = await page.locator(`${OPTIONS} .origam-command-palette__item-label`).allTextContents()

        expect(names.length).toBeGreaterThan(0)
        expect(names.every(n => /^I[A-Z]/.test(n)), `non-interfaces: ${names.filter(n => !/^I[A-Z]/.test(n)).join(',')}`).toBe(true)
    })

    test('Tab / Maj+Tab changent de famille au clavier, le focus reste sur le champ', async ({ page }) => {
        await page.goto('/installation')
        await openPalette(page)

        await page.keyboard.press('Tab')
        await expect(page.locator('[data-cy="search-family-component"]')).toHaveAttribute('aria-pressed', 'true')
        await expect(page.locator(INPUT)).toBeFocused()

        await page.keyboard.press('Tab')
        await expect(page.locator('[data-cy="search-family-composable"]')).toHaveAttribute('aria-pressed', 'true')

        await page.keyboard.press('Shift+Tab')
        await page.keyboard.press('Shift+Tab')
        await expect(page.locator('[data-cy="search-family-all"]')).toHaveAttribute('aria-pressed', 'true')

        await page.keyboard.press('Shift+Tab')
        await expect(page.locator('[data-cy="search-family-util"]')).toHaveAttribute('aria-pressed', 'true')
    })

    test('flèches + Entrée naviguent dans la famille filtrée', async ({ page }) => {
        await page.goto('/installation')
        await openPalette(page)
        await page.locator('[data-cy="search-family-util"]').click()
        await search(page, 'APCAcontrast')
        await expect(page.locator(OPTIONS).filter({ hasText: 'APCAcontrast' }).first()).toBeVisible()
        await page.keyboard.press('Enter')
        await expect(page).toHaveURL(/\/utils\/apc-acontrast$/)
    })

    test('le plafond borne le nombre de lignes rendues', async ({ page }) => {
        await page.goto('/installation')
        await openPalette(page)
        await page.locator('[data-cy="search-family-interface"]').click()
        await search(page, 'i')
        await expect(page.locator(OPTIONS).first()).toBeVisible()
        expect(await page.locator(OPTIONS).count()).toBeLessThanOrEqual(50)
    })

    test('axe : aucune violation palette ouverte', async ({ page }) => {
        await page.goto('/installation')
        await openPalette(page)
        await expect(page.locator('[data-cy="search-family-all"]')).toBeVisible()

        const results = await new AxeBuilder({ page }).include(PALETTE).analyze()

        expect(results.violations.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(' | ')}`)).toEqual([])
    })
})

test.describe('palette ⌘K — changement de locale', () => {
    async function switchToFrench (page: Page): Promise<void> {
        const option = page.locator('[data-cy="locale-option"]').filter({ hasText: /fran/i })

        await expect(async () => {
            await page.getByRole('button', { name: 'Change language' }).click()
            await expect(option).toBeVisible({ timeout: 1000 })
        }).toPass({ timeout: 20_000 })
        await option.click()
        await expect(page.locator('html')).toHaveAttribute('lang', /^fr/)
    }

    test('ouverte avant le changement : les 8 familles sont rechargées en fr et les libellés sont traduits', async ({ page }) => {
        const frRequests = new Set<string>()

        page.on('request', (req) => {
            const url = new URL(req.url())
            const m = url.pathname.match(/^\/api\/reference\/(\w+)$/)

            if (m && url.searchParams.get('locale') === 'fr') frRequests.add(m[1]!)
        })

        await page.goto('/installation')
        await openPalette(page)
        await expect(page.locator(OPTIONS).first()).toBeVisible()
        await page.keyboard.press('Escape')
        expect(frRequests.size).toBe(0)

        await switchToFrench(page)
        await expect.poll(() => frRequests.size, { timeout: 15_000 }).toBe(8)

        await openPalette(page)
        await expect(page.locator('[data-cy="search-family-composable"]')).toHaveText('Composables')
        await expect(page.locator('[data-cy="search-family-all"]')).toHaveText('Tout')
        await search(page, 'install')
        await expect(page.locator(OPTIONS).filter({ hasText: 'Démarrage' }).first()).toBeVisible()
    })

    test('jamais ouverte : le changement de locale ne télécharge aucune famille', async ({ page }) => {
        const requested: string[] = []

        page.on('request', (req) => {
            if (/^\/api\/reference\/(component|composable|directive|type|enum|interface|util|const)$/.test(new URL(req.url()).pathname)) {
                requested.push(req.url())
            }
        })

        await page.goto('/installation')
        await page.waitForLoadState('load')
        await switchToFrench(page)
        await page.waitForLoadState('load')
        expect(requested).toEqual([])
    })
})

test.describe('palette ⌘K — bouton loupe sous 600 px (390 px)', () => {
    const MOBILE = '[data-cy="search-trigger-mobile"]'

    test.use({ viewport: { width: 390, height: 800 } })

    async function openFromButton (page: Page): Promise<void> {
        await expect(async () => {
            await page.locator(MOBILE).click()
            await expect(page.locator(INPUT)).toBeVisible({ timeout: 800 })
        }).toPass({ timeout: 20_000 })
    }

    test('le bouton est visible, >= 44 px, sans recouvrir la marque ni déborder', async ({ page }) => {
        await page.goto('/installation')
        await page.waitForLoadState('load')

        const button = page.locator(MOBILE)

        await expect(button).toBeVisible()
        await expect(button).toHaveAttribute('aria-label', /.+/)

        // Le serveur de dev injecte le SCSS des SFC apres `load` (mesure : ~2 s) :
        // avant cela le bouton fait 28 px et la page 394. On attend l'etat regle.
        await expect.poll(async () => (await button.boundingBox())?.width ?? 0, { timeout: 15_000 }).toBeGreaterThanOrEqual(44)

        const box = (await button.boundingBox())!
        const brand = (await page.locator('[data-cy="brand-home"]').boundingBox())!

        expect(box.width).toBeGreaterThanOrEqual(44)
        expect(box.height).toBeGreaterThanOrEqual(44)
        expect(box.x).toBeGreaterThanOrEqual(brand.x + brand.width)
        expect(box.x + box.width).toBeLessThanOrEqual(390)

        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), { timeout: 15_000 }).toBeLessThanOrEqual(1)
    })

    test('aucune cible de l\'app bar n\'est cachée tout en restant dans la tabulation', async ({ page }) => {
        await page.goto('/installation')
        await page.waitForLoadState('load')

        const clipped = await page.evaluate(() => {
            const bar = document.querySelector('header')!.getBoundingClientRect()

            return [...document.querySelectorAll('header a, header button')]
                .filter(e => getComputedStyle(e).display !== 'none')
                .filter((e) => {
                    const r = e.getBoundingClientRect()

                    return r.bottom > bar.bottom || r.right > bar.right || r.left < 0
                })
                .map(e => e.getAttribute('data-cy') ?? e.tagName)
        })

        expect(clipped).toEqual([])
    })

    test('ouvre la palette, le focus revient au bouton à la fermeture, on atteint une fiche', async ({ page }) => {
        await page.goto('/installation')
        await openFromButton(page)
        await page.keyboard.press('Escape')
        await expect(page.locator(INPUT)).toBeHidden()
        await expect(page.locator(MOBILE)).toBeFocused()

        await openFromButton(page)
        await search(page, 'IAccentColorProps')
        await page.locator(OPTIONS).filter({ hasText: 'IAccentColorProps' }).first().click()
        await expect(page).toHaveURL(/\/interfaces\/i-accent-color-props$/)
    })

    test('axe : aucune violation sur l\'app bar puis sur la palette ouverte', async ({ page }) => {
        await page.goto('/installation')
        await page.waitForLoadState('load')

        const bar = await new AxeBuilder({ page }).include('header').analyze()

        expect(bar.violations.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(' | ')}`)).toEqual([])

        await openFromButton(page)
        await expect(page.locator('[data-cy="search-family-all"]')).toBeVisible()

        const dialog = await new AxeBuilder({ page }).include(PALETTE).analyze()

        expect(dialog.violations.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(' | ')}`)).toEqual([])
    })

    test('au-dessus de 600 px le bouton loupe est masqué (un seul déclencheur visible)', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 })
        await page.goto('/installation')
        await page.waitForLoadState('load')
        await expect(page.locator(MOBILE)).toBeHidden()
        await expect(page.locator('[data-cy="search-trigger"]')).toBeVisible()
    })
})

test.describe('rail de navigation retiré', () => {
    for (const path of PAGES_WITHOUT_RAIL) {
        test(`aucune trace du rail sur ${path}`, async ({ page }) => {
            await page.goto(path)
            await page.waitForLoadState('load')

            const traces = await page.evaluate(() => document.querySelectorAll(
                '[class*="nav-rail"], [data-cy^="rail-"], [data-cy*="nav-rail"]'
            ).length)

            expect(traces).toBe(0)

            const reserved = await page.evaluate(() => {
                const main = document.querySelector('main')

                return main ? getComputedStyle(main).paddingInlineEnd : null
            })

            expect(reserved, 'gouttière du rail encore réservée').not.toBe('88px')
        })
    }

    for (const path of PAGES_WITHOUT_RAIL) {
        test(`pas de défilement horizontal à 390 px sur ${path}`, async ({ page }) => {
            await page.setViewportSize({ width: 390, height: 800 })
            await page.goto(path)
            await page.waitForLoadState('load')

            await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), { timeout: 15_000 }).toBeLessThanOrEqual(1)
        })
    }
})
