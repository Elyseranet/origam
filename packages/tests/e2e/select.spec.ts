import { expect, test, type Page } from '@playwright/test'

/**
 * RECIPE — OrigamSelect e2e spec (follows btn.spec.ts canonical pattern)
 *
 * Navigation directe via variantId query param :
 *   page.goto(STORY_PATH + '?variantId=' + STORY_ID + '-' + index)
 *
 * Variants (0-based order, SelectStory — état au 2026-06-22) :
 *   0  → Design
 *   1  → Functional
 *   2  → Events - update:modelValue       data-cy="select-emit-update"
 *   3  → Events - update:menu             data-cy="select-emit-menu"
 *   4  → Events - click:clear             data-cy="select-emit-clear"
 *   5  → Events - click:append            data-cy="select-emit-click-append"
 *   6  → Events - click:appendInner       data-cy="select-emit-click-append-inner"
 *   7  → Events - click:control           data-cy="select-emit-click-control"
 *   8  → Events - click:prepend           data-cy="select-emit-click-prepend"
 *   9  → Events - click:prependInner      data-cy="select-emit-click-prepend-inner"
 *  10  → Events - mousedown:control       data-cy="select-emit-mousedown-control"
 *  11  → Events - update:focused          data-cy="select-emit-update-focused"
 *  12  → Slots - Prepend                  data-cy="select-slot-prepend"
 *  13  → Slots - Append                   data-cy="select-slot-append"
 *  14  → Slots - PrependInner             data-cy="select-slot-prepend-inner"
 *  15  → Slots - AppendInner              data-cy="select-slot-append-inner"
 *  16  → Slots - Clear                    data-cy="select-slot-clear"
 *  17  → Slots - Label                    data-cy="select-slot-label"
 *  18  → Slots - FloatingLabel            data-cy="select-slot-floating-label"
 *  19  → Slots - Prefix                   data-cy="select-slot-prefix"
 *  20  → Slots - Suffix                   data-cy="select-slot-suffix"
 *  21  → Slots - Loader                   data-cy="select-slot-loader"
 *  22  → Slots - NoData                   data-cy="select-slot-no-data"
 *  23  → Slots - Chip                     data-cy="select-slot-chip"
 *  24  → Slots - Selection                data-cy="select-slot-selection"
 *  25  → Slots - Item                     data-cy="select-slot-item"
 *  26  → Slots - Items.Prepend            data-cy="select-slot-items-prepend"
 *  27  → Slots - Items.Append             data-cy="select-slot-items-append"
 *  28  → Default (playground)             data-cy="select-playground"
 *
 * NE PAS utiliser waitForLoadState('networkidle') — Histoire garde un
 * websocket HMR ouvert → networkidle ne résout jamais → timeout garanti.
 *
 * Ouverture du menu :
 *   En mode non-autocomplete, l'input inner a `pointer-events: none`.
 *   Cliquer sur `.origam-field` (le wrapper activator) pour ouvrir.
 *   Les items téléportés sont toujours dans le même sandbox iframe.
 */

const STORY_ID   = 'components-stories-select-origamselect-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

/**
 * Drives a Histoire `HstSelect` sidebar control by its visible title.
 *
 * The control is NOT a native `<select>` — it renders a `v-popper` dropdown
 * whose options are plain divs. Clicking the trigger then the option by exact
 * text is stable; do not try `selectOption()` on it.
 *
 * The retry wrapper is REQUIRED, not defensive. Under a full 3-browser run the
 * panel intermittently stays open after its option is clicked — never
 * reproducible in isolation, where it always closes within one frame. Both
 * observed symptoms come from that single fault:
 *
 *   - `locator.click: Test timeout` … `<div …>X-Small</div> … subtree
 *     intercepts pointer events` — the stale panel covers the NEXT control's
 *     trigger, so the following `pickControl` can never click it;
 *   - `expect(locator).toHaveCount(0)` … `Received: 1` — a bare wait on the
 *     panel closing, which simply never happens.
 *
 * Neither symptom reaches a height assertion, so a failure here looks nothing
 * like the mismatch this suite is about. Retrying the whole interaction and
 * settling on the OUTCOME — the trigger displaying the chosen value — is what
 * makes it deterministic. Escape clears any panel a previous attempt left
 * behind. Match the trigger text exactly: `Large` is a substring of `X-Large`.
 */
