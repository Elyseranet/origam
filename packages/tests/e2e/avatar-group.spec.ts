import { expect, test } from '@playwright/test'

/**
 * RECIPE — Pattern canonique origam / Histoire (réf. avatar.spec.ts)
 *
 * STORY_ID = 'components-stories-avatar-origamavatargroup-story-vue'
 *
 * Index → Titre (ordre dans le fichier story, OrigamAvatarGroup.story.vue)
 *   0  → Design (max=4, 7 people → a "+N" `__rest` overflow chip is rendered)
 *   1  → State (bgColor=primary, hover→bgColor success, active→bgColor danger)
 *   2  → Functional (max, expandOnHover, expandOnClick, tag)
 *   3  → Events - update:active (expand-on-click, max=3)
 *   4  → Events - update:hover (expand-on-hover, max=3)
 *   5  → Slots - Default
 *   6  → Slots - Avatar
 *   7  → Slots - Rest
 *   8  → Prop — direction
 *   9  → Prop — max
 *  10  → Prop — expandOnClick
 *  11  → Prop — expandOnHover
 *  12  → Prop — density
 *  13  → Default (playground)
 *
 * ⚠️  JAMAIS waitForLoadState('networkidle') : Histoire garde un websocket HMR
 * ouvert → networkidle ne résout JAMAIS → timeout garanti.
 *
 * Scope (variant 0 only): the DS-level, theme-agnostic structural ring
 * introduced for #263 (`--origam-avatar-group__item---outline-*`). The
 * theme-specific border-preservation regression (glass/cartoon/geek) is
 * covered separately in `home-showcase.spec.ts` (marketing e2e), since
 * Histoire only ships the neutral DS baseline theme.
 *
 * Coverage note: before this file only asserted variant 0 — 13 of the 14
 * Variants had zero e2e coverage (classeur C6, gravité majeur). The tests
 * below close that gap.
 */

