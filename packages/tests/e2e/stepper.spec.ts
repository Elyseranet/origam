import { expect, test } from '@playwright/test'

/**
 * OrigamStepper — e2e spec (pattern canonique, réf. btn.spec.ts)
 *
 * ## Variants réels (grep '<Variant' OrigamStepper.story.vue — 5 Variants, 0-based)
 *
 *   0  → Design       init: { color:'primary', size:'default', density:'default' }
 *                     modelValue=1 → item[0]=done, item[1]=active, item[2-3]=pending
 *   1  → Functional   init: { modelValue:1, orientation:'horizontal',
 *                              clickable:false, showConnectors:true }
 *   2  → Events - update:modelValue  clickable=true, modelValue=1
 *   3  → Slots - Default             slot = <span>Custom slot content</span>
 *   4  → Default (playground)        modelValue=1, clickable=false, color='primary'
 *
 * ## Data defaultItems (4 items définis dans la story)
 *   [0] Account   / Email & password
 *   [1] Profile   / Personal info
 *   [2] Plan      / Choose plan
 *   [3] Confirm   / Review & submit
 *
 * ## Pas de networkidle (Histoire garde un WS HMR ouvert → ne résout jamais).
 * ## Pas de data-cy dans les stories canoniques → sélecteurs BEM.
 * ## data-cy="stepper-item-{index}" est posé par OrigamStepper.vue sur chaque
 *    OrigamStepperItem via :data-cy="`stepper-item-${index}`" (composant parent).
 */

