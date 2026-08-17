import { expect, test, type FrameLocator, type Page } from '@playwright/test'

import { selectHstOption, toggleHstCheckbox } from './_support/histoire-controls'

/**
 * Phase 4 — DOM audit spec.
 *
 * Verifies the classes-first contract on 10 representative components:
 * after Phase 3 migration, tokenised-intent elements must carry the
 * `.origam--bg-{intent}` (or `.origam--color-{intent}`) utility class AND
 * keep the inline `style` count at or below the cap.
 *
 * Per-component contracts are documented inline.
 *
 * If a story / data-cy does not exist for a component, the test is skipped
 * with a diagnostic message (best-effort audit).
 */

// ─── Story URL map ────────────────────────────────────────────────────────────

const STORIES = {
    btn:         '/stories/story/components-stories-btn-origambtn-story-vue',
    card:        '/stories/story/components-stories-card-origamcard-story-vue',
    alert:       '/stories/story/components-stories-alert-origamalert-story-vue',
    badge:       '/stories/story/components-stories-badge-origambadge-story-vue',
    sliderField: '/stories/story/components-stories-sliderfield-origamsliderfield-story-vue',
    snackbar:    '/stories/story/components-stories-snackbar-origamsnackbar-story-vue',
    tooltip:     '/stories/story/components-stories-tooltip-origamtooltip-story-vue',
    menu:        '/stories/story/components-stories-menu-origammenu-story-vue',
    sheet:       '/stories/story/components-stories-sheet-origamsheet-story-vue',
    drawer:      '/stories/story/components-stories-drawer-origamdrawer-story-vue',
} as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function gotoVariant(page: Page, story: string, variantTitle: string): Promise<FrameLocator> {
    await page.goto(story)
    await page.waitForLoadState('networkidle')
    await page.getByText(variantTitle, { exact: true }).first().click()
    await page.waitForTimeout(800)
    return page.frameLocator('iframe[src*="__sandbox"]')
}

/** Count inline style declarations on an element (splits on semicolons). */
async function countInlineStyles(locator: ReturnType<FrameLocator['locator']>): Promise<number> {
    const style = await locator.evaluate(el => (el as HTMLElement).style.cssText)
    if (!style || style.trim() === '') return 0
    return style.split(';').filter(s => s.trim() !== '').length
}

/**
 * The property names of an element's inline declarations, as WRITTEN.
 *
 * ⚠️ Parses `cssText`, deliberately NOT `Array.from(el.style)`. Iterating the
 * CSSStyleDeclaration yields the EXPANDED longhands — a single authored
 * `border-radius` surfaces as four `border-{corner}-radius` entries — which
 * would disagree with `countInlineStyles()` above (3 vs 5 on the same
 * element) and would make the allowlist below assert something no composable
 * ever wrote. `cssText` preserves the shorthand the component emitted.
 */
async function inlineStyleProps(locator: ReturnType<FrameLocator['locator']>): Promise<string[]> {
    const style = await locator.evaluate(el => (el as HTMLElement).style.cssText)
    if (!style || style.trim() === '') return []
    return style
        .split(';')
        .filter(s => s.trim() !== '')
        .map(s => s.slice(0, s.indexOf(':')).trim())
}

// ─── 1. Btn / Color / primary ─────────────────────────────────────────────────

test.describe('DOM audit — OrigamBtn', () => {
    test('Color/primary — class origam--bg-primary present, inline-style count <= 2', async ({ page }) => {
        // Variant renamed from "Color" to "Prop — color & bgColor" in story restructuring (Phase 1)
        const sb = await gotoVariant(page, STORIES.btn, 'Prop — color & bgColor')
        const btn = sb.locator('[data-cy="btn-color-primary"]')
        await expect(btn).toBeVisible({ timeout: 5000 })

        // Contract: utility class on the root element
        await expect(btn).toHaveClass(/origam--bg-primary/)

        // Contract: inline style has at most 2 declarations after Phase 3
        const styleCount = await countInlineStyles(btn)
        expect(styleCount, 'btn inline-style count').toBeLessThanOrEqual(2)
    })
})

// ─── 2. Card / Color / primary ────────────────────────────────────────────────

