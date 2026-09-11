import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamCommandPalette — runtime probes for every prop / Variant
 * exposed by the story. Each block targets one orthogonal facet:
 *
 *   - Hotkey: presses ⌘K / Ctrl+K and expects the palette to open
 *     even though the trigger button was never clicked.
 *   - v-model: the playground variant flips `state.open` on the
 *     trigger button — the palette must mount/unmount accordingly.
 *   - Fuzzy: typing "set" must surface "Set theme" / "Settings"
 *     while typing "zzzz" must show the empty-state slot.
 *   - Keyboard navigation: ArrowDown moves the `aria-activedescendant`,
 *     Enter fires `select`, Esc closes (when `closeOnEscape`).
 *   - closeOnBackdrop: clicking the backdrop closes the palette.
 *   - ARIA: the input has `role="combobox"`, the list has
 *     `role="listbox"`, items have `role="option"`, dialog has
 *     `role="dialog"` + `aria-modal="true"`.
 *
 * Histoire iframes render the sandbox under
 * `iframe[src*="__sandbox"]` — same convention as every other origam
 * spec. The palette teleports to `document.body`, so locators that
 * scope through the sandbox iframe still find it because the iframe
 * IS the document body of the sandbox.
 */

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyPath: string, variant: string) => {
    await page.goto(storyPath)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(600)
}

const STORY = '/stories/story/components-stories-commandpalette-origamcommandpalette-story-vue'

test.describe('OrigamCommandPalette — Default (open via trigger / v-model)', () => {
    test('opens when the trigger button is clicked', async ({ page }) => {
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)

        await sandbox.locator('[data-cy="command-palette-playground-trigger"]').click()

        const dialog = sandbox.locator('[role="dialog"]')
        await expect(dialog).toBeVisible({ timeout: 4000 })
        await expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    test('input has role="combobox" and the list has role="listbox"', async ({ page }) => {
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)
        await sandbox.locator('[data-cy="command-palette-playground-trigger"]').click()

        const combobox = sandbox.locator('input[role="combobox"]')
        await expect(combobox).toBeVisible({ timeout: 4000 })

        const listbox = sandbox.locator('[role="listbox"]')
        await expect(listbox).toBeVisible()
    })

    test('every command renders with role="option"', async ({ page }) => {
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)
        await sandbox.locator('[data-cy="command-palette-playground-trigger"]').click()

        const options = sandbox.locator('[role="option"]')
        await expect.poll(async () => await options.count(), { timeout: 4000 }).toBeGreaterThan(0)
    })
})

test.describe('OrigamCommandPalette — global hotkey', () => {
    test('Meta+K opens the palette globally', async ({ page }) => {
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)

        // Click somewhere neutral first to make sure the sandbox iframe
        // owns the keyboard focus.
        await sandbox.locator('[data-cy="command-palette-playground"]').click()

        // useHotkey attaches its listener on `window` of the sandbox iframe —
        // page.keyboard.press() dispatches into the top-level frame and never
        // reaches that listener. We must dispatch inside the iframe by pressing
        // on a locator that belongs to the sandbox frame.
        await sandbox.locator('[data-cy="command-palette-playground"]').press('Meta+K')

        await expect(sandbox.locator('[role="dialog"]')).toBeVisible({ timeout: 4000 })
    })
})

test.describe('OrigamCommandPalette — fuzzy search', () => {
    test('typing "set" surfaces commands matching "set" / "settings"', async ({ page }) => {
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)

        await sandbox.locator('[data-cy="command-palette-playground-trigger"]').click()

        const combobox = sandbox.locator('input[role="combobox"]')
        await combobox.fill('set')

        const options = sandbox.locator('[role="option"]')
        await expect.poll(async () => await options.count(), { timeout: 4000 }).toBeGreaterThan(0)

        // At least one option mentions "settings" or "set theme".
        const labels = await options.allInnerTexts()
        const matched = labels.some(t => /set/i.test(t))
        expect(matched).toBe(true)
    })

    test('typing a query that matches nothing shows the empty state', async ({ page }) => {
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)

        await sandbox.locator('[data-cy="command-palette-playground-trigger"]').click()

        const combobox = sandbox.locator('input[role="combobox"]')
        await combobox.fill('zzzz')

        const empty = sandbox.locator('.origam-command-palette__empty')
        await expect(empty).toBeVisible({ timeout: 4000 })

        const options = sandbox.locator('[role="option"]')
        await expect.poll(async () => await options.count(), { timeout: 2000 }).toBe(0)
    })
})

