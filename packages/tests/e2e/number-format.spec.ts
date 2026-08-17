import { expect, test, type Page } from '@playwright/test'

import { fillHstNumber, selectHstOption } from './_support/histoire-controls'

/**
 * OrigamNumberFormat — runtime probes for the Intl-backed formatter,
 * the scoped default slot, the ARIA-label expansion in compact mode
 * and the prop matrix (format / locale / currency / unit / sign).
 *
 * REALIGNED (2026-08) — the story migrated to the canonical
 * Design/Functional/Slots structure. The pre-migration story rendered
 * several fixture instances SIDE BY SIDE per Variant (one per format /
 * locale / unit / sign value, each with its own `data-cy` host); the
 * migrated story collapsed all of that into a single instance on the
 * "Functional" Variant, driven entirely by HstSelect/HstNumber/
 * HstCheckbox controls. Tests below drive that single instance
 * SEQUENTIALLY instead of reading N parallel hosts.
 *
 * Variants are reached via their dedicated titles — never via the
 * HstSelect picker dropdown (custom DOM, brittle). Control-driving
 * goes exclusively through `histoire-controls.ts`.
 *
 * ⚠ Control-selection ordering trap (documented, not a helper bug):
 * `selectHstOption`'s field lookup matches by `hasText` (case-insensitive
 * substring) against the row's rendered text, which includes the row's
 * OWN currently-selected value. If Format is switched to `'currency'` or
 * `'unit'` BEFORE the Currency/Unit field is touched, the Format row's
 * text becomes "Format currency" / "Format unit", which itself matches
 * a `hasText: 'Currency'` / `hasText: 'Unit'` lookup and gets picked by
 * `.first()` instead of the intended field — the dropdown that opens
 * (and stays open) is the wrong one, and the option-text wait times out.
 * Fix applied throughout below: select Currency / Unit values BEFORE
 * switching Format to `'currency'` / `'unit'`.
 *
 * Note on whitespace: Intl.NumberFormat may emit U+00A0 (NBSP) or
 * U+202F (NNBSP) between the integer / currency segments depending on
 * the host engine. We normalise both to a regular ASCII space before
 * asserting on the exact glyph layout.
 */

const STORY = '/stories/story/components-stories-numberformat-origamnumberformat-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, title: string): Promise<void> => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(400)
}

/**
 * Normalise any whitespace (NBSP / NNBSP / regular) to a single ASCII
 * space — Intl glyph choices vary across engines.
 */
const normaliseWs = (text: string | null | undefined): string =>
    (text ?? '').replace(/\s+/g, ' ').trim()

const host = (sandbox: ReturnType<typeof sandboxOf>) =>
    sandbox.locator('.origam-number-format').first()

test.describe('OrigamNumberFormat — Default (smoke)', () => {
    test('mounts and renders the formatted number', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const el = host(sandbox)
        await expect(el).toBeVisible({ timeout: 8000 })
        const text = normaliseWs(await el.textContent())
        // Default Variant init-state: currency=EUR, locale=fr-FR, format=currency, value=1234567.89
        expect(text).toContain('€')
        expect(text).toContain('1')
        expect(text).toContain('234')
        expect(text).toContain('567')
    })

    test('root carries the format modifier class', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        await expect(host(sandbox)).toHaveClass(/origam-number-format--currency/)
    })
})

test.describe('OrigamNumberFormat — Prop format (sequential)', () => {
    test('decimal renders locale-default grouping', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        // Functional init-state format is already 'decimal'.
        await selectHstOption(page, 'Locale', 'en-US')
        await page.waitForTimeout(300)
        const text = normaliseWs(await host(sandbox).textContent())
        expect(text).toBe('1,234,567.89')
    })

    test('currency renders the $ glyph in en-US', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Locale', 'en-US')
        await selectHstOption(page, 'Currency', 'USD')
        await selectHstOption(page, 'Format', 'currency')
        await page.waitForTimeout(300)
        const text = normaliseWs(await host(sandbox).textContent())
        expect(text).toMatch(/^\$/)
        expect(text).toContain('1,234,567')
    })

    test('compact (format) collapses 1234567.89 to a short K/M suffix', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Locale', 'en-US')
        await selectHstOption(page, 'Format', 'compact')
        await page.waitForTimeout(300)
        const text = normaliseWs(await host(sandbox).textContent())
        expect(text).toMatch(/[KMB]$/)
    })

    test('scientific surfaces an exponent (E5 / E+5)', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Format', 'scientific')
        await page.waitForTimeout(300)
        const text = normaliseWs(await host(sandbox).textContent())
        expect(text).toMatch(/E/i)
    })

    test('different formats produce different rendered strings', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const el = host(sandbox)

        await selectHstOption(page, 'Format', 'decimal')
        await page.waitForTimeout(200)
        const dec = normaliseWs(await el.textContent())

        await selectHstOption(page, 'Format', 'currency')
        await page.waitForTimeout(200)
        const cur = normaliseWs(await el.textContent())

        await selectHstOption(page, 'Format', 'percent')
        await page.waitForTimeout(200)
        const pct = normaliseWs(await el.textContent())

        await selectHstOption(page, 'Format', 'compact')
        await page.waitForTimeout(200)
        const cmp = normaliseWs(await el.textContent())

        // None of these should be equal — if any are, our format prop is silently ignored.
        const set = new Set([dec, cur, pct, cmp])
        expect(set.size).toBe(4)
    })
})

