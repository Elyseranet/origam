import { expect, test } from '@playwright/test'

/**
 * Lot B3 — Window / Slide / VirtualScroll runtime probes.
 *
 * Consolidated spec for the 5 components. Tests target dedicated
 * Variant titles (not the HstSelect picker) and assert a single
 * runtime property per test to keep things robust against story
 * shell changes.
 */

const sandboxOf = (page: import('@playwright/test').Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: import('@playwright/test').Page, storyPath: string, variant: string) => {
    await page.goto(storyPath)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(900)
}

// ─── OrigamWindow ──────────────────────────────────────────────────────────

const WINDOW_PATH = '/stories/story/components-stories-window-origamwindow-story-vue'

test.describe('OrigamWindow', () => {

    test('default — host renders the window root', async ({ page }) => {
        await openVariant(page, WINDOW_PATH, 'Default')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-window').first()).toBeVisible({ timeout: 8000 })
    })

    test('continuous variant mounts without throwing', async ({ page }) => {
        const errors: string[] = []
        page.on('pageerror', err => errors.push(err.message))
        await openVariant(page, WINDOW_PATH, 'Continuous')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-window').first()).toBeVisible({ timeout: 8000 })
        expect(errors).toEqual([])
    })

    test('show arrows variant mounts the window root', async ({ page }) => {
        await openVariant(page, WINDOW_PATH, 'Show arrows')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-window').first()).toBeVisible({ timeout: 8000 })
    })
})

// ─── OrigamWindowItem ──────────────────────────────────────────────────────

const WINDOW_ITEM_PATH = '/stories/story/components-stories-window-origamwindowitem-story-vue'

test.describe('OrigamWindowItem', () => {

    test('default — item renders inside its parent window', async ({ page }) => {
        await openVariant(page, WINDOW_ITEM_PATH, 'Default')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-window').first()).toBeVisible({ timeout: 8000 })
    })

    test('disabled variant mounts without throwing', async ({ page }) => {
        const errors: string[] = []
        page.on('pageerror', err => errors.push(err.message))
        await openVariant(page, WINDOW_ITEM_PATH, 'Disabled')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-window').first()).toBeVisible({ timeout: 8000 })
        expect(errors).toEqual([])
    })
})

// ─── OrigamSlideGroup ──────────────────────────────────────────────────────

const SLIDE_GROUP_PATH = '/stories/story/components-stories-slide-origamslidegroup-story-vue'

test.describe('OrigamSlideGroup', () => {

    test('default — group renders with a horizontally-scrollable container', async ({ page }) => {
        await openVariant(page, SLIDE_GROUP_PATH, 'Default')
        const sandbox = sandboxOf(page)
        const group = sandbox.locator('.origam-slide-group').first()
        await expect(group).toBeVisible({ timeout: 8000 })

        // Container must allow horizontal scroll (auto or scroll).
        const container = sandbox.locator('.origam-slide-group__container').first()
        await expect(container).toBeAttached()
        const overflow = await container.evaluate(el => getComputedStyle(el).overflowX)
        expect(['auto', 'scroll']).toContain(overflow)
    })

    test('horizontal variant: scrollLeft can shift on scroll-overflow', async ({ page }) => {
        await openVariant(page, SLIDE_GROUP_PATH, 'Default')
        const sandbox = sandboxOf(page)
        const container = sandbox.locator('.origam-slide-group__container').first()
        await expect(container).toBeAttached({ timeout: 8000 })

        const result = await container.evaluate((el) => {
            const max = (el as HTMLElement).scrollWidth - (el as HTMLElement).clientWidth
            const initial = (el as HTMLElement).scrollLeft
            ;(el as HTMLElement).scrollLeft = max
            return { initial, after: (el as HTMLElement).scrollLeft, max }
        })
        if (result.max > 0) {
            expect(result.after).toBeGreaterThan(result.initial)
        }
    })

    test('direction class swap toggles flex-direction', async ({ page }) => {
        await openVariant(page, SLIDE_GROUP_PATH, 'Default')
        const sandbox = sandboxOf(page)
        const group = sandbox.locator('.origam-slide-group').first()
        await expect(group).toBeVisible({ timeout: 8000 })

        const horizontal = await group.evaluate((el) => {
            el.classList.remove('origam-slide-group--vertical')
            el.classList.add('origam-slide-group--horizontal')
            return getComputedStyle(el).flexDirection
        })
        const vertical = await group.evaluate((el) => {
            el.classList.remove('origam-slide-group--horizontal')
            el.classList.add('origam-slide-group--vertical')
            return getComputedStyle(el).flexDirection
        })
        // The two flex-directions must differ.
        expect(horizontal).not.toBe(vertical)
    })
})

