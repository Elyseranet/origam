/**
 * home-themes-builder-link.spec.ts — #1517
 *
 * Chaque tuile de la vitrine ouvre le Theme Builder avec son theme precharge
 * (`/theming?preset=<cle>[&mode=dark]`). Le parametre est une entree non fiable :
 * seule une cle de preset enregistree est acceptee, toute autre valeur est
 * ignoree et le builder reste intact.
 */

import { expect, test } from '@playwright/test'

const PRESET = '[data-cy="theming-preset"]'

test.describe('Vitrine des themes — lien vers le Theme Builder', () => {

    test('chaque tuile porte un lien /theming?preset=… vers son theme', async ({ page }) => {
        await page.goto('/', { waitUntil: 'load' })
        const expected: Record<string, string> = {
            light: '/theming?preset=origam&mode=light',
            dark: '/theming?preset=origam&mode=dark',
            cartoon: '/theming?preset=cartoon',
            apple: '/theming?preset=apple'
        }
        for (const [key, href] of Object.entries(expected)) {
            await expect(
                page.locator(`[data-cy="themes-preview-${ key }"] [data-cy="themes-tile-button"]`)
            ).toHaveAttribute('href', href)
        }
    })

    test('cliquer la tuile Cartoon precharge le preset Cartoon dans le builder', async ({ page }) => {
        await page.goto('/', { waitUntil: 'load' })
        await page.locator('[data-cy="themes-preview-cartoon"] [data-cy="themes-tile-button"]').click()
        await expect(page).toHaveURL(/\/theming\?preset=cartoon/)
        await expect(page.locator(PRESET)).toContainText('Cartoon')
    })

    test('?preset=<cle connue> precharge le preset', async ({ page }) => {
        await page.goto('/theming?preset=apple', { waitUntil: 'load' })
        await expect(page.locator(PRESET)).toContainText('Apple')
    })

    for (const query of ['preset=__proto__', 'preset=nope', 'preset=%3Cscript%3E', 'preset=', 'preset=cartoon&preset=apple']) {
        test(`valeur inconnue ignoree : /theming?${ query }`, async ({ page }) => {
            const errors: string[] = []
            page.on('pageerror', e => errors.push(e.message))
            await page.goto(`/theming?${ query }`, { waitUntil: 'load' })
            await expect(page.locator(PRESET)).toBeVisible()
            await expect(page.locator(PRESET)).not.toContainText(/Cartoon|Apple|Geek|Glass|Editorial|Material|E-commerce|origam/i)
            expect(errors).toEqual([])
        })
    }
})
