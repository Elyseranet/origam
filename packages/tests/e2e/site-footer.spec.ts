/**
 * site-footer.spec.ts — pied de page sur deux niveaux (#1596, maquette v12)
 *
 * Contrat :
 *  - niveau 1 (violet profond, `brand-deep---end`) : une ligne logo | liens | réseaux ;
 *  - niveau 2 (encre) : mentions légales, confidentialité, contact, puis la ligne de copyright ;
 *  - plus de plan du site, plus de crête : la scène du CTA fait la jonction, SANS couture
 *    (mesurée en pixels, clair et sombre) ;
 *  - identique dans les deux modes, hors l'encre du niveau 2 ;
 *  - les liens internes sont localisés, le site de documentation (statique) reste un lien brut ;
 *  - AA sur chaque texte, cibles de 44 px (réseaux) et 32 px (légal), axe propre sur CTA + pied de page.
 */

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const DEEP_END = 'rgb(42, 16, 99)'
const INK = { light: 'rgb(27, 17, 39)', dark: 'rgb(14, 9, 21)' } as const
const AA = 4.5

async function openHome (page: Page, mode: 'light' | 'dark', path = '/'): Promise<void> {
    const baseURL = test.info().project.use.baseURL!
    await page.context().addCookies([
        { name: 'origam-theme', value: 'origam', url: baseURL },
        { name: 'origam-mode', value: mode, url: baseURL }
    ])
    await page.goto(path, { waitUntil: 'load' })
    await page.locator('.site-footer__bar').waitFor({ state: 'attached' })
    await page.locator('footer.site-footer').scrollIntoViewIfNeeded()
}

/** Contraste WCAG entre deux couleurs CSS calculées (rgb() ou color(srgb …)). */
function contrast (page: Page, fg: string, bg: string): Promise<number> {
    return page.evaluate(([f, b]) => {
        const parse = (c: string): number[] => {
            const nums = (c.match(/-?[\d.]+/g) ?? []).map(Number)
            return c.startsWith('color(srgb') ? nums.slice(0, 3).map(v => v * 255) : nums.slice(0, 3)
        }
        const lum = ([r, g, bl]: number[]) => {
            const ch = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }
            return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(bl)
        }
        const [hi, lo] = [lum(parse(f)), lum(parse(b))].sort((x, y) => y - x)
        return (hi + 0.05) / (lo + 0.05)
    }, [fg, bg])
}

