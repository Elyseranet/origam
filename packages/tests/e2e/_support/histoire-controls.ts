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
 * Known fragility (documented, not hidden): the option-click in
 * `selectHstOption` matches by visible text anywhere on the page while the
 * dropdown is open. If two controls could show the same option label
 * simultaneously this would be ambiguous — none of the current call sites
 * hit that, but a future one might; verify with a screenshot if a
 * selection doesn't stick.
 */

/** Open a Histoire `HstSelect` field (matched by its row label) and pick an option by its visible text. */
export async function selectHstOption(page: Page, fieldLabel: string, optionLabel: string): Promise<void> {
    const row = page.locator('label.histoire-select', { hasText: fieldLabel }).first()
    await row.locator('.v-popper--theme-dropdown').click()
    await page.waitForTimeout(300)
    await page.getByText(optionLabel, { exact: true }).click()
    await page.waitForTimeout(300)
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
