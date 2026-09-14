import { expect, test, type Page, type FrameLocator } from '@playwright/test'

import { fillHstNumber, fillHstText, toggleHstCheckbox } from './_support/histoire-controls'

/**
 * Browser proof that `origin` (tickets #538/#548) actually anchors the
 * `scale(...)` on `<OrigamTranslateScale>` — the ONE component out of the
 * 8-component `origin` audit where the prop has something to anchor on.
 *
 * Per the project CLAUDE.md ("`getComputedStyle` under jsdom NEVER resolves
 * `var()`" + "Don't claim it's fixed"), a WAAPI animation never executes
 * under jsdom and this component's SCSS reads no `var()` for the scale
 * itself, but the only trustworthy verdict for "does this actually run in a
 * real browser" is Playwright against a built Histoire, which is what this
 * spec is.
 *
 * The "Design" Variant of `OrigamTranslateScale.story.vue` exposes BOTH
 * `origin` (HstText) and, since this ticket, a "Use target (switches CSS
 * path to WAAPI)" checkbox + two HstNumber fields — added specifically so
 * this spec can drive both of `applyOrigin`'s call sites:
 *   - `!hasTarget` -> CSS-only path, `events.onBeforeEnter = applyOrigin`
 *     directly.
 *   - `hasTarget`  -> WAAPI path, `applyOrigin` called from
 *     `handleBeforeEnter` before `getDimensions()`/`animate()` run.
 *
 * We assert on the element's INLINE `transformOrigin` style — the literal
 * value `applyOrigin` writes (`el.style.transformOrigin = props.origin`),
 * not a value resolved through a `var()`-driven stylesheet rule. This is
 * real, both under jsdom (see the existing Vitest unit spec,
 * `OrigamTranslateScale.origin.spec.ts`) AND here — but ONLY the browser run
 * additionally proves the class actually renders `scale(...)` around it and
 * that Vue's real `<transition>` machinery (not @vue/test-utils' virtual
 * DOM) drives the CSS path build-for-build identically.
 */

const STORY = '/stories/story/components-stories-transition-origamtranslatescale-story-vue'

function sandbox (page: Page): FrameLocator {
    return page.frameLocator('iframe[src*="__sandbox"]')
}

async function gotoDesign (page: Page) {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText('Design', { exact: true }).first().click()
    await page.waitForTimeout(600)
}

test.describe('OrigamTranslateScale — origin prop, real browser (#538/#548)', () => {
    test('CSS-only path (no target): transform-origin is set on the entering element', async ({ page }) => {
        await gotoDesign(page)

        await fillHstText(page, 'Origin', '20% 80%')

        const sb = sandbox(page)
        await sb.locator('[data-cy="toggle-design"]').click()
        await expect(sb.locator('[data-cy="target-design"]')).toBeVisible({ timeout: 5000 })

        const transformOrigin = await sb.locator('[data-cy="target-design"]').evaluate(
            (el: HTMLElement) => el.style.transformOrigin
        )
        expect(transformOrigin).toBe('20% 80%')

        // Sanity: the CSS-only path is really the one that ran — the scale
        // class must be present on the element (enter completed).
        const className = await sb.locator('[data-cy="target-design"]').evaluate((el) => el.className)
        expect(className).toContain('origam-transition--transform-scale')
    })

    test('WAAPI path (target set): transform-origin is set on the element before the animation runs', async ({ page }) => {
        await gotoDesign(page)

        await fillHstText(page, 'Origin', 'left top')
        await toggleHstCheckbox(page, 'Use target (switches CSS path to WAAPI)')
        await fillHstNumber(page, 'Target X', 200)
        await fillHstNumber(page, 'Target Y', 100)

        const sb = sandbox(page)
        await sb.locator('[data-cy="toggle-design"]').click()
        await expect(sb.locator('[data-cy="target-design"]')).toBeVisible({ timeout: 5000 })

        const transformOrigin = await sb.locator('[data-cy="target-design"]').evaluate(
            (el: HTMLElement) => el.style.transformOrigin
        )
        expect(transformOrigin).toBe('left top')
    })

    test('baseline: transform-origin stays empty when origin is not set (CSS-only path)', async ({ page }) => {
        await gotoDesign(page)

        const sb = sandbox(page)
        await sb.locator('[data-cy="toggle-design"]').click()
        await expect(sb.locator('[data-cy="target-design"]')).toBeVisible({ timeout: 5000 })

        const transformOrigin = await sb.locator('[data-cy="target-design"]').evaluate(
            (el: HTMLElement) => el.style.transformOrigin
        )
        expect(transformOrigin).toBe('')
    })
})
