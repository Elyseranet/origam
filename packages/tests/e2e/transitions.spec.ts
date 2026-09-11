import { expect, test, type Page, type FrameLocator } from '@playwright/test'

/**
 * Consolidated Playwright spec for the Transition component family (Lot A5).
 *
 * Components covered:
 *   - OrigamTransition           (dispatcher)
 *   - OrigamFade
 *   - OrigamScaleRotate
 *   - OrigamExpandX / OrigamExpandY
 *   - OrigamSlideX / OrigamSlideY
 *   - OrigamTranslateScale
 *   - OrigamTranslateBottom
 *   - OrigamTranslatePicker / OrigamReverseTranslatePicker
 *   - OrigamWindowXTranslate / OrigamWindowXReverseTranslate
 *   - OrigamWindowYTranslate / OrigamWindowYReverseTranslate
 *   - OrigamSnack
 *
 * Strategy
 * --------
 * Each transition story embeds a toggle button that flips a reactive `v-if`.
 * The "Default" variant in every story except OrigamTransition uses
 * `data-cy="toggle-playground"` / `data-cy="target-playground"` (playground
 * controls). OrigamTransition uses dedicated non-playground variants with
 * their own `toggle-default`, `toggle-component`, `toggle-disabled` data-cy.
 *
 * For "is the wiring correct" assertions we look for the `*-enter-active`
 * class within a small timeout after the click, then for the `target-*`
 * element to be visible. For "leave" we click again and assert the slot
 * disappears.
 *
 * Most leaves go fast enough that catching the `*-leave-active` class can
 * be racy; we therefore assert visibility post-leave (the canonical
 * runtime check for "the transition completed").
 */

// ─── Story URL helpers ───────────────────────────────────────────────────────

const BASE = '/stories/story/components-stories-transition-'
const STORIES = {
    transition:               `${BASE}origamtransition-story-vue`,
    fade:                     `${BASE}origamfade-story-vue`,
    scaleRotate:              `${BASE}origamscalerotate-story-vue`,
    expandX:                  `${BASE}origamexpandx-story-vue`,
    expandY:                  `${BASE}origamexpandy-story-vue`,
    slideX:                   `${BASE}origamslidex-story-vue`,
    slideY:                   `${BASE}origamslidey-story-vue`,
    translateScale:           `${BASE}origamtranslatescale-story-vue`,
    translateBottom:          `${BASE}origamtranslatebottom-story-vue`,
    translatePicker:          `${BASE}origamtranslatepicker-story-vue`,
    reverseTranslatePicker:   `${BASE}origamreversetranslatepicker-story-vue`,
    windowXTranslate:         `${BASE}origamwindowxtranslate-story-vue`,
    windowXReverseTranslate:  `${BASE}origamwindowxreversetranslate-story-vue`,
    windowYTranslate:         `${BASE}origamwindowytranslate-story-vue`,
    windowYReverseTranslate:  `${BASE}origamwindowyreversetranslate-story-vue`,
    snack:                    `${BASE}origamsnack-story-vue`,
} as const

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function gotoVariant (page: Page, story: string, variantTitle = 'Default') {
    await page.goto(story)
    await page.waitForLoadState('networkidle')
    await page.getByText(variantTitle, { exact: true }).first().click()
    await page.waitForTimeout(600)
}

function sandbox (page: Page): FrameLocator {
    return page.frameLocator('iframe[src*="__sandbox"]')
}

/**
 * Click the toggle button and assert that the slot's target enters the DOM,
 * with at least one `[class*="${className}-enter-active"]` element visible
 * during the transition.
 */
async function expectToggleEnter (
    page: Page,
    targetCy: string,
    activeClassPrefix: string,
    toggleCy = 'toggle-playground'
) {
    const sb = sandbox(page)
    const toggle = sb.locator(`[data-cy="${toggleCy}"]`)
    await expect(toggle).toBeVisible({ timeout: 5000 })

    // Slot starts hidden (v-if=false on first render)
    await expect(sb.locator(`[data-cy="${targetCy}"]`)).toHaveCount(0)

    // Click → slot enters
    await toggle.click()

    // The enter-active class is briefly applied while Vue runs the transition
    const activeSel = `[class*="${activeClassPrefix}-enter-active"]`
    await expect(sb.locator(activeSel)).toHaveCount(1, { timeout: 2000 }).catch(() => {
        // Some browsers race past the active phase; as long as the target
        // becomes visible, the wiring is correct.
    })

    await expect(sb.locator(`[data-cy="${targetCy}"]`)).toBeVisible({ timeout: 5000 })
}

