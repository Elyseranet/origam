import { expect, test } from '@playwright/test'

import { eventLogItems, openEventsTab } from './_support/histoire-controls'

/**
 * OrigamChartRadar — Playwright spec.
 *
 * Scope: `point-click` verification only (#545). This emit was measured
 * dead by `unemitted-declarations` (the marker circle had no `@click` /
 * `@keydown` at all, despite `cursor: pointer` styling and an
 * `aria-label`) — implemented in the same change: the circle now carries
 * `role="button"`, `tabindex="0"`, and click/Enter/Space handlers wired
 * to `onPointActivate`, which builds an `IChartPoint` and emits
 * `point-click`. `getComputedStyle` under jsdom can't verify a real
 * click dispatch reliably for this kind of interaction proof (root
 * CLAUDE.md, jsdom trap section) — this is the Playwright-against-
 * Histoire verification the fix is held to.
 */

const RADAR_STORY = '/stories/story/components-stories-chart-origamchartradar-story-vue'

test.describe('OrigamChartRadar — point-click (#545)', () => {
    test('clicking a vertex marker emits point-click', async ({ page }) => {
        await page.goto(RADAR_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Events - point-click', { exact: true }).first().click()
        await page.waitForTimeout(500)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const firstPoint = sandbox.locator('[data-cy^="origam-chart-point-"]').first()
        await expect(firstPoint).toBeVisible()
        await firstPoint.click()

        await openEventsTab(page)
        await expect(eventLogItems(page).first()).toContainText('point-click', { timeout: 4000 })
    })

    test('activating a vertex marker with the keyboard emits point-click', async ({ page }) => {
        await page.goto(RADAR_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Events - point-click', { exact: true }).first().click()
        await page.waitForTimeout(500)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const firstPoint = sandbox.locator('[data-cy^="origam-chart-point-"]').first()
        await expect(firstPoint).toBeVisible()
        await firstPoint.focus()
        await page.keyboard.press('Enter')

        await openEventsTab(page)
        await expect(eventLogItems(page).first()).toContainText('point-click', { timeout: 4000 })
    })
})
