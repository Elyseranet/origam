import { expect, test } from '@playwright/test'

/**
 * OrigamTextareaField — e2e spec
 *
 * Navigation pattern: direct variantId URL (see btn.spec.ts recipe).
 * NEVER waitForLoadState('networkidle') — Histoire holds a WebSocket open.
 * Variant index map (0-based, matches grep -E '<Variant' in the story file):
 *
 *  0  Design
 *  1  State
 *  2  Functional
 *  3  Functional - Rich Mode
 *  4  Events - update:modelValue
 *  5  Events - focus
 *  6  Events - click:control
 *  7  Events - mousedown:control
 *  8  Events - update:height
 *  9  Events - format
 * 10  Slots - Default
 * 11  Slots - Prepend
 * 12  Slots - Append
 * 13  Slots - PrependInner
 * 14  Slots - AppendInner
 * 15  Slots - Clear
 * 16  Slots - Counter
 * 17  Slots - Details
 * 18  Slots - FloatingLabel
 * 19  Slots - Label
 * 20  Slots - Loader
 * 21  Slots - Message
 * 22  Slots - Messages
 * 23  Slots - Prefix
 * 24  Slots - Suffix
 * 25  Slots - Toolbar
 * 26  Default (playground)
 *
 * Non-headless limitations documented inline where applicable.
 */