const STORY_ID   = 'components-stories-stepper-origamstepper-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamStepper', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { color:'primary', size:'default', density:'default' }        //
    // modelValue=1 hard-coded in the template                             //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders the stepper root with BEM class origam-stepper', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
        })

        test('default orientation class is origam-stepper--horizontal', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            await expect(stepper).toHaveClass(/origam-stepper--horizontal/)
        })

        test('default size class is applied (size-default)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            await expect(stepper).toHaveClass(/origam-stepper--size-default/)
        })

        test('default density class is applied (density-default)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            await expect(stepper).toHaveClass(/origam-stepper--density-default/)
        })

        test('renders exactly 4 step items (defaultItems has 4 entries)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            const items = stepper.locator('.origam-stepper-item')
            await expect(items).toHaveCount(4)
        })

        test('renders 3 connectors between 4 items (n-1)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            const connectors = stepper.locator('.origam-stepper__connector')
            await expect(connectors).toHaveCount(3)
        })

        test('modelValue=1: item[0] carries the done status class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            const item0 = stepper.locator('[data-cy="stepper-item-0"]')
            await expect(item0).toHaveClass(/origam-stepper-item--done/)
        })

        test('modelValue=1: item[1] carries the active status class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            const item1 = stepper.locator('[data-cy="stepper-item-1"]')
            await expect(item1).toHaveClass(/origam-stepper-item--active/)
        })

        test('modelValue=1: item[2] carries the pending status class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            const item2 = stepper.locator('[data-cy="stepper-item-2"]')
            await expect(item2).toHaveClass(/origam-stepper-item--pending/)
        })

        test('done item[0]: indicator carries the done modifier class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            const doneIndicator = stepper.locator('[data-cy="stepper-item-0"] .origam-stepper-item__indicator--done')
            await expect(doneIndicator).toBeVisible()
        })

        test('done item[0]: indicator contains an origam-icon (checkmark)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            const doneIndicator = stepper.locator('[data-cy="stepper-item-0"] .origam-stepper-item__indicator--done')
            await expect(doneIndicator.locator('.origam-icon')).toBeAttached()
        })

        test('active item[1]: indicator carries the active modifier class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            const activeIndicator = stepper.locator('[data-cy="stepper-item-1"] .origam-stepper-item__indicator--active')
            await expect(activeIndicator).toBeVisible()
        })

        test('active indicator has distinct background-color from pending indicator', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            const activeBg = await stepper
                .locator('[data-cy="stepper-item-1"] .origam-stepper-item__indicator--active')
                .evaluate(el => getComputedStyle(el).backgroundColor)
            const pendingBg = await stepper
                .locator('[data-cy="stepper-item-2"] .origam-stepper-item__indicator--pending')
                .evaluate(el => getComputedStyle(el).backgroundColor)
            expect(activeBg).not.toBe(pendingBg)
        })

        test('stepper is a <nav> element (semantic landmark)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            const tag = await stepper.evaluate(el => el.tagName.toLowerCase())
            expect(tag).toBe('nav')
        })

        test('stepper has aria-label (a11y — localised string)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            const label = await stepper.getAttribute('aria-label')
            expect(label).toBeTruthy()
        })

        test('horizontal stepper has flex-direction row', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            const flexDir = await stepper.evaluate(el => getComputedStyle(el).flexDirection)
            expect(flexDir).toBe('row')
        })

        test('first item label shows title text "Account"', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            await expect(
                stepper.locator('[data-cy="stepper-item-0"] .origam-stepper-item__title')
            ).toContainText('Account')
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 1)                                                 //
    // init: { modelValue:1, orientation:'horizontal',                     //
    //         clickable:false, showConnectors:true }                      //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('renders stepper root', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
        })

        test('orientation=horizontal: stepper carries origam-stepper--horizontal class', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            await expect(stepper).toHaveClass(/origam-stepper--horizontal/)
        })

        test('showConnectors=true: 3 connector spans visible', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            await expect(stepper.locator('.origam-stepper__connector')).toHaveCount(3)
        })

        test('clickable=false: items render as <div> (not <button>)', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            // When clickable=false the parent injects clickable=false via provide/inject
            // so each OrigamStepperItem renders as <div>
            const tag = await stepper.locator('[data-cy="stepper-item-0"]').evaluate(
                el => el.tagName.toLowerCase()
            )
            expect(tag).toBe('div')
        })

        test('connector before active item carries done modifier class', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            // modelValue=1 → connector at index 1 (between item0 and item1) is --done
            const connectors = stepper.locator('.origam-stepper__connector')
            await expect(connectors.first()).toHaveClass(/origam-stepper__connector--done/)
        })

        test('connector after active item carries pending modifier class', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            // modelValue=1 → connector at index 2 (between item1 and item2) is --pending
            const connectors = stepper.locator('.origam-stepper__connector')
            await expect(connectors.nth(1)).toHaveClass(/origam-stepper__connector--pending/)
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS - update:modelValue (index 2)                                //
    // clickable=true, modelValue=1                                        //
    // ------------------------------------------------------------------ //

    test.describe('Events - update:modelValue', () => {
        test('renders stepper with clickable=true: items render as <button>', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            const tag = await stepper.locator('[data-cy="stepper-item-0"]').evaluate(
                el => el.tagName.toLowerCase()
            )
            expect(tag).toBe('button')
        })

        test('clicking item[2] triggers handleClick without error', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            // item[1] is active (modelValue=1) and rendered as disabled button
            // item[2] is pending → must be clickable
            const item2 = stepper.locator('[data-cy="stepper-item-2"]')
            await expect(item2).toBeVisible({ timeout: 5000 })
            // No error thrown = pass (logEvent is an Histoire-internal side-effect
            // not observable from the outer page)
            await item2.click()
        })

        test('clicking item[0] (done) triggers handleClick without error', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            const item0 = stepper.locator('[data-cy="stepper-item-0"]')
            await expect(item0).toBeVisible({ timeout: 5000 })
            await item0.click()
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Default (index 3)                                           //
    // Slot content: <span>Custom slot content</span>                     //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('renders stepper root when slot is used', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
        })

        test('default slot content is rendered inside the stepper', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            await expect(stepper).toContainText('Custom slot content')
        })

        test('when slot is used, no .origam-stepper-item is rendered (slot replaces items)', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            // The default slot bypasses the v-for over items → no StepperItem rendered
            await expect(stepper.locator('.origam-stepper-item')).toHaveCount(0)
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT / Playground (index 4)                                      //
    // init: { modelValue:1, orientation:'horizontal',                    //
    //         clickable:false, showConnectors:true, color:'primary' }    //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('renders stepper root', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
        })

        test('playground stepper carries origam--color-primary from color=primary', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            await expect(stepper).toHaveClass(/origam--color-primary/)
        })

        test('modelValue=1: active item is item[1]', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            await expect(
                stepper.locator('[data-cy="stepper-item-1"]')
            ).toHaveClass(/origam-stepper-item--active/)
        })

        test('active item[1] is rendered as <div> (clickable=false by default)', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            const tag = await stepper.locator('[data-cy="stepper-item-1"]').evaluate(
                el => el.tagName.toLowerCase()
            )
            expect(tag).toBe('div')
        })

        test('active item[1] carries aria-current="step" (a11y)', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            // This variant (index 4 / Default playground) takes longer to mount
            // when the browser has just navigated away from the slot variant (index 3).
            await expect(stepper).toBeVisible({ timeout: 20000 })
            const ariaCurrent = await stepper
                .locator('[data-cy="stepper-item-1"]')
                .getAttribute('aria-current')
            expect(ariaCurrent).toBe('step')
        })

        test('pending items do not have aria-current', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            const ariaCurrent = await stepper
                .locator('[data-cy="stepper-item-2"]')
                .getAttribute('aria-current')
            expect(ariaCurrent).toBeNull()
        })

        test('done item[0] does not have aria-current', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            const ariaCurrent = await stepper
                .locator('[data-cy="stepper-item-0"]')
                .getAttribute('aria-current')
            expect(ariaCurrent).toBeNull()
        })

        test('each step item has an aria-label (a11y)', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            for (let i = 0; i < 4; i++) {
                const label = await stepper
                    .locator(`[data-cy="stepper-item-${i}"]`)
                    .getAttribute('aria-label')
                expect(label, `item[${i}] should have aria-label`).toBeTruthy()
            }
        })

        test('SCSS vertical: adding origam-stepper--vertical switches flex-direction to column', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const stepper = sandbox.locator('.origam-stepper').first()
            await expect(stepper).toBeVisible({ timeout: 20000 })
            // Inject the modifier class directly to test the SCSS rule headlessly
            const flexDir = await stepper.evaluate(el => {
                el.classList.add('origam-stepper--vertical')
                return getComputedStyle(el).flexDirection
            })
            expect(flexDir).toBe('column')
        })
    })
})