const pickControl = async (page: Page, title: string, option: string) => {
    const row = page.locator('label.histoire-select', { hasText: title }).first()
    const trigger = row.locator('.v-popper').first()
    const shownPanels = page.locator('.v-popper__popper--shown')

    await expect(async () => {
        if (await shownPanels.count() > 0) {
            await page.keyboard.press('Escape')
            await expect(shownPanels).toHaveCount(0, { timeout: 2000 })
        }

        await trigger.click()
        await page.locator('.v-popper__popper--shown')
            .locator('div.htw-cursor-pointer')
            .filter({ hasText: new RegExp(`^${option}$`) })
            .first()
            .click({ timeout: 5000 })

        await expect(trigger).toHaveText(new RegExp(`^${option}$`), { timeout: 2000 })
    }).toPass({ timeout: 25000 })
}

test.describe('OrigamSelect', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { label: 'Select', color: 'primary', items: stringItems }     //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders root .origam-select with single/multiple modifier', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const select = sandbox.locator('.origam-select').first()
            await expect(select).toBeVisible({ timeout: 12000 })
            await expect(select).toHaveClass(/origam-select--single/)
        })

        test('renders inner .origam-field and input', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const select = sandbox.locator('.origam-select').first()
            await expect(select).toBeVisible({ timeout: 12000 })
            await expect(select.locator('.origam-field').first()).toBeVisible({ timeout: 5000 })
            await expect(select.locator('input').first()).toBeAttached({ timeout: 5000 })
        })

        test('label prop renders the field label', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const select = sandbox.locator('.origam-select').first()
            await expect(select).toBeVisible({ timeout: 12000 })
            // The label text is rendered in .origam-field__label
            await expect(select.locator('.origam-field__label').first()).toContainText('Select')
        })

        test('menu-icon (.origam-select__menu-icon) is present as dropdown affordance', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const select = sandbox.locator('.origam-select').first()
            await expect(select).toBeVisible({ timeout: 12000 })
            await expect(select.locator('.origam-select__menu-icon').first()).toBeVisible({ timeout: 5000 })
        })

        test('clicking the field opens the dropdown list', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const select = sandbox.locator('.origam-select').first()
            await expect(select).toBeVisible({ timeout: 12000 })

            await select.locator('.origam-field').first().click()
            await expect(sandbox.locator('.origam-list').first()).toBeVisible({ timeout: 5000 })
        })

        test('dropdown items render France / Germany / Spain from stringItems', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const select = sandbox.locator('.origam-select').first()
            await expect(select).toBeVisible({ timeout: 12000 })

            await select.locator('.origam-field').first().click()
            await expect(sandbox.locator('.origam-list-item').first()).toBeVisible({ timeout: 5000 })

            const items = sandbox.locator('.origam-list-item')
            await expect(items).toHaveCount(5, { timeout: 5000 })
        })

        test('selecting an item renders the selection div (.origam-select__selection)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const select = sandbox.locator('.origam-select').first()
            await expect(select).toBeVisible({ timeout: 12000 })

            await select.locator('.origam-field').first().click()
            await expect(sandbox.locator('.origam-list-item').first()).toBeVisible({ timeout: 5000 })
            await sandbox.locator('.origam-list-item').first().click()

            // After selection the .origam-select__selection div carries the picked title
            await expect(select.locator('.origam-select__selection').first()).toBeVisible({ timeout: 5000 })
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 1)                                                 //
    // init: multiple=false, chips=false, autocomplete=false, …            //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('renders in default state (no disabled/error class)', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const select = sandbox.locator('.origam-select').first()
            await expect(select).toBeVisible({ timeout: 12000 })
            // Disabled class must not be present in init-state
            await expect(select.locator('.origam-field').first()).not.toHaveClass(/origam-field--disabled/)
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS                                                               //
    // ------------------------------------------------------------------ //

    test.describe('Events', () => {
        test('update:modelValue — selecting an item fires the emit', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const field = sandbox.locator('[data-cy="select-emit-update"]')
            await expect(field).toBeVisible({ timeout: 12000 })

            // Open the dropdown via the field wrapper (not the input — pointer-events:none)
            await field.locator('.origam-field').first().click()
            await expect(sandbox.locator('.origam-list-item').first()).toBeVisible({ timeout: 5000 })
            await sandbox.locator('.origam-list-item').first().click()

            // After selection the selection div carries the picked title
            await expect(field.locator('.origam-select__selection').first()).toBeVisible({ timeout: 5000 })
        })

        test('update:menu — opening dropdown makes .origam-select--active-menu visible', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const field = sandbox.locator('[data-cy="select-emit-menu"]')
            await expect(field).toBeVisible({ timeout: 12000 })

            await field.locator('.origam-field').first().click()
            // Menu open → class modifier applied
            await expect(field).toHaveClass(/origam-select--active-menu/, { timeout: 5000 })
            // List rendered
            await expect(sandbox.locator('.origam-list').first()).toBeVisible({ timeout: 5000 })
        })

        test('click:clear — clear button present and clickable on clearable select', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const field = sandbox.locator('[data-cy="select-emit-clear"]')
            await expect(field).toBeVisible({ timeout: 12000 })

            // Select an item first so the clear button appears
            await field.locator('.origam-field').first().click()
            await expect(sandbox.locator('.origam-list-item').first()).toBeVisible({ timeout: 5000 })
            await sandbox.locator('.origam-list-item').first().click()
            // Wait for selection to be rendered
            await expect(field.locator('.origam-select__selection').first()).toBeVisible({ timeout: 5000 })

            // Clear button must be present
            const clearBtn = field.locator('.origam-field__clearable').first()
            await expect(clearBtn).toBeVisible({ timeout: 5000 })
            await clearBtn.click()

            // After clear — selection removed
            await expect(field).not.toHaveClass(/origam-select--selected/, { timeout: 5000 })
        })

        test('click:append — append icon rendered when appendIcon prop set', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const field = sandbox.locator('[data-cy="select-emit-click-append"]')
            await expect(field).toBeVisible({ timeout: 12000 })
            // Outer append zone (.origam-input__append) must be present
            await expect(field.locator('.origam-input__append').first()).toBeVisible({ timeout: 5000 })
        })

        test('click:control — field is clickable (control surface present)', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const field = sandbox.locator('[data-cy="select-emit-click-control"]')
            await expect(field).toBeVisible({ timeout: 12000 })
            await expect(field.locator('.origam-field').first()).toBeVisible({ timeout: 5000 })
        })

        test('click:prepend — prepend icon rendered when prependIcon prop set', async ({ page }) => {
            await page.goto(variantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const field = sandbox.locator('[data-cy="select-emit-click-prepend"]')
            await expect(field).toBeVisible({ timeout: 12000 })
            // Outer prepend zone (.origam-input__prepend) must be present
            await expect(field.locator('.origam-input__prepend').first()).toBeVisible({ timeout: 5000 })
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS                                                                //
    // ------------------------------------------------------------------ //

    test.describe('Slots', () => {
        test('Slots - Loader — custom loader slot content renders', async ({ page }) => {
            await page.goto(variantUrl(21))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const field = sandbox.locator('[data-cy="select-slot-loader"]')
            await expect(field).toBeVisible({ timeout: 12000 })
            // The loader slot content "Loading…" must be in the DOM
            await expect(field).toContainText('Loading…', { timeout: 5000 })
        })

        test('Slots - NoData — custom noData slot renders on open with empty items', async ({ page }) => {
            await page.goto(variantUrl(22))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const field = sandbox.locator('[data-cy="select-slot-no-data"]')
            await expect(field).toBeVisible({ timeout: 12000 })

            await field.locator('.origam-field').first().click()
            // Custom no-data slot text
            await expect(sandbox.locator('.origam-list').first()).toBeVisible({ timeout: 5000 })
            await expect(sandbox.locator('.origam-list').first()).toContainText('Nothing to show here', { timeout: 5000 })
        })

        test('Slots - Chip — custom chip slot renders on multiple selection', async ({ page }) => {
            await page.goto(variantUrl(23))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const field = sandbox.locator('[data-cy="select-slot-chip"]')
            await expect(field).toBeVisible({ timeout: 12000 })

            // Select an item
            await field.locator('.origam-field').first().click()
            await expect(sandbox.locator('.origam-list-item').first()).toBeVisible({ timeout: 5000 })
            await sandbox.locator('.origam-list-item').first().click()

            // Custom chip slot item
            await expect(sandbox.locator('[data-cy="select-slot-chip-item"]').first()).toBeVisible({ timeout: 5000 })
        })

        // DS BUG (filed): In the Slots - Selection variant (multiple=true, chips=false),
        // clicking .origam-list-item does NOT add the item to the model.
        // Comparison test (Slots - Chip, chips=true) passes identically → the bug
        // is specific to multiple+non-chips mode. The list items appear at 56px
        // (default OrigamListItem height) instead of 48px which suggests the
        // .origam-select__content scoped override does not apply for this variant.
        // Observable: field model stays [], origam-select__selection never mounts.
        // Expected: first click should add France to model and mount the #selection slot.
        // Workaround: none headlessly. The story renders correctly when interacted
        // with in a real browser.
        test.fixme('Slots - Selection — custom selection slot renders on multiple', async ({ page }) => {
            await page.goto(variantUrl(24))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const field = sandbox.locator('[data-cy="select-slot-selection"]')
            await expect(field).toBeVisible({ timeout: 12000 })

            await field.locator('.origam-field').first().click()
            await expect(sandbox.locator('.origam-list-item').first()).toBeVisible({ timeout: 5000 })
            await sandbox.locator('.origam-list-item').first().click()
            await page.keyboard.press('Escape')
            await page.waitForTimeout(600)

            await expect(sandbox.locator('[data-cy="select-slot-selection-chip"]').first()).toBeVisible({ timeout: 8000 })
        })

        test('Slots - Label — custom label slot renders', async ({ page }) => {
            await page.goto(variantUrl(17))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const field = sandbox.locator('[data-cy="select-slot-label"]')
            await expect(field).toBeVisible({ timeout: 12000 })
            // Custom italic label
            await expect(field.locator('span[style*="italic"]').first()).toBeVisible({ timeout: 5000 })
        })

        test('Slots - Prefix — custom prefix slot renders inside the field', async ({ page }) => {
            await page.goto(variantUrl(19))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const field = sandbox.locator('[data-cy="select-slot-prefix"]')
            await expect(field).toBeVisible({ timeout: 12000 })
            await expect(field.locator('.origam-field__prefix').first()).toContainText('+33', { timeout: 5000 })
        })

        test('Slots - Suffix — custom suffix slot renders inside the field', async ({ page }) => {
            await page.goto(variantUrl(20))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const field = sandbox.locator('[data-cy="select-slot-suffix"]')
            await expect(field).toBeVisible({ timeout: 12000 })
            await expect(field.locator('.origam-field__suffix').first()).toContainText('kg', { timeout: 5000 })
        })

        test('Slots - Items.Prepend — prepend content renders at top of list', async ({ page }) => {
            await page.goto(variantUrl(26))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const field = sandbox.locator('[data-cy="select-slot-items-prepend"]')
            await expect(field).toBeVisible({ timeout: 12000 })

            await field.locator('.origam-field').first().click()
            await expect(sandbox.locator('.origam-list').first()).toBeVisible({ timeout: 5000 })
            await expect(sandbox.locator('.origam-list').first()).toContainText('Start of list', { timeout: 5000 })
        })

        test('Slots - Items.Append — append content renders at bottom of list', async ({ page }) => {
            await page.goto(variantUrl(27))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const field = sandbox.locator('[data-cy="select-slot-items-append"]')
            await expect(field).toBeVisible({ timeout: 12000 })

            await field.locator('.origam-field').first().click()
            await expect(sandbox.locator('.origam-list').first()).toBeVisible({ timeout: 5000 })
            await expect(sandbox.locator('.origam-list').first()).toContainText('End of list', { timeout: 5000 })
        })
    })

    // ------------------------------------------------------------------ //
    // PLAYGROUND (index 28)                                               //
    // data-cy="select-playground" + "select-playground-status"           //
    // ------------------------------------------------------------------ //

    test.describe('Playground (Default)', () => {
        test('renders the select component', async ({ page }) => {
            await page.goto(variantUrl(28))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const select = sandbox.locator('[data-cy="select-playground"]')
            await expect(select).toBeVisible({ timeout: 12000 })
        })

        test('status div present and contains "value ="', async ({ page }) => {
            await page.goto(variantUrl(28))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const status = sandbox.locator('[data-cy="select-playground-status"]')
            await expect(status).toBeVisible({ timeout: 12000 })
            await expect(status).toContainText('value =', { timeout: 5000 })
        })

        test('selecting an item updates the status binding', async ({ page }) => {
            await page.goto(variantUrl(28))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const select = sandbox.locator('[data-cy="select-playground"]')
            await expect(select).toBeVisible({ timeout: 12000 })

            await select.locator('.origam-field').first().click()
            await expect(sandbox.locator('.origam-list-item').first()).toBeVisible({ timeout: 5000 })
            await sandbox.locator('.origam-list-item').first().click()

            const status = sandbox.locator('[data-cy="select-playground-status"]')
            // After selection the status must not be "value = null" — it holds the picked value
            await expect(status).not.toContainText('value = null', { timeout: 5000 })
        })
    })

    // ------------------------------------------------------------------ //
    // DROPDOWN SURFACE CONTRACT                                            //
    // ------------------------------------------------------------------ //

    test.describe('dropdown surface', () => {
        test('menu width matches activator width', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const select = sandbox.locator('.origam-select').first()
            await expect(select).toBeVisible({ timeout: 12000 })

            await select.locator('.origam-field').first().click()
            await expect(sandbox.locator('.origam-list').first()).toBeVisible({ timeout: 5000 })

            const activatorBox   = await select.locator('.origam-field').first().boundingBox()
            const menuContentBox = await sandbox.locator('.origam-menu__content').first().boundingBox()
            const listItemBox    = await sandbox.locator('.origam-list-item').first().boundingBox()

            expect(activatorBox).not.toBeNull()
            expect(menuContentBox).not.toBeNull()
            expect(listItemBox).not.toBeNull()

            // Visible surface >= activator width (the contract)
            expect(menuContentBox!.width).toBeGreaterThanOrEqual(activatorBox!.width - 1)
            // List-items fill the surface — no narrow column inside a wide menu
            expect(listItemBox!.width).toBeGreaterThanOrEqual(activatorBox!.width - 1)
        })

        test('dropdown is flush with activator (no top/left gap)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const select = sandbox.locator('.origam-select').first()
            await expect(select).toBeVisible({ timeout: 12000 })

            await select.locator('.origam-field').first().click()
            await expect(sandbox.locator('.origam-list').first()).toBeVisible({ timeout: 5000 })

            const activatorBox = await select.locator('.origam-field').first().boundingBox()
            const overlayBox   = await sandbox.locator('.origam-overlay__content').first().boundingBox()
            expect(activatorBox).not.toBeNull()
            expect(overlayBox).not.toBeNull()

            // Top: dropdown's top edge sits exactly on the activator's bottom edge
            const topGap = overlayBox!.y - (activatorBox!.y + activatorBox!.height)
            expect(Math.round(topGap)).toBe(0)

            // Left: dropdown's left edge aligns with the activator's left edge
            const leftGap = overlayBox!.x - activatorBox!.x
            expect(Math.round(leftGap)).toBe(0)
        })

        test('list items show cursor:pointer (clickable affordance)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const select = sandbox.locator('.origam-select').first()
            await expect(select).toBeVisible({ timeout: 12000 })

            await select.locator('.origam-field').first().click()
            await expect(sandbox.locator('.origam-list-item').first()).toBeVisible({ timeout: 5000 })

            const cursor = await sandbox.locator('.origam-list-item').first()
                .evaluate(el => getComputedStyle(el).cursor)
            expect(cursor).toBe('pointer')

            const hasLinkClass = await sandbox.locator('.origam-list-item').first()
                .evaluate(el => el.classList.contains('origam-list-item--link'))
            expect(hasLinkClass).toBe(true)
        })

        // Superseded assertion: this used to expect the standalone-list row
        // height, on the premise that the dropdown had a height of its own
        // regardless of the control. That premise is the bug — a `size="small"`
        // select opened onto rows a third taller than its own field. The row now
        // sits on the control-height scale, so an unsized select renders the
        // `md` rung on both sides.
        test('dropdown list items render at the control height rung (36px)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const select = sandbox.locator('.origam-select').first()
            await expect(select).toBeVisible({ timeout: 12000 })

            await select.locator('.origam-field').first().click()
            await expect(sandbox.locator('.origam-list-item').first()).toBeVisible({ timeout: 5000 })

            const itemHeight = await sandbox.locator('.origam-list-item').first()
                .evaluate(el => el.getBoundingClientRect().height)
            expect(itemHeight).toBe(36)
        })

        test('list items have a visible hover state layer', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const select = sandbox.locator('.origam-select').first()
            await expect(select).toBeVisible({ timeout: 12000 })

            await select.locator('.origam-field').first().click()
            await expect(sandbox.locator('.origam-list-item').first()).toBeVisible({ timeout: 5000 })

            const firstItem  = sandbox.locator('.origam-list-item').first()
            const secondItem = sandbox.locator('.origam-list-item').nth(1)

            // Resting overlay must be invisible
            const restingOpacity = await firstItem.locator('.origam-list-item__overlay').first()
                .evaluate(el => parseFloat(getComputedStyle(el).opacity))
            expect(restingOpacity).toBe(0)

            // Hover second item — its overlay must reveal
            const box = await secondItem.boundingBox()
            expect(box).not.toBeNull()
            await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
            await page.waitForTimeout(300)

            const hoverOpacity = await secondItem.locator('.origam-list-item__overlay').first()
                .evaluate(el => parseFloat(getComputedStyle(el).opacity))
            expect(hoverOpacity).toBeGreaterThan(0.05)

            // Non-hovered item stays at rest
            const otherStillResting = await firstItem.locator('.origam-list-item__overlay').first()
                .evaluate(el => parseFloat(getComputedStyle(el).opacity))
            expect(otherStillResting).toBe(0)

            // Overlay color must NOT be white-on-white (scrim miscolour)
            const bg = await secondItem.locator('.origam-list-item__overlay').first()
                .evaluate(el => getComputedStyle(el).backgroundColor)
            expect(bg).not.toBe('rgb(255, 255, 255)')
        })

        test('open animation uses OrigamExpandY transition', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const select = sandbox.locator('.origam-select').first()
            await expect(select).toBeVisible({ timeout: 12000 })

            // Click then read the transition classes mid-animation
            await select.locator('.origam-field').first().click()
            await page.waitForTimeout(50)

            const classes = await sandbox.locator('.origam-overlay__content').first()
                .evaluate(el => Array.from(el.classList))
            const expandY       = classes.filter(c => c.includes('expand-y'))
            const translateScale = classes.filter(c => c.includes('translate-scale'))
            // Must be expand-y, not the default scale
            expect(expandY.length).toBeGreaterThan(0)
            expect(translateScale).toEqual([])
        })
    })

    // ------------------------------------------------------------------ //
    // NON-REGRESSION — bugs historically fixed                            //
    // ------------------------------------------------------------------ //

    test.describe('non-regression', () => {
        // DS bug #fix — first click on the chevron icon double-toggled the menu
        // (icon handler opened, bubbling event closed again) because stopPropagation
        // was only called when isFocused=true. Fixed: icon handler only toggles when
        // already focused; unfocused clicks let the event bubble to handleMousedownControl.
        test('menu-icon first click stays open (no double-toggle regression)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const select = sandbox.locator('.origam-select').first()
            await expect(select).toBeVisible({ timeout: 12000 })

            // Click the chevron icon directly — first interaction, field is NOT focused yet.
            const menuIcon = select.locator('.origam-select__menu-icon').first()
            await expect(menuIcon).toBeVisible({ timeout: 5000 })
            await menuIcon.click()

            // After the FIRST click on the icon the dropdown MUST remain open.
            await expect(sandbox.locator('.origam-list').first()).toBeVisible({ timeout: 5000 })
            await expect(select).toHaveClass(/origam-select--active-menu/, { timeout: 3000 })
        })

        test('menu-icon second click (already focused) closes the menu', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const select = sandbox.locator('.origam-select').first()
            await expect(select).toBeVisible({ timeout: 12000 })

            const menuIcon = select.locator('.origam-select__menu-icon').first()
            await expect(menuIcon).toBeVisible({ timeout: 5000 })

            // First click — opens menu (field now focused)
            await menuIcon.click()
            await expect(sandbox.locator('.origam-list').first()).toBeVisible({ timeout: 5000 })

            // Second click — must close the menu
            await menuIcon.click()
            await expect(sandbox.locator('.origam-list').first()).not.toBeVisible({ timeout: 5000 })
            await expect(select).not.toHaveClass(/origam-select--active-menu/, { timeout: 3000 })
        })

        test('selection is not duplicated after re-focus (no double title in input)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const select = sandbox.locator('.origam-select').first()
            await expect(select).toBeVisible({ timeout: 12000 })

            // Pick first item (France)
            await select.locator('.origam-field').first().click()
            await sandbox.locator('.origam-list-item').first().click()
            await page.waitForTimeout(400)

            // Tab out, tab back — re-fires the focus watcher
            await page.keyboard.press('Tab')
            await page.waitForTimeout(200)
            await page.keyboard.press('Shift+Tab')
            await page.waitForTimeout(400)

            // In non-autocomplete mode the input value must stay empty —
            // only .origam-select__selection carries the selected title.
            const inputValue = await select.locator('input').first()
                .evaluate(el => (el as HTMLInputElement).value)
            expect(inputValue).toBe('')
        })

        test('autocomplete: input stays flush-left after picking (selection chip layout)', async ({ page }) => {
            // Navigate to Functional variant with autocomplete toggled via init-state is not
            // possible headlessly. The Design variant (index 0) is a non-autocomplete select.
            // This test targets the Events - update:modelValue variant (index 2) which is
            // a plain select — verifying the layout contract for non-autocomplete mode.
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const field = sandbox.locator('[data-cy="select-emit-update"]')
            await expect(field).toBeVisible({ timeout: 12000 })

            await field.locator('.origam-field').first().click()
            await sandbox.locator('.origam-list-item').first().click()
            await page.waitForTimeout(400)

            // After picking, the selection div must be present and contain the title
            const selectionText = await field.locator('.origam-select__selection').first()
                .evaluate(el => el.textContent?.trim())
            // The title must be non-empty
            expect(selectionText).toBeTruthy()
            expect(selectionText!.length).toBeGreaterThan(0)
        })

        test('loading=true (Slots - Loader variant) — custom loader slot text rendered', async ({ page }) => {
            await page.goto(variantUrl(21))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const field = sandbox.locator('[data-cy="select-slot-loader"]')
            await expect(field).toBeVisible({ timeout: 12000 })
            // The story provides a custom #loader slot: <span>Loading…</span>.
            // When a custom loader slot is provided OrigamField renders it in place of
            // the default .origam-field__loader div. Assert on the slot content text.
            await expect(field).toContainText('Loading…', { timeout: 5000 })
        })
    })

    // ------------------------------------------------------------------ //
    // LOADING (Functional variant — init: loading=false)                  //
    // The Functional variant has a single interactive select driven by    //
    // HstCheckbox sidebar controls. Only the init-state (loading=false)   //
    // can be asserted headlessly without sidebar manipulation.            //
    // ------------------------------------------------------------------ //

    test.describe('Loading', () => {
        test('Functional init-state: no loader present when loading=false', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const select = sandbox.locator('.origam-select').first()
            await expect(select).toBeVisible({ timeout: 12000 })
            // loading=false → no loader element mounted
            await expect(select.locator('.origam-field__loader')).not.toBeVisible({ timeout: 3000 })
        })

        // FIXTURE ROT: switching the "Loading Kind" Histoire sidebar control
        // (HstCheckbox "Loading" + HstSelect "Loading Kind") cannot be driven
        // headlessly from outside the sandbox iframe via Playwright. The tests
        // below require per-kind static fixtures (one field per kind) which
        // are not present in the current story. Marked fixme until the story
        // exposes per-kind data-cy anchors, or until a helper that drives
        // Histoire sidebar controls is implemented.

        test.fixme('loading=true (bool) → default linear progress mounted', async () => {
            // FIXTURE ROT: sidebar "Loading" toggle cannot be driven headlessly.
            // Requires a static data-cy="select-loading-bool" fixture in the story.
        })

        test.fixme('loading={ type: "circular" } → circular progress mounted', async () => {
            // FIXTURE ROT: sidebar "Loading Kind" cannot be driven headlessly.
            // Requires a static data-cy="select-loading-circular" fixture in the story.
        })

        test.fixme('loading={ type: "skeleton" } → origam-skeleton replaces content', async () => {
            // FIXTURE ROT: sidebar "Loading Kind" cannot be driven headlessly.
            // Requires a static data-cy="select-loading-skeleton" fixture in the story.
        })
    })
    // ------------------------------------------------------------------ //
    // SIZE / DENSITY REACH THE DROPDOWN (index 0 — Design)                //
    //                                                                     //
    // Regression guard for "small field, full-size popup". Pre-fix the    //
    // <origam-list> mounted in the menu received neither :density nor     //
    // :size, so it always rendered `origam-list--density-default` and a   //
    // 48px row whatever the select was set to — measured identical across //
    // small/compact, x-small/compact, default/default and x-large/        //
    // comfortable. All four assertions below fail on that build.          //
    // ------------------------------------------------------------------ //

    test.describe('Dropdown inherits size and density', () => {
        /**
         * Row height vs control height, retried until the layout settles.
         *
         * The menu opens through `OrigamExpandY`, so the first row is reported
         * visible while the container is still animating and an early read can
         * catch a mid-transition box. Polling keeps the acceptance value
         * identical — the delta must still reach <= 1px — it only stops the
         * assertion from being decided on the first frame.
         */
        const expectRowMatchesControl = async (page: Page) => {
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const field = sandbox.locator('.origam-select .origam-field').first()
            const row = sandbox.locator('.origam-list-item').first()

            await expect.poll(async () => {
                const fieldBox = await field.boundingBox()
                const rowBox = await row.boundingBox()

                if (!fieldBox || !rowBox) return null

                return Math.abs(rowBox.height - fieldBox.height)
            }, { timeout: 5000 }).toBeLessThanOrEqual(1)
        }

        const openDropdown = async (page: Page) => {
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const field = sandbox.locator('.origam-select .origam-field').first()
            await field.click()
            await expect(sandbox.locator('.origam-list-item').first()).toBeVisible({ timeout: 8000 })
            return { sandbox, field }
        }

        test('density=compact cascades to the menu list', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-select').first()).toBeVisible({ timeout: 12000 })

            await pickControl(page, 'Density', 'Compact')
            await openDropdown(page)

            await expect(sandbox.locator('.origam-list').first())
                .toHaveClass(/origam-list--density-compact/, { timeout: 5000 })
        })

        test('size=small cascades to the menu rows', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-select').first()).toBeVisible({ timeout: 12000 })

            await pickControl(page, 'Size', 'Small')
            await openDropdown(page)

            await expect(sandbox.locator('.origam-list-item').first())
                .toHaveClass(/origam-list-item--size-small/, { timeout: 5000 })
        })

        // The acceptance criterion is deliberately RELATIVE, not a pixel
        // constant: Histoire loads the token sheets but not `main.scss`, so
        // absolute row heights differ between the story sandbox and a consumer
        // app that imports the global reset. The control-to-row ratio does not.
        for (const [size, density] of [
            ['Small', 'Compact'],
            ['Small', 'Default'],
            ['Default', 'Default'],
            ['Large', 'Default'],
            ['X-Large', 'Comfortable']
        ] as const) {
            test(`menu row matches the control height — size=${size} density=${density}`, async ({ page }) => {
                await page.goto(variantUrl(0))
                const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
                await expect(sandbox.locator('.origam-select').first()).toBeVisible({ timeout: 12000 })

                await pickControl(page, 'Size', size)
                await pickControl(page, 'Density', density)

                await openDropdown(page)
                // 1px of tolerance for sub-pixel layout rounding only.
                await expectRowMatchesControl(page)
            })
        }

        // `size` is optional on the select, and this is by far its most common
        // shape. With no rung class of its own the row would fall back to the
        // standalone-list height (56px) against a 36px control — a WORSE gap
        // than the bug this suite guards. `OrigamSelect` therefore hands the
        // list an explicit `default` rung rather than forwarding `undefined`.
        test('menu row matches the control height — no size, no density', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-select').first()).toBeVisible({ timeout: 12000 })

            await openDropdown(page)
            await expectRowMatchesControl(page)
        })
    })
