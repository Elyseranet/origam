import { test, expect } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId (cf. btn.spec.ts).
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamBtn (0-based) — état au 2026-06-30 :
 *   0  → Design
 *   1  → State
 *   2  → Functional
 *   3  → Prop — color & bgColor
 *   4  → Prop — loading (interactive)
 *   5  → Events - click
 *   …
 *  14  → Default (playground)
 */

const STORY_ID   = 'components-stories-btn-origambtn-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.setTimeout(180_000)

test('DEBUG btn — hover and active produce DIFFERENT bg colors for primary intent', async ({ page }) => {
    // Navigate directly to the Variant that renders btns with bgColor="primary".
    // "Prop — color & bgColor" (index 3).
    //
    // ⚠️ This test used `data-cy="btn-color-primary"` until 2026-08-27. That
    // fixture has no explicit `variant`, so — since the origam baseline
    // theme started defaulting every unvarianted Btn to `variant: 'text'`
    // (packages/ds/src/themes/origam.theme.ts, commit 9a082b90, 2026-06-27,
    // AFTER this test and its underlying feature ff894221 were written) —
    // it resolves to `.origam-btn--variant-text`, which unconditionally
    // forces `background-color: transparent !important`
    // (btn.spec.ts:591, a deliberate, tested contract). bgColor has never
    // painted a visible fill on it since, in ANY state — rest, hover AND
    // active were all identical `rgb(245, 245, 245)` (the resting
    // secondary-token fallback, not even primary). The theme change quietly
    // broke this test's premise without anyone re-verifying it — a classic
    // "test périmé": correct when written, invalidated by a later,
    // deliberate architecture decision.
    //
    // Repointed at `data-cy="btn-flat-color-primary"` (variant="flat",
    // bg-color="primary"), added specifically for this test — flat isn't
    // subject to the text-variant contract, so it actually exercises the
    // hover/active color-mix derivation (ff894221: hover = 20 % darker,
    // active = 30 % darker) this test was created to guard.
    await page.goto(variantUrl(3), { waitUntil: 'domcontentloaded' })

    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

    const btn = sandbox.locator('[data-cy="btn-flat-color-primary"]')
    await expect(btn).toBeVisible({ timeout: 12000 })

    const btnCount = await btn.count().catch(() => 0)
    if (!btnCount) {
        console.log('btn-color-primary not found — story may have changed')
        return
    }

    // Read resting background-color (inline style from colorStyles when resting).
    const rest = await btn.evaluate((el: HTMLElement) => getComputedStyle(el).backgroundColor)

    // Hover: trigger mouseenter on the btn element inside the iframe.
    await btn.hover({ force: true })
    await page.waitForTimeout(200)
    const hovered = await btn.evaluate((el: HTMLElement) => getComputedStyle(el).backgroundColor)

    // Active: simulate mousedown via dispatchEvent inside the iframe so that
    // coordinates stay relative to the sandbox frame (page.mouse.down() would
    // target coordinates in the outer page frame and miss the element).
    await btn.dispatchEvent('mousedown', { bubbles: true, cancelable: true })
    await page.waitForTimeout(200)
    const active = await btn.evaluate((el: HTMLElement) => getComputedStyle(el).backgroundColor)
    await btn.dispatchEvent('mouseup', { bubbles: true, cancelable: true })

    console.log('=== btn bg progression ===')
    console.log(JSON.stringify({ rest, hovered, active }, null, 2))

    await btn.screenshot({ path: '/tmp/btn-progression.png' })

    // Assertions: at minimum, rest / hover / active must differ from each other.
    // The regression being guarded here was hover === active because the JS collapsed
    // isActive into the 'hover' role in useStateEffect (bgRole stayed 'hover' even
    // during mousedown because isActive was not flipping to true).
    if (rest && hovered) expect(hovered).not.toBe(rest)
    if (rest && active) expect(active).not.toBe(rest)
    if (hovered && active) expect(active).not.toBe(hovered)
})
