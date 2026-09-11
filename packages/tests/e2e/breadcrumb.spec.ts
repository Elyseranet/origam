import { expect, test } from '@playwright/test'

/**
 * RECIPE — Pattern canonique (réf. btn.spec.ts)
 *
 * Navigation DIRECTE via ?variantId=<storyId>-<index> (0-based).
 * JAMAIS networkidle (Histoire garde un websocket HMR ouvert → timeout garanti).
 * Sélecteurs : classe BEM dans frameLocator('iframe[src*="__sandbox"]').
 *
 * ─── OrigamBreadcrumb.story.vue ───────────────────────────────────────────────
 *
 *   STORY_ID  : components-stories-breadcrumb-origambreadcrumb-story-vue
 *   STORY_PATH: /stories/story/<STORY_ID>
 *
 *   Index → Titre
 *     0  → Design      init: { density:'default', divider:'/' }
 *     1  → Functional  init: { disabled:false, tag:'nav' }
 *     2  → Slots - Default
 *     3  → Slots - Item
 *     4  → Slots - Divider
 *     5  → Slots - Item.Title
 *     6  → Default (playground)
 *
 * ─── OrigamBreadcrumbItem.story.vue ──────────────────────────────────────────
 *
 *   STORY_ID  : components-stories-breadcrumb-origambreadcrumbitem-story-vue
 *   STORY_PATH: /stories/story/<STORY_ID>
 *
 *   Index → Titre
 *     0  → Design      init: { title:'Breadcrumb item', color:'primary' }
 *     1  → State       init: { bgColor:'primary' }
 *     2  → Functional  init: { title:'Breadcrumb item', tag:'span' }
 *     3  → Events - click:prepend
 *     4  → Events - click:append
 *     5  → Slots - Default
 *     6  → Slots - Prepend
 *     7  → Slots - Append
 *     8  → Default (playground)
 *
 * BEM roots
 *   OrigamBreadcrumb     → .origam-breadcrumb
 *   OrigamBreadcrumbItem → .origam-breadcrumb-item
 *   OrigamBreadcrumbDivider → .origam-breadcrumb-divider
 *
 * Non-testable headlessly (documenté) :
 *   - logEvent() side-effects (Histoire-internal, not observable from outer page)
 *   - hover/active visual transitions (CSS :hover / :active — headless mouse
 *     events do not reliably trigger pointer-device :hover on sandboxed iframes)
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BC_STORY_ID   = 'components-stories-breadcrumb-origambreadcrumb-story-vue'
const BC_STORY_PATH = '/stories/story/' + BC_STORY_ID
const bcUrl = (idx: number) => `${BC_STORY_PATH}?variantId=${BC_STORY_ID}-${idx}`

const BCI_STORY_ID   = 'components-stories-breadcrumb-origambreadcrumbitem-story-vue'
const BCI_STORY_PATH = '/stories/story/' + BCI_STORY_ID
const bciUrl = (idx: number) => `${BCI_STORY_PATH}?variantId=${BCI_STORY_ID}-${idx}`

// ─── OrigamBreadcrumb ─────────────────────────────────────────────────────────

test.describe('OrigamBreadcrumb', () => {
    test.setTimeout(45000)

    // ----------------------------------------------------------------------- //
    // DESIGN (index 0)                                                         //
    // init: { density:'default', divider:'/' }                                 //
    // ----------------------------------------------------------------------- //

    test.describe('Design', () => {
        test('renders the breadcrumb root with BEM class', async ({ page }) => {
            await page.goto(bcUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const bc = sandbox.locator('.origam-breadcrumb').first()
            await expect(bc).toBeVisible({ timeout: 12000 })
        })

        test('renders a <nav> element by default', async ({ page }) => {
            await page.goto(bcUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const bc = sandbox.locator('.origam-breadcrumb').first()
            await expect(bc).toBeVisible({ timeout: 12000 })
            const tag = await bc.evaluate(el => el.tagName.toLowerCase())
            expect(tag).toBe('nav')
        })

        test('carries the aria-label attribute for accessibility', async ({ page }) => {
            await page.goto(bcUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const bc = sandbox.locator('.origam-breadcrumb').first()
            await expect(bc).toBeVisible({ timeout: 12000 })
            const ariaLabel = await bc.getAttribute('aria-label')
            expect(ariaLabel).toBeTruthy()
        })

        test('default density class is applied (density-default)', async ({ page }) => {
            await page.goto(bcUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const bc = sandbox.locator('.origam-breadcrumb').first()
            await expect(bc).toBeVisible({ timeout: 12000 })
            await expect(bc).toHaveClass(/origam-breadcrumb--density-default/)
        })

        test('renders an ordered list of items (.origam-breadcrumb__items)', async ({ page }) => {
            await page.goto(bcUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const bc = sandbox.locator('.origam-breadcrumb').first()
            await expect(bc).toBeVisible({ timeout: 12000 })
            const list = bc.locator('.origam-breadcrumb__items')
            await expect(list).toBeAttached()
        })

        test('items prop renders breadcrumb-item children', async ({ page }) => {
            await page.goto(bcUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const bc = sandbox.locator('.origam-breadcrumb').first()
            await expect(bc).toBeVisible({ timeout: 12000 })
            const items = bc.locator('.origam-breadcrumb-item')
            const count = await items.count()
            expect(count).toBeGreaterThan(0)
        })

        test('divider renders between items (.origam-breadcrumb-divider)', async ({ page }) => {
            await page.goto(bcUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const bc = sandbox.locator('.origam-breadcrumb').first()
            await expect(bc).toBeVisible({ timeout: 12000 })
            const dividers = bc.locator('.origam-breadcrumb-divider')
            const count = await dividers.count()
            expect(count).toBeGreaterThan(0)
        })

        test('SCSS --density-comfortable: stylesheet declares --density = -8px', async ({ page }) => {
            // Vue scoped styles carry a [data-v-XXXX] attribute — injecting the class
            // programmatically won't activate the scoped rule. We inspect the compiled
            // stylesheet directly to verify the declaration is present.
            await page.goto(bcUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const bc = sandbox.locator('.origam-breadcrumb').first()
            await expect(bc).toBeVisible({ timeout: 12000 })
            const found = await bc.evaluate(() => {
                for (const sheet of document.styleSheets) {
                    try {
                        for (const rule of sheet.cssRules) {
                            if (rule instanceof CSSStyleRule &&
                                rule.selectorText?.includes('density-comfortable') &&
                                rule.style?.getPropertyValue('--origam-breadcrumb---density').trim() === '-8px') {
                                return true
                            }
                        }
                    } catch { /* cross-origin sheet — skip */ }
                }
                return false
            })
            expect(found, 'SCSS --density-comfortable must set --origam-breadcrumb---density to -8px').toBe(true)
        })

        test('SCSS --density-compact: stylesheet declares --density = 8px', async ({ page }) => {
            await page.goto(bcUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const bc = sandbox.locator('.origam-breadcrumb').first()
            await expect(bc).toBeVisible({ timeout: 12000 })
            const found = await bc.evaluate(() => {
                for (const sheet of document.styleSheets) {
                    try {
                        for (const rule of sheet.cssRules) {
                            if (rule instanceof CSSStyleRule &&
                                rule.selectorText?.includes('density-compact') &&
                                rule.style?.getPropertyValue('--origam-breadcrumb---density').trim() === '8px') {
                                return true
                            }
                        }
                    } catch { /* cross-origin sheet — skip */ }
                }
                return false
            })
            expect(found, 'SCSS --density-compact must set --origam-breadcrumb---density to 8px').toBe(true)
        })

        test('SCSS --border: stylesheet declares border-width = thin', async ({ page }) => {
            // The scoped rule `.origam-breadcrumb--border { --origam-breadcrumb---border-width: thin }`
            // cannot be tested via class injection (scoped). Inspect the stylesheet instead.
            await page.goto(bcUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const bc = sandbox.locator('.origam-breadcrumb').first()
            await expect(bc).toBeVisible({ timeout: 12000 })
            const found = await bc.evaluate(() => {
                for (const sheet of document.styleSheets) {
                    try {
                        for (const rule of sheet.cssRules) {
                            if (rule instanceof CSSStyleRule &&
                                rule.selectorText?.includes('origam-breadcrumb--border') &&
                                rule.style?.getPropertyValue('--origam-breadcrumb---border-width')) {
                                return true
                            }
                        }
                    } catch { /* cross-origin sheet — skip */ }
                }
                return false
            })
            expect(found, 'SCSS --border rule must set --origam-breadcrumb---border-width').toBe(true)
        })

        test('SCSS --rounded: stylesheet declares non-zero border-radius', async ({ page }) => {
            await page.goto(bcUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const bc = sandbox.locator('.origam-breadcrumb').first()
            await expect(bc).toBeVisible({ timeout: 12000 })
            const found = await bc.evaluate(() => {
                for (const sheet of document.styleSheets) {
                    try {
                        for (const rule of sheet.cssRules) {
                            if (rule instanceof CSSStyleRule &&
                                rule.selectorText?.includes('origam-breadcrumb--rounded') &&
                                rule.style?.borderRadius && rule.style.borderRadius !== '0px') {
                                return true
                            }
                        }
                    } catch { /* cross-origin sheet — skip */ }
                }
                return false
            })
            expect(found, 'SCSS --rounded rule must declare a non-zero border-radius').toBe(true)
        })
    })

    // ----------------------------------------------------------------------- //
    // FUNCTIONAL (index 1)                                                     //
    // init: { disabled:false, tag:'nav' }                                      //
    // ----------------------------------------------------------------------- //

    test.describe('Functional', () => {
        test('renders breadcrumb root', async ({ page }) => {
            await page.goto(bcUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const bc = sandbox.locator('.origam-breadcrumb').first()
            await expect(bc).toBeVisible({ timeout: 12000 })
        })

        test('disabled=false: items are rendered (not hidden)', async ({ page }) => {
            await page.goto(bcUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const bc = sandbox.locator('.origam-breadcrumb').first()
            await expect(bc).toBeVisible({ timeout: 12000 })
            const items = bc.locator('.origam-breadcrumb-item')
            const count = await items.count()
            expect(count).toBeGreaterThan(0)
        })

        test('last item carries the disabled modifier class (aria-current page = last)', async ({ page }) => {
            await page.goto(bcUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const bc = sandbox.locator('.origam-breadcrumb').first()
            await expect(bc).toBeVisible({ timeout: 12000 })
            // The component marks the last item as disabled by default
            const disabledItem = bc.locator('.origam-breadcrumb-item--disabled').last()
            await expect(disabledItem).toBeAttached()
        })

        // aria-current="page" — non-testable headlessly via stories.
        //
        // FINDING: OrigamBreadcrumb normalises items with { isActive: isLastItem(index) }
        // but OrigamBreadcrumbItem reads isActive from useActive(props) which maps the
        // 'active' prop (IActiveProps), NOT a prop named 'isActive'. The isActive passed
        // from the parent is serialised as an HTML attribute (isactive="false") rather
        // than activating aria-current. This is a DS prop-name mismatch worth investigating
        // (ticket: last item should carry aria-current="page" for screen-reader navigation).
        // Not assertable in headless tests until the DS behaviour is aligned.

    })

    // ----------------------------------------------------------------------- //
    // SLOTS - Default (index 2)                                                //
    // ----------------------------------------------------------------------- //

    test.describe('Slots - Default', () => {
        test('renders manually composed breadcrumb-item children in the default slot', async ({ page }) => {
            await page.goto(bcUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const bc = sandbox.locator('.origam-breadcrumb').first()
            await expect(bc).toBeVisible({ timeout: 12000 })
            const items = bc.locator('.origam-breadcrumb-item')
            const count = await items.count()
            // Story renders Home / Section / Current = 3 items
            expect(count).toBe(3)
        })

        test('renders dividers between manually composed items', async ({ page }) => {
            await page.goto(bcUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const bc = sandbox.locator('.origam-breadcrumb').first()
            await expect(bc).toBeVisible({ timeout: 12000 })
            const dividers = bc.locator('.origam-breadcrumb-divider')
            const count = await dividers.count()
            // 3 items → 2 dividers
            expect(count).toBe(2)
        })
    })

    // ----------------------------------------------------------------------- //
    // SLOTS - Item (index 3)                                                   //
    // ----------------------------------------------------------------------- //

    test.describe('Slots - Item', () => {
        test('custom #item slot renders 3 breadcrumb-item elements', async ({ page }) => {
            await page.goto(bcUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const bc = sandbox.locator('.origam-breadcrumb').first()
            await expect(bc).toBeVisible({ timeout: 12000 })
            const items = bc.locator('.origam-breadcrumb-item')
            const count = await items.count()
            expect(count).toBe(3)
        })
    })

    // ----------------------------------------------------------------------- //
    // SLOTS - Divider (index 4)                                                //
    // ----------------------------------------------------------------------- //

    test.describe('Slots - Divider', () => {
        test('custom #divider slot renders divider containers between items', async ({ page }) => {
            await page.goto(bcUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const bc = sandbox.locator('.origam-breadcrumb').first()
            await expect(bc).toBeVisible({ timeout: 12000 })
            // The #divider slot replaces the default OrigamBreadcrumbDivider;
            // the story renders an OrigamIcon inside, but the .origam-breadcrumb-divider
            // wrapper is no longer present — assert the icon is rendered instead.
            const icons = bc.locator('.origam-icon')
            const count = await icons.count()
            expect(count).toBeGreaterThan(0)
        })
    })

    // ----------------------------------------------------------------------- //
    // SLOTS - Item.Title (index 5)                                             //
    // Non-testable: Histoire sandbox does not mount this variant.             //
    // The slot uses a dot-namespaced slot name (#item.title) — the Histoire   //
    // generic-render-story leaves an empty <div> in the sandbox body for this  //
    // variant, so the component never mounts. This is a Histoire rendering     //
    // limitation with dot-named slots, not a DS bug. Manual verification only. //
    // ----------------------------------------------------------------------- //

    // ----------------------------------------------------------------------- //
    // DEFAULT — playground (index 6)                                           //
    // ----------------------------------------------------------------------- //

    test.describe('Default (playground)', () => {
        test('renders a breadcrumb in the playground variant', async ({ page }) => {
            await page.goto(bcUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const bc = sandbox.locator('.origam-breadcrumb').first()
            await expect(bc).toBeVisible({ timeout: 12000 })
        })

        test('playground: items are rendered', async ({ page }) => {
            await page.goto(bcUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const bc = sandbox.locator('.origam-breadcrumb').first()
            await expect(bc).toBeVisible({ timeout: 12000 })
            const items = bc.locator('.origam-breadcrumb-item')
            const count = await items.count()
            expect(count).toBeGreaterThan(0)
        })
    })
})

// ─── OrigamBreadcrumbItem ─────────────────────────────────────────────────────

test.describe('OrigamBreadcrumbItem', () => {
    test.setTimeout(45000)

    // ----------------------------------------------------------------------- //
    // DESIGN (index 0)                                                         //
    // init: { title:'Breadcrumb item', color:'primary' }                       //
    // ----------------------------------------------------------------------- //

    test.describe('Design', () => {
        test('renders the breadcrumb-item root with BEM class', async ({ page }) => {
            await page.goto(bciUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 12000 })
        })

        test('color=primary applies the utility class origam--color-primary', async ({ page }) => {
            await page.goto(bciUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 12000 })
            await expect(item).toHaveClass(/origam--color-primary/)
        })

        test('title prop renders the text content inside the item', async ({ page }) => {
            await page.goto(bciUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 12000 })
            await expect(item).toContainText('Breadcrumb item')
        })

        test('default density class is applied (density-default)', async ({ page }) => {
            await page.goto(bciUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 12000 })
            await expect(item).toHaveClass(/origam-breadcrumb-item--density-default/)
        })

        test('href prop renders an anchor element (--link modifier class)', async ({ page }) => {
            await page.goto(bciUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 12000 })
            // Story passes href="/" → link.href is set → --link class applied
            await expect(item).toHaveClass(/origam-breadcrumb-item--link/)
        })

        test('SCSS --disabled: pointer-events are none and stylesheet declares the rule', async ({ page }) => {
            // Vue scoped SCSS: injecting --disabled class programmatically won't activate
            // the scoped rule (missing data-v-* attribute). We verify the stylesheet instead.
            await page.goto(bciUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 12000 })
            const found = await item.evaluate(() => {
                for (const sheet of document.styleSheets) {
                    try {
                        for (const rule of sheet.cssRules) {
                            if (rule instanceof CSSStyleRule &&
                                rule.selectorText?.includes('breadcrumb-item--disabled') &&
                                rule.style?.pointerEvents === 'none') {
                                return true
                            }
                        }
                    } catch { /* cross-origin sheet — skip */ }
                }
                return false
            })
            expect(found, 'SCSS --disabled rule must set pointer-events: none').toBe(true)
        })

        test('SCSS --density-comfortable: stylesheet declares --density = -8px', async ({ page }) => {
            await page.goto(bciUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 12000 })
            const found = await item.evaluate(() => {
                for (const sheet of document.styleSheets) {
                    try {
                        for (const rule of sheet.cssRules) {
                            if (rule instanceof CSSStyleRule &&
                                rule.selectorText?.includes('breadcrumb-item--density-comfortable') &&
                                rule.style?.getPropertyValue('--origam-breadcrumb-item---density').trim() === '-8px') {
                                return true
                            }
                        }
                    } catch { /* cross-origin sheet — skip */ }
                }
                return false
            })
            expect(found, 'SCSS --density-comfortable must set --origam-breadcrumb-item---density to -8px').toBe(true)
        })

        test('SCSS --density-compact: stylesheet declares --density = 8px', async ({ page }) => {
            await page.goto(bciUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 12000 })
            const found = await item.evaluate(() => {
                for (const sheet of document.styleSheets) {
                    try {
                        for (const rule of sheet.cssRules) {
                            if (rule instanceof CSSStyleRule &&
                                rule.selectorText?.includes('breadcrumb-item--density-compact') &&
                                rule.style?.getPropertyValue('--origam-breadcrumb-item---density').trim() === '8px') {
                                return true
                            }
                        }
                    } catch { /* cross-origin sheet — skip */ }
                }
                return false
            })
            expect(found, 'SCSS --density-compact must set --origam-breadcrumb-item---density to 8px').toBe(true)
        })
    })

    // ----------------------------------------------------------------------- //
    // STATE (index 1)                                                          //
    // init: { bgColor:'primary' }                                              //
    // ----------------------------------------------------------------------- //

    test.describe('State', () => {
        test('renders breadcrumb-item with bgColor=primary utility class', async ({ page }) => {
            await page.goto(bciUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 12000 })
            await expect(item).toHaveClass(/origam--bg-primary/)
        })

        test('resting state: background-color is non-transparent (token applied)', async ({ page }) => {
            await page.goto(bciUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 12000 })
            const bg = await item.evaluate(el => getComputedStyle(el).backgroundColor)
            expect(bg).not.toBe('rgba(0, 0, 0, 0)')
            expect(bg).not.toBe('transparent')
        })
    })

    // ----------------------------------------------------------------------- //
    // FUNCTIONAL (index 2)                                                     //
    // init: { title:'Breadcrumb item', tag:'span' }                            //
    // ----------------------------------------------------------------------- //

    test.describe('Functional', () => {
        test('renders breadcrumb-item root', async ({ page }) => {
            await page.goto(bciUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 12000 })
        })

        test('tag=span: root element is a <span>', async ({ page }) => {
            await page.goto(bciUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 12000 })
            const tag = await item.evaluate(el => el.tagName.toLowerCase())
            expect(tag).toBe('span')
        })

        test('title renders as text content', async ({ page }) => {
            await page.goto(bciUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 12000 })
            await expect(item).toContainText('Breadcrumb item')
        })

        test('disabled=false (initial): no --disabled class present', async ({ page }) => {
            await page.goto(bciUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 12000 })
            const classes = await item.getAttribute('class')
            expect(classes).not.toContain('origam-breadcrumb-item--disabled')
        })

        test('no href: --link class is absent (plain span, not a link)', async ({ page }) => {
            await page.goto(bciUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 12000 })
            const classes = await item.getAttribute('class')
            expect(classes).not.toContain('origam-breadcrumb-item--link')
        })
    })

    // ----------------------------------------------------------------------- //
    // EVENTS - click:prepend (index 3)                                         //
    // ----------------------------------------------------------------------- //

    test.describe('Events - click:prepend', () => {
        test('prepend area is rendered when prependIcon is set', async ({ page }) => {
            await page.goto(bciUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            // MDI icon loading may be slow on cold Playwright context
            await expect(item).toBeVisible({ timeout: 20000 })
            const prepend = item.locator('.origam-breadcrumb-item__prepend')
            await expect(prepend).toBeAttached()
        })

        test('click on prepend area does not throw', async ({ page }) => {
            await page.goto(bciUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const prepend = sandbox.locator('.origam-breadcrumb-item__prepend').first()
            await expect(prepend).toBeVisible({ timeout: 20000 })
            await prepend.click()
            // logEvent() side-effect is not observable headlessly — no error = success
        })
    })

    // ----------------------------------------------------------------------- //
    // EVENTS - click:append (index 4)                                          //
    // ----------------------------------------------------------------------- //

    test.describe('Events - click:append', () => {
        test('append area is rendered when appendIcon is set', async ({ page }) => {
            await page.goto(bciUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 20000 })
            const append = item.locator('.origam-breadcrumb-item__append')
            await expect(append).toBeAttached()
        })

        test('click on append area does not throw', async ({ page }) => {
            await page.goto(bciUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const append = sandbox.locator('.origam-breadcrumb-item__append').first()
            await expect(append).toBeVisible({ timeout: 20000 })
            await append.click()
        })
    })

    // ----------------------------------------------------------------------- //
    // SLOTS - Default (index 5)                                                //
    // ----------------------------------------------------------------------- //

    test.describe('Slots - Default', () => {
        test('default slot renders custom content (ignores title prop)', async ({ page }) => {
            await page.goto(bciUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 12000 })
            // Story: <strong>Custom</strong> content
            await expect(item).toContainText('Custom')
            await expect(item).toContainText('content')
        })

        test('default slot: a <strong> element is rendered inside the item', async ({ page }) => {
            await page.goto(bciUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 12000 })
            await expect(item.locator('strong')).toBeAttached()
        })
    })

    // ----------------------------------------------------------------------- //
    // SLOTS - Prepend (index 6)                                                //
    // ----------------------------------------------------------------------- //

    test.describe('Slots - Prepend', () => {
        test('prepend slot renders an origam-icon inside the prepend area', async ({ page }) => {
            await page.goto(bciUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 20000 })
            await expect(item.locator('.origam-breadcrumb-item__prepend .origam-icon')).toBeAttached()
        })
    })

    // ----------------------------------------------------------------------- //
    // SLOTS - Append (index 7)                                                 //
    // ----------------------------------------------------------------------- //

    test.describe('Slots - Append', () => {
        test('append slot renders an origam-icon inside the append area', async ({ page }) => {
            await page.goto(bciUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 20000 })
            await expect(item.locator('.origam-breadcrumb-item__append .origam-icon')).toBeAttached()
        })
    })

    // ----------------------------------------------------------------------- //
    // DEFAULT — playground (index 8)                                           //
    // init: { title:'Breadcrumb item', tag:'span' }                            //
    // ----------------------------------------------------------------------- //

    test.describe('Default (playground)', () => {
        test('renders the breadcrumb-item in the playground variant', async ({ page }) => {
            await page.goto(bciUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 12000 })
        })

        test('playground: title renders as text content', async ({ page }) => {
            await page.goto(bciUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const item = sandbox.locator('.origam-breadcrumb-item').first()
            await expect(item).toBeVisible({ timeout: 12000 })
            await expect(item).toContainText('Breadcrumb item')
        })
    })
})
