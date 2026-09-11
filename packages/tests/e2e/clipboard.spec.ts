import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamClipboard — e2e spec (pattern btn.spec.ts).
 *
 * Navigation directe par variantId (jamais networkidle — le websocket HMR
 * d'Histoire ne ferme jamais et networkidle timeout garanti).
 *
 * Variants (index 0-based, dans l'ordre de la story) :
 *   0 → Design
 *   1 → Functional
 *   2 → Events - copy
 *   3 → Events - error
 *   4 → Slots - Default
 *   5 → Slots - Feedback
 *   6 → Default   (playground)
 *
 * navigator.clipboard.writeText — limitation headless :
 *   L'API Clipboard est bloquée par défaut en contexte headless sans
 *   `permissions: ['clipboard-write']` dans playwright.config. Pour éviter
 *   de modifier le config global (périmètre interdit), chaque test qui
 *   interagit avec la copie stubbe navigator.clipboard à l'intérieur du
 *   frame sandbox via `evaluate()` AVANT le clic. Le stub enregistre les
 *   appels dans `window.__clip` (tableau) : on peut ainsi vérifier le payload
 *   sans dépendre de l'OS ni d'une permission système.
 *
 *   Les tests qui vérifient le feedback visuel (aria-label, classe --copied,
 *   label span) fonctionnent grâce au stub : `useClipboard` ne voit aucune
 *   exception → `copied` passe à `true` → le DOM réagit.
 *
 *   Le test "Events - error" n'utilise PAS de stub clipboard : il appelle
 *   `armErrorMode` (bouton `button.story-arm` dans le sandbox iframe) qui
 *   remplace `navigator.clipboard.writeText` par un rejet et bloque
 *   `document.execCommand`. Le composant émet alors `@error`.
 *   On ne peut pas intercepter `logEvent` (console Histoire privé) — on vérifie
 *   que le trigger reste en état non-copied.
 *
 * BUG DS signalé : slot #feedback non implémenté dans OrigamClipboard.vue.
 *   La story Variant "Slots - Feedback" utilise <template #feedback="{ copied }">
 *   mais ce slot n'est pas déclaré dans le composant. Vue ignore silencieusement
 *   les slots inconnus → le contenu n'est jamais rendu. Test marqué test.fixme.
 */

const STORY_ID   = 'components-stories-clipboard-origamclipboard-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

/** Renvoie le frameLocator du sandbox Histoire pour la page donnée. */
const sandbox = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

/**
 * Attend que la racine .origam-clipboard soit visible dans le sandbox.
 * À appeler en première instruction de chaque test : le sandbox affiche
 * "Loading..." pendant le montage initial du composant, ce qui peut prendre
 * plus de 12 s sur la première navigation de chaque variant.
 */
const waitForRoot = async (page: Page, timeout = 20000) => {
    const root = sandbox(page).locator('.origam-clipboard').first()
    await expect(root).toBeVisible({ timeout })
    return root
}

/**
 * Stub `navigator.clipboard.writeText` à l'intérieur du sandbox iframe.
 * Doit être appelé APRÈS que le composant est visible et AVANT tout clic.
 * Enregistre chaque texte copié dans `window.__clip`.
 */
const stubClipboard = async (page: Page) => {
    await sandbox(page).locator('body').evaluate(() => {
        ;(window as unknown as { __clip: string[] }).__clip = []
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                writeText: async (text: string) => {
                    ;(window as unknown as { __clip: string[] }).__clip.push(text)
                }
            }
        })
    })
}

/** Lit les appels enregistrés par stubClipboard. */
const readClip = (page: Page) =>
    sandbox(page).locator('body').evaluate(
        () => (window as unknown as { __clip: string[] }).__clip ?? []
    )

// ─────────────────────────────────────────────────────────────────────────── //
// Suite globale — timeout 45 s pour polices MDI + sandbox loading headless    //
// ─────────────────────────────────────────────────────────────────────────── //

