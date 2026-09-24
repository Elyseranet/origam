/**
 * Theme Builder (/theming) — viewport-height regression.
 *
 * `.theming` used to clamp its height to `calc(100vh - appbar)` with
 * internal `overflow: hidden` / `overflow-y: auto` zones (nav list, props
 * panel, generated-code block). A first fix (#233) only relaxed the clamp
 * below a `@media (max-height: 50rem)` (800px) threshold — insufficient:
 * proven broken again at the user's real viewport (1512×829, just above the
 * threshold), where `.tb-nav__scroll` was still clamped to 222px against
 * 1013px of content.
 *
 * Corrected fix: the height clamp and every internal `overflow: hidden` /
 * `overflow-y: auto` zone are removed UNCONDITIONALLY — no media-height
 * threshold. `.theming` always grows to its natural content height (only a
 * `min-height` floor remains, so short content still fills the viewport)
 * and the whole page scrolls. This spec asserts no-clipping at every
 * viewport, including the ones that broke the previous threshold-based fix.
 *
 * Prérequis : serveur marketing :3000 + base docs seedée.
 * Run : cd packages/tests && node_modules/.bin/playwright test \
 *         --config=playwright.marketing.config.ts marketing-theming-viewport-height
 */

import { expect, test, type Page } from '@playwright/test'
import { requireMarketingDb } from './_support/require-marketing-db'

// #835 — voir marketing-theme-builder.spec.ts pour le contexte complet.
requireMarketingDb()

const VIEWPORTS = [
    { width: 2560, height: 1400, label: '2560x1400' },
    { width: 1512, height: 829, label: '1512x829' },
    { width: 1440, height: 900, label: '1440x900' },
    { width: 1280, height: 720, label: '1280x720' },
    { width: 1024, height: 640, label: '1024x640' }
]

interface IBoxMetrics {
    height: number
    scrollHeight: number
    overflowY: string
}

async function boxMetrics (page: Page, selector: string): Promise<IBoxMetrics | null> {
    return page.locator(selector).evaluate((el) => {
        const rect = el.getBoundingClientRect()
        const cs = getComputedStyle(el)
        return {
            height: Math.round(rect.height),
            scrollHeight: el.scrollHeight,
            overflowY: cs.overflowY
        }
    }).catch(() => null)
}

async function gotoTheming (page: Page): Promise<void> {
    await page.goto('/theming')
    await page.waitForLoadState('networkidle')
}

test.describe('Theme Builder · viewport-height clipping', () => {
    for (const viewport of VIEWPORTS) {
        test(`no clipped content at ${viewport.label} — nav, panel and generated code fully reachable`, async ({ page }) => {
            await page.setViewportSize({ width: viewport.width, height: viewport.height })
            await gotoTheming(page)

            const nav = page.locator('[data-cy="theming-nav"]')
            const panel = page.locator('[data-cy="theming-controls-panel"]')
            const output = page.locator('[data-cy="theming-output"]')
            const generatedCode = page.locator('[data-cy="theming-generated-code"]')

            await expect(nav).toBeVisible()
            await expect(panel).toBeVisible()
            await expect(output).toBeVisible()
            await expect(generatedCode).toBeVisible()

            const navFooter = page.locator('.tb-nav__footer')
            await expect(navFooter).toBeVisible()
            await navFooter.scrollIntoViewIfNeeded()
            await expect(navFooter).toBeInViewport()

            const activeCategoryItems = page.locator('.tb-nav__cat--open .tb-nav__item')
            const activeItemCount = await activeCategoryItems.count()
            if (activeItemCount > 0) {
                const lastActiveItem = activeCategoryItems.last()
                await lastActiveItem.scrollIntoViewIfNeeded()
                await expect(lastActiveItem).toBeInViewport()
            }

            await generatedCode.scrollIntoViewIfNeeded()
            await expect(generatedCode).toBeInViewport()

            for (const selector of ['.tb-nav__scroll', '.tb-panel__scroll', '.theming__output-code', '.theming']) {
                const metrics = await boxMetrics(page, selector)
                if (!metrics) continue
                expect(
                    metrics.height,
                    `${selector} must not clip its content at ${viewport.label} (scrollHeight=${metrics.scrollHeight}, height=${metrics.height})`
                ).toBeGreaterThanOrEqual(metrics.scrollHeight)
                expect(
                    metrics.overflowY,
                    `${selector} must never clamp with an internal scrollbar at ${viewport.label} — the page scrolls as a whole`
                ).not.toBe('auto')
            }
        })

        test(`props panel color select is not clipped at its edge — ${viewport.label}`, async ({ page }) => {
            await page.setViewportSize({ width: viewport.width, height: viewport.height })
            await gotoTheming(page)

            const colorRow = page.locator('[data-cy="theming-prop-color"]').first()
            if (await colorRow.count() === 0) {
                test.skip(true, 'no color control rendered for the default component entry')
            }

            const colorGroup = page.locator('details:has([data-cy="theming-prop-color"])').first()
            const isOpen = await colorGroup.evaluate(el => el.hasAttribute('open'))
            if (!isOpen) {
                await colorGroup.locator('summary').first().click()
            }

            await colorRow.scrollIntoViewIfNeeded()
            await expect(colorRow).toBeInViewport()

            const box = await colorRow.boundingBox()
            expect(box).not.toBeNull()
            expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width)
        })
    }

    test('the page grows past a short viewport and scrolls as a whole (no fixed-height trap)', async ({ page }) => {
        await page.setViewportSize({ width: 1512, height: 829 })
        await gotoTheming(page)

        const bodyMetrics = await boxMetrics(page, 'body')
        expect(bodyMetrics).not.toBeNull()
        expect(
            bodyMetrics!.scrollHeight,
            'the page must be scrollable — the theming content is taller than the 829px viewport and must not be clamped'
        ).toBeGreaterThan(829)

        const theming = page.locator('.theming')
        const themingHeight = await theming.evaluate(el => getComputedStyle(el).height)
        expect(themingHeight).not.toBe('auto')
    })
})
