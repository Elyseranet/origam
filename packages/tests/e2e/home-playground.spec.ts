/**
 * T4 — HomePlayground e2e spec (SPEC-028) — v5-phase1 rebuild
 *
 * Targets: http://localhost:3000 (Nuxt dev or preview server)
 *
 * Run with the marketing Playwright config:
 *   pnpm -F @origam/tests playwright test \
 *     --config=playwright.marketing.config.ts \
 *     home-playground.spec.ts
 *
 * v5-phase1 rework: le REPL live-editor (supprimé) avait été remplacé par un split
 * statique OrigamCode (gauche, data-cy="playground-code") | preview card (droite,
 * data-cy="playground-preview"). Les boutons SHARE / OPEN et le
 * data-cy="playground-repl" ont été supprimés intentionnellement.
 */

import { expect, test } from '@playwright/test'

const BASE = process.env.MARKETING_BASE_URL ?? 'http://localhost:3000'

test.describe('HomePlayground section', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    })

    test('section is rendered by SSR — returns HTTP 200', async ({ page, request }) => {
        const response = await request.get(BASE)
        expect(response.status()).toBe(200)

        const section = page.locator('section#playground')
        await expect(section).toBeVisible()
    })

    test('h2 title is present', async ({ page }) => {
        const title = page.locator('section#playground h2')
        await expect(title).toContainText('A few lines, real components.')
    })

    test('code window shows the file name (App.vue) — no SHARE/OPEN buttons', async ({ page }) => {
        await expect(page.locator('[data-cy="playground-code"]')).toContainText('App.vue')

        await expect(page.locator('[data-cy="playground-btn-share"]')).toHaveCount(0)
        await expect(page.locator('[data-cy="playground-btn-open"]')).toHaveCount(0)
    })

    test('the 3 real OrigamBtn variants are rendered and listed in the code', async ({ page }) => {
        const code = page.locator('[data-cy="playground-code"]')
        for (const [key, label, variant] of [['primary', 'Primary', 'flat'], ['secondary', 'Secondary', 'outlined'], ['ghost', 'Ghost', 'flat']]) {
            const btn = page.locator(`[data-cy="playground-btn-${key}"]`)
            await expect(btn).toBeVisible()
            await expect(btn).toHaveClass(new RegExp(`origam-btn--variant-${variant}`))
            await expect(btn).toContainText(label)
            await expect(code).toContainText(label)
        }
        await expect(code).toContainText('variant="flat" bg-color="primary"')
        await expect(code).toContainText('border-color="var(--origam-color__action--primary---bg)"')
        await expect(code).toContainText('bg-color="var(--origam-color__surface---raised)"')
    })

    // #1517 — owner decision: Primary filled violet, Secondary violet outline + ink text,
    // Ghost light fill + border. Bare `ghost` / `outlined` + `color` paint none of that.
    test('the buttons paint the kit roles (filled / violet outline + ink text / filled + border)', async ({ page }) => {
        const paint = await page.evaluate(() => Object.fromEntries(['primary', 'secondary', 'ghost'].map((key) => {
            const s = getComputedStyle(document.querySelector(`[data-cy="playground-btn-${key}"]`) as Element)
            return [key, { bg: s.backgroundColor, color: s.color, borderColor: s.borderTopColor, borderWidth: s.borderTopWidth }]
        })))
        const transparent = 'rgba(0, 0, 0, 0)'

        expect(paint.primary.bg).not.toBe(transparent)
        expect(paint.secondary.borderColor).toBe(paint.primary.bg)
        expect(paint.secondary.color).not.toBe(paint.primary.bg)
        expect(paint.ghost.bg).not.toBe(transparent)
        expect(paint.ghost.borderWidth).not.toBe('0px')
    })

    // #1532 — the window is always dark: its tokens must use shiki's DARK colours, even on a light page.
    test('code tokens are painted with the dark shiki colours inside the dark window', async ({ page }) => {
        await expect(page.locator('[data-cy="playground-code"] .origam-code__code span[style*="--shiki-dark"]').first()).toBeAttached()
        const counts = await page.evaluate(() => {
            const spans = [...document.querySelectorAll<HTMLElement>('[data-cy="playground-code"] .origam-code__code span[style*="--shiki-dark"]')]
            const wrong = spans.filter((span) => {
                const probe = document.createElement('i')
                probe.style.color = span.style.getPropertyValue('--shiki-dark')
                document.body.appendChild(probe)
                const expected = getComputedStyle(probe).color
                probe.remove()
                return getComputedStyle(span).color !== expected
            })
            return { total: spans.length, wrong: wrong.length }
        })
        expect(counts.total).toBeGreaterThan(0)
        expect(counts.wrong).toBe(0)
    })

    test('OrigamCode pane is present (left split)', async ({ page }) => {
        const codePane = page.locator('[data-cy="playground-code"]')
        await expect(codePane).toBeVisible()
        // OrigamCode renders a <pre><code> block
        const pre = codePane.locator('pre code')
        await expect(pre).toBeAttached()
    })

    test('preview card pane is present (right split)', async ({ page }) => {
        const previewPane = page.locator('[data-cy="playground-preview"]')
        await expect(previewPane).toBeVisible()
    })

    test('no legacy REPL container (playground-repl) — replaced by static split', async ({ page }) => {
        await expect(page.locator('[data-cy="playground-repl"]')).toHaveCount(0)
    })

    test('section has no duplicate h1 — heading hierarchy is valid', async ({ page }) => {
        const h1Count = await page.locator('h1').count()
        expect(h1Count).toBeLessThanOrEqual(1)

        const playgroundH2 = page.locator('section#playground h2')
        await expect(playgroundH2).toHaveCount(1)
    })

    test('SSR does not inject hydration mismatch warning', async ({ page }) => {
        const errors: string[] = []
        page.on('console', msg => {
            if (msg.type() === 'error' || msg.text().includes('Hydration') || msg.text().includes('hydration')) {
                errors.push(msg.text())
            }
        })

        await page.goto(BASE, { waitUntil: 'networkidle' })

        const hydrationErrors = errors.filter(e =>
            e.toLowerCase().includes('hydration') ||
            e.toLowerCase().includes('mismatch')
        )
        expect(hydrationErrors).toHaveLength(0)
    })
})
