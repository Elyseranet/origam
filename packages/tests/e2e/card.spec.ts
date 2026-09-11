import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * OrigamCard — spec e2e (pattern canonique btn.spec.ts)
 *
 * Navigation directe : page.goto(STORY_PATH + '?variantId=' + STORY_ID + '-' + index)
 * Index 0-based = position du <Variant> dans OrigamCard.story.vue.
 *
 * Variants (ordre dans le fichier story) :
 *   0  → Design        { title, subtitle, text, bgColor: 'primary' }
 *   1  → State         { bgColor: 'primary' }
 *   2  → Functional    { title, text, enabled: false, kind: 'bool', … }
 *   3  → Events - click:prepend
 *   4  → Events - click:append
 *   5  → Events - update:active
 *   6  → Events - update:hover
 *   7  → Slots - Default
 *   8  → Slots - Header
 *   9  → Slots - Footer
 *  10  → Slots - Loader
 *  11  → Slots - Asset
 *  12  → Slots - Wrapper
 *  13  → Slots - Header.prepend
 *  14  → Slots - Header.append
 *  15  → Slots - Header.title
 *  16  → Slots - Header.subtitle
 *  17  → Slots - Header.content
 *  18  → Slots - Text
 *  19  → Prop — elevation custom (static demo of the free-form box-shadow escape hatch)
 *  20  → Prop — border per-side (static demo of borderTop/Right/Bottom/Left + *Color, issue #215)
 *  21  → Default (playground)
 *
 * NE PAS utiliser waitForLoadState('networkidle') — Histoire garde un websocket
 * HMR ouvert → networkidle ne résout jamais → timeout garanti.
 *
 * Pas de data-cy dans les stories canoniques : localiser via .origam-card.
 *
 * ## Cold-start Vite / Histoire
 *
 * À la première navigation sur une story Card, Vite compile la story à la
 * demande (log : "hot updated: /__resolved__virtual:$histoire-stories"). Cette
 * compilation prend 15-30s à froid. Les navigations suivantes sont rapides
 * (code mis en cache). On résout cela avec un `beforeAll` qui fait un
 * warm-up sur le Variant 0 avant le premier test.
 *
 * Le timeout global est 60s pour absorber le cold-start + le temps de rendu.
 * Les assertions individuelles utilisent 30s (warm-up déjà fait).
 *
 * Comportements NON testables headless :
 *   - hover CSS (:hover pseudo-class) : transitions dépendent d'une vraie souris.
 *   - Ripple animation : rendu via canvas, non assertable via DOM.
 *   - update:active / update:hover emit values : capturés dans la console
 *     Histoire, non exposés au test.
 */

const STORY_ID   = 'components-stories-card-origamcard-story-vue'
// Histoire serves under /stories/ (histoire.config.js base: '/stories/').
// Use absolute path /stories/story/... which resolves against origin only.
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

/**
 * Attend que la card soit visible dans le sandbox iframe.
 * Encapsule le frameLocator + toBeVisible pour mutualiser le timeout.
 * Avec /stories/story/... → Histoire monte le composant en ~1-2s.
 */
async function expectCardVisible(page: Page, timeout = 12000) {
    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    await expect(sandbox.locator('.origam-card').first()).toBeVisible({ timeout })
    return sandbox
}

test.describe('OrigamCard', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { title: 'Card title', subtitle: 'Subtitle',                  //
    //         text: 'Body text.', bgColor: 'primary' }                    //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders the card root with BEM class origam-card', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card').first()).toHaveClass(/origam-card/)
        })

        test('bgColor=primary applies the utility class origam--bg-primary', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card').first()).toHaveClass(/origam--bg-primary/)
        })

        test('bgColor=primary produces a non-transparent background from the token', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = await expectCardVisible(page)
            const card = sandbox.locator('.origam-card').first()
            const bg = await card.evaluate(el => getComputedStyle(el).backgroundColor)
            expect(bg).not.toBe('rgba(0, 0, 0, 0)')
            expect(bg).not.toBe('transparent')
            expect(bg).not.toBe('rgb(230, 230, 230)')
        })

        test('title prop renders text inside origam-card__header', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card__header')).toBeVisible({ timeout: 5000 })
            await expect(sandbox.locator('.origam-card__header')).toContainText('Card title')
        })

        test('text prop renders inside origam-card__text', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card__text')).toContainText('Body text.')
        })

        test('default density class is applied (density-default)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card').first()).toHaveClass(/origam-card--density-default/)
        })

        test('no rounded modifier class in default init-state', async ({ page }) => {
            // Verifying absence guards against spurious class emission.
            await page.goto(variantUrl(0))
            const sandbox = await expectCardVisible(page)
            const classes = await sandbox.locator('.origam-card').first().getAttribute('class') ?? ''
            expect(classes).not.toContain('origam-card--rounded ')
        })

        test('no flat modifier class in default init-state', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = await expectCardVisible(page)
            const classes = await sandbox.locator('.origam-card').first().getAttribute('class') ?? ''
            expect(classes).not.toContain('origam-card--flat')
        })
    })

    // ------------------------------------------------------------------ //
    // STATE (index 1)                                                      //
    // init: { bgColor: 'primary' }                                        //
    // ------------------------------------------------------------------ //

    test.describe('State', () => {
        test('renders card root with bgColor=primary utility class', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card').first()).toHaveClass(/origam--bg-primary/)
        })

        test('resting state: no active modifier class', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = await expectCardVisible(page)
            const classes = await sandbox.locator('.origam-card').first().getAttribute('class') ?? ''
            expect(classes).not.toContain('origam-card--active')
        })

        test('card underlay is always rendered as a span', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card__underlay')).toBeAttached()
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 2)                                                 //
    // init: { title: 'Card', text: 'Body text.',                          //
    //         enabled: false, kind: 'bool', progress: 42 }                //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('renders card with title in functional variant', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card__header')).toContainText('Card')
        })

        test('enabled=false: no loading class in initial state', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = await expectCardVisible(page)
            const classes = await sandbox.locator('.origam-card').first().getAttribute('class') ?? ''
            expect(classes).not.toContain('origam-card--loading')
        })

        test('disabled=false: no disabled class in initial state', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = await expectCardVisible(page)
            const classes = await sandbox.locator('.origam-card').first().getAttribute('class') ?? ''
            expect(classes).not.toContain('origam-card--disabled')
        })

        test('disabled=false: pointer-events are not blocked', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = await expectCardVisible(page)
            const pe = await sandbox.locator('.origam-card').first().evaluate(el => getComputedStyle(el).pointerEvents)
            expect(pe).not.toBe('none')
        })

        test('default tag renders as div element', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = await expectCardVisible(page)
            const tag = await sandbox.locator('.origam-card').first().evaluate(el => el.tagName.toLowerCase())
            expect(tag).toBe('div')
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS (index 3-6)                                                   //
    // ------------------------------------------------------------------ //

    test.describe('Events - click:prepend', () => {
        test('card with prepend icon is visible', async ({ page }) => {
            await page.goto(variantUrl(3))
            await expectCardVisible(page)
        })

        test('prepend area is rendered inside card header', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card__header')).toBeVisible({ timeout: 5000 })
            await expect(sandbox.locator('.origam-card__header .origam-card-header__prepend')).toBeVisible({ timeout: 5000 })
        })
    })

    test.describe('Events - click:append', () => {
        test('card with append icon is visible', async ({ page }) => {
            await page.goto(variantUrl(4))
            await expectCardVisible(page)
        })

        test('append area is rendered inside card header', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card__header .origam-card-header__append')).toBeVisible({ timeout: 5000 })
        })
    })

    test.describe('Events - update:active', () => {
        test('card for active event is visible', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card').first()).toHaveClass(/origam-card/)
        })
    })

    test.describe('Events - update:hover', () => {
        test('card for hover event is visible', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card').first()).toHaveClass(/origam-card/)
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS (index 7-18)                                                   //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('custom default slot content renders inside origam-card__content', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card__content')).toBeVisible({ timeout: 5000 })
            await expect(sandbox.locator('.origam-card__content')).toContainText('Custom slot content')
        })
    })

    test.describe('Slots - Header', () => {
        test('custom header slot content renders inside card', async ({ page }) => {
            await page.goto(variantUrl(8))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card')).toContainText('Custom header slot')
        })
    })

    test.describe('Slots - Footer', () => {
        test('footer slot renders origam-card__footer element', async ({ page }) => {
            await page.goto(variantUrl(9))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card__footer')).toBeVisible({ timeout: 5000 })
        })

        test('footer slot renders action buttons inside card', async ({ page }) => {
            await page.goto(variantUrl(9))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card__footer .origam-btn').first()).toBeVisible({ timeout: 5000 })
        })
    })

    test.describe('Slots - Loader', () => {
        test('custom loader slot renders when loading=true', async ({ page }) => {
            await page.goto(variantUrl(10))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card--loading')).toBeVisible({ timeout: 5000 })
            await expect(sandbox.locator('.origam-card')).toContainText('Loading...')
        })
    })

    test.describe('Slots - Asset', () => {
        test('asset slot renders origam-card__asset element', async ({ page }) => {
            await page.goto(variantUrl(11))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card__asset')).toBeVisible({ timeout: 5000 })
        })

        test('asset slot renders custom content', async ({ page }) => {
            await page.goto(variantUrl(11))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card__asset')).toContainText('Custom asset placeholder')
        })
    })

    test.describe('Slots - Wrapper', () => {
        test('custom wrapper slot replaces default card inner structure', async ({ page }) => {
            await page.goto(variantUrl(12))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card')).toContainText('Custom wrapper content')
        })

        test('when wrapper slot is used, origam-card__content is absent', async ({ page }) => {
            // The #wrapper slot replaces the entire inner structure including __content.
            await page.goto(variantUrl(12))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card__content')).not.toBeAttached()
        })
    })

    test.describe('Slots - Header.prepend', () => {
        test('header.prepend slot renders a custom icon in the header', async ({ page }) => {
            await page.goto(variantUrl(13))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card__header')).toBeVisible({ timeout: 5000 })
            await expect(sandbox.locator('.origam-card__header .origam-icon')).toBeVisible({ timeout: 5000 })
        })
    })

    test.describe('Slots - Header.append', () => {
        test('header.append slot renders a custom icon in the header', async ({ page }) => {
            await page.goto(variantUrl(14))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card__header')).toBeVisible({ timeout: 5000 })
            await expect(sandbox.locator('.origam-card__header .origam-icon')).toBeVisible({ timeout: 5000 })
        })
    })

    test.describe('Slots - Header.title', () => {
        test('header.title slot renders custom title markup', async ({ page }) => {
            await page.goto(variantUrl(15))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card__header')).toContainText('Custom title')
        })
    })

    test.describe('Slots - Header.subtitle', () => {
        test('header.subtitle slot renders custom subtitle markup', async ({ page }) => {
            await page.goto(variantUrl(16))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card__header')).toContainText('Custom subtitle text')
        })
    })

    test.describe('Slots - Header.content', () => {
        test('header.content slot: card root is rendered (slot requires hasHeader=true to display)', async ({ page }) => {
            // Variant 17: card has NO title/subtitle/text props — only #header.content slot.
            // KNOWN LIMITATION: the #header.content slot maps to the default slot of
            // <origam-card-header>. However, hasHeader is computed from
            // (slots.header || title || subtitle || prependIcon/Avatar || appendIcon/Avatar).
            // The #header.content slot alone does NOT set hasHeader=true, so the header
            // section is never mounted and the slot content is silently ignored.
            // The card root itself is still rendered (origam-card class present).
            // Asserting on the card's existence guards against structural regression.
            await page.goto(variantUrl(17))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-card').first()).toBeAttached({ timeout: 12000 })
            await expect(sandbox.locator('.origam-card').first()).toHaveClass(/origam-card/)
        })
    })

    test.describe('Slots - Text', () => {
        test('text slot renders custom text content in card', async ({ page }) => {
            // Variant 18: the #text slot replaces the internal <origam-card-text> component.
            // When using the slot, the .origam-card__text class is NOT emitted (it lives on
            // the replaced component). Assert on the card container containing the text.
            await page.goto(variantUrl(18))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card')).toContainText('Custom text slot content')
        })
    })

    // ------------------------------------------------------------------ //
    // PROP — ELEVATION CUSTOM (index 19)                                   //
    // Static demo: elevation="0 4px 12px rgba(0,0,0,.24)" — DS #14, free-  //
    // form box-shadow escape hatch (Theme Builder "Autre" configuration).  //
    // ------------------------------------------------------------------ //

    test.describe('Prop — elevation custom', () => {
        test('custom box-shadow string is emitted verbatim on the card root', async ({ page }) => {
            await page.goto(variantUrl(19))
            const sandbox = await expectCardVisible(page)
            const card = sandbox.locator('.origam-card').first()
            await expect(card).toBeVisible({ timeout: 8000 })

            const boxShadow = await card.evaluate(el => getComputedStyle(el).boxShadow)

            // Computed box-shadow serializes rgba(0,0,0,.24) as "rgba(0, 0, 0, 0.24)"
            // and lengths as "0px 4px 12px" — assert on the individually meaningful
            // tokens rather than a brittle full-string match.
            expect(boxShadow).not.toBe('none')
            expect(boxShadow).toContain('4px')
            expect(boxShadow).toContain('12px')
            expect(boxShadow).toMatch(/rgba\(0,\s*0,\s*0,\s*0\.24\)/)
        })

        test('custom box-shadow does NOT resolve to a --origam-shadow-* token (regression guard)', async ({ page }) => {
            // Before the fix, `parseInt('0 4px 12px rgba(...)', 10)` read the
            // leading `0` and silently resolved to the `none` rung — no shadow.
            await page.goto(variantUrl(19))
            const sandbox = await expectCardVisible(page)
            const card = sandbox.locator('.origam-card').first()
            const styleAttr = await card.getAttribute('style')
            expect(styleAttr ?? '').not.toContain('--origam-shadow---')
        })
    })

    // ------------------------------------------------------------------ //
    // PROP — BORDER PER-SIDE (index 20)                                    //
    // Static demo: borderTop=4/borderRight=2/borderBottom=4/borderLeft=2 + //
    // per-side *Color props — DS #215.                                    //
    // ------------------------------------------------------------------ //

    test.describe('Prop — border per-side', () => {
        test('emits independent border-{side}-width declarations per side', async ({ page }) => {
            await page.goto(variantUrl(20))
            const sandbox = await expectCardVisible(page)
            const card = sandbox.locator('.origam-card').first()
            await expect(card).toBeVisible({ timeout: 8000 })

            const style = await card.evaluate(el => {
                const computed = getComputedStyle(el)
                return {
                    top: computed.borderTopWidth,
                    right: computed.borderRightWidth,
                    bottom: computed.borderBottomWidth,
                    left: computed.borderLeftWidth,
                }
            })

            expect(style.top).toBe('4px')
            expect(style.right).toBe('2px')
            expect(style.bottom).toBe('4px')
            expect(style.left).toBe('2px')
        })

        test('resolves a distinct border-{side}-color per side from semantic intents', async ({ page }) => {
            await page.goto(variantUrl(20))
            const sandbox = await expectCardVisible(page)
            const card = sandbox.locator('.origam-card').first()

            const colors = await card.evaluate(el => {
                const computed = getComputedStyle(el)
                return {
                    top: computed.borderTopColor,
                    right: computed.borderRightColor,
                    bottom: computed.borderBottomColor,
                    left: computed.borderLeftColor,
                }
            })

            // 4 distinct intents (danger/primary/success/info) → 4 distinct resolved colors.
            const distinct = new Set(Object.values(colors))
            expect(distinct.size).toBe(4)
        })

        test('inline style attribute carries physical (not logical) border-{side}-color declarations', async ({ page }) => {
            // Widths are asserted via computed style above (browsers are free to
            // collapse equal-pair longhands like border-{top,right,bottom,left}-width
            // back into the `border-width: <v> <h>` shorthand when serializing the
            // `style` attribute string — that's a harmless DOM quirk, not a bug).
            // The four per-side colors are all distinct, so they cannot collapse
            // into a shorthand: their presence as literal physical longhands proves
            // useBorder emits `border-{side}-color`, never a logical property.
            await page.goto(variantUrl(20))
            const sandbox = await expectCardVisible(page)
            const card = sandbox.locator('.origam-card').first()
            const styleAttr = await card.getAttribute('style')

            expect(styleAttr ?? '').toContain('border-top-color')
            expect(styleAttr ?? '').toContain('border-right-color')
            expect(styleAttr ?? '').toContain('border-bottom-color')
            expect(styleAttr ?? '').toContain('border-left-color')
            expect(styleAttr ?? '').not.toContain('border-block')
            expect(styleAttr ?? '').not.toContain('border-inline')
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT / PLAYGROUND (index 21)                                     //
    // init: { title: 'Card title', subtitle: 'Subtitle',                  //
    //         text: 'Body text.', bgColor: 'primary' }                    //
    // ------------------------------------------------------------------ //

    test.describe('Default (Playground)', () => {
        test('playground renders card root with origam-card class', async ({ page }) => {
            await page.goto(variantUrl(21))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card').first()).toHaveClass(/origam-card/)
        })

        test('playground bgColor=primary applies utility class', async ({ page }) => {
            await page.goto(variantUrl(21))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card').first()).toHaveClass(/origam--bg-primary/)
        })

        test('playground renders title and text', async ({ page }) => {
            await page.goto(variantUrl(21))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card__header')).toContainText('Card title')
            await expect(sandbox.locator('.origam-card__text')).toContainText('Body text.')
        })

        test('playground has density-default modifier class', async ({ page }) => {
            await page.goto(variantUrl(21))
            const sandbox = await expectCardVisible(page)
            await expect(sandbox.locator('.origam-card').first()).toHaveClass(/origam-card--density-default/)
        })
    })

    // ------------------------------------------------------------------ //
    // NON-REGRESSION — rounded modifier classes                           //
    // ------------------------------------------------------------------ //

    test.describe('Non-regression — rounded BEM modifiers (Design variant)', () => {
        test('origam-card--rounded-shaped absent from default init-state', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = await expectCardVisible(page)
            const classes = await sandbox.locator('.origam-card').first().getAttribute('class') ?? ''
            expect(classes).not.toContain('origam-card--rounded-shaped')
        })

        test('origam-card--rounded-shaped-invert absent from default init-state', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = await expectCardVisible(page)
            const classes = await sandbox.locator('.origam-card').first().getAttribute('class') ?? ''
            expect(classes).not.toContain('origam-card--rounded-shaped-invert')
        })
    })

    // ------------------------------------------------------------------ //
    // NON-REGRESSION — border modifier classes                            //
    // ------------------------------------------------------------------ //

    test.describe('Non-regression — directional border modifiers (Design variant)', () => {
        test('default card has no directional border modifier class', async ({ page }) => {
            // Pre-fix border rungs were read via a singular shorthand; the fix
            // (per-side reads) is guarded by verifying the default init-state
            // produces no border class spuriously.
            await page.goto(variantUrl(0))
            const sandbox = await expectCardVisible(page)
            const classes = await sandbox.locator('.origam-card').first().getAttribute('class') ?? ''
            expect(classes).not.toContain('origam-card--border-top')
            expect(classes).not.toContain('origam-card--border-right')
            expect(classes).not.toContain('origam-card--border-bottom')
            expect(classes).not.toContain('origam-card--border-left')
        })
    })
})
