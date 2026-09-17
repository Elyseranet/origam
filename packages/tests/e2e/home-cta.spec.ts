/**
 * home-cta.spec.ts — T7 HomeCta section (DS-first rebuild)
 *
 * Asserts the rebuilt, DS-first CTA contract:
 *  - bare <section> (no Card wrapper) with the cta-glow gradient background
 *  - H2 via OrigamTitle, aria target on a <span id> (OrigamTitle drops id)
 *  - install snippet rendered by OrigamCode `copyable` (no manual copy btn,
 *    no useCopy) — copy control is the DS button [data-cy="origam-code-copy"]
 *  - "Read docs" OrigamBtn linking to CTA_DOCS_HREF, carrying the shared Hero
 *    glow (cf. `packages/marketing/src/consts/cta.const.ts` — source de vérité
 *    des deux cibles ; elles ont changé le 2026-06-17, voir plus bas)
 *
 * Prerequisites: marketing dev server at http://localhost:3000 (or
 * MARKETING_BASE_URL env var). Run with:
 *   pnpm -F @origam/tests playwright test --config=playwright.marketing.config.ts
 *   e2e/home-cta.spec.ts
 */

import { expect, test } from '@playwright/test'

test.describe('HomeCta section — T7 (DS-first)', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/', { waitUntil: 'networkidle' })
    })

    // ── 1. Section presence & labelling ───────────────────────────────────

    test('section has aria-labelledby pointing to #cta-title', async ({ page }) => {
        const section = page.locator('section.home-cta')
        await expect(section).toBeVisible()
        await expect(section).toHaveAttribute('aria-labelledby', 'cta-title')

        // OrigamTitle now carries the `id` on its rendered <h2> root (DS fix),
        // so the aria-labelledby target IS the heading element itself.
        const target = page.locator('h2#cta-title')
        await expect(target).toBeVisible()
    })

    // ── 2. H2 title ────────────────────────────────────────────────────────

    test('h2 renders "Ready to ship faster?" from i18n', async ({ page }) => {
        const title = page.locator('section.home-cta h2')
        await expect(title).toBeVisible()
        await expect(title).toContainText('Ready to ship faster?')
    })

    test('section contains a single <h2> element', async ({ page }) => {
        const headings = page.locator('section.home-cta h2')
        await expect(headings).toHaveCount(1)
    })

    // ── 3. Description ─────────────────────────────────────────────────────

    test('description <p> is visible and non-empty', async ({ page }) => {
        const desc = page.locator('section.home-cta p.home-cta__description')
        await expect(desc).toBeVisible()
        await expect(desc).toContainText('origam in 30 seconds')
    })

    // ── 4. Read docs CTA (OrigamBtn) ───────────────────────────────────────

    // ⛔ Cibles recalées sur `packages/marketing/src/consts/cta.const.ts`.
    //
    // Le produit a délibérément retargeté les deux CTA le 2026-06-17
    // (`ddb07005b`, « nav 404-availability gating ») : `/docs` → `/components`
    // et `/docs/getting-started` → `/installation`, c'est-à-dire vers deux
    // vraies pages Nuxt au lieu de deux chemins du site statique VitePress. La
    // spec n'a jamais suivi : elle est rouge depuis trois mois, et rien ne l'a
    // dit — elle n'est exécutée par aucun job de CI (#824, #835).
    //
    // La cible d'un CTA est une décision produit : on continue de l'épingler,
    // mais sur la valeur réellement servie, pas sur celle d'avant le retarget.
    test('Read docs button renders and links to /components', async ({ page }) => {
        const btn = page.locator('[data-cy="cta-btn-docs"]')
        await expect(btn).toBeVisible()
        await expect(btn).toContainText('Read docs')
        await expect(btn).toHaveAttribute('href', '/components')
    })

    test('Read docs button is keyboard-focusable', async ({ page }) => {
        const btn = page.locator('[data-cy="cta-btn-docs"]')
        await btn.focus()
        await expect(btn).toBeFocused()
    })

    // ── 5. Get started CTA (OrigamBtn) ────────────────────────────────────

    test('Get started button renders and links to /installation', async ({ page }) => {
        const btn = page.locator('[data-cy="cta-btn-start"]')
        await expect(btn).toBeVisible()
        await expect(btn).toContainText('Get started')
        await expect(btn).toHaveAttribute('href', '/installation')
    })

    test('Get started button is keyboard-focusable', async ({ page }) => {
        const btn = page.locator('[data-cy="cta-btn-start"]')
        await btn.focus()
        await expect(btn).toBeFocused()
    })

    // NOTE: install snippet (OrigamCode + copy button) a été supprimé de la section
    // CTA lors du rework v5-phase1. La section ne contient plus qu'un <nav> avec
    // deux OrigamBtn ("Get started" + "Read docs"). Les clés i18n home.cta.install /
    // home.cta.copy / home.cta.copied ont été supprimées intentionnellement.

    // ── 6. Sobre computed-style assertions (≥3) ────────────────────────────

    test('Sobre — la section CTA a un <nav> contenant exactement 2 boutons', async ({ page }) => {
        const nav = page.locator('section.home-cta nav.home-cta__actions')
        await expect(nav).toBeVisible()
        const btns = await nav.locator('a, button').count()
        expect(btns).toBe(2)
    })

    test('Sobre — le H2 CTA est à la taille display cta (64px)', async ({ page }) => {
        const title = page.locator('section.home-cta h2.home-cta__title')
        const styles = await title.evaluate(el => {
            const s = getComputedStyle(el)
            return { size: s.fontSize, color: s.color }
        })
        // --origam-font-size---cta = 4rem = 64px
        expect(styles.size).toBe('64px')
        // sobre text---primary = #0A0A0A = rgb(10, 10, 10)
        expect(styles.color).toBe('rgb(10, 10, 10)')
    })

    test('Sobre — le H2 CTA est peint avec la couleur texte-ink', async ({ page }) => {
        const title = page.locator('section.home-cta h2.home-cta__title')
        const color = await title.evaluate(el => getComputedStyle(el).color)
        // sobre text---ink = #0A0A0A = rgb(10, 10, 10)
        expect(color).toBe('rgb(10, 10, 10)')
    })

    // ── 7. No raw i18n key leakage ─────────────────────────────────────────

    test('no raw i18n key appears in the section text', async ({ page }) => {
        const section = page.locator('section.home-cta')
        const text = await section.textContent()
        expect(text).not.toContain('home.cta.')
    })

    // ── 8. No legacy manual-copy artefacts ─────────────────────────────────

    test('no leftover manual copy button (replaced by OrigamCode)', async ({ page }) => {
        await expect(page.locator('[data-cy="cta-copy-btn"]')).toHaveCount(0)
    })
})
