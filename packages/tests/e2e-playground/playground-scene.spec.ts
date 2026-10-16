// Playground lot D (#1144) — multi-component scene + snippets, measured in a
// REAL browser against the standalone host (`playwright.playground.config.ts`).
//
// What this pins, each on the RENDERED DOM rather than on the scene object:
//
//   1. Picking OrigamDataTable in the catalogue loads its DEFAULT snippet and
//      the table paints real rows (`tbody tr`, cell text) — not the empty box
//      a blank instance renders (#1048: 131 props, nothing without
//      `headers` / `items`).
//   2. The scene tree is operable from the keyboard alone: moving into the
//      DataTable's child (the Btn in the `item.actions` cell slot) and
//      pressing Enter opens THAT instance's props in the inspector.
//   3. Adding a child through the tree updates the preview AND the Code
//      panel (lot C) — the generated template reflects the new level.
//   4. Removing a child does the reverse.
//   5. The OrigamBtn default snippet gives the rendered button an accessible
//      name (#1052 measured `button-name` on a blank `<origam-btn>`).
//   6. axe-core: zero violation on a multi-level scene and on each default
//      snippet but Chart's (#1153) — WCAG A/AA every rule; best-practice
//      every rule minus `label-title-only` (#1149).
//
// A/B: on the parent commit (`ffad458b3`) there is no scene tree, no snippet
// and the preview renders the selected instance only — every test below
// fails (see the PR body for the measured run).

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const openComponent = async (page: Page, name: string) => {
    await page.goto('/')
    await page.locator('[data-cy="playground-catalog-open"]').click()
    await page.locator(`[data-cy="playground-drawer-item-${name}"]`).click()
}

const preview = (page: Page) => page.locator('[data-cy="playground-preview"]')
const tree = (page: Page) => page.locator('[data-cy="playground-scene-tree-list"]')
const treeItem = (page: Page, label: string) => tree(page).getByRole('treeitem', { name: label, exact: true })
const inspectorTitle = (page: Page) => page.locator('#pg-inspector-title')
const code = (page: Page) => page.locator('[data-cy="playground-code"] code')

