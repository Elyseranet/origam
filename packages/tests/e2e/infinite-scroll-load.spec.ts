import { expect, test, type Page } from '@playwright/test'

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const open = async (page: Page, variant: string) => {
    await page.goto('/stories/story/components-stories-infinitescroll-origaminfinitescroll-story-vue')
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    const sandbox = sandboxOf(page)
    await expect(sandbox.locator('.origam-infinite-scroll').first()).toBeVisible({ timeout: 8000 })
}

const countItems = async (page: Page) => {
    const sandbox = sandboxOf(page)
    return await sandbox.locator('.origam-infinite-scroll > div').evaluateAll(els =>
        els.filter(e => /Item \d+/.test(e.textContent || '')).length
    )
}

/**
 * Pre-fix `hasEndIntersect` was `props.side === 'end' || 'both'` — the
 * raw string `'both'` made the OR always truthy, but separately the
 * empty/error slots gated on `hasStartIntersect` even on the END
 * side, masking the issue. The user reported the lazy load didn't
 * fire on scroll. Fixing the boolean expression restored the
 * intersect-driven load path.
 *
 * DS BUG STATUS UPDATE (2026-08, re-verified during title-drift repair):
 * `OrigamInfiniteScrollIntersect` still calls `useIntersectionObserver`
 * without passing `root: props.rootRef` (verified by reading
 * OrigamInfiniteScrollIntersect.vue — `rootRef` is a declared prop that is
 * never referenced in the file). The code-level gap the previous fixme
 * describes is real. However, re-tested against the current "Design"
 * Variant (5 runs, incl. 3 in parallel, all green): the test PASSES for
 * real. Per MDN, an IntersectionObserver's target is clipped by ALL
 * ancestor scroll containers regardless of the configured `root` — once
 * the sentinel scrolls into the container's visible area it stops being
 * clipped and correctly intersects the default (viewport) root, so a
 * `root: rootRef` isn't actually required for this scenario to work.
 * Un-fixme'd; kept the missing-`root`-option observation since it may
 * still matter for scenarios this specific fixture doesn't exercise
 * (e.g. the scroll container itself only partially overlapping the
 * viewport) — worth a follow-up ticket, not a currently-reproducing bug.
 */

test('OrigamInfiniteScroll — scroll-to-bottom triggers load (intersect mode)', async ({ page }) => {
    test.setTimeout(60_000)
    // Story realignment: the old dedicated "Basic — end side" Variant is
    // gone — "Design" hardcodes side="end" mode="intersect" with the same
    // 20-item fixture and load-more-up-to-60 behaviour, so it's a faithful
    // re-target (not a control-driven equivalent — side/mode aren't exposed
    // as controls on this Variant at all).
    await open(page, 'Design')
    const initial = await countItems(page)
    expect(initial).toBe(20)

    await sandboxOf(page).locator('.origam-infinite-scroll').first().evaluate(el => {
        (el as HTMLElement).scrollTo({ top: (el as HTMLElement).scrollHeight, behavior: 'instant' as any })
    })
    await page.waitForTimeout(2500)

    const after = await countItems(page)
    expect(after).toBeGreaterThan(initial)
})
