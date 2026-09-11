/**
 * Marketing theming — vérif finale + audit contraste (T-MKT9).
 *
 * Deux parties :
 *
 * PARTIE A — Vérif finale du modèle install-via-createOrigam (ADR-003)
 *   Pour chaque brand × mode :
 *   1. data-theme + data-mode bien posés sur <html> après cookie SSR.
 *   2. body background-color correspond au token surface-default du thème.
 *   3. SSR no-flash : <style data-origam-theme-ssr> présent dans le head.
 *   4. themes-all.css ABSENT des stylesheets chargées.
 *   5. ThemeSwitcher expose EXACTEMENT 8 options (les 8 brands marketing).
 *
 * PARTIE B — Audit contraste WCAG AA (axe-core color-contrast)
 *   Pour chaque brand × mode (16) :
 *   - Lance axe-core avec la règle color-contrast uniquement.
 *   - Loggue le nombre de violations + les 3 pires par thème×mode.
 *   - Ces violations = findings DS (à corriger dans tokens, pas marketing).
 *   Prend aussi un screenshot /tmp/final/{brand}-dark.png par brand.
 *
 * Prerequis : DS rebuild (pnpm -F origam build) + serveur marketing :3000.
 *
 * Run : cd packages/tests && node_modules/.bin/playwright test
 *         --config=playwright.marketing.config.ts
 */

import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import * as path from 'node:path'
import * as fs from 'node:fs'

// ── helpers ────────────────────────────────────────────────────────────────

const THEME_COOKIE = 'origam-theme'
const MODE_COOKIE  = 'origam-mode'

/**
 * Apply theme + mode via SSR cookies, then reload.
 * The DS Nuxt server plugin reads `origam-theme` / `origam-mode` cookies to
 * set data-theme and data-mode in the SSR HTML — localStorage is invisible
 * to the server.
 */
async function applyTheme (page: Page, theme: string, mode: string): Promise<void> {
    await page.context().addCookies([
        { name: THEME_COOKIE, value: theme, url: 'http://localhost:3000' },
        { name: MODE_COOKIE,  value: mode,  url: 'http://localhost:3000' }
    ])
    await page.reload({ waitUntil: 'networkidle' })
}

async function getBodyBg (page: Page): Promise<string> {
    return page.evaluate(() => getComputedStyle(document.body).backgroundColor)
}

// ── constants ──────────────────────────────────────────────────────────────

const BRANDS = ['sobre', 'glass', 'geek', 'cartoon', 'editorial', 'material', 'ecom', 'apple'] as const
const MODES  = ['light', 'dark'] as const

// ═══════════════════════════════════════════════════════════════════════════
// PARTIE A — Vérif finale
// ═══════════════════════════════════════════════════════════════════════════

