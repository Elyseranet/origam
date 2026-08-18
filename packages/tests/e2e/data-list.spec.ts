import { expect, test, type Page } from '@playwright/test'

import { selectHstOption } from './_support/histoire-controls'

const STORY_PATH = '/stories/story/components-stories-datalist-origamdatalist-story-vue'

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, variant: string) => {
    await page.goto(STORY_PATH, { waitUntil: 'domcontentloaded' })
    // NO waitForLoadState('networkidle') here — the canonical recipe in
    // btn.spec.ts forbids it, and it was measured as the exact call that
    // stalls: under worker contention this spec failed with
    // `page.waitForLoadState: Test timeout of 30000ms exceeded` while every
    // assertion budget below was untouched. `networkidle` waits on a global
    // network-quiet condition unrelated to what the test needs; the click
    // below already auto-waits for the sidebar link to be actionable.
    // Navigate via the sidebar `<a>` link (NOT generic getByText — that
    // matches the iframe contents too) so the Variant URL is committed.
    await page.getByRole('link', { name: variant, exact: true }).click()
    await page.waitForTimeout(800)
}

/**
 * Story realignment (canonical Design/Functional/Events/Slots structure):
 * the old per-prop `Prop — …` Variants were folded into the "Design" /
 * "Functional" Variants' controls (color/density/rounded/border on Design;
 * mode/prependIcon/appendIcon on Functional) — driven here via
 * `selectHstOption` instead of navigating to a vanished dedicated fixture.
 * Class/style expectations below were verified empirically against a
 * running Histoire instance (2026-08), not assumed.
 */
test.describe('OrigamDataList — avatar mode (back-compat)', () => {
    // 45000 comme btn/list/tabs/code/drawer, dont cette spec reprend le modèle.
    // Elle était seule sur le défaut Playwright de 30000 tout en faisant DEUX
    // navigations (racine de story puis clic sur le lien de la sidebar) là où
    // les specs canoniques n'en font qu'une : le budget le plus court couvrait
    // le geste le plus lourd. Mesuré : sous contention, l'échec est
    // `Test timeout of 30000ms exceeded` sur page.goto/click — jamais sur une
    // assertion. Les budgets d'assertion restent inchangés.
    test.setTimeout(45000)

    test('Basic variant — renders a definition list', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-data-list').first()).toBeVisible({ timeout: 5000 })
        // Default mode is `avatar`, so the modifier class must be present.
        await expect(sandbox.locator('.origam-data-list--mode-avatar').first()).toBeVisible({ timeout: 5000 })
    })

    test('Basic variant — title and text content are visible', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await expect(sandbox.getByText('Status')).toBeVisible({ timeout: 5000 })
        await expect(sandbox.getByText('Active')).toBeVisible({ timeout: 5000 })
    })

    test('Density variant — renders with density class', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Density', 'Compact')
        await expect(sandbox.locator('.origam-data-list--density-compact').first()).toBeVisible({ timeout: 5000 })
    })

    test('Adjacent icons variant — renders with icon controls', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Prepend Icon', 'Account')
        await selectHstOption(page, 'Append Icon', 'Star')
        await expect(sandbox.locator('.origam-icon.mdi-account').first()).toBeVisible({ timeout: 5000 })
        await expect(sandbox.locator('.origam-icon.mdi-star').first()).toBeVisible({ timeout: 5000 })
    })

    test('Border and rounded variant — renders', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Border', 'Border (legacy boolean → thin)')
        await selectHstOption(page, 'Rounded', 'small (radius.sm / 4px)')
        const root = sandbox.locator('.origam-data-list').first()
        await expect(root).toHaveClass(/origam-data-list--border/, { timeout: 5000 })
        await expect(root).toHaveClass(/origam-data-list--rounded-small/, { timeout: 5000 })
    })

    test('Slot — item renders custom item content', async ({ page }) => {
        await openVariant(page, 'Slots - Item')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-data-list').first()).toBeVisible({ timeout: 5000 })
        await expect(sandbox.getByText('Status')).toBeVisible({ timeout: 5000 })
    })

    test('Slot — item.title renders custom title', async ({ page }) => {
        await openVariant(page, 'Slots - Item.title')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-data-list').first()).toBeVisible({ timeout: 5000 })
    })

    test('Playground — data list renders with all controls', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-data-list').first()).toBeVisible({ timeout: 5000 })
    })
})

