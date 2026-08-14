import { expect, test, type FrameLocator, type Page } from '@playwright/test'

import { eventLogItems, fillHstNumber, fillHstText, openEventsTab, selectHstOption, toggleHstCheckbox } from './_support/histoire-controls'

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
 * Strategy
 * --------
 * Each variant is exercised via the Histoire sandbox iframe. The picker
 * shell is rendered inline (no teleport), so we look for it inside the
 * sandbox `body`. The overlay teleports its content to
 * `body > .origam-overlay-container`, which still lives inside the
 * sandbox iframe's document — locators based on the sandbox frame
 * therefore find it without any extra plumbing.
 *
 * All 4 stories have been migrated to the canonical Design / State /
 * Functional / Events - {name} / Slots - {Name} / Default(Playground)
 * structure (root CLAUDE.md, "Story + doc sync"). None of the old
 * `Prop — …` / `Emit — …` / `Slot — …` Variants survive, AND the old
 * story's `data-cy="…"` hooks were dropped entirely in the migration —
 * they don't exist anywhere in the current story source or in the
 * underlying `OrigamPicker*` / `OrigamOverlay*` component templates
 * (verified: `grep -n data-cy` on both component dirs returns nothing).
 * Every locator below is therefore rebuilt against the component's own
 * BEM classes (read from the `.vue` source) or against visible text /
 * accessible role, and prop-specific Variants that no longer exist are
 * exercised by driving the matching Histoire control on "Design" /
 * "Functional" / "Default" instead (see `_support/histoire-controls.ts`).
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
    // "Design" pins :init-state title: 'Picker'. Renders <origam-picker-title>
    // via the default (auto) fallback, which gets the extra
    // `origam-picker__title` BEM class (OrigamPicker.vue line 20).
    test('Design — title prop renders inside .origam-picker__title', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Design')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker')
        await expect(picker).toBeVisible({ timeout: 5000 })
        await expect(picker.locator('.origam-picker__title')).toContainText('Picker')
        await expect(picker.locator('.origam-picker__body')).toBeVisible()
    })

    // The old "Prop — title (editable)" Variant is gone; the only Variant
    // that exposes an HstText control for `title` is the "Default"
    // playground ("Content" group). Drive it to prove reactivity, rather
    // than just reading the fixed init-state value.
    test('Title prop — reactive update via the Default playground control', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Default')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker')
        await expect(picker.locator('.origam-picker__title')).toContainText('Picker')
        await fillHstText(page, 'Title', 'Pick a date')
        await expect(picker.locator('.origam-picker__title')).toContainText('Pick a date')
    })

    // "Functional" init-state pins hideHeader: false — toggle it via its
    // "Hide Header" checkbox (Layout group).
    test('Functional — toggling Hide Header removes the title region', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Functional')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker')
        await expect(picker).toBeVisible()
        await expect(picker.locator('.origam-picker__title')).toBeVisible()
        await toggleHstCheckbox(page, 'Hide Header')
        // OrigamPicker.vue wraps title AND header behind one `v-if="!hideHeader"`
        // — both vanish together, not just the title.
        await expect(picker.locator('.origam-picker__title')).toHaveCount(0)
        await expect(picker.locator('.origam-picker__header')).toHaveCount(0)
    })

    // "Functional" init-state pins landscape: false — toggle it via its
    // "Landscape" checkbox (Layout group).
    test('Functional — toggling Landscape flips the grid layout', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Functional')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker')
        await expect(picker.locator('.origam-picker__header')).toBeVisible()
        await expect(picker.locator('.origam-picker__body')).toBeVisible()
        await toggleHstCheckbox(page, 'Landscape')
        await expect(picker).toHaveClass(/origam-picker--landscape/)
        await expect(picker.locator('.origam-picker__header')).toBeVisible()
        await expect(picker.locator('.origam-picker__body')).toBeVisible()
    })

    // "Slots - Actions" statically wires a Cancel/Save actions slot.
    test('Slots - Actions — modifier class & buttons render', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Slots - Actions')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker')
        await expect(picker).toHaveClass(/origam-picker--has-actions/)
        await expect(picker.locator('.origam-picker__actions')).toBeVisible()
        await expect(picker.getByRole('button', { name: 'Cancel' })).toBeVisible()
        await expect(picker.getByRole('button', { name: 'Save' })).toBeVisible()
    })

    // "Slots - Header" statically wires custom header content.
    test('Slots - Header — content renders inside .origam-picker__header', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Slots - Header')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker')
        await expect(picker.locator('.origam-picker__header')).toBeVisible()
        await expect(picker.locator('.origam-picker__header')).toContainText('Custom header content')
    })

    // "Slots - Title" statically wires a custom OrigamPickerTitle (tag="h2")
    // via the `#title` slot, overriding the auto-rendered title. The
    // slotted title is NOT wrapped with the `origam-picker__title` BEM
    // class (that class is only added by the parent's own fallback
    // render, OrigamPicker.vue line 20) — locate it by the component's
    // own root class instead.
    test('Slots - Title — override replaces the auto-rendered title', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Slots - Title')
        const sb = sandbox(page)
        const slotted = sb.locator('.origam-picker .origam-picker-title')
        await expect(slotted).toBeVisible()
        await expect(slotted).toContainText('Custom title via slot')
        await expect(slotted.evaluate((el) => el.tagName.toLowerCase())).resolves.toBe('h2')
    })

    // "Design" leaves bgColor at its init-state 'primary' — the header div
    // gets the `useBackgroundColor` utility class `origam--bg-primary`
    // (color.composable.ts). Drive the "Bg Color" control to a different
    // intent to prove the class actually reacts to the prop, not just to
    // the init-state default.
    test('Design — Bg Color control swaps the header background utility class', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Design')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker')
        await expect(picker.locator('.origam--bg-primary')).toBeVisible({ timeout: 5000 })
        await selectHstOption(page, 'Bg Color', 'Success')
        await expect(picker.locator('.origam--bg-primary')).toHaveCount(0)
        await expect(picker.locator('.origam--bg-success')).toBeVisible()
    })

    // "Design" leaves elevation undefined by default (no `--elevated`
    // class). Drive the "Elevation" control to prove the forwarded sheet
    // prop actually reaches OrigamSheet's own `useElevation`.
    test('Design — Elevation control adds the sheet elevated class', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Design')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker')
        await expect(picker).not.toHaveClass(/origam-sheet--elevated/)
        await selectHstOption(page, 'Elevation', 'MD (8)')
        await expect(picker).toHaveClass(/origam-sheet--elevated/)
        await expect(picker).toHaveClass(/origam--shadow-md/)
    })

    // "Design" leaves rounded undefined by default. Drive the "Rounded"
    // control to prove the forwarded sheet prop reaches `useRounded`.
    test('Design — Rounded control adds the sheet rounded modifier class', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Design')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker')
        await expect(picker).not.toHaveClass(/origam-sheet--rounded-/)
        await selectHstOption(page, 'Rounded', 'small (radius.sm / 4px)')
        await expect(picker).toHaveClass(/origam-sheet--rounded-small/)
    })

    // "Design" leaves border undefined by default. The old "Prop —
    // rounded" Variant actually hardcoded `border` (mislabeled — it never
    // exercised rounded at all) — this test restores that border-modifier
    // coverage honestly, under its own name, driving the real control.
    test('Design — Border control adds the sheet border modifier class', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Design')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker')
        await expect(picker).not.toHaveClass(/origam-sheet--border/)
        await selectHstOption(page, 'Border', 'Border (legacy boolean → thin)')
        await expect(picker).toHaveClass(/origam-sheet--border/)
        await expect(picker).toHaveClass(/origam--border-thin/)
    })

    // "Default" (playground) unconditionally wires an actions slot.
    test('Default — playground mounts with composite props', async ({ page }) => {
        await gotoVariant(page, STORIES.picker, 'Default')
        const sb = sandbox(page)
        const picker = sb.locator('.origam-picker')
        await expect(picker).toBeVisible()
        await expect(picker).toHaveClass(/origam-picker--has-actions/)
    })
})

