/**
 * home-showcase.spec.ts — T5 HomeShowcase section
 *
 * Asserts:
 * 1. The <section> renders with aria-labelledby="showcase-title".
 * 2. Eyebrow <p> contains the i18n fallback "SHOWCASE".
 * 3. <h2> title is present and non-empty.
 * 4. "View all" link points to /components.
 * 5. Data table is rendered with exactly 5 rows (tbody > tr).
 * 6. Data table headers contain Name, Owner, Status columns.
 * 7. Sparkline chart SVG is present.
 * 8. Exactly 3 switch inputs are rendered.
 * 9. Exactly 6 chip elements are rendered.
 * 10. AvatarGroup is rendered with at least one avatar.
 * 11. No raw i18n key leaks into the section text.
 * 12. Basic a11y: section landmark has an accessible name.
 *
 * Prerequisites: marketing dev server at http://localhost:3000 (or
 * MARKETING_BASE_URL env var). Run with:
 *   pnpm -F @origam/tests playwright test --config=playwright.marketing.config.ts
 *   e2e/home-showcase.spec.ts
 */

import { expect, test } from '@playwright/test'

test.describe('HomeShowcase section', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/', { waitUntil: 'networkidle' })
    })

    // ── 1. Section presence & labelling ───────────────────────────────────

    test('section has aria-labelledby pointing to h2#showcase-title', async ({ page }) => {
        const section = page.locator('section.home-showcase')
        await expect(section).toBeVisible()
        await expect(section).toHaveAttribute('aria-labelledby', 'showcase-title')

        const h2 = page.locator('#showcase-title')
        await expect(h2).toBeVisible()
    })

    // ── 2. Eyebrow ─────────────────────────────────────────────────────────

    test('eyebrow <p> renders i18n text "SHOWCASE"', async ({ page }) => {
        const eyebrow = page.locator('section.home-showcase p.home-showcase__eyebrow')
        await expect(eyebrow).toBeVisible()
        await expect(eyebrow).toContainText('SHOWCASE')
    })

    // ── 3. H2 title ────────────────────────────────────────────────────────

    test('h2 title is a non-empty <h2> element', async ({ page }) => {
        // OrigamTitle renders the <h2> and now carries the aria-target `id`
        // on that <h2> root directly (DS fix).
        const h2 = page.locator('section.home-showcase h2#showcase-title')
        await expect(h2).toBeVisible()
        const text = await h2.textContent()
        expect(text?.trim().length).toBeGreaterThan(0)
    })

    // ── 4. View all link ───────────────────────────────────────────────────

    test('"View all" link points to /components', async ({ page }) => {
        const link = page.locator('section.home-showcase a[data-cy="showcase-view-all"]')
        await expect(link).toBeVisible()
        await expect(link).toHaveAttribute('href', '/components')
        const text = await link.textContent()
        expect(text?.trim().length).toBeGreaterThan(0)
    })

    // ── 5. Data table — 5 rows ─────────────────────────────────────────────

    test('data table renders exactly 5 data rows', async ({ page }) => {
        const table = page.locator('[data-cy="showcase-data-table"]')
        await expect(table).toBeVisible()

        const rows = table.locator('tbody tr')
        await expect(rows).toHaveCount(5)
    })

    // ── 6. Data table headers ──────────────────────────────────────────────

    test('data table headers contain Project, Owner and Status columns', async ({ page }) => {
        const table = page.locator('[data-cy="showcase-data-table"]')
        await expect(table).toContainText('PROJECT')
        await expect(table).toContainText('Owner')
        await expect(table).toContainText('Status')
    })

    // ── 7. Data table content — known row values ───────────────────────────

    test('data table contains expected row data', async ({ page }) => {
        const table = page.locator('[data-cy="showcase-data-table"]')
        await expect(table).toContainText('Aurora release')
        await expect(table).toContainText('Arnaud')
        await expect(table).toContainText('Tokens v2')
        await expect(table).toContainText('Léa')
        await expect(table).toContainText('A11y audit')
        await expect(table).toContainText('Chart engine')
        await expect(table).toContainText('New theme')
    })

    // ── 8. Sparkline chart ─────────────────────────────────────────────────

    test('sparkline SVG is rendered inside the chart widget', async ({ page }) => {
        const sparkline = page.locator('[data-cy="showcase-sparkline"]')
        await expect(sparkline).toBeVisible()

        const svg = sparkline.locator('svg')
        await expect(svg).toBeVisible()
    })

    // ── 9. Switch — 2 variants (OFF + ON) ─────────────────────────────────

    test('renders exactly 2 switch inputs (off + on)', async ({ page }) => {
        const switches = page.locator('section.home-showcase input[type="checkbox"]')
        await expect(switches).toHaveCount(2)
    })

    // ── 10. Chips — 3 visible intents (Primary, Neutral, Success) ──────────

    test('renders exactly 3 chips inline', async ({ page }) => {
        const chips = page.locator('[data-cy="showcase-chip-group"] .origam-chip')
        await expect(chips).toHaveCount(3)
    })

    test('chip intents Primary, Neutral and Success are rendered', async ({ page }) => {
        const chipGroup = page.locator('[data-cy="showcase-chip-group"]')
        await expect(chipGroup).toBeVisible()
        await expect(chipGroup).toContainText('Primary')
        await expect(chipGroup).toContainText('Neutral')
        await expect(chipGroup).toContainText('Success')
    })

    // ── 11. Avatar group ───────────────────────────────────────────────────

    test('avatar group renders with visible avatars', async ({ page }) => {
        const group = page.locator('[data-cy="showcase-avatar-group"]')
        await expect(group).toBeVisible()

        const avatars = group.locator('.origam-avatar')
        const count = await avatars.count()
        expect(count).toBeGreaterThanOrEqual(1)
    })

    // ── 12. Grid semantic list ─────────────────────────────────────────────

    test('showcase grid is a <ul> containing <li> items', async ({ page }) => {
        const list = page.locator('section.home-showcase ul.home-showcase__grid')
        await expect(list).toBeVisible()

        const items = list.locator('li.home-showcase__item')
        const count = await items.count()
        expect(count).toBeGreaterThanOrEqual(5)
    })

    // ── 13. No raw i18n key leakage ────────────────────────────────────────

    test('no raw i18n key appears in the section text', async ({ page }) => {
        const section = page.locator('section.home-showcase')
        const text = await section.textContent()
        expect(text).not.toContain('home.showcase.')
    })
})