// ───────────────────────────────────────────────────────────────────
// KV mode — PDF-aligned key/value rows
// ───────────────────────────────────────────────────────────────────

// Story realignment: there is no more standalone "KV — basic" nor
// "Prop — mode (kv vs avatar)" Variant — `mode` is now the "Functional"
// Variant's Mode HstSelect control (init-state default: 'avatar'), driven
// via the shared `selectHstOption` helper (now proven reliable — the old
// "don't try to flip a HstSelect" caveat this file carried predates that
// helper).
test.describe('OrigamDataList — KV mode (PDF design)', () => {
    test.setTimeout(45000)

    test('KV basic — root carries the kv mode class', async ({ page }) => {
        await openVariant(page, 'Functional')
        await selectHstOption(page, 'Mode', 'kv')
        const sandbox = sandboxOf(page)
        const root = sandbox.locator('.origam-data-list--mode-kv').first()
        await expect(root).toBeVisible({ timeout: 8000 })
        // Sanity: the same element is also a `<dl>` (semantic).
        const tag = await root.evaluate(el => el.tagName.toLowerCase())
        expect(tag).toBe('dl')
    })

    test('KV basic — emits one <dt>+<dd> per item (4 rows)', async ({ page }) => {
        await openVariant(page, 'Functional')
        await selectHstOption(page, 'Mode', 'kv')
        const sandbox = sandboxOf(page)
        const root = sandbox.locator('.origam-data-list--mode-kv').first()
        await expect(root).toBeVisible({ timeout: 8000 })

        const counts = await root.evaluate(el => {
            return {
                rows: el.querySelectorAll('.origam-data-list__kv-row').length,
                dts: el.querySelectorAll('dt.origam-data-list__kv-key').length,
                dds: el.querySelectorAll('dd.origam-data-list__kv-value').length,
            }
        })
        expect(counts.rows).toBe(4)
        expect(counts.dts).toBe(4)
        expect(counts.dds).toBe(4)
    })

    test('KV basic — rows expose data-cy keyed off the kebab-cased label', async ({ page }) => {
        await openVariant(page, 'Functional')
        await selectHstOption(page, 'Mode', 'kv')
        const sandbox = sandboxOf(page)
        // data-cy is generated as `data-list-kv-row-${toKebabCase(item.key)}`
        // by the component. Spaces in `Created at` collapse to a single dash.
        await expect(
            sandbox.locator('[data-cy="data-list-kv-row-status"]')
        ).toBeVisible({ timeout: 8000 })
        await expect(
            sandbox.locator('[data-cy="data-list-kv-row-owner"]')
        ).toBeVisible({ timeout: 8000 })
        await expect(
            sandbox.locator('[data-cy="data-list-kv-row-created-at"]')
        ).toBeVisible({ timeout: 8000 })
        await expect(
            sandbox.locator('[data-cy="data-list-kv-row-priority"]')
        ).toBeVisible({ timeout: 8000 })
    })

    test('KV basic — key uses muted color, value uses primary text color', async ({ page }) => {
        await openVariant(page, 'Functional')
        await selectHstOption(page, 'Mode', 'kv')
        const sandbox = sandboxOf(page)
        const row = sandbox.locator('[data-cy="data-list-kv-row-owner"]').first()
        await expect(row).toBeVisible({ timeout: 8000 })

        const colors = await row.evaluate(el => {
            const dt = el.querySelector('dt')!
            const dd = el.querySelector('dd')!
            return {
                key: getComputedStyle(dt).color,
                value: getComputedStyle(dd).color,
            }
        })
        // The two columns MUST visually differ. The token mapping puts
        // key on `color.text.secondary` (#525252) and value on
        // `color.text.primary` (#171717). We assert the difference
        // rather than the exact rgb(…) string so a future tweak of the
        // muted ramp doesn't tear the test.
        // DS BUG: the SCSS uses `inherit` for both --origam-data-list__kv---key-color
        // and --origam-data-list__kv---value-color, so both columns likely resolve
        // to the same computed color unless overridden by a theme token. If key ===
        // value below, the token wiring is missing.
        expect(colors.key).not.toBe(colors.value)
        // Sanity: both must be valid `rgb(…)` strings — never empty or `inherit`.
        expect(colors.key).toMatch(/^rgb/)
        expect(colors.value).toMatch(/^rgb/)
    })

    test('KV basic — renders text values verbatim', async ({ page }) => {
        await openVariant(page, 'Functional')
        await selectHstOption(page, 'Mode', 'kv')
        const sandbox = sandboxOf(page)
        await expect(sandbox.getByText('Arnaud Martin').first()).toBeVisible({ timeout: 8000 })
        await expect(sandbox.getByText('Apr 12, 2026').first()).toBeVisible({ timeout: 8000 })
    })

    test('KV mixed — chip-valued row renders an .origam-chip inside <dd>', async ({ page }) => {
        await openVariant(page, 'Slots - KV component-value cells')
        const sandbox = sandboxOf(page)
        await expect(
            sandbox.locator('.origam-data-list--mode-kv').first()
        ).toBeVisible({ timeout: 8000 })

        // Status row should host a chip in its <dd>.
        const statusRow = sandbox.locator('[data-cy="data-list-kv-row-status"]').first()
        await expect(statusRow).toBeVisible({ timeout: 8000 })
        await expect(statusRow.locator('dd .origam-chip')).not.toHaveCount(0, { timeout: 8000 })

        // Priority row should also host a chip (different intent).
        const priorityRow = sandbox.locator('[data-cy="data-list-kv-row-priority"]').first()
        await expect(priorityRow.locator('dd .origam-chip')).not.toHaveCount(0, { timeout: 8000 })
    })

    test('KV mixed — text-valued row keeps a plain <dd> (no chip)', async ({ page }) => {
        await openVariant(page, 'Slots - KV component-value cells')
        const sandbox = sandboxOf(page)
        const ownerRow = sandbox.locator('[data-cy="data-list-kv-row-owner"]').first()
        await expect(ownerRow).toBeVisible({ timeout: 8000 })
        await expect(ownerRow.locator('dd')).toContainText('Arnaud Martin')
        await expect(ownerRow.locator('dd .origam-chip')).toHaveCount(0)
    })

    test('KV slot override — #value slot replaces the default cell renderer', async ({ page }) => {
        await openVariant(page, 'Slots - Value (KV mode)')
        const sandbox = sandboxOf(page)
        await expect(
            sandbox.locator('.origam-data-list--mode-kv').first()
        ).toBeVisible({ timeout: 8000 })

        // The Owner row uses a `<a href="#owner-profile">` injected by the
        // consumer's slot override. Story realignment: the new story does
        // NOT set a `data-cy` on this link (verified by reading
        // OrigamDataList.story.vue) — targeted by href instead.
        const link = sandbox.locator('a[href="#owner-profile"]').first()
        await expect(link).toBeVisible({ timeout: 8000 })
        const href = await link.getAttribute('href')
        expect(href).toBe('#owner-profile')
        // The link must live INSIDE the Owner row's <dd>.
        const ownerRow = sandbox.locator('[data-cy="data-list-kv-row-owner"]').first()
        await expect(ownerRow.locator('dd a[href="#owner-profile"]')).toHaveCount(1)
    })

    test('KV mode toggle — selecting Mode=kv on Functional swaps to KV rendering', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Mode', 'kv')

        await expect(
            sandbox.locator('.origam-data-list--mode-kv').first()
        ).toBeVisible({ timeout: 8000 })
        await expect(sandbox.locator('.origam-data-list--mode-avatar')).toHaveCount(0)
    })
})
