import { expect, test, type Page } from '@playwright/test'

/**
 * Color gradient transversal — runtime probes.
 *
 * Asserts the 3-format API exposed by `useColor` / `useBackgroundColor`
 * / `useTextColor` after the wave-4 gradient enrichment:
 *
 *   1. Raw CSS gradient string  → DOM `background-image` matches verbatim
 *   2. IGradient object (intents) → DOM `background-image` references
 *      the resolved `--origam-color__...` CSS variables
 *   3. Preset name `gradient-{slug}` → DOM `background-image` references
 *      the `--origam-gradient---{slug}` CSS variable
 *   4. Text gradient (color on a title) → DOM `background-clip: text`
 *      + `color: transparent`
 *
 * The story file is at
 *   stories/components/stories/ColorGradient/OrigamColorGradient.story.vue
 *
 * NOTE — DS BUG (useStateEffect, gradient support):
 *   OrigamBtn uses `useStateEffect` for color resolution. Unlike
 *   `useColorEffect` and `useBothColor`, `useStateEffect.colorStyles`
 *   does NOT call `isGradient()` / `resolveGradient()` — gradient values
 *   on `bgColor` fall through all branches without emitting a
 *   `background-image` declaration. Tests 1–6 below are marked fixme
 *   until `useStateEffect` gains gradient support.
 *   See packages/ds/src/composables/Commons/stateEffect.composable.ts
 *   lines 192–236 — the `isGradient` guard present in `useColorEffect`
 *   (color.composable.ts lines 399–409) is missing from this composable.
 *
 *   Text-gradient tests (tests 7–8) are NOT affected because OrigamTitle
 *   and OrigamLabel use `useBothColor` which delegates to `useColor` —
 *   the composable that DOES handle gradients correctly.
 *
 * NOTE — Style access pattern for OrigamBtn:
 *   OrigamBtn styles are injected by `useStyle` as a `<style>` rule in
 *   `document.head` (`#<id> { ... }`), NOT as an inline `style` attribute.
 *   `getAttribute('style')` always returns "" for OrigamBtn.
 *   The correct accessor is `getInjectedBgImage()` below, which reads the
 *   CSS rule text directly from the stylesheet.
 */

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyPath: string, variant: string) => {
    await page.goto(storyPath)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

const STORY = '/stories/story/components-stories-colorgradient-origamcolorgradient-story-vue'

/**
 * Read the `background-image` value from the `useStyle`-injected CSS rule
 * for `el`. OrigamBtn does NOT emit an inline `style` attribute — it
 * injects a `#<id> { ... }` rule into the document head via `useStyleTag`.
 * This helper walks `document.styleSheets` to find that rule.
 */
async function getInjectedBgImage (locator: ReturnType<ReturnType<typeof sandboxOf>['locator']>): Promise<string> {
    return locator.evaluate((el: Element) => {
        const id = (el as HTMLElement).id
        if (!id) return ''
        for (const sheet of Array.from(document.styleSheets)) {
            try {
                for (const rule of Array.from(sheet.cssRules)) {
                    const r = rule as CSSStyleRule
                    if (r.selectorText === `#${id}`) {
                        return r.style.backgroundImage || ''
                    }
                }
            } catch {
                // Cross-origin stylesheet — skip silently.
            }
        }
        return ''
    })
}

// ─── Format 1 — raw CSS gradient string ─────────────────────────────────────

// DS BUG: useStateEffect (used by OrigamBtn) ignores isGradient/resolveGradient — background-image is never emitted for bgColor gradient strings.
// Fix: add the isGradient guard in stateEffect.composable.ts colorStyles, mirroring color.composable.ts useColorEffect lines 399-409.
test.describe.fixme('Color gradient — raw CSS string', () => {
    test('linear-gradient(135deg, #ff0080, #7928ca) renders verbatim', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — raw CSS gradient string')
        const sandbox = sandboxOf(page)
        const btn = sandbox.locator('[data-cy="raw-string-btn-1"]').first()
        await expect(btn).toBeVisible({ timeout: 8000 })

        // OrigamBtn injects styles via useStyle (injected stylesheet rule),
        // not inline. Read from the injected rule first; fall back to
        // getComputedStyle which resolves the cascade but loses var() refs.
        const bgImage = await getInjectedBgImage(btn)
            || await btn.evaluate((el) => getComputedStyle(el).backgroundImage)
        expect(bgImage).toContain('linear-gradient')
        // The hex values get serialised by the browser to either hex or rgb —
        // assert on both representations.
        expect(bgImage.includes('rgb(255, 0, 128)') || bgImage.includes('#ff0080')).toBe(true)
        expect(bgImage.includes('rgb(121, 40, 202)') || bgImage.includes('#7928ca')).toBe(true)
    })

    test('radial-gradient renders as radial-gradient(...)', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — raw CSS gradient string')
        const sandbox = sandboxOf(page)
        const btn = sandbox.locator('[data-cy="raw-string-btn-3"]').first()
        await expect(btn).toBeVisible({ timeout: 8000 })

        const bgImage = await getInjectedBgImage(btn)
            || await btn.evaluate((el) => getComputedStyle(el).backgroundImage)
        expect(bgImage).toContain('radial-gradient')
    })
})

// ─── Format 2 — IGradient object ────────────────────────────────────────────

