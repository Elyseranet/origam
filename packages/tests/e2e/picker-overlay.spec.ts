import { expect, test, type FrameLocator, type Page } from '@playwright/test'

import { eventLogItems, openEventsTab, selectHstOption, toggleHstCheckbox, fillHstText } from './_support/histoire-controls'

/**
 * Consolidated Playwright spec for the Picker + Overlay families
 * (Lots B4 + B5).
 *
 * Components covered:
 *   - OrigamPicker          (base picker shell, grid layout)
 *   - OrigamPickerTitle     (uppercase header sub-component)
 *   - OrigamOverlay         (teleported floating layer)
 *   - OrigamOverlayScrim    (standalone backdrop)
 *
 * REALIGNED (2026-08) — all four stories migrated to the canonical
 * Design/Functional/Events/Slots structure. NONE of the migrated
 * Variants pass a `data-cy` prop to any of these components (verified
 * by source read of every component in this family) — every old
 * `[data-cy="picker-*"]` / `[data-cy="overlay-*"]` / `[data-cy="scrim-*"]`
 * host is gone. Tests now locate elements structurally
 * (`.origam-picker`, `.origam-picker-title`, `.origam-overlay__content`,
 * `.origam-scrim`, activator buttons by their visible text) and drive
 * props that used to have a dedicated fixture through the "Design" /
 * "Functional" Variant's controls via the shared histoire-controls
 * helper. Where the pre-migration test only asserted the INITIAL state
 * because "HstSelect can't be driven" (a since-fixed limitation —
 * selectHstOption exists now), the color/elevation/rounded tests below
 * were upgraded to actually drive the control and assert the resulting
 * effect, instead of only checking the untouched default.
 *
 * Strategy
 * --------
 * Each variant is exercised via the Histoire sandbox iframe. The picker
 * shell is rendered inline (no teleport), so we look for it inside the
 * sandbox `body`. The overlay teleports its content to
 * `body > .origam-overlay-container`, which still lives inside the
 * sandbox iframe's document — locators based on the sandbox frame
 * therefore find it without any extra plumbing.
 *
 * Variant title → story file mapping (Histoire slug):
 *   OrigamPicker     → /story/components-stories-picker-origampicker-story-vue
 *   OrigamPickerTitle → /story/components-stories-picker-origampickertitle-story-vue
 *   OrigamOverlay    → /story/components-stories-overlay-origamoverlay-story-vue
 *   OrigamOverlayScrim → /story/components-stories-overlay-origamoverlayscrim-story-vue
 */

const PICKER_BASE       = '/stories/story/components-stories-picker-'
const OVERLAY_BASE      = '/stories/story/components-stories-overlay-'

const STORIES = {
    picker:        `${PICKER_BASE}origampicker-story-vue`,
    pickerTitle:   `${PICKER_BASE}origampickertitle-story-vue`,
    overlay:       `${OVERLAY_BASE}origamoverlay-story-vue`,
    scrim:         `${OVERLAY_BASE}origamoverlayscrim-story-vue`,
} as const

// ─── helpers ────────────────────────────────────────────────────────────────

async function gotoVariant (page: Page, story: string, variantTitle: string) {
    await page.goto(story)
    await page.waitForLoadState('networkidle')
    await page.getByText(variantTitle, { exact: true }).first().click()
    await page.waitForTimeout(700)
}

function sandbox (page: Page): FrameLocator {
    return page.frameLocator('iframe[src*="__sandbox"]')
}

// ════════════════════════════════════════════════════════════════════════════
// OrigamPicker
// ════════════════════════════════════════════════════════════════════════════