test.describe('SiteFooter — deux niveaux', () => {

    test('un seul <footer>, sans plan du site ni panorama', async ({ page }) => {
        await openHome(page, 'light')
        await expect(page.locator('footer.site-footer')).toHaveCount(1)
        await expect(page.locator('[data-cy="footer-sitemap"], [data-cy="footer-art"], .site-footer__sitemap')).toHaveCount(0)
    })

    test('niveau 1 : le logo mène à l\'accueil, quatre liens, deux réseaux au moins', async ({ page }) => {
        await openHome(page, 'light')

        await expect(page.locator('[data-cy="footer-brand"]')).toHaveAttribute('href', '/')

        const nav = page.locator('[data-cy="footer-nav"]')
        await expect(nav).toHaveAttribute('aria-label', 'Footer')
        const hrefs = await nav.locator('a').evaluateAll(els => els.map(el => el.getAttribute('href')))
        expect(hrefs).toEqual(['/components', '/docs/', '/theming', '/#playground'])

        const github = page.locator('[data-cy="footer-social-github"]')
        await expect(github).toHaveAttribute('href', /github\.com/)
        await expect(github).toHaveAttribute('target', '_blank')
        await expect(github).toHaveAttribute('rel', /noopener/)
        const x = page.locator('[data-cy="footer-social-x"]')
        await expect(x).toHaveAttribute('aria-label', 'X')
        await expect(x).toHaveAttribute('target', '_blank')
    })

    test('niveau 2 : trois pages légales et la ligne de copyright', async ({ page }) => {
        await openHome(page, 'light')

        const legal = page.locator('[data-cy="footer-legal"]')
        await expect(legal).toHaveAttribute('aria-label', 'Legal information')
        const hrefs = await legal.locator('a').evaluateAll(els => els.map(el => el.getAttribute('href')))
        expect(hrefs).toEqual(['/legal', '/privacy', '/contact'])

        await expect(page.locator('[data-cy="footer-copyright"]')).toHaveText('© 2026 origam · MIT license · Made with origam, by humans.')
        await expect(page.locator('footer.site-footer')).not.toContainText(/LEGAL_|home\.cta\.|footer\./)
    })

    test('FR : liens localisés, copyright traduit, site de documentation brut', async ({ page }) => {
        await openHome(page, 'light', '/fr')

        const hrefs = await page.locator('footer.site-footer a').evaluateAll(els => els.map(el => el.getAttribute('href')))
        expect(hrefs).toEqual(expect.arrayContaining(['/fr', '/fr/components', '/docs/', '/fr/theming', '/fr#playground', '/fr/legal', '/fr/privacy', '/fr/contact']))
        await expect(page.locator('[data-cy="footer-copyright"]')).toHaveText('© 2026 origam · licence MIT · Fait avec origam, par des humains.')
    })

    test('les liens se parcourent au clavier dans l\'ordre visuel', async ({ page }) => {
        await openHome(page, 'light')
        await page.locator('[data-cy="footer-brand"]').focus()

        const order: string[] = []
        for (let i = 0; i < 12 && order.at(-1) !== '/contact'; i++) {
            order.push(await page.evaluate(() => (document.activeElement as HTMLElement).getAttribute('href') ?? ''))
            await page.keyboard.press('Tab')
        }
        expect(order.slice(0, 5)).toEqual(['/', '/components', '/docs/', '/theming', '/#playground'])
        expect(order[5]).toMatch(/github\.com/)
        expect(order.slice(-3)).toEqual(['/legal', '/privacy', '/contact'])
    })

    for (const mode of ['light', 'dark'] as const) {
        test.describe(mode, () => {

            test('couleurs : niveau 1 violet profond, niveau 2 encre', async ({ page }) => {
                await openHome(page, mode)
                const bg = (sel: string) => page.locator(sel).evaluate(el => getComputedStyle(el).backgroundColor)
                expect(await bg('.site-footer__main')).toBe(DEEP_END)
                expect(await bg('.site-footer__legal')).toBe(INK[mode])
            })

            test('AA sur chaque texte du pied de page', async ({ page }) => {
                await openHome(page, mode)
                const probes: Array<[string, string]> = [
                    ['.site-footer__brand', '.site-footer__main'],
                    ['.site-footer__nav a', '.site-footer__main'],
                    ['.site-footer__social a', '.site-footer__main'],
                    ['.site-footer__legal nav a', '.site-footer__legal'],
                    ['.site-footer__copyright', '.site-footer__legal']
                ]
                for (const [textSel, bgSel] of probes) {
                    const fg = await page.locator(textSel).first().evaluate(el => getComputedStyle(el).color)
                    const bg = await page.locator(bgSel).evaluate(el => getComputedStyle(el).backgroundColor)
                    const ratio = await contrast(page, fg, bg)
                    expect(ratio, `${ textSel } (${ mode }) : ${ ratio.toFixed(2) }:1`).toBeGreaterThanOrEqual(AA)
                }
            })

            test('cibles : 44 px de haut pour les réseaux, 32 px pour les liens légaux', async ({ page }) => {
                await openHome(page, mode)
                for (const [sel, min] of [['.site-footer__social a', 44], ['.site-footer__legal nav a', 32]] as const) {
                    const heights = await page.locator(sel).evaluateAll(els => els.map(el => el.getBoundingClientRect().height))
                    for (const h of heights) expect(h, `${ sel } (${ mode })`).toBeGreaterThanOrEqual(min)
                }
            })

            test('aucune couture entre la scène du CTA et le niveau 1', async ({ page }) => {
                await openHome(page, mode)
                await page.emulateMedia({ reducedMotion: 'reduce' })
                await page.locator('footer.site-footer').scrollIntoViewIfNeeded()

                const y = await page.locator('footer.site-footer').evaluate(el => Math.round(el.getBoundingClientRect().top))
                const width = page.viewportSize()!.width
                // Quatre lignes de part et d'autre de la jonction : la rampe doit être continue.
                const png = await page.screenshot({ clip: { x: 0, y: y - 4, width, height: 8 }, animations: 'disabled' })
                const diffs = await page.evaluate(async ([b64, w]) => {
                    const img = new Image()
                    img.src = `data:image/png;base64,${ b64 }`
                    await img.decode()
                    const cv = new OffscreenCanvas(img.width, img.height)
                    const ctx = cv.getContext('2d')!
                    ctx.drawImage(img, 0, 0)
                    const px = (x: number, row: number) => ctx.getImageData(x, row, 1, 1).data
                    let worst = 0
                    for (let x = 4; x < (w as number); x += Math.max(1, Math.floor((w as number) / 24))) {
                        const above = px(x, 3), below = px(x, 4)
                        worst = Math.max(worst, Math.abs(above[0] - below[0]), Math.abs(above[1] - below[1]), Math.abs(above[2] - below[2]))
                    }
                    return worst
                }, [png.toString('base64'), width] as const)
                expect(diffs, `saut de couleur à la jonction CTA / niveau 1 (${ mode })`).toBeLessThanOrEqual(3)
            })

            test('axe : aucune violation sur le CTA ni sur le pied de page', async ({ page }) => {
                await openHome(page, mode)
                await page.locator('[data-cy="cta-plane-foreground"]').waitFor({ state: 'attached', timeout: 30_000 })
                const results = await new AxeBuilder({ page })
                    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
                    .include('section.home-cta')
                    .include('footer.site-footer')
                    .analyze()
                expect(results.violations.map(v => `${ v.id }: ${ v.nodes.map(n => n.target.join(' ')).join(' | ') }`)).toEqual([])
            })
        })
    }

    test('390 px : une colonne centrée, aucun débordement horizontal', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 900 })
        await openHome(page, 'light')

        const cols = await page.locator('.site-footer__bar').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)
        expect(cols).toBe(1)
        const overflow = await page.evaluate(() => (document.scrollingElement as Element).scrollWidth - document.documentElement.clientWidth)
        expect(overflow).toBeLessThanOrEqual(0)
    })

    test('HTML serveur : le pied de page est rendu sans JavaScript', async ({ request }) => {
        const html = await (await request.get('/')).text()
        for (const cy of ['footer-brand', 'footer-nav', 'footer-social', 'footer-legal', 'footer-copyright']) {
            expect(html, cy).toContain(`data-cy="${ cy }"`)
        }
    })
})