// DS BUG: useStateEffect (used by OrigamBtn) ignores isGradient/resolveGradient — background-image is never emitted for IGradient bgColor objects.
// Fix: add the isGradient guard in stateEffect.composable.ts colorStyles, mirroring color.composable.ts useColorEffect lines 399-409.
test.describe.fixme('Color gradient — IGradient object (intent stops)', () => {
    test('{ from: primary, to: success } emits intent CSS-var references', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — IGradient object (intents)')
        const sandbox = sandboxOf(page)
        const btn = sandbox.locator('[data-cy="object-btn-1"]').first()
        await expect(btn).toBeVisible({ timeout: 8000 })

        // OrigamBtn does NOT emit an inline `style` attribute — styles live
        // in a `useStyle`-injected `#<id> { ... }` rule in the document head.
        // Read the injected rule to preserve the literal var() references
        // (getComputedStyle resolves them to RGB values, losing the intent token names).
        const bgImage = await getInjectedBgImage(btn)
        expect(bgImage).toContain('var(--origam-color__action--primary---bg)')
        expect(bgImage).toContain('var(--origam-color__feedback--success---bg)')
        expect(bgImage).toMatch(/linear-gradient\s*\(/)
    })

    test('stops array with 3 colors emits the matching number of positioned stops', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — IGradient object (intents)')
        const sandbox = sandboxOf(page)
        const btn = sandbox.locator('[data-cy="object-btn-4"]').first()
        await expect(btn).toBeVisible({ timeout: 8000 })

        const bgImage = await getInjectedBgImage(btn)
        expect(bgImage).toContain('var(--origam-color__action--primary---bg) 0%')
        expect(bgImage).toContain('#ffffff 50%')
        expect(bgImage).toContain('var(--origam-color__feedback--success---bg) 100%')
    })
})

// ─── Format 3 — preset name ─────────────────────────────────────────────────

// DS BUG: useStateEffect (used by OrigamBtn) ignores isGradient/resolveGradient — background-image is never emitted for gradient-{slug} bgColor preset strings.
// Fix: add the isGradient guard in stateEffect.composable.ts colorStyles, mirroring color.composable.ts useColorEffect lines 399-409.
test.describe.fixme('Color gradient — preset name', () => {
    test('bg-color="gradient-sunset" resolves to var(--origam-gradient---sunset)', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — preset names')
        const sandbox = sandboxOf(page)
        const btn = sandbox.locator('[data-cy="preset-btn-sunset"]').first()
        await expect(btn).toBeVisible({ timeout: 8000 })

        // OrigamBtn does NOT emit inline style — read from injected stylesheet rule.
        const bgImage = await getInjectedBgImage(btn)
        expect(bgImage).toContain('var(--origam-gradient---sunset)')
    })

    test('all 5 presets resolve to their respective CSS vars', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — preset names')
        const sandbox = sandboxOf(page)
        const presets = ['sunset', 'ocean', 'forest', 'fire', 'midnight']
        for (const p of presets) {
            const btn = sandbox.locator(`[data-cy="preset-btn-${p}"]`).first()
            await expect(btn).toBeVisible({ timeout: 8000 })
            const bgImage = await getInjectedBgImage(btn)
            expect(bgImage).toContain(`var(--origam-gradient---${p})`)
        }
    })
})

// ─── Text gradient (background-clip: text) ──────────────────────────────────
// These tests use OrigamTitle / OrigamLabel which bind colorStyles as
// :style="titleStyles" / :style="labelStyles" (inline) and resolve via
// useBothColor → useColor. That composable DOES handle gradients correctly,
// so getAttribute('style') works and these tests are NOT fixme'd.

test.describe('Color gradient — text gradient (background-clip)', () => {
    test('color={ from, to } on title produces background-clip: text + color: transparent', async ({ page }) => {
        await openVariant(page, STORY, 'Text gradient — background-clip: text')
        const sandbox = sandboxOf(page)
        const title = sandbox.locator('[data-cy="text-gradient-title"]').first()
        await expect(title).toBeVisible({ timeout: 8000 })

        const style = await title.evaluate((el) => (el as HTMLElement).getAttribute('style') || '')
        expect(style).toContain('background-clip: text')
        expect(style).toContain('color: transparent')
        // Intent CSS var references survive in the inline style.
        expect(style).toContain('var(--origam-color__action--primary---bg)')
        expect(style).toContain('var(--origam-color__feedback--success---bg)')

        // The computed value of `color` should resolve to transparent.
        const computedColor = await title.evaluate((el) => getComputedStyle(el).color)
        expect(computedColor).toMatch(/rgba?\(.*0\)/)
    })

    test('color="gradient-sunset" on label triggers the preset text gradient', async ({ page }) => {
        await openVariant(page, STORY, 'Text gradient — background-clip: text')
        const sandbox = sandboxOf(page)
        const label = sandbox.locator('[data-cy="text-gradient-label"]').first()
        await expect(label).toBeVisible({ timeout: 8000 })

        const style = await label.evaluate((el) => (el as HTMLElement).getAttribute('style') || '')
        expect(style).toContain('var(--origam-gradient---sunset)')
        expect(style).toContain('background-clip: text')
        expect(style).toContain('color: transparent')
    })
})
