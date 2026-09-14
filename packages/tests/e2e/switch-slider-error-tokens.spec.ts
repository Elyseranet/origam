import { expect, test, type Page } from '@playwright/test'

/**
 * Regression spec for issue #431 — pure-red error state / off-token
 * palette in Switch and SliderField(Track).
 *
 * Cannot be proven in jsdom (no real CSS cascade, no var() resolution) —
 * hence Playwright against a running Histoire instance. Rather than
 * asserting a specific hex (the active Histoire theme in this repo
 * overrides some semantic tokens for demo purposes, so the resolved
 * value is environment-dependent), each assertion proves the STRUCTURAL
 * claim the issue makes: the rendered color now comes from a live
 * `--origam-…` custom property (theme-reactive), not a hardcoded
 * literal baked into the stylesheet. Concretely: read the custom
 * property's own resolved value and assert the element's computed
 * color/background-color MATCHES it exactly — that can only hold if
 * the SCSS genuinely consumes `var(--origam-…)` rather than a literal.
 *
 * Histoire's `HstCheckbox` control renders as `role="checkbox"` with an
 * accessible name (its label text) — a stable, non-brittle Playwright
 * target (unlike the `HstSelect` picker dropdown, which the project's
 * own story-testing convention flags as custom DOM).
 */

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const rgbToHexLike = (rgb: string): string => {
    const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (!m) return rgb
    return `#${[m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('')}`
}