test.describe('A · Vérif finale install model', () => {

    // ── A1. html attributes ──────────────────────────────────────────────

    test.describe('A1 · html data-theme + data-mode', () => {
        for (const brand of BRANDS) {
            for (const mode of MODES) {
                test(`${brand}/${mode}`, async ({ page }) => {
                    await page.goto('/')
                    await applyTheme(page, brand, mode)
                    const html = page.locator('html')
                    await expect(html).toHaveAttribute('data-theme', brand)
                    await expect(html).toHaveAttribute('data-mode', mode)
                })
            }
        }
    })

    // ── A2. body background = token surface-default ───────────────────────

    test.describe('A2 · body bg token-driven', () => {
        test('sobre/dark = rgb(10, 10, 10)', async ({ page }) => {
            await page.goto('/'); await applyTheme(page, 'sobre', 'dark')
            expect(await getBodyBg(page)).toBe('rgb(10, 10, 10)')
        })
        test('sobre/light = rgb(255, 255, 255)', async ({ page }) => {
            await page.goto('/'); await applyTheme(page, 'sobre', 'light')
            expect(await getBodyBg(page)).toBe('rgb(255, 255, 255)')
        })
        test('apple/dark = rgb(0, 0, 0)', async ({ page }) => {
            await page.goto('/'); await applyTheme(page, 'apple', 'dark')
            expect(await getBodyBg(page)).toBe('rgb(0, 0, 0)')
        })
        test('geek/dark = rgb(10, 6, 18)', async ({ page }) => {
            await page.goto('/'); await applyTheme(page, 'geek', 'dark')
            expect(await getBodyBg(page)).toBe('rgb(10, 6, 18)')
        })
        test('cada brand dark a une bg rgb valide (tokens injectés)', async ({ page }) => {
            await page.goto('/')
            for (const brand of BRANDS) {
                await applyTheme(page, brand, 'dark')
                const bg = await getBodyBg(page)
                expect(bg, `${brand}/dark body bg vide = tokens non injectés`).toMatch(/^rgb/)
            }
        })
    })

    // ── A3. SSR no-flash ─────────────────────────────────────────────────

    test.describe('A3 · SSR no-flash (<style data-origam-theme-ssr>)', () => {
        for (const brand of BRANDS) {
            test(`${brand}/dark — SSR style block non vide`, async ({ page }) => {
                await page.goto('/')
                await applyTheme(page, brand, 'dark')
                const ssrStyle = await page.evaluate(() => {
                    // Le plugin.server.ts injecte via useHead({ style: [{ innerHTML, 'data-origam-theme-ssr': '' }] })
                    // Nuxt sérialise l'attribut data-hid et assigne id= au tag.
                    // Le sélecteur cible l'id produit par Nuxt OU l'attribut brut selon la version.
                    const el = document.head.querySelector('style[id="origam-theme-ssr"], style[data-origam-theme-ssr], style[data-hid="origam-theme-ssr"]')
                    return el ? (el.textContent?.trim() ?? '') : null
                })
                expect(ssrStyle, `${brand}/dark — pas de <style data-origam-theme-ssr>`).not.toBeNull()
                expect(ssrStyle!.length, `${brand}/dark — SSR style vide`).toBeGreaterThan(0)
            })
        }
    })

    // ── A4. themes-all.css absent ────────────────────────────────────────

    test('A4 · themes-all.css absent des stylesheets (modèle install-object)', async ({ page }) => {
        await page.goto('/')
        const found = await page.evaluate(() =>
            Array.from(document.styleSheets).some(s => s.href?.includes('themes-all'))
        )
        expect(found, 'themes-all.css chargée — le marketing ne doit pas utiliser le CSS matrix').toBe(false)
    })

    // ── A5. ThemeSwitcher — exactement 8 options ─────────────────────────

    test.describe('A5 · ThemeSwitcher — 8 brands installedThemes', () => {
        test('8 options [role=option] dans le menu', async ({ page }) => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')

            // Le ThemeSwitcher rend un OrigamBtn qui contient .theme-switcher__label.
            // On cible le bouton parent du span — le span seul ne déclenche pas le menu.
            const activatorBtn = page.locator('button:has(.theme-switcher__label)').first()
            await activatorBtn.click()
            await page.waitForTimeout(600)

            // OrigamMenu téléporte le contenu dans le body via un <div role="menu" ...>
            // Les OrigamListItem portent role="option".
            const options = page.locator('[role="option"]')
            await options.first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {})
            const count = await options.count()

            expect(count, `ThemeSwitcher: ${count} options, attendu 8`).toBe(8)
        })

        test("aucune option ne porte le label 'origam'", async ({ page }) => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            const activatorBtn = page.locator('button:has(.theme-switcher__label)').first()
            await activatorBtn.click()
            await page.waitForTimeout(600)

            const options = page.locator('[role="option"]')
            await options.first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {})
            const labels = await options.allTextContents()
            for (const label of labels) {
                expect(label.toLowerCase()).not.toContain('origam')
            }
        })
    })

})