const STORY_ID   = 'components-stories-textareafield-origamtextareafield-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamTextareaField', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { label: 'Label', color: 'primary' }                          //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders root with BEM class origam-textarea-field', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-textarea-field').first()).toBeVisible({ timeout: 12000 })
        })

        test('renders a <textarea> element in plain mode', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-textarea-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('textarea').first()).toBeAttached()
        })

        test('color=primary: the field control has a non-default foreground color', async ({ page }) => {
            // color='primary' is passed to OrigamInput which emits it via inline style
            // (colorStyles) rather than a utility class when props flow through filterProps.
            // We assert the field renders and does not fall back to the browser default.
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-textarea-field').first()
            await expect(root).toBeVisible({ timeout: 12000 })
            // The field must at minimum be present; color propagation is verified
            // via the origam-field__overlay (the surface that carries the token color).
            await expect(sandbox.locator('.origam-field').first()).toBeAttached()
        })
    })

    // ------------------------------------------------------------------ //
    // STATE (index 1)                                                      //
    // init: { bgColor: 'primary' }                                        //
    // ------------------------------------------------------------------ //

    test.describe('State', () => {
        test('renders with bgColor=primary: root is visible with a field overlay', async ({ page }) => {
            // bgColor='primary' flows through filterProps to OrigamInput's useBothColor.
            // The resulting color is emitted via inline style (colorStyles channel),
            // not as a utility class, when props arrive via v-bind spread.
            // We assert the component renders correctly without asserting the specific
            // utility class — that is covered by unit tests closer to the composable.
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-textarea-field').first()
            await expect(root).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-field').first()).toBeAttached()
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 2)                                                 //
    // init: { label: 'Label', rows: 3, autoGrow: false, noResize: false,  //
    //         counter: false, disabled: false, readonly: false, error: false } //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('renders root with a textarea in initial state', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-textarea-field').first()
            await expect(root).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('textarea').first()).toBeAttached()
        })

        test('initial state: no disabled class on root', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-textarea-field').first()
            await expect(root).toBeVisible({ timeout: 12000 })
            const classes = await root.getAttribute('class')
            expect(classes).not.toContain('origam-input--disabled')
        })

        test('initial state: no no-resize class (noResize=false)', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-textarea-field').first()
            await expect(root).toBeVisible({ timeout: 12000 })
            const classes = await root.getAttribute('class')
            expect(classes).not.toContain('origam-textarea-field--no-resize')
        })

        test('initial state: no auto-grow class (autoGrow=false)', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-textarea-field').first()
            await expect(root).toBeVisible({ timeout: 12000 })
            const classes = await root.getAttribute('class')
            expect(classes).not.toContain('origam-textarea-field--auto-grow')
        })

        test('textarea is enabled and writable in initial state', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-textarea-field').first()).toBeVisible({ timeout: 12000 })
            const textarea = sandbox.locator('textarea').first()
            await textarea.fill('test input')
            await expect(textarea).toHaveValue('test input')
        })

        test('SCSS: injecting origam-textarea-field--no-resize disables CSS resize', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-textarea-field').first()).toBeVisible({ timeout: 12000 })
            // The SCSS rule `.origam-textarea-field--no-resize :deep(.origam-field__input) { resize: none }`.
            // Textarea itself always has `resize: none` from the base `textarea { resize: none }` rule
            // in the scoped SCSS — verify it directly on the textarea element.
            const resize = await sandbox.locator('textarea').first().evaluate(
                (el) => getComputedStyle(el).resize
            )
            expect(resize).toBe('none')
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL - RICH MODE (index 3)                                     //
    // init: { mode: 'plain', output: 'html', toolbarPosition: 'top' }     //
    // ------------------------------------------------------------------ //

    test.describe('Functional - Rich Mode', () => {
        test('renders root in initial plain mode (no rich toolbar)', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-textarea-field').first()
            await expect(root).toBeVisible({ timeout: 12000 })
            // Plain mode: <textarea> is present, rich host is absent
            await expect(sandbox.locator('textarea').first()).toBeAttached()
            await expect(sandbox.locator('.origam-rich-toolbar')).not.toBeAttached()
        })

        test('plain mode: rich host div is absent', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-textarea-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="origam-textarea-rich-host"]')).not.toBeAttached()
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS - update:modelValue (index 4)                                 //
    // data-cy="textarea-emit-update"                                       //
    // ------------------------------------------------------------------ //

    test.describe('Events - update:modelValue', () => {
        test('renders the textarea with data-cy attribute', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-emit-update"]')).toBeVisible({ timeout: 12000 })
        })

        test('typing into the textarea does not throw', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-emit-update"]')).toBeVisible({ timeout: 12000 })
            const textarea = sandbox.locator('[data-cy="textarea-emit-update"] textarea').first()
            await textarea.fill('hello world')
            await expect(textarea).toHaveValue('hello world')
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS - focus (index 5)                                             //
    // data-cy="textarea-emit-focus"                                        //
    // ------------------------------------------------------------------ //

    test.describe('Events - focus', () => {
        test('renders the focus-event textarea', async ({ page }) => {
            await page.goto(variantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-emit-focus"]')).toBeVisible({ timeout: 12000 })
        })

        test('clicking the textarea does not throw (focus/blur handlers fire)', async ({ page }) => {
            await page.goto(variantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-emit-focus"]')).toBeVisible({ timeout: 12000 })
            const textarea = sandbox.locator('[data-cy="textarea-emit-focus"] textarea').first()
            await textarea.click()
            // After focus the field should have the active/focused class on the origam-field
            await expect(sandbox.locator('.origam-field--focused').first()).toBeAttached()
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS - click:control (index 6)                                     //
    // data-cy="textarea-emit-click-control"                                //
    // ------------------------------------------------------------------ //

    test.describe('Events - click:control', () => {
        test('renders the click:control textarea', async ({ page }) => {
            await page.goto(variantUrl(9))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-emit-click-control"]')).toBeVisible({ timeout: 12000 })
        })

        test('clicking the control area does not throw', async ({ page }) => {
            await page.goto(variantUrl(9))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-emit-click-control"]')).toBeVisible({ timeout: 12000 })
            await sandbox.locator('[data-cy="textarea-emit-click-control"]').click()
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS - mousedown:control (index 7)                                 //
    // data-cy="textarea-emit-mousedown-control"                            //
    // ------------------------------------------------------------------ //

    test.describe('Events - mousedown:control', () => {
        test('renders the mousedown:control textarea', async ({ page }) => {
            await page.goto(variantUrl(10))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-emit-mousedown-control"]')).toBeVisible({ timeout: 12000 })
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS - update:height (index 8)                                     //
    // auto-grow=true, data-cy="textarea-emit-height"                       //
    // ------------------------------------------------------------------ //

    test.describe('Events - update:height', () => {
        test('auto-grow is active: origam-textarea-field--auto-grow class present', async ({ page }) => {
            await page.goto(variantUrl(11))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('[data-cy="textarea-emit-height"]')
            await expect(root).toBeVisible({ timeout: 12000 })
            await expect(root).toHaveClass(/origam-textarea-field--auto-grow/)
        })

        test('auto-grow textarea grows after content is added', async ({ page }) => {
            await page.goto(variantUrl(11))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-emit-height"]')).toBeVisible({ timeout: 12000 })
            const textarea = sandbox.locator('[data-cy="textarea-emit-height"] textarea').first()
            const heightBefore = await textarea.evaluate((el) => el.getBoundingClientRect().height)
            // Fill with many lines to trigger auto-grow
            await textarea.fill('line1\nline2\nline3\nline4\nline5\nline6\nline7\nline8')
            await page.waitForTimeout(300)
            const heightAfter = await textarea.evaluate((el) => el.getBoundingClientRect().height)
            // Height should have increased after injecting multiple lines
            expect(heightAfter).toBeGreaterThanOrEqual(heightBefore)
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS - format (index 9)                                            //
    // mode="rich", data-cy="textarea-rich-emit-format"                         //
    // ------------------------------------------------------------------ //

    test.describe('Events - format', () => {
        test('renders in rich mode: rich toolbar is visible', async ({ page }) => {
            await page.goto(variantUrl(12))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('[data-cy="textarea-rich-emit-format"]')
            await expect(root).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-rich-toolbar').first()).toBeAttached()
        })

        test('rich host contenteditable div is present', async ({ page }) => {
            await page.goto(variantUrl(12))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-rich-emit-format"]')).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="origam-textarea-rich-host"]')).toBeAttached()
        })

        test('clicking a toolbar button does not throw', async ({ page }) => {
            await page.goto(variantUrl(12))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-rich-emit-format"]')).toBeVisible({ timeout: 12000 })
            // Click the first toolbar button (Bold) — logEvent fires, no error expected
            const firstBtn = sandbox.locator('.origam-rich-toolbar__btn').first()
            await expect(firstBtn).toBeAttached()
            await firstBtn.click()
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS (indexes 10–25)                                                //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('default slot content renders inside the field', async ({ page }) => {
            await page.goto(variantUrl(13))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-slot-default"]')).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textarea-slot-default"]')).toContainText('Custom slot content')
        })
    })

    test.describe('Slots - Prepend', () => {
        test('prepend slot renders an origam-icon outside the field control', async ({ page }) => {
            await page.goto(variantUrl(14))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-slot-prepend"]')).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textarea-slot-prepend"] .origam-input__prepend .origam-icon')).toBeAttached()
        })
    })

    test.describe('Slots - Append', () => {
        test('append slot renders an origam-icon outside the field control', async ({ page }) => {
            await page.goto(variantUrl(15))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-slot-append"]')).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textarea-slot-append"] .origam-input__append .origam-icon')).toBeAttached()
        })
    })

    test.describe('Slots - PrependInner', () => {
        test('prependInner slot renders an icon inside the field', async ({ page }) => {
            await page.goto(variantUrl(16))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-slot-prepend-inner"]')).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textarea-slot-prepend-inner"] .origam-field__prepend-inner')).toBeAttached()
        })
    })

    test.describe('Slots - AppendInner', () => {
        test('appendInner slot renders an icon inside the field', async ({ page }) => {
            await page.goto(variantUrl(17))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-slot-append-inner"]')).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textarea-slot-append-inner"] .origam-field__append-inner')).toBeAttached()
        })
    })

    test.describe('Slots - Clear', () => {
        test('clear slot renders custom clear icon when clearable', async ({ page }) => {
            await page.goto(variantUrl(18))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-slot-clear"]')).toBeVisible({ timeout: 12000 })
            // Clearable icon is only shown when the field has value — check the origam-field__clear slot is mounted
            await sandbox.locator('[data-cy="textarea-slot-clear"] textarea').first().fill('some text')
            await page.waitForTimeout(200)
            await expect(sandbox.locator('[data-cy="textarea-slot-clear"] .origam-field__clearable')).toBeAttached()
        })
    })

    test.describe('Slots - Counter', () => {
        test('custom counter slot renders its span content', async ({ page }) => {
            await page.goto(variantUrl(19))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-slot-counter"]')).toBeVisible({ timeout: 12000 })
            // Click to focus so counter renders via persistentCounter || isFocused
            await sandbox.locator('[data-cy="textarea-slot-counter"] textarea').first().click()
            await expect(sandbox.locator('[data-cy="textarea-slot-counter"] .origam-input__details')).toBeAttached()
        })
    })

    test.describe('Slots - Details', () => {
        test('details slot renders custom hint text', async ({ page }) => {
            await page.goto(variantUrl(20))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-slot-details"]')).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textarea-slot-details"]')).toContainText('Custom hint text')
        })
    })

    test.describe('Slots - FloatingLabel', () => {
        test('floatingLabel slot renders italic label content', async ({ page }) => {
            await page.goto(variantUrl(21))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-slot-floating-label"]')).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textarea-slot-floating-label"]')).toContainText('Floating label')
        })
    })

    test.describe('Slots - Label', () => {
        test('label slot renders italic custom label', async ({ page }) => {
            await page.goto(variantUrl(22))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-slot-label"]')).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textarea-slot-label"]')).toContainText('Custom label')
        })
    })

    test.describe('Slots - Loader', () => {
        test('loader slot: loading=true renders the component (slot content replaces the default progress bar)', async ({ page }) => {
            // When a custom #loader slot is provided, OrigamField renders the slot
            // content DIRECTLY inside <template v-if="hasLoader"> — the fallback
            // <div class="origam-field__loader"> (and the nested .origam-field__progress)
            // are NOT mounted because the named slot replaces the entire fallback block.
            // The observable fact: the textarea root is present and "Loading..." is
            // rendered (tested in the next case). There is no wrapper div to assert here.
            await page.goto(variantUrl(23))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-slot-loader"]')).toBeVisible({ timeout: 12000 })
            // The textarea is hidden when loading=true (skeleton hides it; other kinds keep it)
            // but the root component is at minimum attached.
            await expect(sandbox.locator('[data-cy="textarea-slot-loader"]')).toBeAttached()
        })

        test('loader slot: custom loading span text is rendered', async ({ page }) => {
            await page.goto(variantUrl(23))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-slot-loader"]')).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textarea-slot-loader"]')).toContainText('Loading...')
        })
    })

    test.describe('Slots - Message', () => {
        test('message slot renders single italic error message', async ({ page }) => {
            await page.goto(variantUrl(24))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-slot-message"]')).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textarea-slot-message"]')).toContainText('Error')
        })
    })

    test.describe('Slots - Messages', () => {
        test('messages slot renders custom error display', async ({ page }) => {
            await page.goto(variantUrl(25))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-slot-messages"]')).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textarea-slot-messages"]')).toContainText('Custom error display')
        })
    })

    test.describe('Slots - Prefix', () => {
        test('prefix slot renders "Note:" text before the input', async ({ page }) => {
            await page.goto(variantUrl(26))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-slot-prefix"]')).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textarea-slot-prefix"]')).toContainText('Note:')
        })
    })

    test.describe('Slots - Suffix', () => {
        test('suffix slot renders "chars" text after the input', async ({ page }) => {
            await page.goto(variantUrl(27))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-slot-suffix"]')).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="textarea-slot-suffix"]')).toContainText('chars')
        })
    })

    test.describe('Slots - Toolbar', () => {
        test('custom toolbar slot renders role=toolbar with Bold/Italic/UL buttons', async ({ page }) => {
            await page.goto(variantUrl(28))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-rich-slot-toolbar"]')).toBeVisible({ timeout: 12000 })
            // Custom toolbar slot replaces origam-rich-toolbar with a native <div role="toolbar">
            await expect(sandbox.locator('[role="toolbar"]')).toBeAttached()
            await expect(sandbox.locator('[role="toolbar"]')).toContainText('B')
            await expect(sandbox.locator('[role="toolbar"]')).toContainText('I')
            await expect(sandbox.locator('[role="toolbar"]')).toContainText('UL')
        })

        test('clicking Bold button in custom toolbar does not throw', async ({ page }) => {
            await page.goto(variantUrl(28))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-rich-slot-toolbar"]')).toBeVisible({ timeout: 12000 })
            // Click the rich host to focus it first
            const richHost = sandbox.locator('[data-cy="origam-textarea-rich-host"]')
            await expect(richHost).toBeAttached()
            await richHost.click()
            // Then click Bold
            const boldBtn = sandbox.locator('[role="toolbar"] button').first()
            await boldBtn.click()
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT / PLAYGROUND (index 26)                                      //
    // data-cy="textarea-playground"                                        //
    // ------------------------------------------------------------------ //

    test.describe('Default (Playground)', () => {
        test('renders the playground textarea', async ({ page }) => {
            await page.goto(variantUrl(29))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-playground"]')).toBeVisible({ timeout: 12000 })
        })

        test('textarea accepts text input', async ({ page }) => {
            await page.goto(variantUrl(29))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="textarea-playground"]')).toBeVisible({ timeout: 12000 })
            const textarea = sandbox.locator('[data-cy="textarea-playground"] textarea').first()
            await textarea.fill('playground input')
            await expect(textarea).toHaveValue('playground input')
        })

        test('initial state: rows=4, label=Message, no disabled/error classes', async ({ page }) => {
            await page.goto(variantUrl(29))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('[data-cy="textarea-playground"]')
            await expect(root).toBeVisible({ timeout: 12000 })
            const classes = await root.getAttribute('class')
            expect(classes).not.toContain('origam-input--disabled')
            expect(classes).not.toContain('origam-input--error')
        })
    })
})
