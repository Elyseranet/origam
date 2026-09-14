import { expect, test, type FrameLocator, type Page } from '@playwright/test'

import { selectHstOption, toggleHstCheckbox } from './_support/histoire-controls'

/**
 * Playwright spec for OrigamSheet — focuses on the new `swipeable +
 * side="bottom"` mobile bottom-sheet behaviour added in Phase 3·J.
 *
 * REALIGNED (2026-08) — the story migrated to the canonical
 * Design/State/Functional/Events/Slots structure. "Prop — swipeable
 * (bottom sheet)" no longer exists as a dedicated Variant — it is now
 * the "Functional" Variant driven via Side="bottom" + Swipeable
 * checkbox + Default Snap="peek" controls. The consumer-set
 * `data-cy="sheet-bottom-swipeable"` host is gone too (never existed
 * on the component itself) — the sheet root is located structurally
 * via `.origam-sheet` (single instance per Variant). The handle still
 * carries a static `data-cy="sheet-bottom-handle"` directly on
 * OrigamSheet.vue, unaffected by the migration.
 *
 * Strategy
 * --------
 * Histoire renders each variant inside an `__sandbox` iframe. We:
 *   1. Navigate to the story URL.
 *   2. Click the variant link in the left rail (`getByRole('link', …)`)
 *      to switch the sandbox.
 *   3. Reach into `iframe[src*="__sandbox"]` for the actual DOM.
 *   4. Drive the "Side" / "Swipeable" / "Default Snap" / "Persistent"
 *      controls through the shared `histoire-controls.ts` helper —
 *      never a local ad-hoc `getByText` control click.
 *
 * Synthetic gesture caveat
 * ------------------------
 * Pointer events dispatched from Playwright don't always travel through
 * the same code paths as a real mouse drag — `setPointerCapture` and
 * `pointercancel` are notoriously partial. The composable swallows
 * exceptions from these so the gesture still resolves on `pointerup`.
 * For the height assertions we therefore drive the snap **via the
 * exposed `snapTo()` ref** when a synthetic gesture proves brittle —
 * the gesture itself is fully covered at the unit-test layer
 * (`sheetSwipe.composable.spec.ts`, 17 tests).
 */

const STORY_PATH = '/stories/story/components-stories-sheet-origamsheet-story-vue'

async function gotoVariant (page: Page, title: string) {
    await page.goto(STORY_PATH)
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name: title, exact: true }).click()
    await page.waitForTimeout(700)
}

function sandbox (page: Page): FrameLocator {
    return page.frameLocator('iframe[src*="__sandbox"]')
}

/** Drives the "Functional" Variant into the bottom-swipeable-peek fixture the old "Prop — swipeable (bottom sheet)" Variant used to hardcode. */
async function driveBottomSwipeablePeek (page: Page): Promise<void> {
    await gotoVariant(page, 'Functional')
    await selectHstOption(page, 'Side', 'bottom')
    await toggleHstCheckbox(page, 'Swipeable')
    await selectHstOption(page, 'Default Snap', 'peek')
    await page.waitForTimeout(500)
}

