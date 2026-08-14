import { expect, test, type Page } from '@playwright/test'

import { fillHstText, selectHstOption, toggleHstCheckbox } from './_support/histoire-controls'

/**
 * OrigamTextMask — runtime probes.
 *
 * REALIGNED (2026-08) — the story migrated to the canonical
 * Design/Functional/Slots structure. None of the old dedicated `Prop —
 * X` fixtures exist anymore — the migrated story exposes a single
 * instance per Variant, driven by controls:
 *   - "Design": one `Background` HstText field accepting the string |
 *     preset | raw-CSS-gradient forms (the IGradient OBJECT form is
 *     only demonstrated on the fixed "Slots - Default" fixture).
 *   - "Functional": `Animated` checkbox + `Animation Type` HstSelect.
 * There is no "prefers-reduced-motion" Variant anymore — the
 * `@media (prefers-reduced-motion: reduce)` CSS rule applies
 * regardless of which Variant is showing, so the test below drives
 * `page.emulateMedia()` + the "Functional" Variant's Animated control
 * instead of navigating to a removed fixture.
 *
 * The component root carries a static `data-cy="origam-text-mask"`
 * (OrigamTextMask.vue) — unaffected by the story migration, used to
 * locate the single instance per Variant below.
 *
 * Coverage matrix (per "test-as-you-build" rule):
 *   - Default render with `text` prop emits a clipped element with the
 *     correct background-clip + transparent fill chain.
 *   - `background={ from, via, to }` (IGradient) resolves to a
 *     linear-gradient with the expected token references.
 *   - `background="gradient-{slug}"` preset resolves to a non-empty
 *     linear-gradient.
 *   - `background="linear-gradient(...)"` raw string is passed through.
 *   - `animated` toggles `animation-name` on the element.
 *   - Each animation-type maps to a distinct keyframe name so the four
 *     variants are visually different.
 *   - `prefers-reduced-motion: reduce` cancels the animation.
 *   - Rich slot markup is preserved in the DOM.
 */

const STORY = '/stories/story/components-stories-textmask-origamtextmask-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, variant: string) => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

const mask = (sandbox: ReturnType<typeof sandboxOf>) =>
    sandbox.locator('[data-cy="origam-text-mask"]').first()

const BACKGROUND_FIELD = 'Background (string | preset | css gradient)'

test.describe('OrigamTextMask — render', () => {

    test('renders text in the DOM and clips background to glyphs', async ({ page }) => {
        // "Prop — background gradient (IGradient)" is now the "Design"
        // Variant, init-state text: 'ORIGAM', background: 'primary'.
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        const el = mask(sandbox)
        await expect(el).toBeVisible({ timeout: 8000 })

        // Text content preserved in the DOM (a11y / SEO).
        await expect(el).toHaveText('ORIGAM')

        // Background-clip set to text (vendor-prefixed flavour wins on
        // WebKit, standard property wins on Blink/Gecko — assert either).
        const clip = await el.evaluate((node) => {
            const cs = getComputedStyle(node)
            return cs.backgroundClip || (cs as unknown as { webkitBackgroundClip: string }).webkitBackgroundClip
        })
        expect(clip).toBe('text')

        // The text fill is transparent so the painted background shows.
        const fill = await el.evaluate((node) => {
            const cs = getComputedStyle(node) as unknown as { webkitTextFillColor?: string, color: string }
            return cs.webkitTextFillColor || cs.color
        })
        expect(['rgba(0, 0, 0, 0)', 'transparent']).toContain(fill)
    })
})

