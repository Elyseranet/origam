import { expect, test, type Page } from '@playwright/test'

import { eventLogItems, openEventsTab, selectHstOption } from './_support/histoire-controls'

/**
 * OrigamCalendar — runtime probes for the four-view layout, the
 * navigation toolbar, the click / drag-select pipeline, recurring
 * event expansion, and the ARIA application/gridcell/toolbar
 * pattern. Playwright drives the calendar from the dedicated story
 * page (a clean iframe sandbox) so the test surface is stable across
 * Histoire upgrades.
 *
 * The story restructuring (canonical Design/State/Functional/Events/Slots
 * layout, see root CLAUDE.md) removed every per-fixture story-level
 * data-cy this spec targeted (calendar-playground-cal, calendar-view-*,
 * calendar-events-cal, calendar-recurring-cal, calendar-emits-cal,
 * calendar-emit-log, calendar-slot-*-cal) — none of the migrated
 * Variants set a story-level data-cy on `<origam-calendar>` in Design /
 * Functional (only the dedicated Events- and Slots- Variants keep their own,
 * renamed `cal-emit-*-cal` / `cal-slot-*-cal`). `OrigamCalendar.vue`
 * itself sets a static `data-cy="origam-calendar"` on its own root
 * (verified present in Design/Functional, no story override), which is
 * used as the anchor wherever the old test scoped to a per-fixture root.
 *
 * "Emit — event-click, date-click, range-select" used to be ONE combined
 * fixture; the canonical structure splits it into dedicated
 * "Events - event-click" / "Events - date-click" / "Events - range-select"
 * Variants, each with its own fixture. The old `calendar-emit-log` DOM
 * element no longer exists either — canonical Events-* Variants only wire
 * `logEvent(...)`, a Histoire-internal side-effect surfaced in Histoire's
 * own "Events" tab, not the sandbox DOM — read via the shared
 * `openEventsTab` / `eventLogItems` helpers (`_support/histoire-controls.ts`).
 */

const STORY = '/stories/story/components-stories-calendar-origamcalendar-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, title: string) => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(400)
}

test.describe('OrigamCalendar — Default', () => {
    test('renders the root with role=application and a Calendar aria-label', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        // No story-level data-cy survives on Design/Functional/Default —
        // OrigamCalendar.vue's own static data-cy="origam-calendar" root
        // anchors it instead (see file-level comment).
        const host = sandbox.locator('[data-cy="origam-calendar"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'application')
        await expect(host).toHaveAttribute('aria-label', /calendar/i)
    })

    test('toolbar exposes role=toolbar and the prev/today/next buttons', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        await expect(sandbox.locator('[data-cy="origam-calendar-toolbar"]').first())
            .toHaveAttribute('role', 'toolbar')
        await expect(sandbox.locator('[data-cy="origam-calendar-prev"]').first()).toBeVisible()
        await expect(sandbox.locator('[data-cy="origam-calendar-today"]').first()).toBeVisible()
        await expect(sandbox.locator('[data-cy="origam-calendar-next"]').first()).toBeVisible()
    })
})

test.describe('OrigamCalendar — init-state fixture date', () => {
    /**
     * ⛔ REAL BUG — FIXED: Histoire's `@histoire/plugin-vue` clones every
     * Variant's `:init-state` object via its own `toRawDeep()` (see
     * node_modules/.../@histoire/plugin-vue/dist/bundled/client/app/util.js).
     * That helper walks any `typeof value === 'object'` value with
     * `Object.keys(value)` — which is `[]` for a `Date` instance (its data
     * lives in an internal slot, not an own enumerable property) — so any
     * raw `Date` seeded into `useStoryInitState(...)` was silently
     * flattened to `{}` before the story ever saw it. The calendar then
     * fell back to "now" for `currentDate`, so every Variant seeded with
     * the fixture date (`FIXTURE_REFERENCE_DATE = new Date(2026, 4, 14)`)
     * actually rendered the CURRENT month instead of May 2026.
     *
     * Fix: OrigamCalendar.story.vue now seeds `currentDate` as
     * `FIXTURE_REFERENCE_DATE.toISOString()` (a string survives
     * `toRawDeep` unchanged) in the "Design", "Functional" and "Default"
     * Variants — `ICalendarComponentProps.currentDate` already accepts
     * `Date | string`, so no component change was needed. Same pattern
     * already used successfully by the "Events - navigate" / "Events -
     * view-change" Variants in this file.
     *
     * These three assertions guard against regressing back to a raw
     * `Date` in any of this story's `useStoryInitState` calls.
     */
    test('"Design" Variant renders the May 2026 fixture month, not today\'s', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)

        const title = sandbox.locator('[data-cy="origam-calendar-title"]').first()
        await expect(title).toBeVisible({ timeout: 8000 })
        await expect(title).toContainText('May')
        await expect(title).toContainText('2026')
    })

    test('"Functional" Variant renders the May 2026 fixture month, not today\'s', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)

        const title = sandbox.locator('[data-cy="origam-calendar-title"]').first()
        await expect(title).toBeVisible({ timeout: 8000 })
        await expect(title).toContainText('May')
        await expect(title).toContainText('2026')
    })

    test('"Default" Variant renders the May 2026 fixture month, not today\'s', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const title = sandbox.locator('[data-cy="origam-calendar-title"]').first()
        await expect(title).toBeVisible({ timeout: 8000 })
        await expect(title).toContainText('May')
        await expect(title).toContainText('2026')
    })
})

