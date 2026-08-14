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
 * The option click is scoped to `.v-popper__popper` — the floating
 * dropdown's own teleported container (confirmed via DOM inspection: it
 * carries a `v-popper__popper--shown` class while open, sibling to
 * `.v-popper__backdrop` / `.v-popper__arrow-container`). A page-wide
 * `getByText(optionLabel)` is NOT safe: an option whose label matches
 * text elsewhere on the page — e.g. every story has a "Default" Variant
 * link in its sidebar, and the trigger itself still shows the
 * currently-selected value as text — throws a Playwright strict-mode
 * "resolved to N elements" error. Reproduced empirically on
 * bracket.spec.ts picking "Double elimination" (already the selected
 * value, shown twice) and "Default" (collides with the sidebar's
 * "Default" Variant link).
 */
export async function selectHstOption(page: Page, fieldLabel: string, optionLabel: string): Promise<void> {
    const row = page.locator('label.histoire-select').filter({ has: page.locator('span', { hasText: new RegExp(`^${escapeRegExp(fieldLabel)}$`) }) }).first()
    await row.locator('.v-popper--theme-dropdown').click()
    await page.waitForTimeout(300)
    const popper = page.locator('.v-popper__popper.v-popper__popper--shown').last()
    await popper.getByText(optionLabel, { exact: true }).click()
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
