import { expect, test } from '@playwright/test'

/**
 * OrigamSelectionControlGroup — layout regression coverage.
 *
 * Story URL: /stories/story/components-stories-selectioncontrol-origamselectioncontrolgroup-story-vue
 *
 * Regression coverage for a bug where `.origam-selection-control-group`
 * shipped zero `<style>` block (confirmed absent since the file's very
 * first commit — never a refactor regression, an unfinished
 * implementation). The `inline` prop toggled the
 * `origam-selection-control-group--inline` class (OrigamSelectionControlGroup.vue)
 * but no SCSS rule ever consumed either that class or the already-generated
 * `--origam-selection-control-group---*` tokens (`_light.scss` /
 * `_dark.scss`), so the group never actually laid out its children — the
 * `inline` prop was a no-op and the group had no explicit direction/gap.
 *
 * These assertions are layout-based (bounding boxes / computed flex
 * properties), not class-based — the class was already correctly toggled
 * before the fix, only the visual effect was missing.
 */

const STORY_ID = 'components-stories-selectioncontrol-origamselectioncontrolgroup-story-vue'
const DESIGN_VARIANT_URL = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-0`

const sandboxOf = (page: import('@playwright/test').Page) => page.frameLocator('iframe[src*="__sandbox"]')

test.describe('OrigamSelectionControlGroup — layout', () => {
    test.setTimeout(30000)

    test('default (non-inline) group is an explicit column flex container', async ({ page }) => {
        await page.goto(DESIGN_VARIANT_URL)
        const sandbox = sandboxOf(page)
        const group = sandbox.locator('.origam-selection-control-group').first()
        await expect(group).toBeVisible({ timeout: 10000 })

        const styles = await group.evaluate(el => {
            const cs = getComputedStyle(el)
            return { display: cs.display, flexDirection: cs.flexDirection }
        })
        expect(styles.display).toBe('flex')
        expect(styles.flexDirection).toBe('column')
    })

    test('default (non-inline) items stack vertically (same x, increasing y)', async ({ page }) => {
        await page.goto(DESIGN_VARIANT_URL)
        const sandbox = sandboxOf(page)
        const group = sandbox.locator('.origam-selection-control-group').first()
        await expect(group).toBeVisible({ timeout: 10000 })

        const boxes = await sandbox.locator('.origam-selection-control-group > .origam-selection-control').evaluateAll(els =>
            els.map(el => el.getBoundingClientRect().toJSON())
        )
        expect(boxes.length).toBe(3)
        // Vertical stack: each item starts below the previous one, roughly same x.
        expect(boxes[1].y).toBeGreaterThan(boxes[0].y + boxes[0].height - 5)
        expect(boxes[2].y).toBeGreaterThan(boxes[1].y + boxes[1].height - 5)
        expect(Math.abs(boxes[1].x - boxes[0].x)).toBeLessThan(2)
    })

    test('inline=true switches the group to a row flex container', async ({ page }) => {
        await page.goto(DESIGN_VARIANT_URL)
        const sandbox = sandboxOf(page)
        const group = sandbox.locator('.origam-selection-control-group').first()
        await expect(group).toBeVisible({ timeout: 10000 })

        await page.getByRole('checkbox', { name: /inline/i }).first().click({ force: true })
        await page.waitForTimeout(400)

        await expect(group).toHaveClass(/origam-selection-control-group--inline/)
        const styles = await group.evaluate(el => {
            const cs = getComputedStyle(el)
            return { display: cs.display, flexDirection: cs.flexDirection }
        })
        expect(styles.display).toBe('flex')
        expect(styles.flexDirection).toBe('row')
    })

    test('inline=true lays out items side by side (same y, increasing x)', async ({ page }) => {
        await page.goto(DESIGN_VARIANT_URL)
        const sandbox = sandboxOf(page)
        const group = sandbox.locator('.origam-selection-control-group').first()
        await expect(group).toBeVisible({ timeout: 10000 })

        await page.getByRole('checkbox', { name: /inline/i }).first().click({ force: true })
        await page.waitForTimeout(400)

        const boxes = await sandbox.locator('.origam-selection-control-group > .origam-selection-control').evaluateAll(els =>
            els.map(el => el.getBoundingClientRect().toJSON())
        )
        expect(boxes.length).toBe(3)
        // Horizontal row: items share (roughly) the same y, x strictly increases.
        expect(Math.abs(boxes[1].y - boxes[0].y)).toBeLessThan(5)
        expect(Math.abs(boxes[2].y - boxes[0].y)).toBeLessThan(5)
        expect(boxes[1].x).toBeGreaterThan(boxes[0].x + boxes[0].width - 5)
        expect(boxes[2].x).toBeGreaterThan(boxes[1].x + boxes[1].width - 5)
    })

    test('gap token is applied between items (non-zero column-gap in the default variant)', async ({ page }) => {
        await page.goto(DESIGN_VARIANT_URL)
        const sandbox = sandboxOf(page)
        const group = sandbox.locator('.origam-selection-control-group').first()
        await expect(group).toBeVisible({ timeout: 10000 })

        const gap = await group.evaluate(el => getComputedStyle(el).rowGap)
        // Token default: --origam-selection-control-group---gap → var(--origam-space---2) (8px)
        expect(parseFloat(gap)).toBeGreaterThan(0)
    })
})
