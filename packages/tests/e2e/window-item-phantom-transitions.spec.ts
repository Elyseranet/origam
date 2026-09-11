import { expect, test, type Page } from '@playwright/test'

/**
 * Regression spec for issue #475 — "phantom transition names".
 *
 * `<OrigamWindowItem>`'s story AND doc both documented
 * `transition="origam-fade-transition"` / `"origam-scale-rotate-transition"`
 * as valid transition names, but NO CSS rule for either class existed
 * anywhere in the bundle — selecting either produced a hard cut, zero
 * animation, zero error. `<OrigamCarouselItem>` shares the exact same
 * defect (it forwards `transition`/`reverseTransition` straight through to
 * `<OrigamWindowItem>`, so the same CSS fixes both).
 *
 * This CANNOT be proven in jsdom (TU/vitest) — jsdom applies no real CSS
 * cascade and resolves no `var(...)` — hence a real browser via Playwright
 * against a running Histoire instance.
 *
 * Method: rather than driving Histoire's `HstSelect` custom dropdown (the
 * project's own story-testing convention flags picker dropdowns as
 * "custom DOM and brittle"), this spec proves the underlying claim
 * directly and robustly — that a REAL, correctly-computed CSS rule now
 * exists for each promised class name, in the actual bundled stylesheet
 * the story sandbox loads. That is exactly the gap the issue measured
 * (`grep` returning 0 matches) and exactly what must now be non-zero.
 */

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const STORY_ID = 'components-stories-window-origamwindowitem-story-vue'
// Variant index 3 = "Default" (the playground, the one with the Transition
// controls) — index 0 Functional, 1 Events - group:selected, 2 Slots -
// Default, 3 Default. Navigating straight to the story path with no
// variantId only shows Histoire's "Select a variant" picker.
const WINDOW_ITEM_PATH = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-3`

test.describe('OrigamWindowItem — origam-fade-transition / origam-scale-rotate-transition CSS (#475)', () => {
    test('the sandbox stylesheet defines real, working CSS for both promised transition names', async ({ page }) => {
        await page.goto(WINDOW_ITEM_PATH, { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-window').first()).toBeVisible({ timeout: 12000 })

        const frame = page.frames().find((f) => f.url().includes('__sandbox'))
        expect(frame).toBeTruthy()

        const probe = async (enterFromClass: string, leaveToClass: string) => {
            return frame!.evaluate(({ enterFromClass, leaveToClass }) => {
                const enterEl = document.createElement('div')
                enterEl.className = enterFromClass
                document.body.appendChild(enterEl)
                const enterFromOpacity = getComputedStyle(enterEl).opacity
                document.body.removeChild(enterEl)

                const leaveEl = document.createElement('div')
                leaveEl.className = leaveToClass
                document.body.appendChild(leaveEl)
                const leaveToPosition = getComputedStyle(leaveEl).position
                document.body.removeChild(leaveEl)

                return { enterFromOpacity, leaveToPosition }
            }, { enterFromClass, leaveToClass })
        }

        const fade = await probe('origam-fade-transition-enter-from', 'origam-fade-transition-leave-to')
        expect(fade.enterFromOpacity).toBe('0')
        expect(fade.leaveToPosition).toBe('absolute')

        const scaleRotate = await probe('origam-scale-rotate-transition-enter-from', 'origam-scale-rotate-transition-leave-to')
        expect(scaleRotate.enterFromOpacity).toBe('0')
        expect(scaleRotate.leaveToPosition).toBe('absolute')
    })

    test('sanity — an UNRELATED, never-promised class name has no matching CSS (the probe itself is discriminating)', async ({ page }) => {
        await page.goto(WINDOW_ITEM_PATH, { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-window').first()).toBeVisible({ timeout: 12000 })

        const frame = page.frames().find((f) => f.url().includes('__sandbox'))
        expect(frame).toBeTruthy()

        const result = await frame!.evaluate(() => {
            const el = document.createElement('div')
            el.className = 'origam-this-class-does-not-exist-enter-from'
            document.body.appendChild(el)
            const opacity = getComputedStyle(el).opacity
            document.body.removeChild(el)
            return opacity
        })

        // No rule targets this class — default computed opacity is 1, not 0.
        expect(result).toBe('1')
    })
})
