import { expect, test } from '@playwright/test'

/**
 * OrigamBlockquote — runtime probes.
 *
 * Variants (0-based index matching <Variant> order in the story file).
 * ADR-005 ticket #25 — variant is now a props preset (`useDefaults`), not a
 * CSS layer. New Variants are NEVER inserted mid-list (it silently shifts
 * every index below and breaks this file) — none were needed here: the
 * preset-tier demo lives INSIDE the existing Design Variant (index 0, see
 * OrigamBlockquote.story.vue), mirroring the Kbd pilot's own pattern
 * (kbd.spec.ts). Indices below are unchanged from pre-#25.
 *
 *   0 → Design      (init: variant='default', bgColor='primary', lang='auto', align='left')
 *                    renders TWO <origam-blockquote> side by side: #1 the
 *                    resolved preset as-is (same props as before #25 — every
 *                    pre-existing assertion below targets THIS one via
 *                    `.first()`), #2 the SAME variant with an explicit
 *                    `border="0px 16px 0px 0px"` — the ADR-005 Q2 override
 *                    demo (see the "ADR-005 — variant preset tier" block).
 *   1 → Functional  (init: tag='blockquote', author='Linus Torvalds', source='LKML, 2003',
 *                          cite='https://lkml.org/lkml/2003/8/26/142', variant='default',
 *                          color='primary')
 *   2 → Slots - Default
 *   3 → Slots - Author   (static variant='elegant' — used below to assert the
 *                          resolved `elegant` preset without driving HstSelect)
 *   4 → Slots - Source
 *   5 → Default     (playground)
 *
 * No data-cy attributes in the story — selectors use BEM classes.
 * Navigation: direct goto with variantId query param (pattern: btn.spec.ts / alert.spec.ts).
 * No waitForLoadState('networkidle') — Histoire keeps an HMR WebSocket open.
 * VIS = { timeout: 20000 } absorbs cold Histoire sandbox startup (~15s).
 *
 * ## Non-testable headless
 *   - variant='quoted' decorative glyph: no dedicated Variant in the story;
 *     DOM injection cannot probe Vue scoped SCSS (data-v-xxx missing on injected nodes).
 *     See manual test checklist at the bottom of this file.
 */

const STORY_ID   = 'components-stories-blockquote-origamblockquote-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

/** Absorbs cold Playwright sandbox startup (~15s). */
const VIS = { timeout: 20000 }

