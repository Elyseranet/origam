/**
 * Nav link availability — masquage des liens 404 (#43)
 *
 * Vérifie que le layout masque les liens same-origin dont la page n'existe pas
 * (stories, docs, playground, blog) et affiche les liens vers des pages réelles.
 *
 * Stratégie :
 * - Attendre `[data-nav-ready="true"]` avant tout assert (probe fini côté client).
 * - Ouvrir chaque section de menu, assert les items présents/absents, fermer.
 * - Pour les liens footer, ils sont dans le DOM directement (pas de menu).
 *
 * Run:
 *   pnpm -F @origam/tests playwright test \
 *     --config=playwright.marketing.config.ts nav-link-availability
 */

import { expect, test, type Page } from '@playwright/test'

const DEAD_HREFS = ['/stories', '/docs', '/playground', '/blog']

async function waitForNavReady (page: Page): Promise<void> {
    await page.locator('[data-nav-ready="true"]').waitFor({ state: 'attached', timeout: 15_000 })
}

async function collectAllNavHrefs (page: Page): Promise<Set<string>> {
    const found = new Set<string>()

    const navBtns = page.locator('.primary-nav .origam-btn')
    const count = await navBtns.count()

    for (let i = 0; i < count; i++) {
        const btn = navBtns.nth(i)
        await btn.click()
        await page.waitForTimeout(300)

        const menuLinks = page.locator('.origam-menu__content a[href]')
        const linkCount = await menuLinks.count()
        for (let j = 0; j < linkCount; j++) {
            const href = await menuLinks.nth(j).getAttribute('href')
            if (href) found.add(href)
        }

        await page.keyboard.press('Escape')
        await page.waitForTimeout(150)
    }

    const footerLinks = page.locator('.site-footer a[href]')
    const footerCount = await footerLinks.count()
    for (let i = 0; i < footerCount; i++) {
        const href = await footerLinks.nth(i).getAttribute('href')
        if (href) found.add(href)
    }

    return found
}

test.describe('Nav link availability — masquage des liens 404', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/')
        await waitForNavReady(page)
    })

    test('les liens morts ne sont dans aucun menu ni footer', async ({ page }) => {
        const allHrefs = await collectAllNavHrefs(page)
        for (const href of DEAD_HREFS) {
            expect(
                allHrefs.has(href),
                `Le lien "${href}" est mort (404) mais apparaît dans la nav`
            ).toBe(false)
        }
    })

    test('/components est visible dans les menus', async ({ page }) => {
        const allHrefs = await collectAllNavHrefs(page)
        expect(allHrefs.has('/components'), '"/components" devrait être visible').toBe(true)
    })

    test('les pages réelles apparaissent dans les menus ou le footer', async ({ page }) => {
        const LIVE_HREFS = [
            '/components',
            '/installation',
            '/changelog',
            '/roadmap',
            '/why-origam'
        ]
        const allHrefs = await collectAllNavHrefs(page)
        for (const href of LIVE_HREFS) {
            expect(
                allHrefs.has(href),
                `Le lien "${href}" existe mais est absent de la nav/footer`
            ).toBe(true)
        }
    })

    test('liens externes (GitHub) sont toujours visibles dans le footer', async ({ page }) => {
        const githubLinks = page.locator('.site-footer a[href*="github.com"]')
        const count = await githubLinks.count()
        expect(count, 'Au moins un lien GitHub doit être présent dans le footer').toBeGreaterThan(0)
    })

    test('les liens morts ne sont pas présents directement dans le DOM (hors menus)', async ({ page }) => {
        for (const href of DEAD_HREFS) {
            const links = page.locator(`a[href="${href}"]`)
            await expect(links).toHaveCount(0)
        }
    })

    test('pas d\'erreur d\'hydratation dans la console', async ({ page }) => {
        const hydrationErrors: string[] = []
        page.on('console', msg => {
            const text = msg.text()
            if (
                msg.type() === 'error' &&
                (text.includes('hydration') || text.includes('Hydration') || text.includes('mismatch'))
            ) {
                hydrationErrors.push(text)
            }
        })

        await page.reload()
        await waitForNavReady(page)

        expect(
            hydrationErrors,
            `Erreurs d'hydratation détectées :\n${hydrationErrors.join('\n')}`
        ).toHaveLength(0)
    })

    test('pas d\'erreur console bloquante (hors hydratation)', async ({ page }) => {
        const consoleErrors: string[] = []
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text())
            }
        })

        await page.reload()
        await waitForNavReady(page)

        const blocking = consoleErrors.filter(e =>
            !e.includes('favicon') &&
            !e.includes('net::ERR')
        )

        expect(
            blocking,
            `Erreurs console bloquantes :\n${blocking.join('\n')}`
        ).toHaveLength(0)
    })

})
