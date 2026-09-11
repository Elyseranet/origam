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
    // "Prop — color & bgColor" (index 3) has data-cy="btn-color-primary" with
    // bg-color="primary" — this is the only Variant where colorStyles
    // emits an inline background-color that changes per state
    // (rest / hover / active via tokenStylesForIntent + bgRole).
    await page.goto(variantUrl(3))

    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

    // Target the primary btn that has bg-color="primary" applied.
    // This btn has a data-cy attribute set directly in the story.
    const btn = sandbox.locator('[data-cy="btn-color-primary"]')
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