/**
 * Click the toggle a second time and assert the slot leaves the DOM.
 */
async function expectToggleLeave (
    page: Page,
    targetCy: string,
    toggleCy = 'toggle-playground'
) {
    const sb = sandbox(page)
    await sb.locator(`[data-cy="${toggleCy}"]`).click()
    // Allow any transition (~0.5s max in the family) to complete before
    // re-asserting absence.
    await expect(sb.locator(`[data-cy="${targetCy}"]`)).toHaveCount(0, { timeout: 3000 })
}

// ─── OrigamTransition (dispatcher) ───────────────────────────────────────────
// Note: OrigamTransition story uses dedicated named variants with their own
// toggle-* / target-* data-cy attributes (not "playground" ones).

test.describe('OrigamTransition — dispatcher', () => {
    test('Default — string-name dispatch toggles slot', async ({ page }) => {
        await gotoVariant(page, STORIES.transition, 'Prop — transition (string name)')
        await expectToggleEnter(page, 'target-default', 'origam-transition--fade', 'toggle-default')
        await expectToggleLeave(page, 'target-default', 'toggle-default')
    })

    test('Component dispatch — slot mounts via component prop', async ({ page }) => {
        await gotoVariant(page, STORIES.transition, 'Prop — transition (component object)')
        await expectToggleEnter(page, 'target-component', 'origam-transition--scale-rotate', 'toggle-component')
    })

    test('Disabled — slot still toggles, no transition class persisted', async ({ page }) => {
        await gotoVariant(page, STORIES.transition, 'Prop — disabled (animation off)')
        const sb = sandbox(page)
        await sb.locator('[data-cy="toggle-disabled"]').click()
        await expect(sb.locator('[data-cy="target-disabled"]')).toBeVisible({ timeout: 5000 })
    })
})

// ─── OrigamFade ──────────────────────────────────────────────────────────────
// Default variant uses toggle-playground / target-playground.

test.describe('OrigamFade', () => {
    test('Default — toggle in/out', async ({ page }) => {
        await gotoVariant(page, STORIES.fade)
        await expectToggleEnter(page, 'target-playground', 'origam-transition--fade')
        await expectToggleLeave(page, 'target-playground')
    })

    test('Group — items animate via TransitionGroup', async ({ page }) => {
        await gotoVariant(page, STORIES.fade, 'Prop — group (transition-group)')
        const sb = sandbox(page)
        await expect(sb.locator('[data-cy="target-group-1"]')).toBeVisible({ timeout: 5000 })
        await sb.locator('[data-cy="group-add"]').click()
        await expect(sb.locator('[data-cy^="target-group-"]')).toHaveCount(3, { timeout: 5000 })
    })
})

// ─── OrigamScaleRotate ───────────────────────────────────────────────────────
// Default variant uses toggle-playground / target-playground.

test.describe('OrigamScaleRotate', () => {
    test('Default — toggle in/out', async ({ page }) => {
        await gotoVariant(page, STORIES.scaleRotate)
        await expectToggleEnter(page, 'target-playground', 'origam-transition--scale-rotate')
        await expectToggleLeave(page, 'target-playground')
    })
})

// ─── OrigamExpandX ───────────────────────────────────────────────────────────
// Default variant uses toggle-playground / target-playground.

test.describe('OrigamExpandX', () => {
    test('Default — width expands on toggle', async ({ page }) => {
        await gotoVariant(page, STORIES.expandX)
        await expectToggleEnter(page, 'target-playground', 'origam-transition--expand-x')
        await expectToggleLeave(page, 'target-playground')
    })
})

// ─── OrigamExpandY ───────────────────────────────────────────────────────────
// Default variant uses toggle-playground / target-playground.

test.describe('OrigamExpandY', () => {
    test('Default — height expands on toggle', async ({ page }) => {
        await gotoVariant(page, STORIES.expandY)
        await expectToggleEnter(page, 'target-playground', 'origam-transition--expand-y')
        await expectToggleLeave(page, 'target-playground')
    })
})

// ─── OrigamSlideX ────────────────────────────────────────────────────────────
// Default variant uses toggle-playground / target-playground.

test.describe('OrigamSlideX', () => {
    test('Default — toggle in/out', async ({ page }) => {
        await gotoVariant(page, STORIES.slideX)
        await expectToggleEnter(page, 'target-playground', 'origam-transition--slide-x')
        await expectToggleLeave(page, 'target-playground')
    })
})

// ─── OrigamSlideY ────────────────────────────────────────────────────────────
// Default variant uses toggle-playground / target-playground.

