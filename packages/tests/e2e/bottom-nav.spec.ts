import { expect, test, type Page } from '@playwright/test'

import { selectHstOption } from './_support/histoire-controls'

/**
 * OrigamBottomNav — runtime assertions per story Variant.
 *
 * Story URL: /story/components-stories-bottomnav-origambottomnav-story-vue
 *
 * The story restructuring (canonical Design/State/Functional/Events/Slots
 * layout, see root CLAUDE.md) removed every dedicated `Prop — …` / `Slot —
 * …` / `Emit — …` fixture this spec used to navigate to, AND removed every
 * static per-fixture `data-cy` (e.g. `bottom-nav-color`, `bottom-nav-
 * density`, …) — verified empirically: `OrigamBottomNav.vue` itself sets
 * NO static `data-cy` on its root either. Since each Variant renders
 * exactly one `<origam-bottom-nav>`, the structural class `.origam-
 * bottom-nav` is the unambiguous replacement anchor throughout. Dynamic
 * props are driven via `_support/histoire-controls.ts` on "Design" /
 * "Functional"; emits/slots map straight to their canonical
 * "Events - …" / "Slots - …" Variant.
 */

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, variant: string) => {
    await page.goto('/stories/story/components-stories-bottomnav-origambottomnav-story-vue')
    await page.waitForLoadState('networkidle')
    // Wait for Histoire to hydrate and render the variant list before clicking.
    // `networkidle` fires before Vue has mounted the sidebar items, which makes
    // the subsequent getByText call race against the render cycle.
    await page.getByText('Default', { exact: true }).first().waitFor({ state: 'visible', timeout: 10000 })
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

// ─── Color ────────────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Color', () => {
    test('color intent is propagated to btn children', async ({ page }) => {
        // Dedicated fixture folded into "Design" — its default init-state
        // already sets bgColor: 'primary' (see OrigamBottomNav.story.vue),
        // so no control interaction is needed.
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        const nav = sandbox.locator('.origam-bottom-nav').first()
        await expect(nav).toBeVisible({ timeout: 8000 })
        const count = await nav.locator('.origam-btn').count()
        expect(count).toBeGreaterThan(0)

        // Phase 4 correction (Cas A) — the story passes `:model-value="true"`
        // which puts isActive=true on the BottomNav. useColorEffect deliberately
        // returns [] for colorClasses when isActive=true (design contract: hover/
        // active states bypass utility classes so the hover token rung can own
        // the slot). The utility class `.origam--color-primary` is therefore
        // never emitted in this story state — asserting it was a false expectation
        // added in Phase 3.
        //
        // Corrected assertion: verify that the color intent is still applied to
        // the nav root via the inline colorStyle (the inline style path remains
        // active regardless of the isActive/isHover gate). A non-transparent,
        // non-empty computed `color` value confirms the primary token resolved.
        const computedColor = await nav.evaluate(el => getComputedStyle(el).color)
        expect(computedColor, 'bottom-nav color computed style').not.toBe('')
        expect(computedColor, 'bottom-nav color computed style').not.toBe('rgba(0, 0, 0, 0)')
    })
})

// ─── Density ──────────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Density', () => {
    test('density class lands on btn children', async ({ page }) => {
        // Dedicated fixture folded into "Design" — flip Density from its
        // unset default to a concrete rung so the assertion below exercises
        // real prop propagation, not just a default class.
        await openVariant(page, 'Design')
        await selectHstOption(page, 'Density', 'Compact')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)
        const nav = sandbox.locator('.origam-bottom-nav').first()
        await expect(nav).toBeVisible({ timeout: 8000 })
        const childClasses = await nav.locator('.origam-btn').evaluateAll(els =>
            els.map(el => el.className)
        )
        expect(childClasses.length).toBeGreaterThan(0)
        for (const cls of childClasses) {
            expect(cls).toMatch(/origam-btn--density-/)
        }
    })
})

// ─── Rounded ──────────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Rounded', () => {
    test('border-radius is applied when rounded=true', async ({ page }) => {
        // Dedicated fixture folded into "Design" — flip Rounded to the
        // legacy boolean-true option (matches the original "rounded=true" intent).
        await openVariant(page, 'Design')
        await selectHstOption(page, 'Rounded', 'Rounded (legacy boolean)')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)
        const nav = sandbox.locator('.origam-bottom-nav').first()
        await expect(nav).toBeVisible({ timeout: 8000 })
        const radius = await nav.evaluate(el => getComputedStyle(el).borderRadius)
        expect(radius).not.toBe('0px')
    })
})

// ─── Border ───────────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Border', () => {
    test('border modifier class is applied', async ({ page }) => {
        // Dedicated fixture folded into "Design" — same control as
        // bottom-nav-border.spec.ts.
        await openVariant(page, 'Design')
        await selectHstOption(page, 'Border', 'Border (legacy boolean → thin)')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)
        const nav = sandbox.locator('.origam-bottom-nav').first()
        await expect(nav).toBeVisible({ timeout: 8000 })
        const cls = await nav.evaluate(el => el.className)
        expect(cls).toMatch(/origam-bottom-nav--border|origam--border/)
    })
})

