import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamMediaScrubber — runtime probes for the headless scrubber primitive:
 * pointer + keyboard pipeline, ARIA contract, the `buffered` channel, and
 * the `disabled` short-circuit.
 *
 * ─── BLOCKER ─────────────────────────────────────────────────────────────────
 * No dedicated story exists for OrigamMediaScrubber.
 * The component lives at packages/ds/src/components/Media/OrigamMediaScrubber.vue
 * and is fully unit-tested in packages/tests/TU/components/Media/OrigamMediaScrubber.spec.ts
 * but the Histoire story (packages/stories/components/stories/MediaScrubber/
 * OrigamMediaScrubber.story.vue) has NEVER been created.
 *
 * All e2e tests below are marked `test.fixme` until the story is created with
 * the following Variants and data-cy attributes:
 *
 *   Variant "Default"
 *     data-cy="media-scrubber-default-host"  (the OrigamMediaScrubber root,
 *     modelValue=30, :max=100, orientation="horizontal")
 *
 *   Variant "Variant — keyboard / a11y"
 *     data-cy="media-scrubber-keyboard-host" (modelValue=50, :min=0, :max=200,
 *     :step=1, orientation="horizontal")
 *
 *   Variant "Variant — orientation (horizontal / vertical)"
 *     data-cy="media-scrubber-horizontal"   (horizontal instance)
 *     data-cy="media-scrubber-vertical"     (orientation="vertical", :max=100,
 *     modelValue=40)
 *
 *   Variant "Variant — buffer (media use case)"
 *     data-cy="media-scrubber-with-buffer"  (modelValue=30, :buffered=70,
 *     :min=0, :max=100)
 *
 *   Variant "Variant — showHoverTooltip + formatHoverTooltip"
 *     data-cy="media-scrubber-with-tooltip" (show-hover-tooltip,
 *     :format-hover-tooltip="v => Math.round(v * 100) + '%'", modelValue=0.5,
 *     :min=0, :max=1)
 *
 * Once created, the STORY_PATH below and the test.fixme calls can be removed.
 *
 * STORY_PATH (once the story exists):
 *   '/stories/story/components-stories-mediascrubber-origammediascrubber-story-vue'
 * ─────────────────────────────────────────────────────────────────────────────
 */

// BLOCKED: story does not exist yet — path kept for when it is created
const STORY = '/stories/story/components-stories-mediascrubber-origammediascrubber-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, title: string): Promise<void> => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(400)
}

test.describe('OrigamMediaScrubber — Default (mount + ARIA)', () => {
    // BLOCKED: OrigamMediaScrubber.story.vue does not exist — no Variant "Default"
    // with data-cy="media-scrubber-default-host" to navigate to.
    test.fixme('mounts the primitive with role="slider"', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="media-scrubber-default-host"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'slider')
        await expect(host).toHaveAttribute('tabindex', '0')
    })

    // BLOCKED: same root cause — no story, no data-cy="media-scrubber-default-host"
    test.fixme('aria-valuenow reflects the initial modelValue', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="media-scrubber-default-host"]').first()
        await expect(host).toHaveAttribute('aria-valuenow', '30')
    })

    // BLOCKED: same root cause — no story, no data-cy="media-scrubber-default-host"
    test.fixme('paints the thumb at the expected % position', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const thumb = sandbox.locator('[data-cy="media-scrubber-default-host"] .origam-media-scrubber__thumb').first()
        await expect(thumb).toBeAttached({ timeout: 8000 })
        const style = await thumb.getAttribute('style')
        expect(style).toMatch(/left:\s*30%/)
    })
})

test.describe('OrigamMediaScrubber — Keyboard (horizontal)', () => {
    // BLOCKED: no story, no Variant "Variant — keyboard / a11y",
    // no data-cy="media-scrubber-keyboard-host"
    test.fixme('ArrowRight increases aria-valuenow', async ({ page }) => {
        await openVariant(page, 'Variant — keyboard / a11y')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="media-scrubber-keyboard-host"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        const before = Number(await host.getAttribute('aria-valuenow'))
        await host.focus()
        await sandbox.locator('body').press('ArrowRight')
        await page.waitForTimeout(120)
        const after = Number(await host.getAttribute('aria-valuenow'))
        expect(after).toBeGreaterThan(before)
    })

    // BLOCKED: same root cause
    test.fixme('Home jumps to min, End jumps to max', async ({ page }) => {
        await openVariant(page, 'Variant — keyboard / a11y')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="media-scrubber-keyboard-host"]').first()
        await host.focus()

        await sandbox.locator('body').press('End')
        await page.waitForTimeout(120)
        expect(Number(await host.getAttribute('aria-valuenow'))).toBe(200)

        await sandbox.locator('body').press('Home')
        await page.waitForTimeout(120)
        expect(Number(await host.getAttribute('aria-valuenow'))).toBe(0)
    })
})

