import { expect, test } from '@playwright/test'
const sandboxOf = (page) => page.frameLocator('iframe[src*="__sandbox"]')
const open = async (page, path, variant) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

test('Alert: default has 0 border on every side', async ({ page }) => {
    await open(page, '/stories/story/components-stories-alert-origamalert-story-vue', 'Default')
    const sandbox = sandboxOf(page)
    // The Alert story never carries a `data-cy="alert-playground"` hook —
    // alert.spec.ts (the real, migrated, green suite) always targets the
    // component by its `.origam-alert` root class. Wave-2 (405d506d)
    // switched this spec to a data-cy selector that was only meant to be
    // added to the story alongside it, but the story edit never landed —
    // so this locator has never matched anything on any engine since.
    const alert = sandbox.locator('.origam-alert').first()
    await expect(alert).toBeVisible({ timeout: 10000 })
    const w = await alert.evaluate(el => {
        const cs = getComputedStyle(el)
        return [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].map(parseFloat)
    })
    console.log('[alert default border widths]:', w)
    for (const px of w) expect(px).toBe(0)
})

test('Sheet: default has a 1px thin border on every side (origam baseline theme)', async ({ page }) => {
    // The Default variant leaves `border: undefined`, so `withDefaults()`
    // never sets it — but `createOrigam()` (used unconditionally by every
    // consumer, including this Histoire sandbox) always layers the
    // root-scoped `origam` baseline theme (ADR-004/005,
    // packages/ds/src/themes/origam.theme.ts) on top, which sets
    // 'origam-sheet': { border: true, borderColor: '...' }. That theme
    // block is resolved onto every instance's props by the global props
    // resolver, so it wins over the component's own (unset) default for
    // any app built with `createOrigam()` — the actual, current default
    // Sheet border is 1px (`--origam-border__width---thin`) on every side,
    // not 0. See CLAUDE.md ADR-005 ("How theme.components props actually
    // resolve") — the same mechanism verified against OrigamChip in
    // chip-design.spec.ts.
    await open(page, '/stories/story/components-stories-sheet-origamsheet-story-vue', 'Default')
    const sandbox = sandboxOf(page)
    const sheet = sandbox.locator('.origam-sheet').first()
    await expect(sheet).toBeVisible({ timeout: 10000 })
    const w = await sheet.evaluate(el => {
        const cs = getComputedStyle(el)
        return [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].map(parseFloat)
    })
    console.log('[sheet default border widths]:', w)
    for (const px of w) expect(px).toBe(1)
})