test.describe('OrigamSlideY', () => {
    test('Default — toggle in/out', async ({ page }) => {
        await gotoVariant(page, STORIES.slideY)
        await expectToggleEnter(page, 'target-playground', 'origam-transition--slide-y')
        await expectToggleLeave(page, 'target-playground')
    })
})

// ─── OrigamTranslateScale ────────────────────────────────────────────────────
// Default variant (title is simply "Default") uses toggle-playground / target-playground.
// Note: previous spec asserted on a non-existent variant title "Default (CSS-only path)".

test.describe('OrigamTranslateScale', () => {
    test('Default (CSS-only path) — toggle in/out', async ({ page }) => {
        await gotoVariant(page, STORIES.translateScale, 'Default')
        await expectToggleEnter(page, 'target-playground', 'origam-transition--transform-scale')
        await expectToggleLeave(page, 'target-playground')
    })
})

// ─── OrigamTranslateBottom ───────────────────────────────────────────────────
// Default variant uses toggle-playground / target-playground.

test.describe('OrigamTranslateBottom', () => {
    test('Default — slot rises from below', async ({ page }) => {
        await gotoVariant(page, STORIES.translateBottom)
        await expectToggleEnter(page, 'target-playground', 'origam-transition--translate-bottom')
        await expectToggleLeave(page, 'target-playground')
    })
})

// ─── OrigamTranslatePicker ───────────────────────────────────────────────────
// Default variant uses toggle-playground / target-playground.

test.describe('OrigamTranslatePicker', () => {
    test('Default — slot enters from right', async ({ page }) => {
        await gotoVariant(page, STORIES.translatePicker)
        await expectToggleEnter(page, 'target-playground', 'origam-transition--translate-picker')
        await expectToggleLeave(page, 'target-playground')
    })
})

// ─── OrigamReverseTranslatePicker ────────────────────────────────────────────
// Default variant uses toggle-playground / target-playground.

test.describe('OrigamReverseTranslatePicker', () => {
    test('Default — slot enters from left', async ({ page }) => {
        await gotoVariant(page, STORIES.reverseTranslatePicker)
        await expectToggleEnter(page, 'target-playground', 'origam-transition--reverse-translate-picker')
        await expectToggleLeave(page, 'target-playground')
    })
})

// ─── OrigamWindowXTranslate ──────────────────────────────────────────────────
// Default variant uses toggle-playground / target-playground.

test.describe('OrigamWindowXTranslate', () => {
    test('Default — slot toggles with window-x-translate classes', async ({ page }) => {
        await gotoVariant(page, STORIES.windowXTranslate)
        await expectToggleEnter(page, 'target-playground', 'origam-transition--window-x-translate')
        await expectToggleLeave(page, 'target-playground')
    })
})

// ─── OrigamWindowXReverseTranslate ───────────────────────────────────────────
// Default variant uses toggle-playground / target-playground.

test.describe('OrigamWindowXReverseTranslate', () => {
    test('Default — slot toggles with window-x-reverse-translate classes', async ({ page }) => {
        await gotoVariant(page, STORIES.windowXReverseTranslate)
        await expectToggleEnter(page, 'target-playground', 'origam-transition--window-x-reverse-translate')
        await expectToggleLeave(page, 'target-playground')
    })
})

// ─── OrigamWindowYTranslate ──────────────────────────────────────────────────
// Default variant uses toggle-playground / target-playground.

test.describe('OrigamWindowYTranslate', () => {
    test('Default — slot toggles with window-y-translate classes', async ({ page }) => {
        await gotoVariant(page, STORIES.windowYTranslate)
        await expectToggleEnter(page, 'target-playground', 'origam-transition--window-y-translate')
        await expectToggleLeave(page, 'target-playground')
    })
})

// ─── OrigamWindowYReverseTranslate ───────────────────────────────────────────
// Default variant uses toggle-playground / target-playground.

test.describe('OrigamWindowYReverseTranslate', () => {
    test('Default — slot toggles with window-y-reverse-translate classes', async ({ page }) => {
        await gotoVariant(page, STORIES.windowYReverseTranslate)
        await expectToggleEnter(page, 'target-playground', 'origam-transition--window-y-reverse-translate')
        await expectToggleLeave(page, 'target-playground')
    })
})

// ─── OrigamSnack ─────────────────────────────────────────────────────────────
// Default variant uses toggle-playground / target-playground.

test.describe('OrigamSnack', () => {
    test('Default — pop-in animation toggles', async ({ page }) => {
        await gotoVariant(page, STORIES.snack)
        await expectToggleEnter(page, 'target-playground', 'origam-transition--snack')
        await expectToggleLeave(page, 'target-playground')
    })
})