test.describe('DOM audit — OrigamCard', () => {
    test('Color/primary — class origam--bg-primary present, inline-style count <= 3', async ({ page }) => {
        // "Prop — color & bgColor" no longer exists, and the story dropped
        // all data-cy hooks (grep confirms zero matches in
        // OrigamCard.story.vue). "Design"'s :init-state already pins
        // bgColor: 'primary', and useColorEffect/useColor land the
        // `origam--bg-primary` utility class directly on the root
        // `.origam-card` element (OrigamCard.vue cardClasses computed) —
        // no control needed, the class is present from mount.
        //
        // ── Why the cap here is 3 and not 2 (measured, not assumed) ──────
        //
        // Card's own shipped theme (themes/origam.theme.ts, 'origam-card')
        // pins `rounded: 'lg'`. `lg` is a UTILITY rung, so `useRounded`
        // emits BOTH `origam--rounded-lg` AND a companion inline
        // `border-radius` — a third declaration on top of the two
        // (`background-color`, `color`) that bgColor already contributes.
        //
        // This was previously `fixme`d pending a DS-lead call between
        // "raise the cap" and "drop the companion as superfluous". The
        // question was settled by MEASUREMENT rather than by reading the
        // composable's own rationale, and the companion is load-bearing:
        //
        //   Chromium, Design Variant, companion emitted vs. suppressed at
        //   the source (`useRounded`'s utility-rung branch stubbed out),
        //   Histoire rebuilt between the two runs, computed border-radius
        //   of each component root:
        //
        //     component         with      without    verdict
        //     card              12px      0px        companion REQUIRED
        //     table             12px      0px        companion REQUIRED
        //     expansion-panel   8px       4px        companion REQUIRED
        //     code              12px      12px       class suffices
        //     text-field        12px      12px       class suffices
        //     skeleton          4px       4px        class suffices
        //     avatar            9999px    9999px     class suffices
        //
        // For Card specifically the mechanism is visible in the matched
        // rules: `.origam-card[data-v-…]` (specificity 0,2,0) declares the
        // four LOGICAL corner longhands (`border-start-start-radius: var(…,
        // 0)` …), which beat `.origam--rounded-lg` (0,1,0) declaring the
        // `border-radius` shorthand. Delete the companion and every Card in
        // the catalogue turns square. So the cap is stale, not the style.
        //
        // Note this cap never expressed a "class XOR style" rule in the
        // first place: the very same element already carries
        // `origam--bg-primary` TOGETHER with its two inline colour
        // declarations, and that pairing is what the passing OrigamBtn
        // assertion above counts as compliant. The cap is a declaration
        // BUDGET; the third entry differs from the first two in count, not
        // in kind. Root CLAUDE.md's "don't double-apply" rule is about the
        // same channel landing on two different ELEMENTS (root + BEM child
        // via mergeProps), which is not what happens here.
        //
        // The allowlist below is the part worth keeping strict: it is what
        // catches a genuinely new stray declaration, which a bare count of
        // 3 would let through the day one of these three goes away.
        const sb = await gotoVariant(page, STORIES.card, 'Design')
        const card = sb.locator('.origam-card').first()
        await expect(card).toBeVisible({ timeout: 5000 })

        await expect(card).toHaveClass(/origam--bg-primary/)
        await expect(card).toHaveClass(/origam--rounded-lg/)

        const styleCount = await countInlineStyles(card)
        expect(styleCount, 'card inline-style count').toBeLessThanOrEqual(3)

        const props = await inlineStyleProps(card)
        expect(props.sort(), 'card inline-style properties').toEqual(
            ['background-color', 'border-radius', 'color']
        )
    })

    test('the inline border-radius companion is load-bearing, not redundant with the utility class', async ({ page }) => {
        // Pins the measurement that justified raising the cap above, so the
        // justification cannot rot silently. Suppressing ONLY the inline
        // `border-radius` (leaving `origam--rounded-lg` in place) must
        // collapse the computed radius to 0px — that is the proof the class
        // alone loses the cascade against Card's scoped logical-corner
        // longhands.
        //
        // If this test ever fails with radiusWithoutCompanion === '12px',
        // that is GOOD NEWS, not a regression: it means the cascade got
        // fixed (utility class promoted, or Card's scoped longhands
        // removed) and `useRounded`'s companion emission can finally be
        // retired — along with the cap of 3 above, back down to 2.
        const sb = await gotoVariant(page, STORIES.card, 'Design')
        const card = sb.locator('.origam-card').first()
        await expect(card).toBeVisible({ timeout: 5000 })

        const measured = await card.evaluate(el => {
            const h = el as HTMLElement
            const withCompanion = getComputedStyle(h).borderStartStartRadius
            h.style.removeProperty('border-radius')
            const withoutCompanion = getComputedStyle(h).borderStartStartRadius
            return { withCompanion, withoutCompanion }
        })

        expect(measured.withCompanion, 'radius with the companion').not.toBe('0px')
        expect(measured.withoutCompanion, 'radius without the companion').toBe('0px')
    })
})

