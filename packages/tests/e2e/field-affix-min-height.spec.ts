import { expect, test } from '@playwright/test'

/**
 * `OrigamField` — the prefix/suffix `min-height` must track the input's own
 * vertical padding.
 *
 * The rule intends the affixes to be at least as tall as the input, and adds
 * the input's vertical padding to `1.5rem` to say so. It read
 * `--origam-field-input---padding-top` / `-bottom` — a name declared NOWHERE
 * in the token sheets (the correct BEM-child spelling, used correctly by the
 * input rule itself, is `--origam-field__input---padding-top`). Measured in
 * Chromium, the misspelt custom property resolves to the empty string, so
 * both terms collapsed onto their `0px` fallback and the sum degenerated to
 * `max(control-height, 1.5rem)`.
 *
 * That is the failure mode a fallback HIDES: nothing looks broken, because
 * `max()` still yields the control height on a default field — the padding
 * term simply never contributed, and no theme could make it contribute.
 *
 * The mutation and the measurement share ONE `evaluate`: split across two
 * round trips, Vue re-patches the element in between and the assertion
 * measures Vue's element rather than the mutated one.
 */

const STORY_PATH = '/stories/story/components-stories-field-origamfield-story-vue'

const openAffixVariant = async (page: import('@playwright/test').Page) => {
    await page.goto(STORY_PATH)
    await page.waitForLoadState('networkidle')
    await page.getByText('Prop — prefix & suffix', { exact: true }).first().click()
    await page.waitForTimeout(900)

    return page.frameLocator('iframe[src*="__sandbox"]')
}

test.describe('OrigamField — prefix/suffix min-height', () => {
    test('default outlined field: affixes match the 36px control height', async ({ page }) => {
        const sandbox = await openAffixVariant(page)

        for (const part of ['prefix', 'suffix']) {
            const affix = sandbox.locator(`[data-cy="field-prefix"] .origam-field__${part}`)

            await expect(affix).toBeVisible({ timeout: 5000 })
            await expect(affix).toHaveCSS('min-height', '36px', { timeout: 3000 })
        }
    })

    test('affix height follows --origam-field__input---padding-top', async ({ page }) => {
        const sandbox = await openAffixVariant(page)
        const affix = sandbox.locator('[data-cy="field-prefix"] .origam-field__prefix')

        await expect(affix).toBeVisible({ timeout: 5000 })

        // 1.5rem (24px) + 40px top + 6px bottom = 70px, above the 36px control.
        const themed = await affix.evaluate((el) => {
            const style = el.ownerDocument.createElement('style')

            style.textContent = ':root{--origam-field__input---padding-top:40px;}'
            el.ownerDocument.head.appendChild(style)

            void (el as HTMLElement).offsetHeight

            return el.ownerDocument.defaultView!.getComputedStyle(el).minHeight
        })

        expect(themed).toBe('70px')
    })
})
