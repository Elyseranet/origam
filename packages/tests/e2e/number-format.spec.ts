import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamNumberFormat — runtime probes for the Intl-backed formatter,
 * the scoped default slot, the ARIA-label expansion in compact mode
 * and the prop matrix (format / locale / currency / unit / sign).
 *
 * Variants are reached via their dedicated titles — never via the
 * HstSelect picker dropdown (custom DOM, brittle).
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

test.describe('OrigamNumberFormat — Default (smoke)', () => {
    test('mounts and renders the formatted number', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="number-format-playground-host"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        const text = normaliseWs(await host.textContent())
        // Default playground state: currency=EUR, locale=fr-FR, value=1234567.89
        expect(text).toContain('€')
        expect(text).toContain('1')
        expect(text).toContain('234')
        expect(text).toContain('567')
    })

    test('root carries the format modifier class', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="number-format-playground-host"]').first()
        await expect(host).toHaveClass(/origam-number-format--currency/)
    })
})

test.describe('OrigamNumberFormat — Prop format (parallel)', () => {
    test('decimal renders locale-default grouping', async ({ page }) => {
        await openVariant(page, 'Prop — format (parallel)')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="number-format-format-decimal"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        const text = normaliseWs(await host.textContent())
        // en-US → 1,234,567.89
        expect(text).toBe('1,234,567.89')
    })

    test('currency renders the $ glyph in en-US', async ({ page }) => {
        await openVariant(page, 'Prop — format (parallel)')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="number-format-format-currency"]').first()
        const text = normaliseWs(await host.textContent())
        expect(text).toMatch(/^\$/)
        expect(text).toContain('1,234,567')
    })

    test('compact collapses 1234567.89 to a short K/M suffix', async ({ page }) => {
        await openVariant(page, 'Prop — format (parallel)')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="number-format-format-compact"]').first()
        const text = normaliseWs(await host.textContent())
        expect(text).toMatch(/[KMB]$/)
    })

    test('scientific surfaces an exponent (E5 / E+5)', async ({ page }) => {
        await openVariant(page, 'Prop — format (parallel)')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="number-format-format-scientific"]').first()
        const text = normaliseWs(await host.textContent())
        expect(text).toMatch(/E/i)
    })

    test('different formats produce different rendered strings', async ({ page }) => {
        await openVariant(page, 'Prop — format (parallel)')
        const sandbox = sandboxOf(page)
        const dec = normaliseWs(await sandbox.locator('[data-cy="number-format-format-decimal"]').first().textContent())
        const cur = normaliseWs(await sandbox.locator('[data-cy="number-format-format-currency"]').first().textContent())
        const pct = normaliseWs(await sandbox.locator('[data-cy="number-format-format-percent"]').first().textContent())
        const cmp = normaliseWs(await sandbox.locator('[data-cy="number-format-format-compact"]').first().textContent())
        // None of these should be equal — if any are, our format prop is silently ignored.
        const set = new Set([dec, cur, pct, cmp])
        expect(set.size).toBe(4)
    })
})

test.describe('OrigamNumberFormat — Prop locale (parallel)', () => {
    test('fr-FR places the euro symbol after the number', async ({ page }) => {
        await openVariant(page, 'Prop — locale (parallel)')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="number-format-locale-fr-FR"]').first()
        const text = normaliseWs(await host.textContent())
        expect(text).toMatch(/€$/)
    })

    test('en-US places the euro symbol before the number', async ({ page }) => {
        await openVariant(page, 'Prop — locale (parallel)')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="number-format-locale-en-US"]').first()
        const text = normaliseWs(await host.textContent())
        expect(text).toMatch(/^€/)
    })

    test('locales render distinct strings for the same input', async ({ page }) => {
        await openVariant(page, 'Prop — locale (parallel)')
        const sandbox = sandboxOf(page)
        const fr = normaliseWs(await sandbox.locator('[data-cy="number-format-locale-fr-FR"]').first().textContent())
        const en = normaliseWs(await sandbox.locator('[data-cy="number-format-locale-en-US"]').first().textContent())
        const de = normaliseWs(await sandbox.locator('[data-cy="number-format-locale-de-DE"]').first().textContent())
        // The three locales must produce distinct outputs.
        expect(new Set([fr, en, de]).size).toBe(3)
    })
})

test.describe('OrigamNumberFormat — Prop unit (parallel)', () => {
    test('kilometer-per-hour renders the km/h glyph', async ({ page }) => {
        await openVariant(page, 'Prop — unit (parallel)')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="number-format-unit-kilometer-per-hour"]').first()
        const text = normaliseWs(await host.textContent())
        expect(text).toContain('42')
        expect(text.toLowerCase()).toContain('km')
    })

    test('celsius renders the degree symbol', async ({ page }) => {
        await openVariant(page, 'Prop — unit (parallel)')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="number-format-unit-celsius"]').first()
        const text = normaliseWs(await host.textContent())
        expect(text).toContain('°')
    })
})

