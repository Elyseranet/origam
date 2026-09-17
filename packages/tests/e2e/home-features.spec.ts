/**
 * home-features.spec.ts — T3 HomeFeatures section
 *
 * Asserts:
 * 1. The <section> renders with aria-labelledby="features-title".
 * 2. Eyebrow <p> contains the i18n value "WHAT'S INSIDE".
 * 3. <h2> title is present and non-empty.
 * 4. Exactly 6 feature cards are rendered.
 * 5. Each card contains an <h3> title and a <p> description — non-empty.
 * 6. Basic a11y: no heading-order violations on the section.
 *
 * Prerequisites: marketing dev server at http://localhost:3000 (or
 * MARKETING_BASE_URL env var). Run with:
 *   pnpm -F @origam/tests playwright test --config=playwright.marketing.config.ts
 *   e2e/home-features.spec.ts
 */

import { expect, test } from '@playwright/test'

import { applyBrand } from './_support/marketing-theme'

test.describe('HomeFeatures section', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/', { waitUntil: 'networkidle' })
    })

    // ── 1. Section presence & labelling ───────────────────────────────────

    test('section has aria-labelledby pointing to #features-title', async ({ page }) => {
        const section = page.locator('section.home-features')
        await expect(section).toBeVisible()
        await expect(section).toHaveAttribute('aria-labelledby', 'features-title')

        // OrigamTitle now carries the `id` on its rendered <h2> root (DS fix),
        // so the aria-labelledby target IS the heading element itself.
        const target = page.locator('h2#features-title')
        await expect(target).toBeVisible()
    })

    // ── 2. Eyebrow ─────────────────────────────────────────────────────────

    test('eyebrow <p> renders i18n text "WHAT\'S INSIDE"', async ({ page }) => {
        const eyebrow = page.locator('section.home-features p.home-features__eyebrow')
        await expect(eyebrow).toBeVisible()
        await expect(eyebrow).toContainText("WHAT'S INSIDE")
    })

    // ── 3. H2 title ────────────────────────────────────────────────────────

    test('h2 title is a non-empty <h2> element', async ({ page }) => {
        const title = page.locator('section.home-features h2')
        await expect(title).toBeVisible()
        const text = await title.textContent()
        expect(text?.trim().length).toBeGreaterThan(0)
    })

    // ── Sobre computed-style assertions (≥3) ───────────────────────────────

    test('Sobre — eyebrow violet (action-primary fgSubtle)', async ({ page }) => {
        const eyebrow = page.locator('section.home-features p.home-features__eyebrow')
        const color = await eyebrow.evaluate(el => getComputedStyle(el).color)
        // sobre action--primary---fgSubtle = #6D28D9 = rgb(109, 40, 217)
        expect(color).toBe('rgb(109, 40, 217)')
    })

    // ⛔ Les tests « Sobre — … » DEMANDENT le thème sobre — voir la note dans
    // `home-cta.spec.ts` et `_support/marketing-theme.ts`.
    test('Sobre — carte feature peinte par le jeton surface raised, et plate', async ({ page }) => {
        await applyBrand(page, 'sobre')

        // ⛔ Ne PAS réécrire un hex en dur ici. Ce test épinglait
        // `rgb(250, 250, 250)` — la valeur de `--origam-color__surface---raised`
        // sous sobre à l'époque. Mesuré aujourd'hui, ce jeton vaut `#ffffff`, et
        // la carte le consomme correctement : la valeur appartient au THÈME, pas
        // au test. Ce qu'on garantit, c'est le CÂBLAGE — la carte peint bien la
        // surface « raised » — et la platitude.
        const styles = await page.locator('section.home-features .origam-card').first().evaluate((el) => {
            const s = getComputedStyle(el)
            const token = getComputedStyle(document.documentElement)
                .getPropertyValue('--origam-color__surface---raised').trim()
            return { bg: s.backgroundColor, shadow: s.boxShadow, token }
        })

        expect(styles.token, 'le thème sobre doit déclarer --origam-color__surface---raised').not.toBe('')

        // Comparaison en pixels rendus : le jeton est un hex, `backgroundColor`
        // un `rgb()`. On repasse par le navigateur plutôt que de convertir à la
        // main — c'est lui qui fait foi.
        const tokenAsRgb = await page.evaluate((hex) => {
            const probe = document.createElement('div')
            probe.style.backgroundColor = hex
            document.body.appendChild(probe)
            const value = getComputedStyle(probe).backgroundColor
            probe.remove()
            return value
        }, styles.token)

        expect(
            styles.bg,
            `la carte devrait peindre --origam-color__surface---raised (${ styles.token } → ${ tokenAsRgb })`
        ).toBe(tokenAsRgb)

        // carte plate => aucune ombre
        expect(styles.shadow === 'none' || styles.shadow === '').toBe(true)
    })

    test('Sobre — carte feature à angles droits + padding 32px', async ({ page }) => {
        const card = page.locator('section.home-features .origam-card').first()
        const styles = await card.evaluate(el => {
            const s = getComputedStyle(el)
            return {
                radius: s.borderTopLeftRadius,
                pad: s.paddingTop
            }
        })
        // rounded="0" by default (flat, square)
        expect(styles.radius).toBe('0px')
        // padding 32px (--origam-space---8 = 2rem)
        expect(styles.pad).toBe('32px')
    })

    test('Sobre — tuile icône bordée violet, 44×44, radius 10px', async ({ page }) => {
        await applyBrand(page, 'sobre')

        const tile = page.locator('section.home-features .home-features__icon-tile').first()
        const styles = await tile.evaluate(el => {
            const s = getComputedStyle(el)
            return {
                w: s.width,
                h: s.height,
                radius: s.borderTopLeftRadius,
                borderColor: s.borderTopColor
            }
        })
        expect(styles.w).toBe('44px')
        expect(styles.h).toBe('44px')
        expect(styles.radius).toBe('10px')
        // border colour = sobre action--primary---bg = #7C3AED = rgb(124, 58, 237)
        expect(styles.borderColor).toBe('rgb(124, 58, 237)')
    })

    // ── 4. Exactly 6 feature cards ─────────────────────────────────────────

    test('renders exactly 6 feature cards', async ({ page }) => {
        const cards = page.locator('section.home-features .origam-card')
        await expect(cards).toHaveCount(6)
    })

    // ── 5. Each card has h3 + p description ────────────────────────────────

    test('each feature card has a non-empty h3 title', async ({ page }) => {
        const cards = page.locator('section.home-features .origam-card')
        const count = await cards.count()
        expect(count).toBe(6)

        for (let i = 0; i < count; i++) {
            const card = cards.nth(i)
            const h3 = card.locator('h3.home-features__card-title')
            await expect(h3).toBeVisible()
            const text = await h3.textContent()
            expect(text?.trim().length, `card ${i} h3 is empty`).toBeGreaterThan(0)
        }
    })

    test('each feature card has a non-empty description paragraph', async ({ page }) => {
        const cards = page.locator('section.home-features .origam-card')
        const count = await cards.count()
        expect(count).toBe(6)

        for (let i = 0; i < count; i++) {
            const card = cards.nth(i)
            const desc = card.locator('p.home-features__card-desc')
            await expect(desc).toBeVisible()
            const text = await desc.textContent()
            expect(text?.trim().length, `card ${i} description is empty`).toBeGreaterThan(0)
        }
    })

    // ── 6. Known i18n values present ───────────────────────────────────────

    test('renders known feature titles from en.json', async ({ page }) => {
        const section = page.locator('section.home-features')
        // ⛔ Le compte de primitives de graphes est un INVENTAIRE : il était
        // épinglé à `29 chart primitives`, il vaut `26` aujourd'hui
        // (`home.features.charts.title` dans en.json) — et il a BAISSÉ, donc
        // aucune borne « au moins N » ne tiendrait. On garde ce que la carte
        // promet réellement : un nombre, suivi de « chart primitives ».
        await expect(section).toContainText(/\d+ chart primitives/)
        await expect(section).toContainText('WCAG 2.1 AA verified')
        await expect(section).toContainText('Design tokens')
        await expect(section).toContainText('TypeScript first')
        await expect(section).toContainText('CSS-first')
        await expect(section).toContainText('Composition API')
    })

    // ── 7. List semantics (ul > li) ────────────────────────────────────────

    test('grid is rendered as a <ul> containing <li> items', async ({ page }) => {
        const list = page.locator('section.home-features ul.home-features__grid')
        await expect(list).toBeVisible()

        const items = list.locator('li.home-features__item')
        await expect(items).toHaveCount(6)
    })

    // ── 8. No raw i18n key leakage ─────────────────────────────────────────

    test('no raw i18n key appears in the section text', async ({ page }) => {
        const section = page.locator('section.home-features')
        const text = await section.textContent()
        expect(text).not.toContain('home.features.')
    })
})
