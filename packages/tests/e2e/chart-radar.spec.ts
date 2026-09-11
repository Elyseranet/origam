import { expect, test, type Page } from '@playwright/test'

import { eventLogItems, openEventsTab, selectHstOption } from './_support/histoire-controls'

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
 *
 * ⛔ C3 (reactivite post-montage) — cette famille (vague 3, lot C3) n'avait
 * ZERO test qui mute une prop APRES le montage puis relit le DOM : les deux
 * tests ci-dessus ne couvrent que l'emit. Le classeur marquait C3 "defaut"
 * en heritage de famille, jamais verifie individuellement (note : "NON
 * INSPECTE individuellement"). Le composant utilise le meme moteur
 * thunk-based `useChart` que le reste de la famille (aucune lecture eager
 * dans `setup()`, confirme par `setup-reads.mjs`) — l'hypothese est donc
 * que c'est deja reactif. Les deux tests ci-dessous le PROUVENT au runtime
 * plutot que de le supposer : ils mutent "Categories (spokes)" et "Series
 * count" (HstSelect, Variant "Functional") apres le montage initial et
 * relisent le DOM du meme composant.
 */

const RADAR_STORY = '/stories/story/components-stories-chart-origamchartradar-story-vue'
const CHART = '[data-cy="origam-chart-radar"]'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, title: string) => {
    await page.goto(RADAR_STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(500)
}

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

test.describe('OrigamChartRadar — Functional Variant post-mount reactivity (C3)', () => {
    test('changing "Categories (spokes)" after mount changes the number of rendered spokes', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const labels = sandbox.locator(`${ CHART } .origam-chart__radar-label`)
        // Functional Variant init-state: FIXTURE_RADAR_AXES has 6 entries.
        await expect(labels).toHaveCount(6, { timeout: 6000 })

        await selectHstOption(page, 'Categories (spokes)', '8 spokes')
        await page.waitForTimeout(400)
        await expect(labels).toHaveCount(8)

        await selectHstOption(page, 'Categories (spokes)', '5 spokes')
        await page.waitForTimeout(400)
        await expect(labels).toHaveCount(5)
    })

    test('changing "Series count" after mount changes the number of rendered polygons', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const polygons = sandbox.locator(`${ CHART } .origam-chart__polygon`)
        // Functional Variant init-state: FIXTURE_RADAR has 2 series.
        await expect(polygons).toHaveCount(2, { timeout: 6000 })

        await selectHstOption(page, 'Series count', '4 players')
        await page.waitForTimeout(400)
        await expect(polygons).toHaveCount(4)

        await selectHstOption(page, 'Series count', '1 player')
        await page.waitForTimeout(400)
        await expect(polygons).toHaveCount(1)
    })
})