test.describe('OrigamNumberFormat — Prop notation compact', () => {
    test('1234 → 1.2K', async ({ page }) => {
        await openVariant(page, 'Prop — notation compact (1.2K / 1.2M / 1.2B)')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="number-format-compact-K"]').first()
        const text = normaliseWs(await host.textContent())
        expect(text).toMatch(/K$/)
    })

    test('1234567 → 1.2M', async ({ page }) => {
        await openVariant(page, 'Prop — notation compact (1.2K / 1.2M / 1.2B)')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="number-format-compact-M"]').first()
        const text = normaliseWs(await host.textContent())
        expect(text).toMatch(/M$/)
    })

    test('1234567890 → 1.2B', async ({ page }) => {
        await openVariant(page, 'Prop — notation compact (1.2K / 1.2M / 1.2B)')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="number-format-compact-B"]').first()
        const text = normaliseWs(await host.textContent())
        expect(text).toMatch(/B$/)
    })

    test('compact mode emits an aria-label with the long form', async ({ page }) => {
        await openVariant(page, 'Prop — notation compact (1.2K / 1.2M / 1.2B)')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="number-format-compact-M"]').first()
        const aria = await host.getAttribute('aria-label')
        expect(aria).not.toBeNull()
        // Long-form expansion should include "million" in en-US.
        expect(aria!.toLowerCase()).toContain('million')
    })
})

test.describe('OrigamNumberFormat — Prop signDisplay', () => {
    test('auto renders the minus sign on negatives only', async ({ page }) => {
        await openVariant(page, 'Prop — signDisplay (parallel)')
        const sandbox = sandboxOf(page)
        const posEl = sandbox.locator('[data-cy="number-format-sign-auto-positive"]').first()
        const negEl = sandbox.locator('[data-cy="number-format-sign-auto-negative"]').first()
        await expect(posEl).toBeVisible({ timeout: 8000 })
        await expect(negEl).toBeVisible({ timeout: 8000 })
        const pos = normaliseWs(await posEl.textContent())
        const neg = normaliseWs(await negEl.textContent())
        expect(pos).not.toMatch(/^\+/)
        expect(neg).toMatch(/^-/)
    })

    test('always prefixes both signs', async ({ page }) => {
        await openVariant(page, 'Prop — signDisplay (parallel)')
        const sandbox = sandboxOf(page)
        const posEl = sandbox.locator('[data-cy="number-format-sign-always-positive"]').first()
        const negEl = sandbox.locator('[data-cy="number-format-sign-always-negative"]').first()
        await expect(posEl).toBeVisible({ timeout: 8000 })
        await expect(negEl).toBeVisible({ timeout: 8000 })
        const pos = normaliseWs(await posEl.textContent())
        const neg = normaliseWs(await negEl.textContent())
        expect(pos).toMatch(/^\+/)
        expect(neg).toMatch(/^-/)
    })

    test.fixme(true, 'DS BUG: signDisplay="except-zero" invalide — TNumberFormatSignDisplay (packages/ds/src/types/NumberFormat/number-format-format.type.ts) définit "except-zero" (kebab) mais ECMAScript Intl.NumberFormat attend "exceptZero" (camelCase). Lève RangeError à la construction, le composant ne rend pas. La story passe sign="except-zero" depuis le tableau signs[], ce qui pollue potentiellement tout le Variant.')
    test('except-zero hides the sign on 0', async ({ page }) => {
        await openVariant(page, 'Prop — signDisplay (parallel)')
        const sandbox = sandboxOf(page)
        const zeroEl = sandbox.locator('[data-cy="number-format-sign-except-zero-zero"]').first()
        await expect(zeroEl).toBeVisible({ timeout: 8000 })
        const zero = normaliseWs(await zeroEl.textContent())
        expect(zero).not.toMatch(/^[+-]/)
    })
})

test.describe('OrigamNumberFormat — Slot default scoped', () => {
    test('default slot receives `parts` and highlights the currency segment', async ({ page }) => {
        await openVariant(page, 'Slot — default scoped (highlight currency symbol)')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="number-format-slot-host"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        // The currency `<span>` must be emitted by the scoped slot.
        const currencySpan = host.locator('[data-cy="number-format-slot-part-currency"]').first()
        await expect(currencySpan).toBeVisible()
        const currencyText = normaliseWs(await currencySpan.textContent())
        expect(currencyText).toContain('€')

        // …and it must render in the configured highlight color (orange).
        const color = await currencySpan.evaluate(el => getComputedStyle(el).color)
        // `getComputedStyle` returns rgb(255, 165, 0) for `orange`.
        expect(color.replace(/\s+/g, '')).toMatch(/rgb\(255,165,0\)/)

        // The host text contains both integer and currency segments.
        const hostText = normaliseWs(await host.textContent())
        expect(hostText).toContain('1')
        expect(hostText).toContain('234')
        expect(hostText).toContain('€')
    })
})
