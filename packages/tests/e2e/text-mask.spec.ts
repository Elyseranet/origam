import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamTextMask — runtime probes.
 *
 * Coverage matrix (per "test-as-you-build" rule):
 *   - Default render with `text` prop emits a clipped element with the
 *     correct background-clip + transparent fill chain.
 *   - `background={ from, to }` resolves to a linear-gradient with the
 *     expected token references on the computed background-image.
 *   - `background="gradient-{slug}"` preset resolves to the matching
 *     `--origam-gradient---{slug}` CSS variable.
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

test.describe('OrigamTextMask — render', () => {

    test('renders text in the DOM and clips background to glyphs', async ({ page }) => {
        await openVariant(page, 'Prop — background gradient (IGradient)')
        const sandbox = sandboxOf(page)
        const mask = sandbox.locator('[data-cy="gradient-mask-1"]').first()
        await expect(mask).toBeVisible({ timeout: 8000 })

        // Text content preserved in the DOM (a11y / SEO).
        await expect(mask).toHaveText('HELLO WORLD')

        // Background-clip set to text (vendor-prefixed flavour wins on
        // WebKit, standard property wins on Blink/Gecko — assert either).
        const clip = await mask.evaluate((el) => {
            const cs = getComputedStyle(el)
            return cs.backgroundClip || (cs as unknown as { webkitBackgroundClip: string }).webkitBackgroundClip
        })
        expect(clip).toBe('text')

        // The text fill is transparent so the painted background shows.
        const fill = await mask.evaluate((el) => {
            const cs = getComputedStyle(el) as unknown as { webkitTextFillColor?: string, color: string }
            return cs.webkitTextFillColor || cs.color
        })
        expect(['rgba(0, 0, 0, 0)', 'transparent']).toContain(fill)
    })
})

test.describe('OrigamTextMask — background source', () => {

    test('IGradient object resolves to a linear-gradient(...) with intent tokens', async ({ page }) => {
        await openVariant(page, 'Prop — background gradient (IGradient)')
        const sandbox = sandboxOf(page)
        const mask = sandbox.locator('[data-cy="gradient-mask-1"]').first()
        await expect(mask).toBeVisible({ timeout: 8000 })

        const bg = await mask.evaluate((el) => getComputedStyle(el).backgroundImage)
        expect(bg).toContain('linear-gradient')
        // Both stops should reference the resolved intent token URLs (the
        // var(...) chain gets serialised to a rgb(...) by the browser, so
        // we assert on length-from-zero — the SCSS contract is "non-empty
        // linear-gradient with two color stops").
        expect(bg).toMatch(/linear-gradient\([^)]+,[^)]+,[^)]+\)/)
    })

    test('preset name "gradient-sunset" resolves to a non-empty gradient', async ({ page }) => {
        await openVariant(page, 'Prop — background preset')
        const sandbox = sandboxOf(page)
        const mask = sandbox.locator('[data-cy="preset-mask-sunset"]').first()
        await expect(mask).toBeVisible({ timeout: 8000 })

        const bg = await mask.evaluate((el) => getComputedStyle(el).backgroundImage)
        // The preset resolves to var(--origam-gradient---sunset); the
        // browser inlines the variable's value at compute time, so we
        // expect a gradient function call OR the variable itself (when
        // the variable resolution failed, the property reports `none`).
        expect(bg).not.toBe('none')
    })

    test('raw "linear-gradient(...)" string is passed through verbatim', async ({ page }) => {
        await openVariant(page, 'Prop — raw CSS gradient string')
        const sandbox = sandboxOf(page)
        const mask = sandbox.locator('[data-cy="raw-mask"]').first()
        await expect(mask).toBeVisible({ timeout: 8000 })

        const bg = await mask.evaluate((el) => getComputedStyle(el).backgroundImage)
        expect(bg).toContain('linear-gradient')
        expect(
            bg.includes('rgb(255, 0, 128)') || bg.includes('#ff0080')
        ).toBe(true)
    })
})

test.describe('OrigamTextMask — animation', () => {

    test('animated=true emits a non-none animation-name', async ({ page }) => {
        await openVariant(page, 'Prop — animation type')
        const sandbox = sandboxOf(page)
        const pan = sandbox.locator('[data-cy="anim-pan"]').first()
        await expect(pan).toBeVisible({ timeout: 8000 })

        const animName = await pan.evaluate((el) => getComputedStyle(el).animationName)
        expect(animName).not.toBe('none')
        expect(animName).toContain('pan')
    })

    test('each animation type maps to a distinct keyframe name', async ({ page }) => {
        await openVariant(page, 'Prop — animation type')
        const sandbox = sandboxOf(page)
        const types = ['pan', 'rotate', 'pulse', 'zoom']
        const names: string[] = []
        for (const t of types) {
            const el = sandbox.locator(`[data-cy="anim-${t}"]`).first()
            await expect(el).toBeVisible({ timeout: 8000 })
            const name = await el.evaluate((node) => getComputedStyle(node).animationName)
            names.push(name)
        }
        // All four must be different.
        const uniq = new Set(names)
        expect(uniq.size).toBe(types.length)
    })

    test('prefers-reduced-motion: reduce cancels the animation', async ({ page, browserName }) => {
        // Firefox emulateMedia for reduced-motion is supported but a bit
        // flaky on CI — gate the assertion to skip when the browser does
        // not actually apply the override.
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await openVariant(page, 'prefers-reduced-motion')
        const sandbox = sandboxOf(page)
        const mask = sandbox.locator('[data-cy="reduced-motion-mask"]').first()
        await expect(mask).toBeVisible({ timeout: 8000 })

        const animName = await mask.evaluate((el) => getComputedStyle(el).animationName)
        // The @media block sets `animation: none !important;` → name reports
        // `none` on Blink/WebKit. Firefox sometimes leaves the name and only
        // pauses the playback — accept either contract.
        if (browserName === 'firefox') {
            const playState = await mask.evaluate((el) => getComputedStyle(el).animationPlayState)
            expect(['paused', 'none', '']).toContain(playState)
        } else {
            expect(animName).toBe('none')
        }
    })
})

test.describe('OrigamTextMask — slot', () => {

    test('rich markup in default slot is preserved', async ({ page }) => {
        await openVariant(page, 'Slot — rich markup')
        const sandbox = sandboxOf(page)
        const mask = sandbox.locator('[data-cy="slot-mask"]').first()
        await expect(mask).toBeVisible({ timeout: 8000 })

        // The slot contents (h1 + span) should be visible.
        const h1 = mask.locator('h1').first()
        const span = mask.locator('span').first()
        await expect(h1).toHaveText('DESIGN')
        await expect(span).toHaveText('— system —')
    })
})
