import { expect, test } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId (cf. btn.spec.ts).
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamColorPicker (0-based) :
 *   0  → Design
 *   1  → Functional
 *   2  → Events - update:modelValue
 *   3  → Events - update:mode
 *   4  → Slots - Default
 *   5  → Slots - Title
 *   6  → Slots - Header
 *   7  → Slots - Actions
 *   8  → Default (playground)
 */

const STORY_ID   = 'components-stories-colorpicker-origamcolorpicker-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamColorPicker', () => {
    test.setTimeout(45000)

    /*
     * Ce test remplace CINQ tests qui portaient des noms différents
     * (`hideCanvas`, `mode`, `sliders / inputs`, `swatches`, `canvas area`) et
     * dont les corps étaient STRICTEMENT identiques : même `variantUrl(1)`,
     * même locator, même assertion « le picker est visible ». Aucun ne pilotait
     * la prop qu'il annonçait.
     *
     * Cinq exécutions de la même assertion ne valent pas cinq couvertures —
     * elles gonflent un compte de tests sans rien vérifier de plus, et leurs
     * noms font croire à une couverture qui n'existe pas. C'est plus nuisible
     * qu'un test manquant : un trou se voit, un faux plein non.
     *
     * ⚠️ LE TROU RÉEL SUBSISTE et n'est pas comblé ici : les props de la
     * variante Functional (hideCanvas, mode, sliders, inputs, swatches) ne sont
     * exercées par aucun test. Consigné, pas maquillé.
     */
    test('Functional — le picker se rend', async ({ page }) => {
        await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const picker = sandbox.locator('.origam-color-picker').first()
        await expect(picker).toBeVisible({ timeout: 12000 })
    })

    test('Slot — title renders custom title content', async ({ page }) => {
        await page.goto(variantUrl(5), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.getByText('Pick a colour')).toBeVisible({ timeout: 12000 })
    })

    test('Slot — actions renders action buttons', async ({ page }) => {
        await page.goto(variantUrl(7), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.getByRole('button', { name: /apply/i })).toBeVisible({ timeout: 12000 })
    })

    test('Emit — update:modelValue variant renders picker', async ({ page }) => {
        await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-color-picker').first()).toBeVisible({ timeout: 12000 })
    })

    test('Playground variant — picker renders', async ({ page }) => {
        await page.goto(variantUrl(8), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const picker = sandbox.locator('.origam-color-picker').first()
        await expect(picker).toBeVisible({ timeout: 12000 })
        // picker mode class is present
        await expect(picker).toHaveClass(/origam-color-picker--/)
    })
})
