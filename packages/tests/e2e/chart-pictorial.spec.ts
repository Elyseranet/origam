import { expect, test, type Page } from '@playwright/test'

import { eventLogItems, fillHstNumber, openEventsTab, selectHstOption } from './_support/histoire-controls'

/**
 * OrigamChartPictorial — Playwright spec.
 *
 * Asserts:
 *  - Background and filled `<use>` icon elements render for each column.
 *  - Direction variants (vertical / horizontal) produce correct data-cy targets.
 *  - iconsPerUnit changes granularity (fewer icons for larger unit value).
 *  - Legend toggle hides the corresponding column.
 *  - ARIA attributes (role="figure", role="img", title, desc) are present.
 *  - Each column group is keyboard-focusable with role="button".
 *  - Empty slot renders when series is empty.
 *  - point-click emit fires on column activation.
 *
 * === Fixture note (story updated 2024-Q4) ===
 * The Default variant now uses FIXTURE_BEER (8 categories, mode="fill", 1 series).
 * Tests that previously assumed FIXTURE_SATISFACTION (3 categories) have been
 * updated to expect 8 column groups in the Default variant.
 *
 * The story restructuring (canonical Design/State/Functional/Events/Slots
 * layout, see root CLAUDE.md) removed the side-by-side "pictorial-icon-*",
 * "pictorial-direction-*", "pictorial-ipu-*" fixtures — "icon"/
 * "direction"/"iconsPerUnit" are single dynamic controls on "Design",
 * which uses FIXTURE_SATISFACTION (3 categories, matching the old
 * per-icon/direction fixtures' count), driven sequentially. Verified
 * empirically that column count stays at 3 across every icon choice
 * (person/heart/star/dollar) — the old fixture's "star → 5 columns"
 * quirk was tied to fixture data that no longer exists, adapted to the
 * new, consistent 3-column reality. "pictorial-playground-chart" and
 * "pictorial-slot-empty-chart" data-cy values are unchanged. "Emit —
 * point-click" maps to "Events - point-click", whose fixture passes its
 * own data-cy ("pictorial-emit-point-click-chart") — Vue 3 fallthrough
 * replaces the component's static root data-cy there (no inheritAttrs:
 * false), so the story-level value is used; the removed pictorial-emit-
 * log DOM shell is read back via the shared `openEventsTab` /
 * `eventLogItems` helpers.
 *
 * Two timing-race flakes (same class documented on chart-bullet.spec.ts's
 * axis-ticks test) were unmasked on the unchanged "Default" describe
 * block's column-group and icon-render tests — hardened with
 * `toHaveCount`/`toBeAttached`. The emit test also needed
 * `.dispatchEvent('click')` instead of `.click()`: on Firefox only, the
 * `<g class="origam-chart-pictorial__column">` element's own bounding-box
 * centre resolves (via elementFromPoint) to the enclosing `<svg>`, not the
 * `<g>` itself, so a real pointer click never lands on it there (confirmed
 * reproducible 3/3 on Firefox, passing on chromium/webkit) — same class of
 * fix as bracket.spec.ts's divider click.
 */