/**
 * AvatarGroup theming — regression coverage for issue #263.
 *
 * Bug A: `OrigamAvatarGroup` used to forward EVERY visual-token prop
 * unconditionally into the `'origam-avatar'` slot defaults it provides to
 * its children, clobbering an ancestor/theme `'origam-avatar'` default
 * (e.g. `border: true`) with an unset `false`/`undefined` value. Fixed by
 * only forwarding a prop when `usePassedProps()` confirms the CONSUMER
 * actually set it.
 *
 * Bug B: the "+24 members" widget hardcoded
 * `--origam-avatar---box-shadow: 0 0 0 2px surface-raised` directly in
 * `HomeShowcase.vue`, unconditionally overriding each avatar's own themed
 * `box-shadow` (e.g. cartoon's `3px 3px 0 #171717` hard-shadow signature).
 * Fixed by moving the stacked-avatar separation ring into the DS itself as
 * an `outline` (a distinct CSS property, so it never collides with
 * `box-shadow`) driven by dedicated `--origam-avatar-group__item---outline-*`
 * cssVars, and removing the marketing-side hack.
 *
 * #1515 — the site always renders `origam`: the per-brand cases (glass, cartoon,
 * geek) are gone with the brand switcher; a brand now lives in sub-trees only.
 *
 * These tests drive the theme via the `origam-theme`/`origam-mode` cookies
 * BEFORE navigation (cold load) — the live in-page theme-switch UI does not
 * re-run the client plugin's per-component `_defaultsRef` watcher (a
 * separate, pre-existing bug unrelated to #263), so a post-navigation click
 * would not reliably exercise the props-based theme defaults this ticket
 * fixes.
 */
test.describe('HomeShowcase — AvatarGroup theming (#263)', () => {
    const gotoWithTheme = async (
        page: import('@playwright/test').Page,
        baseURL: string | undefined,
        theme: string,
        mode: 'light' | 'dark'
    ) => {
        await page.context().addCookies([
            { name: 'origam-theme', value: theme, url: baseURL },
            { name: 'origam-mode', value: mode, url: baseURL }
        ])
        await page.goto('/', { waitUntil: 'networkidle' })
    }

    const firstGroupItem = (page: import('@playwright/test').Page) =>
        page.locator('[data-cy="showcase-avatar-group"] .origam-avatar-group__item').first()

    test('baseline theme ("origam"): no border, but the separation ring is present (zero regression)', async ({ page, baseURL }) => {
        await gotoWithTheme(page, baseURL, 'origam', 'light')
        const item = firstGroupItem(page)
        await expect(item).toBeVisible()

        const style = await item.evaluate((el) => {
            const cs = getComputedStyle(el)
            return { borderWidth: cs.borderWidth, outlineWidth: cs.outlineWidth, outlineStyle: cs.outlineStyle }
        })
        expect(style.borderWidth).toBe('0px')
        expect(style.outlineWidth).toBe('2px')
        expect(style.outlineStyle).toBe('solid')
    })
})