test.describe('OrigamPicker', () => {
    // "Prop — title" is now the "Design" Variant, init title: 'Picker'.
    test('Default — title prop renders inside .origam-picker__title', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Design')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker').first()
        await expect(picker).toBeVisible({ timeout: 5000 })
        await expect(picker.locator('.origam-picker__title')).toContainText('Picker')
        await expect(picker.locator('.origam-picker__body')).toBeVisible()
    })

    // "Prop — title (editable)" is now the "Default" Variant's Title HstText
    // control — the "Design" Variant doesn't expose Title as a control.
    test('Title prop — text reflects control state', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Default')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker').first()
        await fillHstText(page, 'Title', 'Pick a date')
        await page.waitForTimeout(300)
        await expect(picker.locator('.origam-picker__title')).toContainText('Pick a date')
    })

    // "Prop — hideHeader" is now the "Functional" Variant's Hide Header
    // HstCheckbox (init false) — toggled on to reach the removed fixture's
    // hideHeader=true state.
    test('Hide header — toggling hideHeader removes the title region', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Functional')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker').first()
        await expect(picker).toBeVisible()
        await expect(picker.locator('.origam-picker__title')).toHaveCount(1)

        await toggleHstCheckbox(page, 'Hide Header')
        await page.waitForTimeout(300)
        await expect(picker.locator('.origam-picker__title')).toHaveCount(0)
    })

    // "Prop — landscape" is now the "Functional" Variant's Landscape
    // HstCheckbox (init false).
    test('Landscape — modifier class flips the grid layout', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Functional')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker').first()
        await expect(picker).toBeVisible()
        await expect(picker).not.toHaveClass(/origam-picker--landscape/)

        await toggleHstCheckbox(page, 'Landscape')
        await page.waitForTimeout(300)
        await expect(picker).toHaveClass(/origam-picker--landscape/)
        await expect(picker.locator('.origam-picker__body')).toBeVisible()
    })

    // "Slot — actions" is now the "Slots - Actions" Variant.
    test('Slot — actions modifier class & buttons render', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Slots - Actions')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker').first()
        await expect(picker).toHaveClass(/origam-picker--has-actions/)
        await expect(picker.locator('.origam-picker__actions').getByText('Cancel', { exact: true })).toBeVisible()
        await expect(picker.locator('.origam-picker__actions').getByText('Save', { exact: true })).toBeVisible()
        await expect(picker.locator('.origam-picker__actions')).toBeVisible()
    })

    // "Slot — header" is now the "Slots - Header" Variant.
    test('Slot — header content renders inside .origam-picker__header', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Slots - Header')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker').first()
        await expect(picker.locator('.origam-picker__header')).toBeVisible()
        await expect(picker.locator('.origam-picker__header')).toContainText('Custom header content')
    })

    // "Slot — title" is now the "Slots - Title" Variant.
    test('Slot — title override replaces auto-rendered title', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Slots - Title')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker').first()
        const slotted = picker.locator('h2').first()
        await expect(slotted).toBeVisible()
        await expect(slotted).toContainText('Custom title via slot')
        // tag prop honoured
        await expect(slotted.evaluate((el) => el.tagName.toLowerCase())).resolves.toBe('h2')
    })

    // "Prop — color & bgColor" is now the "Design" Variant's Color/Bg Color
    // HstSelect controls — upgraded to actually drive the value (the old
    // "can't interact with HstSelect" limitation is fixed by selectHstOption).
    test('Color — bgColor select actually repaints the picker', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Design')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker').first()
        await expect(picker).toBeVisible({ timeout: 5000 })
        await expect(picker).toHaveClass(/origam--bg-primary/)

        await selectHstOption(page, 'Bg Color', 'Danger')
        await page.waitForTimeout(300)
        await expect(picker).toHaveClass(/origam--bg-danger/)
        const style = await picker.getAttribute('style')
        expect(style).toContain('background-color')
    })

    // "Prop — elevation" is now the "Design" Variant's Elevation HstSelect.
    test('Elevation — select drives a real box-shadow', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Design')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker').first()
        await expect(picker).toBeVisible({ timeout: 5000 })

        await selectHstOption(page, 'Elevation', 'LG (16)')
        await page.waitForTimeout(300)
        await expect(picker).toHaveClass(/origam--shadow-lg/)
        const shadow = await picker.evaluate((el) => getComputedStyle(el).boxShadow)
        expect(shadow).not.toBe('none')
    })

    // "Prop — rounded" is now the "Design" Variant's Rounded HstSelect.
    test('Rounded — select drives the rounded modifier class', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Design')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker').first()
        await expect(picker).toBeVisible({ timeout: 5000 })

        await selectHstOption(page, 'Rounded', 'large (radius.xl / 16px)')
        await page.waitForTimeout(300)
        await expect(picker).toHaveClass(/origam-sheet--rounded-large/)
    })

    // "Default" (playground) — title unchanged, still exists.
    test('Playground — mounts with composite props', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Default')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker').first()
        await expect(picker).toBeVisible()
        await expect(picker).toHaveClass(/origam-picker--has-actions/)
    })
})

// ════════════════════════════════════════════════════════════════════════════
// OrigamPickerTitle
// ════════════════════════════════════════════════════════════════════════════