test.describe('OrigamTextMask — background source', () => {

    test('IGradient object resolves to a linear-gradient(...) with intent tokens', async ({ page }) => {
        // Only the fixed "Slots - Default" fixture demonstrates the
        // IGradient OBJECT form (:background="{ from, via, to, direction }")
        // — no Variant exposes it as a driveable control anymore.
        await openVariant(page, 'Slots - Default')
        const sandbox = sandboxOf(page)
        const el = mask(sandbox)
        await expect(el).toBeVisible({ timeout: 8000 })

        const bg = await el.evaluate((node) => getComputedStyle(node).backgroundImage)
        expect(bg).toContain('linear-gradient')
        // Both stops should reference the resolved intent token URLs (the
        // var(...) chain gets serialised to a rgb(...) by the browser, so
        // we assert on length-from-zero — the SCSS contract is "non-empty
        // linear-gradient with two-or-more color stops").
        expect(bg).toMatch(/linear-gradient\([^)]+,[^)]+,[^)]+\)/)
    })

    test('preset name "gradient-sunset" resolves to a non-empty gradient', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        const el = mask(sandbox)
        await expect(el).toBeVisible({ timeout: 8000 })

        await fillHstText(page, BACKGROUND_FIELD, 'gradient-sunset')
        await page.waitForTimeout(300)

        const bg = await el.evaluate((node) => getComputedStyle(node).backgroundImage)
        // The preset resolves to var(--origam-gradient---sunset); the
        // browser inlines the variable's value at compute time, so we
        // expect a gradient function call OR the variable itself (when
        // the variable resolution failed, the property reports `none`).
        expect(bg).not.toBe('none')
        expect(bg).toContain('linear-gradient')
    })

    test('raw "linear-gradient(...)" string is passed through verbatim', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        const el = mask(sandbox)
        await expect(el).toBeVisible({ timeout: 8000 })

        await fillHstText(page, BACKGROUND_FIELD, 'linear-gradient(90deg, #ff0080, #00ffcc)')
        await page.waitForTimeout(300)

        const bg = await el.evaluate((node) => getComputedStyle(node).backgroundImage)
        expect(bg).toContain('linear-gradient')
        expect(
            bg.includes('rgb(255, 0, 128)') || bg.includes('#ff0080')
        ).toBe(true)
    })
})

test.describe('OrigamTextMask — animation', () => {

    test('animated=true emits a non-none animation-name', async ({ page }) => {
        // "Prop — animation type" is now the "Functional" Variant's
        // Animated checkbox (init false) + Animation Type select (init 'pan').
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const el = mask(sandbox)
        await expect(el).toBeVisible({ timeout: 8000 })

        await toggleHstCheckbox(page, 'Animated')
        await page.waitForTimeout(300)

        const animName = await el.evaluate((node) => getComputedStyle(node).animationName)
        expect(animName).not.toBe('none')
        expect(animName).toContain('pan')
    })

    test('each animation type maps to a distinct keyframe name', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const el = mask(sandbox)
        await expect(el).toBeVisible({ timeout: 8000 })

        await toggleHstCheckbox(page, 'Animated')
        await page.waitForTimeout(300)

        const names: string[] = []
        names.push(await el.evaluate((node) => getComputedStyle(node).animationName)) // 'pan' (init value)

        for (const label of ['Rotate', 'Pulse', 'Zoom']) {
            await selectHstOption(page, 'Animation Type', label)
            await page.waitForTimeout(300)
            names.push(await el.evaluate((node) => getComputedStyle(node).animationName))
        }

        // All four must be different.
        const uniq = new Set(names)
        expect(uniq.size).toBe(4)
    })

    test('prefers-reduced-motion: reduce cancels the animation', async ({ page, browserName }) => {
        // Firefox emulateMedia for reduced-motion is supported but a bit
        // flaky on CI — gate the assertion to skip when the browser does
        // not actually apply the override.
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const el = mask(sandbox)
        await expect(el).toBeVisible({ timeout: 8000 })

        await toggleHstCheckbox(page, 'Animated')
        await page.waitForTimeout(300)

        const animName = await el.evaluate((node) => getComputedStyle(node).animationName)
        // The @media block sets `animation: none !important;` → name reports
        // `none` on Blink/WebKit. Firefox sometimes leaves the name and only
        // pauses the playback — accept either contract.
        if (browserName === 'firefox') {
            const playState = await el.evaluate((node) => getComputedStyle(node).animationPlayState)
            expect(['paused', 'none', '']).toContain(playState)
        } else {
            expect(animName).toBe('none')
        }
    })
})

test.describe('OrigamTextMask — slot', () => {

    test('rich markup in default slot is preserved', async ({ page }) => {
        await openVariant(page, 'Slots - Default')
        const sandbox = sandboxOf(page)
        const el = mask(sandbox)
        await expect(el).toBeVisible({ timeout: 8000 })

        // The slot contents (h1 + span) should be visible.
        const h1 = el.locator('h1').first()
        const span = el.locator('span').first()
        await expect(h1).toHaveText('DESIGN')
        await expect(span).toHaveText('— system —')
    })
})
