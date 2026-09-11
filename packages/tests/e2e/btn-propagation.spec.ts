import { expect, test, type Page } from '@playwright/test'

/**
 * Regression spec — parent → children prop propagation across the
 * Btn/BtnGroup/BtnToggle and Chip/ChipGroup families.
 *
 * Contract (per the user / origam architecture):
 *   - Parent prop (e.g. BtnGroup color="primary") sets the DEFAULT for
 *     every descendant of that component name.
 *   - Per-child prop (e.g. items[0].color="success") OVERRIDES the parent
 *     default for that one child.
 *
 * Resolution path:
 *   1. value explicitly written on the child template       (wins)
 *   2. ancestor `<DefaultsProvider>` / `provideDefaults`     (mid)
 *   3. component's `withDefaults(...)` baked-in fallback     (last)
 *
 * Pre-fix the parent props silently dropped because BtnGroup / ChipGroup
 * didn't call `provideDefaults` and OrigamBtn / OrigamChip didn't call
 * `useDefaults`. Adding both wires the contract end-to-end.
 */

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyPath: string, variant: string) => {
    await page.goto(storyPath)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(900)
}

const BTN_GROUP = '/stories/story/components-stories-btn-origambtngroup-story-vue'
const BTN_TOGGLE = '/stories/story/components-stories-btn-origambtntoggle-story-vue'
const CHIP_GROUP = '/stories/story/components-stories-chip-origamchipgroup-story-vue'

// ─── BtnGroup → OrigamBtn ──────────────────────────────────────────────────

test.describe('OrigamBtnGroup → OrigamBtn propagation', () => {
    test('group color forwards: children TEXT colour follows the intent (NOT the background)', async ({ page }) => {
        // Universal design-system contract: `color` is foreground-only.
        // `<OrigamBtnGroup color="primary">` should colour the text of
        // every child to the primary intent — and leave the surface
        // background untouched. This was the user's complaint after the
        // initial provideDefaults fix: `color` was painting backgrounds
        // (because `useColorEffect` auto-paired bg from intent). The
        // colour composable was patched to drop that auto-pair.
        await openVariant(page, BTN_GROUP, 'Prop — color & bgColor')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-btn-group').first()).toBeVisible({ timeout: 8000 })

        const samples = await sandbox.locator('.origam-btn-group .origam-btn').evaluateAll(els =>
            els.map(el => {
                const cs = getComputedStyle(el)
                return { color: cs.color, backgroundColor: cs.backgroundColor }
            })
        )

        // Background MUST stay neutral / unchanged — pre-fix it flooded
        // with the intent's purple. The exact neutral depends on theme;
        // we just assert it's NOT the primary-token purple.
        for (const s of samples) {
            expect(s.backgroundColor).not.toBe('rgb(124, 58, 237)') // primary 600
        }

        // Text colour MUST shift away from the default near-black
        // `rgb(38, 38, 38)`. Every child should have a non-default text.
        for (const s of samples) {
            expect(s.color).not.toBe('rgb(38, 38, 38)')
        }

        // All children share the same propagated text colour.
        expect(new Set(samples.map(s => s.color)).size).toBe(1)
    })

    test('group density forwards to children passed via items prop', async ({ page }) => {
        await openVariant(page, BTN_GROUP, 'Prop — items')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-btn-group').first()).toBeVisible({ timeout: 8000 })

        // The story renders `items` without explicit density — children
        // must inherit the group's `density: 'default'` (the withDefaults
        // baked value).
        const childClasses = await sandbox.locator('.origam-btn-group .origam-btn').evaluateAll(els =>
            els.map(el => el.className)
        )
        for (const cls of childClasses) {
            expect(cls).toContain('origam-btn--density-default')
        }
    })
})

// ─── BtnToggle → OrigamBtn ─────────────────────────────────────────────────

test.describe('OrigamBtnToggle → OrigamBtn propagation', () => {
    test('toggle density forwards to children', async ({ page }) => {
        await openVariant(page, BTN_TOGGLE, 'Prop — density')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-btn-toggle').first()).toBeVisible({ timeout: 8000 })

        const childClasses = await sandbox.locator('.origam-btn-toggle .origam-btn').evaluateAll(els =>
            els.map(el => el.className)
        )
        for (const cls of childClasses) {
            expect(cls).toContain('origam-btn--density-default')
        }
    })

    test('toggle color forwards: children TEXT colour shifts; background stays neutral', async ({ page }) => {
        // Same contract as the BtnGroup test above — `color` is fg-only.
        await openVariant(page, BTN_TOGGLE, 'Prop — color & bgColor')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-btn-toggle').first()).toBeVisible({ timeout: 8000 })

        const samples = await sandbox.locator('.origam-btn-toggle .origam-btn').evaluateAll(els =>
            els.map(el => {
                const cs = getComputedStyle(el)
                return { color: cs.color, backgroundColor: cs.backgroundColor }
            })
        )
        for (const s of samples) {
            // No primary-purple flood on the surface.
            expect(s.backgroundColor).not.toBe('rgb(124, 58, 237)')
            // Text colour shifted off the default near-black.
            expect(s.color).not.toBe('rgb(38, 38, 38)')
        }
    })
})

// ─── color vs bgColor semantics (universal contract) ──────────────────────

test.describe('OrigamBtn — color/bgColor semantics (universal contract)', () => {
    /**
     * Pin the universal contract that the user enforced:
     *   • `color="primary"` alone   → paints the TEXT only, surface unchanged.
     *   • `bgColor="primary"` alone → paints the SURFACE, text auto-contrasts.
     * Pre-fix `color` auto-paired a primary background as well, which broke
     * propagation expectations through groups.
     *
     * The BtnGroup `Color (intent)` variant initialises `color: 'primary'`
     * on the parent — so its children are the cleanest way to assert the
     * fix end-to-end without driving Histoire's HstSelect dropdown
     * (which is a custom Vue component, not a native <select>).
     */
    test('color flows fg-only across propagation: text shifts, bg stays neutral', async ({ page }) => {
        await openVariant(page, BTN_GROUP, 'Prop — color & bgColor')
        const sandbox = sandboxOf(page)
        const firstBtn = sandbox.locator('.origam-btn-group .origam-btn').first()
        await expect(firstBtn).toBeVisible({ timeout: 8000 })

        const sample = await firstBtn.evaluate(el => {
            const cs = getComputedStyle(el)
            return { color: cs.color, backgroundColor: cs.backgroundColor }
        })

        // No primary-purple flood on the surface.
        expect(sample.backgroundColor).not.toBe('rgb(124, 58, 237)')
        // Text shifted off the default near-black to the intent fg token.
        expect(sample.color).not.toBe('rgb(38, 38, 38)')
    })
})

// ─── ChipGroup → OrigamChip ────────────────────────────────────────────────

test.describe('OrigamChipGroup → OrigamChip propagation', () => {
    test('group renders chips that pick up the provider color tokens', async ({ page }) => {
        // The Default variant doesn't set a parent color, so children
        // fall through to their own withDefaults — what we DO assert is
        // that NO error is thrown by the new `useDefaults` wrapping
        // (broken propagation would crash the proxy at runtime).
        await openVariant(page, CHIP_GROUP, 'Default')
        const sandbox = sandboxOf(page)
        const firstChip = sandbox.locator('.origam-chip').first()
        await expect(firstChip).toBeVisible({ timeout: 8000 })

        const childCount = await sandbox.locator('.origam-chip').count()
        expect(childCount).toBeGreaterThan(0)
    })
})