test.describe('OrigamPickerTitle', () => {
    // "Prop — title" is now the "Design" Variant, init title: 'Pick a date'.
    test('Default — renders the title prop text', async ({ page }) => {
        await gotoVariant(page, STORIES.pickerTitle, 'Design')
        const sb = sandbox(page)
        const title = sb.locator('.origam-picker-title').first()
        await expect(title).toBeVisible()
        await expect(title).toContainText('Pick a date')
        await expect(title).toHaveClass(/origam-picker-title/)
    })

    // "Prop — title (editable)" is now the "Functional" Variant's Title
    // HstText control.
    test('Title prop — reactive update from controls', async ({ page }) => {
        await gotoVariant(page, STORIES.pickerTitle, 'Functional')
        const sb = sandbox(page)
        const title = sb.locator('.origam-picker-title').first()
        await expect(title).toContainText('Custom title')

        await fillHstText(page, 'Title', 'Reactively updated')
        await page.waitForTimeout(300)
        await expect(title).toContainText('Reactively updated')
    })

    // "Prop — tag (polymorphic element)" is now the "Functional" Variant's
    // Tag HstSelect — but its TAG_OPTIONS list (@stories/const/tag.const.ts)
    // only offers (none)/button/a/div/span/router-link/nuxt-link — 'h2' is
    // not a selectable option anymore. Coverage gap, not a title-drift
    // fix: no Variant can reach an h2-tagged OrigamPickerTitle. Verifies
    // the polymorphic mechanism still works with an option that IS
    // available ('span') instead of silently dropping the coverage.
    test('Tag — polymorphic tag renders a span', async ({ page }) => {
        await gotoVariant(page, STORIES.pickerTitle, 'Functional')
        const sb = sandbox(page)
        const title = sb.locator('.origam-picker-title').first()
        await expect(title.evaluate((el) => el.tagName.toLowerCase())).resolves.toBe('div')

        await selectHstOption(page, 'Tag', 'span')
        await page.waitForTimeout(300)
        await expect(title.evaluate((el) => el.tagName.toLowerCase())).resolves.toBe('span')
    })

    test.fixme('Tag — polymorphic tag renders an h2 [STORY COVERAGE MISSING]', async () => {
        // TAG_OPTIONS (@stories/const/tag.const.ts, shared across many
        // stories) does not include 'h2' — only (none)/button/a/div/span/
        // router-link/nuxt-link. Needs either a dedicated fixture or an
        // 'h2' entry added to TAG_OPTIONS, not a spec-only change.
    })

    // "Slot — default (rich content)" is now the "Slots - Default" Variant.
    test('Slot — default slot replaces the title prop', async ({ page }) => {
        await gotoVariant(page, STORIES.pickerTitle, 'Slots - Default')
        const sb = sandbox(page)
        const title = sb.locator('.origam-picker-title').first()
        await expect(title).toBeVisible()
        await expect(title.locator('strong')).toHaveText('rich')
    })

    // "Default" (playground) — title unchanged, still exists.
    test('Playground — mounts with default tag div', async ({ page }) => {
        await gotoVariant(page, STORIES.pickerTitle, 'Default')
        const sb = sandbox(page)
        const title = sb.locator('.origam-picker-title').first()
        await expect(title.evaluate((el) => el.tagName.toLowerCase())).resolves.toBe('div')
    })
})

// ════════════════════════════════════════════════════════════════════════════
// OrigamOverlay
// ════════════════════════════════════════════════════════════════════════════