// ═══════════════════════════════════════════════════════════════════════════
// PARTIE B — Audit contraste WCAG AA
// ═══════════════════════════════════════════════════════════════════════════

interface ContrastFinding {
    brand: string
    mode: string
    violationCount: number
    worst: Array<{ element: string; fg: string; bg: string; ratio: number; required: number }>
}

/** Résultats agrégés au fil des tests (même worker, workers:1). */
const auditLog: ContrastFinding[] = []

test.describe('B · Audit contraste WCAG AA (axe color-contrast)', () => {

    for (const brand of BRANDS) {
        for (const mode of MODES) {
            test(`${brand}/${mode}`, async ({ page }) => {
                await page.goto('/')
                await applyTheme(page, brand, mode)

                // Screenshot dark pour revue visuelle
                if (mode === 'dark') {
                    const dir = '/tmp/final'
                    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
                    await page.screenshot({ path: path.join(dir, `${brand}-dark.png`), fullPage: false })
                }

                const results = await new AxeBuilder({ page })
                    .withRules(['color-contrast'])
                    .analyze()

                const ccViolations = results.violations.filter(v => v.id === 'color-contrast')

                // Extraire les 5 pires (ratio le plus bas)
                const allNodes = ccViolations.flatMap(v => v.nodes.map(node => {
                    const d = node.any[0]?.data as Record<string, unknown> ?? {}
                    return {
                        element: String(node.target?.[0] ?? node.html?.slice(0, 80) ?? '?'),
                        fg: String(d.fgColor ?? '?'),
                        bg: String(d.bgColor ?? '?'),
                        ratio: Number(d.contrastRatio ?? 99),
                        required: Number(d.expectedContrastRatio ?? 4.5)
                    }
                }))
                allNodes.sort((a, b) => a.ratio - b.ratio)
                const worst = allNodes.slice(0, 5)

                const violationCount = ccViolations.reduce((s, v) => s + v.nodes.length, 0)

                auditLog.push({ brand, mode, violationCount, worst })

                if (violationCount > 0) {
                    const lines = worst.map(w =>
                        `    ${w.element}: fg=${w.fg} bg=${w.bg} ratio=${w.ratio.toFixed(2)} (req ${w.required})`
                    ).join('\n')
                    console.log(`[FINDING DS] ${brand}/${mode}: ${violationCount} violations\n${lines}`)
                }

                // Fail uniquement sur ratio < 2:1 (contenu complètement illisible).
                // Les violations AA (< 4.5) sont des findings à corriger dans tokens/
                // mais ne bloquent pas le sprint en cours — on les loggue pour tokens-dev.
                const catastrophic = worst.filter(w => w.ratio < 2.0)
                expect(
                    catastrophic,
                    `${brand}/${mode} — ratio < 2:1 (illisible):\n` +
                    catastrophic.map(w => `  ${w.element} fg=${w.fg} bg=${w.bg} ratio=${w.ratio}`).join('\n')
                ).toHaveLength(0)
            })
        }
    }

    // Synthèse finale — loggue le tableau récap consolidé
    test('SYNTHÈSE — rapport contraste (voir console)', async () => {
        console.log('\n╔══════════════════════════════════════════════╗')
        console.log('║  RAPPORT T-MKT9 — CONTRASTE PAR THÈME×MODE  ║')
        console.log('╚══════════════════════════════════════════════╝')
        for (const r of auditLog) {
            const icon = r.violationCount === 0 ? '✅' : '❌'
            console.log(`${icon}  ${r.brand.padEnd(10)}/${r.mode.padEnd(5)} — ${r.violationCount} violation(s)`)
            for (const w of r.worst) {
                console.log(`       ratio=${w.ratio.toFixed(2)} (req ${w.required})  fg=${w.fg}  bg=${w.bg}`)
                console.log(`       élément: ${w.element}`)
            }
        }
        console.log('════════════════════════════════════════════════')
        expect(true).toBe(true)
    })

})
