/**
 * home-themes.spec.ts — T6 HomeThemes section
 *
 * Asserts:
 * 1. The <section> renders with aria-labelledby="themes-title".
 * 2. Eyebrow <p> contains the i18n value "THEMING".
 * 3. <h2> title is present and non-empty.
 * 4. No brand chip is rendered any more (#1515).
 * 5. Exactly 4 preview tiles are rendered.
 * 6. Both tooling mentions (tokens.studio / Style Dictionary v4) are visible.
 * 7. No raw i18n key leakage.
 *
 * Prerequisites: marketing dev server at http://localhost:3000 (or
 * MARKETING_BASE_URL env var). Run with:
 *   pnpm -F @origam/tests playwright test --config=playwright.marketing.config.ts
 *   e2e/home-themes.spec.ts
 */

import { expect, test } from '@playwright/test'

test.describe('HomeThemes section', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/', { waitUntil: 'load' })
    })

    // ── 1. Section presence & labelling ───────────────────────────────────

    test('section has aria-labelledby pointing to h2#themes-title', async ({ page }) => {
        const section = page.locator('section.home-themes')
        await expect(section).toBeVisible()
        await expect(section).toHaveAttribute('aria-labelledby', 'themes-title')

        const h2 = page.locator('#themes-title')
        await expect(h2).toBeVisible()
    })

    // ── 2. Eyebrow ─────────────────────────────────────────────────────────

    test('eyebrow <p> renders i18n text "THEMING"', async ({ page }) => {
        const eyebrow = page.locator('section.home-themes p.home-themes__eyebrow')
        await expect(eyebrow).toBeVisible()
        await expect(eyebrow).toContainText('THEMING')
    })

    // ── 3. H2 title ────────────────────────────────────────────────────────

    test('h2 title is a non-empty <h2> element', async ({ page }) => {
        // OrigamTitle renders the <h2> and now carries the aria-target `id`
        // on that <h2> root directly (DS fix).
        const h2 = page.locator('section.home-themes h2#themes-title')
        await expect(h2).toBeVisible()
        const text = await h2.textContent()
        expect(text?.trim().length).toBeGreaterThan(0)
    })

    test('h2 title contains expected text', async ({ page }) => {
        const h2 = page.locator('section.home-themes h2#themes-title')
        await expect(h2).toContainText('One theme object.')
        await expect(h2).toContainText('One identity per brand.')
    })

    test('la note dit qu\'un seul thème est livré par le paquet npm (#1543)', async ({ page }) => {
        await expect(page.locator('[data-cy="themes-note"]')).toHaveText(
            'The npm package ships the base origam theme. The others are examples, to open in the Theme Builder.'
        )
    })

    // ── 4. #1515 — plus de sélecteur de marque du site ──────────────────────

    test('ne rend plus de chips de marque : le site n\'a plus de sélecteur de thème (#1515)', async ({ page }) => {
        await expect(page.locator('section.home-themes .home-themes__chips')).toHaveCount(0)
        await expect(page.locator('[data-cy^="themes-chip-"]')).toHaveCount(0)
    })

    // ── 5. Exactly 4 preview tiles ─────────────────────────────────────────

    test('renders exactly 4 preview tiles', async ({ page }) => {
        const tiles = page.locator('section.home-themes [data-cy^="themes-preview-"]')
        await expect(tiles).toHaveCount(4)
    })

    // ⛔ Recalés sur `THEME_PREVIEW_TILES`
    // (`packages/marketing/src/consts/themes-showcase.const.ts`), source de
    // vérité de la vitrine.
    //
    // Ces deux tests attendaient `brand-a` / `brand-b` et les libellés
    // `brand-a.json` / `brand-b.json`. La vitrine expose aujourd'hui
    // `light` / `dark` / `cartoon` / `apple`, avec les libellés `light.json`,
    // `dark.json`, `Cartoon`, `Apple` — vérifié dans le HTML servi et dans
    // `en.json`. Le jeu de tuiles est une décision produit curatée : on
    // continue de l'épingler, mais sur ce qui est réellement rendu.
    test('les 4 libellés de tuile de prévisualisation sont visibles', async ({ page }) => {
        const section = page.locator('section.home-themes')
        for (const label of ['light.json', 'dark.json', 'Cartoon', 'Apple']) {
            await expect(section).toContainText(label)
        }
    })

    test('preview tiles have data-cy attributes', async ({ page }) => {
        const tileKeys = ['light', 'dark', 'cartoon', 'apple']
        for (const key of tileKeys) {
            const tile = page.locator(`[data-cy="themes-preview-${key}"]`)
            await expect(tile).toBeVisible()
        }
    })

    test('each preview tile has a Button element', async ({ page }) => {
        const tiles = page.locator('[data-cy^="themes-preview-"]')
        const count = await tiles.count()
        expect(count).toBe(4)

        for (let i = 0; i < count; i++) {
            const tile = tiles.nth(i)
            const btn = tile.locator('.origam-btn')
            await expect(btn).toBeVisible()
        }
    })

    // ── Theming proof: tiles are powered by OrigamThemeProvider, NOT hardcoded
    //    hex — each tile's surface resolves from its own theme's
    //    `--origam-color__surface---default`. Assert ≥2 distinct surfaces.

    // ⛔ Le critère « fonds de surface distincts » ne vaut PLUS pour ce jeu de
    // tuiles, et le garder produisait un faux défaut.
    //
    // La vitrine exposait `light` / `dark` / `brand-a` / `brand-b`, ces deux
    // derniers portant un override de surface explicite (#f5f0e8, #e8f5f0) —
    // d'où l'attente de 3 fonds distincts. Elle expose aujourd'hui `light` /
    // `dark` / `cartoon` / `apple`. Mesuré sur le HTML servi :
    //
    //   light   surface rgb(255,255,255)
    //   dark    surface rgb(10,10,10)
    //   cartoon surface rgb(255,255,255)   ← marque en mode clair : blanc, et c'est correct
    //   apple   surface rgb(255,255,255)   ← idem
    //
    // Une marque en mode clair a légitimement une surface blanche : le fond
    // n'est pas ce qui la distingue. Le theming, lui, EST bien vivant — il se
    // voit ailleurs, mesuré sur le même rendu :
    //
    //   cartoon  bouton border-top-width 1px   (0px sur light)
    //   apple    bouton background rgb(245,245,245)  (transparent sur light)
    //
    // On assert donc ce que « theming is live » veut dire ici : chaque tuile
    // est montée sous SON propre `data-theme`, le couple clair/sombre se
    // distingue bien par la surface, et les quatre tuiles ne rendent pas
    // toutes la même signature visuelle.
    test('preview tiles render distinct theme surfaces (theming is live)', async ({ page }) => {
        const signature = (key: string) =>
            page.locator(`[data-cy="themes-tile-surface-${key}"]`).evaluate((el) => {
                const surface = getComputedStyle(el)
                const btn = el.querySelector('.origam-btn')
                const button = btn ? getComputedStyle(btn) : null
                return {
                    providerTheme: el.closest('[data-theme]')?.getAttribute('data-theme') ?? null,
                    surfaceBg: surface.backgroundColor,
                    buttonBg: button?.backgroundColor ?? null,
                    buttonBorderWidth: button?.borderTopWidth ?? null
                }
            })

        const keys = ['light', 'dark', 'cartoon', 'apple']
        const signatures = []
        for (const key of keys) signatures.push(await signature(key))

        // 1. Chaque tuile est bien montée sous son propre thème.
        for (let i = 0; i < keys.length; i++) {
            expect(
                signatures[i].providerTheme,
                `la tuile "${ keys[i] }" n'est pas montée sous un OrigamThemeProvider portant son thème`
            ).toBe(keys[i])
        }

        // 2. Le couple clair/sombre se distingue par la surface, sur les
        //    valeurs de token attendues.
        // #1514 — papier / encre du brand kit A1.
        expect(signatures[0].surfaceBg).toBe('rgb(247, 245, 239)')
        expect(signatures[1].surfaceBg).toBe('rgb(27, 17, 39)')

        // 3. Les quatre tuiles ne rendent pas toutes la même chose.
        const distinct = new Set(signatures.map(s => JSON.stringify([s.surfaceBg, s.buttonBg, s.buttonBorderWidth])))
        expect(
            distinct.size,
            `les 4 tuiles devraient rendre au moins 3 signatures visuelles distinctes — obtenu ${ JSON.stringify(signatures) }`
        ).toBeGreaterThanOrEqual(3)
    })

    // ── 6. Tooling mentions ────────────────────────────────────────────────
    // En v5-phase1 les tooling mentions sont des <span> dans un <p.home-themes__tooling>,
    // plus des OrigamChip pills avec data-cy. On assert le texte dans la section.

    test('props-first theming mention is visible in the tooling <p>', async ({ page }) => {
        const tooling = page.locator('section.home-themes p.home-themes__tooling')
        await expect(tooling).toBeVisible()
        await expect(tooling).toContainText('props first, whole catalogue')
    })

    test('plain CSS/SCSS tokens mention is visible in the tooling <p> (pipeline Style Dictionary retiré)', async ({ page }) => {
        const tooling = page.locator('section.home-themes p.home-themes__tooling')
        await expect(tooling).toBeVisible()
        await expect(tooling).toContainText('plain CSS/SCSS tokens, no build step')
        await expect(tooling).not.toContainText('Style Dictionary')
    })

    // ── 7. Semantic structure ─────────────────────────────────────────────

    test('preview tiles are rendered inside a <ul> with <li> items', async ({ page }) => {
        const list = page.locator('section.home-themes ul.home-themes__previews')
        await expect(list).toBeVisible()

        const items = list.locator('li.home-themes__preview-item')
        await expect(items).toHaveCount(4)
    })

    test('tooling mentions render as 2 <span> items inside the tooling <p>', async ({ page }) => {
        // En v5-phase1 : plain <span class="home-themes__tooling-item"> dans un <p>,
        // plus des OrigamChip pills avec data-cy.
        const items = page.locator('section.home-themes p.home-themes__tooling .home-themes__tooling-item')
        await expect(items).toHaveCount(2)
    })

    // ── 8. No raw i18n key leakage ─────────────────────────────────────────

    test('no raw i18n key appears in the section text', async ({ page }) => {
        const section = page.locator('section.home-themes')
        const text = await section.textContent()
        expect(text).not.toContain('home.themes.')
    })
})
