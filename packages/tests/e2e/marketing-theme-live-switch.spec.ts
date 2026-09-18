/**
 * Live theme switch — component PROPS follow the brand/mode change without
 * a reload (#275).
 *
 * Root cause: a consuming app can alias the DS's Nuxt module to *source*
 * (dev-mode convenience/HMR) while every other DS import resolves to the
 * *compiled* package export — two different files on disk, hence two
 * independent module instances of `theme.composable.ts`, each with its own
 * `_theme`/`_mode` singleton. `setTheme()` called through the instance the
 * header's theme switcher uses never notified the Nuxt plugin's watcher
 * (living on the OTHER instance), which is what reassigns `_defaultsRef`
 * (component default PROPS driven by `theme.components`). Symptom: cssVars
 * (plain CSS cascade, `data-theme` attribute — nothing to do with this
 * module) kept updating live, but any prop resolved through `useDefaults()`
 * (`rounded`, `elevation`, `border`, …) froze on the theme active at initial
 * load until a full reload re-seeded both instances from the same cookie.
 *
 * Fix: the singleton now anchors on `globalThis` on the client, surviving
 * module duplication regardless of its exact cause.
 *
 * ⛔ Re-opened 2026-09-18, then re-measured and closed again: the box-shadow
 * assertion below used to read `document.querySelector('.origam-btn')` —
 * the FIRST `.origam-btn` in DOM order on this page, which is a header NAV
 * LINK ("Introduction") rendered with an EXPLICIT `variant="text"`. A
 * text-variant button structurally renders `box-shadow: none` (see
 * `OrigamBtn.vue`'s scoped SCSS, `&--variant-text { box-shadow: none; }`),
 * by design, for EVERY brand — the assertion was measuring a button that
 * can never show elevation, regardless of whether the live-switch mechanism
 * works. Verified against the SAME commit with a DOM enumeration of all 23
 * `.origam-btn` instances on the homepage after a live switch to `cartoon`:
 * every ACTUAL outlined button (unmodified `variant`, e.g. the theme
 * switcher trigger itself) correctly shows `rgb(23, 23, 23) 3px 3px 0px 0px`
 * — the cartoon signature shadow — and reverts correctly on switching away.
 * The mechanism was never broken; the selector was. Now targets the theme
 * switcher trigger button itself (`data-cy="theme-switcher-trigger"`,
 * `packages/marketing/src/layouts/default.vue`), which never has an explicit
 * `variant`/`rounded`/`elevation` override, so its box-shadow / border-radius
 * are driven ENTIRELY by the active theme's `origam-btn` defaults — a stable,
 * unambiguous target for this assertion (also used to trigger the switch, so
 * click target and measurement target are the same element).
 *
 * Prerequisites: marketing dev server (or MARKETING_BASE_URL env var). Run:
 *   pnpm -F @origam/tests playwright test --config=playwright.marketing.config.ts
 *   e2e/marketing-theme-live-switch.spec.ts
 */

import { expect, test } from '@playwright/test'

const THEME_TRIGGER_SELECTOR = '[data-cy="theme-switcher-trigger"]'

async function switchThemeLive (page: import('@playwright/test').Page, key: string): Promise<void> {
    await page.locator(THEME_TRIGGER_SELECTOR).click()
    await page.locator(`[data-cy="theme-menu-${key}"]`).click()
    // Let the reactive watcher chain (theme ref -> resolvedMode computed ->
    // Nuxt plugin watcher -> _defaultsRef reassignment -> useDefaults()
    // computeds -> re-render) settle. No reload anywhere in this test.
    await page.waitForTimeout(400)
}

test.describe('Live theme switch — props follow the switch, not just cssVars (#275)', () => {
    test.beforeEach(async ({ page }) => {
        await page.context().addCookies([
            { name: 'origam-theme', value: 'sobre', url: 'http://localhost:3000' },
            { name: 'origam-mode', value: 'light', url: 'http://localhost:3000' }
        ])
        await page.goto('/')
        await page.waitForLoadState('networkidle')
    })

    test('switching brand via the header updates a props-driven style (border-radius) without reload', async ({ page }) => {
        const before = await page.evaluate((sel) => {
            const btn = document.querySelector(sel)
            return btn ? getComputedStyle(btn).borderRadius : null
        }, THEME_TRIGGER_SELECTOR)
        expect(before).not.toBeNull()

        await switchThemeLive(page, 'cartoon')

        const after = await page.evaluate((sel) => {
            const btn = document.querySelector(sel)
            return {
                borderRadius: btn ? getComputedStyle(btn).borderRadius : null,
                dataTheme: document.documentElement.getAttribute('data-theme')
            }
        }, THEME_TRIGGER_SELECTOR)

        expect(after.dataTheme, 'data-theme attribute must reflect the click immediately').toBe('cartoon')
        expect(
            after.borderRadius,
            'border-radius (driven by the `rounded` prop, resolved through useDefaults()) must change once the theme switch propagates to _defaultsRef — if it stays equal to the value before the click, the plugin watcher is not reaching the same theme singleton the header switcher uses'
        ).not.toBe(before)
    })

    test('switching brand via the header updates a props-driven box-shadow (elevation/shadow) without reload', async ({ page }) => {
        await switchThemeLive(page, 'cartoon')
        const cartoonShadow = await page.evaluate((sel) => {
            const btn = document.querySelector(sel)
            return btn ? getComputedStyle(btn).boxShadow : null
        }, THEME_TRIGGER_SELECTOR)
        // Cartoon's signature hard offset shadow (rgb(23,23,23) 3px 3px 0 0) —
        // a prop-driven value, distinct per theme, unrelated to any cssVar
        // that would update regardless of this bug.
        expect(cartoonShadow).not.toBe('none')
        expect(cartoonShadow).toContain('3px 3px 0px 0px')

        await switchThemeLive(page, 'geek')
        const geekShadow = await page.evaluate((sel) => {
            const btn = document.querySelector(sel)
            return btn ? getComputedStyle(btn).boxShadow : null
        }, THEME_TRIGGER_SELECTOR)
        expect(geekShadow, 'switching again must produce a DIFFERENT prop-driven shadow, not the cartoon one stuck from the previous click').not.toBe(cartoonShadow)
    })

    test('switching back to the original brand restores its original props-driven style', async ({ page }) => {
        const original = await page.evaluate((sel) => {
            const btn = document.querySelector(sel)
            return btn ? getComputedStyle(btn).borderRadius : null
        }, THEME_TRIGGER_SELECTOR)

        await switchThemeLive(page, 'cartoon')
        await switchThemeLive(page, 'geek')
        await switchThemeLive(page, 'sobre')

        const restored = await page.evaluate((sel) => {
            const btn = document.querySelector(sel)
            return btn ? getComputedStyle(btn).borderRadius : null
        }, THEME_TRIGGER_SELECTOR)

        expect(restored).toBe(original)
    })
})
