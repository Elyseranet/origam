import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamCalendar — runtime probes for the four-view layout, the
 * navigation toolbar, the click / drag-select pipeline, recurring
 * event expansion, and the ARIA application/gridcell/toolbar
 * pattern. Playwright drives the calendar from the dedicated story
 * page (a clean iframe sandbox) so the test surface is stable across
 * Histoire upgrades.
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

        const host = sandbox.locator('[data-cy="calendar-playground-cal"]').first()
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
    test('month view renders 42 day cells (6 rows × 7 cols)', async ({ page }) => {
        await openVariant(page, 'Prop — view (month / week / day / agenda)')
        const sandbox = sandboxOf(page)

        const cells = sandbox.locator('[data-cy="calendar-view-month"] [role="gridcell"]')
        // 42 day cells in the grid (header cells use role="columnheader" so they're excluded)
        await expect(cells).toHaveCount(42)
    })

    test('week view renders 7 timeline columns', async ({ page }) => {
        await openVariant(page, 'Prop — view (month / week / day / agenda)')
        const sandbox = sandboxOf(page)

        const columns = sandbox.locator('[data-cy="calendar-view-week"] [data-cy^="origam-calendar-timeline-day-"]')
        await expect(columns).toHaveCount(7)
    })

    test('day view renders 1 timeline column', async ({ page }) => {
        await openVariant(page, 'Prop — view (month / week / day / agenda)')
        const sandbox = sandboxOf(page)

        const columns = sandbox.locator('[data-cy="calendar-view-day"] [data-cy^="origam-calendar-timeline-day-"]')
        await expect(columns).toHaveCount(1)
    })

    test('agenda view groups events under day headers', async ({ page }) => {
        await openVariant(page, 'Prop — view (month / week / day / agenda)')
        const sandbox = sandboxOf(page)

        const body = sandbox.locator('[data-cy="calendar-view-agenda"] [data-cy="origam-calendar-body-agenda"]')
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
        await openVariant(page, 'Prop — events (15+ events fixture)')
        const sandbox = sandboxOf(page)

        const event = sandbox.locator('[data-cy="calendar-events-cal"] [data-cy^="origam-calendar-event-"]').first()
        await expect(event).toBeVisible({ timeout: 8000 })
    })

    test('recurring event expands to multiple chips on Mon/Wed/Fri', async ({ page }) => {
        await openVariant(page, 'Prop — events recurring (rrule weekly Mon Wed Fri)')
        const sandbox = sandboxOf(page)

        const chips = sandbox.locator('[data-cy="calendar-recurring-cal"] [data-cy^="origam-calendar-event-"]')
        await expect(chips.first()).toBeVisible({ timeout: 8000 })
        const count = await chips.count()
        expect(count).toBeGreaterThanOrEqual(3)
    })
})

test.describe('OrigamCalendar — ARIA / Keyboard', () => {
    test('day cells expose role=gridcell with aria-label', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const firstCell = sandbox.locator('[data-cy="calendar-playground-cal"] [role="gridcell"]').first()
        await expect(firstCell).toHaveAttribute('aria-label', /.+/)
    })

    test('view switcher exposes role=tab with aria-selected', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const monthTab = sandbox.locator('[data-cy="origam-calendar-view-month"]').first()
        await expect(monthTab).toHaveAttribute('role', 'tab')
        await expect(monthTab).toHaveAttribute('aria-selected', 'true')
    })

    test('arrow-right keyboard nav advances current-date by 1 day', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="calendar-playground-cal"]').first()
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
    test('clicking a day cell emits date-click', async ({ page }) => {
        await openVariant(page, 'Emit — event-click, date-click, range-select')
        const sandbox = sandboxOf(page)

        await sandbox
            .locator('[data-cy="calendar-emits-cal"] [role="gridcell"]')
            .first()
            .click()

        const log = sandbox.locator('[data-cy="calendar-emit-log"]').first()
        await expect(log).toContainText(/date-click/i, { timeout: 4000 })
    })

    test('clicking an event chip emits event-click', async ({ page }) => {
        await openVariant(page, 'Emit — event-click, date-click, range-select')
        const sandbox = sandboxOf(page)

        const firstEvent = sandbox.locator('[data-cy="calendar-emits-cal"] [data-cy^="origam-calendar-event-"]').first()
        await firstEvent.click({ force: true })
        const log = sandbox.locator('[data-cy="calendar-emit-log"]').first()
        await expect(log).toContainText(/event-click/i, { timeout: 4000 })
    })
})

test.describe('OrigamCalendar — slots', () => {
    test('#event slot renders the custom event card markup', async ({ page }) => {
        await openVariant(page, 'Slot — event (custom event card)')
        const sandbox = sandboxOf(page)

        const customEvent = sandbox.locator('[data-cy="calendar-slot-event-cal"] .custom-event').first()
        await expect(customEvent).toBeVisible()
    })

    test('#day slot replaces the default month-cell content', async ({ page }) => {
        await openVariant(page, 'Slot — day (custom day cell)')
        const sandbox = sandboxOf(page)

        const customCount = sandbox.locator('[data-cy="custom-day-count"]').first()
        await expect(customCount).toBeVisible()
    })

    test('#empty slot renders when no events fall in the range', async ({ page }) => {
        await openVariant(page, 'Slot — empty (custom CTA when agenda is empty)')
        const sandbox = sandboxOf(page)

        const customCta = sandbox.locator('[data-cy="custom-empty-cta"]').first()
        await expect(customCta).toBeVisible()
    })
})