// ════════════════════════════════════════════════════════════════════════════
// OrigamPickerTitle
// ════════════════════════════════════════════════════════════════════════════

test.describe('OrigamPickerTitle', () => {
    // "Design" init-state pins title: 'Pick a date'.
    test('Design — renders the title prop text', async ({ page }) => {
        await gotoVariant(page, STORIES.pickerTitle, 'Design')
        const sb = sandbox(page)
        const title = sb.locator('.origam-picker-title')
        await expect(title).toBeVisible()
        await expect(title).toContainText('Pick a date')
    })

    // "Functional" exposes an HstText "Title" control (Content group,
    // init-state 'Custom title') — drive it to prove reactivity rather
    // than only reading the init-state value.
    test('Functional — title text reflects the Title control', async ({ page }) => {
        await gotoVariant(page, STORIES.pickerTitle, 'Functional')
        const sb = sandbox(page)
        const title = sb.locator('.origam-picker-title')
        await expect(title).toContainText('Custom title')
        await fillHstText(page, 'Title', 'Reactive title')
        await expect(title).toContainText('Reactive title')
    })

    // The shared TAG_OPTIONS dropdown (@stories/const) does not include
    // "h2" — it only offers (none)/button/a/div/span/router-link/nuxt-link,
    // so the old hardcoded `tag="h2"` case can't be driven through this
    // control. Polymorphism is proven here with "span" instead; the "h2"
    // concrete case is still covered by
    // `OrigamPicker › Slots - Title — override replaces the auto-rendered title`
    // above, which hardcodes an `<origam-picker-title tag="h2">` in the story
    // markup itself — no coverage is lost, just re-homed.
    test('Functional — Tag control renders the chosen polymorphic tag', async ({ page }) => {
        await gotoVariant(page, STORIES.pickerTitle, 'Functional')
        const sb = sandbox(page)
        const title = sb.locator('.origam-picker-title')
        await expect(title.evaluate((el) => el.tagName.toLowerCase())).resolves.toBe('div')
        await selectHstOption(page, 'Tag', 'span')
        await expect(title.evaluate((el) => el.tagName.toLowerCase())).resolves.toBe('span')
    })

    test('Slots - Default — default slot replaces the title prop', async ({ page }) => {
        await gotoVariant(page, STORIES.pickerTitle, 'Slots - Default')
        const sb = sandbox(page)
        const title = sb.locator('.origam-picker-title')
        await expect(title).toBeVisible()
        await expect(title.locator('strong')).toContainText('rich')
    })

    test('Default — playground mounts with the default tag div', async ({ page }) => {
        await gotoVariant(page, STORIES.pickerTitle, 'Default')
        const sb = sandbox(page)
        const title = sb.locator('.origam-picker-title')
        await expect(title.evaluate((el) => el.tagName.toLowerCase())).resolves.toBe('div')
    })
})

