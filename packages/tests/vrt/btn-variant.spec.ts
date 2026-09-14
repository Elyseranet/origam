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
// "Prop — variant (VRT matrix)" is Variant index 12. It is NO LONGER the
// last Variant in the file: it used to be appended after the "Default"
// playground specifically to keep the numeric indexes e2e/btn.spec.ts
// hardcodes from shifting (see VRT.md "Un détail qui a failli casser la
// suite existante"), but that placement violated the CLAUDE.md rule that
// the "Default" playground comes LAST, and it has been moved back above it.
//
// ⛔ That index has now moved TWICE in one branch — 15 → 14 when "Default"
// was restored to last, then 14 → 12 when the deprecated
// `Events - click:prepend` / `Events - click:append` Variants were removed
// (#443). The guard below is what caught both; it reported
// `vrt/btn-variant.spec.ts [index 15] RANGE` rather than letting the suite
// fail as a phantom visual diff. Always re-derive from the BUILD, never
// from a count by eye:
//   python3 -c "import json;d=json.load(open('packages/marketing/public/stories/histoire.json'));\
//     [print(i,v['title']) for s in d['stories'] if s['id'].endswith('btn-origambtn-story-vue') \
//      for i,v in enumerate(s['variants'])]"
//
// Index table — the row below is what makes this reference auditable by
// e2e/_support/audit-variant-pins.mjs. Until that guard was widened to walk
// `vrt/` (it only ever walked `e2e/`), this file was outside the net entirely:
// its hardcoded index was invisible to the audit, and a Variant removed above
// it would have shifted it with nothing to flag the drift.
// 12 → Prop — variant (VRT matrix)
const VRT_VARIANT_URL = `${STORY_PATH}?variantId=${STORY_ID}-12`

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