test.describe('OrigamBlockquote', () => {
    test.setTimeout(60000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: variant='default', bgColor='primary', lang='auto', align='left'//
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders root with BEM class origam-blockquote', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-blockquote').first()).toBeVisible(VIS)
        })

        test('root element is a native <blockquote>', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('.origam-blockquote').first()
            await expect(host).toBeVisible(VIS)
            const tag = await host.evaluate(el => el.tagName.toLowerCase())
            expect(tag).toBe('blockquote')
        })

        test('variant=default class is applied', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('.origam-blockquote').first()
            await expect(host).toBeVisible(VIS)
            await expect(host).toHaveClass(/origam-blockquote--variant-default/)
        })

        test('variant=default paints a non-zero left accent border (border-inline-start)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('.origam-blockquote').first()
            await expect(host).toBeVisible(VIS)
            const width = await host.evaluate(el =>
                getComputedStyle(el).borderInlineStartWidth ||
                getComputedStyle(el).borderLeftWidth
            )
            expect(width).not.toBe('0px')
            expect(width).not.toBe('')
        })

        test('bgColor=primary accent class is applied', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('.origam-blockquote').first()
            await expect(host).toBeVisible(VIS)
            await expect(host).toHaveClass(/origam-blockquote--accent-primary/)
        })

        test('align=left class is applied', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('.origam-blockquote').first()
            await expect(host).toBeVisible(VIS)
            await expect(host).toHaveClass(/origam-blockquote--align-left/)
        })

        test('body slot renders inside .origam-blockquote__body', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const body = sandbox.locator('.origam-blockquote__body').first()
            await expect(body).toBeVisible(VIS)
            await expect(body).toContainText('Talk is cheap')
        })

        test('attribution footer renders with author and source', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const footer = sandbox.locator('.origam-blockquote__attribution').first()
            await expect(footer).toBeVisible(VIS)
            const text = await footer.textContent()
            expect(text).toContain('Linus Torvalds')
            expect(text).toContain('LKML, 2003')
        })

        test('attribution footer starts with em-dash —', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const footer = sandbox.locator('.origam-blockquote__attribution').first()
            await expect(footer).toBeVisible(VIS)
            const text = await footer.textContent()
            expect(text?.trim().startsWith('—')).toBe(true)
        })

        test('source is rendered in a <cite> element', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const cite = sandbox.locator('.origam-blockquote__source').first()
            await expect(cite).toBeVisible(VIS)
            const tag = await cite.evaluate(el => el.tagName.toLowerCase())
            expect(tag).toBe('cite')
        })

        test('variant=default does NOT render the decorative quote mark', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('.origam-blockquote').first()
            await expect(host).toBeVisible(VIS)
            // showQuoteMark is only true for variant='quoted'
            await expect(sandbox.locator('.origam-blockquote__mark--bg')).toHaveCount(0)
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 1)                                                 //
    // init: tag='blockquote', author='Linus Torvalds', source='LKML, 2003'//
    //        cite='https://lkml.org/lkml/2003/8/26/142', variant='default' //
    //        color='primary'                                                //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('cite prop is set as the cite HTML attribute', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('.origam-blockquote').first()
            await expect(host).toBeVisible(VIS)
            const cite = await host.evaluate(el => el.getAttribute('cite'))
            expect(cite).toBe('https://lkml.org/lkml/2003/8/26/142')
        })

        test('author prop renders inside .origam-blockquote__author', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const author = sandbox.locator('.origam-blockquote__author').first()
            await expect(author).toBeVisible(VIS)
            await expect(author).toContainText('Linus Torvalds')
        })

        test('source prop renders inside .origam-blockquote__source', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const source = sandbox.locator('.origam-blockquote__source').first()
            await expect(source).toBeVisible(VIS)
            await expect(source).toContainText('LKML, 2003')
        })

        test('color=primary text class is applied', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('.origam-blockquote').first()
            await expect(host).toBeVisible(VIS)
            await expect(host).toHaveClass(/origam-blockquote--color-primary/)
        })

        test('attribution footer has has-attribution class', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('.origam-blockquote').first()
            await expect(host).toBeVisible(VIS)
            await expect(host).toHaveClass(/origam-blockquote--has-attribution/)
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - DEFAULT (index 2)                                            //
    // Renders rich HTML inside the default slot                            //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('rich HTML slot content renders in the body', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const body = sandbox.locator('.origam-blockquote__body').first()
            await expect(body).toBeVisible(VIS)
            // The slot contains <em> and <strong> tags
            await expect(body.locator('em')).toBeVisible()
            await expect(body.locator('strong')).toBeVisible()
        })

        test('attribution footer renders with author and source via props', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const footer = sandbox.locator('.origam-blockquote__attribution').first()
            await expect(footer).toBeVisible(VIS)
            const text = await footer.textContent()
            expect(text).toContain('Linus Torvalds')
            expect(text).toContain('LKML, 2003')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - AUTHOR (index 3)                                             //
    // Custom #author slot wins over the prop                               //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Author', () => {
        test('custom #author slot renders a link in the attribution', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('.origam-blockquote').first()
            await expect(host).toBeVisible(VIS)
            const link = sandbox.locator('.origam-blockquote__author a').first()
            await expect(link).toBeVisible(VIS)
            const href = await link.getAttribute('href')
            const text = await link.textContent()
            expect(href).toContain('Steve_Jobs')
            expect(text?.trim()).toBe('Steve Jobs')
        })

        test('variant=elegant class is applied', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('.origam-blockquote').first()
            await expect(host).toBeVisible(VIS)
            await expect(host).toHaveClass(/origam-blockquote--variant-elegant/)
        })

        test('cite prop set as attribute on the blockquote element', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('.origam-blockquote').first()
            await expect(host).toBeVisible(VIS)
            const cite = await host.evaluate(el => el.getAttribute('cite'))
            expect(cite).toContain('stanford.edu')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - SOURCE (index 4)                                             //
    // Custom #source slot replaces the source prop                        //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Source', () => {
        test('custom #source slot renders a link inside <cite>', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('.origam-blockquote').first()
            await expect(host).toBeVisible(VIS)
            const sourceLink = sandbox.locator('.origam-blockquote__source a').first()
            await expect(sourceLink).toBeVisible(VIS)
            const href = await sourceLink.getAttribute('href')
            expect(href).toContain('Discours')
        })

        test('source slot content contains the expected text', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const source = sandbox.locator('.origam-blockquote__source').first()
            await expect(source).toBeVisible(VIS)
            await expect(source).toContainText('Discours de la méthode')
        })

        test('color=success text class is applied', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('.origam-blockquote').first()
            await expect(host).toBeVisible(VIS)
            await expect(host).toHaveClass(/origam-blockquote--color-success/)
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT / PLAYGROUND (index 5)                                       //
    // init: variant='default', bgColor='primary', lang='auto', align='left'//
    //        author='Linus Torvalds', source='LKML, 2003',                 //
    //        cite='https://lkml.org/lkml/2003/8/26/142', tag='blockquote' //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('renders with BEM root class', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-blockquote').first()).toBeVisible(VIS)
        })

        test('variant=default + bgColor=primary classes coexist', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('.origam-blockquote').first()
            await expect(host).toBeVisible(VIS)
            await expect(host).toHaveClass(/origam-blockquote--variant-default/)
            await expect(host).toHaveClass(/origam-blockquote--accent-primary/)
        })

        test('quote mark is absent (variant is not quoted)', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('.origam-blockquote').first()
            await expect(host).toBeVisible(VIS)
            await expect(sandbox.locator('.origam-blockquote__mark--bg')).toHaveCount(0)
        })

        test('cite attribute is set on the root element', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('.origam-blockquote').first()
            await expect(host).toBeVisible(VIS)
            const cite = await host.evaluate(el => el.getAttribute('cite'))
            expect(cite).toBe('https://lkml.org/lkml/2003/8/26/142')
        })
    })

    // ------------------------------------------------------------------ //
    // VARIANT=QUOTED — manual test residuals (not automatable headlessly) //
    //                                                                      //
    // The story has NO dedicated Variant for variant='quoted'. Every       //
    // Variant starts with variant='default' or variant='elegant'. The      //
    // HstSelect control cannot be driven reliably in headless Playwright.  //
    //                                                                      //
    // DOM injection trick (createElement + classList.add) does NOT work:   //
    // Vue 3 scoped SCSS adds data-v-xxxx on component-owned nodes; a       //
    // vanilla-injected element lacks that attribute, so scoped rules never //
    // match it and getComputedStyle returns browser defaults (position=     //
    // static, fontSize=16px, opacity=1). This produces false negatives     //
    // hiding real regressions.                                              //
    //                                                                      //
    // MANUAL TEST CHECKLIST (run before any release touching Blockquote):  //
    //   1. Open Design variant → set Variant control to "quoted"           //
    //      → decorative glyph appears (aria-hidden span.mark--bg)          //
    //      → glyph is visually large (≥ 5rem), low-opacity, positioned     //
    //        top-left of the blockquote                                     //
    //   2. Change bgColor to primary / success / danger                    //
    //      → glyph colour changes accordingly                               //
    //   3. Change lang to fr / de / en                                      //
    //      → opening mark changes: « / „ / "                               //
    //   4. variant='quoted' exposes ONLY the open mark;                    //
    //      no .origam-blockquote__mark--close element should be present.   //
    //   5. Body and attribution have z-index > glyph (text readable)       //
    //                                                                      //
    // Automation path: add a dedicated <Variant title="Quoted"> in the     //
    // story file with init-state variant='quoted' — then the spec can      //
    // navigate directly to it via variantUrl(N) without HstSelect control. //
    // ------------------------------------------------------------------ //

    // ------------------------------------------------------------------ //
    // ADR-005 ticket #25 — variant = props preset, not a CSS layer         //
    //                                                                      //
    // Design (index 0) renders TWO <origam-blockquote variant="default">   //
    // side by side (see OrigamBlockquote.story.vue): #1 the resolved       //
    // preset as-is, #2 the SAME variant with `border="0px 16px 0px 0px"`   //
    // set explicitly. Per ADR-005 Q2 the explicit prop must win — this is  //
    // the model's headline test, and it needs NO Histoire control          //
    // interaction (both examples are static markup in the story), which   //
    // is why it is exercised here rather than by driving the HstSelect     //
    // variant picker (documented above as unreliable headless).            //
    // ------------------------------------------------------------------ //

    test.describe('ADR-005 — variant preset tier', () => {
        test('an explicit border beats the resolved variant preset', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const blockquotes = sandbox.locator('.origam-blockquote')
            await expect(blockquotes.first()).toBeVisible(VIS)

            const presetWidth = await blockquotes.nth(0).evaluate(el =>
                getComputedStyle(el).borderInlineStartWidth || getComputedStyle(el).borderLeftWidth)
            const overriddenWidth = await blockquotes.nth(1).evaluate(el =>
                getComputedStyle(el).borderInlineStartWidth || getComputedStyle(el).borderLeftWidth)

            // The preset's own value (4px, asserted elsewhere in "Design").
            expect(presetWidth).toBe('4px')
            // The override (16px) wins — proves `border` was not swallowed
            // by `variant`.
            expect(overriddenWidth).toBe('16px')
            expect(overriddenWidth).not.toBe(presetWidth)
        })

        test('bg-color=primary keeps painting the accent regardless of variant (accent axis is independent of the preset table)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('.origam-blockquote').first()
            await expect(host).toBeVisible(VIS)
            await expect(host).toHaveClass(/origam-blockquote--accent-primary/)
        })

        test('the DS ships zero CSS rule targeting .origam-blockquote--variant-* (D3)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('.origam-blockquote').first()
            await expect(host).toBeVisible(VIS)

            // Scan every loaded stylesheet reachable from the sandbox frame
            // for a selector mentioning `.origam-blockquote--variant-`
            // SPECIFICALLY (scoped to Blockquote — other, not-yet-migrated
            // DS components such as Btn / Field / SliderField still ship
            // their OWN `--variant-*` rules on purpose, and the sandbox
            // iframe loads every component's CSS globally, so an unscoped
            // substring match would false-positive on THEIR rules). None
            // should exist for Blockquote — the class is a pure override
            // hook (D3), styling now comes exclusively from resolved props
            // (inline style / utility class).
            const hasVariantRule = await sandbox.locator('html').evaluate(() => {
                let found = false
                for (const sheet of Array.from(document.styleSheets)) {
                    let rules: CSSRuleList
                    try {
                        rules = sheet.cssRules
                    } catch {
                        continue
                    }
                    for (const rule of Array.from(rules)) {
                        if ('selectorText' in rule && typeof (rule as CSSStyleRule).selectorText === 'string'
                            && (rule as CSSStyleRule).selectorText.includes('.origam-blockquote--variant-')) {
                            found = true
                        }
                    }
                }
                return found
            })
            expect(hasVariantRule).toBe(false)
        })

        test('variant=elegant resolves its typography preset (serif, italic) with no HstSelect interaction', async ({ page }) => {
            // Index 3 ("Slots - Author") renders a STATIC variant="elegant"
            // blockquote — reused here to assert the preset without driving
            // the (documented-unreliable) HstSelect variant picker.
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('.origam-blockquote').first()
            await expect(host).toBeVisible(VIS)

            const fontStyle = await host.evaluate(el => getComputedStyle(el).fontStyle)
            expect(fontStyle).toBe('italic')

            const fontFamily = await host.evaluate(el => getComputedStyle(el).fontFamily)
            expect(fontFamily.toLowerCase()).toContain('serif')

            const width = await host.evaluate(el =>
                getComputedStyle(el).borderInlineStartWidth || getComputedStyle(el).borderLeftWidth)
            expect(width).toBe('4px')
        })
    })
})