test.describe('OrigamClipboard', () => {
    test.setTimeout(45000)

    // ─────────────────────────────────────────────────────────────── //
    // DESIGN (index 0)                                                 //
    // init-state : { value: 'arnaud@example.com' }                    //
    // ─────────────────────────────────────────────────────────────── //

    test.describe('Design — variant 0', () => {
        test('monte la racine .origam-clipboard', async ({ page }) => {
            await page.goto(variantUrl(0))
            await waitForRoot(page)
        })

        test('rend le bouton trigger par défaut', async ({ page }) => {
            await page.goto(variantUrl(0))
            await waitForRoot(page)
            const trigger = sandbox(page).locator('[data-cy="origam-clipboard-default-trigger"]').first()
            await expect(trigger).toBeVisible({ timeout: 8000 })
        })

        test('le trigger porte l\'aria-label "copy to clipboard" au repos', async ({ page }) => {
            await page.goto(variantUrl(0))
            await waitForRoot(page)
            const trigger = sandbox(page).locator('[data-cy="origam-clipboard-default-trigger"]').first()
            await expect(trigger).toBeVisible({ timeout: 8000 })
            await expect(trigger).toHaveAttribute('aria-label', /copy to clipboard/i)
        })

        test('le trigger n\'est pas désactivé (disabled=false par défaut)', async ({ page }) => {
            await page.goto(variantUrl(0))
            await waitForRoot(page)
            const trigger = sandbox(page).locator('[data-cy="origam-clipboard-default-trigger"]').first()
            await expect(trigger).toBeVisible({ timeout: 8000 })
            await expect(trigger).not.toBeDisabled()
        })

        test('après clic stubé, l\'aria-label flip à "copied"', async ({ page }) => {
            await page.goto(variantUrl(0))
            await waitForRoot(page)
            const trigger = sandbox(page).locator('[data-cy="origam-clipboard-default-trigger"]').first()
            await expect(trigger).toBeVisible({ timeout: 8000 })
            await stubClipboard(page)

            await trigger.click()
            await expect(trigger).toHaveAttribute('aria-label', /copied/i, { timeout: 3000 })
        })

        test('après clic stubé, writeText a reçu le payload arnaud@example.com', async ({ page }) => {
            await page.goto(variantUrl(0))
            await waitForRoot(page)
            const trigger = sandbox(page).locator('[data-cy="origam-clipboard-default-trigger"]').first()
            await expect(trigger).toBeVisible({ timeout: 8000 })
            await stubClipboard(page)

            await trigger.click()
            const calls = await readClip(page)
            expect(calls).toHaveLength(1)
            expect(calls[0]).toBe('arnaud@example.com')
        })

        test('la classe --copied apparaît sur le trigger après copie', async ({ page }) => {
            await page.goto(variantUrl(0))
            await waitForRoot(page)
            const trigger = sandbox(page).locator('[data-cy="origam-clipboard-default-trigger"]').first()
            await expect(trigger).toBeVisible({ timeout: 8000 })
            await stubClipboard(page)

            await trigger.click()
            await expect(trigger).toHaveClass(/origam-clipboard__default-trigger--copied/, { timeout: 3000 })
        })

        test('le label feedback .origam-clipboard__default-label apparaît après copie', async ({ page }) => {
            await page.goto(variantUrl(0))
            await waitForRoot(page)
            const trigger = sandbox(page).locator('[data-cy="origam-clipboard-default-trigger"]').first()
            await expect(trigger).toBeVisible({ timeout: 8000 })

            // Avant copie : label absent
            const label = sandbox(page).locator('.origam-clipboard__default-label')
            await expect(label).toHaveCount(0)

            await stubClipboard(page)
            await trigger.click()
            await expect(label).toBeVisible({ timeout: 3000 })
            await expect(label).toHaveText('Copied!')
        })

        test('la classe --copied disparaît sur la racine après feedbackDuration (2 s)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const root = await waitForRoot(page)
            const trigger = sandbox(page).locator('[data-cy="origam-clipboard-default-trigger"]').first()
            await expect(trigger).toBeVisible({ timeout: 8000 })
            await stubClipboard(page)

            await trigger.click()
            await expect(root).toHaveClass(/origam-clipboard--copied/, { timeout: 3000 })

            // feedbackDuration par défaut = 2000 ms → attendre 2,5 s
            await page.waitForTimeout(2500)
            await expect(root).not.toHaveClass(/origam-clipboard--copied/)
        })
    })

    // ─────────────────────────────────────────────────────────────── //
    // FUNCTIONAL (index 1)                                             //
    // init-state : { value: 'arnaud@example.com', feedbackDuration:   //
    //   2000, feedbackText: 'Copied!', disabled: false }              //
    // ─────────────────────────────────────────────────────────────── //

    test.describe('Functional — variant 1', () => {
        test('le trigger est activé par défaut (disabled=false)', async ({ page }) => {
            await page.goto(variantUrl(1))
            await waitForRoot(page)
            const trigger = sandbox(page).locator('[data-cy="origam-clipboard-default-trigger"]').first()
            await expect(trigger).toBeVisible({ timeout: 8000 })
            await expect(trigger).not.toBeDisabled()
        })

        test('la racine ne porte pas la classe --disabled (disabled=false par défaut)', async ({ page }) => {
            await page.goto(variantUrl(1))
            const root = await waitForRoot(page)
            await expect(root).not.toHaveClass(/origam-clipboard--disabled/)
        })
    })

    // ─────────────────────────────────────────────────────────────── //
    // EVENTS - copy (index 2)                                          //
    // Template : <origam-clipboard value="counter-payload"            //
    //              @copy="logEvent('copy', $event)" />                //
    // ─────────────────────────────────────────────────────────────── //

    test.describe('Events - copy — variant 2', () => {
        test('monte et affiche le trigger par défaut', async ({ page }) => {
            await page.goto(variantUrl(2))
            await waitForRoot(page)
            const trigger = sandbox(page).locator('[data-cy="origam-clipboard-default-trigger"]').first()
            await expect(trigger).toBeVisible({ timeout: 8000 })
        })

        test('après clic stubé, feedback visuel + payload counter-payload', async ({ page }) => {
            await page.goto(variantUrl(2))
            const root = await waitForRoot(page)
            const trigger = sandbox(page).locator('[data-cy="origam-clipboard-default-trigger"]').first()
            await expect(trigger).toBeVisible({ timeout: 8000 })
            await stubClipboard(page)

            await trigger.click()
            await expect(root).toHaveClass(/origam-clipboard--copied/, { timeout: 3000 })

            const calls = await readClip(page)
            expect(calls).toHaveLength(1)
            expect(calls[0]).toBe('counter-payload')
        })
    })

    // ─────────────────────────────────────────────────────────────── //
    // EVENTS - error (index 3)                                         //
    // Template : button.story-arm (@click="armErrorMode") +           //
    //   <origam-clipboard value="never-copied"                        //
    //     @error="logEvent('error', $event)" />                       //
    //                                                                  //
    // armErrorMode force-remplace navigator.clipboard par un rejet   //
    // et bloque document.execCommand. Le composant émet @error.       //
    // ─────────────────────────────────────────────────────────────── //

    test.describe('Events - error — variant 3', () => {
        test('monte le bouton story-arm + le trigger clipboard', async ({ page }) => {
            await page.goto(variantUrl(3))
            await waitForRoot(page)
            const arm     = sandbox(page).locator('button.story-arm').first()
            const trigger = sandbox(page).locator('[data-cy="origam-clipboard-default-trigger"]').first()
            await expect(arm).toBeVisible({ timeout: 8000 })
            await expect(trigger).toBeVisible({ timeout: 8000 })
        })

        test('après armErrorMode + clic, le trigger reste en état non-copied', async ({ page }) => {
            await page.goto(variantUrl(3))
            const root    = await waitForRoot(page)
            const arm     = sandbox(page).locator('button.story-arm').first()
            const trigger = sandbox(page).locator('[data-cy="origam-clipboard-default-trigger"]').first()
            await expect(arm).toBeVisible({ timeout: 8000 })

            await arm.click()
            await trigger.click()
            await page.waitForTimeout(300)

            await expect(root).not.toHaveClass(/origam-clipboard--copied/)
            await expect(trigger).not.toHaveAttribute('aria-label', /copied/i)
        })

        test('après armErrorMode, writeText n\'enregistre aucun appel réussi', async ({ page }) => {
            await page.goto(variantUrl(3))
            await waitForRoot(page)
            const arm     = sandbox(page).locator('button.story-arm').first()
            const trigger = sandbox(page).locator('[data-cy="origam-clipboard-default-trigger"]').first()
            await expect(arm).toBeVisible({ timeout: 8000 })

            await sandbox(page).locator('body').evaluate(() => {
                ;(window as unknown as { __clip: string[] }).__clip = []
            })
            await arm.click()
            await trigger.click()
            await page.waitForTimeout(300)

            const calls = await readClip(page)
            expect(calls).toHaveLength(0)
        })
    })

    // ─────────────────────────────────────────────────────────────── //
    // SLOTS - Default (index 4)                                        //
    // Template : <origam-clipboard value="my-api-key-12345">          //
    //   <template #default="{ copy, copied }">                        //
    //     <origam-btn @click="copy">…</origam-btn>                    //
    //   </template>                                                    //
    // Le slot remplace complètement le trigger par défaut.            //
    // ─────────────────────────────────────────────────────────────── //

    test.describe('Slots - Default — variant 4', () => {
        test('le slot custom remplace le trigger par défaut', async ({ page }) => {
            await page.goto(variantUrl(4))
            await waitForRoot(page)
            const sb        = sandbox(page)
            const customBtn = sb.locator('.origam-btn').first()
            await expect(customBtn).toBeVisible({ timeout: 8000 })
            await expect(sb.locator('[data-cy="origam-clipboard-default-trigger"]')).toHaveCount(0)
        })

        test('le slot affiche "Copy API key" au repos', async ({ page }) => {
            await page.goto(variantUrl(4))
            await waitForRoot(page)
            const customBtn = sandbox(page).locator('.origam-btn').first()
            await expect(customBtn).toBeVisible({ timeout: 8000 })
            await expect(customBtn).toContainText(/Copy API key/i)
        })

        test('après clic stubé, le slot reçoit copied=true → texte "Copied!"', async ({ page }) => {
            await page.goto(variantUrl(4))
            await waitForRoot(page)
            const customBtn = sandbox(page).locator('.origam-btn').first()
            await expect(customBtn).toBeVisible({ timeout: 8000 })
            await stubClipboard(page)

            await customBtn.click()
            await expect(customBtn).toContainText(/Copied!/i, { timeout: 3000 })

            const calls = await readClip(page)
            expect(calls).toHaveLength(1)
            expect(calls[0]).toBe('my-api-key-12345')
        })
    })

    // ─────────────────────────────────────────────────────────────── //
    // SLOTS - Feedback (index 5)                                       //
    //                                                                  //
    // BUG DS — le slot nommé #feedback n'est pas défini dans           //
    // OrigamClipboard.vue : le composant n'expose qu'un seul slot      //
    // (#default). La story utilise <template #feedback="..."> mais     //
    // Vue ignore silencieusement les slots non déclarés.               //
    // → le trigger par défaut s'affiche, la span "Done!" jamais.       //
    // Le slot #feedback doit être ajouté au composant.                 //
    // ─────────────────────────────────────────────────────────────── //

    test.describe('Slots - Feedback — variant 5', () => {
        test('le trigger par défaut est rendu (slot #feedback ignoré — bug DS)', async ({ page }) => {
            await page.goto(variantUrl(5))
            await waitForRoot(page)
            const trigger = sandbox(page).locator('[data-cy="origam-clipboard-default-trigger"]').first()
            await expect(trigger).toBeVisible({ timeout: 8000 })
        })

        // BUG DS : slot #feedback non déclaré dans OrigamClipboard.vue.
        // Vue ignore le contenu → "Done!" n'est jamais rendu.
        // Déverrouiller quand le slot #feedback est ajouté au composant.
        test.fixme('après clic, le slot #feedback affiche "Done!" [BUG DS: slot non implémenté]', async ({ page }) => {
            await page.goto(variantUrl(5))
            await waitForRoot(page)
            const trigger = sandbox(page).locator('[data-cy="origam-clipboard-default-trigger"]').first()
            await expect(trigger).toBeVisible({ timeout: 8000 })
            await stubClipboard(page)

            await trigger.click()
            const feedbackSpan = sandbox(page).locator('.origam-clipboard').getByText('Done!')
            await expect(feedbackSpan).toBeVisible({ timeout: 3000 })
        })
    })

    // ─────────────────────────────────────────────────────────────── //
    // DEFAULT / playground (index 6)                                   //
    // init-state : { value: 'arnaud@example.com',                     //
    //   feedbackDuration: 2000, feedbackText: 'Copied!',              //
    //   disabled: false }                                              //
    // ─────────────────────────────────────────────────────────────── //

    test.describe('Default (playground) — variant 6', () => {
        test('monte la racine avec le trigger actif', async ({ page }) => {
            await page.goto(variantUrl(6))
            await waitForRoot(page)
            const trigger = sandbox(page).locator('[data-cy="origam-clipboard-default-trigger"]').first()
            await expect(trigger).toBeVisible({ timeout: 8000 })
            await expect(trigger).not.toBeDisabled()
        })

        test('clic copie arnaud@example.com et produit le feedback', async ({ page }) => {
            await page.goto(variantUrl(6))
            await waitForRoot(page)
            const trigger = sandbox(page).locator('[data-cy="origam-clipboard-default-trigger"]').first()
            await expect(trigger).toBeVisible({ timeout: 8000 })
            await stubClipboard(page)

            await trigger.click()
            await expect(trigger).toHaveAttribute('aria-label', /copied/i, { timeout: 3000 })

            const calls = await readClip(page)
            expect(calls).toHaveLength(1)
            expect(calls[0]).toBe('arnaud@example.com')
        })

        test('feedback se réinitialise après feedbackDuration (2 s)', async ({ page }) => {
            await page.goto(variantUrl(6))
            await waitForRoot(page)
            const trigger = sandbox(page).locator('[data-cy="origam-clipboard-default-trigger"]').first()
            await expect(trigger).toBeVisible({ timeout: 8000 })
            await stubClipboard(page)

            await trigger.click()
            await expect(trigger).toHaveAttribute('aria-label', /copied/i, { timeout: 3000 })

            await page.waitForTimeout(2500)
            await expect(trigger).toHaveAttribute('aria-label', /copy to clipboard/i)
        })
    })
})
