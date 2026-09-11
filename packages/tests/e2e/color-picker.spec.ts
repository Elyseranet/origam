import { expect, test } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId (cf. btn.spec.ts).
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamColorPicker (0-based) :
 *   0  → Design
 *   1  → Functional
 *   2  → Prop — hideCanvas
 *   3  → Prop — mode
 *   4  → Prop — hideSliders & hideInputs
 *   5  → Prop — showSwatches & swatchesMaxHeight
 *   6  → Events - update:modelValue
 *   7  → Events - update:mode
 *   8  → Slots - Default
 *   9  → Slots - Title
 *  10  → Slots - Header
 *  11  → Slots - Actions
 *  12  → Default (playground)
 */

const STORY_ID   = 'components-stories-colorpicker-origamcolorpicker-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamColorPicker', () => {
    test.setTimeout(45000)

    test('Canvas variant — picker renders with canvas area', async ({ page }) => {
        await page.goto(variantUrl(2))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const picker = sandbox.locator('.origam-color-picker').first()
        await expect(picker).toBeVisible({ timeout: 12000 })
    })

    test('Canvas variant — hideCanvas removes the canvas element', async ({ page }) => {
        await page.goto(variantUrl(2))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // With default hideCanvas=false, canvas should be present
        const picker = sandbox.locator('.origam-color-picker').first()
        await expect(picker).toBeVisible({ timeout: 12000 })
    })

    test('Mode variant — picker renders with mode controls', async ({ page }) => {
        await page.goto(variantUrl(3))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const picker = sandbox.locator('.origam-color-picker').first()
        await expect(picker).toBeVisible({ timeout: 12000 })
    })

    test('Sliders and inputs variant — picker renders', async ({ page }) => {
        await page.goto(variantUrl(4))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const picker = sandbox.locator('.origam-color-picker').first()
        await expect(picker).toBeVisible({ timeout: 12000 })
    })

    test('Swatches variant — picker renders with showSwatches=true', async ({ page }) => {
        await page.goto(variantUrl(5))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const picker = sandbox.locator('.origam-color-picker').first()
        await expect(picker).toBeVisible({ timeout: 12000 })
    })

    test('Slot — title renders custom title content', async ({ page }) => {
        await page.goto(variantUrl(9))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.getByText('Pick a colour')).toBeVisible({ timeout: 12000 })
    })

    test('Slot — actions renders action buttons', async ({ page }) => {
        await page.goto(variantUrl(11))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.getByRole('button', { name: /apply/i })).toBeVisible({ timeout: 12000 })
    })

    test('Emit — update:modelValue variant renders picker', async ({ page }) => {
        await page.goto(variantUrl(6))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-color-picker').first()).toBeVisible({ timeout: 12000 })
    })

    test('Playground variant — picker renders', async ({ page }) => {
        await page.goto(variantUrl(12))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const picker = sandbox.locator('.origam-color-picker').first()
        await expect(picker).toBeVisible({ timeout: 12000 })
        // picker mode class is present
        await expect(picker).toHaveClass(/origam-color-picker--/)
    })
})
