/**
 * Marketing /theming — en mode Split, chaque overlay se rend dans SON canvas (#1292).
 *
 * Les snippets d'overlay se rattachaient avec `attach: '.tb-preview__canvas'`,
 * un `querySelector` qui ne résout que le PREMIER canvas : en Split, les deux
 * overlays tombaient dans le canvas clair (mesuré avant correctif : 2 dans
 * `light`, 0 dans `dark`, pour les 9 overlays mesurables), donc l'overlay du
 * pane sombre portait le thème clair.
 *
 * Pour chaque overlay : dans chaque pane, la racine de l'overlay est UNE fois
 * dans le canvas du pane, et son `[data-mode]` le plus proche — relu dans le
 * MÊME evaluate — est celui du pane.
 *
 * Prérequis : serveur marketing + base seedée (voir `requireMarketingDb`).
 * Run : cd packages/tests && pnpm exec playwright test \
 *         --config=playwright.marketing.config.ts marketing-theming-split-overlay-attach
 */

import { expect, test } from '@playwright/test'
import { requireMarketingDb } from './_support/require-marketing-db'

requireMarketingDb()

/** slug de la nav /theming → classe de la racine rendue par l'overlay. */
const OVERLAYS: Record<string, string> = {
    dialog: '.origam-dialog',
    'dialog-confirmation': '.origam-dialog',
    menu: '.origam-menu',
    overlay: '.origam-overlay',
    tooltip: '.origam-tooltip',
    snackbar: '.origam-snackbar',
    drawer: '.origam-drawer',
    'command-palette': '.origam-command-palette',
    'contextual-menu': '.origam-contextual-menu',
    'snackbar-group': '.origam-snackbar-group'
}

const MODES = ['light', 'dark'] as const

test.describe('/theming Split — overlays rattachés à leur propre canvas (#1292)', () => {
    for (const [slug, root] of Object.entries(OVERLAYS)) {
        test(slug, async ({ page }) => {
            await page.goto('/theming', { waitUntil: 'load' })
            await page.waitForSelector('[data-cy="theming-split-btn"]')
            /*
             * Un clic qui part avant l'hydratation est perdu (runner CI lent) : on
             * reclique jusqu'à ce que l'état attendu soit là, sans attente fixe.
             */
            await expect(async () => {
                if ((await page.locator('[data-cy="theming-split-btn"]').getAttribute('aria-pressed')) !== 'true') {
                    await page.locator('[data-cy="theming-split-btn"]').click()
                }
                await expect(page.locator('[data-cy="theming-split-btn"]')).toHaveAttribute('aria-pressed', 'true', { timeout: 1_000 })
            }).toPass({ timeout: 20_000 })
            await expect(async () => {
                await page.evaluate((s) => (document.querySelector(`[data-cy="theming-nav-item-${s}"]`) as HTMLElement).click(), slug)
                await page.waitForSelector(`[data-cy="theming-nav-item-${slug}"].tb-nav__item--active`, { timeout: 1_000 })
            }).toPass({ timeout: 20_000 })

            await expect.poll(() => page.evaluate(
                ({ root }) => document.querySelectorAll(root).length,
                { root }
            ), { timeout: 10_000 }).toBeGreaterThan(0)

            for (const mode of MODES) {
                await expect.poll(() => page.evaluate(({ root, mode }) => {
                    const canvas = document.querySelector(`[data-cy="theming-canvas-${mode}"]`)
                    const found = canvas ? [...canvas.querySelectorAll(root)] : []
                    const scope = found[0]?.closest('[data-mode]')
                    return { count: found.length, mode: scope?.getAttribute('data-mode') ?? null }
                }, { root, mode }), { message: `${slug} dans ${mode}`, timeout: 10_000 }).toEqual({ count: 1, mode })
            }
        })
    }
})
