/**
 * Marketing /theming — ISOLATION du playground (régression PR #160).
 *
 * Le preview du Theme Builder est enveloppé dans un
 * `<origam-theme-provider theme="origam">` : quelle que soit la MARQUE active
 * au niveau document (`<html data-theme="cartoon|glass|…">`), le sous-arbre du
 * preview doit rendre l'identité NEUTRE `origam` — sinon les tokens de la marque
 * fuient dans l'aperçu et le Theme Builder ment sur ce que l'utilisateur édite.
 *
 * Deux mécanismes garantissent l'isolation (tous deux couverts ici) :
 *   1. Re-scoping CSS : le thème nommé `origam` re-déclare, à
 *      `[data-theme="origam"]`, l'union des vars composant que les marques
 *      surchargent (sinon elles héritent de l'ancêtre `data-theme`).
 *   2. Props par défaut : `OrigamThemeProvider` applique les `theme.components`
 *      du thème au sous-arbre (fix DS PR #160).
 *
 * STRATÉGIE — on injecte une sonde `<div>` qui CONSOMME des vars composant
 * (celles que les marques surchargent), et on lit leur valeur RÉSOLUE
 * (px / rgb / …) :
 *   - dans le canvas du preview (contexte `[data-theme="origam"]`),
 *   - au document root (contexte de la marque active).
 * Propriété attendue : la valeur du preview est INVARIANTE sur les 8 marques
 * (isolation), alors que le root VARIE par marque (preuve que le test mord).
 *
 * Prérequis : serveur marketing :3000 (auto via playwright.marketing.config.ts).
 * Run : cd packages/tests && node_modules/.bin/playwright test \
 *         --config=playwright.marketing.config.ts marketing-theming-isolation
 */

import { expect, test, type Page } from '@playwright/test'
import { requireMarketingDb } from './_support/require-marketing-db'

// #835 — voir marketing-theme-builder.spec.ts pour le contexte complet.
requireMarketingDb()

// Les 8 marques marketing (celles qui posent un `[data-theme]` au document).
const BRANDS = ['cartoon', 'glass', 'geek', 'editorial', 'material', 'ecom', 'apple', 'sobre'] as const
const MODES = ['light', 'dark'] as const

// Vars COMPOSANT que les marques surchargent — leur valeur résolue doit rester
// neutre dans le preview. Choisies pour couvrir shadow / radius / couleur /
// backdrop (les axes d'identité les plus visibles).
const PROBE_CSS: Record<string, string> = {
    boxShadow: 'var(--origam-card---box-shadow)',
    borderRadius: 'var(--origam-menu---border-radius)',
    backgroundColor: 'var(--origam-card---background)',
    borderColor: 'var(--origam-code---border-color)',
    backdropFilter: 'var(--origam-card---backdrop-filter)'
}
const PROBE_KEYS = Object.keys(PROBE_CSS)

type Resolved = Record<string, string>

/** Injecte une sonde dans `selector`, lit les props résolues, la retire. */
async function readResolved (page: Page, selector: string): Promise<Resolved | null> {
    return page.evaluate(({ selector, css }) => {
        const host = document.querySelector(selector)
        if (!host) return null
        const probe = document.createElement('div')
        for (const [prop, value] of Object.entries(css)) {
            probe.style.setProperty(prop.replace(/[A-Z]/g, m => '-' + m.toLowerCase()), value)
        }
        host.appendChild(probe)
        const cs = getComputedStyle(probe)
        const out: Record<string, string> = {}
        for (const prop of Object.keys(css)) {
            out[prop] = cs.getPropertyValue(prop.replace(/[A-Z]/g, m => '-' + m.toLowerCase()))
        }
        probe.remove()
        return out
    }, { selector, css: PROBE_CSS })
}

/** Force la marque + le mode au document (cascade CSS), sans reload. */
async function setDocumentBrand (page: Page, brand: string, mode: string): Promise<void> {
    await page.evaluate(({ brand, mode }) => {
        document.documentElement.setAttribute('data-theme', brand)
        document.documentElement.setAttribute('data-mode', mode)
    }, { brand, mode })
    await page.waitForTimeout(120)
}

/** Ouvre /theming et bascule en vue split (les 2 panes light + dark existent). */
async function openThemingSplit (page: Page): Promise<void> {
    await page.goto('/theming')
    await page.waitForLoadState('networkidle')
    await page.click('[data-cy="theming-split-btn"]')
    await page.waitForSelector('[data-cy="theming-canvas-dark"]', { timeout: 10000 })
}

test.describe('Playground /theming — isolation du preview vs marque ambiante', () => {
    for (const mode of MODES) {
        test(`preview NEUTRE et invariant sur les 8 marques — ${mode}`, async ({ page }) => {
            await openThemingSplit(page)
            const canvasSel = `[data-cy="theming-canvas-${mode}"]`

            let reference: Resolved | null = null
            const rootBoxShadows = new Set<string>()

            for (const brand of BRANDS) {
                await setDocumentBrand(page, brand, mode)

                const preview = await readResolved(page, canvasSel)
                const root = await readResolved(page, 'html')

                expect(preview, `canvas ${mode} introuvable`).not.toBeNull()
                expect(root, 'html sonde introuvable').not.toBeNull()

                // INVARIANCE — le preview rend la même chose quelle que soit la marque.
                if (reference === null) {
                    reference = preview
                } else {
                    for (const key of PROBE_KEYS) {
                        expect(
                            preview![key],
                            `FUITE: ${brand}/${mode} — le preview ${key}="${preview![key]}" ` +
                            `diffère du neutre="${reference[key]}" → la marque fuit dans l'aperçu`
                        ).toBe(reference[key])
                    }
                }

                rootBoxShadows.add(root!.boxShadow)
            }

            // MEANINGFULNESS — les marques changent RÉELLEMENT le document root,
            // sinon l'invariance ci-dessus serait triviale (rien ne fuit car rien ne change).
            expect(
                rootBoxShadows.size,
                `Le document root ne varie pas par marque (${[...rootBoxShadows].join(' | ')}) — ` +
                `test non concluant, vérifier que les marques posent bien leurs tokens`
            ).toBeGreaterThan(1)
        })
    }
})
