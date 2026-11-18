// #1173 — owner's feedback on the playground layout, measured in a REAL
// browser against the standalone host (`playwright.playground.config.ts`).
//
// What this pins, on the rendered geometry rather than on classes:
//
//   1. The catalog drawer PUSHES the content: once open, it sits beside the
//      preview, never on top of it, and the preview narrows to make room.
//   2. Responsive: at 390 / 768 / 1024 / 1440 px nothing overflows the page
//      horizontally, and the top bar's buttons stay inside the playground.
//      Below 760 px of PLAYGROUND width (a container query, not a viewport
//      one — the playground is embeddable) the inspector stacks under the
//      preview instead of crushing it.
//   3. The inspector carries no counter.
//   4. "Select in preview" only exists with more than one instance.
//
// A/B: on the parent (`6fe38c700`) the drawer is an overlay covering the
// preview, the layout never stacks, the counters are there and the toggle is
// always shown — every test below fails.

import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const openComponent = async (page: Page, name: string) => {
    await page.goto('/')
    await page.locator('[data-cy="playground-catalog-open"]').click()
    await page.locator(`[data-cy="playground-drawer-item-${name}"]`).click()
    await expect(page.locator('[data-cy="playground-preview-instance"]').first()).toBeVisible()
}

const box = (page: Page, selector: string) => page.locator(selector).first().evaluate(element => {
    const rect = element.getBoundingClientRect()

    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width }
})

test.describe('playground — layout (#1173)', () => {
    test('the catalog drawer pushes the preview instead of covering it', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 })
        await openComponent(page, 'OrigamBtn')

        const closed = await box(page, '.pg-preview')

        await page.locator('[data-cy="playground-catalog-open"]').click()
        await expect(page.locator('[data-cy="playground-drawer"]')).toBeVisible()

        const drawer = await box(page, '[data-cy="playground-drawer"]')
        const open = await box(page, '.pg-preview')

        expect(drawer.right).toBeLessThanOrEqual(open.left + 1)
        expect(open.width).toBeLessThan(closed.width)

        await page.keyboard.press('Escape')
        await expect(page.locator('[data-cy="playground-drawer"]')).toBeHidden()
        expect((await box(page, '.pg-preview')).width).toBeCloseTo(closed.width, 0)
    })

    for (const width of [390, 768, 1024, 1440]) {
        test(`${width} px: no horizontal overflow, the top bar stays inside`, async ({ page }) => {
            await page.setViewportSize({ width, height: 900 })
            await openComponent(page, 'OrigamTabs')

            const result = await page.evaluate(() => {
                const root = document.querySelector('[data-cy="playground-root"]') as HTMLElement
                const rect = root.getBoundingClientRect()
                const outside = [...root.querySelectorAll<HTMLElement>('.pg-topbar *')]
                    .filter(element => {
                        const own = element.getBoundingClientRect()

                        return own.width > 0 && (own.right > rect.right + 1 || own.left < rect.left - 1)
                    }).length

                return { scrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth, outside }
            })

            expect(result).toEqual({ scrollX: 0, outside: 0 })
        })
    }

    test('below 760 px of playground width the inspector stacks under the preview', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 900 })
        await openComponent(page, 'OrigamBtn')

        const preview = await box(page, '.pg-preview')
        const inspector = await box(page, '[data-cy="playground-inspector-slot"]')

        expect(inspector.top).toBeGreaterThanOrEqual(preview.bottom - 1)
        expect(Math.abs(inspector.width - preview.width)).toBeLessThanOrEqual(1)
    })

    test('at 1440 px the inspector stays beside the preview', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 })
        await openComponent(page, 'OrigamBtn')

        const preview = await box(page, '.pg-preview')
        const inspector = await box(page, '[data-cy="playground-inspector-slot"]')

        expect(inspector.right).toBeLessThanOrEqual(preview.left + 1)
    })
})

test.describe('playground — inspector and toggle (#1173)', () => {
    test('the inspector shows no counter, the search and the groups stay', async ({ page }) => {
        await openComponent(page, 'OrigamBtn')

        const inspector = page.locator('[data-cy="playground-inspector"]')

        await expect(page.locator('[data-cy="playground-prop-search"]')).toBeVisible()
        await expect(inspector.locator('details').first()).toBeVisible()
        await expect(page.locator('[data-cy="playground-prop-tally"]')).toHaveCount(0)
        await expect(inspector).not.toContainText(/\d+ props · \d+ groups|\d+ at rest/)
        await expect(inspector.locator('.pg-inspector__chip', { hasText: /^\s*\d+ (props|emits)\s*$/ })).toHaveCount(0)
        await expect(inspector.locator('.pg-inspector__group > summary').first()).toHaveText(/^\s*\D+\s*$/)
    })

    test('"Select in preview" only with more than one instance', async ({ page }) => {
        await openComponent(page, 'OrigamBtn')
        await expect(page.locator('[data-cy="playground-select-mode-toggle"]')).toHaveCount(0)

        await page.locator('[data-cy="playground-catalog-open"]').click()
        await page.locator('[data-cy="playground-drawer-item-OrigamTabs"]').click()
        await expect(page.locator('[data-cy="playground-select-mode-toggle"]')).toBeVisible()
    })

    test('the standalone playground keeps its title and its catalog', async ({ page }) => {
        await openComponent(page, 'OrigamBtn')

        await expect(page.locator('[data-cy="playground-title"]')).toBeVisible()
        await expect(page.locator('[data-cy="playground-catalog-open"]')).toBeVisible()
        await expect(page.locator('[data-cy="playground-scene-tree"]')).toBeVisible()
    })
})
