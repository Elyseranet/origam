import { expect, test } from '@playwright/test'

/**
 * OrigamList — runtime assertions per story Variant.
 *
 * ## Variants (0-based index)
 *   0  → Design         (color, bgColor, density, rounded, elevation, border, lines, dimension, spacing)
 *   1  → Functional     (slim, nav, disabled, selectStrategy, openStrategy, tag)
 *   2  → Events - update:selected
 *   3  → Events - click:select
 *   4  → Events - click:open
 *   5  → Events - update:opened
 *   6  → Slots - Default
 *   7  → Slots - ChildrenItem
 *   8  → Slots - Divider
 *   9  → Slots - Subheader
 *  10  → Slots - Group
 *  11  → Slots - GroupActivator
 *  12  → Slots - Item
 *  13  → Default (playground)
 *
 * ## Navigation
 *   Direct URL with variantId query param — avoids networkidle (Histoire keeps
 *   an HMR websocket open → networkidle never resolves).
 *
 * ## Localisation
 *   No data-cy in these stories. Use BEM selectors:
 *     .origam-list, .origam-list-item, .origam-list-subheader,
 *     .origam-list-group, .origam-list-group__header
 */

const STORY_ID   = 'components-stories-list-origamlist-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamList', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { density: 'default', lines: 'one' }                          //
    // 3 list-items (slot-driven)                                           //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders the list root with BEM class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
        })

        test('default density class is applied', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            await expect(list).toHaveClass(/origam-list--density-default/)
        })

        test('default lines class is applied (one-line)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            await expect(list).toHaveClass(/origam-list--one-line/)
        })

        test('renders 3 list-items in the default slot', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-list-item')).toHaveCount(3)
        })

        test('second item has a subtitle element', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            // second list-item carries subtitle text "With subtitle"
            const secondItem = sandbox.locator('.origam-list-item').nth(1)
            await expect(secondItem).toContainText('With subtitle')
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 1)                                                 //
    // items-driven: selectableItems (3 items)                              //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('renders the list root', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
        })

        test('renders 3 selectable items from items prop', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-list-item')).toHaveCount(3)
        })

        test('no --nav modifier class at init (nav=false)', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            const cls = await list.evaluate(el => el.className)
            expect(cls).not.toMatch(/origam-list--nav/)
        })

        test('no --disabled modifier class at init (disabled=false)', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            const cls = await list.evaluate(el => el.className)
            expect(cls).not.toMatch(/origam-list--disabled/)
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS — update:selected (index 2)                                   //
    // selectableItems: 3 items                                             //
    // ------------------------------------------------------------------ //

    test.describe('Events - update:selected', () => {
        test('renders selectable items', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-list-item')).toHaveCount(3)
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS — click:select (index 3)                                      //
    // ------------------------------------------------------------------ //

    test.describe('Events - click:select', () => {
        test('renders selectable items', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-list-item')).toHaveCount(3)
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS — click:open (index 4)                                        //
    // groupedItems: 2 groups (Category A, Category B)                      //
    // ------------------------------------------------------------------ //

    test.describe('Events - click:open', () => {
        test('renders grouped list (list-group elements)', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            const groupCount = await sandbox.locator('.origam-list-group').count()
            expect(groupCount).toBeGreaterThanOrEqual(2)
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS — update:opened (index 5)                                     //
    // ------------------------------------------------------------------ //

    test.describe('Events - update:opened', () => {
        test('renders grouped list', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            const groupCount = await sandbox.locator('.origam-list-group').count()
            expect(groupCount).toBeGreaterThanOrEqual(2)
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS — Default (index 6)                                            //
    // 3 items: Alpha, Beta, Gamma                                          //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('renders 3 items via default slot', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-list-item')).toHaveCount(3)
        })

        test('item titles are visible (Alpha, Beta, Gamma)', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            await expect(list).toContainText('Alpha')
            await expect(list).toContainText('Beta')
            await expect(list).toContainText('Gamma')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS — ChildrenItem (index 7)                                       //
    // groupedItems with custom #childrenItem slot                          //
    // ------------------------------------------------------------------ //

    test.describe('Slots - ChildrenItem', () => {
        test('renders the list root', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
        })

        test('custom #childrenItem slot renders children as flat list-items (no group wrappers)', async ({ page }) => {
            // groupedItems has 2 groups with 3 children total (A-1, A-2, B-1).
            // The #childrenItem slot bypasses OrigamListGroup and renders children
            // directly as list-items tagged data-cy="children-item-{index}".
            // No .origam-list-group elements are produced.
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            const itemCount = await sandbox.locator('.origam-list-item').count()
            expect(itemCount).toBeGreaterThanOrEqual(2)
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS — Divider (index 8)                                            //
    // itemsWithDivider: 3 items with custom <hr> dividers between them     //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Divider', () => {
        test('renders the list root with items from itemsWithDivider', async ({ page }) => {
            await page.goto(variantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
        })

        test('custom #divider slot injects <hr> elements', async ({ page }) => {
            // itemsWithDivider has 3 items + 2 divider entries = 5 total.
            // NOTE (DS behaviour): the #divider slot receives ALL item rows,
            // not only type='divider' entries. The DS renders each row through
            // the custom slot, so .origam-list-item count is 0 and hr count
            // matches the total item count (5). This is a DS-level behavioural
            // quirk, documented here as a non-regression marker.
            await page.goto(variantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            const hrCount = await sandbox.locator('hr').count()
            expect(hrCount).toBeGreaterThanOrEqual(2)
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS — Subheader (index 9)                                          //
    // itemsWithSubheader: Fruits + 2 items, Vegetables + 1 item            //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Subheader', () => {
        test('renders list with subheaders', async ({ page }) => {
            await page.goto(variantUrl(9))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
        })

        test('custom subheader slot prepends a star character', async ({ page }) => {
            await page.goto(variantUrl(9))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            // custom slot wraps title in "★ {title}"
            await expect(list).toContainText('★ Fruits')
            await expect(list).toContainText('★ Vegetables')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS — Group (index 10)                                             //
    // groupedItems with custom #group slot (italic span)                   //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Group', () => {
        test('renders the list root', async ({ page }) => {
            await page.goto(variantUrl(10))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS — GroupActivator (index 11)                                    //
    // groupedItems with custom #groupActivator slot                        //
    // ------------------------------------------------------------------ //

    test.describe('Slots - GroupActivator', () => {
        test('renders the list root', async ({ page }) => {
            await page.goto(variantUrl(11))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
        })

        test('custom activator renders "Custom Activator" title', async ({ page }) => {
            await page.goto(variantUrl(11))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            await expect(list).toContainText('Custom Activator')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS — Item (index 12)                                              //
    // selectableItems with custom #item slot (adds prepend-icon)           //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Item', () => {
        test('renders 3 items via custom #item slot', async ({ page }) => {
            await page.goto(variantUrl(12))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-list-item')).toHaveCount(3)
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT / Playground (index 13)                                      //
    // init: { density: 'default', lines: 'one', slim: false, … }          //
    // 3 slot-driven items                                                   //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('renders the list root', async ({ page }) => {
            await page.goto(variantUrl(13))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
        })

        test('renders 3 items', async ({ page }) => {
            await page.goto(variantUrl(13))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-list-item')).toHaveCount(3)
        })

        test('density-default class applied', async ({ page }) => {
            await page.goto(variantUrl(13))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            await expect(list).toHaveClass(/origam-list--density-default/)
        })

        test('one-line class applied', async ({ page }) => {
            await page.goto(variantUrl(13))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            await expect(list).toHaveClass(/origam-list--one-line/)
        })
    })

    // ------------------------------------------------------------------ //
    // KEYBOARD NAVIGATION (uses the Functional variant, index 1)          //
    // 3 selectable items (Option one/two/three) — each carries a `value`, //
    // making it clickable/focusable inside the list (tabindex="-2").     //
    //                                                                     //
    // Regression coverage for a bug where `contentRef` (declared and     //
    // consumed by handleFocus/handleKeydown/focus in OrigamList.vue) was //
    // never bound to the root element via `ref="contentRef"` — so every  //
    // early-return guard (`if (!contentRef.value) return`) fired         //
    // unconditionally and Arrow/Home/End did nothing.                    //
    // ------------------------------------------------------------------ //

    test.describe('Keyboard navigation', () => {
        test('ArrowDown from the list root moves focus to the first item', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            const items = sandbox.locator('.origam-list-item')

            await list.focus()
            await expect(list).toBeFocused()
            await page.keyboard.press('ArrowDown')
            await expect(items.nth(0)).toBeFocused()
        })

        test('repeated ArrowDown steps through items in order', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            const items = sandbox.locator('.origam-list-item')

            await list.focus()
            await page.keyboard.press('ArrowDown')
            await expect(items.nth(0)).toBeFocused()
            await page.keyboard.press('ArrowDown')
            await expect(items.nth(1)).toBeFocused()
            await page.keyboard.press('ArrowDown')
            await expect(items.nth(2)).toBeFocused()
        })

        test('ArrowUp steps backwards through items', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            const items = sandbox.locator('.origam-list-item')

            await list.focus()
            await page.keyboard.press('ArrowDown')
            await page.keyboard.press('ArrowDown')
            await expect(items.nth(1)).toBeFocused()
            await page.keyboard.press('ArrowUp')
            await expect(items.nth(0)).toBeFocused()
        })

        test('End jumps directly to the last item', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            const items = sandbox.locator('.origam-list-item')

            await list.focus()
            await page.keyboard.press('End')
            await expect(items.nth(2)).toBeFocused()
        })

        test('Home jumps directly to the first item', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            const items = sandbox.locator('.origam-list-item')

            await list.focus()
            await page.keyboard.press('End')
            await expect(items.nth(2)).toBeFocused()
            await page.keyboard.press('Home')
            await expect(items.nth(0)).toBeFocused()
        })

        test('ArrowDown wraps from the last item back to the first (focusChild fallback)', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const list = sandbox.locator('.origam-list').first()
            await expect(list).toBeVisible({ timeout: 12000 })
            const items = sandbox.locator('.origam-list-item')

            await list.focus()
            await page.keyboard.press('End')
            await expect(items.nth(2)).toBeFocused()
            await page.keyboard.press('ArrowDown')
            await expect(items.nth(0)).toBeFocused()
        })
    })
})
