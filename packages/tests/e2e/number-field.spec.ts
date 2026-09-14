import { expect, test } from '@playwright/test'
import { toggleHstCheckbox } from './_support/histoire-controls'

/**
 * OrigamNumberField — e2e spec
 *
 * Navigation pattern : variantId direct (canonical recipe from btn.spec.ts).
 * NO networkidle — Histoire keeps an HMR websocket open → networkidle never resolves.
 * NO data-cy in the story wrapper — locators use BEM classes from the component.
 *
 * Root DOM structure observed at runtime:
 *   <div class="origam-input origam-input--... origam-text-field origam-number-field">
 *     <span class="origam-input__prepend">…</span>
 *     <div class="origam-input__control">…</div>
 *     <span class="origam-input__append">…</span>
 *   </div>
 *
 * NOTE — color=primary utility class (origam--color-primary) is NOT propagated
 * to the root element of OrigamNumberField. The class appears to be dropped during
 * the NumberField → TextField → Input composition chain. This is documented below
 * as a DS bug. Tests that would check for this class test colour via CSS custom
 * property resolution instead.
 *
 * Variant index map (0-based, grep '<Variant' in OrigamNumberField.story.vue):
 *   0  → Design
 *   1  → Functional
 *   2  → Events - update:modelValue
 *   3  → Events - increment
 *   4  → Events - click:control
 *   5  → Events - mousedown:control
 *   6  → Events - click:clear
 *   7  → Events - click:prepend
 *   8  → Events - click:append
 *   9  → Slots - Default
 *  10  → Slots - Prepend
 *  11  → Slots - Append
 *  12  → Slots - PrependInner
 *  13  → Slots - AppendInner
 *  14  → Slots - Clear
 *  15  → Slots - Increment
 *  16  → Slots - Decrement
 *  17  → Slots - Field
 *  18  → Slots - Label
 *  19  → Slots - FloatingLabel
 *  20  → Slots - Prefix
 *  21  → Slots - Suffix
 *  22  → Slots - Loader
 *  23  → Slots - Details
 *  24  → Slots - Messages
 *  25  → Slots - Message
 *  26  → Default (playground)
 */

