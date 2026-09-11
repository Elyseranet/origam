import { expect, test } from '@playwright/test'

/**
 * OrigamAlert — e2e spec (recipe btn.spec.ts / avatar.spec.ts pattern)
 *
 * ## Navigation
 *   Navigation directe avec variantId query param (index 0-based).
 *   STORY_ID = 'components-stories-alert-origamalert-story-vue'
 *
 * ## Variant index map (OrigamAlert.story.vue, 0-based)
 *
 *   0  → Design
 *   1  → State
 *   2  → Functional
 *   3  → Events - click:close
 *   4  → Events - update:hover
 *   5  → Events - update:modelValue
 *   6  → Slots - Default
 *   7  → Slots - Title
 *   8  → Slots - Text
 *   9  → Slots - Prepend
 *  10  → Slots - Append
 *  11  → Slots - Close
 *  12  → Slots - Wrapper
 *  13  → Default (playground)
 *
 * ## Color / class contract
 *
 *   useStateEffect.colorClasses returns [] when isActive=true OR isHover=true.
 *   Alert uses useActive(props, 'modelValue'), default modelValue=true → isActive=true.
 *   Therefore, in variants where modelValue is not explicitly false, colorClasses=[].
 *   Background is owned by colorStyles (inline style via useStyle).
 *
 *   In the State variant, init-state = { bgColor: 'info' } without modelValue=true
 *   (hover/active not forced) → isActive=false → colorClasses=['origam--bg-info'].
 *
 *   statusClasses = ['origam-alert--{status}'] regardless of active state.
 *
 * ## Timeout note
 *   VIS = { timeout: 20000 } — cold Playwright contexts take up to ~15s to
 *   mount the Histoire sandbox iframe (font loading + Vite HMR handshake).
 *   test.setTimeout(60000) covers the full sequence: gotoVariant + VIS wait.
 */

const STORY_ID   = 'components-stories-alert-origamalert-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

/** Visibility timeout: absorbs cold Playwright sandbox startup (~15s). */
const VIS = { timeout: 20000 }

