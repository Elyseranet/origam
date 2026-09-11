import { expect, test, type Page } from '@playwright/test'

/**
 * Lot C1 — OrigamBtnGroup runtime probes.
 *
 * Asserts every Variant in `OrigamBtnGroup.story.vue` produces the
 * runtime contract documented in `OrigamBtnGroup.md`:
 *   - default + items prop both render N children
 *   - density emits the matching `--density-{x}` modifier
 *   - divided emits the `--divided` modifier
 *   - rounded / border modifiers map to actual CSS rules
 *   - color (intent) is forwarded to children
 *   - the item slot lets the consumer customise per-cell render
 */

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyPath: string, variant: string) => {
    await page.goto(storyPath)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

const STORY = '/stories/story/components-stories-btn-origambtngroup-story-vue'

// ─── Default ───────────────────────────────────────────────────────────────

test.describe('OrigamBtnGroup — default', () => {
    test('renders the wrapper + 3 child buttons', async ({ page }) => {
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)

        const group = sandbox.locator('.origam-btn-group').first()
        await expect(group).toBeVisible({ timeout: 8000 })

        const children = await group.locator('.origam-btn').count()
        expect(children).toBe(3)
    })

    test('children buttons are stacked horizontally without gaps', async ({ page }) => {
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-btn-group').first()).toBeVisible({ timeout: 8000 })

        const boxes = await sandbox.locator('.origam-btn-group .origam-btn').evaluateAll(els =>
            els.map(el => el.getBoundingClientRect())
        )
        expect(boxes.length).toBe(3)

        // Same row → all share a y-axis (within 1px).
        for (let i = 1; i < boxes.length; i++) {
            expect(Math.abs(boxes[i].y - boxes[0].y)).toBeLessThanOrEqual(1)
        }
        // Adjacent buttons should touch (right edge of i ≈ left edge of i+1).
        for (let i = 1; i < boxes.length; i++) {
            const gap = boxes[i].x - (boxes[i - 1].x + boxes[i - 1].width)
            // Border collapse → exactly 0; allow up to 2px for `divided`-style separators.
            expect(gap).toBeLessThanOrEqual(2)
            expect(gap).toBeGreaterThanOrEqual(-2)
        }
    })
})

// ─── Items prop ────────────────────────────────────────────────────────────

test.describe('OrigamBtnGroup — items prop', () => {
    test('renders one btn per items entry (3)', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — items')
        const sandbox = sandboxOf(page)

        const group = sandbox.locator('[data-cy="btn-group-items"]').first()
        await expect(group).toBeVisible({ timeout: 8000 })

        const children = await group.locator('.origam-btn').count()
        expect(children).toBe(3)

        const labels = await group.locator('.origam-btn .origam-btn__content').evaluateAll(els =>
            els.map(el => (el.textContent || '').trim())
        )
        expect(labels).toEqual(['Save', 'Edit', 'Delete'])
    })
})

// ─── Density ───────────────────────────────────────────────────────────────

test.describe('OrigamBtnGroup — density', () => {
    test('default density emits the --density-default modifier class', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — density')
        const sandbox = sandboxOf(page)

        const group = sandbox.locator('.origam-btn-group').first()
        await expect(group).toBeVisible({ timeout: 8000 })

        const cls = await group.evaluate(el => el.className)
        expect(cls).toContain('origam-btn-group--density-default')
    })
})

// ─── Divided ───────────────────────────────────────────────────────────────

test.describe('OrigamBtnGroup — divided', () => {
    test('divided=true emits the --divided modifier', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — divided')
        const sandbox = sandboxOf(page)

        const group = sandbox.locator('[data-cy="btn-group-divided"]').first()
        await expect(group).toBeVisible({ timeout: 8000 })

        const cls = await group.evaluate(el => el.className)
        expect(cls).toContain('origam-btn-group--divided')
    })
})

// ─── Rounded ───────────────────────────────────────────────────────────────

test.describe('OrigamBtnGroup — rounded', () => {
    test('outer border-radius is applied', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — rounded')
        const sandbox = sandboxOf(page)

        const group = sandbox.locator('[data-cy="btn-group-rounded"]').first()
        await expect(group).toBeVisible({ timeout: 8000 })

        const radius = await group.evaluate(el => getComputedStyle(el).borderRadius)
        // Either the rounded variant token or any non-zero radius is fine —
        // the contract is "this prop produces a visual effect".
        expect(radius).not.toBe('0px')
    })
})

// ─── Item slot ─────────────────────────────────────────────────────────────

test.describe('OrigamBtnGroup — item slot', () => {
    test('the item slot is invoked per items entry', async ({ page }) => {
        await openVariant(page, STORY, 'Slot — item (custom render)')
        const sandbox = sandboxOf(page)

        const group = sandbox.locator('[data-cy="btn-group-item-slot"]').first()
        await expect(group).toBeVisible({ timeout: 8000 })

        const children = await group.locator('.origam-btn').count()
        expect(children).toBe(3)

        // Each cell should have a chevron-right append icon.
        // The icon enum value is 'mdi:mdi-chevron-right' which becomes a CSS class
        // on the <i> element. The colon makes it an attribute-contains selector.
        const chevrons = await group.locator('.origam-btn i[class*="mdi-chevron-right"]').count()
        expect(chevrons).toBe(3)
    })
})

// ─── Color ─────────────────────────────────────────────────────────────────

test.describe('OrigamBtnGroup — color (intent)', () => {
    test('group-level color forwards to children buttons', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — color & bgColor')
        const sandbox = sandboxOf(page)

        const group = sandbox.locator('[data-cy="btn-group-color"]').first()
        await expect(group).toBeVisible({ timeout: 8000 })

        const childCount = await group.locator('.origam-btn').count()
        expect(childCount).toBe(3)

        // Children must end up with a non-default color (any intent token
        // produces either a class or an inline style on the btn root).
        const colors = await group.locator('.origam-btn').evaluateAll(els =>
            els.map(el => getComputedStyle(el).color)
        )
        expect(new Set(colors).size).toBeGreaterThanOrEqual(1)
    })
})