test.describe('OrigamNumberFormat — Prop locale (sequential)', () => {
    test('fr-FR places the euro symbol after the number', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Format', 'currency')
        // Functional init-state locale is already 'fr-FR' and currency 'EUR'.
        await page.waitForTimeout(300)
        const text = normaliseWs(await host(sandbox).textContent())
        expect(text).toMatch(/€$/)
    })

    test('en-US places the euro symbol before the number', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Format', 'currency')
        await selectHstOption(page, 'Locale', 'en-US')
        await page.waitForTimeout(300)
        const text = normaliseWs(await host(sandbox).textContent())
        expect(text).toMatch(/^€/)
    })

    test('locales render distinct strings for the same input', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const el = host(sandbox)
        await selectHstOption(page, 'Format', 'currency')

        await page.waitForTimeout(200)
        const fr = normaliseWs(await el.textContent())

        await selectHstOption(page, 'Locale', 'en-US')
        await page.waitForTimeout(200)
        const en = normaliseWs(await el.textContent())

        await selectHstOption(page, 'Locale', 'de-DE')
        await page.waitForTimeout(200)
        const de = normaliseWs(await el.textContent())

        // The three locales must produce distinct outputs.
        expect(new Set([fr, en, de]).size).toBe(3)
    })
})

test.describe('OrigamNumberFormat — Prop unit (sequential)', () => {
    test('kilometer-per-hour renders the km/h glyph', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        await fillHstNumber(page, 'Value', 42)
        // Functional init-state unit is already 'kilometer-per-hour'.
        await selectHstOption(page, 'Format', 'unit')
        await page.waitForTimeout(300)
        const text = normaliseWs(await host(sandbox).textContent())
        expect(text).toContain('42')
        expect(text.toLowerCase()).toContain('km')
    })

    test('celsius renders the degree symbol', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Unit', 'celsius')
        await selectHstOption(page, 'Format', 'unit')
        await page.waitForTimeout(300)
        const text = normaliseWs(await host(sandbox).textContent())
        expect(text).toContain('°')
    })
})

test.describe('OrigamNumberFormat — Prop notation compact', () => {
    test('1234 → 1.2K', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Locale', 'en-US')
        await selectHstOption(page, 'Notation', 'compact')
        await fillHstNumber(page, 'Value', 1234)
        await page.waitForTimeout(300)
        const text = normaliseWs(await host(sandbox).textContent())
        expect(text).toMatch(/K$/)
    })

    test('1234567 → 1.2M', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Locale', 'en-US')
        await selectHstOption(page, 'Notation', 'compact')
        await fillHstNumber(page, 'Value', 1234567)
        await page.waitForTimeout(300)
        const text = normaliseWs(await host(sandbox).textContent())
        expect(text).toMatch(/M$/)
    })

    test('1234567890 → 1.2B', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Locale', 'en-US')
        await selectHstOption(page, 'Notation', 'compact')
        await fillHstNumber(page, 'Value', 1234567890)
        await page.waitForTimeout(300)
        const text = normaliseWs(await host(sandbox).textContent())
        expect(text).toMatch(/B$/)
    })

    test('compact mode emits an aria-label with the long form', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Locale', 'en-US')
        await selectHstOption(page, 'Notation', 'compact')
        await fillHstNumber(page, 'Value', 1234567)
        await page.waitForTimeout(300)
        const aria = await host(sandbox).getAttribute('aria-label')
        expect(aria).not.toBeNull()
        // Long-form expansion should include "million" in en-US.
        expect(aria!.toLowerCase()).toContain('million')
    })
})

