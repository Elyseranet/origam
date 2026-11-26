/**
 * Les sous-arbres rendent leur thème, et le site reste `origam` (#275, #1515)
 *
 * ## Contrat (#1515, décision propriétaire 2026-11-26)
 *
 * Le site n'a plus de sélecteur de thème de marque : `<html data-theme>` reste
 * `origam`. Les 8 marques restent enregistrées pour les SOUS-ARBRES
 * (`<OrigamThemeProvider theme="…">`) : la démo de `/why-origam` et les tuiles
 * de la home.
 *
 * ## Ce que ce fichier garde de #275
 *
 * #275 : les PROPS de composant résolues par `theme.components` (`rounded`,
 * `elevation`, `border`, …) doivent suivre un changement de marque en direct,
 * pas seulement les cssVars. Le déclencheur n'est plus le menu de l'appbar mais
 * le radiogroup d'identités de la démo `/why-origam` : on mesure un style piloté
 * par les props (rayon, ombre) sur un bouton du stage, sans recharger.
 *
 * ⛔ Le bouton est dans le stage (sous-arbre) ; `<html>` ne change JAMAIS — c'est
 * l'autre moitié de l'assertion : un changement de marque dans un sous-arbre ne
 * doit pas repeindre le site.
 *
 * Run :
 *   MARKETING_BASE_URL=http://localhost:3011 pnpm -F @origam/tests exec \
 *     playwright test --config=playwright.marketing.config.ts marketing-theme-live-switch
 */

import { expect, test, type Page } from '@playwright/test'

const STAGE_BUTTON = '[data-cy="why-demo-stage"] [data-cy="why-demo-card-secondary"]'

/**
 * Re-clique tant que le stage ne porte pas l'identité demandée : avant
 * l'hydratation le clic réussit pour Playwright mais n'attache rien (mesuré :
 * 2 échecs sur 3 avec un clic unique). Re-cliquer sur l'identité déjà active est
 * sans effet. Aucun rechargement.
 */
async function pickIdentity (page: Page, key: string): Promise<void> {
    await expect.poll(async () => {
        if (await stageTheme(page) !== key) {
            await page.locator(`[data-cy="why-demo-identity-${key}"]`).click()
            await page.waitForTimeout(250)
        }
        return stageTheme(page)
    }, { timeout: 20_000, message: `le stage n'a jamais pris l'identité ${ key }` }).toBe(key)
    // Laisse la chaîne réactive (thème -> defaults -> rendu) se poser.
    await page.waitForTimeout(500)
}

const stageTheme = (page: Page) => page.evaluate(() => document.querySelector('[data-cy="why-demo-stage"]')?.getAttribute('data-theme') ?? null)

async function stageButtonStyle (page: Page): Promise<{ radius: string, shadow: string }> {
    return page.evaluate((sel) => {
        const btn = document.querySelector(sel)
        const cs = btn ? getComputedStyle(btn) : null
        return { radius: cs?.borderTopLeftRadius ?? '', shadow: cs?.boxShadow ?? '' }
    }, STAGE_BUTTON)
}

const siteTheme = (page: Page) => page.evaluate(() => document.documentElement.getAttribute('data-theme'))

test.describe('Sous-arbres — les props suivent la marque du sous-arbre, le site reste origam', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/why-origam')
        await page.waitForSelector('[data-cy="why-demo-stage"]')
    })

    test('changer l\'identité du stage change un style piloté par les props, sans toucher <html>', async ({ page }) => {
        const before = await stageButtonStyle(page)
        expect(before.radius).not.toBe('')

        await pickIdentity(page, 'cartoon')
        const cartoon = await stageButtonStyle(page)

        expect(await siteTheme(page), '<html data-theme> ne doit pas suivre l\'identité du stage').toBe('origam')
        expect(
            cartoon,
            'rayon / ombre (props `rounded` / `elevation` résolues par theme.components) doivent changer avec l\'identité du sous-arbre'
        ).not.toEqual(before)
        // Ombre signature de cartoon : décalage dur 3px 3px — valeur piloté par les props, distincte par marque.
        expect(cartoon.shadow).toContain('3px 3px 0px 0px')

        await pickIdentity(page, 'geek')
        expect(await stageButtonStyle(page), 'une 2e bascule ne doit pas rester collée sur cartoon').not.toEqual(cartoon)
        expect(await siteTheme(page)).toBe('origam')
    })

    test('revenir à origam restitue le style d\'origine', async ({ page }) => {
        await pickIdentity(page, 'origam')
        const original = await stageButtonStyle(page)

        await pickIdentity(page, 'cartoon')
        await pickIdentity(page, 'geek')
        await pickIdentity(page, 'origam')

        expect(await stageButtonStyle(page)).toEqual(original)
        expect(await siteTheme(page)).toBe('origam')
    })

    test('les 8 marques restent enregistrées : chacune est proposée et rend son propre data-theme', async ({ page }) => {
        const brands = ['origam', 'apple', 'cartoon', 'ecom', 'editorial', 'geek', 'glass', 'material']

        for (const key of brands) {
            await pickIdentity(page, key)
            expect(await stageTheme(page), `le stage doit porter data-theme="${ key }"`).toBe(key)
            expect(await siteTheme(page)).toBe('origam')
        }
    })
})
