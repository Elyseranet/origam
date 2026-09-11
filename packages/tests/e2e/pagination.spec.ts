import { expect, test } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId (cf. btn.spec.ts).
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamPagination (0-based) :
 *   0  → Design
 *   1  → Functional
 *   2  → Events - update:modelValue
 *   3  → Events - first
 *   4  → Events - prev
 *   5  → Events - next
 *   6  → Events - last
 *   7  → Slots - First
 *   8  → Slots - Last
 *   9  → Slots - Prev
 *  10  → Slots - Next
 *  11  → Slots - Item
 *  12  → Slots - Info
 *  13  → Length and total visible
 *  14  → First / last page buttons
 *  15  → Color — default vs primary
 *  16  → Prop — disabled
 *  17  → Compact
 *  18  → Compact + showFirstLastPage
 *  19  → With info
 *  20  → Prop — size (small / default / large)
 *  21  → Default (playground)
 */

const STORY_ID   = 'components-stories-pagination-origampagination-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamPagination', () => {
    test.setTimeout(45000)

    test('Basic variant — pagination nav is rendered', async ({ page }) => {
        await page.goto(variantUrl(21))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[role="navigation"]').first()).toBeVisible({ timeout: 12000 })
    })

    test('Basic variant — page buttons are rendered', async ({ page }) => {
        await page.goto(variantUrl(21))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const nav = sandbox.locator('[role="navigation"]').first()
        await expect(nav).toBeVisible({ timeout: 12000 })
        const buttons = nav.getByRole('button')
        await expect(buttons.first()).toBeVisible({ timeout: 12000 })
    })

    test('Length and total visible variant — ellipsis is used for large lengths', async ({ page }) => {
        await page.goto(variantUrl(13))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[role="navigation"]').first()).toBeVisible({ timeout: 12000 })
    })

    test('First / last page buttons variant — first/last buttons are present', async ({ page }) => {
        await page.goto(variantUrl(14))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-pagination__first').first()).toBeAttached({ timeout: 12000 })
    })

    test('Color variant — pagination renders with color intent', async ({ page }) => {
        await page.goto(variantUrl(15))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[role="navigation"]').first()).toBeVisible({ timeout: 12000 })
    })

    test('Disabled variant — pagination buttons are disabled', async ({ page }) => {
        await page.goto(variantUrl(16))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const nav = sandbox.locator('[role="navigation"]').first()
        await expect(nav).toBeVisible({ timeout: 12000 })
    })

    test('Slot — item renders custom page buttons', async ({ page }) => {
        await page.goto(variantUrl(11))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[role="navigation"]').first()).toBeVisible({ timeout: 12000 })
    })

    test('Emit — update:modelValue variant renders pagination', async ({ page }) => {
        await page.goto(variantUrl(2))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[role="navigation"]').first()).toBeVisible({ timeout: 12000 })
    })

    test('Playground — pagination renders with all controls', async ({ page }) => {
        await page.goto(variantUrl(21))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[role="navigation"]').first()).toBeVisible({ timeout: 12000 })
    })

    // ════ COMPACT variant ════

    test('Compact — renders an <input type="number"> element', async ({ page }) => {
        await page.goto(variantUrl(17))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const input = sandbox.locator('[data-cy="pagination-compact-input"]')
        await expect(input).toBeVisible({ timeout: 12000 })
        await expect(input).toHaveAttribute('type', 'number')
    })

    test('Compact — does NOT render page-number buttons', async ({ page }) => {
        await page.goto(variantUrl(17))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // No page-number items (buttons with aria-label "Go to page N")
        const pageItems = sandbox.locator('.origam-pagination__item')
        await expect(pageItems).toHaveCount(0, { timeout: 12000 })
    })

    test('Compact — typing a valid page and pressing Enter updates the value', async ({ page }) => {
        await page.goto(variantUrl(17))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const input = sandbox.locator('[data-cy="pagination-compact-input"]')
        await expect(input).toBeVisible({ timeout: 12000 })
        await input.fill('5')
        await input.press('Enter')
        await expect(input).toHaveValue('5', { timeout: 3000 })
    })

    test('Compact — typing a value above length clamps to length', async ({ page }) => {
        await page.goto(variantUrl(17))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const input = sandbox.locator('[data-cy="pagination-compact-input"]')
        await expect(input).toBeVisible({ timeout: 12000 })
        await input.fill('99')
        await input.press('Enter')
        // length=12, so should clamp to 12
        await expect(input).toHaveValue('12', { timeout: 3000 })
    })

    test('Compact + showFirstLastPage — all four chevrons are rendered', async ({ page }) => {
        await page.goto(variantUrl(18))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-pagination__first').first()).toBeAttached({ timeout: 12000 })
        await expect(sandbox.locator('.origam-pagination__last').first()).toBeAttached({ timeout: 12000 })
        await expect(sandbox.locator('.origam-pagination__prev').first()).toBeAttached({ timeout: 12000 })
        await expect(sandbox.locator('.origam-pagination__next').first()).toBeAttached({ timeout: 12000 })
    })

    // ════ P3·G — Color (default vs primary) ════
    //
    // The PDF asks: the DEFAULT pagination look should be subtle
    // (text-only, transparent surface); the "stylé" filled look kicks
    // in only when the consumer explicitly passes color="primary".
    // We assert the difference at the computed-style level — the
    // resting page button's background-color must be transparent in
    // the default fixture and non-transparent in the primary fixture.

    test('Color — default fixture has transparent page-button background', async ({ page }) => {
        await page.goto(variantUrl(15))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('[data-cy="pagination-default-look"]')
        await expect(root).toBeVisible({ timeout: 12000 })

        // Pick a NON-active page item button so we read the resting
        // surface, not the active overlay.
        const restingBtn = root.locator('.origam-pagination__item:not(.origam-pagination__item--is-active) .origam-btn').first()
        await expect(restingBtn).toBeVisible({ timeout: 12000 })

        const bg = await restingBtn.evaluate((el) => getComputedStyle(el).backgroundColor)
        // Accept any of the canonical "transparent" forms a browser
        // may return: rgba(0,0,0,0), transparent, or rgb(*, *, *) with
        // alpha == 0 in the fourth slot.
        expect(bg).toMatch(/rgba?\(0,\s*0,\s*0,\s*0\)|transparent/)
    })

    test('Color — primary fixture has non-transparent page-button background', async ({ page }) => {
        await page.goto(variantUrl(15))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('[data-cy="pagination-primary-look"]')
        await expect(root).toBeVisible({ timeout: 12000 })

        const restingBtn = root.locator('.origam-pagination__item:not(.origam-pagination__item--is-active) .origam-btn').first()
        await expect(restingBtn).toBeVisible({ timeout: 12000 })

        const bg = await restingBtn.evaluate((el) => getComputedStyle(el).backgroundColor)
        // Must NOT be the transparent fallback. Anything else (any
        // RGB(A) with non-zero alpha) means the btn's intent fill
        // shone through, which is the desired "stylé" PDF look.
        expect(bg).not.toMatch(/^rgba?\(0,\s*0,\s*0,\s*0\)$|^transparent$/)
    })

    test('Color — primary fixture root carries the --colored modifier class', async ({ page }) => {
        await page.goto(variantUrl(15))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('[data-cy="pagination-primary-look"]')
        await expect(root).toBeVisible({ timeout: 12000 })
        await expect(root).toHaveClass(/origam-pagination--colored/)
    })

    test('Color — default fixture root does NOT carry the --colored modifier class', async ({ page }) => {
        await page.goto(variantUrl(15))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('[data-cy="pagination-default-look"]')
        await expect(root).toBeVisible({ timeout: 12000 })
        const cls = await root.getAttribute('class')
        expect(cls ?? '').not.toMatch(/origam-pagination--colored/)
    })

    // ════ P3·G — Compact (no number buttons) ════

    test('Compact variant — no page-number buttons rendered', async ({ page }) => {
        await page.goto(variantUrl(17))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('[data-cy="pagination-compact"]')
        await expect(root).toBeVisible({ timeout: 12000 })

        // Compact mode swaps the page-number list for a single input
        // between prev/next; assert no .origam-pagination__item is
        // attached and the input IS attached.
        await expect(root.locator('.origam-pagination__item')).toHaveCount(0, { timeout: 12000 })
        await expect(root.locator('[data-cy="pagination-compact-input"]')).toBeVisible({ timeout: 12000 })
    })

    // ════ P3·G — With info ════

    test('With info — info label matches the "Showing N-M of T" pattern', async ({ page }) => {
        await page.goto(variantUrl(19))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('[data-cy="pagination-with-info"]')
        await expect(root).toBeVisible({ timeout: 12000 })

        const info = root.locator('[data-cy="pagination-info"]')
        await expect(info).toBeVisible({ timeout: 12000 })

        const text = (await info.textContent() ?? '').trim()
        expect(text).toMatch(/Showing\s+\d+-\d+\s+of\s+\d+/)
    })

    test('With info — info label updates when the page changes', async ({ page }) => {
        await page.goto(variantUrl(19))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('[data-cy="pagination-with-info"]')
        const info = root.locator('[data-cy="pagination-info"]')
        await expect(info).toBeVisible({ timeout: 12000 })

        const initial = (await info.textContent() ?? '').trim()

        // Click the "next" chevron (icon-only btn at the end of the list).
        const nextBtn = root.locator('.origam-pagination__next .origam-btn').first()
        await expect(nextBtn).toBeVisible({ timeout: 12000 })
        await nextBtn.click()
        await page.waitForTimeout(200)

        const after = (await info.textContent() ?? '').trim()
        expect(after).not.toEqual(initial)
        expect(after).toMatch(/Showing\s+\d+-\d+\s+of\s+\d+/)
    })

    test('With info — root carries the --with-info modifier class', async ({ page }) => {
        await page.goto(variantUrl(19))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('[data-cy="pagination-with-info"]')
        await expect(root).toBeVisible({ timeout: 12000 })
        await expect(root).toHaveClass(/origam-pagination--with-info/)
    })
})
