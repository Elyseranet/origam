/**
 * marketing-reference-row-list.spec.ts — the reference tables (`RowList`)
 * keep their type, default value and `required` columns when a page
 * customises the copy payload or the visible label (#1169).
 *
 * ⛔ Targets the Nuxt site (`playwright.marketing.config.ts`), never
 * Histoire: listed in `MARKETING_SPEC_PATTERNS` and in the green list.
 * Reads the API-Reference DB — without a seeded Postgres the pages are empty.
 *
 * ── The defect it pins ──────────────────────────────────────────────────
 * `RowList` renders the name, the `required` badge, the type chip (linked
 * to `/types/{slug}`) and the default value INSIDE its `title` slot. The
 * component props table re-declared that whole slot to change one detail —
 * what the copy button copies (`propCopyAttr`, a paste-ready attribute) —
 * and the three other columns disappeared with it. The directive modifiers
 * table did the same to prefix a `.`, and lost its copy button.
 *
 * Both now go through narrow extension points (`copy-value` prop, `name`
 * slot), so the rest of the row is RowList's own default.
 *
 * A/B measured against the parent commit: the props and modifier tests are
 * red there, the directive-args test is green on both (non-regression
 * control: that table never re-declared `title`).
 */

import { expect, test, type Page } from '@playwright/test'

import { requireMarketingDb } from './_support/require-marketing-db'

requireMarketingDb()

/**
 * Headless Chromium blocks the Clipboard API without OS permissions, so
 * `navigator.clipboard.writeText` is replaced before the page loads and every
 * payload is recorded in `window.__clip` — same approach as `clipboard.spec.ts`.
 */
test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        const w = window as unknown as { __clip: string[] }
        w.__clip = []
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText: async (text: string) => { w.__clip.push(text) } }
        })
    })
})

/**
 * Clicks a row's copy button and returns the last payload. Retried with
 * `toPass` because a click landing before hydration has no handler yet.
 */
async function expectCopied (page: Page, rowCy: string, expected: string): Promise<void> {
    const row = page.locator(`[data-cy="${rowCy}"]`)

    await expect(async () => {
        await row.hover()
        await row.locator('[data-cy="origam-clipboard-default-trigger"]').click()
        const clip = await page.evaluate(() => (window as unknown as { __clip: string[] }).__clip)
        expect(clip.at(-1)).toBe(expected)
    }).toPass({ timeout: 15_000 })
}

test.describe('/components/btn — props table (#1169)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/components/btn')
        await expect(page.locator('[data-cy="component-props-table"]')).toBeVisible()
    })

    test('`icon` shows its type `boolean | TIcon`, linked to /types/icon', async ({ page }) => {
        const row = page.locator('[data-cy="prop-row-icon"]')
        const link = row.locator('dt a.prop-list__type-link')

        await expect(link).toHaveAttribute('href', '/types/icon')
        await expect(link.locator('.prop-list__type-chip')).toHaveText('boolean | TIcon')
    })

    test('`block` shows its type `boolean` and its default `false`', async ({ page }) => {
        const row = page.locator('[data-cy="prop-row-block"]')

        await expect(row.locator('dt .prop-list__type-chip')).toHaveText('boolean')
        await expect(row.locator('dt .prop-list__default')).toHaveText('false')
    })

    test('the copy button still copies the paste-ready attribute', async ({ page }) => {
        await expectCopied(page, 'prop-row-icon', 'icon')
        await expectCopied(page, 'prop-row-loading', ':loading=""')
    })
})

test.describe('directive tables (#1169)', () => {
    test('/directives/click-outside — `handler` shows its type and `required`', async ({ page }) => {
        await page.goto('/directives/click-outside')
        const row = page.locator('[data-cy="directive-arg-row-handler"]')

        await expect(row.locator('dt .prop-list__type-chip')).toHaveText('(e: MouseEvent) => void')
        await expect(row.locator('dt .prop-list__required-badge')).toBeVisible()
    })

    test('/directives/hover — a modifier keeps its `.` prefix AND its copy button', async ({ page }) => {
        await page.goto('/directives/hover')
        const row = page.locator('[data-cy="directive-modifier-row-callback"]')

        await expect(row.locator('dt .prop-list__name-mono')).toHaveText('.callback')
        await expectCopied(page, 'directive-modifier-row-callback', 'callback')
    })
})
