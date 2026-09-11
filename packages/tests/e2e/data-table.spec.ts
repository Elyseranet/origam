import { expect, test } from '@playwright/test'

const STORY_PATH = '/stories/story/components-stories-datatable-origamdatatable-story-vue'

test.describe('OrigamDataTable', () => {
    test('Basic variant — table renders with header and body', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — headers & items (basic dataset)', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-data-table').first()).toBeVisible({ timeout: 5000 })
        await expect(sandbox.locator('thead').first()).toBeVisible({ timeout: 5000 })
        await expect(sandbox.locator('tbody').first()).toBeVisible({ timeout: 5000 })
    })

    test('Basic variant — column headers are rendered', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — headers & items (basic dataset)', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.getByText('First name')).toBeVisible({ timeout: 5000 })
        await expect(sandbox.getByText('Last name')).toBeVisible({ timeout: 5000 })
    })

    test('Basic variant — item data is rendered', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — headers & items (basic dataset)', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.getByText('Alice')).toBeVisible({ timeout: 5000 })
    })

    test('Sorting variant — table renders with sortable columns', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — multiSort & mustSort', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-data-table').first()).toBeVisible({ timeout: 5000 })
    })

    test('Pagination variant — footer pagination is present', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        // `getByText('Pagination', { exact: true })` was ambiguous —
        // it ALSO matched the "Pagination" component group in the
        // Histoire sidebar (where OrigamPagination story lives).
        // Click the variant tile inside the current story's variant
        // panel instead. Histoire renders variant tiles with the
        // text "Pagination" inside `.histoire-variant` or similar;
        // we use `.last()` because the sidebar group entry comes
        // FIRST in DOM order, so the variant tile is last.
        await page.getByText('Prop — itemsPerPage (pagination)', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-data-table').first()).toBeVisible({ timeout: 5000 })
    })

    test('Selection variant — checkbox column is present', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — showSelect', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('input[type="checkbox"]').first()).toBeAttached({ timeout: 5000 })
    })

    test('Search variant — search field and table are both rendered', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — search', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-data-table').first()).toBeVisible({ timeout: 5000 })
        await expect(sandbox.locator('.origam-text-field').first()).toBeVisible({ timeout: 5000 })
    })

    test('Loading variant — table renders in loading state', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — loading', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-data-table').first()).toBeVisible({ timeout: 5000 })
    })

    test('Slot — top renders custom header content', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Slot — top', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.getByText('User list')).toBeVisible({ timeout: 5000 })
    })

    test('Playground — table renders with full set of controls', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Default', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-data-table').first()).toBeVisible({ timeout: 5000 })
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
            await page.goto(STORY_PATH)
            await page.waitForLoadState('networkidle')
            await page.getByText('Prop — loading (all shapes)', { exact: true }).first().click()
            await page.waitForTimeout(800)

            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            // The story default state: enabled=true, kind='line' → resolveDtLoading returns { type: 'line' }
            const table = sandbox.locator('[data-cy="data-table-loading-interactive"]')
            await expect(table).toBeVisible({ timeout: 5000 })
            // Headers row is still rendered while loading
            await expect(table.locator('thead').first()).toBeVisible({ timeout: 3000 })
            // A progress bar (linear, role=progressbar) must be present
            await expect(table.locator('[role="progressbar"]').first()).toBeVisible({ timeout: 3000 })
        })
    })
})
