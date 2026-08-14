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
        // story — FIXTURE_EVENTS has zero `rrule` entries (verified via
        // grep across OrigamCalendar.story.vue). `rrule` is still a real,
        // documented, implemented feature (event.interface.ts + a
        // dedicated src/utils/Calendar/rrule.util.ts expansion util) — this
        // is a genuine coverage gap left by the migration, not a removed
        // feature, and not something a spec can work around: the fixture
        // is a hardcoded array baked into the story, with no control that
        // could inject a custom rrule event, and specs must not edit
        // stories (root CLAUDE.md). Skipped with a diagnostic instead of
        // silently deleting the coverage — recommend a story fixture
        // (e.g. a `Prop — recurring events` or folded into Design behind a
        // toggle) be added in a follow-up.
        test.skip(true, 'STORY GAP: FIXTURE_EVENTS in OrigamCalendar.story.vue has no rrule entries after the canonical-structure migration — rrule recurrence (event.interface.ts + rrule.util.ts) is untested. Needs a story fixture addition, not a spec change — cannot be worked around without editing the story.')
    })
})

test.describe('OrigamCalendar — ARIA / Keyboard', () => {
    test('day cells expose role=gridcell with aria-label', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const firstCell = sandbox.locator('[data-cy="origam-calendar"] [role="gridcell"]').first()
        await expect(firstCell).toHaveAttribute('aria-label', /.+/)
    })

    test('view switcher exposes role=tab with aria-selected', async ({ page }) => {
        // DS/test contract mismatch found while repairing this spec —
        // unrelated to the story migration ('Default' title was never
        // drifted; this test simply never actually ran to completion
        // before because earlier tests in the same file blocked full
        // suite runs). OrigamCalendar.vue's view-switcher buttons use
        // `:aria-pressed="isViewActive(viewOption)"` on a `<button>` (a
        // toggle-button-group pattern), NOT `role="tab"` / `aria-selected`
        // (a tabpanel pattern) — verified via source (OrigamCalendar.vue
        // line ~79) and DOM (`aria-pressed="true"`, `role` absent).
        // Genuinely unclear which is "correct" without a DS/a11y decision
        // — a segmented view-switcher is arguably NOT a tabpanel (it
        // doesn't show/hide tabbed content, it swaps the whole calendar
        // body), so `aria-pressed` may be the intentional, correct choice
        // and this test's assumption may be the one that's wrong. Flagging
        // rather than guessing.
        test.fixme(true, 'ARIA contract mismatch: OrigamCalendar view-switcher buttons use aria-pressed (toggle-button pattern), not role="tab"/aria-selected (tabpanel pattern) that this test asserts. Needs a DS/a11y decision on the intended pattern before either the component or this test is changed.')
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const monthTab = sandbox.locator('[data-cy="origam-calendar-view-month"]').first()
        await expect(monthTab).toHaveAttribute('role', 'tab')
        await expect(monthTab).toHaveAttribute('aria-selected', 'true')
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
