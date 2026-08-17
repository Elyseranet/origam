import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamMediaScrubber — runtime probes for the headless scrubber primitive:
 * pointer + keyboard pipeline, ARIA contract, the `buffered` channel, and
 * the `disabled` short-circuit.
 *
 * ─── HISTORY: why these 11 tests slept, and how they were woken ──────────────
 * They were written against a story that did not exist, from a blueprint whose
 * Variant titles ("Variant — keyboard / a11y", "Variant — orientation
 * (horizontal / vertical)", …) contradicted the canonical story structure the
 * repo mandates (Design · State · Functional · Events - {name} · Slots -
 * {Name} · Default last). Building the story to the blueprint would have
 * produced a non-canonical story that a later canonicalisation pass would
 * rename — re-breaking these very tests.
 *
 * The story was therefore written CANONICAL, and these tests were retargeted
 * by INTENTION rather than by renaming: each one now navigates to the Variant
 * that actually exercises the behaviour it asserts.
 *
 *   role / tabindex / aria-valuenow / thumb position → "Default" (playground,
 *     pinned modelValue=30, min=0, max=100, horizontal)
 *   keyboard, pointer-seek, buffered, disabled       → "Functional"
 *     (pinned modelValue=50, min=0, max=200, step=1, buffered=140)
 *   vertical axis + hover tooltip                    → "Design"
 *     (pinned modelValue=30, min=0, max=100, showHoverTooltip=true,
 *      formatHoverTooltip = v => `${Math.round(v)}%`)
 *
 * Two assertions were STRENGTHENED while retargeting, because as written they
 * would have gone green without exercising anything:
 *
 *   - the keyboard tests pressed keys on `sandbox.locator('body')`, and
 *     Playwright's `locator.press()` focuses its target first — so the
 *     preceding `host.focus()` was undone and the key never reached the
 *     scrubber. They now focus the host and press via `page.keyboard`.
 *   - "ignores keyboard ArrowRight when disabled" pressed on `body` too, so it
 *     passed for the trivial reason that nothing was focused, not because the
 *     `if (props.disabled) return` guard held. It now focuses the disabled
 *     host explicitly, which is the only way to reach that guard.
 * ─────────────────────────────────────────────────────────────────────────────
 */
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
    test('mounts the primitive with role="slider"', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="media-scrubber-default-host"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'slider')
        await expect(host).toHaveAttribute('tabindex', '0')
    })

    test('aria-valuenow reflects the initial modelValue', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="media-scrubber-default-host"]').first()
        await expect(host).toHaveAttribute('aria-valuenow', '30')
    })

    test('paints the thumb at the expected % position', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        const thumb = sandbox.locator('[data-cy="media-scrubber-default-host"] .origam-media-scrubber__thumb').first()
        await expect(thumb).toBeAttached({ timeout: 8000 })
        const style = await thumb.getAttribute('style')
        expect(style).toMatch(/left:\s*30%/)
    })
})

test.describe('OrigamMediaScrubber — Keyboard (horizontal)', () => {
    test('ArrowRight increases aria-valuenow', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="media-scrubber-functional-host"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        const before = Number(await host.getAttribute('aria-valuenow'))
        await host.focus()
        await page.keyboard.press('ArrowRight')
        await page.waitForTimeout(120)
        const after = Number(await host.getAttribute('aria-valuenow'))
        expect(after).toBeGreaterThan(before)
    })

    test('Home jumps to min, End jumps to max', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="media-scrubber-functional-host"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await host.focus()

        await page.keyboard.press('End')
        await page.waitForTimeout(120)
        expect(Number(await host.getAttribute('aria-valuenow'))).toBe(200)

        await page.keyboard.press('Home')
        await page.waitForTimeout(120)
        expect(Number(await host.getAttribute('aria-valuenow'))).toBe(0)
    })
})

test.describe('OrigamMediaScrubber — Keyboard (vertical)', () => {
    test('ArrowUp increases aria-valuenow on vertical orientation', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        const vertical = sandbox.locator('[data-cy="media-scrubber-design-vertical"]').first()
        await expect(vertical).toBeVisible({ timeout: 8000 })
        await expect(vertical).toHaveAttribute('aria-orientation', 'vertical')

        const before = Number(await vertical.getAttribute('aria-valuenow'))
        await vertical.focus()
        await page.keyboard.press('ArrowUp')
        await page.waitForTimeout(120)
        const after = Number(await vertical.getAttribute('aria-valuenow'))
        expect(after).toBeGreaterThan(before)
    })
})

test.describe('OrigamMediaScrubber — Pointer (click to seek)', () => {
    test('pointerdown on the track moves the thumb to the click position', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="media-scrubber-functional-host"]').first()
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
    test('renders the __buffer bar with the correct width', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const buffer = sandbox.locator('[data-cy="media-scrubber-functional-host"] .origam-media-scrubber__buffer').first()
        await expect(buffer).toBeAttached({ timeout: 8000 })
        const style = await buffer.getAttribute('style')
        expect(style).toMatch(/width:\s*70%/)
    })
})

test.describe('OrigamMediaScrubber — Tooltip', () => {
    test('renders the formatter output on hover', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="media-scrubber-design-horizontal"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        const box = await host.boundingBox()
        if (!box) throw new Error('Scrubber not measurable')
        await page.mouse.move(box.x + box.width * 0.5, box.y + box.height / 2)
        await page.waitForTimeout(180)

        const tooltip = sandbox.locator('[data-cy="media-scrubber-design-horizontal"] .origam-media-scrubber__hover-tooltip').first()
        await expect(tooltip).toBeVisible()
        const text = (await tooltip.innerText()).trim()
        expect(/^\d{1,2}%$/.test(text) || /^\d{1,3}\s*%$/.test(text)).toBe(true)
    })
})

test.describe('OrigamMediaScrubber — disabled flag', () => {
    test('drops tabindex to -1 when disabled', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)

        const disabledCheckbox = page.locator('label', { hasText: 'disabled' }).locator('input[type="checkbox"]').first()
        await disabledCheckbox.check({ force: true })
        await page.waitForTimeout(200)

        const host = sandbox.locator('[data-cy="media-scrubber-functional-host"]').first()
        await expect(host).toHaveAttribute('tabindex', '-1')
        await expect(host).toHaveAttribute('aria-disabled', 'true')
    })

    test('ignores keyboard ArrowRight when disabled', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="media-scrubber-functional-host"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        // Focus BEFORE disabling: the guard under test is the `if
        // (props.disabled) return` at the top of `onKeyDown`, and it is only
        // reachable when the key event actually lands on the host.
        await host.focus()

        const disabledCheckbox = page.locator('label', { hasText: 'disabled' }).locator('input[type="checkbox"]').first()
        await disabledCheckbox.check({ force: true })
        await page.waitForTimeout(200)

        await host.focus()
        const before = Number(await host.getAttribute('aria-valuenow'))
        await page.keyboard.press('ArrowRight')
        await page.waitForTimeout(120)
        const after = Number(await host.getAttribute('aria-valuenow'))
        expect(after).toBe(before)
    })
})
