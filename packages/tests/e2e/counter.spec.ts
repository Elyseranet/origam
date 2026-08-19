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
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-counter').first()).toBeVisible(VIS)
        })

        test('value=50 max=100 — affiche "50 / 100"', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const counter = sandbox.locator('.origam-counter').first()
            await expect(counter).toBeVisible(VIS)
            await expect(counter).toContainText('50')
            await expect(counter).toContainText('100')
        })

        test('color=primary applique une couleur de texte non transparente', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
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
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
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
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-counter').first()).toBeVisible(VIS)
        })

        test('value=50 max=100 — affiche le format "50 / 100"', async ({ page }) => {
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const counter = sandbox.locator('.origam-counter').first()
            await expect(counter).toBeVisible(VIS)
            await expect(counter).toContainText('50')
            await expect(counter).toContainText('100')
        })

        test('init state (50/100) — pas de classe origam-counter--error', async ({ page }) => {
            // La classe --error n'apparaît que si parseFloat(value) > parseFloat(max).
            // Au init (50 < 100), elle ne doit pas être présente.
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const counter = sandbox.locator('.origam-counter').first()
            await expect(counter).toBeVisible(VIS)
            await expect(counter).not.toHaveClass(/origam-counter--error/)
        })

        test('max=100 présent — le séparateur "/" est affiché', async ({ page }) => {
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
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
            await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-counter').first()).toBeVisible(VIS)
        })

        test('slot default — contient le texte "42 / 100" via le slot counter', async ({ page }) => {
            // Le slot reçoit { counter, max, value }. Le scoped slot passe counter = "42 / 100".
            // La story rend <strong>{{ counter }}</strong> items → "42 / 100 items".
            await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const counter = sandbox.locator('.origam-counter').first()
            await expect(counter).toBeVisible(VIS)
            await expect(counter).toContainText('42')
        })

        test('slot default — contient le texte "items" (contenu personnalisé)', async ({ page }) => {
            await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const counter = sandbox.locator('.origam-counter').first()
            await expect(counter).toBeVisible(VIS)
            await expect(counter).toContainText('items')
        })

        test('slot default — rend un élément <strong>', async ({ page }) => {
            await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
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
            await page.goto(variantUrl(3), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-counter').first()).toBeVisible(VIS)
        })

        test('affiche "50 / 100" avec les valeurs initiales', async ({ page }) => {
            await page.goto(variantUrl(3), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const counter = sandbox.locator('.origam-counter').first()
            await expect(counter).toBeVisible(VIS)
            await expect(counter).toContainText('50')
            await expect(counter).toContainText('100')
        })

        test('possède la classe BEM racine .origam-counter', async ({ page }) => {
            await page.goto(variantUrl(3), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const counter = sandbox.locator('.origam-counter').first()
            await expect(counter).toBeVisible(VIS)
            await expect(counter).toHaveClass(/origam-counter/)
        })
    })

    // ------------------------------------------------------------------ //
    // DENSITÉ — effet visuel réel (issue #356)                            //
    //                                                                      //
    // La prop est pilotée par le VRAI contrôle de la story (HstSelect de   //
    // la variante Design), pas par une classe posée à la main : c'est le   //
    // maillon prop -> classe -> rendu qui est affirmé ici.                 //
    //                                                                      //
    // Contrat vérifié :                                                    //
    //   - `density` décale la police d'un DELTA de 1px autour du token     //
    //     `--origam-counter---font-size` ;                                 //
    //   - `default` est NEUTRE : même taille que sans densité du tout ;    //
    //   - `font-size` n'est jamais animée, donc une mesure synchrone lit   //
    //     déjà la valeur finale.                                           //
    // ------------------------------------------------------------------ //

    test.describe('Density', () => {
        /** Ouvre le picker « Density » de la variante Design et choisit une option. */
        const pickDensity = async (page: import('@playwright/test').Page, option: string) => {
            // Le <label> lui-même est `cursor-text` et n'ouvre rien : le
            // déclencheur est le `.v-popper` qu'il contient.
            const trigger = page
                .locator('label.histoire-select', { hasText: 'Density' })
                .first()
                .locator('.v-popper')
                .first()
            await trigger.scrollIntoViewIfNeeded()
            await trigger.click()
            const popper = page.locator('.v-popper__popper--shown')
            await popper.waitFor({ state: 'visible', timeout: 10000 })
            await popper.getByText(option, { exact: true }).first().click()
            await popper.waitFor({ state: 'hidden', timeout: 10000 })
        }

        /**
         * `domcontentloaded` ne garantit pas que la feuille scopée du sandbox
         * soit appliquée : WebKit rendait encore le compteur à la police
         * héritée (16px) et `transition-property` à sa valeur initiale. On
         * attend que le document du sandbox soit complet.
         */
        const waitForSandboxStyles = async (page: import('@playwright/test').Page) => {
            const counter = page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-counter').first()
            await expect(counter).toBeVisible(VIS)
            await expect
                .poll(async () => counter.evaluate(el => el.ownerDocument.readyState), { timeout: 20000 })
                .toBe('complete')
            await expect
                .poll(async () => counter.evaluate(el => getComputedStyle(el).transitionDuration), { timeout: 20000 })
                .not.toBe('0s')
        }

        const fontSizeOf = async (page: import('@playwright/test').Page) => {
            const counter = page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-counter').first()

            return parseFloat(await counter.evaluate(el => getComputedStyle(el).fontSize))
        }

        test('density décale la police autour du token, et "default" est neutre', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await waitForSandboxStyles(page)

            // Référence : aucune densité posée -> la police vaut le token seul.
            const base = await fontSizeOf(page)
            expect(base).toBeGreaterThan(0)

            await pickDensity(page, 'Comfortable')
            await expect(sandbox.locator('.origam-counter').first())
                .toHaveClass(/origam-counter--density-comfortable/)
            expect(await fontSizeOf(page)).toBeCloseTo(base + 1, 1)

            await pickDensity(page, 'Compact')
            await expect(sandbox.locator('.origam-counter').first())
                .toHaveClass(/origam-counter--density-compact/)
            expect(await fontSizeOf(page)).toBeCloseTo(base - 1, 1)

            // Le point qui pinne le correctif d'issue #356 : avant, `default`
            // écrasait le token par un 12px en dur et rendait donc une taille
            // DIFFÉRENTE de l'absence de densité.
            await pickDensity(page, 'Default')
            await expect(sandbox.locator('.origam-counter').first())
                .toHaveClass(/origam-counter--density-default/)
            expect(await fontSizeOf(page)).toBeCloseTo(base, 1)
        })

        test('la police n\'est pas animée — une mesure synchrone lit la valeur finale', async ({ page }) => {
            // Cause racine de #356 : `transition-duration` déclarée seule laisse
            // `transition-property` à sa valeur initiale `all`, ce qui anime
            // `font-size`. Pendant toute la transition, `getComputedStyle` rend
            // l'ANCIENNE taille — la police paraissait alors insensible à tout
            // canal, y compris à un style inline.
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const counter = page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-counter').first()
            await waitForSandboxStyles(page)

            const transitionProperty = await counter.evaluate(el => getComputedStyle(el).transitionProperty)
            expect(transitionProperty).not.toContain('all')
            expect(transitionProperty).not.toContain('font-size')

            // Mesure synchrone : on écrit puis on lit sans laisser passer de frame.
            const { sync, settled } = await counter.evaluate(async (el) => {
                el.classList.remove('origam-counter--density-compact')
                await new Promise(r => setTimeout(r, 250))
                el.classList.add('origam-counter--density-compact')
                const sync = getComputedStyle(el).fontSize
                await new Promise(r => setTimeout(r, 250))
                const settled = getComputedStyle(el).fontSize
                el.classList.remove('origam-counter--density-compact')

                return { sync, settled }
            })
            expect(sync).toBe(settled)
        })
    })
})