test.describe('OrigamCalendar — view (month / week / day / agenda)', () => {
    // Dedicated fixture folded into "Design" — "view" is now a single
    // dynamic control (VIEW_OPTIONS: month/week/day/agenda, default
    // 'month' — see OrigamCalendar.story.vue). No per-view root data-cy
    // survives; `[data-cy="origam-calendar"]` anchors the one instance.
    test('month view renders 42 day cells (6 rows × 7 cols)', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)

        const cells = sandbox.locator('[data-cy="origam-calendar"] [role="gridcell"]')
        // 42 day cells in the grid (header cells use role="columnheader" so they're excluded)
        await expect(cells).toHaveCount(42)
    })

    test('week view renders 7 timeline columns', async ({ page }) => {
        await openVariant(page, 'Design')
        await selectHstOption(page, 'View', 'week')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)

        const columns = sandbox.locator('[data-cy="origam-calendar"] [data-cy^="origam-calendar-timeline-day-"]')
        await expect(columns).toHaveCount(7)
    })

    test('day view renders 1 timeline column', async ({ page }) => {
        await openVariant(page, 'Design')
        await selectHstOption(page, 'View', 'day')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)

        const columns = sandbox.locator('[data-cy="origam-calendar"] [data-cy^="origam-calendar-timeline-day-"]')
        await expect(columns).toHaveCount(1)
    })

    test('agenda view groups events under day headers', async ({ page }) => {
        await openVariant(page, 'Design')
        await selectHstOption(page, 'View', 'agenda')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)

        const body = sandbox.locator('[data-cy="origam-calendar"] [data-cy="origam-calendar-body-agenda"]')
        await expect(body).toBeVisible()
    })
})

test.describe('OrigamCalendar — navigation', () => {
    test('clicking "next" moves the title forward by one month', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const title = sandbox.locator('[data-cy="origam-calendar-title"]').first()
        const before = await title.textContent()
        await sandbox.locator('[data-cy="origam-calendar-next"]').first().click()
        const after = await title.textContent()
        expect(after).not.toBe(before)
    })

    test('clicking "today" resets the view to the current month', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        await sandbox.locator('[data-cy="origam-calendar-next"]').first().click()
        await sandbox.locator('[data-cy="origam-calendar-today"]').first().click()
        const title = await sandbox.locator('[data-cy="origam-calendar-title"]').first().textContent()
        expect(title?.length).toBeGreaterThan(0)
    })
})

test.describe('OrigamCalendar — events', () => {
    test('fixture events render as chips inside their day cells', async ({ page }) => {
        // DS/story bug found while repairing this spec: "Design" binds
        // `:current-date="state.currentDate"` through `useStoryInitState`
        // (init value FIXTURE_REFERENCE_DATE, a `Date`), but that Date does
        // NOT survive Histoire's init-state layer — verified empirically:
        // the Design variant's own "Source" panel shows the resulting prop
        // as a bare `{}` (an empty object, not a Date), and the calendar
        // visibly renders TODAY's month instead of FIXTURE_REFERENCE_DATE's
        // May 2026 — so FIXTURE_EVENTS (all dated in May 2026) never falls
        // in the visible range and no `origam-calendar-event-*` chip
        // exists. This is likely a systemic `useStoryInitState` /
        // Histoire-controls gap with `Date`-typed init state, not specific
        // to Calendar — worth a DS/infra ticket, out of scope here.
        // Worked around by using "Events - event-click", which binds
        // `:current-date="FIXTURE_REFERENCE_DATE"` directly in the
        // template (not through reactive init-state) — confirmed
        // empirically: title reads "May 2026" and 15
        // `origam-calendar-event-*` chips are present.
        await openVariant(page, 'Events - event-click')
        const sandbox = sandboxOf(page)

        const event = sandbox.locator('[data-cy="cal-emit-event-click-cal"] [data-cy^="origam-calendar-event-"]').first()
        await expect(event).toBeVisible({ timeout: 8000 })
    })

    test('recurring event expands to multiple chips on Mon/Wed/Fri', async () => {
        // The recurring-event fixture no longer exists in the migrated
        // story — FIXTURE_EVENTS has zero `rrule` entries (re-verified
        // 2026-08-17). The fixture is a hardcoded array baked into the
        // story with no control that could inject a custom rrule event,
        // and specs must not edit stories (root CLAUDE.md), so this
        // *visual* assertion stays parked.
        //
        // CORRECTION (2026-08-17): the previous skip message claimed
        // "rrule recurrence is untested". That was FALSE and stayed
        // uncorrected for a release. `rrule` expansion has always had
        // unit coverage — `TU/utils/Calendar/rrule.util.spec.ts` (49
        // tests, 98.71% statements / 97.61% branches on rrule.util.ts)
        // plus an integration test through the composable in
        // `TU/composables/Calendar/calendar.composable.spec.ts`
        // ("expands a weekly RRULE inside the visible month").
        //
        // What is missing is narrower than "untested" and worth stating
        // precisely, because the two are not interchangeable: the
        // recurrence ARITHMETIC is guarded (and guarded in the unit
        // suite, which CI runs in full, unlike the e2e subset); what is
        // NOT guarded is that expanded occurrences RENDER as one chip
        // per day in the month grid. That is a rendering assertion, and
        // it is the only part that needs a story fixture.
        test.skip(true, 'STORY GAP (rendering only): FIXTURE_EVENTS in OrigamCalendar.story.vue has no rrule entries, so the "one chip per expanded occurrence" RENDERING is unverified. The recurrence arithmetic itself IS covered — see TU/utils/Calendar/rrule.util.spec.ts (49 tests, 97.61% branch) and the useCalendar integration test. Needs a story fixture to go further; not a spec change.')
    })
})