test.describe('OrigamMediaScrubber — Keyboard (vertical)', () => {
    // BLOCKED: no story, no Variant "Variant — orientation (horizontal / vertical)",
    // no data-cy="media-scrubber-vertical"
    test.fixme('ArrowUp increases aria-valuenow on vertical orientation', async ({ page }) => {
        await openVariant(page, 'Variant — orientation (horizontal / vertical)')
        const sandbox = sandboxOf(page)
        const vertical = sandbox.locator('[data-cy="media-scrubber-vertical"]').first()
        await expect(vertical).toBeVisible({ timeout: 8000 })

        const before = Number(await vertical.getAttribute('aria-valuenow'))
        await vertical.focus()
        await sandbox.locator('body').press('ArrowUp')
        await page.waitForTimeout(120)
        const after = Number(await vertical.getAttribute('aria-valuenow'))
        expect(after).toBeGreaterThan(before)
        await expect(vertical).toHaveAttribute('aria-orientation', 'vertical')
    })
})

test.describe('OrigamMediaScrubber — Pointer (click to seek)', () => {
    // BLOCKED: no story, no Variant "Variant — buffer (media use case)",
    // no data-cy="media-scrubber-with-buffer"
    test.fixme('pointerdown on the track moves the thumb to the click position', async ({ page }) => {
        await openVariant(page, 'Variant — buffer (media use case)')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="media-scrubber-with-buffer"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        const box = await host.boundingBox()
        if (!box) throw new Error('Scrubber not measurable')
        const targetX = box.x + box.width * 0.8
        const targetY = box.y + box.height / 2
        await page.mouse.move(targetX, targetY)
        await page.mouse.down()
        await page.mouse.up()
        await page.waitForTimeout(150)

        const after = Number(await host.getAttribute('aria-valuenow'))
        expect(after).toBeGreaterThan(50)
    })
})

test.describe('OrigamMediaScrubber — buffered prop', () => {
    // BLOCKED: no story, no Variant "Variant — buffer (media use case)",
    // no data-cy="media-scrubber-with-buffer"
    test.fixme('renders the __buffer bar with the correct width', async ({ page }) => {
        await openVariant(page, 'Variant — buffer (media use case)')
        const sandbox = sandboxOf(page)
        const buffer = sandbox.locator('[data-cy="media-scrubber-with-buffer"] .origam-media-scrubber__buffer').first()
        await expect(buffer).toBeAttached({ timeout: 8000 })
        const style = await buffer.getAttribute('style')
        expect(style).toMatch(/width:\s*70%/)
    })
})

test.describe('OrigamMediaScrubber — Tooltip variant', () => {
    // BLOCKED: no story, no Variant "Variant — showHoverTooltip + formatHoverTooltip",
    // no data-cy="media-scrubber-with-tooltip"
    test.fixme('renders the formatter output on hover', async ({ page }) => {
        await openVariant(page, 'Variant — showHoverTooltip + formatHoverTooltip')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="media-scrubber-with-tooltip"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        const box = await host.boundingBox()
        if (!box) throw new Error('Scrubber not measurable')
        await page.mouse.move(box.x + box.width * 0.5, box.y + box.height / 2)
        await page.waitForTimeout(180)

        const tooltip = sandbox.locator('[data-cy="media-scrubber-with-tooltip"] .origam-media-scrubber__hover-tooltip').first()
        await expect(tooltip).toBeVisible()
        const text = (await tooltip.innerText()).trim()
        expect(/^\d{1,2}%$/.test(text) || /^\d{1,3}\s*%$/.test(text)).toBe(true)
    })
})

test.describe('OrigamMediaScrubber — disabled flag', () => {
    // BLOCKED: no story, no Variant "Default" with data-cy="media-scrubber-default-host"
    test.fixme('drops tabindex to -1 when disabled', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const disabledCheckbox = page.locator('label', { hasText: 'disabled' }).locator('input[type="checkbox"]').first()
        await disabledCheckbox.check({ force: true })
        await page.waitForTimeout(200)

        const host = sandbox.locator('[data-cy="media-scrubber-default-host"]').first()
        await expect(host).toHaveAttribute('tabindex', '-1')
        await expect(host).toHaveAttribute('aria-disabled', 'true')
    })

    // BLOCKED: same root cause
    test.fixme('ignores keyboard ArrowRight when disabled', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const disabledCheckbox = page.locator('label', { hasText: 'disabled' }).locator('input[type="checkbox"]').first()
        await disabledCheckbox.check({ force: true })
        await page.waitForTimeout(200)

        const host = sandbox.locator('[data-cy="media-scrubber-default-host"]').first()
        const before = Number(await host.getAttribute('aria-valuenow'))
        await sandbox.locator('body').press('ArrowRight')
        await page.waitForTimeout(120)
        const after = Number(await host.getAttribute('aria-valuenow'))
        expect(after).toBe(before)
    })
})