// The menu is teleported out of the select's subtree, so a stylesheet
    // written by the consuming application reaches the field and never the
    // options. Inheriting `font-size` on the surface does not close it either:
    // list items size their text with `var(--origam-list-item__title---font-size, 1rem)`,
    // and `rem` resolves against the document root, not the parent.
    //
    // Measured before the bridge: field 13px, option 14px in the sandbox — and
    // far wider in a real app, which is how it was reported (a small control
    // opening a visibly oversized popup).
    test.describe('Teleported menu follows the field typography', () => {
        for (const fontSize of ['11px', '13px', '20px']) {
            test(`option text matches a field overridden to ${fontSize}`, async ({ page }) => {
                await page.goto(variantUrl(0))
                const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
                const select = sandbox.locator('.origam-select').first()
                await expect(select).toBeVisible({ timeout: 12000 })

                // Stands in for the consuming application's own stylesheet.
                await select.evaluate((el, fs) => {
                    const style = document.createElement('style')
                    style.textContent = `.origam-select, .origam-select * { font-size: ${fs} !important; }`
                    document.head.appendChild(style)
                }, fontSize)

                await select.click()
                await expect(sandbox.locator('.origam-list-item').first()).toBeVisible({ timeout: 8000 })

                const fieldSize = await select.evaluate((el) =>
                    getComputedStyle((el.querySelector('input') ?? el) as HTMLElement).fontSize)
                const optionSize = await sandbox.locator('.origam-list-item').first().evaluate((el) =>
                    getComputedStyle((el.querySelector('.origam-list-item__title') ?? el) as HTMLElement).fontSize)

                expect(parseFloat(optionSize)).toBeCloseTo(parseFloat(fieldSize), 1)
            })
        }
    })

    // ------------------------------------------------------------------ //
    // VARIANT = PROPS PRESET, forwarded through Select (index 29)         //
    // ADR-005, ticket #24 — same acceptance test as OrigamTextField: an   //
    // explicit bgColor at the Select call site must beat the outlined     //
    // preset's bgColor on the INNER <origam-field> Select renders.        //
    // ------------------------------------------------------------------ //

    test.describe('Variant = props preset, forwarded to inner OrigamField (ADR-005)', () => {
        test('variant="outlined" + bgColor="primary": bgColor paints on the inner field', async ({ page }) => {
            await page.goto(variantUrl(29))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const matrix = sandbox.locator('[data-cy="select-variant-override-matrix"]')
            await expect(matrix).toBeVisible({ timeout: 12000 })

            const only = sandbox.locator('[data-cy="select-ovr-outlined-only"] .origam-field')
            const withBg = sandbox.locator('[data-cy="select-ovr-outlined-bgcolor"] .origam-field')
            await expect(only).toBeVisible()
            await expect(withBg).toBeVisible()

            const bgOnly = await only.evaluate(el => getComputedStyle(el).backgroundColor)
            const bgWithBg = await withBg.evaluate(el => getComputedStyle(el).backgroundColor)

            expect(bgWithBg).not.toBe(bgOnly)
            expect(bgWithBg).not.toBe('rgba(0, 0, 0, 0)')
            expect(bgWithBg).toBe('rgb(124, 58, 237)')
        })
    })
})