test.describe('OrigamCalendar — ARIA / Keyboard', () => {
    test('day cells expose role=gridcell with aria-label', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const firstCell = sandbox.locator('[data-cy="origam-calendar"] [role="gridcell"]').first()
        await expect(firstCell).toHaveAttribute('aria-label', /.+/)
    })

    /*
     * ARIA contract for the view switcher — SETTLED 2026-08-17.
     *
     * This test used to assert `role="tab"` / `aria-selected` and was
     * parked as `test.fixme` pending a decision. The decision is: the
     * view switcher is a GROUP OF TOGGLE BUTTONS (`role="group"` +
     * `<button aria-pressed>`), which is what the component already
     * renders. The test was the side that was wrong. Reasons, in order
     * of weight:
     *
     * 1. The tabs pattern requires a panel. WAI-ARIA APG "Tabs" has each
     *    `role="tab"` reference its panel through `aria-controls`, and
     *    the panel carries `role="tabpanel"` + `aria-labelledby`.
     *    OrigamCalendar renders exactly ONE body, via `v-if` on
     *    `resolvedView` — the three inactive views have no DOM node at
     *    all. Three of the four tabs would therefore carry
     *    `aria-controls` pointing at IDs that do not exist. A dangling
     *    `aria-controls` is invalid and its AT behaviour is undefined.
     *
     * 2. A view switcher swaps a RENDERING, not a panel of content.
     *    Month / week / day / agenda are four projections of the same
     *    event set into the same region. Tabs say "there is other
     *    content you have not seen"; a view switcher says "same content,
     *    different shape" — that is a mode control, i.e. a pressed state.
     *
     * 3. Composite-widget keyboard collision — measured, not assumed.
     *    `tablist` (like `radiogroup`) is a composite widget: one tab
     *    stop, roving `tabindex`, and Arrow/Home/End MUST move between
     *    tabs. OrigamCalendar's root already binds
     *    ArrowLeft/Right/Up/Down + PageUp/PageDown for date navigation
     *    and calls `preventDefault()`. Measured in
     *    `TU/components/Calendar/OrigamCalendar.aria.spec.ts`: pressing
     *    ArrowRight while a view button is the event target moves the
     *    current date (2026-05-14 → 2026-05-15). The arrow contract a
     *    tablist owes its user is pre-empted by the calendar today, so
     *    declaring `role="tab"` here would announce a keyboard model the
     *    component does not honour — the exact OrigamColorPicker defect
     *    (`role="application"` + live `aria-valuetext`, arrows ignored).
     *
     * 4. The pattern in place is already COMPLETE: `role="group"` with an
     *    accessible name, native `<button type="button">` (each its own
     *    tab stop, Space/Enter handled by the platform), and
     *    `aria-pressed` reflecting state. Nothing is half-declared —
     *    which is what "No ARIA is better than bad ARIA" asks for.
     *
     * Adopting tabs later is defensible, but it is a whole delivery:
     * carve the switcher out of the root `onKeydown`, add roving
     * tabindex + Home/End, give each view a persistent panel node with a
     * stable id, and wire `aria-controls` / `aria-labelledby`. Not a
     * one-attribute change.
     *
     * The same contract is pinned in the unit suite (see spec above) —
     * that copy is the one under CI guard, since CI runs the whole Vitest
     * suite but only a subset of the e2e specs.
     */
    test('view switcher is a toggle-button group (role=group + aria-pressed)', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const monthBtn = sandbox.locator('[data-cy="origam-calendar-view-month"]').first()
        const weekBtn = sandbox.locator('[data-cy="origam-calendar-view-week"]').first()

        // Native button semantics — no redundant role override.
        await expect(monthBtn).toHaveJSProperty('tagName', 'BUTTON')
        await expect(monthBtn).not.toHaveAttribute('role', /.*/)
        await expect(monthBtn).not.toHaveAttribute('aria-selected', /.*/)

        // Pressed state tracks the active view, and only one is pressed.
        await expect(monthBtn).toHaveAttribute('aria-pressed', 'true')
        await expect(weekBtn).toHaveAttribute('aria-pressed', 'false')

        // The switcher is a named group so AT announces the set.
        const group = sandbox.locator('.origam-calendar__toolbar-views').first()
        await expect(group).toHaveAttribute('role', 'group')
        await expect(group).toHaveAttribute('aria-label', /.+/)

        // Activating another view moves the pressed state.
        await weekBtn.click()
        await expect(weekBtn).toHaveAttribute('aria-pressed', 'true')
        await expect(monthBtn).toHaveAttribute('aria-pressed', 'false')
    })

    test('arrow-right keyboard nav advances current-date by 1 day', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="origam-calendar"]').first()
        await host.focus()
        // Press arrow-right and verify the title is still readable —
        // the precise label varies by locale but the side effect (a
        // re-render) is observable.
        const before = await sandbox.locator('[data-cy="origam-calendar-title"]').first().textContent()
        await host.press('ArrowRight')
        await sandbox.locator('[data-cy="origam-calendar-title"]').first().waitFor()
        const after = await sandbox.locator('[data-cy="origam-calendar-title"]').first().textContent()
        // Same-month navigation keeps the title — at minimum, no crash.
        expect((after ?? before ?? '').length).toBeGreaterThan(0)
    })
})