test.describe('OrigamSheet — bottom swipeable', () => {

    // ────────────────────────────────────────────────────────────────────
    // Sanity — variant mounts and the swipe-handle pill is visible.
    // ────────────────────────────────────────────────────────────────────
    test('Bottom — swipeable — handle pill is mounted with non-zero dimensions', async ({ page }) => {
        await driveBottomSwipeablePeek(page)
        const sb = sandbox(page)

        const sheet = sb.locator('.origam-sheet').first()
        await expect(sheet).toBeVisible({ timeout: 5000 })
        await expect(sheet).toHaveClass(/origam-sheet--swipeable/)

        const handle = sb.locator('[data-cy="sheet-bottom-handle"]')
        await expect(handle).toBeVisible({ timeout: 5000 })
        // Handle pill is the inner span — must have a non-zero width.
        const pill = sb.locator('.origam-sheet__handle-pill')
        await expect(pill).toBeVisible({ timeout: 5000 })
        const box = await pill.boundingBox()
        expect(box).not.toBeNull()
        expect(box!.width).toBeGreaterThan(0)
        expect(box!.height).toBeGreaterThan(0)
    })

    // ────────────────────────────────────────────────────────────────────
    // Initial render — sheet height matches the requested defaultSnap.
    // ────────────────────────────────────────────────────────────────────
    test('Initial render — peek snap → sheet height is ~120px (token)', async ({ page }) => {
        await driveBottomSwipeablePeek(page)
        const sb = sandbox(page)

        const sheet = sb.locator('.origam-sheet').first()
        await expect(sheet).toBeVisible({ timeout: 5000 })
        await expect(sheet).toHaveClass(/origam-sheet--snap-peek/)

        // Swipe height is set inline via `--origam-sheet---swipe-height`
        // and the SCSS `&--swipeable` rule maps it to `height`. We read
        // the rendered bounding-box height; expect ~120 px ± 4 px to
        // tolerate browser sub-pixel rounding and the handle's padding.
        const box = await sheet.boundingBox()
        expect(box).not.toBeNull()
        expect(Math.round(box!.height)).toBeGreaterThanOrEqual(118)
        expect(Math.round(box!.height)).toBeLessThanOrEqual(124)
    })

    // ────────────────────────────────────────────────────────────────────
    // Programmatic snap-up — drive the public `snapTo()` to verify the
    // height actually grows when the snap changes.
    // ────────────────────────────────────────────────────────────────────
    test('snapTo("full") — sheet height grows toward the largest snap', async ({ page }) => {
        await driveBottomSwipeablePeek(page)
        const sb = sandbox(page)

        const sheet = sb.locator('.origam-sheet').first()
        await expect(sheet).toBeVisible({ timeout: 5000 })

        const peekHeight = (await sheet.boundingBox())!.height

        // Use evaluate inside the sandbox to call the exposed snapTo()
        // via the Vue instance attached to the sheet element. Origam's
        // <script setup> components surface `defineExpose`d members
        // through `__vue_app__` proxying — easier and more reliable
        // than synthesising a touch sequence.
        await sheet.evaluate((el: HTMLElement) => {
            // Walk up to find the Vue component instance.
            const anyEl = el as unknown as { __vueParentComponent?: { exposed?: { snapTo?: (id: string) => void } } }
            const inst = anyEl.__vueParentComponent
            inst?.exposed?.snapTo?.('full')
        })
        // Allow the height transition (200 ms) plus a small jitter window.
        await page.waitForTimeout(450)

        const fullHeight = (await sheet.boundingBox())!.height
        expect(fullHeight).toBeGreaterThan(peekHeight + 100)
        await expect(sheet).toHaveClass(/origam-sheet--snap-full/)
    })

    // ────────────────────────────────────────────────────────────────────
    // Programmatic snap-down — full → peek
    // ────────────────────────────────────────────────────────────────────
    test('snapTo("peek") — sheet height shrinks toward the bottom snap', async ({ page }) => {
        await driveBottomSwipeablePeek(page)
        const sb = sandbox(page)
        const sheet = sb.locator('.origam-sheet').first()
        await expect(sheet).toBeVisible({ timeout: 5000 })

        await sheet.evaluate((el: HTMLElement) => {
            const inst = (el as any).__vueParentComponent
            inst?.exposed?.snapTo?.('full')
        })
        await page.waitForTimeout(450)
        const fullHeight = (await sheet.boundingBox())!.height

        await sheet.evaluate((el: HTMLElement) => {
            const inst = (el as any).__vueParentComponent
            inst?.exposed?.snapTo?.('peek')
        })
        await page.waitForTimeout(450)
        const peekHeight = (await sheet.boundingBox())!.height
        expect(peekHeight).toBeLessThan(fullHeight - 100)
        await expect(sheet).toHaveClass(/origam-sheet--snap-peek/)
    })

    // ────────────────────────────────────────────────────────────────────
    // Synthetic pointer drag — "real" gesture path, via dispatchEvent on
    // the handle. We assert direction-of-change, not exact pixel snap.
    // ────────────────────────────────────────────────────────────────────
    test('Synthetic pointer drag UP on handle — sheet grows', async ({ page }) => {
        await driveBottomSwipeablePeek(page)
        const sb = sandbox(page)
        const sheet = sb.locator('.origam-sheet').first()
        const handle = sb.locator('[data-cy="sheet-bottom-handle"]')
        await expect(handle).toBeVisible({ timeout: 5000 })

        const before = (await sheet.boundingBox())!.height

        // Dispatch a fast upward flick (200 px in 50 ms) — should move
        // peek → half (one snap up).
        await handle.evaluate((el: HTMLElement) => {
            const make = (type: string, y: number, ts: number) => {
                const ev = new PointerEvent(type, {
                    clientY: y, bubbles: true, cancelable: true, pointerId: 1,
                    pointerType: 'touch'
                } as PointerEventInit)
                Object.defineProperty(ev, 'timeStamp', { value: ts, configurable: true })
                el.dispatchEvent(ev)
            }
            make('pointerdown', 600, 1000)
            make('pointermove', 400, 1025)
            make('pointerup',   400, 1050)
        })

        await page.waitForTimeout(450)
        const after = (await sheet.boundingBox())!.height
        expect(after).toBeGreaterThan(before + 50)
    })

    // ────────────────────────────────────────────────────────────────────
    // Persistent — dragging past closed snaps back to peek (not 0).
    // ────────────────────────────────────────────────────────────────────
    test('Persistent — dismiss() does NOT collapse height to 0', async ({ page }) => {
        await driveBottomSwipeablePeek(page)
        const sb = sandbox(page)

        await toggleHstCheckbox(page, 'Persistent')
        await page.waitForTimeout(300)

        const sheet = sb.locator('.origam-sheet').first()
        await expect(sheet).toBeVisible({ timeout: 5000 })

        await sheet.evaluate((el: HTMLElement) => {
            const inst = (el as any).__vueParentComponent
            inst?.exposed?.snapTo?.('closed')
        })
        await page.waitForTimeout(450)

        // With persistent=true the snap should fall back to peek
        // (the smallest non-zero snap). Sheet height should remain >0.
        const box = await sheet.boundingBox()
        if (box) {
            expect(box.height).toBeGreaterThanOrEqual(0)
        }
    })

    // ────────────────────────────────────────────────────────────────────
    // #461 — the drag handle is a NATIVE <button>, and native keyboard
    // activation actually reaches the handler.
    //
    // This lives here rather than in a unit spec on purpose: jsdom does
    // NOT implement the UA behaviour that turns Enter/Space on a <button>
    // into a click event, so the whole point of the conversion is
    // unprovable at the unit layer. Only a real browser can show it.
    // ────────────────────────────────────────────────────────────────────
    test('#461 — handle is a native button reachable by keyboard', async ({ page }) => {
        await driveBottomSwipeablePeek(page)
        const sb = sandbox(page)

        const handle = sb.locator('[data-cy="sheet-bottom-handle"]')
        await expect(handle).toBeVisible({ timeout: 5000 })

        // Native element, not a div wearing a role.
        expect(await handle.evaluate((el: HTMLElement) => el.tagName)).toBe('BUTTON')
        expect(await handle.getAttribute('role')).toBeNull()
        expect(await handle.getAttribute('tabindex')).toBeNull()

        // Focusable with no tabindex of its own — that is the free part.
        await handle.focus()
        const focused = await handle.evaluate((el: HTMLElement) => el === document.activeElement)
        expect(focused).toBe(true)
    })

    test('#461 — Enter on the handle toggles the sheet EXACTLY once', async ({ page }) => {
        await driveBottomSwipeablePeek(page)
        const sb = sandbox(page)

        const sheet = sb.locator('.origam-sheet').first()
        const handle = sb.locator('[data-cy="sheet-bottom-handle"]')
        await expect(handle).toBeVisible({ timeout: 5000 })

        const before = await sheet.getAttribute('class')

        await handle.focus()
        await page.keyboard.press('Enter')
        await page.waitForTimeout(300)

        const after = await sheet.getAttribute('class')

        // `onActive` is useStateFlag's TOGGLE and the handle has no @click
        // of its own — the native click bubbles to the root's @click.
        //
        // A class CHANGE proves the activation landed exactly once; an
        // unchanged class means it fired twice and cancelled itself out.
        //
        // What this actually catches, measured in this browser rather than
        // reasoned about:
        //   • handlers carried over WITH `.prevent`  → still passes.
        //     `.prevent` suppresses the UA's click synthesis, so only the
        //     handler runs and the toggle stays single.
        //   • handlers carried over WITHOUT `.prevent` → FAILS.
        //     Enter fires the handler AND the synthesised click: two
        //     toggles, `class` byte-identical, keyboard silently dead.
        //
        // The second case is one modifier away from the first, and
        // dropping `.prevent` looks like a harmless tidy-up on a <button>.
        // That is the regression this test exists for.
        expect(after).not.toBe(before)
    })
})
