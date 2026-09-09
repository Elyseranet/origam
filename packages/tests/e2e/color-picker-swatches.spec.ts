import { expect, test } from '@playwright/test'

/**
 * OrigamColorPickerSwatches — le clic et la coche, en vrai navigateur.
 *
 * POURQUOI CE FICHIER EXISTE (#401)
 * ----------------------------------
 * La coche de sélection ne s'est JAMAIS affichée : le template comparait
 * `colorHsv` à la FONCTION `hsva` au lieu de `hsva(color)`. Le défaut a
 * vécu jusqu'en production parce qu'AUCUN test — ni unitaire ni e2e — ne
 * cliquait sur une nuance ni ne regardait la coche. `color-picker.spec.ts`
 * se contente d'asserter que le picker « se rend ».
 *
 * Ces tests cliquent et mesurent le changement d'état. Ils échouent sur le
 * code d'avant #401, et sur toute régression du même genre.
 *
 * Pattern canonique — navigation directe par variantId (cf. btn.spec.ts).
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants (0-based) :
 *   0 → Design
 *   1 → Functional
 *   2 → Events - update:colorHsv
 *   3 → Default (playground)
 */

const STORY_ID = 'components-stories-colorpicker-origamcolorpickerswatches-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

const SWATCH = '.origam-color-picker-swatches__color'
const TICK = `${SWATCH} .origam-icon`

test.describe('OrigamColorPickerSwatches', () => {
    test.setTimeout(45000)

    test('la coche marque la nuance active au chargement', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator(SWATCH).first()).toBeVisible({ timeout: 12000 })

        // La story amorce `colorHsv` sur la HSVA de #2196F3 — exactement une
        // nuance de la grille, donc exactement une coche.
        await expect(sandbox.locator(TICK)).toHaveCount(1, { timeout: 12000 })
    })

    test('cliquer une autre nuance déplace la coche', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const swatches = sandbox.locator(SWATCH)
        await expect(swatches.first()).toBeVisible({ timeout: 12000 })

        // Nuance 0 = #F44336, non sélectionnée au départ.
        await expect(swatches.nth(0)).toHaveAttribute('aria-pressed', 'false', { timeout: 12000 })

        await swatches.nth(0).click()

        await expect(swatches.nth(0)).toHaveAttribute('aria-pressed', 'true', { timeout: 12000 })
        await expect(sandbox.locator(TICK)).toHaveCount(1, { timeout: 12000 })
        await expect(swatches.nth(0).locator('.origam-icon')).toBeVisible({ timeout: 12000 })
    })

    test('chaque nuance est un bouton natif, atteignable et activable au clavier', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const first = sandbox.locator(SWATCH).first()
        await expect(first).toBeVisible({ timeout: 12000 })

        // Un <div @click> n'a ni ce rôle, ni de nom accessible, ni de focus.
        await expect(first).toHaveAttribute('type', 'button')
        await expect(first).toHaveAttribute('aria-label', /.+/)

        await first.focus()
        await expect(first).toBeFocused({ timeout: 12000 })

        await first.press('Enter')
        await expect(first).toHaveAttribute('aria-pressed', 'true', { timeout: 12000 })
    })

    test('disabled — chaque nuance porte l\'attribut natif disabled', async ({ page }) => {
        await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const swatches = sandbox.locator(SWATCH)
        await expect(swatches.first()).toBeVisible({ timeout: 12000 })

        // La variante Functional démarre à disabled=false.
        await expect(swatches.first()).toBeEnabled({ timeout: 12000 })

        // ⚠️ HstCheckbox n'émet AUCUN `<input type="checkbox">` : c'est un
        // `<label role="checkbox" tabindex="0">` avec un SVG. Un
        // `page.locator('input[type="checkbox"]')` attend donc 45 s et
        // échoue — mesuré. Le rôle ARIA est le seul point d'accroche stable.
        await page.getByRole('checkbox', { name: 'Disabled' }).first().click()

        await expect(swatches.first()).toBeDisabled({ timeout: 12000 })
    })
})
