import { expect, test, type Page } from '@playwright/test'

import { selectHstOption } from './_support/histoire-controls'

/**
 * Regression spec — `<OrigamAlert status="…">` must paint EXACTLY ONE
 * icon in the prepend slot when `statusIconPosition` is unset. Pre-fix
 * three icons rendered:
 *   1. prepend  → status icon (correct)
 *   2. header   → `<origam-icon>` placeholder with no `:icon` (because
 *                 `hasIcon` returned true on `status` alone, but the
 *                 resolved `icon` was undefined — `useStatus` only
 *                 forwards the status icon to `icon` when
 *                 `statusIconPosition === 'replace'`).
 *   3. append   → status icon AGAIN (because `useStatus` defaulted
 *                 unset position to "BOTH", painting both slots).
 *
 * The fix:
 *   • `useStatus` defaults unset `statusIconPosition` to `'prepend'`
 *     (single-slot, common-case), not `BOTH`.
 *   • `OrigamAlert.hasIcon` now mirrors the actual resolved
 *     `icon.value` from `useStatus`, not just `props.status`.
 */

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const STORY = '/stories/story/components-stories-alert-origamalert-story-vue'

/**
 * The story restructuring (canonical Design/State/Functional/Events/Slots
 * layout, see root CLAUDE.md) removed the dedicated "Prop — status"
 * showcase Variant that used to render a static `data-cy="alert-status"`
 * fixture. `status` is now a dynamic control (`HstSelect`, "Status" field)
 * inside the "Design" Variant, with no static data-cy on the result — so
 * this regression spec drives that control instead of navigating to a
 * fixture that no longer exists.
 *
 * The control is a custom Vue popover (histoire-base-select), not a
 * native <select> — verified empirically (Playwright's `page.locator(
 * 'select')` finds zero elements before AND after opening it). Driven via
 * the shared `selectHstOption` helper (`_support/histoire-controls.ts`) —
 * deliberately NOT a local `getByText(param).click()` helper: the
 * variant-title-drift auditor (`_support/audit-variant-titles.mjs`)
 * structurally detects that exact shape as "clicks a Variant sidebar
 * entry" and would misreport the status label ('Info', …) as a missing
 * Variant title. Routing control-driving through the shared support
 * module (outside the spec file the auditor scans) avoids the false
 * positive — confirmed by re-running the auditor after this change.
 */
const openDesignWithStatus = async (page: Page, statusLabel: 'Success' | 'Info' | 'Warning' | 'Error') => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText('Design', { exact: true }).first().click()
    await page.waitForTimeout(800)

    await selectHstOption(page, 'Status', statusLabel)
    await page.waitForTimeout(500)
}

test.describe('OrigamAlert — title line-height aligns with prepend icon', () => {
    test('title vertical centre is within 3px of the prepend-icon vertical centre', async ({ page }) => {
        // Pre-fix the title's line-height token resolved to `loose` (2),
        // so a 24px font-size title rendered ~48px tall while the prepend
        // icon stayed at 28px — the title floated visibly above/below the
        // icon's centre. Reduced to `tight` (1.25) → ~30px title height,
        // matches the icon ~28px and the flex `align-items: center`
        // produces a clean baseline.
        await openDesignWithStatus(page, 'Info')
        const sandbox = sandboxOf(page)
        // No dedicated data-cy fixture exists anymore (see openDesignWithStatus) —
        // the Design variant renders exactly one alert, so the structural
        // class is an unambiguous anchor.
        const alert = sandbox.locator('.origam-alert').first()
        await expect(alert).toBeVisible({ timeout: 8000 })

        const iconBox = await alert.locator('.origam-alert__prepend i.origam-icon').first().boundingBox()
        const titleBox = await alert.locator('.origam-alert__title').first().boundingBox()

        expect(iconBox).not.toBeNull()
        expect(titleBox).not.toBeNull()

        const iconCentre = iconBox!.y + iconBox!.height / 2
        const titleCentre = titleBox!.y + titleBox!.height / 2

        expect(Math.abs(iconCentre - titleCentre)).toBeLessThanOrEqual(3)

        // Title height stays within a reasonable typographic range — pre-fix
        // it was 48px, an obvious outlier vs. the 28px icon row.
        expect(titleBox!.height).toBeLessThanOrEqual(36)
    })
})

test.describe('OrigamAlert — status icon: single render, no duplicate, no empty placeholder', () => {
    test('status="info" renders exactly ONE icon (prepend) — no duplicate, no empty header placeholder', async ({ page }) => {
        await openDesignWithStatus(page, 'Info')
        const sandbox = sandboxOf(page)
        const alert = sandbox.locator('.origam-alert').first()
        await expect(alert).toBeVisible({ timeout: 8000 })

        // Total icon count across the entire alert wrapper.
        await expect(alert.locator('i.origam-icon')).toHaveCount(1)

        // The single icon must live in the prepend slot.
        await expect(alert.locator('.origam-alert__prepend i.origam-icon')).toHaveCount(1)

        // And it MUST be the resolved status icon (mdi-information for `info`).
        const cls = await alert.locator('.origam-alert__prepend i.origam-icon').first().getAttribute('class')
        expect(cls).toContain('mdi-information')

        // No icon in the header next to the title.
        await expect(alert.locator('.origam-alert__header > i.origam-icon')).toHaveCount(0)

        // No icon in the append slot.
        await expect(alert.locator('.origam-alert__append i.origam-icon')).toHaveCount(0)
    })
})