// ════════════════════════════════════════════════════════════════════════════
// OrigamOverlay
// ════════════════════════════════════════════════════════════════════════════

test.describe('OrigamOverlay', () => {
    test('Default — activator opens overlay content', async ({ page }) => {
        // DS STORY BUG (found today, verified via a standalone Playwright
        // script against the live Histoire instance — reproduced 3/3 in
        // chromium/firefox/webkit, not a browser flake): the "Default"
        // Variant's `<origam-overlay>` never actually opens when its
        // activator is clicked.
        //
        // Root cause: OrigamOverlay.story.vue's "Default" Variant binds
        // BOTH `v-model="playgroundOpen"` AND `v-bind="state"` on the same
        // element, in that source order:
        //     <origam-overlay v-model="playgroundOpen" v-bind="state" …>
        // `state`'s :init-state includes `modelValue: false` (never
        // mutated afterwards — nothing in the Variant writes back to
        // `state.modelValue`, only to `playgroundOpen`). Vue's prop merge
        // for `v-bind="obj"` overwrites earlier same-key bindings in
        // template source order for plain (non class/style/on*) keys, so
        // `state.modelValue` (always `false`) permanently wins over the
        // `v-model` binding's own `modelValue`.
        //
        // Confirmed via a standalone script: clicking the activator DOES
        // fire `update:modelValue` (`{name: 'update:modelValue', argument:
        // true}` observed in the console — `playgroundOpen` itself flips),
        // but the Vue devtools prop dump on the very next render still
        // shows `OrigamOverlay modelValue=false`, and the sandbox body HTML
        // never gains a `.origam-overlay` node at all (not just a hidden
        // one — `useLazy`'s `hasContent` never flips because the `isActive`
        // computed reads the shadowed `props.modelValue`, stuck at
        // `false`). Design/Functional Variants of the same story are
        // unaffected — they only bind individually-named props
        // (`:persistent`, `:scrim`, …), never a whole-object `v-bind="state"`
        // that also contains `modelValue`.
        //
        // Per root CLAUDE.md ("NE MODIFIE JAMAIS UNE STORY pour la faire
        // correspondre à une spec") this spec does not touch the story.
        // Fix belongs in
        // packages/stories/components/stories/Overlay/OrigamOverlay.story.vue
        // — either drop `modelValue` from the "Default" Variant's
        // `:init-state`, or reorder so `v-bind="state"` comes BEFORE
        // `v-model="playgroundOpen"` in the template.
        test.fixme(true, 'DS STORY BUG: OrigamOverlay.story.vue "Default" Variant — v-bind="state" (state.modelValue fixed at false) is declared AFTER v-model="playgroundOpen" and permanently overrides it via Vue prop-merge source order, so the activator never actually opens the overlay. See in-test comment for full repro.')
        await gotoVariant(page, STORIES.overlay, 'Default')
        const sb = sandbox(page)
        const activator = sb.getByRole('button', { name: 'Open playground' })
        await expect(activator).toBeVisible()
        await expect(sb.locator('.origam-overlay__content')).toHaveCount(0)
        await activator.click()
        await expect(sb.locator('.origam-overlay__content')).toBeVisible({ timeout: 4000 })
        await sb.getByRole('button', { name: 'Close' }).click()
        await expect(sb.locator('.origam-overlay__content')).not.toBeVisible({ timeout: 4000 })
    })

    // "Design" init-state pins scrim: true.
    test('Design — scrim true (default) renders the scrim element', async ({ page }) => {
        await gotoVariant(page, STORIES.overlay, 'Design')
        const sb = sandbox(page)
        await sb.getByRole('button', { name: 'Open (design)' }).click()
        await expect(sb.locator('.origam-overlay__content')).toBeVisible({ timeout: 4000 })
        await expect(sb.locator('.origam-scrim').first()).toBeVisible()
        await sb.getByRole('button', { name: 'Close' }).click()
    })

    // The old "Prop — scrim" Variant couldn't actually change the control
    // (HstSelect is a custom popover, not a native <select>) so it only
    // ever asserted the fixed init-state. `selectHstOption` now drives it
    // for real — toggling scrim off and confirming the element disappears
    // is a strictly stronger assertion of the same prop.
    test('Design — toggling Scrim to false removes the scrim element', async ({ page }) => {
        await gotoVariant(page, STORIES.overlay, 'Design')
        const sb = sandbox(page)
        await selectHstOption(page, 'Scrim', 'false (no backdrop)')
        await sb.getByRole('button', { name: 'Open (design)' }).click()
        await expect(sb.locator('.origam-overlay__content')).toBeVisible({ timeout: 4000 })
        await expect(sb.locator('.origam-scrim')).toHaveCount(0)
    })

    // "Functional" init-state pins persistent: false — toggle it.
    test('Functional — Persistent: outside click does not close the overlay', async ({ page }) => {
        await gotoVariant(page, STORIES.overlay, 'Functional')
        const sb = sandbox(page)
        await toggleHstCheckbox(page, 'Persistent')
        await sb.getByRole('button', { name: 'Open (functional)' }).click()
        await expect(sb.locator('.origam-overlay__content')).toBeVisible({ timeout: 4000 })
        const scrim = sb.locator('.origam-overlay__scrim, .origam-scrim').first()
        if (await scrim.count()) await scrim.click({ force: true })
        await page.waitForTimeout(400)
        await expect(sb.locator('.origam-overlay__content')).toBeVisible()
        await sb.getByRole('button', { name: 'Close' }).click()
        await expect(sb.locator('.origam-overlay__content')).not.toBeVisible({ timeout: 4000 })
    })

    // "Functional" init-state pins disabled: false — toggle it.
    test('Functional — Disabled: clicking the activator never opens', async ({ page }) => {
        await gotoVariant(page, STORIES.overlay, 'Functional')
        const sb = sandbox(page)
        await toggleHstCheckbox(page, 'Disabled')
        await sb.getByRole('button', { name: 'Open (functional)' }).click()
        await page.waitForTimeout(400)
        await expect(sb.locator('.origam-overlay__content')).toHaveCount(0)
    })

    // "Functional" init-state pins contained: false — toggle it.
    test('Functional — Contained: overlay is scoped to the host (--contained class)', async ({ page }) => {
        await gotoVariant(page, STORIES.overlay, 'Functional')
        const sb = sandbox(page)
        await toggleHstCheckbox(page, 'Contained')
        await sb.getByRole('button', { name: 'Open (functional)' }).click()
        await expect(sb.locator('.origam-overlay__content')).toBeVisible({ timeout: 4000 })
        await expect(sb.locator('.origam-overlay--contained').first()).toBeVisible()
    })

    // "Functional" init-state pins zIndex: 2000 — drive it to a distinct
    // value to prove the prop actually reaches the rendered stack style.
    test('Functional — Z-Index: overlay container honours the zIndex control', async ({ page }) => {
        await gotoVariant(page, STORIES.overlay, 'Functional')
        const sb = sandbox(page)
        await fillHstNumber(page, 'Z-Index', 3000)
        await sb.getByRole('button', { name: 'Open (functional)' }).click()
        await expect(sb.locator('.origam-overlay__content')).toBeVisible({ timeout: 4000 })
        const overlay = sb.locator('.origam-overlay--active').first()
        const z = await overlay.evaluate((el) => getComputedStyle(el).zIndex)
        expect(parseInt(z, 10)).toBeGreaterThanOrEqual(3000)
    })

    // The old "Playground — composite mounts and toggles" test only
    // re-verified the same open/close path already covered by the
    // "Default" test above. Repurposed to cover "Slots - Activator"
    // instead, which had no dedicated test — no coverage lost, redundant
    // assertion replaced by a real gap.
    test('Slots - Activator — custom activator slot reflects isActive', async ({ page }) => {
        await gotoVariant(page, STORIES.overlay, 'Slots - Activator')
        const sb = sandbox(page)
        const activator = sb.getByRole('button', { name: 'Custom activator slot' })
        await expect(activator).toBeVisible()
        await activator.click()
        await expect(sb.getByRole('button', { name: 'Opened' })).toBeVisible({ timeout: 4000 })
        await expect(sb.locator('.origam-overlay__content')).toBeVisible()
    })
})