test.describe('OrigamOverlay', () => {
    /**
     * ⛔ REAL BUG — FIXED (was root-caused and left as `test.fixme`,
     * now resolved at the source):
     * the "Default" playground Variant's activator could never open
     * the overlay — clicking it had no effect.
     *
     * Root cause (OrigamOverlay.story.vue "Default" Variant):
     *   `<origam-overlay v-model="playgroundOpen" v-bind="state" …>`
     *   `v-model="playgroundOpen"` desugars to a `model-value` binding
     *   + an `onUpdate:modelValue` handler that writes back into the
     *   LOCAL `playgroundOpen` ref. `v-bind="state"` was declared
     *   AFTER it and also carried a `modelValue` key (`state.modelValue`,
     *   seeded `false` and never written to by anything). Vue resolves
     *   conflicting attribute bindings by DECLARATION ORDER — the
     *   later one wins — so `state.modelValue` (permanently `false`)
     *   overrode the `v-model`-driven prop. Clicking the activator
     *   still updated `playgroundOpen` under the hood, but that ref was
     *   never actually wired to anything the overlay read.
     *
     * Fix: removed `modelValue` from the playground's `useStoryInitState`
     * object (`Omit<IOverlayProps, 'modelValue'>`) so `v-bind="state"`
     * no longer carries a conflicting key — `v-model` is the sole
     * source of truth again. Verified empirically: before the fix the
     * DOM only ever showed the `<!--v-if-->` placeholder after clicking
     * "Open playground"; after the fix `.origam-overlay__content`
     * mounts and unmounts as expected.
     */
    test('Default — activator opens overlay content', async ({ page }) => {
        await gotoVariant(page, STORIES.overlay, 'Default')
        const sb = sandbox(page)
        const activator = sb.getByText('Open playground', { exact: true })
        await expect(activator).toBeVisible()
        // Content not yet visible
        await expect(sb.locator('.origam-overlay__content')).toHaveCount(0)
        await activator.click()
        await expect(sb.locator('.origam-overlay__content')).toBeVisible({ timeout: 4000 })
        // Close
        await sb.getByText('Close', { exact: true }).click()
        await expect(sb.locator('.origam-overlay__content')).not.toBeVisible({ timeout: 4000 })
    })

    // "Prop — scrim" is now the "Design" Variant (init scrim: true).
    test('Scrim — true renders the scrim element', async ({ page }) => {
        await gotoVariant(page, STORIES.overlay, 'Design')
        const sb = sandbox(page)
        await sb.getByText('Open (design)', { exact: true }).click()
        await expect(sb.locator('.origam-overlay__content')).toBeVisible({ timeout: 4000 })
        // Scrim element is rendered (inside the .origam-overlay container)
        await expect(sb.locator('.origam-scrim').first()).toBeVisible()
        await sb.getByText('Close', { exact: true }).click()
    })

    // "Prop — scrim": initial scrim=true — verifies the reactive content too.
    test('Scrim — initial state true — scrim element is rendered and shows the value', async ({ page }) => {
        await gotoVariant(page, STORIES.overlay, 'Design')
        const sb = sandbox(page)
        await sb.getByText('Open (design)', { exact: true }).click()
        await expect(sb.locator('.origam-overlay__content')).toBeVisible({ timeout: 4000 })
        // With scrim=true (default), .origam-scrim must be present in the DOM
        await expect(sb.locator('.origam-scrim').first()).toBeVisible()
        await expect(sb.locator('.origam-overlay__content')).toContainText('Design variant.')
        await sb.getByText('Close', { exact: true }).click()
    })

    // "Prop — persistent" is now the "Functional" Variant's Persistent
    // HstCheckbox (init false).
    test('Persistent — outside click does not close overlay', async ({ page }) => {
        await gotoVariant(page, STORIES.overlay, 'Functional')
        const sb = sandbox(page)
        await toggleHstCheckbox(page, 'Persistent')
        await page.waitForTimeout(200)
        await sb.getByText('Open (functional)', { exact: true }).click()
        await expect(sb.locator('.origam-overlay__content')).toBeVisible({ timeout: 4000 })
        // Click on the scrim (outside content)
        const scrim = sb.locator('.origam-scrim').first()
        if (await scrim.count()) await scrim.click({ force: true })
        await page.waitForTimeout(400)
        // Still visible because persistent
        await expect(sb.locator('.origam-overlay__content')).toBeVisible()
        // Close via the explicit button
        await sb.getByText('Close', { exact: true }).click()
        await expect(sb.locator('.origam-overlay__content')).not.toBeVisible({ timeout: 4000 })
    })

    // "Prop — disabled" is now the "Functional" Variant's Disabled
    // HstCheckbox (init false).
    test('Disabled — clicking activator never opens', async ({ page }) => {
        await gotoVariant(page, STORIES.overlay, 'Functional')
        const sb = sandbox(page)
        await toggleHstCheckbox(page, 'Disabled')
        await page.waitForTimeout(200)
        await sb.getByText('Open (functional)', { exact: true }).click()
        await page.waitForTimeout(400)
        await expect(sb.locator('.origam-overlay__content')).toHaveCount(0)
    })

    // "Prop — contained" is now the "Functional" Variant's Contained
    // HstCheckbox (init false).
    test('Contained — overlay scoped to host (--contained class)', async ({ page }) => {
        await gotoVariant(page, STORIES.overlay, 'Functional')
        const sb = sandbox(page)
        await toggleHstCheckbox(page, 'Contained')
        await page.waitForTimeout(200)
        await sb.getByText('Open (functional)', { exact: true }).click()
        await expect(sb.locator('.origam-overlay__content')).toBeVisible({ timeout: 4000 })
        await expect(sb.locator('.origam-overlay--contained').first()).toBeVisible()
    })

    // "Prop — zIndex" is now the "Functional" Variant's Z-Index HstNumber
    // (init 2000).
    test('Z-index — overlay container honours zIndex prop', async ({ page }) => {
        await gotoVariant(page, STORIES.overlay, 'Functional')
        const sb = sandbox(page)
        await sb.getByText('Open (functional)', { exact: true }).click()
        await expect(sb.locator('.origam-overlay__content')).toBeVisible({ timeout: 4000 })
        const overlay = sb.locator('.origam-overlay--active').first()
        const z = await overlay.evaluate((el) => getComputedStyle(el).zIndex)
        expect(parseInt(z, 10)).toBeGreaterThanOrEqual(2000)
    })

    // "Default" (playground) already verified above; kept for composite
    // check. Same v-bind-ordering bug as above — fixed (see diagnostic on
    // "Default — activator opens overlay content").
    test('Playground — composite mounts and toggles', async ({ page }) => {
        await gotoVariant(page, STORIES.overlay, 'Default')
        const sb = sandbox(page)
        await sb.getByText('Open playground', { exact: true }).click()
        await expect(sb.locator('.origam-overlay__content')).toBeVisible({ timeout: 4000 })
        await sb.getByText('Close', { exact: true }).click()
    })
})

