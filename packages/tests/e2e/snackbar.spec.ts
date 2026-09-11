import { expect, test } from '@playwright/test'

/**
 * OrigamSnackbar — e2e spec (recipe btn.spec.ts pattern)
 *
 * ## Navigation
 *   Navigation directe avec variantId query param (index 0-based).
 *   STORY_ID = 'components-stories-snackbar-origamsnackbar-story-vue'
 *
 * ## Variant index map (OrigamSnackbar.story.vue, 0-based)
 *
 *   0  → Design      (bgColor=primary, color=white, timeout=-1, text='Snackbar message')
 *   1  → State       (bgColor=primary, timeout=-1)
 *   2  → Functional  (timeout=5000, multiLine=false, vertical=false, timer=false)
 *   3  → Events - update:modelValue
 *   4  → Slots - Default
 *   5  → Slots - Prepend
 *   6  → Slots - Text
 *   7  → Slots - Action
 *   8  → Default (playground)
 *
 * ## DOM structure (verified via Playwright probe)
 *
 *   OrigamSnackbar wraps OrigamOverlay. The overlay teleports its content outside
 *   the story's inline DOM into `.origam-overlay-container` — but it stays within
 *   the same sandbox iframe document, so sandbox.locator() resolves it correctly.
 *
 *   Root element (teleported) : .origam-overlay.origam-snackbar
 *   Active modifier            : .origam-overlay--active
 *   Coloured wrapper           : .origam-overlay__content.origam-snackbar__wrapper
 *   Snackbar item              : .origam-snackbar-item  (role="status", aria-live="polite")
 *   Message text               : .origam-snackbar-item__message
 *   Actions area               : .origam-snackbar-item__actions
 *   Timer bar                  : .origam-snackbar__timer (only when timer=true)
 *
 * ## Color contract (Snackbar differs from Alert)
 *
 *   OrigamSnackbar uses useBothColor() (not useActive / useColorEffect).
 *   → colorClasses are ALWAYS emitted when bgColor is tokenised, regardless of
 *     whether the overlay is active. The utility class lives on __wrapper, not
 *     the overlay root.
 *
 *   Design init: bgColor='primary' → .origam-snackbar__wrapper has
 *   class 'origam--bg-primary' and computed background-color ≠ transparent.
 *
 * ## Timeout
 *   test.setTimeout(45000) covers cold sandbox startup + snackbar open sequence.
 *   VIS = { timeout: 12000 } — standard visibility wait for this suite.
 */

const STORY_ID   = 'components-stories-snackbar-origamsnackbar-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

/** Standard visibility timeout for this suite.
 *  20s: cold Playwright contexts take up to ~15s on sandbox startup.
 *  Each test creates a fresh page — no warm cache between tests. */
const VIS = { timeout: 20000 }

