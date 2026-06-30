import { expect, test } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId.
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamDataTable (0-based):
 *   0  → Design
 *   1  → State
 *   2  → Functional
 *   3  → Events - update:currentItems
 *   4  → Events - update:expanded
 *   5  → Events - update:groupBy
 *   6  → Events - update:itemsPerPage
 *   7  → Events - update:modelValue
 *   8  → Events - update:options
 *   9  → Events - update:page
 *  10  → Events - update:sortBy
 *  11  → Slots - Top
 *  12  → Slots - Prepend
 *  13  → Slots - Append
 *  14  → Slots - Body
 *  15  → Slots - Bottom
 *  16  → Slots - Colgroup
 *  17  → Slots - Default
 *  18  → Slots - Header
 *  19  → Slots - Header.loader
 *  20  → Slots - Header.mobile
 *  21  → Slots - Thead
 *  22  → Prop — headers & items (basic dataset)
 *  23  → Prop — multiSort & mustSort
 *  24  → Prop — itemsPerPage (pagination)
 *  25  → Prop — showSelect
 *  26  → Prop — search
 *  27  → Prop — loading
 *  28  → Slot — top
 *  29  → Prop — loading (all shapes)
 *  30  → Default (playground)
 */
const STORY_ID   = 'components-stories-datatable-origamdatatable-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamDataTable', () => {
    test.setTimeout(45000)

    test('Basic variant — table renders with header and body', async ({ page }) => {
        await page.goto(variantUrl(22))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-data-table').first()).toBeVisible({ timeout: 20000 })
        await expect(sandbox.locator('thead').first()).toBeVisible({ timeout: 15000 })
        await expect(sandbox.locator('tbody').first()).toBeVisible({ timeout: 15000 })
    })

    test('Basic variant — column headers are rendered', async ({ page }) => {
        await page.goto(variantUrl(22))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-data-table').first()).toBeVisible({ timeout: 20000 })
        await expect(sandbox.getByText('First name')).toBeVisible({ timeout: 15000 })
        await expect(sandbox.getByText('Last name')).toBeVisible({ timeout: 15000 })
    })

    test('Basic variant — item data is rendered', async ({ page }) => {
        await page.goto(variantUrl(22))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-data-table').first()).toBeVisible({ timeout: 20000 })
        await expect(sandbox.getByText('Alice')).toBeVisible({ timeout: 15000 })
    })

    test('Sorting variant — table renders with sortable columns', async ({ page }) => {
        await page.goto(variantUrl(23))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-data-table').first()).toBeVisible({ timeout: 20000 })
    })

    test('Pagination variant — footer pagination is present', async ({ page }) => {
        await page.goto(variantUrl(24))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-data-table').first()).toBeVisible({ timeout: 20000 })
    })

    test('Selection variant — checkbox column is present', async ({ page }) => {
        await page.goto(variantUrl(25))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('input[type="checkbox"]').first()).toBeAttached({ timeout: 20000 })
    })

    test('Search variant — search field and table are both rendered', async ({ page }) => {
        await page.goto(variantUrl(26))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-data-table').first()).toBeVisible({ timeout: 20000 })
        await expect(sandbox.locator('.origam-text-field').first()).toBeVisible({ timeout: 15000 })
    })

    test('Loading variant — table renders in loading state', async ({ page }) => {
        await page.goto(variantUrl(27))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-data-table').first()).toBeVisible({ timeout: 20000 })
    })

    test('Slot — top renders custom header content', async ({ page }) => {
        await page.goto(variantUrl(28))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.getByText('User list')).toBeVisible({ timeout: 20000 })
    })

    test('Playground — table renders with full set of controls', async ({ page }) => {
        await page.goto(variantUrl(30))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-data-table').first()).toBeVisible({ timeout: 20000 })
    })

    test.describe('Loading shapes', () => {
        // The "Prop — loading (all shapes)" variant was consolidated (as of
        // feature/marketing-v5-phase1) into a single interactive table with
        // data-cy="data-table-loading-interactive" driven by HstSelect/HstCheckbox
        // controls. The previous five separate per-shape tables (data-cy=
        // "data-table-loading-bool/number/line/circular/skeleton") no longer
        // exist in the story DOM. The HstSelect picker is custom DOM and brittle
        // to drive headlessly (per CLAUDE.md story conventions). Only the
        // default state (enabled=true, kind='line' → loading={ type:'line' })
        // can be verified without picker interaction.
        //
        // Removed tests (4):
        //   - loading=42 → determinate progress at 42 %
        //     (requires kind=number via HstSelect; no static fixture available)
        //   - loading={ type: "circular" } → circular progress
        //     (requires kind=circular via HstSelect; no static fixture available)
        //   - loading={ type: "skeleton" } → skeleton rows in body
        //     (requires kind=skeleton via HstSelect; no static fixture available)
        //   - loading={ type: "line" } → linear progress mounted
        //     (duplicate of default-state test below; merged)

        test('loading (all shapes) — default state (kind=line, enabled=true) renders table with progress bar', async ({ page }) => {
            await page.goto(variantUrl(29))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            // The story default state: enabled=true, kind='line' → resolveDtLoading returns { type: 'line' }
            const table = sandbox.locator('[data-cy="data-table-loading-interactive"]')
            await expect(table).toBeVisible({ timeout: 20000 })
            // Headers row is still rendered while loading
            await expect(table.locator('thead').first()).toBeVisible({ timeout: 5000 })
            // A progress bar (linear, role=progressbar) must be present
            await expect(table.locator('[role="progressbar"]').first()).toBeVisible({ timeout: 5000 })
        })
    })
})