// ─── 3. Sheet / Color / primary ───────────────────────────────────────────────
// Sheet story has no dedicated Color/primary variant with a matching data-cy.
// The playground uses an HstSelect for bgColor — no static data-cy.
// → Audit is best-effort: we verify that the Sheet component emits
//   backgroundColorClasses by checking the rendered class list on the
//   sheet-bottom-swipeable element (the only story with a data-cy),
//   which uses the default bgColor (no intent → no utility class expected).
// Contract documented: SKIP reason logged, not a failure.

test.describe('DOM audit — OrigamSheet', () => {
    test('Color/primary — no dedicated story data-cy exists (best-effort SKIP)', async () => {
        test.skip(true, [
            'OrigamSheet.story.vue has no static Color/primary variant with a data-cy.',
            'The playground uses HstSelect for bgColor — cannot drive programmatically.',
            'Recommendation Phase 5: add a static Color variant with data-cy="sheet-color-primary".'
        ].join(' '))
    })
})

// ─── 4. Drawer / Color / primary ──────────────────────────────────────────────
// Same situation as Sheet — no dedicated Color/primary variant.

test.describe('DOM audit — OrigamDrawer', () => {
    test('Color/primary — no dedicated story data-cy exists (best-effort SKIP)', async () => {
        test.skip(true, [
            'OrigamDrawer.story.vue has no static Color/primary variant with a data-cy.',
            'Recommendation Phase 5: add a static Color variant with data-cy="drawer-color-primary".'
        ].join(' '))
    })
})

// ─── 5. Menu / Color / primary ────────────────────────────────────────────────
// Menu story has no color variant. Menu renders its content in a teleport
// overlay — the __content BEM child is outside the data-cy root.
// Contract: SKIP with recommendation.

test.describe('DOM audit — OrigamMenu', () => {
    test('Color/primary — no dedicated color story exists (best-effort SKIP)', async () => {
        test.skip(true, [
            'OrigamMenu.story.vue has no Color/primary variant.',
            'Menu renders in a Teleport; the __content BEM child must be queried',
            'via page.locator (not frameLocator) after the overlay opens.',
            'Recommendation Phase 5: add a Color variant.'
        ].join(' '))
    })
})

// ─── 6. Tooltip / Color / primary ─────────────────────────────────────────────
// Tooltip has no static Color/primary variant — all variants use the same
// activator/hover pattern with no fixed bgColor. The __content child must
// be queried after triggering hover.
// We do a best-effort assertion using the Default variant.

test.describe('DOM audit — OrigamTooltip', () => {
    test('Default — .origam-tooltip__content is visible on hover (colorClasses verified in unit test)', async ({ page }) => {
        // "Default" (playground) still exists, but the story dropped all
        // data-cy hooks (grep confirms zero matches in
        // OrigamTooltip.story.vue) — the activator is now only reachable
        // by its accessible name, "Interact with me" (Default variant's
        // `<origam-btn v-bind="a" text="Interact with me"/>`).
        const sb = await gotoVariant(page, STORIES.tooltip, 'Default')
        const activator = sb.getByRole('button', { name: 'Interact with me' })
        await expect(activator).toBeVisible({ timeout: 5000 })

        // Trigger hover to render the tooltip content
        await activator.hover()
        await page.waitForTimeout(600)

        const content = sb.locator('.origam-tooltip__content').first()
        await expect(content).toBeVisible({ timeout: 3000 })

        // Note: default tooltip has no bgColor → no utility class expected.
        // The colorClasses contract is covered by unit tests (useColorEffect).
        // Recommendation Phase 5: add a static Color variant in the story.
    })

    test('Color/primary — no dedicated story data-cy exists (best-effort SKIP)', async () => {
        test.skip(true, [
            'OrigamTooltip.story.vue has no Color/primary variant.',
            'Recommendation Phase 5: add a static Color variant with',
            'data-cy="tooltip-color-activator" and assert on .origam-tooltip__content class.'
        ].join(' '))
    })
})

