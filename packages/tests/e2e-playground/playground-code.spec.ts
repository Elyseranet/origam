// Playground lot C (#1143) — the "Code" panel, in a real browser.
//
// What this spec owns: the panel SHOWS the code of the scene the host holds,
// and its copy button is operable from the keyboard alone. The generator's
// own surface (escaping, slots, nesting, layout) is pinned exhaustively by
// `TU/playground/scene-code.util.spec.ts` — not repeated here.
//
// The scene is driven through the UI (catalog → select), because the
// standalone host owns its scene and exposes no other entry point. Until
// lot B ships editable controls a selected instance carries no prop, so the
// expected code is the bare tag.

import { expect, test } from '@playwright/test'

test.describe('playground — Code panel', () => {
    test.beforeEach(async ({ page, context }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write'])
        await page.goto('/')
        await expect(page.locator('[data-cy="playground-root"]')).toBeVisible()
    })

    test('empty scene → the panel says so instead of rendering an empty code block', async ({ page }) => {
        await page.locator('[data-cy="playground-dock-handle"]').click()

        await expect(page.locator('[data-cy="playground-code-panel"]')).toBeVisible()
        await expect(page.locator('[data-cy="playground-code-empty"]')).toBeVisible()
        await expect(page.locator('[data-cy="playground-code"]')).toHaveCount(0)
    })

    test('selecting a component shows the code of the scene', async ({ page }) => {
        await page.locator('[data-cy="playground-catalog-open"]').click()
        await page.locator('[data-cy="playground-drawer-item-OrigamBtn"]').click()
        await page.locator('[data-cy="playground-dock-handle"]').click()

        const code = page.locator('[data-cy="playground-code"] code')

        await expect(code).toHaveText('<origam-btn/>')
        await expect(page.locator('[data-cy="playground-code-empty"]')).toHaveCount(0)

        // The panel follows the scene: picking another component replaces the code.
        await page.locator('[data-cy="playground-catalog-open"]').click()
        await page.locator('[data-cy="playground-drawer-item-OrigamChip"]').click()

        await expect(code).toHaveText('<origam-chip/>')
    })

    test('the copy button is reachable with Tab and copies the code with Enter', async ({ page }) => {
        await page.locator('[data-cy="playground-catalog-open"]').click()
        await page.locator('[data-cy="playground-drawer-item-OrigamBtn"]').click()

        const handle = page.locator('[data-cy="playground-dock-handle"]')

        await handle.focus()
        await page.keyboard.press('Enter')
        await expect(handle).toHaveAttribute('aria-expanded', 'true')

        await page.keyboard.press('Tab')

        const copy = page.locator('[data-cy="playground-code"] [data-cy="origam-code-copy"]')

        await expect(copy).toBeFocused()

        await page.keyboard.press('Enter')

        await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('<origam-btn/>')
        await expect(copy).toHaveAttribute('aria-label', 'Code copied to clipboard')
    })

    test('the copy button also answers Space', async ({ page }) => {
        await page.locator('[data-cy="playground-catalog-open"]').click()
        await page.locator('[data-cy="playground-drawer-item-OrigamChip"]').click()
        await page.locator('[data-cy="playground-dock-handle"]').click()

        const copy = page.locator('[data-cy="playground-code"] [data-cy="origam-code-copy"]')

        await copy.focus()
        await page.keyboard.press('Space')

        await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('<origam-chip/>')
    })
})
