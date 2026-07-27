/**
 * Theme Builder (/theming) — themed background full-height, rich-control
 * trigger legibility, sticky preview (lot A/B/C, follow-up to #235).
 *
 * Once #235 removed the `.theming` viewport-height clamp, three problems
 * surfaced under brand themes with bold visual identities (cartoon: 3px
 * borders, chunky `rounded: lg` everywhere):
 *
 * A — the themed page background was painted by `body`, but body's own
 *     layout box stayed capped at `100vh` because an ANCESTOR
 *     (`.origam-layout--full-height .origam-layout__wrapper`, a DS class)
 *     was hard `height: 100vh` — not `min-height`. Content overflowing
 *     past that box still rendered (nothing clipped), but nothing painted
 *     a background under it, revealing the default marketing gradient.
 *     Fix: at the source, in the DS (PR #237) — OrigamLayout full-height
 *     is now `min-height: 100vh` ("at least one screen", a floor, not a
 *     ceiling). No marketing-side override.
 *
 * B — the 5 rich-control triggers (Color/Rounded/Elevation/Border/Box
 *     model, `ThemeBuilderControlTrigger.vue`) rendered as `<origam-btn
 *     size="x-small">` — a hard 20px DS height. Under cartoon's 3px
 *     border + the trigger's own 11px font/1.5 line-height, the content
 *     box was ~12px tall: too short, so label text visually overflowed/
 *     clipped. The neighbouring plain `<origam-select>` rows don't pin a
 *     `size`, so they absorb the thicker border gracefully. Fix: trigger
 *     now uses `size="small"` (28px), matching the select rows' height.
 *
 * C — user request: once the page scrolls as a whole, the center preview
 *     column should stay visible while scrolling through the (often much
 *     taller) nav/props columns, instead of scrolling out of view. Fix:
 *     `.theming__col--center` is `position: sticky` (offset = app-bar
 *     height) with a `max-height` + `overflow-y: auto` safety valve for
 *     the (rare) case where the preview itself exceeds viewport height —
 *     CSS-only, no JS, and no clamp on naturally-short previews (sticky
 *     only pins position, it never forces height).
 *
 * Prérequis : serveur marketing :3000 + base docs seedée.
 * Run : cd packages/tests && node_modules/.bin/playwright test \
 *         --config=playwright.marketing.config.ts marketing-theming-theme-bg-and-triggers
 */

import { expect, test, type Page } from '@playwright/test'

const BRAND_THEMES = ['cartoon', 'glass', 'geek', 'sobre'] as const

async function applyBrand (page: Page, theme: string): Promise<void> {
    await page.context().addCookies([
        { name: 'origam-theme', value: theme, url: 'http://localhost:3000' },
        { name: 'origam-mode', value: 'light', url: 'http://localhost:3000' }
    ])
}

async function expandControlGroups (page: Page, ids: string[]): Promise<void> {
    for (const id of ids) {
        const group = page.locator(`[data-cy="theming-prop-group-${id}"]`)
        if (await group.count() === 0) continue
        const isOpen = await group.evaluate(el => el.hasAttribute('open'))
        if (!isOpen) await group.locator('summary').first().click({ timeout: 3000 }).catch(() => {})
    }
}