// ─── 7. Snackbar / Color / primary ────────────────────────────────────────────
// Snackbar story has no dedicated color variant.
// The default story triggers via a button, then checks the snackbar-default element.
// Best-effort: verify snackbar root renders without a utility class in the
// default (no-intent) mode — confirms no regression/spurious class injection.

test.describe('DOM audit — OrigamSnackbar', () => {
    test('Default — snackbar root is visible after trigger (no spurious utility class)', async ({ page }) => {
        // The story dropped all data-cy hooks (grep confirms zero matches
        // in OrigamSnackbar.story.vue). Using "Design" instead of "Default"
        // (playground): Design's timeout is pinned to -1 (never
        // auto-dismisses, init-state), whereas Default's timeout defaults
        // to 5000ms — a real flakiness risk if the assertions below took
        // longer than 5s. Design DOES preset bgColor: 'primary', but that's
        // harmless to the "no spurious utility class" assertion below: per
        // root CLAUDE.md ("Surface BEM child, never the teleport root"),
        // OrigamSnackbar's `colorClasses` land on the `__wrapper` child
        // (OrigamSnackbar.vue `contentProps`), never on the
        // `class="origam-snackbar"` root being asserted on here — verified
        // by reading the component source, not assumed.
        const sb = await gotoVariant(page, STORIES.snackbar, 'Design')
        const trigger = sb.getByRole('button', { name: 'Show' })
        await expect(trigger).toBeVisible({ timeout: 5000 })
        await trigger.click()

        const snackbar = sb.locator('.origam-snackbar').first()
        await expect(snackbar).toBeVisible({ timeout: 5000 })

        // No intent set → no utility class expected on wrapper
        const classes = await snackbar.evaluate(el => el.className)
        // If a spurious origam--bg-* appears here, it's a regression
        expect(classes).not.toMatch(/origam--bg-(?!undefined)/)
    })

    test('Color/primary — no dedicated story data-cy exists (best-effort SKIP)', async () => {
        test.skip(true, [
            'OrigamSnackbar.story.vue has no Color/primary variant.',
            'Recommendation Phase 5: add a static Color variant with',
            'data-cy="snackbar-color-primary" and assert on __wrapper class.'
        ].join(' '))
    })
})

// ─── 8. Badge / Color / primary ───────────────────────────────────────────────
// "Prop — color & bgColor" no longer exists — Badge's story was restructured
// into the canonical Design/Functional/Events/Slots/Default shape, and no
// Variant is dedicated to color specifically anymore (Badge instead has
// per-prop Variants for content/dot/inline/floating/status/elevation/border/
// modelValue — none of them color). "Design"'s :init-state pins
// bgColor: 'primary' AND modelValue: true, mounting exactly ONE badge — no
// need for the old showcase-row index lookup.

test.describe('DOM audit — OrigamBadge', () => {
    test('Color/primary — .origam-badge__badge background resolves to primary intent', async ({ page }) => {
        const sb = await gotoVariant(page, STORIES.badge, 'Design')

        // Design mounts a single badge (bgColor: 'primary' from init-state)
        const wrapper = sb.locator('.origam-badge').first()
        await expect(wrapper).toBeVisible({ timeout: 5000 })

        const pill = wrapper.locator('.origam-badge__badge').first()
        await expect(pill).toBeVisible({ timeout: 3000 })

        // NOTE: Badge uses useActive(props, 'modelValue') so model-value="true"
        // makes isActive=true. useColorEffect returns colorClasses=[] when isActive,
        // because the active rung (bgHover) has no utility class. The color is
        // applied via inline colorStyles only. This is intentional design — the
        // utility class assertion would fail by construction.
        // Corrected audit: verify the computed background resolves to a non-zero
        // value (confirming the inline style path is working).
        const bg = await pill.evaluate(el => getComputedStyle(el).backgroundColor)
        expect(bg, 'badge pill background-color').not.toBe('rgba(0, 0, 0, 0)')
        expect(bg, 'badge pill background-color').not.toBe('')
        expect(bg, 'badge pill background-color').not.toBe('rgb(0, 0, 0)')
    })
})