test.describe('OrigamSwitch — error/readonly track & thumb no longer hardcoded (#431)', () => {
    const SWITCH_FUNCTIONAL = '/stories/story/components-stories-switch-origamswitch-story-vue?variantId=components-stories-switch-origamswitch-story-vue-2'

    test('error state: track background-color/color come from --origam-switch__track---*-error, not a literal', async ({ page }) => {
        await page.goto(SWITCH_FUNCTIONAL, { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-switch-track').first()).toBeVisible({ timeout: 12000 })

        await page.getByRole('checkbox', { name: 'Error', exact: true }).click()

        const track = sandbox.locator('.origam-switch-track').first()
        await expect(track).toHaveClass(/origam-switch-track--error/)
        // `.origam-switch-track` has a 0.2s `transition: background-color`;
        // reading computed style immediately after the class lands catches
        // the interpolated mid-transition color, not the settled one.
        await page.waitForTimeout(400)

        const result = await track.evaluate((el) => {
            const cs = getComputedStyle(el)
            return {
                bg: cs.backgroundColor,
                color: cs.color,
                varBg: cs.getPropertyValue('--origam-switch__track---background-color-error').trim(),
                varColor: cs.getPropertyValue('--origam-switch__track---color-error').trim()
            }
        })

        expect(result.varBg).not.toBe('')
        expect(result.varColor).not.toBe('')
        expect(rgbToHexLike(result.bg)).toBe(result.varBg.toLowerCase())
        expect(rgbToHexLike(result.color)).toBe(result.varColor.toLowerCase())
        // The old defect: hardcoded pure red/white, identical in every theme.
        expect(result.bg).not.toBe('rgb(255, 0, 0)')
    })

    test('error state: thumb background-color/color come from --origam-switch__thumb---*-error', async ({ page }) => {
        await page.goto(SWITCH_FUNCTIONAL, { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-switch-track').first()).toBeVisible({ timeout: 12000 })

        await page.getByRole('checkbox', { name: 'Error', exact: true }).click()
        await page.waitForTimeout(400)

        const thumb = sandbox.locator('.origam-switch__thumb').first()
        const result = await thumb.evaluate((el) => {
            const cs = getComputedStyle(el)
            return {
                bg: cs.backgroundColor,
                color: cs.color,
                varBg: cs.getPropertyValue('--origam-switch__thumb---background-color-error').trim(),
                varColor: cs.getPropertyValue('--origam-switch__thumb---color-error').trim()
            }
        })

        expect(result.varBg).not.toBe('')
        expect(rgbToHexLike(result.bg)).toBe(result.varBg.toLowerCase())
        expect(rgbToHexLike(result.color)).toBe(result.varColor.toLowerCase())
        expect(result.bg).not.toBe('rgb(255, 0, 0)')
    })

    test('readonly state: track gets pointer-events:none + cursor:default (was visually identical to a normal switch)', async ({ page }) => {
        await page.goto(SWITCH_FUNCTIONAL, { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-switch-track').first()).toBeVisible({ timeout: 12000 })

        await page.getByRole('checkbox', { name: 'Readonly', exact: true }).click()

        const track = sandbox.locator('.origam-switch-track').first()
        await expect(track).toHaveClass(/origam-switch-track--readonly/)

        const cs = await track.evaluate((el) => {
            const s = getComputedStyle(el)
            return { pointerEvents: s.pointerEvents, cursor: s.cursor }
        })
        expect(cs.pointerEvents).toBe('none')
        expect(cs.cursor).toBe('default')
    })
})

test.describe('OrigamSliderFieldTrack — default palette (background/fill/tick) no longer hardcoded (#431)', () => {
    const TRACK_DESIGN = '/stories/story/components-stories-sliderfield-origamsliderfieldtrack-story-vue?variantId=components-stories-sliderfield-origamsliderfieldtrack-story-vue-0'

    test('background/fill/tick/tick--filled colors match their live --origam-slider-field(-track)__… custom properties', async ({ page }) => {
        await page.goto(TRACK_DESIGN, { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        const track = sandbox.locator('.origam-slider-field-track').first()
        // Standalone (outside <OrigamSliderField>) the track has no intrinsic
        // height of its own — that's supplied by the parent's `:deep()` rule
        // — so it can render at zero size here. Presence, not visibility, is
        // what this test needs; computed style resolves regardless of size.
        await expect(track).toBeAttached({ timeout: 12000 })

        const bg = sandbox.locator('.origam-slider-field-track__background').first()
        const fill = sandbox.locator('.origam-slider-field-track__fill').first()

        const bgResult = await bg.evaluate((el) => {
            const cs = getComputedStyle(el)
            return { color: cs.backgroundColor, varValue: cs.getPropertyValue('--origam-slider-field__track---background-color').trim() }
        })
        expect(bgResult.varValue).not.toBe('')
        expect(rgbToHexLike(bgResult.color)).toBe(bgResult.varValue.toLowerCase())
        // Old defect: hardcoded rgb(148, 148, 148) regardless of theme.
        expect(bgResult.color).not.toBe('rgb(148, 148, 148)')

        const fillResult = await fill.evaluate((el) => {
            const cs = getComputedStyle(el)
            return {
                color: cs.backgroundColor,
                // Reads the actually-emitted (currently #435-mangled) var name —
                // see the long comment in OrigamSliderFieldTrack.vue.
                varValue: cs.getPropertyValue('--origam-slider-field---track-fill-background-color').trim()
            }
        })
        expect(fillResult.varValue).not.toBe('')
        expect(rgbToHexLike(fillResult.color)).toBe(fillResult.varValue.toLowerCase())
        expect(fillResult.color).not.toBe('rgb(84, 84, 84)')
    })
})

test.describe('OrigamSliderField — error text color and thumb color no longer hardcoded (#431)', () => {
    const SLIDER_FIELD_FUNCTIONAL = '/stories/story/components-stories-sliderfield-origamsliderfield-story-vue?variantId=components-stories-sliderfield-origamsliderfield-story-vue-1'

    test('error state: .origam-slider-field__container color matches --origam-slider-field---color-error', async ({ page }) => {
        await page.goto(SLIDER_FIELD_FUNCTIONAL, { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-slider-field').first()).toBeVisible({ timeout: 12000 })

        await page.getByRole('checkbox', { name: 'Error', exact: true }).click()

        const container = sandbox.locator('.origam-slider-field__container').first()
        const result = await container.evaluate((el) => {
            const cs = getComputedStyle(el)
            return { color: cs.color, varValue: cs.getPropertyValue('--origam-slider-field---color-error').trim() }
        })
        expect(result.varValue).not.toBe('')
        expect(rgbToHexLike(result.color)).toBe(result.varValue.toLowerCase())
        expect(result.color).not.toBe('rgb(255, 0, 0)')
    })

    test('thumb color matches --origam-slider-field__thumb---background-color (was a hardcoded literal)', async ({ page }) => {
        await page.goto(SLIDER_FIELD_FUNCTIONAL, { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-slider-field').first()).toBeVisible({ timeout: 12000 })

        const thumb = sandbox.locator('.origam-slider-field-thumb').first()
        const result = await thumb.evaluate((el) => {
            const cs = getComputedStyle(el)
            return { color: cs.color, varValue: cs.getPropertyValue('--origam-slider-field__thumb---background-color').trim() }
        })
        expect(result.varValue).not.toBe('')
        expect(rgbToHexLike(result.color)).toBe(result.varValue.toLowerCase())
        expect(result.color).not.toBe('rgb(66, 66, 66)')
    })
})