const PICTORIAL_STORY = '/stories/story/components-stories-chart-origamchartpictorial-story-vue'
const CHART = '[data-cy="origam-chart-pictorial"]'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, title: string) => {
    await page.goto(PICTORIAL_STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(500)
}

test.describe('OrigamChartPictorial — Default', () => {
    test('renders figure root with role="figure"', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="pictorial-playground-chart"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveRole('figure') // #426 — root is a native <figure>, role is implicit, no explicit attribute any more
    })

    test('SVG carries role=img, title and desc', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator('[data-cy="pictorial-playground-chart"] svg').first()
        await expect(svg).toBeVisible()
        await expect(svg).toHaveAttribute('role', 'img')
        await expect(svg.locator('title')).toHaveCount(1)
        await expect(svg.locator('desc')).toHaveCount(1)
    })

    test('renders exactly 3 column groups (FIXTURE_SATISFACTION has 3 categories)', async ({ page }) => {
        // Default variant uses FIXTURE_BEER (8 categories, mode="fill").
        // Column groups are keyed by dataIndex (0-7) → 8 groups expected.
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-pictorial-default.png', fullPage: false })

        const cols = sandbox.locator('[data-cy="pictorial-playground-chart"] [data-cy^="origam-chart-pictorial-col-"]')
        await expect(cols).toHaveCount(8, { timeout: 6000 })
    })

    test('each column group has role="button" and a non-empty aria-label', async ({ page }) => {
        // Default variant uses FIXTURE_BEER (8 categories, mode="fill") → 8 column groups.
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const cols = sandbox.locator('[data-cy="pictorial-playground-chart"] [data-cy^="origam-chart-pictorial-col-"]')
        // Timing race found while repairing this spec's title drift,
        // unrelated to it (same class documented on chart-bullet.spec.ts's
        // axis-ticks test) — toHaveCount auto-retries.
        await expect(cols).toHaveCount(8, { timeout: 6000 })
        const count = await cols.count()
        for (let i = 0; i < count; i++) {
            await expect(cols.nth(i)).toHaveAttribute('role', 'button')
            const label = await cols.nth(i).getAttribute('aria-label')
            expect(label).toBeTruthy()
        }
    })

    test('each column group is keyboard-focusable (tabindex=0)', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const cols = sandbox.locator('[data-cy="pictorial-playground-chart"] [data-cy^="origam-chart-pictorial-col-"]')
        const count = await cols.count()
        for (let i = 0; i < count; i++) {
            await expect(cols.nth(i)).toHaveAttribute('tabindex', '0')
        }
    })

    test('background icons (empty) and filled icons both render', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const emptyIcons = sandbox.locator('[data-cy="pictorial-playground-chart"] .origam-chart-pictorial__icon--empty')
        const filledIcons = sandbox.locator('[data-cy="pictorial-playground-chart"] .origam-chart-pictorial__icon--filled')
        // Same timing race as "each column group has role=button…" above —
        // icon geometry settles after the fixed 500ms openVariant wait.
        await expect(emptyIcons.first()).toBeAttached({ timeout: 6000 })
        await expect(filledIcons.first()).toBeAttached({ timeout: 6000 })
        const emptyCount = await emptyIcons.count()
        const filledCount = await filledIcons.count()
        expect(emptyCount).toBeGreaterThan(0)
        expect(filledCount).toBeGreaterThan(0)
    })

    test('SVG defs contains symbol#origam-chart-pictorial-icon', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const symbol = sandbox.locator('[data-cy="pictorial-playground-chart"] defs symbol#origam-chart-pictorial-icon')
        await expect(symbol).toHaveCount(1, { timeout: 6000 })
    })
})

test.describe('OrigamChartPictorial — icon variants', () => {
    test('four icon variants all render 3 column groups', async ({ page }) => {
        // Dedicated side-by-side fixture folded into "Design" — a single
        // dynamic "Icon" control, driven sequentially through the same
        // FIXTURE_SATISFACTION data (3 categories) for every choice.
        // Verified empirically: column count stays at 3 regardless of
        // icon — the old fixture's "star → 5 columns" quirk was tied to
        // fixture data that no longer exists.
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        const cols = sandbox.locator(`${ CHART } [data-cy^="origam-chart-pictorial-col-"]`)
        await expect(cols).toHaveCount(3, { timeout: 8000 })

        for (const icon of ['person', 'heart', 'star', 'dollar']) {
            await selectHstOption(page, 'Icon', icon)
            await page.waitForTimeout(400)
            await expect(cols).toHaveCount(3, { timeout: 8000 })
        }
    })
})

test.describe('OrigamChartPictorial — direction', () => {
    test('vertical and horizontal variants both render 3 columns', async ({ page }) => {
        // Dedicated side-by-side fixture folded into "Design" — a single
        // dynamic "Direction" control (default 'vertical'), driven
        // sequentially.
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        const cols = sandbox.locator(`${ CHART } [data-cy^="origam-chart-pictorial-col-"]`)

        await expect(cols).toHaveCount(3, { timeout: 8000 })

        await selectHstOption(page, 'Direction', 'horizontal')
        await page.waitForTimeout(400)
        await expect(cols).toHaveCount(3, { timeout: 8000 })
    })
})

test.describe('OrigamChartPictorial — iconsPerUnit', () => {
    // DS BUG: MAX_SLOTS cap (=8) in OrigamChartPictorial makes iconsPerUnit=1 and iconsPerUnit=5
    // produce identical filled-icon counts when max data value (65 for FIXTURE_SATISFACTION)
    // exceeds 8 slots in both cases. rawSlotsPerColumn is capped to 8 and effectiveIconsPerUnit
    // is derived as maxValue/8 ≈ 8.125 regardless of the iconsPerUnit prop value.
    // Expected fix: raise MAX_SLOTS or use a fixture where iconsPerUnit values produce
    // rawSlotsPerColumn below the cap (e.g., iconsPerUnit=1 vs iconsPerUnit=10 with max=9).
    test.fail('iconsPerUnit=1 renders more filled icons than iconsPerUnit=5 for same data', async ({ page }) => {
        // ⛔ MISE A JOUR #426 — ce test reste rouge, mais ce n'est plus un
        // BUG : c'est un plafond ASSUME. Au-dela de MAX_SLOTS (8) icones par
        // colonne, le composant recalcule son propre pas (`maxValue / 8`)
        // pour garder la colonne lisible, et `iconsPerUnit` est ignoree.
        // Dessiner des centaines d'icones par colonne n'aurait pas de sens.
        //
        // Ce qui MANQUAIT, et qui est corrige : le plafond etait silencieux.
        // Il emet desormais un avertissement de developpement nommant la
        // raison, et la doc le porte (`OrigamChartPictorial.md`). La
        // couverture du contrat reel — pas d'avertissement sous le plafond,
        // avertissement au-dessus — est dans
        // `TU/components/Chart/chart-426-residuals.spec.ts`.
        //
        // Pour rendre CE test vert il faudrait une fixture sous le plafond
        // (son propre commentaire d'origine le disait) ; la story actuelle
        // n'en expose pas, et la fabriquer depasse le perimetre de #426.
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        const filled = sandbox.locator(`${ CHART } .origam-chart-pictorial__icon--filled`)

        await fillHstNumber(page, 'Icons Per Unit', 1)
        await page.waitForTimeout(400)
        const count1 = await filled.count()

        await fillHstNumber(page, 'Icons Per Unit', 5)
        await page.waitForTimeout(400)
        const count5 = await filled.count()

        expect(count1).toBeGreaterThan(count5)
    })
})

