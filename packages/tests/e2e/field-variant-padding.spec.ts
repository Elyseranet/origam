import { expect, test } from '@playwright/test'

/**
 * `OrigamField` — the `solo` / `filled` variants must expose a theming
 * channel for the input's vertical padding.
 *
 * Every other rung in `OrigamField.vue` redirects the effective token
 * `--origam-field__input---padding-top` onto a NAMED rung token
 * (`--origam-field__input---padding-block-{sm,md,lg,xl}`), which is what
 * a theme overrides. The `solo` and `filled` variants wrote a raw `20px`
 * literal instead, so they were the only two rungs in the file with NO
 * theming channel at all: an element-level declaration beats the `:root`
 * token, and `size` has no default (`useSize` emits no class when `size`
 * is undefined), so on a plain `variant="solo"` field the literal was the
 * ONLY writer.
 *
 * The mutation and the measurement happen inside a SINGLE `evaluate`:
 * splitting them lets Vue re-patch the element between the two and you
 * end up measuring Vue's element rather than yours (see the note on the
 * `alert.spec.ts` pattern in CLAUDE.md).
 */

const STORY_PATH = '/stories/story/components-stories-field-origamfield-story-vue'

const openVariantShowcase = async (page: import('@playwright/test').Page) => {
    await page.goto(STORY_PATH)
    await page.waitForLoadState('networkidle')
    await page.getByText('Prop — variant (all)', { exact: true }).first().click()
    await page.waitForTimeout(800)

    return page.frameLocator('iframe[src*="__sandbox"]')
}

/**
 * Injects a `:root` override for `token` and reads the resulting computed
 * `padding-top` — both in one round trip, on the element itself.
 */
const paddingTopUnder = (locator: import('@playwright/test').Locator, token: string, value: string) => {
    return locator.evaluate((el, [name, val]) => {
        const style = el.ownerDocument.createElement('style')

        style.textContent = `:root{${name}:${val};}`
        el.ownerDocument.head.appendChild(style)

        // Force a style recalc before reading back.
        void (el as HTMLElement).offsetHeight

        return el.ownerDocument.defaultView!.getComputedStyle(el).paddingTop
    }, [token, value])
}

for (const variant of ['solo', 'filled'] as const) {
    test.describe(`OrigamField — variant ${variant} vertical padding`, () => {
        test(`renders the documented 20px by default`, async ({ page }) => {
            const sandbox = await openVariantShowcase(page)
            const input = sandbox.locator(`[data-cy="field-showcase-${variant}"] .origam-field__input`)

            await expect(input).toBeVisible({ timeout: 5000 })
            await expect(input).toHaveCSS('padding-top', '20px', { timeout: 3000 })
        })

        test(`honours the --origam-field__input---padding-block-${variant} rung token`, async ({ page }) => {
            const sandbox = await openVariantShowcase(page)
            const input = sandbox.locator(`[data-cy="field-showcase-${variant}"] .origam-field__input`)

            await expect(input).toBeVisible({ timeout: 5000 })

            const themed = await paddingTopUnder(
                input,
                `--origam-field__input---padding-block-${variant}`,
                '33px'
            )

            expect(themed).toBe('33px')
        })
    })
}