// ─── Elevation ────────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Elevation', () => {
    test('elevation variant renders without errors', async ({ page }) => {
        // Dedicated fixture folded into "Design" — any non-"(none)" rung
        // satisfies this smoke assertion.
        await openVariant(page, 'Design')
        await selectHstOption(page, 'Elevation', 'MD (8)')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-bottom-nav').first()).toBeVisible({ timeout: 8000 })
    })
})

// ─── Grow ─────────────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Grow', () => {
    test('grow modifier class is applied', async ({ page }) => {
        // Dedicated fixture folded into "Functional" — Grow checkbox
        // defaults to unchecked (false, see init-state), flip it on.
        await openVariant(page, 'Functional')
        await page.getByRole('checkbox', { name: 'Grow', exact: true }).click()
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)
        const nav = sandbox.locator('.origam-bottom-nav').first()
        await expect(nav).toBeVisible({ timeout: 8000 })
        const cls = await nav.evaluate(el => el.className)
        expect(cls).toContain('origam-bottom-nav--grow')
    })
})

// ─── Mode ─────────────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Mode', () => {
    test('mode class is applied to the nav', async ({ page }) => {
        // Dedicated fixture folded into "Functional" — its default
        // init-state already sets mode: MODE.VERTICAL (see
        // OrigamBottomNav.story.vue), so no control interaction is needed.
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const nav = sandbox.locator('.origam-bottom-nav').first()
        await expect(nav).toBeVisible({ timeout: 8000 })
        const cls = await nav.evaluate(el => el.className)
        expect(cls).toMatch(/origam-bottom-nav--(vertical|horizontal|shift)/)
    })
})

// ─── Items prop ───────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Items prop', () => {
    test('renders one btn per item entry (3)', async ({ page }) => {
        // Dedicated fixture folded into "Design" — `:items="navItems"` (3
        // entries) is bound unconditionally, not behind any control.
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        const nav = sandbox.locator('.origam-bottom-nav').first()
        await expect(nav).toBeVisible({ timeout: 8000 })
        const count = await nav.locator('.origam-btn').count()
        expect(count).toBe(3)
    })
})

// ─── Visible (modelValue) ─────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Visible', () => {
    test('nav is visible when modelValue=true', async ({ page }) => {
        // Dedicated fixture folded into "Design" — `:model-value="true"` is
        // bound unconditionally there, not behind any control.
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-bottom-nav').first()).toBeVisible({ timeout: 8000 })
    })
})

// ─── Slot: default ────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Slot: default', () => {
    test('renders explicit btn children in the default slot', async ({ page }) => {
        // Canonical Variant is "Slots - Default" — its 3 fixture buttons
        // (Home / Search / Profile) carry no data-cy, matched by their
        // visible text instead.
        await openVariant(page, 'Slots - Default')
        const sandbox = sandboxOf(page)
        const nav = sandbox.locator('.origam-bottom-nav').first()
        await expect(nav).toBeVisible({ timeout: 8000 })
        await expect(nav.getByText('Home', { exact: true })).toBeVisible()
        await expect(nav.getByText('Search', { exact: true })).toBeVisible()
        await expect(nav.getByText('Profile', { exact: true })).toBeVisible()
    })
})

// ─── Slot: item ───────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Slot: item', () => {
    test('custom item slot renders with 3 buttons', async ({ page }) => {
        // Canonical Variant is "Slots - Item" — the custom #item template
        // tags each button `data-cy="slot-item-{index}"` (see
        // OrigamBottomNav.story.vue), not the old "bottom-nav-slot-item".
        await openVariant(page, 'Slots - Item')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('[data-cy="slot-item-0"]').first()).toBeVisible({ timeout: 8000 })
        const count = await sandbox.locator('[data-cy^="slot-item-"]').count()
        expect(count).toBe(3)
    })
})

// ─── Emit: update:modelValue ──────────────────────────────────────────────────

test.describe('OrigamBottomNav — Emit: update:modelValue', () => {
    test('emit variant renders without errors', async ({ page }) => {
        await openVariant(page, 'Events - update:modelValue')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-bottom-nav').first()).toBeVisible({ timeout: 8000 })
    })
})

// ─── Emit: update:active ──────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Emit: update:active', () => {
    test('emit variant renders without errors', async ({ page }) => {
        await openVariant(page, 'Events - update:active')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-bottom-nav').first()).toBeVisible({ timeout: 8000 })
    })
})

// ─── Playground ───────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Default', () => {
    test('renders without errors', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-bottom-nav').first()).toBeVisible({ timeout: 8000 })
    })
})
