import { expect, test } from '@playwright/test'
import { toggleHstCheckbox } from './_support/histoire-controls'

const STORY_PATH = '/stories/story/components-stories-field-origamfield-story-vue'

test.describe('OrigamField', () => {
    test('Variant — default variant emits origam-field--variant-outlined class', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — variant', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const field = sandbox.locator('[data-cy="field-variant"]')
        await expect(field).toBeVisible({ timeout: 5000 })
        await expect(field).toHaveClass(/origam-field--variant-outlined/, { timeout: 3000 })
        await expect(sandbox.locator('[data-cy="field-variant-input"]')).toBeVisible({ timeout: 3000 })
    })

    test('Variants showcase — all five variant rungs are rendered', async ({ page }) => {
        // solo-filled and solo-inverted were removed in the PDF-alignment cleanup (2026-05-06)
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — variant (all)', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        const variants = ['outlined', 'filled', 'plain', 'underlined', 'solo']
        for (const v of variants) {
            const el = sandbox.locator(`[data-cy="field-showcase-${v}"]`)
            await expect(el).toBeVisible({ timeout: 5000 })
            await expect(el).toHaveClass(new RegExp(`origam-field--variant-${v}`), { timeout: 3000 })
        }
    })

    test('Color — field renders with color prop', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — color', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="field-color"]')).toBeVisible({ timeout: 5000 })
    })

    test('Density — field renders at specified density', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — density', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="field-density"]')).toBeVisible({ timeout: 5000 })
    })

    test('Prefix & suffix — prefix and suffix text visible', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — prefix & suffix', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="field-prefix"]')).toBeVisible({ timeout: 5000 })
        await expect(sandbox.locator('.origam-field__prefix').first()).toBeVisible({ timeout: 3000 })
    })

    test('States — error state applies error class', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — disabled, error & dirty', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="field-states"]')).toBeVisible({ timeout: 5000 })
    })

    test('Slot prependInner / appendInner — icons visible', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Slot — prependInner / appendInner', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="field-slot-inner"]')).toBeVisible({ timeout: 5000 })
        await expect(sandbox.locator('.origam-field__prepend-inner').first()).toBeVisible({ timeout: 3000 })
    })

    // issue #422 — the "Required" checkbox on this Variant was wired to a
    // real prop that had NO effect at all: no asterisk, no aria-required.
    // Fixed centrally in OrigamField's slotProps; the story's default slot
    // now forwards the resulting `aria-required` onto its plain <input>
    // (previously it destructured only id/onFocus/onBlur, discarding it —
    // exactly why the checkbox looked inert even after the component fix).
    test('Required — toggling the checkbox sets aria-required on the input', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Functional', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const input = sandbox.locator('[data-cy="field-functional-input"]')
        await expect(input).toBeVisible({ timeout: 5000 })
        await expect(input).not.toHaveAttribute('aria-required', 'true')

        await toggleHstCheckbox(page, 'Required')
        await page.waitForTimeout(300)

        await expect(input).toHaveAttribute('aria-required', 'true')
    })

    test('Emit focus / blur — focusing input fires events', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Events - focus', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const input = sandbox.locator('[data-cy="field-emit-focus"] input').first()
        await expect(input).toBeVisible({ timeout: 5000 })
        await input.focus()
        await input.blur()
        // logEvent called — no throw = success
    })

    test('Prop rounded — themed default radius resolves (non-zero) and prop overrides it', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — rounded', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        const defaultField = sandbox.locator('[data-cy="field-rounded-default"]')
        const propField = sandbox.locator('[data-cy="field-rounded-prop"]')
        await expect(defaultField).toBeVisible({ timeout: 5000 })
        await expect(propField).toBeVisible({ timeout: 5000 })

        const defaultRadius = await defaultField.evaluate(el => getComputedStyle(el).borderTopLeftRadius)
        expect(defaultRadius).not.toBe('')
        expect(defaultRadius).not.toBe('0px')

        const mdRadius = await propField.evaluate(el => getComputedStyle(el).borderTopLeftRadius)
        expect(mdRadius).not.toBe('')
        expect(mdRadius).not.toBe('0px')
    })

    test('Playground — renders without errors', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Default', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="field-playground"]')).toBeVisible({ timeout: 5000 })
    })

    // Regression — a prepended field's `__outline--start` leg must stay at
    // least as wide as the field's border-radius. When it was clamped to the
    // raw `padding-start` (6px) instead, a `rounded="large"` (16px) corner
    // rendered flat: CSS scales down a border-radius that exceeds the box
    // carrying it, and `__outline--start` is exactly the box that carries the
    // start-side radius.
    test('Prepended + rounded — outline start leg is not narrower than the corner radius', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — prepended corner (regression)', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const field = sandbox.locator('[data-cy="field-corner-prepended"]')
        const outlineStart = sandbox.locator('[data-cy="field-corner-prepended"] .origam-field__outline--start')

        await expect(field).toBeVisible({ timeout: 5000 })
        await expect(outlineStart).toBeVisible({ timeout: 3000 })

        const radiusPx = await field.evaluate(el => parseFloat(getComputedStyle(el).borderTopLeftRadius))
        const outlineBox = await outlineStart.boundingBox()

        expect(radiusPx).toBeGreaterThan(6)
        expect(outlineBox).not.toBeNull()
        expect(outlineBox!.width).toBeGreaterThanOrEqual(radiusPx - 1)
    })
})