test.describe('Theme Builder · lot A — themed background covers the full page height', () => {
    for (const theme of BRAND_THEMES) {
        test(`body's background box matches its scrollHeight under ${theme} at 1512x829`, async ({ page }) => {
            await page.setViewportSize({ width: 1512, height: 829 })
            await applyBrand(page, theme)
            await page.goto('/theming')
            await page.waitForLoadState('networkidle')
            await page.waitForTimeout(400)

            const metrics = await page.evaluate(() => {
                const body = document.body
                const rect = body.getBoundingClientRect()
                return { boxHeight: Math.round(rect.height), scrollHeight: body.scrollHeight }
            })

            expect(
                metrics.boxHeight,
                `body must grow to its full content height under ${theme} — ` +
                `boxHeight=${metrics.boxHeight} vs scrollHeight=${metrics.scrollHeight} ` +
                '(a shorter box means the themed background stops short and the default gradient shows through)'
            ).toBeGreaterThanOrEqual(metrics.scrollHeight - 2)
        })

        test(`.origam-layout__wrapper is not clamped to the viewport height under ${theme}`, async ({ page }) => {
            await page.setViewportSize({ width: 1512, height: 829 })
            await applyBrand(page, theme)
            await page.goto('/theming')
            await page.waitForLoadState('networkidle')
            await page.waitForTimeout(400)

            const wrapper = page.locator('.origam-layout__wrapper')
            const metrics = await wrapper.evaluate(el => ({
                height: Math.round(el.getBoundingClientRect().height),
                scrollHeight: el.scrollHeight
            }))

            expect(
                metrics.height,
                `.origam-layout--full-height wrapper must grow with its content under ${theme}, not stay ` +
                `clamped to the viewport (height=${metrics.height} vs scrollHeight=${metrics.scrollHeight})`
            ).toBeGreaterThanOrEqual(metrics.scrollHeight - 2)
        })
    }
})

/**
 * Lot B/D UPDATE (#294) — the 5 rich-control POPOVERS (Color/Rounded/
 * Elevation/Border/Box model) were removed. Color/Rounded/Elevation/Border
 * now render their named-value picker as a plain inline `<origam-select>` —
 * the EXACT SAME component the "neighbouring generic select" rows already
 * used (`density`, `variant`, …), not a bespoke text-field-based trigger.
 * The historical parity concern (does the trigger's chrome match the
 * select rows'?) is therefore resolved structurally: there is only one
 * component family left. `[data-cy="theming-prop-{prop}-trigger"]` no
 * longer exists for these 4 controls — only Box model still opens a
 * popover (out of scope for #294) and keeps its own trigger markup.
 */
test.describe('Theme Builder · lot B — Color/Rounded/Elevation/Border render as plain inline selects (no popover)', () => {
    for (const theme of ['cartoon', 'sobre'] as const) {
        test(`color select height is within the panel's select-row range and value is not clipped — ${theme}`, async ({ page }) => {
            await page.setViewportSize({ width: 1512, height: 829 })
            await applyBrand(page, theme)
            await page.goto('/theming')
            await page.waitForLoadState('networkidle')
            await expandControlGroups(page, ['color', 'size-density'])
            await page.waitForTimeout(300)

            const metrics = await page.evaluate(() => {
                const colorSelect = document.querySelector('[data-cy="theming-prop-color-select"]')
                const densitySelect = document.querySelector('[data-cy="theming-prop-density-select"], .tb-row__select')
                if (!colorSelect || !densitySelect) return null
                const cr = colorSelect.getBoundingClientRect()
                const dr = densitySelect.getBoundingClientRect()
                return { colorHeight: Math.round(cr.height), otherSelectHeight: Math.round(dr.height) }
            })

            expect(metrics).not.toBeNull()
            expect(
                Math.abs(metrics!.colorHeight - metrics!.otherSelectHeight),
                `color select (${metrics!.colorHeight}px) must be visually consistent with the other select rows ` +
                `(${metrics!.otherSelectHeight}px) under ${theme}`
            ).toBeLessThanOrEqual(10)

            const colorSelect = page.locator('[data-cy="theming-prop-color-select"]')
            await expect(colorSelect).toBeVisible()

            const anyTrigger = page.locator('[data-cy="theming-prop-color-trigger"], [data-cy="theming-prop-rounded-trigger"]')
            await expect(anyTrigger).toHaveCount(0)
        })
    }
})

