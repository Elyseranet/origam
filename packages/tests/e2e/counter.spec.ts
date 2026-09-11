import { expect, test } from '@playwright/test'

/**
 * OrigamCounter — suite e2e canonique
 *
 * Story : packages/stories/components/stories/Counter/OrigamCounter.story.vue
 * 4 Variants (0-based) :
 *   0 → Design      init: { value: 50, max: 100, active: true, color: 'primary' }
 *   1 → Functional  init: { value: 50, max: 100, active: true }
 *   2 → Slots - Default   (slot custom : <strong>42</strong> items)
 *   3 → Default     playground init: { value: 50, max: 100, active: true }
 *
 * Composant : .origam-counter (v-show="active")
 * Texte affiché : "${value} / ${max}" si max, sinon "${value}"
 * Couleur : useBothColor → classes .origam--color-* ou inline style
 *
 * Règles :
 * - Jamais networkidle (HMR websocket → ne résout pas)
 * - Navigation directe via ?variantId=<storyId>-<index>
 * - toBeVisible({ timeout: 35000 }) : le cold-start HMR sandbox prend 23-30s
 *   par story (bundle-sandbox.js + transform Vite de chaque story).
 * - test.setTimeout(120000) : 16 tests séquentiels × ~30s cold = budget nécessaire.
 */

const STORY_ID   = 'components-stories-counter-origamcounter-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

/** Timeout d'attente pour toBeVisible : absorbe le cold-start HMR sandbox (≤ 30s). */
const VIS = { timeout: 35000 }

test.describe('OrigamCounter', () => {
    test.setTimeout(120000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { value: 50, max: 100, active: true, color: 'primary' }       //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders the counter root with BEM class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-counter').first()).toBeVisible(VIS)
        })

        test('value=50 max=100 — affiche "50 / 100"', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const counter = sandbox.locator('.origam-counter').first()
            await expect(counter).toBeVisible(VIS)
            await expect(counter).toContainText('50')
            await expect(counter).toContainText('100')
        })

        test('color=primary applique une couleur de texte non transparente', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const counter = sandbox.locator('.origam-counter').first()
            await expect(counter).toBeVisible(VIS)
            // useBothColor avec color='primary' → inline style color: var(--origam-…---fgSubtle)
            // La couleur résolue ne doit pas être transparente ni rgba(0,0,0,0).
            const color = await counter.evaluate(el => getComputedStyle(el).color)
            expect(color).not.toBe('rgba(0, 0, 0, 0)')
            expect(color).not.toBe('transparent')
        })

        test('active=true — counter visible (v-show ne le cache pas)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const counter = sandbox.locator('.origam-counter').first()
            await expect(counter).toBeVisible(VIS)
            const display = await counter.evaluate(el => getComputedStyle(el).display)
            expect(display).not.toBe('none')
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 1)                                                 //
    // init: { value: 50, max: 100, active: true }                         //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('renders visible with default init state', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-counter').first()).toBeVisible(VIS)
        })

        test('value=50 max=100 — affiche le format "50 / 100"', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const counter = sandbox.locator('.origam-counter').first()
            await expect(counter).toBeVisible(VIS)
            await expect(counter).toContainText('50')
            await expect(counter).toContainText('100')
        })

        test('init state (50/100) — pas de classe origam-counter--error', async ({ page }) => {
            // La classe --error n'apparaît que si parseFloat(value) > parseFloat(max).
            // Au init (50 < 100), elle ne doit pas être présente.
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const counter = sandbox.locator('.origam-counter').first()
            await expect(counter).toBeVisible(VIS)
            await expect(counter).not.toHaveClass(/origam-counter--error/)
        })

        test('max=100 présent — le séparateur "/" est affiché', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const counter = sandbox.locator('.origam-counter').first()
            await expect(counter).toBeVisible(VIS)
            await expect(counter).toContainText('/')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - DEFAULT (index 2)                                            //
    // Story : <origam-counter :value="42" :max="100" :active="true">      //
    //           <template #default="{ counter }">                          //
    //             <strong>{{ counter }}</strong> items                      //
    //           </template>                                                //
    //         </origam-counter>                                            //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('renders the counter root', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-counter').first()).toBeVisible(VIS)
        })

        test('slot default — contient le texte "42 / 100" via le slot counter', async ({ page }) => {
            // Le slot reçoit { counter, max, value }. Le scoped slot passe counter = "42 / 100".
            // La story rend <strong>{{ counter }}</strong> items → "42 / 100 items".
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const counter = sandbox.locator('.origam-counter').first()
            await expect(counter).toBeVisible(VIS)
            await expect(counter).toContainText('42')
        })

        test('slot default — contient le texte "items" (contenu personnalisé)', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const counter = sandbox.locator('.origam-counter').first()
            await expect(counter).toBeVisible(VIS)
            await expect(counter).toContainText('items')
        })

        test('slot default — rend un élément <strong>', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-counter').first()).toBeVisible(VIS)
            await expect(sandbox.locator('.origam-counter strong').first()).toBeVisible()
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT — Playground (index 3)                                       //
    // init: { value: 50, max: 100, active: true }                         //
    // ------------------------------------------------------------------ //

    test.describe('Default (Playground)', () => {
        test('renders visible', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-counter').first()).toBeVisible(VIS)
        })

        test('affiche "50 / 100" avec les valeurs initiales', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const counter = sandbox.locator('.origam-counter').first()
            await expect(counter).toBeVisible(VIS)
            await expect(counter).toContainText('50')
            await expect(counter).toContainText('100')
        })

        test('possède la classe BEM racine .origam-counter', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const counter = sandbox.locator('.origam-counter').first()
            await expect(counter).toBeVisible(VIS)
            await expect(counter).toHaveClass(/origam-counter/)
        })
    })
})