test.describe('OrigamAlert', () => {
    test.setTimeout(60000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { text: 'Alert message.', status: undefined, color: undefined, bgColor: undefined }
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders the alert root with BEM class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
        })

        test('default role is "status" (no status prop)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            const role = await alert.getAttribute('role')
            expect(role).toBe('status')
        })

        test('text prop renders "Alert message." in the body', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            await expect(alert.locator('.origam-alert__body')).toContainText('Alert message.')
        })

        test('default density class is applied (density-default)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            await expect(alert).toHaveClass(/origam-alert--density-default/)
        })

        test('alert is active by default (modelValue=true → origam-alert--active class)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            await expect(alert).toHaveClass(/origam-alert--active/)
        })

        test('underlay element is present in the DOM', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            await expect(alert.locator('.origam-alert__underlay')).toBeAttached()
        })

        test('content area is present in the DOM', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            await expect(alert.locator('.origam-alert__content')).toBeAttached()
        })
    })

    // ------------------------------------------------------------------ //
    // STATE (index 1)                                                      //
    // init: { bgColor: 'info' }                                           //
    // isActive=false → colorClasses=['origam--bg-info']                   //
    // ------------------------------------------------------------------ //

    test.describe('State', () => {
        test('renders with a non-transparent background when bgColor="info"', async ({ page }) => {
            // The State variant init-state = { bgColor: 'info' } but does NOT set modelValue=false.
            // OrigamAlert defaults to modelValue=true → isActive=true.
            // useStateEffect returns colorClasses=[] when isActive=true (classes-first rule).
            // Background is owned by useStyle (injected <style> tag via colorStyles), not a utility class.
            // We assert via getComputedStyle rather than a class assertion.
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            const bg = await alert.evaluate(el => getComputedStyle(el).backgroundColor)
            expect(bg).not.toBe('rgba(0, 0, 0, 0)')
            expect(bg).not.toBe('transparent')
        })

        test('bgColor=info produces a non-transparent background', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            const bg = await alert.evaluate(el => getComputedStyle(el).backgroundColor)
            expect(bg).not.toBe('rgba(0, 0, 0, 0)')
            expect(bg).not.toBe('transparent')
        })

        test('renders hover instruction text', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            await expect(alert).toContainText('Hover over this alert.')
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 2)                                                 //
    // init: { text: 'Alert message.', title: '', modelValue: true, closable: false }
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('renders with modelValue=true (active + visible)', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            await expect(alert).toHaveClass(/origam-alert--active/)
        })

        test('closable=false: close button is absent in initial state', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            // data-cy="close" is on the inner btn — should not be present when closable=false
            await expect(alert.locator('[data-cy="close"]')).not.toBeAttached()
        })

        test('SCSS --density-comfortable: adding the class sets density to -8px', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            const densityValue = await alert.evaluate(el => {
                el.classList.remove('origam-alert--density-default')
                el.classList.add('origam-alert--density-comfortable')
                return getComputedStyle(el).getPropertyValue('--origam-alert---density').trim()
            })
            expect(densityValue).toBe('-8px')
        })

        test('SCSS --density-compact: adding the class sets density to 8px', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            const densityValue = await alert.evaluate(el => {
                el.classList.remove('origam-alert--density-default')
                el.classList.add('origam-alert--density-compact')
                return getComputedStyle(el).getPropertyValue('--origam-alert---density').trim()
            })
            expect(densityValue).toBe('8px')
        })

        test('SCSS --density-default: density variable is 0px', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            const densityValue = await alert.evaluate(el => {
                return getComputedStyle(el).getPropertyValue('--origam-alert---density').trim()
            })
            expect(densityValue).toBe('0px')
        })

        test('SCSS --warning: injecting status class sets a non-empty background-color variable', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            const bg = await alert.evaluate(el => {
                el.classList.add('origam-alert--warning')
                return getComputedStyle(el).getPropertyValue('--origam-alert---background-color').trim()
            })
            expect(bg).toBeTruthy()
            expect(bg.length).toBeGreaterThan(0)
        })

        test('SCSS --rounded: adding class produces a non-zero border-radius', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            const radius = await alert.evaluate(el => {
                el.classList.add('origam-alert--rounded')
                return getComputedStyle(el).borderRadius
            })
            expect(radius).not.toBe('0px')
            expect(radius).not.toBe('')
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS (indexes 3–5)                                                 //
    // ------------------------------------------------------------------ //

    test.describe('Events - click:close', () => {
        test('renders a closable alert with the close button', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            await expect(alert.locator('[data-cy="close"]')).toBeVisible()
        })

        test('clicking the close button does not throw', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const closeBtn = sandbox.locator('[data-cy="close"]').first()
            await expect(closeBtn).toBeVisible(VIS)
            await closeBtn.click()
        })
    })

    test.describe('Events - update:hover', () => {
        test('renders an alert with hover instruction text', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            await expect(alert).toContainText('Hover over this alert to fire update:hover.')
        })

        test('hovering over the alert does not throw', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            await alert.hover()
            await page.waitForTimeout(300)
        })
    })

    test.describe('Events - update:modelValue', () => {
        test('renders a closable alert for dismiss interaction', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            await expect(alert.locator('[data-cy="close"]')).toBeVisible()
        })

        test('clicking close does not throw (logEvent side-effect not observable headlessly)', async ({ page }) => {
            // This variant wires @update:model-value to logEvent() only — no v-model toggle.
            // The alert stays active after click; the emit is an Histoire-internal side-effect
            // that cannot be observed from the outer page. We verify the close button is present
            // and the click does not throw.
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            const closeBtn = alert.locator('[data-cy="close"]').first()
            await expect(closeBtn).toBeVisible()
            await closeBtn.click()
            await page.waitForTimeout(300)
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS (indexes 6–12)                                                 //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('default slot renders custom content', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            await expect(alert).toContainText('Custom default slot content')
        })
    })

    test.describe('Slots - Title', () => {
        test('title slot renders custom strong element in the title area', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            await expect(alert.locator('.origam-alert__title')).toBeVisible()
            await expect(alert.locator('.origam-alert__title')).toContainText('Custom title via slot')
        })
    })

    test.describe('Slots - Text', () => {
        test('text slot renders custom italic content in the body', async ({ page }) => {
            await page.goto(variantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            await expect(alert.locator('.origam-alert__body')).toBeVisible()
            await expect(alert.locator('.origam-alert__body')).toContainText('Custom text slot content')
        })
    })

    test.describe('Slots - Prepend', () => {
        test('prepend slot renders an origam-icon in the prepend area', async ({ page }) => {
            await page.goto(variantUrl(9))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            await expect(alert.locator('.origam-alert__prepend')).toBeAttached()
            await expect(alert.locator('.origam-alert__prepend .origam-icon')).toBeAttached()
        })
    })

    test.describe('Slots - Append', () => {
        test('append slot renders an origam-icon in the append area', async ({ page }) => {
            await page.goto(variantUrl(10))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            await expect(alert.locator('.origam-alert__append')).toBeAttached()
            await expect(alert.locator('.origam-alert__append .origam-icon')).toBeAttached()
        })
    })

    test.describe('Slots - Close', () => {
        test('close slot renders a custom origam-icon; default data-cy="close" btn is absent', async ({ page }) => {
            await page.goto(variantUrl(11))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            // The custom close slot replaces OrigamBtn — origam-icon is direct child
            await expect(alert.locator('.origam-alert__close .origam-icon')).toBeAttached()
            // Default close btn with data-cy="close" is NOT rendered in this variant
            await expect(alert.locator('[data-cy="close"]')).not.toBeAttached()
        })
    })

    test.describe('Slots - Wrapper', () => {
        test('wrapper slot replaces default layout; origam-alert__content is absent', async ({ page }) => {
            await page.goto(variantUrl(12))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            await expect(alert).toContainText('Custom wrapper slot content')
            // Default origam-alert__content must NOT be present when wrapper slot is used
            await expect(alert.locator('.origam-alert__content')).not.toBeAttached()
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT / PLAYGROUND (index 13)                                      //
    // init: { text: 'Alert message.', status: undefined }                  //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('renders the alert root with BEM class', async ({ page }) => {
            await page.goto(variantUrl(13))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
        })

        test('default role is "status" (no status prop)', async ({ page }) => {
            await page.goto(variantUrl(13))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            const role = await alert.getAttribute('role')
            expect(role).toBe('status')
        })

        test('alert is active by default (modelValue implicit true → --active class)', async ({ page }) => {
            await page.goto(variantUrl(13))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            await expect(alert).toHaveClass(/origam-alert--active/)
        })

        test('text prop renders "Alert message." in the body', async ({ page }) => {
            await page.goto(variantUrl(13))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const alert = sandbox.locator('.origam-alert').first()
            await expect(alert).toBeVisible(VIS)
            await expect(alert.locator('.origam-alert__body')).toContainText('Alert message.')
        })
    })
})
