// #1152 — three console warnings surfaced while the playground e2e ran, of
// unknown origin at the time. Traced, all three to `packages/ds/src`:
//
//   1. `Component emitted event "update:hover" but it is neither declared…`
//      ← `OrigamBtn` (catalog button + previewed instance): `useStateFlag`'s
//      `set()` / `unset()` emit through the `hover` v-model, and `IBtnEmits`
//      did not declare it. 12 occurrences over 4 scenarios.
//   2. `[Origam] A clickable icon is a button…`
//      ← the `@click="noop"` on `OrigamSelect`'s menu chevron, rendered by
//      every `OrigamSelect` of the inspector. 662 occurrences.
//   3. `onUnmounted is called when there is no active component instance…`
//      ← `OrigamTextareaField` calling `useDragResizer` from inside a
//      `watch`. 1 occurrence.
//
// This host runs the Vite DEV server, i.e. a dev build of Vue and of the DS
// (`import.meta.env.DEV`), which is the only e2e surface where these
// warnings exist at all — the Histoire suite runs a production build.
//
// A/B: on the parent commit every test below fails on its first assertion,
// with the counts above — see the PR body for the measured run.

import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const WATCHED = [
    'neither declared in the emits option',
    'A clickable icon is a button',
    'is called when there is no active component instance'
]

const watchConsole = (page: Page) => {
    const hits: Array<string> = []

    page.on('console', (message) => {
        const text = message.text()
        if (WATCHED.some((pattern) => text.includes(pattern))) hits.push(text.split('\n')[0])
    })

    return hits
}

const openComponent = async (page: Page, name: string) => {
    await page.goto('/')
    await page.locator('[data-cy="playground-catalog-open"]').click()
    await page.locator(`[data-cy="playground-drawer-item-${name}"]`).click()
    // `toBeAttached`, not `toBeVisible`: an `OrigamCard` with no content has
    // a zero-size box, which Playwright reports as hidden.
    await expect(page.locator('[data-cy="playground-preview-instance"]')).toBeAttached()
}

test.describe('playground — console stays free of the #1152 warnings', () => {
    for (const name of ['OrigamBtn', 'OrigamSelect', 'OrigamSwitch', 'OrigamAlert', 'OrigamCard', 'OrigamChip']) {
        test(`${name}: open, hover the instance, open the dock — no watched warning`, async ({ page }) => {
            const hits = watchConsole(page)

            await openComponent(page, name)

            const instance = page.locator('[data-cy="playground-preview-instance"]')
            // Dispatched, not `hover()`: same zero-size case. The listeners
            // are Vue's `@mouseenter` / `@mouseleave`, which a dispatched
            // event reaches exactly like a pointer one.
            await instance.dispatchEvent('mouseenter')
            await instance.dispatchEvent('mouseleave')
            await page.locator('[data-cy="playground-catalog-open"]').hover()
            await page.mouse.move(0, 0)
            await page.locator('[data-cy="playground-dock-handle"]').click()

            // Settle: the inspector's controls mount after the dock opens, and
            // warning 2 / 3 fire from their mount and their first watch run.
            await page.waitForTimeout(500)

            expect(hits).toEqual([])
        })
    }
})
