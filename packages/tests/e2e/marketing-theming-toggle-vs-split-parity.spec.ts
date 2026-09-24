/**
 * Toggle vs Split chrome parity — Theme Builder (/theming).
 *
 * Acceptance criterion (team-lead, post-rejection of the first BtnGroup/
 * BtnToggle fix): the Light|Dark mode toggle's root CHROME must be
 * COMPUTED-STYLE IDENTICAL to the neighbouring "Split" button — a real
 * `origam-btn` themed by the SAME brand — for border-width, border-color,
 * background-color, box-shadow and border-radius. Only total width and the
 * internal segment separators are allowed to differ.
 *
 * Second criterion, added after a follow-up rejection: chrome parity alone
 * is NOT sufficient. The toggle carries `color="primary"` so its CHILD
 * segments (Light/Dark) keep the theme's accent colour and a visibly
 * distinct active/inactive state — the affordance a real mode-switch
 * control needs. A first pass dropped `color="primary"` to chase strict
 * border-color equality with Split on every theme and silently flattened
 * both segments to a neutral grey with no visible selection at all. This
 * spec now also asserts the active segment is visually distinct from the
 * resting one.
 *
 * Third criterion, added after a second follow-up rejection: a segment's
 * fill must sit flush against the group's border on all four sides — zero
 * gap, like a native segmented control. `align-items: center` (the group's
 * previous cross-axis alignment) let each child keep its own shorter
 * height and centre inside the group, leaving equal empty strips above and
 * below every segment; the active segment's fill then read as a smaller
 * box floating inside the pill instead of hugging it. Asserts the distance
 * between the active segment's border-box and the group's content-box is
 * 0px on every side.
 *
 * Runs across the 7 REAL registered brand themes (glass, geek, cartoon,
 * editorial, material, ecom, apple) × light/dark = 14 combos.
 *
 * NOTE: the nav's "Switch brand theme" menu exposes an 8th chip, "Sobre",
 * which sets data-theme="sobre" — a value that matches NO registered theme
 * (packages/marketing/src/themes/origam.theme.ts registers itself as
 * 'origam', not 'sobre'; a pre-existing, separately-flagged naming
 * mismatch, out of scope here). It is deliberately excluded from the
 * chrome-parity assertion: with no theme-level border-color token to
 * dominate, the toggle's border-color legitimately falls back to
 * `currentColor`, which now resolves to the primary-tinted text colour
 * `color="primary"` produces on the group root — while Split (no color
 * prop) falls back to the theme-agnostic neutral default instead. That
 * one-off divergence is a symptom of the 'sobre'/'origam' naming bug, not
 * of this fix; it does not occur on any of the 7 real themes.
 *
 * Prérequis : serveur marketing opérationnel (port 3000 ou MARKETING_BASE_URL).
 * Run : npx playwright test --config=playwright.marketing.config.ts \
 *         marketing-theming-toggle-vs-split-parity
 */

import { expect, test } from '@playwright/test'
import { requireMarketingDb } from './_support/require-marketing-db'

// #835 — voir marketing-theme-builder.spec.ts pour le contexte complet.
requireMarketingDb()

const THEMES = ['glass', 'geek', 'cartoon', 'editorial', 'material', 'ecom', 'apple']
const MODES = ['light', 'dark'] as const

// .origam-btn transitions box-shadow/background/transform over 0.28s (see
// OrigamBtn.vue's base rule) — settle fully before measuring, or
// getComputedStyle() catches a mid-transition interpolated value and the
// two elements report spuriously different box-shadow strings.
const TRANSITION_SETTLE_MS = 500

interface IChromeSnapshot {
    borderWidth: string
    borderColor: string
    backgroundColor: string
    boxShadow: string
    borderRadius: string
}

async function switchTheme (page: import('@playwright/test').Page, theme: string, mode: typeof MODES[number]) {
    await page.locator('[aria-label="Switch brand theme"]').first().click()
    await page.waitForTimeout(150)
    await page.locator(`[data-cy="theme-menu-${theme}"]`).first().click()
    await page.waitForTimeout(TRANSITION_SETTLE_MS)

    const currentMode = await page.evaluate(() => document.documentElement.getAttribute('data-mode'))
    if (currentMode !== mode) {
        await page.locator('[aria-label="Toggle light and dark mode"]').first().click()
        await page.waitForTimeout(TRANSITION_SETTLE_MS)
    }
}

