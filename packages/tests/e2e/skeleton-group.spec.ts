import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * OrigamSkeletonGroup — e2e spec (#1073 lot 1)
 *
 * ## Variants (index 0-based, `grep -E '<Variant' OrigamSkeletonGroup.story.vue`)
 *
 *   0 → Design        card-like assembly of the primitives, pulse
 *   1 → Functional    circle + 2 lines, label key
 *   2 → Slots - Default
 *   3 → Default (playground)
 *
 * What a group guarantees, measured in a real browser: ONE announcement for
 * the zone, blocks out of the accessibility tree, one animation clock.
 */

const STORY_ID   = 'components-stories-skeleton-origamskeletongroup-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

const READY = 12000

const open = async (page: Page, idx: number, reducedMotion: 'reduce' | 'no-preference' = 'no-preference') => {
    await page.emulateMedia({ reducedMotion })
    await page.goto(variantUrl(idx), { waitUntil: 'domcontentloaded' })
    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    await expect(sandbox.locator('.origam-skeleton-group').first()).toBeVisible({ timeout: READY })
    return sandbox
}

test.describe('OrigamSkeletonGroup', () => {
    test.setTimeout(60000)

    test.describe('Design', () => {
        test('the group is the ONE live region of the zone', async ({ page }) => {
            const sandbox = await open(page, 0)

            await expect(sandbox.locator('[role="status"]')).toHaveCount(1)
            const group = sandbox.locator('[data-cy="skeleton-group-card"]')
            expect(await group.getAttribute('role')).toBe('status')
            expect(await group.getAttribute('aria-busy')).toBe('true')
            expect(await group.getAttribute('aria-label')).toBe('Loading...')
        })

        test('every block is aria-hidden and carries no role or label', async ({ page }) => {
            const sandbox = await open(page, 0)
            const blocks = await sandbox.locator('.origam-skeleton').evaluateAll((els) => els.map((e) => ({
                hidden: e.getAttribute('aria-hidden'),
                role: e.getAttribute('role'),
                label: e.getAttribute('aria-label'),
                busy: e.getAttribute('aria-busy')
            })))

            expect(blocks).toHaveLength(5)
            blocks.forEach((b) => {
                expect(b.hidden).toBe('true')
                expect(b.role).toBeNull()
                expect(b.label).toBeNull()
                expect(b.busy).toBeNull()
            })
        })

        test('one animation clock: the container pulses, a single animation for 5 blocks', async ({ page }) => {
            const sandbox = await open(page, 0)
            const m = await sandbox.locator('[data-cy="skeleton-group-card"]').evaluate((g) => {
                const all = g.ownerDocument.getAnimations().filter((a) => /skeleton/.test((a as CSSAnimation).animationName ?? ''))

                return {
                    count: all.length,
                    target: (all[0].effect as KeyframeEffect).target === g,
                    iterations: all[0].effect!.getComputedTiming().iterations,
                    duration: all[0].effect!.getComputedTiming().duration
                }
            })

            expect(m.count).toBe(1)
            expect(m.target).toBe(true)
            expect(m.duration).toBe(1600)
            expect(Number.isFinite(m.iterations as number)).toBe(true)
        })

        test('REDUCED MOTION: the group does not animate (#1074)', async ({ page }) => {
            const sandbox = await open(page, 0, 'reduce')
            const count = await sandbox.locator('[data-cy="skeleton-group-card"]')
                .evaluate((g) => g.ownerDocument.getAnimations().length)

            expect(count).toBe(0)
        })

        test('the circle of a group is a true circle', async ({ page }) => {
            const sandbox = await open(page, 1)
            const m = await sandbox.locator('.origam-skeleton--circular').evaluate((e) => {
                const box = e.getBoundingClientRect()

                return { w: box.width, h: box.height, r: parseFloat(getComputedStyle(e).borderTopLeftRadius) }
            })

            expect(m.h).toBe(m.w)
            expect(m.r).toBeGreaterThanOrEqual(m.w / 2)
        })
    })

    test.describe('Functional', () => {
        test('the label is a locale key resolved once, on the group', async ({ page }) => {
            const sandbox = await open(page, 1)

            await expect(sandbox.locator('[role="status"]')).toHaveCount(1)
            expect(await sandbox.locator('[data-cy="skeleton-group-announce"]').getAttribute('aria-label')).toBe('Loading...')
        })
    })

    test.describe('Slots - Default', () => {
        test('renders the blocks it is given, inside the group', async ({ page }) => {
            const sandbox = await open(page, 2)

            await expect(sandbox.locator('[data-cy="skeleton-group-slot"] .origam-skeleton')).toHaveCount(2)
        })
    })

    test.describe('Default playground', () => {
        test('renders a pulsing group of two text bars', async ({ page }) => {
            const sandbox = await open(page, 3)

            await expect(sandbox.locator('.origam-skeleton')).toHaveCount(2)
            await expect(sandbox.locator('[role="status"]')).toHaveCount(1)
        })
    })
})
