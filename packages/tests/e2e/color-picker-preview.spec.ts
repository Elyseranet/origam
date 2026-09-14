import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * OrigamColorPickerPreview — spec e2e (pattern canonique btn.spec.ts)
 *
 * Navigation directe : page.goto(STORY_PATH + '?variantId=' + STORY_ID + '-' + index)
 * Index 0-based = position du <Variant> dans OrigamColorPickerPreview.story.vue.
 *
 * Variant 0 → Design, init colorHsv { h: 210, s: 0.7, v: 0.8, a: 0.6 }
 *
 * REGRESSION (#405) — `--origam-color-picker-color-hsv` était lu sans repli
 * par `.origam-color-picker-preview__alpha .origam-slider-field-track__background`
 * (`background-image: linear-gradient(to right, transparent, var(--origam-color-picker-color-hsv))`)
 * mais n'était JAMAIS posé — ni par le pipeline de tokens, ni en inline —
 * donc la déclaration `background-image` tombait entièrement : le rail
 * alpha n'affichait aucun dégradé vers la couleur courante. Corrigé en
 * posant la variable via `:style` sur la racine, dérivée de `colorHsv`
 * (opacité forcée à 1 — c'est le dégradé transparent→couleur qui EST la
 * représentation de l'alpha, pas la couleur elle-même).
 *
 * Vérifié au navigateur réel (jamais jsdom, `getComputedStyle` n'y résout
 * jamais `var()` — #398).
 */

const STORY_ID = 'components-stories-colorpicker-origamcolorpickerpreview-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

async function expectPreviewVisible(page: Page, timeout = 12000) {
    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    await expect(sandbox.locator('.origam-color-picker-preview').first()).toBeVisible({ timeout })
    return sandbox
}

test.describe('OrigamColorPickerPreview', () => {
    test.setTimeout(45000)

    test.describe('Design (index 0) — alpha gradient (#405)', () => {
        test('--origam-color-picker-color-hsv resolves to a real rgba value on the root', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = await expectPreviewVisible(page)
            const root = sandbox.locator('.origam-color-picker-preview').first()
            const value = await root.evaluate((el) => getComputedStyle(el).getPropertyValue('--origam-color-picker-color-hsv').trim())
            expect(value).toMatch(/^rgba?\(/)
        })

        test('the alpha track background-image is a real gradient, not dropped', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = await expectPreviewVisible(page)
            const alphaBackground = sandbox.locator('.origam-color-picker-preview__alpha .origam-slider-field-track__background').first()
            await expect(alphaBackground).toBeVisible()
            const backgroundImage = await alphaBackground.evaluate((el) => getComputedStyle(el).backgroundImage)
            expect(backgroundImage).not.toBe('none')
            expect(backgroundImage).toContain('gradient')
        })
    })
})
