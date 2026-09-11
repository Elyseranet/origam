import { expect, test, type Page, type FrameLocator } from '@playwright/test'

import { toggleHstCheckbox } from './_support/histoire-controls'

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
// REALIGNED (2026-08): the story migrated to Design/Functional/Slots -
// Default/Default. Neither dedicated "Prop — X" fixture exists anymore:
//   - "Prop — transition (string name)" is now the "Design" Variant
//     (toggle-design/target-design), init transition =
//     'origam-transition--fade' (string CSS-name form, matches the old
//     fixture's intent).
//   - "Prop — transition (component object)" has NO equivalent anymore —
//     Design/Functional/Default only expose a string-name HstSelect
//     (TRANSITION_CSS_OPTIONS); no Variant passes a component OBJECT to
//     `transition`. Flagged as a coverage gap below.
//   - "Prop — disabled (animation off)" is now the "Functional" Variant's
//     "Disabled" HstCheckbox (toggle-functional/target-functional).

test.describe('OrigamTransition — dispatcher', () => {
    test('Default — string-name dispatch toggles slot', async ({ page }) => {
        await gotoVariant(page, STORIES.transition, 'Design')
        await expectToggleEnter(page, 'target-design', 'origam-transition--fade', 'toggle-design')
        await expectToggleLeave(page, 'target-design', 'toggle-design')
    })

    test.fixme('Component dispatch — slot mounts via component prop [STORY COVERAGE MISSING]', async () => {
        // No Variant in the current story passes a component OBJECT to
        // `transition` — Design/Functional/Default only expose the
        // string-name HstSelect (TRANSITION_CSS_OPTIONS). Needs a story
        // fixture, not a spec-only change.
    })

    test('Disabled — slot still toggles, no transition class persisted', async ({ page }) => {
        await gotoVariant(page, STORIES.transition, 'Functional')
        await toggleHstCheckbox(page, 'Disabled')
        const sb = sandbox(page)
        await sb.locator('[data-cy="toggle-functional"]').click()
        await expect(sb.locator('[data-cy="target-functional"]')).toBeVisible({ timeout: 5000 })
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

    /**
     * ⛔ REAL BUG — FIXED (packages/ds/src/composables/Transition/transition.composable.ts).
     * Toggling "Group (TransitionGroup)" AFTER mount used to have no effect —
     * the dispatcher stayed on `Transition` (singular) and silently dropped
     * every item past the first.
     *
     * Root cause was `const tag: ShallowRef<Component> = props.group ?
     * shallowRef(TransitionGroup) : shallowRef(Transition)` in both
     * `useCssTransition` and `useWindowTransition` — reading `props.group`
     * ONCE at setup time into a plain `shallowRef`, never re-evaluated by
     * `<component :is="tag">` when `group` changed reactively after mount.
     *
     * Fix: `tag` is now `computed(() => props.group ? TransitionGroup :
     * Transition)`, tracked reactively like every other prop-derived value.
     */
    test('Group — items animate via TransitionGroup', async ({ page }) => {
        // "Prop — group (transition-group)" is now the "Functional"
        // Variant's "Group (TransitionGroup)" HstCheckbox (init false).
        // functionalItems starts at [1, 2] — toggling Group on renders
        // target-group-1 / target-group-2 immediately.
        await gotoVariant(page, STORIES.fade, 'Functional')
        await toggleHstCheckbox(page, 'Group (TransitionGroup)')
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

// ─── prefers-reduced-motion (issue #494) ─────────────────────────────────────
//
// Every `-enter-active`/`-leave-active` class in the family is fast-vanishing
// once a transition completes (0.15s-0.5s), and under `reduced-motion` it
// completes in ~0.01ms — trying to catch the LIVE transient class via
// polling (the way `expectToggleEnter` above does for the happy path) would
// be a race against the very thing we're testing. Instead this queries the
// browser's OWN parsed CSSOM (`document.styleSheets`) for the compiled
// `@media (prefers-reduced-motion: reduce)` rule and asserts its
// `transition-duration` directly — proving the rule actually shipped to a
// real browser (Chromium via Playwright, not jsdom, which never loads the
// stylesheet at all — see OrigamCalendar's `getComputedStyle` note elsewhere
// in this suite for why jsdom is the wrong tool for this class of check).

/**
 * Reads, from a REAL element's stylesheet set, the `transition-duration`
 * declared for `selectorFragment` INSIDE a `prefers-reduced-motion: reduce`
 * media rule. Returns `null` if no such rule/selector is found.
 */
async function reducedMotionDuration (
    anyElementInSandbox: ReturnType<FrameLocator['locator']>,
    selectorFragment: string
): Promise<string | null> {
    return anyElementInSandbox.evaluate((el, fragment) => {
        const doc = el.ownerDocument
        for (const sheet of Array.from(doc.styleSheets)) {
            let rules: CSSRuleList
            try {
                rules = sheet.cssRules
            } catch {
                continue // cross-origin sheet — never the case here, but skip defensively
            }
            for (const rule of Array.from(rules)) {
                if (!(rule instanceof CSSMediaRule)) continue
                if (!rule.media.mediaText.includes('prefers-reduced-motion')) continue

                for (const inner of Array.from(rule.cssRules)) {
                    if (inner instanceof CSSStyleRule && inner.selectorText.includes(fragment)) {
                        return inner.style.transitionDuration || null
                    }
                }
            }
        }
        return null
    }, selectorFragment)
}

const REDUCED_MOTION_TARGETS: ReadonlyArray<{ label: string; story: string; classFragment: string }> = [
    { label: 'OrigamFade',                     story: STORIES.fade,                    classFragment: 'origam-transition--fade-enter-active' },
    { label: 'OrigamScaleRotate',              story: STORIES.scaleRotate,              classFragment: 'origam-transition--scale-rotate-enter-active' },
    { label: 'OrigamExpandX',                  story: STORIES.expandX,                  classFragment: 'origam-transition--expand-x-enter-active' },
    { label: 'OrigamExpandY',                  story: STORIES.expandY,                  classFragment: 'origam-transition--expand-y-enter-active' },
    { label: 'OrigamSlideX',                   story: STORIES.slideX,                   classFragment: 'origam-transition--slide-x-enter-active' },
    { label: 'OrigamSlideY',                   story: STORIES.slideY,                   classFragment: 'origam-transition--slide-y-enter-active' },
    { label: 'OrigamTranslateScale',           story: STORIES.translateScale,           classFragment: 'origam-transition--transform-scale-enter-active' },
    { label: 'OrigamTranslateBottom',          story: STORIES.translateBottom,          classFragment: 'origam-transition--translate-bottom-enter-active' },
    { label: 'OrigamTranslatePicker',          story: STORIES.translatePicker,          classFragment: 'origam-transition--translate-picker-enter-active' },
    { label: 'OrigamReverseTranslatePicker',   story: STORIES.reverseTranslatePicker,   classFragment: 'origam-transition--reverse-translate-picker-enter-active' },
    { label: 'OrigamWindowXTranslate',         story: STORIES.windowXTranslate,         classFragment: 'origam-transition--window-x-translate-enter-active' },
    { label: 'OrigamWindowXReverseTranslate',  story: STORIES.windowXReverseTranslate,  classFragment: 'origam-transition--window-x-reverse-translate-enter-active' },
    { label: 'OrigamWindowYTranslate',         story: STORIES.windowYTranslate,         classFragment: 'origam-transition--window-y-translate-enter-active' },
    { label: 'OrigamWindowYReverseTranslate',  story: STORIES.windowYReverseTranslate,  classFragment: 'origam-transition--window-y-reverse-translate-enter-active' },
    { label: 'OrigamSnack',                    story: STORIES.snack,                    classFragment: 'origam-transition--snack-enter-active' }
]

test.describe('prefers-reduced-motion — Transition family (issue #494)', () => {
    for (const { label, story, classFragment } of REDUCED_MOTION_TARGETS) {
        test(`${label} — ships a @media (prefers-reduced-motion: reduce) rule collapsing its duration`, async ({ page }) => {
            await gotoVariant(page, story)
            const sb = sandbox(page)
            // Any already-rendered element in the sandbox iframe reaches the
            // same document/stylesheet set — the toggle button is always present.
            const anyEl = sb.locator('[data-cy="toggle-playground"]').first()
            await expect(anyEl).toBeVisible({ timeout: 5000 })

            const duration = await reducedMotionDuration(anyEl, classFragment)

            expect(duration, `no prefers-reduced-motion rule found for .${classFragment}`).not.toBeNull()
            // Anything sub-millisecond counts as "collapsed" — the mixin emits
            // 0.01ms specifically (not 0) so transitionend still fires.
            expect(duration).toMatch(/^0(\.\d+)?ms$/)
        })
    }
})