test.describe('Theme Builder — mode toggle chrome matches Split button', () => {
    for (const theme of THEMES) {
        for (const mode of MODES) {
            test(`${theme}/${mode}: toggle root computed style equals Split root`, async ({ page }) => {
                await page.goto('/theming', { waitUntil: 'networkidle' })
                await switchTheme(page, theme, mode)

                const htmlAttrs = await page.evaluate(() => ({
                    theme: document.documentElement.getAttribute('data-theme'),
                    mode: document.documentElement.getAttribute('data-mode')
                }))
                expect(htmlAttrs.theme).toBe(theme)
                expect(htmlAttrs.mode).toBe(mode)

                const toggle = page.locator('[data-cy="theming-mode-toggle"]').first()
                const split = page.locator('[data-cy="theming-split-btn"]').first()
                await expect(toggle).toBeVisible()
                await expect(split).toBeVisible()

                const snapshot = await page.evaluate(() => {
                    const groupEl = document.querySelector('[data-cy="theming-mode-toggle"]') as HTMLElement
                    const splitEl = document.querySelector('[data-cy="theming-split-btn"]') as HTMLElement
                    const cs = (el: HTMLElement) => {
                        const s = getComputedStyle(el)
                        return {
                            borderWidth: s.borderWidth,
                            borderColor: s.borderColor,
                            backgroundColor: s.backgroundColor,
                            boxShadow: s.boxShadow,
                            borderRadius: s.borderRadius,
                            height: s.height
                        }
                    }
                    return { group: cs(groupEl), split: cs(splitEl) }
                }) as { group: IChromeSnapshot, split: IChromeSnapshot }

                // The group's own height must resolve to the SAME value as
                // a standalone themed Btn of the same size (Split) — a
                // toggle that's visibly taller than every real button
                // beside it both looks wrong on its own AND, at a fixed
                // border-radius, makes the SAME curve read as "less rounded"
                // simply because the box around it is bigger.
                expect(snapshot.group.height, 'height (must match Split — same size resolution)').toBe(snapshot.split.height)

                expect(snapshot.group.borderWidth, 'border-width').toBe(snapshot.split.borderWidth)
                expect(snapshot.group.borderColor, 'border-color').toBe(snapshot.split.borderColor)
                expect(snapshot.group.backgroundColor, 'background-color').toBe(snapshot.split.backgroundColor)
                expect(snapshot.group.boxShadow, 'box-shadow').toBe(snapshot.split.boxShadow)
                expect(snapshot.group.borderRadius, 'border-radius').toBe(snapshot.split.borderRadius)

                // Selection affordance: the active segment must be visually
                // distinct from the resting one (a filled/accent surface,
                // not the same flat background) — otherwise the control
                // stops communicating which mode is selected. Query by the
                // component's own active-state class rather than assuming
                // which of Light/Dark is active; the toggle's internal
                // `activeMode` is independent of the page's own light/dark
                // mode toggled via `switchTheme`.
                const items = await page.evaluate(() => {
                    const cs = (el: Element) => {
                        const s = getComputedStyle(el)
                        return { backgroundColor: s.backgroundColor, color: s.color }
                    }
                    const light = document.querySelector('[data-cy="theming-mode-light"]')
                    const dark = document.querySelector('[data-cy="theming-mode-dark"]')
                    return {
                        light: light ? { ...cs(light), active: light.classList.contains('origam-btn--active') } : null,
                        dark: dark ? { ...cs(dark), active: dark.classList.contains('origam-btn--active') } : null
                    }
                })

                expect(items.light, 'Light segment must exist').not.toBeNull()
                expect(items.dark, 'Dark segment must exist').not.toBeNull()
                const active = items.light!.active ? items.light! : items.dark!
                const resting = items.light!.active ? items.dark! : items.light!

                expect(
                    active.backgroundColor,
                    'active segment must have a filled background, not the transparent resting default'
                ).not.toBe('rgba(0, 0, 0, 0)')
                expect(
                    active.backgroundColor,
                    'active segment background must differ from the resting segment (visible selection)'
                ).not.toBe(resting.backgroundColor)

                // Gap == 0: the active segment's border-box must touch the
                // group's content-box (its own border-box inset by its own
                // border-width) on all four sides.
                const gap = await page.evaluate(() => {
                    const groupEl = document.querySelector('[data-cy="theming-mode-toggle"]') as HTMLElement
                    const activeEl = document.querySelector('.origam-btn--active') as HTMLElement
                    const groupRect = groupEl.getBoundingClientRect()
                    const activeRect = activeEl.getBoundingClientRect()
                    const bw = parseFloat(getComputedStyle(groupEl).borderWidth) || 0
                    const contentBox = {
                        left: groupRect.left + bw,
                        top: groupRect.top + bw,
                        right: groupRect.right - bw,
                        bottom: groupRect.bottom - bw
                    }
                    const isFirst = activeEl === activeEl.parentElement!.firstElementChild
                    const isLast = activeEl === activeEl.parentElement!.lastElementChild
                    return {
                        top: Math.round((activeRect.top - contentBox.top) * 100) / 100,
                        bottom: Math.round((contentBox.bottom - activeRect.bottom) * 100) / 100,
                        left: isFirst ? Math.round((activeRect.left - contentBox.left) * 100) / 100 : null,
                        right: isLast ? Math.round((contentBox.right - activeRect.right) * 100) / 100 : null
                    }
                })

                expect(gap.top, 'gap between active segment and group content-box (top)').toBe(0)
                expect(gap.bottom, 'gap between active segment and group content-box (bottom)').toBe(0)
                if (gap.left !== null) {
                    expect(gap.left, 'gap between active segment and group content-box (left, first child)').toBe(0)
                }
                if (gap.right !== null) {
                    expect(gap.right, 'gap between active segment and group content-box (right, last child)').toBe(0)
                }
            })
        }
    }
})