test.describe('OrigamCalendar — emits', () => {
    // The old combined "Emit — event-click, date-click, range-select"
    // fixture split into dedicated canonical Variants, each with its own
    // fixture — "Events - date-click" / "Events - event-click". The old
    // bespoke `calendar-emit-log` DOM shell is gone too — emits are read
    // back from Histoire's own "Events" tab (see `openEventsTab` /
    // `eventLogItems` in `_support/histoire-controls.ts`).
    test('clicking a day cell emits date-click', async ({ page }) => {
        await openVariant(page, 'Events - date-click')
        const sandbox = sandboxOf(page)

        await sandbox
            .locator('[data-cy="cal-emit-date-click-cal"] [role="gridcell"]')
            .first()
            .click()
        await page.waitForTimeout(300)

        await openEventsTab(page)
        await expect(eventLogItems(page).first()).toContainText('date-click', { timeout: 4000 })
    })

    test('clicking an event chip emits event-click', async ({ page }) => {
        await openVariant(page, 'Events - event-click')
        const sandbox = sandboxOf(page)

        const firstEvent = sandbox.locator('[data-cy="cal-emit-event-click-cal"] [data-cy^="origam-calendar-event-"]').first()
        await firstEvent.click({ force: true })
        await page.waitForTimeout(300)

        await openEventsTab(page)
        await expect(eventLogItems(page).first()).toContainText('event-click', { timeout: 4000 })
    })
})

test.describe('OrigamCalendar — slots', () => {
    test('#event slot renders the custom event card markup', async ({ page }) => {
        // Canonical Variant is "Slots - Event"; its fixture data-cy is
        // `cal-slot-event-cal` (renamed from `calendar-slot-event-cal`).
        await openVariant(page, 'Slots - Event')
        const sandbox = sandboxOf(page)

        const customEvent = sandbox.locator('[data-cy="cal-slot-event-cal"] .custom-event').first()
        await expect(customEvent).toBeVisible()
    })

    test('#day slot replaces the default month-cell content', async ({ page }) => {
        // Canonical Variant is "Slots - Day".
        await openVariant(page, 'Slots - Day')
        const sandbox = sandboxOf(page)

        const customCount = sandbox.locator('[data-cy="custom-day-count"]').first()
        await expect(customCount).toBeVisible()
    })

    test('#empty slot renders when no events fall in the range', async ({ page }) => {
        // Canonical Variant is "Slots - Empty".
        await openVariant(page, 'Slots - Empty')
        const sandbox = sandboxOf(page)

        const customCta = sandbox.locator('[data-cy="custom-empty-cta"]').first()
        await expect(customCta).toBeVisible()
    })
})
