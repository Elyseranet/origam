/**
 * HomeProof — section « preuves » sous le hero (#1545).
 *
 * Contrat : six chiffres, chacun avec son libellé et sa définition écrite ;
 * chaque valeur est celle que le script de build mesure dans le dépôt
 * (`generate-build-stats.mjs`), jamais un littéral ; aucun compteur
 * d'adoption (étoiles, téléchargements) ni « WCAG ».
 *
 * Le serveur régénère BUILD_STATS à son démarrage : un fichier de spec ajouté
 * après ce démarrage décale le compte e2e, d'où la régénération (ou le
 * redémarrage) avant de lancer ce spec en local.
 *
 * Run :
 *   pnpm -F @origam/tests exec playwright test \
 *     --config=playwright.marketing.config.ts home-proof
 */

import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// @ts-expect-error script .mjs sans déclaration de types
import { measure } from '../../marketing/scripts/generate-build-stats.mjs'

const STATS = measure()

const EXPECTED: Array<[string, string]> = [
    ['families', String(STATS.componentFamilies)],
    ['charts', String(STATS.chartTypes)],
    ['a11y', String(STATS.a11ySweptStories)],
    ['unit', String(STATS.unitTestFiles)],
    ['e2e', String(STATS.e2eTestFiles)],
    ['license', STATS.license]
]

test.describe('HomeProof — section « preuves »', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('load')
    })

    test('la section suit le hero et est labellée par son <h2>', async ({ page }) => {
        const section = page.locator('section.home-proof')
        await expect(section).toHaveAttribute('aria-labelledby', 'proof-title')
        await expect(page.locator('h2#proof-title')).toHaveText('What the repository lets you verify')
        const order = await page.evaluate(() => {
            const hero = document.querySelector('#hero')
            const proof = document.querySelector('section.home-proof')
            return hero && proof ? hero.compareDocumentPosition(proof) & Node.DOCUMENT_POSITION_FOLLOWING : 0
        })
        expect(order).toBeTruthy()
    })

    test('chaque chiffre vaut la mesure du dépôt et porte libellé + définition', async ({ page }) => {
        await expect(page.locator('section.home-proof li')).toHaveCount(EXPECTED.length)
        for (const [key, value] of EXPECTED) {
            const item = page.locator(`[data-cy="proof-${ key }"]`)
            await expect(item.locator('[data-cy="proof-value"]')).toHaveText(value)
            await expect(item.locator('.home-proof__label')).not.toBeEmpty()
            await expect(item.locator('.home-proof__definition')).not.toBeEmpty()
        }
    })

    test('aucun compteur d\'adoption ni promesse WCAG', async ({ page }) => {
        await expect(page.locator('section.home-proof')).not.toContainText(/stars|downloads|WCAG/i)
    })

    test('la version FR traduit libellés et définitions', async ({ page }) => {
        await page.goto('/fr')
        await expect(page.locator('h2#proof-title')).toHaveText('Ce que le dépôt permet de vérifier')
        await expect(page.locator('[data-cy="proof-unit"] .home-proof__definition')).toContainText('pas un nombre de tests')
    })

    test('audit axe-core de la section : 0 violation serious/critical', async ({ page }) => {
        const results = await new AxeBuilder({ page }).include('section.home-proof').analyze()
        const blocking = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')
        expect(blocking, JSON.stringify(blocking.map(v => v.id))).toHaveLength(0)
    })
})
