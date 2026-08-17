import { expect, test } from '@playwright/test'

/**
 * Visual-regression net for `OrigamBtn`'s `variant` prop.
 *
 * WHY THIS SPEC EXISTS — see packages/tests/vrt/VRT.md for the full
 * writeup. Short version: ADR-005 (docs/adr-005-variant-props-preset)
 * turns `variant` from a CSS class into a props preset. A renamed prop is
 * caught by the type-checker; a variant that silently stops painting is
 * not — nothing in the existing 175 e2e specs asserted on a rendered
 * screenshot before this suite. This is the pilot: `OrigamBtn`, the
 * highest-risk / first-migrated component (7 `variant` values), and
 * nothing else. Widening to other `variant`-carrying components is a
 * follow-up, not bundled here — see VRT.md "Scope" section for why.
 *
 * DETERMINISM — the story Variant this spec targets ("Prop — variant (VRT
 * matrix)", packages/stories/components/stories/Btn/OrigamBtn.story.vue)
 * was written specifically for this suite:
 *   - static props only (no HstSelect/HstCheckbox driving), so there is
 *     nothing to race against Histoire's async postMessage state sync
 *     (packages/tests/e2e/KNOWN_LIMITATIONS.md) — we capture the resting
 *     render, never a post-interaction state.
 *   - no icons (no @mdi/font glyph to wait on), no loading state (no
 *     spinner animation), no hover/active (no transition to freeze mid-
 *     flight) — every button is captured at rest, on first paint.
 *   - a fixed `data-cy` per variant so each screenshot targets exactly
 *     one element, not a locator that might match a different node
 *     between runs.
 */

const STORY_ID = 'components-stories-btn-origambtn-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID
// "Prop — variant (VRT matrix)" is Variant index 15 (the LAST Variant in
// the file, appended after the "Default" playground rather than in its
// canonical position next to "Prop — color & bgColor" — see VRT.md "Un
// détail qui a failli casser la suite existante" for why: inserting it
// mid-file shifts every numeric variantId index e2e/btn.spec.ts hardcodes,
// silently breaking 10 of its tests). Verified by
// `grep -n '<Variant' OrigamBtn.story.vue` (see recipe in e2e/btn.spec.ts).
//
// Index table — the row below is what makes this reference auditable by
// e2e/_support/audit-variant-pins.mjs. Until that guard was widened to walk
// `vrt/` (it only ever walked `e2e/`), this file was outside the net entirely:
// its hardcoded index was invisible to the audit, and a Variant removed above
// index 15 would have shifted it with nothing to flag the drift.
// 15 → Prop — variant (VRT matrix)
const VRT_VARIANT_URL = `${STORY_PATH}?variantId=${STORY_ID}-15`

const BTN_VARIANTS = ['text', 'flat', 'elevated', 'tonal', 'outlined', 'plain', 'ghost'] as const

test.describe('OrigamBtn — variant visual regression', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(VRT_VARIANT_URL)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const matrix = sandbox.locator('[data-cy="btn-variant-matrix"]')
        await expect(matrix).toBeVisible({ timeout: 15000 })

        // Wait out web-font loading (Inter / fallback stack) before any
        // screenshot is taken — a font swap mid-suite would produce a
        // false-positive diff unrelated to the component under test.
        await matrix.evaluate(async () => {
            await document.fonts.ready
        })
    })

    for (const variant of BTN_VARIANTS) {
        test(`variant="${variant}" renders as the committed baseline`, async ({ page }) => {
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator(`[data-cy="btn-variant-${variant}"]`)
            await expect(btn).toBeVisible({ timeout: 15000 })

            await expect(btn).toHaveScreenshot(`btn-variant-${variant}.png`, {
                animations: 'disabled',
                caret: 'hide'
            })
        })
    }
})