// ─── OrigamVirtualScroll ───────────────────────────────────────────────────

const VS_PATH = '/stories/story/components-stories-virtualscroll-origamvirtualscroll-story-vue'

test.describe('OrigamVirtualScroll', () => {

    test('default — only a small subset of items is mounted at once', async ({ page }) => {
        await openVariant(page, VS_PATH, 'Default')
        const sandbox = sandboxOf(page)
        const vs = sandbox.locator('.origam-virtual-scroll').first()
        await expect(vs).toBeVisible({ timeout: 8000 })

        const itemCount = await sandbox.locator('.origam-virtual-scroll__item').count()
        // The whole point of virtualization: never render more than ~100
        // items even if the source list is huge.
        expect(itemCount).toBeLessThan(100)
        expect(itemCount).toBeGreaterThan(0)
    })

    test('scroll position changes the rendered window', async ({ page }) => {
        await openVariant(page, VS_PATH, 'Default')
        const sandbox = sandboxOf(page)
        const vs = sandbox.locator('.origam-virtual-scroll').first()
        await expect(vs).toBeVisible({ timeout: 8000 })

        // The scrollable container is the root .origam-virtual-scroll
        // OR a child .origam-virtual-scroll__container — try both.
        const before = await sandbox.locator('.origam-virtual-scroll__item').evaluateAll(els =>
            els.map(el => (el.textContent || '').trim()).slice(0, 5).join('|')
        )

        // Find whichever element is the scroll viewport.
        await vs.evaluate((root) => {
            const candidates = [root, root.querySelector('.origam-virtual-scroll__container')]
                .filter(Boolean) as HTMLElement[]
            for (const el of candidates) {
                if (el.scrollHeight > el.clientHeight) {
                    el.scrollTop = el.scrollHeight - el.clientHeight
                }
            }
        })
        await page.waitForTimeout(500)

        const after = await sandbox.locator('.origam-virtual-scroll__item').evaluateAll(els =>
            els.map(el => (el.textContent || '').trim()).slice(0, 5).join('|')
        )
        console.log('[vs] before:', before)
        console.log('[vs] after: ', after)
        expect(after).not.toBe(before)
    })

    test('item height variant mounts without throwing', async ({ page }) => {
        const errors: string[] = []
        page.on('pageerror', err => errors.push(err.message))
        await openVariant(page, VS_PATH, 'Prop — itemHeight')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-virtual-scroll').first()).toBeVisible({ timeout: 8000 })
        expect(errors).toEqual([])
    })
})

// ─── OrigamVirtualScrollItem ───────────────────────────────────────────────

const VS_ITEM_PATH = '/stories/story/components-stories-virtualscroll-origamvirtualscrollitem-story-vue'

test.describe('OrigamVirtualScrollItem', () => {

    test('default — item renders inside the virtual-scroll host', async ({ page }) => {
        await openVariant(page, VS_ITEM_PATH, 'Default')
        const sandbox = sandboxOf(page)
        await expect(
            sandbox.locator('.origam-virtual-scroll-item, .origam-virtual-scroll__item').first()
        ).toBeVisible({ timeout: 8000 })
    })

    test('renderless variant mounts without throwing', async ({ page }) => {
        const errors: string[] = []
        page.on('pageerror', err => errors.push(err.message))
        await openVariant(page, VS_ITEM_PATH, 'Slot — renderless')
        // No assertion on a specific class — renderless = no wrapper.
        // Just confirm no runtime error.
        await page.waitForTimeout(500)
        expect(errors).toEqual([])
    })
})