test.describe('OrigamCommandPalette — keyboard navigation', () => {
    test('ArrowDown moves the active descendant', async ({ page }) => {
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)

        await sandbox.locator('[data-cy="command-palette-playground-trigger"]').click()

        const combobox = sandbox.locator('input[role="combobox"]')
        await expect(combobox).toBeFocused({ timeout: 4000 })

        const firstActive = await combobox.getAttribute('aria-activedescendant')
        await combobox.press('ArrowDown')
        const secondActive = await combobox.getAttribute('aria-activedescendant')

        expect(secondActive).not.toBe(firstActive)
    })

    test('Escape closes the palette when closeOnEscape is true', async ({ page }) => {
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)

        await sandbox.locator('[data-cy="command-palette-playground-trigger"]').click()

        const dialog = sandbox.locator('[role="dialog"]')
        await expect(dialog).toBeVisible({ timeout: 4000 })

        await sandbox.locator('input[role="combobox"]').press('Escape')

        await expect(dialog).toBeHidden({ timeout: 4000 })
    })

    test('Enter fires `select` and closes the palette (closeOnSelect default)', async ({ page }) => {
        await openVariant(page, STORY, 'Emit — select')
        const sandbox = sandboxOf(page)

        await sandbox.locator('[data-cy="command-palette-emit-select-trigger"]').click()

        const combobox = sandbox.locator('input[role="combobox"]')
        await expect(combobox).toBeFocused({ timeout: 4000 })

        await combobox.press('Enter')

        const counter = sandbox.locator('[data-cy="command-palette-emit-select-counter"]')
        await expect(counter).toContainText(/select fired:\s*1/, { timeout: 4000 })

        const dialog = sandbox.locator('[role="dialog"]')
        await expect(dialog).toBeHidden({ timeout: 4000 })
    })
})

test.describe('OrigamCommandPalette — backdrop', () => {
    test('clicking the backdrop closes the palette when closeOnBackdrop is true', async ({ page }) => {
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)

        await sandbox.locator('[data-cy="command-palette-playground-trigger"]').click()

        const dialog = sandbox.locator('[role="dialog"]')
        await expect(dialog).toBeVisible({ timeout: 4000 })

        // Click the overlay root — `@click.self` only fires when the
        // click target IS the root (not a descendant).
        const backdrop = sandbox.locator('.origam-command-palette').first()
        await backdrop.click({ position: { x: 10, y: 10 } })

        await expect(dialog).toBeHidden({ timeout: 4000 })
    })
})

test.describe('OrigamCommandPalette — groups & kbd display', () => {
    test('groups variant renders multiple group titles', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — groups')
        const sandbox = sandboxOf(page)

        await sandbox.locator('[data-cy="command-palette-groups-trigger"]').click()

        const titles = sandbox.locator('.origam-command-palette__group-title')
        await expect.poll(async () => await titles.count(), { timeout: 4000 }).toBeGreaterThanOrEqual(2)
    })

    test('kbd hints render through OrigamKbd', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — kbd display')
        const sandbox = sandboxOf(page)

        await sandbox.locator('[data-cy="command-palette-kbd-trigger"]').click()

        const kbds = sandbox.locator('.origam-command-palette__item-kbd')
        await expect.poll(async () => await kbds.count(), { timeout: 4000 }).toBeGreaterThan(0)
    })
})
