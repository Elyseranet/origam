import type { Page } from '@playwright/test'

/**
 * Drives Histoire's own control widgets (`HstSelect` / `HstText` /
 * `HstNumber` / `HstCheckbox`) in the RIGHT-HAND controls panel — NOT the
 * sandboxed component under test.
 *
 * Why this exists: the canonical story structure (root CLAUDE.md, "Story +
 * doc sync" section) groups most props under one `<Variant title="Design">`
 * / `"Functional"` with dynamic controls, instead of one dedicated
 * `<Variant>` per prop. Migrated specs that used to navigate straight to a
 * static `Prop — X` fixture now often need to drive that Variant's control
 * to reach the same state — this module is the single place that knows how.
 *
 * DOM shapes verified empirically against a running Histoire instance
 * (2026-08, Alert/Audio stories) — none of these are native form controls:
 *   - `HstSelect` renders a custom Vue popover (`.v-popper--theme-dropdown`
 *     trigger + a text-matched option in the opened list), NOT a native
 *     `<select>` (`page.locator('select')` finds zero elements before AND
 *     after opening it).
 *   - `HstText` / `HstNumber` DO render native `<input>` elements, reachable
 *     via Playwright's accessible-role locators (`textbox` / `spinbutton`).
 *   - `HstCheckbox` renders `role="checkbox"` on a `<label>` — reachable via
 *     `getByRole('checkbox', …)` — but does NOT expose `aria-checked`, so
 *     current state can't be read back; callers must know the control's
 *     starting value (from the Variant's `:init-state`) and only call
 *     `setHstCheckbox` when a flip is actually needed.
 *
 * Two ambiguity traps found and closed empirically (documented so the next
 * fix doesn't have to rediscover them):
 *   - Field-row matching must be EXACT, not substring. `label.histoire-
 *     select`'s row label lives in that label's first `<span>` child.
 *     Matching by `hasText` (substring) picks the wrong row whenever one
 *     field name is a prefix of another's suffix — e.g. "Color" matches
 *     BOTH the "Color" row AND the "Bg Color" row ("Bg " + "Color"), and
 *     `.first()` only avoided a wrong pick by DOM-order luck.
 *   - The option-click must be scoped to the open dropdown's own popper
 *     container, not matched page-wide — see `selectHstOption` below.
 */

/**
 * Open a Histoire `HstSelect` field (matched by the EXACT text of its row
 * label — the first `<span>` child of `label.histoire-select`, see module
 * doc) and pick an option by its visible text.
 *
 * The option click is scoped to the open `.v-popper__popper:visible`
 * (floating-vue's teleported dropdown content) rather than a page-wide
 * `getByText`. Without that scope, an option whose label matches text
 * elsewhere on the page is ambiguous: every story has a "Default" Variant
 * link in its sidebar, and the closed trigger renders the CURRENTLY
 * selected value as its own text node too — so re-selecting an option
 * that's already the field's current value, or one named "Default",
 * resolves to 2+ elements and Playwright throws a strict-mode violation.
 * Found empirically on bracket.spec.ts ("Double elimination" already
 * selected, and "Default") and on OrigamChartPyramid's Design Variant
 * (re-selecting the default "funnel" value).
 */
export async function selectHstOption(page: Page, fieldLabel: string, optionLabel: string): Promise<void> {
    const row = page.locator('label.histoire-select').filter({ has: page.locator('span', { hasText: new RegExp(`^${escapeRegExp(fieldLabel)}$`) }) }).first()
    await row.locator('.v-popper--theme-dropdown').click()
    await page.waitForTimeout(300)
    await page.locator('.v-popper__popper:visible').getByText(optionLabel, { exact: true }).click()
    await page.waitForTimeout(300)
}

/** Escapes regex metacharacters so a field label can be used as a literal exact-match pattern. */
function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Fill a Histoire `HstText` / `HstNumber` field (matched by its accessible name). */
export async function fillHstText(page: Page, fieldLabel: string, value: string): Promise<void> {
    await page.getByRole('textbox', { name: fieldLabel, exact: true }).fill(value)
}

/** Set a Histoire `HstNumber` field (matched by its accessible name, exposed as role=spinbutton). */
export async function fillHstNumber(page: Page, fieldLabel: string, value: number | string): Promise<void> {
    await page.getByRole('spinbutton', { name: fieldLabel, exact: true }).fill(String(value))
}

/**
 * Click a Histoire `HstCheckbox` field to flip it. No readback is possible
 * (see module doc) — call this only when the caller already knows the
 * control's current value differs from the desired one (typically because
 * it's still at the Variant's documented `:init-state` default).
 */
export async function toggleHstCheckbox(page: Page, fieldLabel: string): Promise<void> {
    await page.getByRole('checkbox', { name: fieldLabel, exact: true }).click()
}

/**
 * Switch Histoire's right-hand panel to its "Events" tab, where `logEvent(…)`
 * calls made from a story (e.g. `@point-click="logEvent('point-click', $event)"`)
 * surface as a list of `[data-test-id="event-item"]` rows.
 *
 * Needed by any spec that asserts an emit actually fired — the canonical
 * `Events - {name}` Variant structure (root CLAUDE.md, "Story + doc sync")
 * replaced the old per-story custom log `<div data-cy="…-log">`, so specs
 * that used to read a bespoke shell selector must read Histoire's own event
 * log instead.
 *
 * Widens the viewport first: at Playwright's default 1280×720, Histoire's
 * right-panel tab bar collapses the "Events" tab into a `visibility:hidden`
 * wrapper once the badge count pushes it past the available width — the
 * element still resolves (count 1) and even accepts a forced click without
 * throwing, but the click lands on nothing because a `visibility:hidden`
 * node doesn't receive real pointer hits, so the tab never actually
 * switches. Verified empirically against a running Histoire instance
 * (Chart/Sankey story, 2026-08): identical steps succeed at 1600×1000 and
 * silently no-op at 1280×720.
 */
export async function openEventsTab(page: Page): Promise<void> {
    await page.setViewportSize({ width: 1600, height: 1000 })
    const tab = page.locator('a.histoire-base-tab[href*="tab=events"]')
    await tab.scrollIntoViewIfNeeded()
    await tab.click()
    await page.waitForTimeout(300)
}

/** Locator for the logged event rows in Histoire's "Events" tab — call `openEventsTab` first. */
export function eventLogItems(page: Page) {
    return page.locator('[data-test-id="event-item"]')
}