test.describe('playground — multi-component scene and snippets (#1144)', () => {
    test('DataTable picked from the catalogue loads its snippet and renders rows', async ({ page }) => {
        await openComponent(page, 'OrigamDataTable')

        const rows = preview(page).locator('tbody tr')

        await expect(rows).toHaveCount(3)

        const cells = await rows.evaluateAll(trs => trs.map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent?.trim())))

        expect(cells.map(row => row[0])).toEqual(['Ada Lovelace', 'Alan Turing', 'Grace Hopper'])
        expect(cells.map(row => row[3])).toEqual(['Edit', 'Edit', 'Edit'])

        await expect(preview(page).locator('thead th')).toHaveText(['Name', 'Role', 'Seats', 'Actions'])
        await expect(treeItem(page, 'DataTable')).toHaveAttribute('aria-selected', 'true')
        await expect(treeItem(page, 'Btn — Edit (#item.actions)')).toBeVisible()
    })

    test('selecting the cell sub-component with the keyboard opens its props', async ({ page }) => {
        await openComponent(page, 'OrigamDataTable')
        await expect(inspectorTitle(page)).toHaveText('DataTable')

        await treeItem(page, 'DataTable').focus()
        await page.keyboard.press('ArrowRight')

        const child = treeItem(page, 'Btn — Edit (#item.actions)')

        await expect(child).toBeFocused()
        await page.keyboard.press('Enter')

        await expect(child).toHaveAttribute('aria-selected', 'true')
        await expect(inspectorTitle(page)).toHaveText('Btn')
        await expect(page.locator('[data-cy="playground-control-input-text"] input')).toHaveValue('Edit')
        await expect(page.locator('[data-cy="playground-control-variant"]')).toHaveAttribute('data-set', 'true')
    })

    test('editing the selected child reaches every row it renders in', async ({ page }) => {
        await openComponent(page, 'OrigamDataTable')
        await treeItem(page, 'Btn — Edit (#item.actions)').click()

        const input = page.locator('[data-cy="playground-control-input-text"] input')

        await input.fill('Open')
        await input.press('Tab')

        await expect(preview(page).locator('tbody tr td:nth-child(4)')).toHaveText(['Open', 'Open', 'Open'])
        await expect(treeItem(page, 'Btn — Open (#item.actions)')).toBeVisible()
    })

    test('adding a child updates the preview, the tree and the Code panel', async ({ page }) => {
        await openComponent(page, 'OrigamTabs')
        await page.locator('[data-cy="playground-dock-handle"]').click()

        await expect(preview(page).getByRole('tab')).toHaveCount(3)
        await expect(code(page)).toContainText('<origam-tab text="Billing" value="billing"/>')

        const before = await code(page).textContent()

        expect(before?.match(/<origam-tab /g)).toHaveLength(3)

        await page.locator('[data-cy="playground-scene-add-child"]').click()

        await expect(preview(page).getByRole('tab')).toHaveCount(4)
        await expect(preview(page).getByRole('tab', { name: 'New tab' })).toBeVisible()
        await expect(treeItem(page, 'Tab — New tab')).toHaveAttribute('aria-selected', 'true')
        await expect(inspectorTitle(page)).toHaveText('Tab')
        await expect.poll(async () => (await code(page).textContent())?.match(/<origam-tab /g)?.length).toBe(4)
        await expect(code(page)).toContainText('<origam-tab text="New tab"/>')
    })

    test('removing a child updates the preview, the tree and the Code panel', async ({ page }) => {
        await openComponent(page, 'OrigamTabs')
        await page.locator('[data-cy="playground-dock-handle"]').click()

        await treeItem(page, 'Tab — Settings').click()
        await page.locator('[data-cy="playground-scene-remove"]').click()

        await expect(preview(page).getByRole('tab')).toHaveText(['Profile', 'Billing'])
        await expect(treeItem(page, 'Tab — Settings')).toHaveCount(0)
        await expect(treeItem(page, 'Tabs')).toHaveAttribute('aria-selected', 'true')
        await expect(code(page)).not.toContainText('Settings')
    })

    test('the Snippets panel replaces the scene with the chosen snippet', async ({ page }) => {
        await openComponent(page, 'OrigamDataTable')
        await page.locator('[data-cy="playground-dock-handle"]').click()

        await expect(code(page)).toContainText('<template #item.actions>')

        await page.locator('[data-cy="playground-snippet-data-table-minimal"]').click()

        await expect(preview(page).locator('tbody tr')).toHaveCount(3)
        await expect(preview(page).locator('thead th')).toHaveText(['Name', 'Role', 'Seats'])
        await expect(code(page)).not.toContainText('item.actions')
        await expect(tree(page).getByRole('treeitem')).toHaveCount(1)
    })

    test('the OrigamBtn default snippet gives the button an accessible name', async ({ page }) => {
        await openComponent(page, 'OrigamBtn')

        await expect(preview(page).getByRole('button', { name: 'Button', exact: true })).toBeVisible()
    })

    test('a sub-component that needs its parent is not offered as a root', async ({ page }) => {
        await page.goto('/')
        await page.locator('[data-cy="playground-catalog-open"]').click()

        await expect(page.locator('[data-cy="playground-drawer-item-OrigamTabs"]')).toBeVisible()
        await expect(page.locator('[data-cy="playground-drawer-item-OrigamTab"]')).toHaveCount(0)
        await expect(page.locator('[data-cy="playground-drawer-item-OrigamWindowItem"]')).toHaveCount(0)
    })

    const summarise = (violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) => violations
        .map(violation => `${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(' | ')}`)

    const expectNoViolation = async (page: Page) => {
        // Every WCAG 2.0 / 2.1 / 2.2 A + AA rule: zero, no exception.
        const wcag = await new AxeBuilder({ page })
            .include('[data-cy="playground-root"]')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze()

        expect(summarise(wcag.violations)).toEqual([])

        // Every rule, best-practice included — minus ONE, named: #1149.
        // `OrigamField` copies the input's `id` onto its two labels, so an
        // inspector field holding a value (every prop a snippet sets) trips
        // `label-title-only`. A DS defect with its own ticket, not a
        // playground one; drop this exclusion when #1149 lands.
        const all = await new AxeBuilder({ page })
            .include('[data-cy="playground-root"]')
            .disableRules(['label-title-only'])
            .analyze()

        expect(summarise(all.violations)).toEqual([])
    }

    test('axe-core: zero violation on a multi-level scene (DataTable, child selected, code open)', async ({ page }) => {
        // Two full axe passes over the whole playground (inspector included):
        // slow by nature, so the default 30 s budget is tripled.
        test.slow()
        await openComponent(page, 'OrigamDataTable')
        await expect(preview(page).locator('tbody tr')).toHaveCount(3)
        await treeItem(page, 'Btn — Edit (#item.actions)').click()
        await page.locator('[data-cy="playground-dock-handle"]').click()
        await expect(code(page)).toBeVisible()

        await expectNoViolation(page)
    })

    // OrigamChart is NOT in this list on purpose: its cartesian `<svg
    // role="img">` holds focusable points — `nested-interactive`, a DS
    // defect tracked as #1153.
    for (const name of ['OrigamTabs', 'OrigamWindow', 'OrigamList', 'OrigamSelect', 'OrigamBtn']) {
        test(`axe-core: zero violation on the ${name} default snippet`, async ({ page }) => {
            test.slow()
            await openComponent(page, name)
            await expect(preview(page).locator('[data-cy="playground-preview-instance"]').first()).toBeVisible()

            await expectNoViolation(page)
        })
    }
})