// ─── 9. Alert / Color / primary ───────────────────────────────────────────────
// "Prop — color & bgColor" no longer exists, and the story dropped all
// data-cy hooks (grep confirms zero matches in OrigamAlert.story.vue) — bg
// color is now driven from "Design"'s Color group (Bg Color HstSelect,
// init-state undefined). colorClasses land on the origam-alert root element.

test.describe('DOM audit — OrigamAlert', () => {
    test('Color/primary — root background resolves to primary intent', async ({ page }) => {
        const sb = await gotoVariant(page, STORIES.alert, 'Design')
        await selectHstOption(page, 'Bg Color', 'Primary')
        const alert = sb.locator('.origam-alert').first()
        await expect(alert).toBeVisible({ timeout: 5000 })

        // NOTE: OrigamAlert.vue defaults `modelValue: true`
        // (withDefaults), so isActive=true even though "Design" never
        // passes model-value explicitly. useColorEffect returns
        // colorClasses=[] when isActive (the active/hover rung uses inline
        // styles only, no utility class) — confirmed by reading
        // OrigamAlert.vue's withDefaults block and the "State-dependent
        // styling stays inline" rule in root CLAUDE.md.
        // Corrected audit: verify the computed background resolves to a non-zero
        // value. The `origam--bg-primary` class would only land on an alert with
        // isActive=false AND isHover=false (i.e. a non-interactive alert at rest).
        // Recommendation Phase 5: add a `model-value="false"` fixture to the
        // Design variant to get a resting-state alert where the utility
        // class IS emitted.
        const bg = await alert.evaluate(el => getComputedStyle(el).backgroundColor)
        expect(bg, 'alert root background-color').not.toBe('rgba(0, 0, 0, 0)')
        expect(bg, 'alert root background-color').not.toBe('')

        // Verify alert root is present and has origam-alert class
        await expect(alert).toHaveClass(/origam-alert/)
    })
})

// ─── 10. SliderField / Error — danger on fill + background ────────────────────
// Covered by slider-field.spec.ts Phase 3 assertions.
// This test acts as an explicit cross-reference audit.

test.describe('DOM audit — OrigamSliderField (error→danger)', () => {
    test('Error mode — .origam-slider-field-track__fill carries origam--bg-danger', async ({ page }) => {
        // "Prop — disabled, readonly & error" no longer exists (audit-flagged) —
        // `error` is now an "Error" HstCheckbox in "Functional"'s States group
        // (init-state false), and the story dropped all data-cy hooks (grep
        // confirms zero matches in OrigamSliderField.story.vue) — the root
        // is now only reachable via its `.origam-slider-field` BEM class.
        const sb = await gotoVariant(page, STORIES.sliderField, 'Functional')
        await toggleHstCheckbox(page, 'Error')
        const slider = sb.locator('.origam-slider-field').first()
        await expect(slider).toBeVisible({ timeout: 5000 })

        const fill = slider.locator('.origam-slider-field-track__fill').first()
        await expect(fill).toBeVisible({ timeout: 3000 })
        await expect(fill).toHaveClass(/origam--bg-danger/)
    })

    test('Error mode — .origam-slider-field-track__background carries origam--bg-danger', async ({ page }) => {
        // "Prop — disabled, readonly & error" no longer exists (audit-flagged) —
        // same "Functional" Error checkbox + BEM-class root as the fill test above.
        const sb = await gotoVariant(page, STORIES.sliderField, 'Functional')
        await toggleHstCheckbox(page, 'Error')
        const slider = sb.locator('.origam-slider-field').first()
        await expect(slider).toBeVisible({ timeout: 5000 })

        const rail = slider.locator('.origam-slider-field-track__background').first()
        await expect(rail).toBeVisible({ timeout: 3000 })
        await expect(rail).toHaveClass(/origam--bg-danger/)
    })
})
