import { expect, test, type Page } from '@playwright/test'

import { fillHstText } from './_support/histoire-controls'

/**
 * OrigamChartMap — `borderColor` theme reachability (#411).
 *
 * Real-browser proof (Chromium against the static Histoire build) that the
 * country-outline stroke actually REPAINTS when `borderColor` is driven with
 * a `TIntent` name — the shape a theme's `components['origam-chart-map']`
 * block would supply. Before the fix, `borderColor` was applied to `stroke`
 * verbatim (no `resolveColor()` pass): an intent keyword like `'success'` is
 * not valid CSS for `stroke`, so the browser drops the declaration and the
 * outline disappears entirely instead of repainting — measured directly
 * against the pre-fix component in the paired TU spec
 * (`packages/tests/TU/components/Chart/chart-map-border-color-theme.spec.ts`,
 * A/B'd against `HEAD` before this fix landed).
 *
 * `getComputedStyle` on a REAL Chromium instance resolves `var(--origam-…)`
 * correctly — this is exactly the case the jsdom trap documented in
 * CLAUDE.md does not cover (that trap is Vitest/jsdom-only).
 */

const MAP_STORY = '/stories/story/components-stories-chart-origamchartmap-story-vue'

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

test.describe('OrigamChartMap — borderColor repaints under a themed intent (#411)', () => {
    test('stroke colour changes when borderColor switches between two intents, and each resolves to its own token', async ({ page }) => {
        await page.goto(MAP_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Design', { exact: true }).first().click()
        await page.waitForTimeout(500)

        const sandbox = sandboxOf(page)
        const country = sandbox.locator('[data-cy^="origam-chart-map-country-"]').first()
        await expect(country).toBeVisible({ timeout: 10000 })

        // Default state ('neutral' intent, set by the story's :init-state)
        const neutralStroke = await country.evaluate((el) => getComputedStyle(el).stroke)
        const neutralExpected = await country.evaluate(() =>
            getComputedStyle(document.documentElement).getPropertyValue('--origam-color__action--secondary---bg').trim()
        )
        expect(neutralStroke).not.toBe('') // a real paint, not an invalid/dropped declaration
        expect(neutralStroke).not.toBe('none')

        // Drive borderColor to a different intent via the story's own control
        await fillHstText(page, 'Border Color (stroke)', 'danger')
        await page.waitForTimeout(300)

        const dangerStroke = await country.evaluate((el) => getComputedStyle(el).stroke)
        const dangerExpected = await country.evaluate(() =>
            getComputedStyle(document.documentElement).getPropertyValue('--origam-color__feedback--danger---bg').trim()
        )

        expect(dangerStroke).not.toBe('') // still a real paint under the new intent — the prior bug rendered NO stroke at all
        expect(dangerStroke).not.toBe(neutralStroke) // the theme-shaped value actually repaints

        // Cross-check both rungs against the token they are supposed to resolve to,
        // via a fresh element carrying the literal expression (avoids re-parsing rgb()/oklch() by hand).
        const [ neutralAsRgb, dangerAsRgb ] = await page.evaluate(({ neutralVar, dangerVar }) => {
            const probe = document.createElement('div')
            document.body.appendChild(probe)
            probe.style.color = `var(${ neutralVar })`
            const a = getComputedStyle(probe).color
            probe.style.color = `var(${ dangerVar })`
            const b = getComputedStyle(probe).color
            probe.remove()
            return [ a, b ]
        }, { neutralVar: '--origam-color__action--secondary---bg', dangerVar: '--origam-color__feedback--danger---bg' })

        expect(neutralStroke).toBe(neutralAsRgb)
        expect(dangerStroke).toBe(dangerAsRgb)
        expect(neutralExpected).not.toBe(dangerExpected)
    })

    test('an explicit custom CSS colour still overrides the theme/default path unchanged', async ({ page }) => {
        await page.goto(MAP_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Design', { exact: true }).first().click()
        await page.waitForTimeout(500)

        const sandbox = sandboxOf(page)
        const country = sandbox.locator('[data-cy^="origam-chart-map-country-"]').first()
        await expect(country).toBeVisible({ timeout: 10000 })

        await fillHstText(page, 'Border Color (stroke)', 'rgb(10, 20, 30)')
        await page.waitForTimeout(300)

        const stroke = await country.evaluate((el) => getComputedStyle(el).stroke)
        expect(stroke).toBe('rgb(10, 20, 30)')
    })
})