test.describe('OrigamNumberFormat — Prop signDisplay', () => {
    test('auto renders the minus sign on negatives only', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const el = host(sandbox)
        // Functional init-state signDisplay is already 'auto'.
        await page.waitForTimeout(200)
        const pos = normaliseWs(await el.textContent())
        expect(pos).not.toMatch(/^\+/)

        await fillHstNumber(page, 'Value', -1234567.89)
        await page.waitForTimeout(300)
        const neg = normaliseWs(await el.textContent())
        expect(neg).toMatch(/^-/)
    })

    test('always prefixes both signs', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const el = host(sandbox)
        await selectHstOption(page, 'Sign Display', 'always')
        await page.waitForTimeout(300)
        const pos = normaliseWs(await el.textContent())
        expect(pos).toMatch(/^\+/)

        await fillHstNumber(page, 'Value', -1234567.89)
        await page.waitForTimeout(300)
        const neg = normaliseWs(await el.textContent())
        expect(neg).toMatch(/^-/)
    })

    /**
     * DS BUG — signDisplay="except-zero" is not a valid Intl value.
     *
     * `TNumberFormatSignDisplay` (packages/ds/src/types/NumberFormat/
     * number-format.type.ts, via NUMBER_FORMAT_SIGN_DISPLAY) exposes the
     * kebab-case `'except-zero'`, but ECMAScript `Intl.NumberFormat`
     * expects the camelCase `'exceptZero'`. The composable casts the value
     * straight through (number-format.composable.ts:161, with a comment
     * acknowledging the casing divergence), so construction throws.
     *
     * ⛔ WHY THIS TEST IS WRITTEN THE WAY IT IS (2026-08-17).
     * The previous version selected `except-zero` from the DEFAULT state
     * (`auto`) and asserted `expect(zero).not.toMatch(/^[+-]/)`. That
     * assertion PASSES WHETHER OR NOT THE BUG EXISTS: when the RangeError
     * is thrown the component keeps the previous (`auto`) formatter, which
     * renders "0" — no sign — so the test could never detect the bug. It
     * was a `test.fixme` guarding an assertion that was silently vacuous.
     *
     * Measured on develop @ e66dac68 (chromium, static Histoire):
     *   Sign Display = always,       Value = 5  ->  "+5"
     *   Sign Display = except-zero,  Value = 5  ->  "+5"
     *   Sign Display = except-zero,  Value = 0  ->  "+0"   <-- WRONG
     *   pageerror: "RangeError: Value except-zero out of range for
     *               Intl.NumberFormat options property signDisplay"
     *
     * So the test now switches to `always` FIRST. That pins the stale
     * formatter to one that DOES sign zero, making the two outcomes
     * distinguishable: correct behaviour renders "0", the live bug renders
     * "+0". Marked `test.fail` — green while the bug is there, RED the day
     * the type is fixed to 'exceptZero' (or the composable maps it).
     */
    test.fail('except-zero hides the sign on 0', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)

        // Pin the stale-formatter fallback to one that signs zero, so a
        // silently-rejected `except-zero` is observable.
        await selectHstOption(page, 'Sign Display', 'always')
        await fillHstNumber(page, 'Value', 0)
        await page.waitForTimeout(300)
        expect(normaliseWs(await host(sandbox).textContent())).toMatch(/^\+/)

        await selectHstOption(page, 'Sign Display', 'except-zero')
        await page.waitForTimeout(300)
        const zero = normaliseWs(await host(sandbox).textContent())
        expect(zero).not.toMatch(/^[+-]/)
    })
})

test.describe('OrigamNumberFormat — Slot default scoped', () => {
    test('default slot receives `parts` and highlights the currency segment', async ({ page }) => {
        await openVariant(page, 'Slots - Default')
        const sandbox = sandboxOf(page)

        const el = host(sandbox)
        await expect(el).toBeVisible({ timeout: 8000 })

        // The currency <span> is emitted by the scoped slot as
        // `.number-format-slot-part-currency` (no data-cy in the
        // migrated story).
        const currencySpan = el.locator('.number-format-slot-part-currency').first()
        await expect(currencySpan).toBeVisible()
        const currencyText = normaliseWs(await currencySpan.textContent())
        expect(currencyText).toContain('€')

        // …and it must render in the configured highlight color (orange).
        const color = await currencySpan.evaluate(node => getComputedStyle(node).color)
        // `getComputedStyle` returns rgb(255, 165, 0) for `orange`.
        expect(color.replace(/\s+/g, '')).toMatch(/rgb\(255,165,0\)/)

        // The host text contains both integer and currency segments.
        const hostText = normaliseWs(await el.textContent())
        expect(hostText).toContain('1')
        expect(hostText).toContain('234')
        expect(hostText).toContain('€')
    })
})
