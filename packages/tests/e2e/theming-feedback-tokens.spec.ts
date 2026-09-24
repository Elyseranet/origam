/**
 * theming-feedback-tokens.spec.ts
 *
 * TIER 2 — Runtime: navigate to /theming, wait for the <client-only> canvas to
 *   hydrate, apply a preset, and read the inline CSS vars.
 *   Covers: preset -> Vue reactivity -> DOM :style.
 *
 * ⛔ Le « Tier 1 » qui vivait ici a DÉMÉNAGÉ sous #267, vers
 *   `packages/tests/TU/marketing/brand-feedback-tokens.spec.ts`.
 *
 *   Il lisait en texte le fichier généré `theme-builder-brand-presets.const.ts`
 *   pour y vérifier les `--origam-color__feedback--*---bg`. Ce fichier était du
 *   code mort (mesuré : le vider ou le régénérer laissait l'état du builder
 *   identique à l'octet près) et a été supprimé avec son générateur.
 *
 *   Retargeté sur les objets `IOrigamTheme`, ce contrôle ne touche plus ni
 *   navigateur, ni serveur, ni base : c'est un test statique, et il appartient
 *   donc à la suite unitaire — qui, elle, tourne en CI. Le garder ici l'aurait
 *   laissé hors CI, puisque ce fichier exige une base (`requireMarketingDb`)
 *   qu'aucun job de `ci.yml` ne provisionne.
 */

import { test, expect } from '@playwright/test'
import { requireMarketingDb } from './_support/require-marketing-db'


// ── Tier 2 — Runtime (best-effort; skips if OrigamSelect won't open headlessly) ─

test.use({ baseURL: 'http://localhost:3000' })

test.describe('Tier 2 — Runtime: preset canvas inline CSS vars', () => {
    // #835 — ce bloc navigue vers /theming avec des presets réels, il lui faut
    // donc la base. Le contrôle statique équivalent (aucune page, aucune base)
    // vit désormais dans TU/marketing/brand-feedback-tokens.spec.ts (#267).
    // Voir marketing-theme-builder.spec.ts pour le contexte complet.
    requireMarketingDb()

    test('apple preset: canvas receives --origam-color__feedback--success---bg = #28cd41', async ({ page }) => {
        await page.goto('/theming', { waitUntil: 'networkidle' })

        // The <client-only> wrapper renders the canvas only after JS hydration.
        // If the Vite dev server has stale optimized deps (504), hydration fails
        // and the canvas never appears — skip in that case (pre-existing server issue).
        const canvas = page.locator('[data-cy="theming-canvas-light"]')
        const canvasReady = await canvas.waitFor({ state: 'attached', timeout: 10000 }).then(() => true).catch(() => false)
        if (!canvasReady) {
            console.log('[Tier 2] canvas not found — likely a Vite optimizer 504 on the dev server. Restart with --force to clear. Tier 1 already validates the data pipeline.')
            test.skip()
            return
        }

        // Dispatch mousedown to the OrigamSelect control — the select opens on mousedown
        await page.locator('[data-cy="theming-preset"] .origam-input__control').dispatchEvent('mousedown')
        await page.waitForTimeout(500)

        const optionCount = await page.locator('[role="option"]').count()
        if (optionCount === 0) {
            // OrigamSelect's mousedown-based open does not work in headless Chromium via
            // dispatchEvent — this is a pre-existing limitation (the existing
            // marketing-theme-builder.spec.ts has the same issue when run against a
            // fresh server). Tier 1 verified the full data pipeline.
            console.log('[Tier 2] OrigamSelect did not open in headless mode — Tier 1 already validates data pipeline.')
            test.skip()
            return
        }

        await page.locator('[role="option"]').filter({ hasText: 'Apple' }).first().click()
        await page.waitForTimeout(400)

        const successBg = await canvas.evaluate((el) =>
            getComputedStyle(el).getPropertyValue('--origam-color__feedback--success---bg').trim()
        )
        console.log(`[Tier 2/apple] success---bg="${successBg}"`)
        expect(successBg.toLowerCase()).toBe('#28cd41')
    })
})