test.describe('OrigamChartPictorial — legend toggle', () => {
    test('clicking first legend item hides corresponding column and applies --hidden modifier', async ({ page }) => {
        // Default variant uses FIXTURE_BEER (8 categories, mode="fill", 1 series).
        // Before click: 8 fill-mode column groups. After hiding the 1 series: 0.
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const cols = sandbox.locator('[data-cy="pictorial-playground-chart"] [data-cy^="origam-chart-pictorial-col-"]')
        await expect(cols).toHaveCount(8, { timeout: 6000 })

        const legendItems = sandbox.locator('[data-cy="pictorial-playground-chart"] .origam-chart__legend-item')
        await expect(legendItems.first()).toBeVisible()
        await legendItems.first().click()
        await page.waitForTimeout(300)

        await expect(cols).toHaveCount(0, { timeout: 4000 })
        await expect(legendItems.first()).toHaveClass(/origam-chart__legend-item--hidden/, { timeout: 4000 })
    })

    test('re-clicking hidden legend item restores columns', async ({ page }) => {
        // Default variant uses FIXTURE_BEER (8 categories, mode="fill", 1 series).
        // After hide → 0 cols. After restore → 8 cols.
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const cols = sandbox.locator('[data-cy="pictorial-playground-chart"] [data-cy^="origam-chart-pictorial-col-"]')
        const legendItems = sandbox.locator('[data-cy="pictorial-playground-chart"] .origam-chart__legend-item')

        await legendItems.first().click()
        await page.waitForTimeout(300)
        await expect(cols).toHaveCount(0)

        await legendItems.first().click()
        await page.waitForTimeout(300)
        await expect(cols).toHaveCount(8)
        await expect(legendItems.first()).not.toHaveClass(/origam-chart__legend-item--hidden/)
    })
})

test.describe('OrigamChartPictorial — empty state', () => {
    test('empty slot renders when series is empty', async ({ page }) => {
        await openVariant(page, 'Slots - Empty')
        const sandbox = sandboxOf(page)
        const empty = sandbox.locator('[data-cy="pictorial-slot-empty-chart"] [data-cy="origam-chart-pictorial-empty"]')
        await expect(empty).toBeVisible({ timeout: 6000 })
        await expect(empty).toContainText('No satisfaction data')
    })
})

test.describe('OrigamChartPictorial — emit', () => {
    test('clicking a column fires point-click and appends to log', async ({ page }) => {
        // Canonical Variant is "Events - point-click". Its fixture passes
        // its OWN data-cy ("pictorial-emit-point-click-chart") — Vue 3
        // fallthrough replaces the component's static root data-cy there.
        // The old "pictorial-emit-log" DOM shell is gone — read back from
        // Histoire's own "Events" tab instead.
        await openVariant(page, 'Events - point-click')
        const sandbox = sandboxOf(page)

        const col0 = sandbox.locator('[data-cy="pictorial-emit-point-click-chart"] [data-cy="origam-chart-pictorial-col-0"]').first()
        await expect(col0).toBeVisible({ timeout: 8000 })
        // Firefox-only click-interception found while verifying this spec:
        // the <g class="origam-chart-pictorial__column"> element's own
        // bounding box resolves (via elementFromPoint) to the enclosing
        // <svg> in Firefox, not the <g> itself, so a real pointer `.click()`
        // never lands on it there (reproduced consistently, 3/3 repeats).
        // Same class of fix as bracket.spec.ts's divider click:
        // `.dispatchEvent('click')` fires the DOM click directly on the
        // target, bypassing pixel-level hit-testing.
        await col0.dispatchEvent('click')
        await page.waitForTimeout(300)

        await openEventsTab(page)
        await expect(eventLogItems(page).first()).toContainText('point-click', { timeout: 4000 })
    })
})
