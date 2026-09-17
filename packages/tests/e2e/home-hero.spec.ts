/**
 * HomeHero — spec e2e T1 (DS-first rebuild)
 *
 * Asserts the rebuilt, DS-first Hero contract (badge = OrigamChip,
 * snippet = OrigamCode `copyable`, CTAs = OrigamBtn). The section is
 * rendered under the active `sobre` theme (T0).
 *
 *  1. Section #hero present with aria-labelledby="hero-title".
 *  2. Single <h1> contains both i18n title lines.
 *  3. The two title lines are distinct <span class="home-hero__title-line">.
 *  4. Version badge (OrigamChip) visible with expected text.
 *  5. Subtitle visible.
 *  6. CTA "Browse components" links to /components.
 *  7. CTA "Star on GitHub" is external (target=_blank, rel noopener).
 *  8. Install snippet "npm install origam" rendered by OrigamCode in <pre><code>.
 *  9. OrigamCode copy button present, accessible, keyboard-focusable.
 * 10. CTAs are inside a <nav> with an aria-label.
 * 11. Base a11y: no critical/serious axe-core violation on the section.
 *
 * Pré-requis : dev server marketing sur http://localhost:3000.
 * Run :
 *   pnpm -F @origam/tests playwright test \
 *     --config=playwright.marketing.config.ts home-hero
 */

import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const BASE = '/'

test.describe('HomeHero — T1 (DS-first)', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE)
        await page.waitForLoadState('networkidle')
    })

    test('section #hero est dans le DOM avec aria-labelledby', async ({ page }) => {
        const section = page.locator('#hero')
        await expect(section).toBeAttached()
        await expect(section).toHaveAttribute('aria-labelledby', 'hero-title-line1 hero-title-line2')
    })

    test('<h1> unique contient les deux lignes du titre', async ({ page }) => {
        const h1 = page.locator('#hero h1')
        await expect(h1).toBeVisible()
        await expect(h1).toContainText('The Vue 3 design system')
        await expect(h1).toContainText('that just works.')
    })

    test('les deux lignes du <h1> sont des <span> distincts référencés par aria-labelledby', async ({ page }) => {
        const line1 = page.locator('#hero h1 #hero-title-line1')
        const line2 = page.locator('#hero h1 #hero-title-line2')
        await expect(line1).toHaveText('The Vue 3 design system')
        await expect(line2).toHaveText('that just works.')
    })

    test('badge de version (OrigamChip) est visible avec le texte attendu', async ({ page }) => {
        const badge = page.locator('[data-cy="hero-badge"]')
        await expect(badge).toBeVisible()
        // La version est dynamique (lue depuis packages/ds/package.json via useVersion()).
        // On valide le format "v{semver} — " plutôt qu'une valeur figée.
        const text = await badge.textContent()
        expect(text?.trim()).toMatch(/^v\d+\.\d+\.\d+/)
        await expect(badge).toContainText('WCAG 2.1 AA pass')
    })

    test('sous-titre est visible avec la phrase attendue', async ({ page }) => {
        const subtitle = page.locator('#hero .home-hero__subtitle')
        await expect(subtitle).toBeVisible()
        // ⛔ `95 components` était un INVENTAIRE : `home.hero.subtitle` annonce
        // `218 components` aujourd'hui. Le nombre bouge à chaque livraison ;
        // la phrase, elle, est le contrat.
        await expect(subtitle).toContainText(/\d+ components/)
        await expect(subtitle).toContainText('Vue 3')
    })

    test('CTA "Browse components" est un lien vers /components', async ({ page }) => {
        const cta = page.locator('[data-cy="hero-cta-components"]')
        await expect(cta).toBeVisible()
        await expect(cta).toContainText('Browse components')
        await expect(cta).toHaveAttribute('href', '/components')
    })

    test('CTA "Star on GitHub" est un lien externe avec target=_blank et rel noopener', async ({ page }) => {
        const cta = page.locator('[data-cy="hero-cta-github"]')
        await expect(cta).toBeVisible()
        await expect(cta).toContainText('Star on GitHub')
        const href = await cta.getAttribute('href')
        expect(href).toMatch(/github\.com/)
        await expect(cta).toHaveAttribute('target', '_blank')
        const rel = await cta.getAttribute('rel')
        expect(rel).toContain('noopener')
    })

    test('snippet "npm install origam" est rendu par OrigamCode (compact pill) dans un <pre><code>', async ({ page }) => {
        const root = page.locator('#hero [data-cy="hero-install-command"]')
        await expect(root).toHaveClass(/origam-code--compact/)

        const pre = root.locator('pre code')
        await expect(pre).toBeAttached()
        await expect(pre).toContainText('npm install origam')

        // decorative "$" prompt is rendered outside <pre><code> (never copied)
        const prompt = root.locator('[data-cy="origam-code-prompt"]')
        await expect(prompt).toHaveText('$')
    })

    test('bouton Copy (OrigamCode) est présent, accessible et focusable', async ({ page }) => {
        const copyBtn = page.locator('#hero [data-cy="origam-code-copy"]')
        await expect(copyBtn).toBeVisible()
        await expect(copyBtn).toHaveAttribute('aria-label')
        await expect(copyBtn).toBeEnabled()
        await copyBtn.focus()
        await expect(copyBtn).toBeFocused()
    })

    test('deux CTAs sont dans un <nav> avec aria-label', async ({ page }) => {
        const nav = page.locator('#hero nav[aria-label]')
        await expect(nav).toBeAttached()
        const ctaCount = await nav.locator('a, button').count()
        expect(ctaCount).toBeGreaterThanOrEqual(2)
    })

    test('a11y — pas de violation axe-core critique ou sérieuse sur la section hero', async ({ page }) => {
        const results = await new AxeBuilder({ page })
            .include('#hero')
            .analyze()

        const critical = results.violations.filter(
            v => v.impact === 'critical' || v.impact === 'serious'
        )

        expect(
            critical,
            `a11y violations critiques/sérieuses sur #hero :\n` +
            critical.map(v => `  [${v.impact}] ${v.id}: ${v.description}`).join('\n')
        ).toHaveLength(0)
    })

})