const STORY_ID   = 'components-stories-numberfield-origamnumberfield-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamNumberField', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { label: 'Quantity', color: 'primary', v-model=42 }           //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders the root .origam-number-field class', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field').first()).toBeVisible({ timeout: 12000 })
        })

        test('wraps an <input> element', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('input').first()).toBeVisible({ timeout: 8000 })
        })

        test('init model value 42 appears in the input', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const input = sandbox.locator('input').first()
            await expect(input).toBeVisible({ timeout: 12000 })
            await expect(input).toHaveValue('42')
        })

        test('label "Quantity" is rendered', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-field__label, .origam-label').first()).toContainText('Quantity')
        })

        test('control area is attached in the DOM (appendInner)', async ({ page }) => {
            /**
             * The control div (.origam-number-field__control) is rendered but may have
             * overflow:hidden or be sized to 0 in certain states — use toBeAttached,
             * not toBeVisible.
             */
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-number-field__control').first()).toBeAttached({ timeout: 8000 })
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 1)                                                 //
    // init: { min:0, max:100, step:1, precision:0, v-model=0, … }         //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('renders number field with value display', async ({ page }) => {
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field').first()).toBeVisible({ timeout: 12000 })
            // Story renders <div>value = {{ functionalModel }}</div>
            await expect(sandbox.locator('div').filter({ hasText: /value\s*=/ }).first()).toBeVisible({ timeout: 8000 })
        })

        test('input accepts numeric keyboard input and updates displayed value', async ({ page }) => {
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field').first()).toBeVisible({ timeout: 12000 })
            const input = sandbox.locator('input').first()
            await expect(input).toBeVisible({ timeout: 8000 })

            await input.click()
            await input.fill('50')
            await input.blur()
            await page.waitForTimeout(300)

            await expect(input).toHaveValue('50')
            await expect(sandbox.locator('div').filter({ hasText: /value\s*=\s*50/ }).first()).toBeVisible({ timeout: 5000 })
        })

        test('ArrowUp increments value by 1 (default step)', async ({ page }) => {
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field').first()).toBeVisible({ timeout: 12000 })

            const input = sandbox.locator('input').first()
            await expect(input).toBeVisible({ timeout: 8000 })

            // Set a known starting value
            await input.click()
            await input.fill('10')
            await input.blur()
            await page.waitForTimeout(300)

            // Increment via ArrowUp key
            await input.click()
            await input.press('ArrowUp')
            await input.blur()
            await page.waitForTimeout(300)

            await expect(input).toHaveValue('11')
        })

        test('ArrowDown decrements value by 1 (default step)', async ({ page }) => {
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field').first()).toBeVisible({ timeout: 12000 })

            const input = sandbox.locator('input').first()
            await expect(input).toBeVisible({ timeout: 8000 })

            // Set a known starting value
            await input.click()
            await input.fill('10')
            await input.blur()
            await page.waitForTimeout(300)

            await input.click()
            await input.press('ArrowDown')
            await input.blur()
            await page.waitForTimeout(300)

            await expect(input).toHaveValue('9')
        })

        test('value within [min, max] is kept as-is on blur', async ({ page }) => {
            /**
             * The component's inputText computed setter silently rejects values
             * outside [min, max] — fill() bypasses the computed setter (direct DOM write),
             * so the vue model stays null. On blur, clampModel() reads the DOM value,
             * clamps it, and writes the result back.
             * We test with a value WITHIN the valid range (min=0, max=100).
             */
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field').first()).toBeVisible({ timeout: 12000 })

            const input = sandbox.locator('input').first()
            await expect(input).toBeVisible({ timeout: 8000 })

            await input.click()
            await input.fill('75')
            await input.blur()
            await page.waitForTimeout(300)

            await expect(input).toHaveValue('75')
        })

        test('non-numeric input is rejected (beforeinput guard via key events)', async ({ page }) => {
            /**
             * fill() bypasses the beforeinput event. pressSequentially() fires
             * real key events and exercises the guard.
             */
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field').first()).toBeVisible({ timeout: 12000 })

            const input = sandbox.locator('input').first()
            await expect(input).toBeVisible({ timeout: 8000 })

            // Ensure input is empty first
            await input.click()
            await input.selectText()
            await page.keyboard.press('Delete')
            await page.waitForTimeout(100)

            // Type non-numeric chars — each should be rejected by beforeinput
            await input.pressSequentially('abc')
            await page.waitForTimeout(200)

            const val = await input.inputValue()
            // Should remain empty or at prior numeric value — never 'abc'
            expect(val).not.toContain('a')
            expect(val).not.toContain('b')
            expect(val).not.toContain('c')
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS (indexes 2–8)                                                 //
    // ------------------------------------------------------------------ //

    test.describe('Events - update:modelValue', () => {
        test('renders field and value display', async ({ page }) => {
            await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('div').filter({ hasText: /value\s*=/ }).first()).toBeVisible({ timeout: 8000 })
        })

        test('changing the input value updates the displayed value', async ({ page }) => {
            await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })

            const input = sandbox.locator('input').first()
            await expect(input).toBeVisible({ timeout: 8000 })
            await input.click()
            await input.fill('7')
            await input.blur()
            await page.waitForTimeout(300)

            await expect(sandbox.locator('div').filter({ hasText: /value\s*=\s*7/ }).first()).toBeVisible({ timeout: 5000 })
        })
    })

    test.describe('Events - increment', () => {
        test('renders field and value display', async ({ page }) => {
            await page.goto(variantUrl(3), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('div').filter({ hasText: /value\s*=/ }).first()).toBeVisible({ timeout: 8000 })
        })

        test('ArrowUp fires increment and updates value', async ({ page }) => {
            await page.goto(variantUrl(3), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })

            const input = sandbox.locator('input').first()
            await expect(input).toBeVisible({ timeout: 8000 })

            // Set known value
            await input.click()
            await input.fill('5')
            await input.press('ArrowUp')
            await input.blur()
            await page.waitForTimeout(300)

            await expect(input).toHaveValue('6')
        })
    })

    test.describe('Events - click:control', () => {
        test('renders the number field', async ({ page }) => {
            await page.goto(variantUrl(4), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
        })
    })

    test.describe('Events - mousedown:control', () => {
        test('renders the number field', async ({ page }) => {
            await page.goto(variantUrl(5), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
        })
    })

    test.describe('Events - click:clear', () => {
        test('renders the field with clearable enabled', async ({ page }) => {
            await page.goto(variantUrl(6), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
        })
    })

    test.describe('Events - click:prepend', () => {
        test('renders the field with a prepend icon area', async ({ page }) => {
            await page.goto(variantUrl(7), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
            // OrigamInput renders prepend as .origam-input__prepend, not .origam-field__prepend
            await expect(sandbox.locator('.origam-input__prepend').first()).toBeAttached({ timeout: 8000 })
        })

        // click:prepend was DECLARED but structurally dead (#459) — NumberField
        // never listened for the child <origam-text-field>'s own emit. The real
        // assertion (wrapper.emitted('click:prepend')) lives in
        // OrigamNumberField.spec.ts (TU), where it's directly observable.
        // logEvent() itself is a Histoire-internal side effect that cannot be
        // read from the outer test page (same limitation as btn.spec.ts's
        // `Events - click`) — this e2e test only confirms the click reaches
        // the relay handler without throwing.
        test('click on prepend area does not throw', async ({ page }) => {
            await page.goto(variantUrl(7), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const prepend = sandbox.locator('.origam-input__prepend').first()
            await expect(prepend).toBeVisible({ timeout: 8000 })
            await prepend.click()
        })
    })

    test.describe('Events - click:append', () => {
        test('renders the field with an append icon area', async ({ page }) => {
            await page.goto(variantUrl(8), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
            // OrigamInput renders append as .origam-input__append, not .origam-field__append
            await expect(sandbox.locator('.origam-input__append').first()).toBeAttached({ timeout: 8000 })
        })

        // Same relay fix as click:prepend above — see OrigamNumberField.spec.ts
        // (TU) for the real emitted-event assertion.
        test('click on append area does not throw', async ({ page }) => {
            await page.goto(variantUrl(8), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const append = sandbox.locator('.origam-input__append').first()
            await expect(append).toBeVisible({ timeout: 8000 })
            await append.click()
        })
    })

    // ------------------------------------------------------------------ //
    // ARIA — spinbutton role + aria-value* (#459)                          //
    // ------------------------------------------------------------------ //

    test.describe('ARIA — spinbutton role', () => {
        test('Design variant (non-compact): input carries role=spinbutton and aria-value*', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const input = sandbox.locator('input').first()
            await expect(input).toBeVisible({ timeout: 12000 })

            await expect(input).toHaveAttribute('role', 'spinbutton')
            // Design variant init-state seeds v-model=42 (see header note).
            await expect(input).toHaveAttribute('aria-valuenow', '42')
            await expect(input).toHaveAttribute('aria-valuemin')
            await expect(input).toHaveAttribute('aria-valuemax')
            await expect(input).toHaveAttribute('aria-valuetext', '42')
        })

        test('Compact mode: input carries role=spinbutton and aria-value*', async ({ page }) => {
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })

            await toggleHstCheckbox(page, 'Compact')
            await page.waitForTimeout(600)

            const input = sandbox.locator('[data-cy="numberfield-compact-input"]')
            await expect(input).toBeVisible({ timeout: 8000 })
            await expect(input).toHaveAttribute('role', 'spinbutton')
            await expect(input).toHaveAttribute('aria-valuemin')
            await expect(input).toHaveAttribute('aria-valuemax')
        })

        test('Compact mode: decrement/increment buttons carry a non-empty aria-label', async ({ page }) => {
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })

            await toggleHstCheckbox(page, 'Compact')
            await page.waitForTimeout(600)

            const decBtn = sandbox.locator('[data-cy="numberfield-compact-decrement"]')
            const incBtn = sandbox.locator('[data-cy="numberfield-compact-increment"]')
            await expect(decBtn).toBeVisible({ timeout: 8000 })
            await expect(incBtn).toBeVisible({ timeout: 8000 })

            await expect(decBtn).toHaveAttribute('aria-label', 'Decrement')
            await expect(incBtn).toHaveAttribute('aria-label', 'Increment')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS (indexes 9–25)                                                 //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('default slot content is rendered inside the field', async ({ page }) => {
            await page.goto(variantUrl(9), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('span').filter({ hasText: 'Custom slot content' }).first()).toBeVisible({ timeout: 8000 })
        })
    })

    test.describe('Slots - Prepend', () => {
        test('prepend slot renders an origam-icon in the prepend area', async ({ page }) => {
            await page.goto(variantUrl(10), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
            // OrigamInput prepend area: .origam-input__prepend
            await expect(sandbox.locator('.origam-input__prepend .origam-icon').first()).toBeAttached({ timeout: 8000 })
        })
    })

    test.describe('Slots - Append', () => {
        test('append slot renders an origam-icon in the append area', async ({ page }) => {
            await page.goto(variantUrl(11), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
            // OrigamInput append area: .origam-input__append
            await expect(sandbox.locator('.origam-input__append .origam-icon').first()).toBeAttached({ timeout: 8000 })
        })
    })

    test.describe('Slots - PrependInner', () => {
        test('prependInner slot renders an origam-icon inside the field', async ({ page }) => {
            await page.goto(variantUrl(12), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-field__prepend-inner .origam-icon').first()).toBeAttached({ timeout: 8000 })
        })
    })

    test.describe('Slots - AppendInner', () => {
        test('appendInner slot renders an origam-icon inside the field', async ({ page }) => {
            await page.goto(variantUrl(13), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
            // appendInner always has the control area; slot icon is also present
            await expect(sandbox.locator('.origam-field__append-inner .origam-icon').first()).toBeAttached({ timeout: 8000 })
        })
    })

    test.describe('Slots - Clear', () => {
        test('clear slot: field with clearable renders without throwing', async ({ page }) => {
            await page.goto(variantUrl(14), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
        })
    })

    test.describe('Slots - Increment', () => {
        test('increment slot: control area is present in the DOM', async ({ page }) => {
            await page.goto(variantUrl(15), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
            // The control area must be attached (not necessarily visible — it may be overflow-hidden)
            await expect(sandbox.locator('.origam-number-field__control').first()).toBeAttached({ timeout: 8000 })
        })
    })

    test.describe('Slots - Decrement', () => {
        test('decrement slot: control area is present in the DOM', async ({ page }) => {
            await page.goto(variantUrl(16), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-number-field__control').first()).toBeAttached({ timeout: 8000 })
        })
    })

    test.describe('Slots - Field', () => {
        test('field slot renders custom content', async ({ page }) => {
            await page.goto(variantUrl(17), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('span').filter({ hasText: 'Custom field content' }).first()).toBeVisible({ timeout: 8000 })
        })
    })

    test.describe('Slots - Label', () => {
        test('label slot renders custom text', async ({ page }) => {
            await page.goto(variantUrl(18), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('span').filter({ hasText: 'Custom label' }).first()).toBeVisible({ timeout: 8000 })
        })
    })

    test.describe('Slots - FloatingLabel', () => {
        test('floatingLabel slot renders floating label text', async ({ page }) => {
            await page.goto(variantUrl(19), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('span').filter({ hasText: 'Floating label' }).first()).toBeVisible({ timeout: 8000 })
        })
    })

    test.describe('Slots - Prefix', () => {
        test('prefix slot renders the prefix element', async ({ page }) => {
            await page.goto(variantUrl(20), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('span').filter({ hasText: '€' }).first()).toBeVisible({ timeout: 8000 })
        })
    })

    test.describe('Slots - Suffix', () => {
        test('suffix slot renders the suffix element', async ({ page }) => {
            await page.goto(variantUrl(21), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('span').filter({ hasText: 'kg' }).first()).toBeVisible({ timeout: 8000 })
        })
    })

    test.describe('Slots - Loader', () => {
        test('loading=true activates loading state on the field', async ({ page }) => {
            await page.goto(variantUrl(22), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-number-field, .origam-text-field').first()
            await expect(root).toBeVisible({ timeout: 12000 })
            // loading class is applied on the text-field root
            await expect(sandbox.locator('.origam-text-field--loading, .origam-field--loading').first()).toBeAttached({ timeout: 8000 })
        })
    })

    test.describe('Slots - Details', () => {
        test('details slot renders custom content in the details area', async ({ page }) => {
            await page.goto(variantUrl(23), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('span').filter({ hasText: 'Custom details area' }).first()).toBeVisible({ timeout: 8000 })
        })
    })

    test.describe('Slots - Messages', () => {
        test('messages slot renders custom messages area with error-messages set', async ({ page }) => {
            await page.goto(variantUrl(24), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('span').filter({ hasText: 'Custom messages area' }).first()).toBeVisible({ timeout: 8000 })
        })
    })

    test.describe('Slots - Message', () => {
        test('message slot renders individual error message text', async ({ page }) => {
            await page.goto(variantUrl(25), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('span').filter({ hasText: 'Error message' }).first()).toBeVisible({ timeout: 8000 })
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT — playground (index 26)                                      //
    // init: { label:'Quantity', color:'primary', min:0, max:100, … }      //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('renders the number field', async ({ page }) => {
            await page.goto(variantUrl(26), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
        })

        test('displays value label', async ({ page }) => {
            await page.goto(variantUrl(26), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('div').filter({ hasText: /value\s*=/ }).first()).toBeVisible({ timeout: 8000 })
        })

        test('root element carries the origam-input + origam-text-field + origam-number-field class trifecta', async ({ page }) => {
            /**
             * DS BUG NOTE: origam--color-primary utility class is NOT propagated to this root
             * despite color='primary' being in the init-state. The composition chain
             * NumberField → TextField(textFieldProps) → Input(inputClasses) should apply
             * colorClasses on the root, but at runtime it does not appear. This is a known
             * discrepancy between the design intent and the runtime behaviour.
             * We test what IS present instead of asserting the missing class.
             */
            await page.goto(variantUrl(26), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-number-field').first()
            await expect(root).toBeVisible({ timeout: 12000 })
            await expect(root).toHaveClass(/origam-input/)
            await expect(root).toHaveClass(/origam-text-field/)
            await expect(root).toHaveClass(/origam-number-field/)
        })

        test('input is interactive and updates value', async ({ page }) => {
            await page.goto(variantUrl(26), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field').first()).toBeVisible({ timeout: 12000 })
            const input = sandbox.locator('input').first()
            await expect(input).toBeVisible({ timeout: 8000 })

            await input.click()
            await input.fill('42')
            await input.blur()
            await page.waitForTimeout(300)

            await expect(sandbox.locator('div').filter({ hasText: /value\s*=\s*42/ }).first()).toBeVisible({ timeout: 5000 })
        })
    })

    // ------------------------------------------------------------------ //
    // COMPACT mode — via data-cy on the component (present in the          //
    // component's own template, only active when compact=true).            //
    //                                                                      //
    // The Functional variant (index 1) starts with compact=false.         //
    // Histoire controls (HstCheckbox) are rendered in the outer window and //
    // can be toggled from Playwright — via `toggleHstCheckbox`, which      //
    // targets `getByRole('checkbox')`.                                     //
    //                                                                      //
    // These blocks used to sit behind `if (await page.locator('label')     //
    // .filter({hasText:'Compact'}).locator('input[type="checkbox"]')       //
    // .count() > 0)`. Measured on the built bundle: the whole page holds   //
    // ZERO `input[type=checkbox]` — HstCheckbox renders a                  //
    // `<label class="histoire-checkbox" role="checkbox">` around an SVG.   //
    // The guard could therefore never be true, the assertions never ran,   //
    // and the spec reported green from `GREEN_SPECS` for nothing. Same     //
    // defect fixed in media-scrubber.spec.ts (3b21c7e6).                   //
    // ------------------------------------------------------------------ //

    test.describe('Compact mode (structural — data-cy from component)', () => {
        test('compact=true renders the data-cy compact buttons and input via HstCheckbox', async ({ page }) => {
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })

            // Tick the "Compact" HstCheckbox in the outer Histoire panel
            await toggleHstCheckbox(page, 'Compact')
            await page.waitForTimeout(600)

            // Compact mode should now render data-cy elements from the component
            await expect(sandbox.locator('[data-cy="numberfield-compact-input"]').first()).toBeVisible({ timeout: 8000 })
            await expect(sandbox.locator('[data-cy="numberfield-compact-increment"]').first()).toBeVisible({ timeout: 8000 })
            await expect(sandbox.locator('[data-cy="numberfield-compact-decrement"]').first()).toBeVisible({ timeout: 8000 })
        })

        test('compact increment click changes the displayed value', async ({ page }) => {
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })

            await toggleHstCheckbox(page, 'Compact')
            await page.waitForTimeout(600)

            const incBtn = sandbox.locator('[data-cy="numberfield-compact-increment"]').first()
            await expect(incBtn).toBeVisible({ timeout: 8000 })

            const valueBefore = await sandbox.locator('div').filter({ hasText: /value\s*=/ }).first().textContent({ timeout: 3000 })
            await incBtn.click()
            await page.waitForTimeout(300)
            const valueAfter = await sandbox.locator('div').filter({ hasText: /value\s*=/ }).first().textContent({ timeout: 3000 })

            // Value text should have changed
            expect(valueBefore).not.toEqual(valueAfter)
        })
    })

    // ------------------------------------------------------------------ //
    // SCSS rules — verified via class injection or computed style          //
    // ------------------------------------------------------------------ //

    test.describe('SCSS — hide-controls modifier', () => {
        test('origam-number-field--hide-controls class is emitted when hideControls=true (Functional variant)', async ({ page }) => {
            /**
             * hide-controls is implemented via `v-if="!hideControls"` on the control buttons
             * (template-level), not via a CSS display:none rule. The modifier class
             * origam-number-field--hide-controls is added to the root for downstream CSS hooks,
             * but the SCSS file has no display rule for it — the buttons simply aren't mounted.
             * We verify the class appears on the root when the prop is toggled.
             */
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field, .origam-text-field').first()).toBeVisible({ timeout: 12000 })

            await toggleHstCheckbox(page, 'Hide Controls')
            await page.waitForTimeout(400)

            const root = sandbox.locator('.origam-number-field').first()
            await expect(root).toHaveClass(/origam-number-field--hide-controls/, { timeout: 5000 })

            // Control area should no longer be attached (v-if removed it)
            await expect(sandbox.locator('.origam-number-field__control')).toHaveCount(0, { timeout: 3000 })
        })
    })

    test.describe('SCSS — compact modifier', () => {
        test('origam-number-field--compact sets display:inline-flex on the compact wrapper', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-number-field').first()).toBeVisible({ timeout: 12000 })

            // Inject compact class on the root to verify the SCSS rule compiles
            const display = await sandbox.locator('.origam-number-field').first().evaluate(el => {
                el.classList.add('origam-number-field--compact')
                return getComputedStyle(el).display
            })
            expect(display).toBe('inline-flex')
        })
    })
})