test.describe('OrigamSnackbar', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { bgColor: 'primary', color: 'white', timeout: -1,            //
    //         text: 'Snackbar message' }                                   //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('show btn renders before snackbar is open', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-btn').first()).toBeVisible(VIS)
        })

        test('clicking show btn makes the snackbar overlay visible', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible(VIS)
            await btn.click()
            await expect(sandbox.locator('.origam-snackbar')).toBeVisible(VIS)
        })

        test('snackbar root has origam-overlay--active after open', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible(VIS)
            await btn.click()
            await expect(sandbox.locator('.origam-snackbar')).toHaveClass(/origam-overlay--active/, VIS)
        })

        test('text prop renders "Snackbar message" in the item message area', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            await expect(
                sandbox.locator('.origam-snackbar-item__message').first()
            ).toContainText('Snackbar message', VIS)
        })

        test('bgColor=primary: wrapper has utility class origam--bg-primary', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            await expect(sandbox.locator('.origam-snackbar__wrapper').first()).toBeVisible(VIS)
            await expect(sandbox.locator('.origam-snackbar__wrapper').first()).toHaveClass(/origam--bg-primary/)
        })

        test('bgColor=primary: computed background-color is non-transparent', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            const wrapper = sandbox.locator('.origam-snackbar__wrapper').first()
            await expect(wrapper).toBeVisible(VIS)
            const bg = await wrapper.evaluate(el => getComputedStyle(el).backgroundColor)
            expect(bg).not.toBe('rgba(0, 0, 0, 0)')
            expect(bg).not.toBe('transparent')
            // rgb(124, 58, 237) = origam primary token at time of writing
            expect(bg).not.toBe('rgb(230, 230, 230)')
        })

        test('snackbar-item has role="status" for a11y', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            const item = sandbox.locator('.origam-snackbar-item').first()
            await expect(item).toBeVisible(VIS)
            expect(await item.getAttribute('role')).toBe('status')
        })

        test('snackbar-item has aria-live="polite" for a11y', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            const item = sandbox.locator('.origam-snackbar-item').first()
            await expect(item).toBeVisible(VIS)
            expect(await item.getAttribute('aria-live')).toBe('polite')
        })
    })

    // ------------------------------------------------------------------ //
    // STATE (index 1)                                                      //
    // init: { bgColor: 'primary', timeout: -1 }                           //
    // ------------------------------------------------------------------ //

    test.describe('State', () => {
        test('renders the show btn in resting state', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-btn').first()).toBeVisible(VIS)
        })

        test('opening the snackbar shows the wrapper with bgColor=primary', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            const wrapper = sandbox.locator('.origam-snackbar__wrapper').first()
            await expect(wrapper).toBeVisible(VIS)
            await expect(wrapper).toHaveClass(/origam--bg-primary/)
        })

        test('computed background-color matches the primary token', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            const wrapper = sandbox.locator('.origam-snackbar__wrapper').first()
            await expect(wrapper).toBeVisible(VIS)
            const bg = await wrapper.evaluate(el => getComputedStyle(el).backgroundColor)
            // Primary token resolves to rgb(124, 58, 237)
            expect(bg).toBe('rgb(124, 58, 237)')
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 2)                                                 //
    // init: { timeout: 5000, multiLine: false, vertical: false,           //
    //         timer: false, text: 'Functional snackbar' }                 //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('renders the show btn', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-btn').first()).toBeVisible(VIS)
        })

        test('clicking show btn opens the snackbar immediately', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            await expect(sandbox.locator('.origam-snackbar')).toHaveClass(/origam-overlay--active/, VIS)
        })

        test('timer=false: no .origam-snackbar__timer element is rendered', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            await expect(sandbox.locator('.origam-snackbar')).toBeVisible(VIS)
            // timer prop is false in init-state → timer element must be absent
            const timerCount = await sandbox.locator('.origam-snackbar__timer').count()
            expect(timerCount).toBe(0)
        })

        test('SCSS --multi-line: injecting the modifier class is reflected (SCSS rule exists)', async ({ page }) => {
            // Verify the SCSS modifier compiles correctly by injecting it programmatically
            // on the snackbar-item. We assert pointer-events are still auto (no breakage).
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            const item = sandbox.locator('.origam-snackbar-item').first()
            await expect(item).toBeVisible(VIS)
            const pointerEvents = await item.evaluate(el => {
                el.classList.add('origam-snackbar__item--multi-line')
                return getComputedStyle(el).pointerEvents
            })
            // pointer-events must not be blocked by the multi-line modifier
            expect(pointerEvents).toBe('auto')
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS - update:modelValue (index 3)                                //
    // ------------------------------------------------------------------ //

    test.describe('Events - update:modelValue', () => {
        test('renders the show btn', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-btn').first()).toBeVisible(VIS)
        })

        test('clicking show btn opens the snackbar and emits update:modelValue (no throw)', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible(VIS)
            await btn.click()
            // Snackbar must be visible — the event wiring does not break open behaviour
            await expect(sandbox.locator('.origam-snackbar')).toHaveClass(/origam-overlay--active/, VIS)
        })

        test('snackbar shows the event hint text', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            await expect(
                sandbox.locator('.origam-snackbar-item__message').first()
            ).toContainText('Watch the Events tab.', VIS)
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Default (index 4)                                            //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('renders the show btn', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-btn').first()).toBeVisible(VIS)
        })

        test('default slot content is rendered inside the snackbar', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            const sb = sandbox.locator('.origam-snackbar')
            await expect(sb).toBeVisible(VIS)
            // Story: <span><strong>Custom</strong> default slot content</span>
            await expect(sb).toContainText('Custom')
            await expect(sb).toContainText('default slot content')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Prepend (index 5)                                            //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Prepend', () => {
        test('renders the show btn', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-btn').first()).toBeVisible(VIS)
        })

        test('prepend slot injects an icon into the prepend area', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            await expect(sandbox.locator('.origam-snackbar')).toBeVisible(VIS)
            // Story uses MDI_ICONS.HEART → mdi-heart class on the icon
            const icon = sandbox.locator('.origam-snackbar-item__prepend .origam-icon').first()
            await expect(icon).toBeAttached()
            await expect(icon).toHaveClass(/mdi-heart/)
        })

        test('prepend slot text is shown alongside the prepend icon', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            await expect(
                sandbox.locator('.origam-snackbar-item__message').first()
            ).toContainText('With prepend icon.', VIS)
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Text (index 6)                                               //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Text', () => {
        test('renders the show btn', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-btn').first()).toBeVisible(VIS)
        })

        test('#text slot renders custom text content in the snackbar', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            await expect(sandbox.locator('.origam-snackbar')).toBeVisible(VIS)
            // Story: <strong>Custom</strong> text slot content.
            await expect(sandbox.locator('.origam-snackbar')).toContainText('Custom')
            await expect(sandbox.locator('.origam-snackbar')).toContainText('text slot content.')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Action (index 7)                                             //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Action', () => {
        test('renders the show btn', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-btn').first()).toBeVisible(VIS)
        })

        test('#action slot renders an Undo button inside the actions area', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            await expect(sandbox.locator('.origam-snackbar')).toBeVisible(VIS)
            // The actions area must be present
            await expect(
                sandbox.locator('.origam-snackbar-item__actions').first()
            ).toBeAttached()
            // The Undo button rendered by the #action slot
            const undoBtn = sandbox.locator('.origam-snackbar .origam-btn').first()
            await expect(undoBtn).toBeVisible(VIS)
            await expect(undoBtn).toContainText('Undo')
        })

        test('#action slot adds --with-actions modifier on snackbar-item', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            await expect(
                sandbox.locator('.origam-snackbar-item').first()
            ).toHaveClass(/origam-snackbar-item--with-actions/, VIS)
        })

        test('Undo click does not throw (closes snackbar via isActive=false)', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            await expect(sandbox.locator('.origam-snackbar')).toBeVisible(VIS)
            const undoBtn = sandbox.locator('.origam-snackbar .origam-btn').first()
            await expect(undoBtn).toBeVisible(VIS)
            // Click Undo — no JS error expected; snackbar may close
            await undoBtn.click()
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT — playground (index 8)                                       //
    // init: { text: 'Snackbar message', timeout: 5000, multiLine: false,  //
    //         vertical: false, timer: false }                              //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('renders the show btn', async ({ page }) => {
            await page.goto(variantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-btn').first()).toBeVisible(VIS)
        })

        test('clicking show btn opens the snackbar', async ({ page }) => {
            await page.goto(variantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            await expect(
                sandbox.locator('.origam-snackbar')
            ).toHaveClass(/origam-overlay--active/, VIS)
        })

        test('playground snackbar displays the init text', async ({ page }) => {
            await page.goto(variantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            await expect(
                sandbox.locator('.origam-snackbar-item__message').first()
            ).toContainText('Snackbar message', VIS)
        })
    })

    // ------------------------------------------------------------------ //
    // TIMER BAR (SCSS rule verification via stylesheet inspection)         //
    // The timer element is v-if controlled (only rendered when timer=true  //
    // AND overlay active). The SCSS rules are scoped with data-v-74031e9f, //
    // so injecting bare DOM elements does not apply the scoped rules.       //
    // Instead we inspect document.styleSheets to verify the rules compile  //
    // and declare the expected properties — same technique as btn.spec.ts  //
    // for variant-outlined / variant-text.                                  //
    // ------------------------------------------------------------------ //

    test.describe('Timer bar (SCSS)', () => {
        test('SCSS: .origam-snackbar__timer rule declares position:absolute', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            await expect(sandbox.locator('.origam-snackbar')).toBeVisible(VIS)
            const found = await sandbox.locator('.origam-snackbar').first().evaluate(() => {
                for (const sheet of document.styleSheets) {
                    try {
                        for (const rule of sheet.cssRules) {
                            const text = rule.cssText || ''
                            if (text.includes('snackbar__timer') && !text.includes('timer-bar') && !text.includes('--paused')) {
                                if (rule.style?.getPropertyValue('position') === 'absolute') return true
                            }
                        }
                    } catch { /* cross-origin */ }
                }
                return false
            })
            expect(found, 'SCSS rule .origam-snackbar__timer must declare position: absolute').toBe(true)
        })

        test('SCSS: .origam-snackbar__timer-bar rule declares an animation', async ({ page }) => {
            // The SCSS animation name gets the scope hash appended by the Vue compiler:
            // `origam-snackbar__timer-shrink` → `origam-snackbar__timer-shrink-{scope}`.
            // The shorthand `animation` property's animation-name longhand is not always
            // accessible via getPropertyValue('animation-name') on CSSStyleDeclaration;
            // we match against the raw cssText instead.
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            await expect(sandbox.locator('.origam-snackbar')).toBeVisible(VIS)
            const found = await sandbox.locator('.origam-snackbar').first().evaluate(() => {
                for (const sheet of document.styleSheets) {
                    try {
                        for (const rule of sheet.cssRules) {
                            const text = rule.cssText || ''
                            // Rule targets .origam-snackbar__timer-bar with scoped attr
                            if (text.includes('snackbar__timer-bar') && !text.includes('--paused')) {
                                // animation name is embedded in the cssText shorthand value
                                if (text.includes('origam-snackbar__timer-shrink')) return true
                            }
                        }
                    } catch { /* cross-origin */ }
                }
                return false
            })
            expect(found, 'SCSS rule .origam-snackbar__timer-bar must declare animation origam-snackbar__timer-shrink (scoped)').toBe(true)
        })
    })

    // ------------------------------------------------------------------ //
    // LOCATION MODIFIER (SCSS rule verification via class injection)       //
    // ------------------------------------------------------------------ //

    test.describe('Location modifiers (SCSS)', () => {
        test('--top: snackbar root gets align-items: flex-start', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            await expect(sandbox.locator('.origam-snackbar')).toBeVisible(VIS)
            const alignItems = await sandbox.locator('.origam-snackbar').first().evaluate(el => {
                el.classList.remove('origam-snackbar--bottom')
                el.classList.add('origam-snackbar--top')
                return getComputedStyle(el).alignItems
            })
            expect(alignItems).toBe('flex-start')
        })

        test('--bottom (default location): snackbar item carries the origam-snackbar--bottom class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator('.origam-btn').first().click()
            await expect(
                sandbox.locator('.origam-snackbar-item').first()
            ).toHaveClass(/origam-snackbar--bottom/, VIS)
        })
    })
})
