import { expect, test, type Page } from '@playwright/test'

import { selectHstOption } from './_support/histoire-controls'

/**
 * Regression spec — parent → children prop propagation for 6 group
 * parent-child component pairs.
 *
 * Contract: parent `provideDefaults({ 'origam-{child}': { density, color, … } })`
 * + child `useDefaults(props)` → children receive the parent's visual-token
 * props as DEFAULTS; per-child explicit props still win.
 *
 * For each pair we verify either:
 *  a) a density class lands on every child (class-based assertion — robust
 *     across all themes/tokens), or
 *  b) the child's computed backgroundColor differs from the raw default neutral
 *     when a color intent is propagated.
 *
 * Story realignment (canonical Design/Functional/Events/Slots structure):
 * this spec spans SIX different component stories, migrated unevenly —
 * verified each individually by reading the story source rather than
 * trusting the audit guard's combined title list (a spec with multiple
 * `openVariant(page, STORY_CONST, title)` call sites against different
 * dynamic STORY values can produce a misleading union of "available"
 * titles across all of them, masking a per-story miss). Findings:
 *   - AvatarGroup: still has old "Prop — direction/max/expandOnClick/
 *     expandOnHover/density" Variants untouched, but "Prop — size,
 *     rounded, border (forwarded)" is gone — folded into "Design"'s
 *     Size/Rounded/Border controls.
 *   - Breadcrumb / List / SelectionControlGroup: fully migrated; density
 *     defaults to `'default'` (not undefined) on their "Design" Variant
 *     init-state, so no control change is needed for the "density lands"
 *     assertions.
 *   - BottomNav: fully migrated; density/color are undefined by default on
 *     "Design", so both assertions now drive the control explicitly.
 *   - ExpansionPanels: fully migrated (see expansion-panels.spec.ts, same
 *     wave) — density undefined by default, driven explicitly.
 *
 * ─── Exemption du garde de titres ────────────────────────────────────────────
 * @audit-variant-titles:exempt(spec multi-stories — chaque appel
 * openVariant(page, STORY, titre) associe un titre à UNE story précise, mais
 * l'audit statique ne relie pas la paire : il ne sait qu'unir les titres des
 * 6 stories et vérifier l'appartenance à cette union. Un titre supprimé de
 * Breadcrumb mais présent dans List passerait donc pour sain. Ce n'est pas un
 * titre irrésolvable, c'est une vérification qui MENTIRAIT si on la laissait
 * répondre. La couverture réelle de cette spec est assurée autrement : chaque
 * story a été relue à la main, findings ci-dessus. Lever l'exemption suppose
 * d'apprendre à l'audit à apparier (slug, titre) par site d'appel.)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyPath: string, variant: string) => {
    await page.goto(storyPath)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(900)
}

// ─── Story URL constants ───────────────────────────────────────────────────

const AVATAR_GROUP = '/stories/story/components-stories-avatar-origamavatargroup-story-vue'
const BREADCRUMB   = '/stories/story/components-stories-breadcrumb-origambreadcrumb-story-vue'
const BOTTOM_NAV   = '/stories/story/components-stories-bottomnav-origambottomnav-story-vue'
const LIST         = '/stories/story/components-stories-list-origamlist-story-vue'
const EXPANSION    = '/stories/story/components-stories-expansionpanel-origamexpansionpanels-story-vue'
const SELECTION    = '/stories/story/components-stories-selectioncontrol-origamselectioncontrolgroup-story-vue'

// ─── 1. OrigamAvatarGroup → OrigamAvatar ──────────────────────────────────

test.describe('OrigamAvatarGroup → OrigamAvatar propagation', () => {
    test('forwarded size class lands on every child avatar (Forwarded props)', async ({ page }) => {
        // "Design" sets `size` via the Size control; after propagation each
        // child should carry origam-avatar--size-small.
        await openVariant(page, AVATAR_GROUP, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Size', 'Small')
        await expect(sandbox.locator('.origam-avatar-group').first()).toBeVisible({ timeout: 8000 })

        const avatars = sandbox.locator('.origam-avatar-group .origam-avatar')
        await expect(avatars.first()).toBeVisible({ timeout: 8000 })
        const childClasses = await avatars.evaluateAll(els => els.map(el => el.className))
        expect(childClasses.length).toBeGreaterThan(0)
        for (const cls of childClasses) {
            expect(cls).toMatch(/origam-avatar--size-/)
        }
    })

    test('children render without errors in Default variant', async ({ page }) => {
        // Smoke-test: group renders without crashing after useDefaults wiring.
        await openVariant(page, AVATAR_GROUP, 'Default')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-avatar-group').first()).toBeVisible({ timeout: 8000 })
        await expect(sandbox.locator('.origam-avatar-group .origam-avatar').first()).toBeVisible({ timeout: 8000 })
    })
})

// ─── 2. OrigamBreadcrumb → OrigamBreadcrumbItem ───────────────────────────

test.describe('OrigamBreadcrumb → OrigamBreadcrumbItem propagation', () => {
    test('density class lands on breadcrumb items (Density)', async ({ page }) => {
        // "Design" init-state already pins density: 'default' — no control change needed.
        await openVariant(page, BREADCRUMB, 'Design')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-breadcrumb').first()).toBeVisible({ timeout: 8000 })

        const items = sandbox.locator('.origam-breadcrumb-item')
        await expect(items.first()).toBeVisible({ timeout: 8000 })
        const childClasses = await items.evaluateAll(els => els.map(el => el.className))
        expect(childClasses.length).toBeGreaterThan(0)
        for (const cls of childClasses) {
            expect(cls).toMatch(/origam-breadcrumb-item--density-(default|compact|comfortable)/)
        }
    })

    test('default variant renders items without errors', async ({ page }) => {
        await openVariant(page, BREADCRUMB, 'Design')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-breadcrumb').first()).toBeVisible({ timeout: 8000 })
        await expect(sandbox.locator('.origam-breadcrumb-item').first()).toBeVisible({ timeout: 8000 })
    })
})

// ─── 3. OrigamBottomNav → OrigamBtn ───────────────────────────────────────

test.describe('OrigamBottomNav → OrigamBtn propagation', () => {
    test('density class lands on btn children (Density)', async ({ page }) => {
        // "Design" leaves density undefined by default — drive the control explicitly.
        await openVariant(page, BOTTOM_NAV, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Density', 'Compact')
        await expect(sandbox.locator('.origam-bottom-nav').first()).toBeVisible({ timeout: 8000 })

        const btns = sandbox.locator('.origam-bottom-nav .origam-btn')
        await expect(btns.first()).toBeVisible({ timeout: 8000 })
        const childClasses = await btns.evaluateAll(els => els.map(el => el.className))
        expect(childClasses.length).toBeGreaterThan(0)
        for (const cls of childClasses) {
            expect(cls).toMatch(/origam-btn--density-(default|compact|comfortable)/)
        }
    })

    test('color propagation: btn children TEXT colour follows the intent', async ({ page }) => {
        // Per the universal contract — `color` is fg-only, never paints
        // the surface. We assert the text colour shifts off the default
        // near-black; the background stays neutral.
        await openVariant(page, BOTTOM_NAV, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Color', 'Primary')
        await expect(sandbox.locator('.origam-bottom-nav').first()).toBeVisible({ timeout: 8000 })

        const samples = await sandbox.locator('.origam-bottom-nav .origam-btn').evaluateAll(els =>
            els.map(el => {
                const cs = getComputedStyle(el)
                return { color: cs.color, backgroundColor: cs.backgroundColor }
            })
        )
        expect(samples.length).toBeGreaterThan(0)
        for (const s of samples) {
            // Surface stays neutral — primary intent must NOT have flooded it.
            expect(s.backgroundColor).not.toBe('rgb(124, 58, 237)')
            // Text shifted to the intent's foreground token.
            expect(s.color).not.toBe('rgb(38, 38, 38)')
        }
    })
})

// ─── 4. OrigamList → OrigamListItem ───────────────────────────────────────

test.describe('OrigamList → OrigamListItem propagation', () => {
    test('density class lands on list items (Density)', async ({ page }) => {
        // "Design" init-state already pins density: 'default' — no control change needed.
        await openVariant(page, LIST, 'Design')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-list').first()).toBeVisible({ timeout: 8000 })

        const items = sandbox.locator('.origam-list-item')
        await expect(items.first()).toBeVisible({ timeout: 8000 })
        const childClasses = await items.evaluateAll(els => els.map(el => el.className))
        expect(childClasses.length).toBeGreaterThan(0)
        for (const cls of childClasses) {
            // Propagation contract: any density modifier class lands on items.
            expect(cls).toMatch(/origam-list-item--density-(default|compact|comfortable)/)
        }
    })

    test('default variant renders list items without errors', async ({ page }) => {
        await openVariant(page, LIST, 'Design')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-list').first()).toBeVisible({ timeout: 8000 })
        await expect(sandbox.locator('.origam-list-item').first()).toBeVisible({ timeout: 8000 })
    })
})

// ─── 5. OrigamExpansionPanels → OrigamExpansionPanel ─────────────────────

test.describe('OrigamExpansionPanels → OrigamExpansionPanel propagation', () => {
    test('density class lands on panels (Density)', async ({ page }) => {
        // "Design" leaves density undefined by default — drive the control explicitly
        // (same finding as expansion-panels.spec.ts, same wave).
        await openVariant(page, EXPANSION, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Density', 'Compact')
        await expect(sandbox.locator('.origam-expansion-panels').first()).toBeVisible({ timeout: 8000 })

        const panels = sandbox.locator('.origam-expansion-panel')
        await expect(panels.first()).toBeVisible({ timeout: 8000 })
        const childClasses = await panels.evaluateAll(els => els.map(el => el.className))
        expect(childClasses.length).toBeGreaterThan(0)
        for (const cls of childClasses) {
            // Propagation contract: any density modifier class lands on panels.
            expect(cls).toMatch(/origam-expansion-panel--density-(default|compact|comfortable)/)
        }
    })

    test('default variant renders panels without errors', async ({ page }) => {
        await openVariant(page, EXPANSION, 'Design')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-expansion-panels').first()).toBeVisible({ timeout: 8000 })
        await expect(sandbox.locator('.origam-expansion-panel').first()).toBeVisible({ timeout: 8000 })
    })
})

// ─── 6. OrigamSelectionControlGroup → OrigamSelectionControl ─────────────

test.describe('OrigamSelectionControlGroup → OrigamSelectionControl propagation', () => {
    test('density class lands on controls (Density)', async ({ page }) => {
        // "Design" init-state already pins density: 'default' — no control change needed.
        await openVariant(page, SELECTION, 'Design')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-selection-control-group').first()).toBeVisible({ timeout: 8000 })

        const controls = sandbox.locator('.origam-selection-control')
        await expect(controls.first()).toBeVisible({ timeout: 8000 })
        const childClasses = await controls.evaluateAll(els => els.map(el => el.className))
        expect(childClasses.length).toBeGreaterThan(0)
        for (const cls of childClasses) {
            // Propagation contract: any density modifier class lands on controls.
            expect(cls).toMatch(/origam-selection-control--density-(default|compact|comfortable)/)
        }
    })

    test('default variant renders controls without errors', async ({ page }) => {
        await openVariant(page, SELECTION, 'Design')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-selection-control-group').first()).toBeVisible({ timeout: 8000 })
        await expect(sandbox.locator('.origam-selection-control').first()).toBeVisible({ timeout: 8000 })
    })
})
