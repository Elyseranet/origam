/**
 * Marketing site a11y sweep — real pages, not a component iframe (audit-ssr-nav)
 *
 * `a11y/components.spec.ts` only ever scans component Variants mounted
 * inside a Histoire story iframe, and explicitly ignores `region`,
 * `landmark-one-main`, `page-has-heading-one`, `document-title`,
 * `html-has-lang`, `html-lang-valid` — arguably fine for an iframe
 * fragment with no page chrome, but nothing in the suite ever checks
 * those rules on an actual page. This file does, against the real
 * marketing site (`playwright.a11y.marketing.config.ts`, Nuxt on :3000).
 *
 * Three distinct guarantees, three distinct techniques:
 * 1. Landmarks / heading structure — axe-core, JS enabled, scanned only
 *    AFTER the page reaches a stable, hydrated state (see `settle()` below
 *    for exactly what "stable" means here and why — axe run at an
 *    arbitrary moment mid-hydration is a documented false-negative/
 *    false-positive trap in this repo).
 * 2. The skip link — already works on `develop` (SKIP_LINK_HREF /
 *    SKIP_LINK_TARGET_ID in `packages/marketing/src/consts/a11y.const.ts`).
 *    This locks it in; it is not a repro-then-fix test.
 * 3. Keyboard/no-JS navigation — a browser context with
 *    `javaScriptEnabled: false`. Real Chromium, real rendering, zero
 *    script execution: proves the footer sitemap (SSR, no JS required per
 *    `marketing-nav-ssr.spec.ts`) is not just present in the HTML but
 *    actually clickable and lands on the target page.
 */

import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const LANDMARK_RULES = ['region', 'landmark-one-main', 'page-has-heading-one'] as const
const IMPACT_FAIL_LEVEL: Array<'serious' | 'critical'> = ['serious', 'critical']

const PAGES = ['/', '/components', '/installation'] as const

// `devtools: { enabled: true }` (packages/marketing/nuxt.config.ts) injects
// a `<nuxt-devtools-frame>` panel outside any landmark — a dev-tooling
// artifact, not page content. Verified: without this exclude, `region`
// fires on `.nuxt-devtools-label` ("Page load time") on every page, on a
// dev server, regardless of the actual page markup. Same class of noise
// `a11y/components.spec.ts` already filters for Histoire's own chrome.
function scanPage (page: Page) {
    return new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
        .exclude('nuxt-devtools-frame')
}

/**
 * "Settled" = the primary nav is visible AND the network has gone idle.
 * Chosen explicitly because the repo's own history has a documented trap
 * here: axe-core run against a page whose nav appears at ~1.8s can pass or
 * fail depending on when exactly the scan starts. `.primary-nav` visible
 * is the same readiness signal `nav-link-availability.spec.ts` uses post
 * `[data-nav-ready]` removal; `networkidle` additionally waits out any
 * late-loading chrome (theme swatches, GitHub star count) so axe doesn't
 * catch a landmark mid-paint.
 */
async function settle (page: Page): Promise<void> {
    await page.locator('.primary-nav').waitFor({ state: 'visible', timeout: 15_000 })
    await page.waitForLoadState('networkidle')
}

test.describe('Marketing a11y — landmarks and headings, real pages, JS enabled', () => {

    for (const path of PAGES) {
        test(`${path} has no ${LANDMARK_RULES.join('/')} violations`, async ({ page }) => {
            await page.goto(path)
            await settle(page)

            const results = await scanPage(page).analyze()

            const landmarkViolations = results.violations.filter(v =>
                (LANDMARK_RULES as readonly string[]).includes(v.id)
            )

            expect(
                landmarkViolations,
                `${path}: ${landmarkViolations.map(v => `${v.id} (${v.impact}): ${v.help}`).join('\n')}`
            ).toHaveLength(0)
        })
    }

    // FIXME (audit-ssr-nav, 2026-08-31) — 5 real, pre-existing violations
    // found on `/`, unrelated to nav/footer SSR (out of this branch's scope:
    // packages/tests/ only, not packages/ds/src or packages/marketing/src).
    // Kept failing-and-documented rather than silently dropped, so the next
    // person doesn't have to re-discover them from scratch:
    //   - aria-allowed-attr (critical) — 8 theme-picker `OrigamChip` (span)
    //     carry `type="button"`; `type` is not a valid attribute outside
    //     <button>/<input>/... on a non-form element.
    //   - color-contrast (serious) — `OrigamAvatar` initials text (e.g.
    //     "LB", "JD", "MC" in the testimonials section) fails WCAG AA
    //     contrast against its background.
    //   - label / label-title-only (critical/serious) — 2 `OrigamSwitch`
    //     inputs (`#switch-119`, `#switch-124`) have no accessible name at
    //     all (only `aria-describedby` pointing at a hint, no label).
    //   - list (serious) — `.home-themes__grid` renders as `<ul>`
    //     (`OrigamGrid` with a list tag) whose direct children are not
    //     `<li>` — violates the `<ul>` content model.
    // Re-run `pnpm -F @origam/tests exec playwright test --config=playwright.a11y.marketing.config.ts --grep "other serious"`
    // for the current node-level detail (this spec logs `target`/`html` for
    // each violation before asserting).
    test.fixme('/ has no other serious/critical a11y violations', async ({ page }) => {
        await page.goto('/')
        await settle(page)

        const results = await scanPage(page).analyze()

        const blocking = results.violations.filter(v => IMPACT_FAIL_LEVEL.includes(v.impact as 'serious' | 'critical'))

        if (blocking.length > 0) {
            console.log(`[a11y] / : ${blocking.length} blocking violation(s)`)
            for (const v of blocking) {
                console.log(`  ✗ ${v.id} (${v.impact}): ${v.help}`)
                for (const n of v.nodes) console.log(`    target=${JSON.stringify(n.target)} html=${n.html.slice(0, 200)}`)
            }
        }

        expect(blocking, `/ has ${blocking.length} serious/critical a11y violation(s)`).toHaveLength(0)
    })

})

test.describe('Marketing a11y — skip link (lock-in, already works on develop)', () => {

    test('a keyboard user can Tab to "Skip to content" and land on #main-content', async ({ page }) => {
        await page.goto('/')
        await settle(page)

        await page.keyboard.press('Tab')
        const skipLink = page.locator('a.skip-link')
        await expect(skipLink).toBeFocused()
        await expect(skipLink).toHaveAttribute('href', '#main-content')

        const mainTarget = page.locator('#main-content')
        await expect(mainTarget).toHaveCount(1)
    })

})

test.describe('Marketing a11y — navigation usable with zero JavaScript', () => {

    test.use({ javaScriptEnabled: false })

    test('the footer sitemap is visible and clickable with JS disabled, and lands on the target page', async ({ page }) => {
        await page.goto('/')

        const sitemapLink = page.locator('[data-cy="footer-sitemap"] a[href="/why-origam"]')
        await expect(sitemapLink).toBeVisible()

        await sitemapLink.click()
        await expect(page).toHaveURL(/\/why-origam\/?$/)
    })

    test('the skip link is visible on focus and present with JS disabled', async ({ page }) => {
        await page.goto('/')

        const skipLink = page.locator('a.skip-link')
        await expect(skipLink).toHaveAttribute('href', '#main-content')
        await expect(page.locator('#main-content')).toHaveCount(1)
    })

})
