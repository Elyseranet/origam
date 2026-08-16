import { expect, test } from '@playwright/test'

/**
 * OrigamBottomNav — `shift` mode non-regression.
 *
 * Variants visités (index → titre, 0-based, ordre des <Variant> dans la story) :
 *   0 → Design
 *
 * Bug fixed: `.origam-bottom-nav--shift` was meant to fade/slide the label of
 * every NON-selected button, but two independent defects in
 * `OrigamBottomNav.vue`'s scoped SCSS made it a no-op:
 *
 *   (a) The exclusion selector read `:not(#{$this}__item--selected)`, i.e.
 *       `.origam-bottom-nav__item--selected` — but the class actually applied
 *       to a selected button (via `props.selectedClass`, the `useGroup`
 *       wiring) is `.origam-bottom-nav__btn--selected`. The selector never
 *       matched, so `:not(...)` was always true and EVERY button — selected
 *       included — got `opacity: 0` on its label.
 *   (b) The slide distance was written as a custom property
 *       (`--origam-bottom-bar__content--transform`) on `.origam-btn__content`
 *       and read via `transform: var(...)` on the ANCESTOR
 *       `.origam-bottom-nav__content`. Custom properties only cascade to
 *       descendants, never back up to an ancestor, so the translateY never
 *       reached any element that actually renders — the label never moved.
 *
 * This spec drives the real running component (not a stylesheet-rule
 * inspection) so it fails under the old code and passes under the fix:
 *   - selects one button via a real click (exercises `useGroup`/`useGroupItem`)
 *   - injects the `--shift` modifier class directly on the mounted root
 *     (same technique already used by alert.spec.ts / btn.spec.ts / etc. for
 *     modifier classes that aren't wired to a dedicated story control)
 *   - asserts computed style on both the selected and a non-selected button
 */

const STORY_ID = 'components-stories-bottomnav-origambottomnav-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID
// Variant 0 = "Design" — model-value=true, 3 items (home/search/profile),
// no pre-selection, no `mandatory` — a clean slate to click one item and
// compare it against the two that remain unselected.
const designUrl = `${STORY_PATH}?variantId=${STORY_ID}-0`

test.describe('OrigamBottomNav — shift mode', () => {
    test.setTimeout(45000)

    test('selected button keeps its label visible; non-selected labels fade + slide', async ({ page }) => {
        await page.goto(designUrl)
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        const nav = sandbox.locator('.origam-bottom-nav').first()
        await expect(nav).toBeVisible({ timeout: 12000 })

        const buttons = nav.locator('.origam-btn')
        await expect(buttons).toHaveCount(3)

        // Click the first button — toggles it selected via useGroup/useGroupItem,
        // which applies BottomNav's `selectedClass` prop
        // ('origam-bottom-nav__btn--selected') to that .origam-btn. Do this
        // BEFORE injecting the shift class: the root's `:class` binding is
        // reactive (`bottomNavClasses`), and the click also flips the
        // `hovered` class via `useHover` — either re-render would wipe out
        // a manually-added class that isn't part of the reactive binding.
        const selectedBtn = buttons.nth(0)
        await selectedBtn.click()
        await expect(selectedBtn).toHaveClass(/origam-bottom-nav__btn--selected/)

        // Activate shift mode directly on the mounted root, AFTER the click
        // has settled — the Design variant doesn't expose a `mode` control,
        // and driving Histoire's custom HstSelect dropdown is documented as
        // fragile in this suite (see btn.spec.ts header comment); injecting
        // the modifier class is the established pattern for scoped rules
        // with no dedicated control (see alert.spec.ts / btn.spec.ts).
        await nav.evaluate(el => el.classList.add('origam-bottom-nav--shift'))

        const nonSelectedBtn = buttons.nth(1)
        await expect(nonSelectedBtn).not.toHaveClass(/origam-bottom-nav__btn--selected/)

        const selectedContentStyle = await selectedBtn.locator('.origam-btn__content').evaluate(el => {
            const cs = getComputedStyle(el)
            return { opacity: cs.opacity, transform: cs.transform }
        })
        const nonSelectedContentStyle = await nonSelectedBtn.locator('.origam-btn__content').evaluate(el => {
            const cs = getComputedStyle(el)
            return { opacity: cs.opacity, transform: cs.transform }
        })

        // (a) Selector fix — the selected button's label must stay fully visible.
        expect(selectedContentStyle.opacity, 'selected button content opacity').toBe('1')
        expect(selectedContentStyle.transform, 'selected button content transform').toBe('none')

        // (a) + (b) — a non-selected button's label must fade AND actually slide.
        expect(nonSelectedContentStyle.opacity, 'non-selected button content opacity').toBe('0')
        // translateY(0.5rem) at the default 16px root font-size = 8px,
        // serialised by getComputedStyle as a 2D matrix: matrix(1, 0, 0, 1, 0, 8).
        expect(nonSelectedContentStyle.transform, 'non-selected button content transform (translateY(0.5rem))')
            .toBe('matrix(1, 0, 0, 1, 0, 8)')
    })
})