// ════════════════════════════════════════════════════════════════════════════
// OrigamOverlayScrim
// ════════════════════════════════════════════════════════════════════════════

test.describe('OrigamOverlayScrim', () => {
    // "Default" (playground) — title unchanged, still exists.
    test('Default — toggle button mounts and unmounts the scrim', async ({ page }) => {
        await gotoVariant(page, STORIES.scrim, 'Default')
        const sb = sandbox(page)
        await expect(sb.locator('.origam-scrim')).toHaveCount(0)
        await sb.getByText('Toggle scrim', { exact: true }).click()
        await expect(sb.locator('.origam-scrim')).toBeVisible({ timeout: 4000 })
    })

    // "Prop — active" is now the "Functional" Variant's Active HstCheckbox
    // (init false).
    test('Active — checkbox mounts the scrim element', async ({ page }) => {
        await gotoVariant(page, STORIES.scrim, 'Functional')
        const sb = sandbox(page)
        // Initial state active=false → no DOM
        await expect(sb.locator('.origam-scrim')).toHaveCount(0)
        await toggleHstCheckbox(page, 'Active')
        await page.waitForTimeout(300)
        await expect(sb.locator('.origam-scrim')).toBeVisible({ timeout: 4000 })
        // The story's trailing <span> (last child of .story-host) reflects
        // the reactive value — `.first()` would grab an unrelated <span>
        // inside the "Toggle scrim" button's internal markup instead.
        await expect(sb.locator('.story-host > span').last()).toContainText('active=true')
    })

    // "Prop — scrim (color)" is now the "Design" Variant's Scrim HstSelect
    // (init true) — upgraded to actually drive the value.
    test('Scrim color — primary applies a non-transparent backdrop', async ({ page }) => {
        await gotoVariant(page, STORIES.scrim, 'Design')
        const sb = sandbox(page)
        const scrim = sb.locator('.origam-scrim').first()
        await expect(scrim).toBeVisible({ timeout: 4000 })

        await selectHstOption(page, 'Scrim', 'primary')
        await page.waitForTimeout(300)
        const bg = await scrim.evaluate((el) => getComputedStyle(el).backgroundColor)
        expect(bg).toMatch(/rgb/)
        expect(bg).not.toBe('rgba(0, 0, 0, 0)')
    })

    // "Emit — click" is now the "Events - click" Variant. The pre-migration
    // story rendered a "clicks=N" counter (data-cy="scrim-emit-counter") —
    // the migrated story wires straight to logEvent(), observable via
    // Histoire's native Events tab instead.
    test('Emits — click closes the scrim and fires the click event', async ({ page }) => {
        await gotoVariant(page, STORIES.scrim, 'Events - click')
        const sb = sandbox(page)
        await sb.getByText('Show scrim', { exact: true }).click()
        const scrim = sb.locator('.origam-scrim').first()
        await expect(scrim).toBeVisible({ timeout: 4000 })
        await scrim.click({ force: true })
        await page.waitForTimeout(400)
        await expect(scrim).not.toBeVisible({ timeout: 4000 })

        await openEventsTab(page)
        await expect(eventLogItems(page).filter({ hasText: 'click' })).toHaveCount(1)
    })
})