const STORY_ID   = 'components-stories-avatar-origamavatargroup-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamAvatarGroup — separation ring (#263)', () => {
    test.setTimeout(60000)

    test('every `__item` AND the `__rest` overflow chip carry the outline-based separation ring', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        const items = sandbox.locator('.origam-avatar-group__item')
        await expect(items.first()).toBeVisible({ timeout: 20000 })
        const itemCount = await items.count()
        expect(itemCount).toBeGreaterThan(0)

        for (let i = 0; i < itemCount; i++) {
            const style = await items.nth(i).evaluate((el) => {
                const cs = getComputedStyle(el)
                return { outlineWidth: cs.outlineWidth, outlineStyle: cs.outlineStyle }
            })
            expect(style.outlineWidth, `item[${i}] outlineWidth`).toBe('2px')
            expect(style.outlineStyle, `item[${i}] outlineStyle`).toBe('solid')
        }

        const rest = sandbox.locator('.origam-avatar-group__rest')
        await expect(rest).toBeVisible()
        const restStyle = await rest.evaluate((el) => {
            const cs = getComputedStyle(el)
            return { outlineWidth: cs.outlineWidth, outlineStyle: cs.outlineStyle }
        })
        expect(restStyle.outlineWidth).toBe('2px')
        expect(restStyle.outlineStyle).toBe('solid')
    })

    // ------------------------------------------------------------------ //
    // STATE (index 1)                                                     //
    // init: { bgColor: 'primary', hover: 'bgColor → success' }            //
    // ------------------------------------------------------------------ //

    test('State — resting bgColor=primary on items, hovering the group forwards bgColor=success', async ({ page }) => {
        await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const group = sandbox.locator('.origam-avatar-group').first()
        await expect(group).toBeVisible({ timeout: 20000 })

        const firstAvatar = sandbox.locator('.origam-avatar').first()
        const restingBg = await firstAvatar.evaluate((el) => getComputedStyle(el).backgroundColor)
        expect(restingBg).not.toBe('rgba(0, 0, 0, 0)')

        await group.hover()
        await expect(group).toHaveClass(/origam-avatar-group--hover/)

        // Config-object hover state ({ bgColor: 'success' }) is forwarded to
        // every child avatar with `enabled: true` — the group hovering
        // forces each avatar's OWN hover surface on, which paints inline
        // (classes-first convention: state-dependent styling stays inline).
        const hoveredBg = await firstAvatar.evaluate((el) => getComputedStyle(el).backgroundColor)
        expect(hoveredBg).not.toBe(restingBg)
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 2)                                                 //
    // init: { max: 4, expandOnHover: false, expandOnClick: false }        //
    // ------------------------------------------------------------------ //

    test('Functional — max=4 caps display, "+N" rest chip present, no expand classes by default', async ({ page }) => {
        await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const group = sandbox.locator('.origam-avatar-group').first()
        await expect(group).toBeVisible({ timeout: 20000 })

        await expect(group).not.toHaveClass(/origam-avatar-group--expand-on-hover/)
        await expect(group).not.toHaveClass(/origam-avatar-group--expand-on-click/)

        // 7 people, max=4 → 3 displayed items + 1 "+N" rest chip = 4 origam-avatar elements
        await expect(sandbox.locator('.origam-avatar')).toHaveCount(4)
        await expect(sandbox.locator('.origam-avatar-group__rest')).toContainText('+4')
    })

    // ------------------------------------------------------------------ //
    // EVENTS - update:active (index 3)                                    //
    // init: max=3, expand-on-click                                        //
    // ------------------------------------------------------------------ //

    test('Events - update:active — clicking toggles --active class and expands the group', async ({ page }) => {
        await page.goto(variantUrl(3), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const group = sandbox.locator('.origam-avatar-group').first()
        await expect(group).toBeVisible({ timeout: 20000 })

        await expect(group).not.toHaveClass(/origam-avatar-group--active/)
        const collapsedCount = await sandbox.locator('.origam-avatar').count()

        await group.click()
        await expect(group).toHaveClass(/origam-avatar-group--active/)

        // expand-on-click reveals every item (effectiveMax = items.length = 7)
        const expandedCount = await sandbox.locator('.origam-avatar').count()
        expect(expandedCount).toBeGreaterThan(collapsedCount)
    })

    // ------------------------------------------------------------------ //
    // EVENTS - update:hover (index 4)                                     //
    // init: max=3, expand-on-hover                                        //
    // ------------------------------------------------------------------ //

    test('Events - update:hover — hovering toggles --hover class and expands the group', async ({ page }) => {
        await page.goto(variantUrl(4), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const group = sandbox.locator('.origam-avatar-group').first()
        await expect(group).toBeVisible({ timeout: 20000 })

        await expect(group).not.toHaveClass(/origam-avatar-group--hover/)
        const collapsedCount = await sandbox.locator('.origam-avatar').count()

        await group.hover()
        await expect(group).toHaveClass(/origam-avatar-group--hover/)

        const expandedCount = await sandbox.locator('.origam-avatar').count()
        expect(expandedCount).toBeGreaterThan(collapsedCount)

        await page.mouse.move(0, 0)
        await expect(group).not.toHaveClass(/origam-avatar-group--hover/)
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Default (index 5)                                            //
    // ------------------------------------------------------------------ //

    test('Slots - Default — custom content renders inside the "+N" rest chip', async ({ page }) => {
        await page.goto(variantUrl(5), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const group = sandbox.locator('.origam-avatar-group').first()
        await expect(group).toBeVisible({ timeout: 20000 })

        await expect(group).toContainText('Custom slot content')
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Avatar (index 6)                                             //
    // ------------------------------------------------------------------ //

    test('Slots - Avatar — every item is rendered via the custom #avatar slot (alternating bgColor)', async ({ page }) => {
        await page.goto(variantUrl(6), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const items = sandbox.locator('.origam-avatar-group__item')
        await expect(items.first()).toBeVisible({ timeout: 20000 })

        await expect(items.first()).toHaveClass(/origam--bg-primary/)
        await expect(items.nth(1)).toHaveClass(/origam--bg-secondary/)
        await expect(items.first().locator('.origam-avatar__text')).toContainText('AP')
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Rest (index 7)                                               //
    // ------------------------------------------------------------------ //

    test('Slots - Rest — overflow chip is rendered via the custom #rest slot with bg-color=info', async ({ page }) => {
        await page.goto(variantUrl(7), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const rest = sandbox.locator('.origam-avatar-group__rest')
        await expect(rest).toBeVisible({ timeout: 20000 })

        await expect(rest).toHaveClass(/origam--bg-info/)
        // max=3, 7 people → 5 overflow into the rest chip's custom "+{length}" label
        await expect(rest).toContainText('+5')
    })

    // ------------------------------------------------------------------ //
    // PROP — direction (index 8)                                          //
    // init: { direction: 'horizontal' }                                   //
    // ------------------------------------------------------------------ //

    test('Prop — direction — horizontal by default, flex-direction row', async ({ page }) => {
        await page.goto(variantUrl(8), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const group = sandbox.locator('.origam-avatar-group').first()
        await expect(group).toBeVisible({ timeout: 20000 })

        await expect(group).toHaveClass(/origam-avatar-group--horizontal/)
        const flexDirection = await group.evaluate((el) => getComputedStyle(el).flexDirection)
        expect(flexDirection).toBe('row')
    })

    // ------------------------------------------------------------------ //
    // PROP — max (index 9)                                                //
    // init: { max: 3 }                                                    //
    // ------------------------------------------------------------------ //

    test('Prop — max — caps displayed items and folds the remainder into "+N"', async ({ page }) => {
        await page.goto(variantUrl(9), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const rest = sandbox.locator('.origam-avatar-group__rest')
        await expect(rest).toBeVisible({ timeout: 20000 })

        // 7 people, max=3 → 2 displayed items + 1 rest chip = 3 origam-avatar elements
        await expect(sandbox.locator('.origam-avatar')).toHaveCount(3)
        await expect(rest).toContainText('+5')
    })

    // ------------------------------------------------------------------ //
    // PROP — expandOnClick (index 10)                                     //
    // ------------------------------------------------------------------ //

    test('Prop — expandOnClick — root is keyboard-focusable and Enter expands the group (a11y)', async ({ page }) => {
        await page.goto(variantUrl(10), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const group = sandbox.locator('.origam-avatar-group').first()
        await expect(group).toBeVisible({ timeout: 20000 })

        await expect(group).toHaveClass(/origam-avatar-group--expand-on-click/)
        await expect(group).toHaveAttribute('tabindex', '0')
        await expect(group).toHaveAttribute('aria-expanded', 'false')

        await group.focus()
        await page.keyboard.press('Enter')
        await expect(group).toHaveAttribute('aria-expanded', 'true')
        await expect(group).toHaveClass(/origam-avatar-group--active/)

        await page.keyboard.press('Space')
        await expect(group).toHaveAttribute('aria-expanded', 'false')
    })

    // ------------------------------------------------------------------ //
    // PROP — expandOnHover (index 11)                                     //
    // ------------------------------------------------------------------ //

    test('Prop — expandOnHover — hovering reveals every item, leaving collapses back', async ({ page }) => {
        await page.goto(variantUrl(11), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const group = sandbox.locator('.origam-avatar-group').first()
        await expect(group).toBeVisible({ timeout: 20000 })

        await expect(group).toHaveClass(/origam-avatar-group--expand-on-hover/)
        // 7 people, max=4 → 3 items + rest chip collapsed
        await expect(sandbox.locator('.origam-avatar')).toHaveCount(4)

        await group.hover()
        await expect(sandbox.locator('.origam-avatar')).toHaveCount(7)

        await page.mouse.move(0, 0)
        await expect(sandbox.locator('.origam-avatar')).toHaveCount(4)
    })

    // ------------------------------------------------------------------ //
    // PROP — density (index 12)                                           //
    // init: { density: undefined }                                        //
    // ------------------------------------------------------------------ //

    test('Prop — density — undefined emits no modifier class (useDensity contract), overlap falls back to -18px', async ({ page }) => {
        await page.goto(variantUrl(12), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const group = sandbox.locator('.origam-avatar-group').first()
        await expect(group).toBeVisible({ timeout: 20000 })

        // useDensity emits a class only for a value in PREDEFINED_DENSITY —
        // `density: undefined` (this Variant's init-state) emits NONE, by
        // design (see density.composable.ts). The overlap margin still
        // resolves via the calc()'s own `var(--…, 0px)` fallback.
        await expect(group).not.toHaveClass(/--density-/)

        const items = sandbox.locator('.origam-avatar-group__item')
        const marginInlineStart = await items.nth(1).evaluate((el) => getComputedStyle(el).marginInlineStart)
        expect(marginInlineStart).toBe('-18px')
    })

    // ------------------------------------------------------------------ //
    // DEFAULT / PLAYGROUND (index 13)                                     //
    // init: { max: 4, direction: 'horizontal', bgColor: 'primary' }       //
    // ------------------------------------------------------------------ //

    test('Default (playground) — renders with bgColor=primary forwarded to items, max=4 caps the stack', async ({ page }) => {
        await page.goto(variantUrl(13), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const group = sandbox.locator('.origam-avatar-group').first()
        await expect(group).toBeVisible({ timeout: 20000 })

        await expect(group).toHaveClass(/origam-avatar-group--horizontal/)
        await expect(sandbox.locator('.origam-avatar')).toHaveCount(4)

        const firstAvatar = sandbox.locator('.origam-avatar').first()
        await expect(firstAvatar).toHaveClass(/origam--bg-primary/)
    })
})
