/**
 * marketing-theming-enso-header.spec.ts — /theming dans l'identité enso (#1589, parent #1518)
 *
 * Contrat :
 *  - l'en-tête commun est celui de la famille `tool`, avec le seul h1 de la page ;
 *  - /theming est un outil : aucun décor enso (pétales, fonds illustrés, séparateurs) dans le corps,
 *    ni dans l'aperçu ni dans les contrôles ;
 *  - le libellé de la toile claire de l'aperçu reste lisible (>= 4,5:1) dans les DEUX modes de la page
 *    (#1535 : blanc sur blanc en page sombre) ;
 *  - aucun débordement horizontal à 390 px (la barre d'outils passe à la ligne).
 */

import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const MODES = ['light', 'dark'] as const

async function openPage (page: Page, mode: 'light' | 'dark'): Promise<void> {
    const baseURL = test.info().project.use.baseURL!
    await page.context().addCookies([
        { name: 'origam-theme', value: 'origam', url: baseURL },
        { name: 'origam-mode', value: mode, url: baseURL }
    ])
    await page.goto('/theming', { waitUntil: 'load' })
    await page.locator('[data-cy="theming-nav-item-btn"]').waitFor({ state: 'visible', timeout: 30_000 })
    await page.locator('[data-cy="theming-preview"]').waitFor({ state: 'visible', timeout: 30_000 })
}

/** Luminance relative WCAG d'une couleur `rgb()` / `rgba()` / `color(srgb …)` lue par getComputedStyle. */
function contrastOf (page: Page, fg: string, bg: string): Promise<number> {
    return page.evaluate(([a, b]) => {
        const toRgb = (css: string): number[] => {
            const c = document.createElement('canvas').getContext('2d')!
            c.fillStyle = '#000'
            c.fillStyle = css
            c.fillRect(0, 0, 1, 1)
            return Array.from(c.getImageData(0, 0, 1, 1).data).slice(0, 3)
        }
        const lum = ([r, g, bl]: number[]): number => {
            const f = (v: number): number => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }
            return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl)
        }
        const [l1, l2] = [lum(toRgb(a)), lum(toRgb(b))]
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
    }, [fg, bg])
}

test.describe('/theming · identité enso (#1589)', () => {
    for (const mode of MODES) {
        test(`${ mode } — en-tête famille tool, un seul h1, aucun décor dans le corps`, async ({ page }) => {
            await openPage(page, mode)

            const header = page.locator('[data-cy="enso-page-header"]')
            await expect(header).toHaveAttribute('data-family', 'tool')
            await expect(page.locator('h1')).toHaveCount(1)
            await expect(page.locator('h1')).toHaveAttribute('id', 'theming-title')
            await expect(page.locator('[data-cy="page-header-title"]')).toHaveText('Theme Builder')

            // Tout décor appartient à l'en-tête : le corps de l'outil n'en porte aucun.
            const decorInBody = await page.evaluate(() => {
                const roots = [document.querySelector('.theming__body'), document.querySelector('[data-cy="theming-output"]'), document.querySelector('[data-cy="theming-topbar"]')]
                return roots.flatMap(r => Array.from(r?.querySelectorAll('[class*="enso"], [data-cy*="petal"], [data-cy^="enso"], [style*="enso"], img[src*="enso"]') ?? [])).length
            })
            expect(decorInBody).toBe(0)
        })

        test(`${ mode } — le libellé de la toile claire de l'aperçu est lisible (#1535)`, async ({ page }) => {
            await openPage(page, mode)

            const label = page.locator('.tb-preview__pane:not(.tb-preview__pane--dark) .tb-preview__pane-label').first()
            await expect(label).toBeVisible()
            const { fg, bg } = await label.evaluate((el) => ({
                fg: getComputedStyle(el).color,
                bg: getComputedStyle(el.parentElement!).backgroundColor
            }))
            expect(await contrastOf(page, fg, bg)).toBeGreaterThanOrEqual(4.5)
        })
    }

    test('390 px — aucun débordement horizontal, toutes les actions de la barre d\'outils atteignables', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 900 })
        await openPage(page, 'light')

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        expect(overflow).toBeLessThanOrEqual(0)

        for (const cy of ['theming-reset', 'theming-import-toggle', 'theming-export-json', 'theming-export-ts']) {
            const box = await page.locator(`[data-cy="${ cy }"]`).boundingBox()
            expect(box, cy).not.toBeNull()
            expect(box!.x + box!.width, cy).toBeLessThanOrEqual(390)
        }
    })
})
