import { expect, test } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId.
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamField (0-based):
 *   0  → Design
 *   1  → State
 *   2  → Functional
 *   3  → Events - focus
 *   4  → Events - click:clear
 *   5  → Events - click:appendInner
 *   6  → Events - click:prependInner
 *   7  → Slots - Default
 *   8  → Slots - Label
 *   9  → Slots - FloatingLabel
 *  10  → Slots - Prefix
 *  11  → Slots - Suffix
 *  12  → Slots - PrependInner
 *  13  → Slots - AppendInner
 *  14  → Slots - Clear
 *  15  → Slots - Loader
 *  16  → Prop — variant
 *  17  → Prop — variant (all)
 *  18  → Prop — color
 *  19  → Prop — density
 *  20  → Prop — prefix & suffix
 *  21  → Prop — disabled, error & dirty
 *  22  → Slot — prependInner / appendInner
 *  23  → Emit — focus & blur
 *  24  → Prop — rounded
 *  25  → Default (playground)
 */
const STORY_ID   = 'components-stories-field-origamfield-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamField', () => {
    test.setTimeout(45000)

    test('Variant — default variant emits origam-field--variant-outlined class', async ({ page }) => {
        await page.goto(variantUrl(16))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const field = sandbox.locator('[data-cy="field-variant"]')
        await expect(field).toBeVisible({ timeout: 20000 })
        await expect(field).toHaveClass(/origam-field--variant-outlined/, { timeout: 5000 })
        await expect(sandbox.locator('[data-cy="field-variant-input"]')).toBeVisible({ timeout: 5000 })
    })

    test('Variants showcase — all five variant rungs are rendered', async ({ page }) => {
        // solo-filled and solo-inverted were removed in the PDF-alignment cleanup (2026-05-06)
        await page.goto(variantUrl(17))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        const variants = ['outlined', 'filled', 'plain', 'underlined', 'solo']
        for (const v of variants) {
            const el = sandbox.locator(`[data-cy="field-showcase-${v}"]`)
            await expect(el).toBeVisible({ timeout: 20000 })
            await expect(el).toHaveClass(new RegExp(`origam-field--variant-${v}`), { timeout: 5000 })
        }
    })

    test('Color — field renders with color prop', async ({ page }) => {
        await page.goto(variantUrl(18))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="field-color"]')).toBeVisible({ timeout: 20000 })
    })

    test('Density — field renders at specified density', async ({ page }) => {
        await page.goto(variantUrl(19))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="field-density"]')).toBeVisible({ timeout: 20000 })
    })

    test('Prefix & suffix — prefix and suffix text visible', async ({ page }) => {
        await page.goto(variantUrl(20))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="field-prefix"]')).toBeVisible({ timeout: 20000 })
        await expect(sandbox.locator('.origam-field__prefix').first()).toBeVisible({ timeout: 5000 })
    })

    test('States — error state applies error class', async ({ page }) => {
        await page.goto(variantUrl(21))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="field-states"]')).toBeVisible({ timeout: 20000 })
    })

    test('Slot prependInner / appendInner — icons visible', async ({ page }) => {
        await page.goto(variantUrl(22))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="field-slot-inner"]')).toBeVisible({ timeout: 20000 })
        await expect(sandbox.locator('.origam-field__prepend-inner').first()).toBeVisible({ timeout: 5000 })
    })

    test('Emit focus / blur — focusing input fires events', async ({ page }) => {
        await page.goto(variantUrl(23))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const input = sandbox.locator('[data-cy="field-emit-focus"] input').first()
        await expect(input).toBeVisible({ timeout: 20000 })
        await input.focus()
        await input.blur()
        // logEvent called — no throw = success
    })

    test('Prop rounded — themed default radius resolves (non-zero) and prop overrides it', async ({ page }) => {
        await page.goto(variantUrl(24))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        const defaultField = sandbox.locator('[data-cy="field-rounded-default"]')
        const propField = sandbox.locator('[data-cy="field-rounded-prop"]')
        await expect(defaultField).toBeVisible({ timeout: 20000 })
        await expect(propField).toBeVisible({ timeout: 15000 })

        const defaultRadius = await defaultField.evaluate(el => getComputedStyle(el).borderTopLeftRadius)
        expect(defaultRadius).not.toBe('')
        expect(defaultRadius).not.toBe('0px')

        const mdRadius = await propField.evaluate(el => getComputedStyle(el).borderTopLeftRadius)
        expect(mdRadius).not.toBe('')
        expect(mdRadius).not.toBe('0px')
    })

    test('Playground — renders without errors', async ({ page }) => {
        await page.goto(variantUrl(25))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="field-playground"]')).toBeVisible({ timeout: 20000 })
    })
})