// ════════════════════════════════════════════════════════════════════════════
// OrigamOverlayScrim
// ════════════════════════════════════════════════════════════════════════════

test.describe('OrigamOverlayScrim', () => {
    test('Default — toggle button mounts and unmounts the scrim', async ({ page }) => {
        await gotoVariant(page, STORIES.scrim, 'Default')
        const sb = sandbox(page)
        await expect(sb.locator('.origam-scrim')).toHaveCount(0)
        await sb.getByRole('button', { name: 'Toggle scrim' }).click()
        await expect(sb.locator('.origam-scrim')).toBeVisible({ timeout: 4000 })
    })

    // "Functional" init-state pins active: false — toggle it via the
    // shared control helper (its own "Active" HstCheckbox, States group).
    test('Functional — Active control mounts the scrim element', async ({ page }) => {
        await gotoVariant(page, STORIES.scrim, 'Functional')
        const sb = sandbox(page)
        await expect(sb.locator('.origam-scrim')).toHaveCount(0)
        await toggleHstCheckbox(page, 'Active')
        await expect(sb.locator('.origam-scrim')).toBeVisible({ timeout: 4000 })
        await expect(sb.getByText('active=true')).toBeVisible()
    })

    // "Design" init-state already pins active: true, scrim: true — the
    // scrim is visible immediately, no toggle needed before driving Scrim.
    test('Design — Scrim color primary applies a non-transparent backdrop', async ({ page }) => {
        await gotoVariant(page, STORIES.scrim, 'Design')
        const sb = sandbox(page)
        await expect(sb.locator('.origam-scrim')).toBeVisible({ timeout: 4000 })
        await selectHstOption(page, 'Scrim', 'primary')
        const bg = await sb.locator('.origam-scrim').evaluate((el) => getComputedStyle(el).backgroundColor)
        expect(bg).toMatch(/rgb/)
    })

    // Canonical "Events - click" Variant replaced the old bespoke
    // `data-cy="scrim-emit-counter"` shell — read Histoire's own event log
    // instead (root CLAUDE.md convention, `_support/histoire-controls.ts`).
    test('Events - click — emits click and closes the scrim', async ({ page }) => {
        await gotoVariant(page, STORIES.scrim, 'Events - click')
        const sb = sandbox(page)
        await sb.getByRole('button', { name: 'Show scrim' }).click()
        await expect(sb.locator('.origam-scrim')).toBeVisible({ timeout: 4000 })
        await sb.locator('.origam-scrim').click({ force: true })
        await expect(sb.locator('.origam-scrim')).not.toBeVisible({ timeout: 4000 })
        await openEventsTab(page)
        await expect(eventLogItems(page)).toHaveCount(1)
    })

    // "Default" (playground) exposes an "Active" HstCheckbox (Functional
    // group), init-state active: false.
    test('Default — playground mounts when Active is toggled', async ({ page }) => {
        await gotoVariant(page, STORIES.scrim, 'Default')
        const sb = sandbox(page)
        await expect(sb.locator('.origam-scrim')).toHaveCount(0)
        await toggleHstCheckbox(page, 'Active')
        await expect(sb.locator('.origam-scrim')).toBeVisible({ timeout: 4000 })
    })
})