test.describe('Theme Builder · lot D — Color select chrome matches the Rounded select chrome (both are `<origam-select>`)', () => {
    const THEMES = ['cartoon', 'glass', 'geek', 'sobre'] as const
    const MODES = ['light', 'dark'] as const

    for (const theme of THEMES) {
        for (const mode of MODES) {
            test(`color select chrome == rounded select chrome — ${theme}/${mode}`, async ({ page }) => {
                await page.setViewportSize({ width: 1512, height: 829 })
                await page.context().addCookies([
                    { name: 'origam-theme', value: theme, url: 'http://localhost:3000' },
                    { name: 'origam-mode', value: mode, url: 'http://localhost:3000' }
                ])
                await page.goto('/theming')
                await page.waitForLoadState('networkidle')
                await expandControlGroups(page, ['color', 'shape'])
                await page.waitForTimeout(300)

                const chrome = await page.evaluate(() => {
                    const measure = (sel: string) => {
                        const el = document.querySelector(sel)
                        if (!el) return null
                        const cs = getComputedStyle(el)
                        const r = el.getBoundingClientRect()
                        return {
                            height: Math.round(r.height),
                            borderRadius: cs.borderRadius,
                            borderWidth: cs.borderWidth,
                            backgroundColor: cs.backgroundColor
                        }
                    }
                    return {
                        colorSelect: measure('[data-cy="theming-prop-color-select"] .origam-field'),
                        roundedSelect: measure('[data-cy="theming-prop-rounded-select"] .origam-field')
                    }
                })

                expect(chrome.colorSelect, 'color select .origam-field not found').not.toBeNull()
                expect(chrome.roundedSelect, 'rounded select .origam-field not found').not.toBeNull()

                expect(chrome.roundedSelect!.height, `height — ${theme}/${mode}`).toBe(chrome.colorSelect!.height)
                expect(chrome.roundedSelect!.borderRadius, `border-radius — ${theme}/${mode}`).toBe(chrome.colorSelect!.borderRadius)
                expect(chrome.roundedSelect!.borderWidth, `border-width — ${theme}/${mode}`).toBe(chrome.colorSelect!.borderWidth)
                expect(chrome.roundedSelect!.backgroundColor, `background — ${theme}/${mode}`).toBe(chrome.colorSelect!.backgroundColor)
            })
        }
    }
})

test.describe('Theme Builder · lot C — preview stays visible while scrolling the controls', () => {
    test('preview column is still in the viewport after scrolling deep into the props panel', async ({ page }) => {
        await page.setViewportSize({ width: 1512, height: 829 })
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')

        await expandControlGroups(page, [
            'color', 'size-density', 'shape', 'border', 'elevation',
            'dimensions', 'states', 'icons', 'link-tag', 'other'
        ])
        await page.waitForTimeout(300)

        const bodyBottom = await page.evaluate(() => {
            const body = document.querySelector('.theming__body')
            return body ? body.getBoundingClientRect().bottom + window.scrollY : 0
        })
        expect(bodyBottom).toBeGreaterThan(0)

        await page.evaluate((y) => window.scrollTo(0, y - 850), bodyBottom)
        await page.waitForTimeout(400)

        const preview = page.locator('.theming__col--center')
        await expect(preview).toBeInViewport()

        const previewPosition = await preview.evaluate(el => getComputedStyle(el).position)
        expect(previewPosition).toBe('sticky')
    })

    test('sticky preview does not clamp naturally short content (no forced height at page load)', async ({ page }) => {
        await page.setViewportSize({ width: 1512, height: 829 })
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(400)

        const metrics = await page.evaluate(() => {
            const el = document.querySelector('.theming__col--center')
            if (!el) return null
            const cs = getComputedStyle(el)
            const r = el.getBoundingClientRect()
            return { height: Math.round(r.height), scrollHeight: el.scrollHeight, maxHeight: cs.maxHeight }
        })

        expect(metrics).not.toBeNull()
        expect(
            metrics!.height,
            'a naturally short preview must not be stretched/clamped to its max-height ceiling'
        ).toBeLessThan(600)
        expect(metrics!.height).toBeGreaterThanOrEqual(metrics!.scrollHeight - 2)
    })
})
