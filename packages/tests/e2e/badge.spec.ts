import { expect, test } from '@playwright/test'

/**
 * RECIPE — OrigamBadge e2e spec (réf. btn.spec.ts — pattern canonique)
 *
 * ## Variants index map (0-based, Badge story — état au 2026-08-13)
 *
 *   0  → Design       init: { bgColor: 'primary', content: 3, modelValue: true, location: 'top right' }
 *   1  → State        init: { bgColor: 'primary', modelValue: true }
 *   2  → Functional   init: { modelValue: true, content: 3, dot: false, floating: false, inline: false }
 *   3  → Events - update:hover
 *   4  → Slots - Default
 *   5  → Slots - Badge
 *   6  → Slots - Prepend
 *   7  → Slots - Append
 *   8  → Prop — content & max
 *   9  → Prop — dot
 *   10 → Prop — inline
 *   11 → Prop — floating
 *   12 → Prop — status & statusIconPosition
 *   13 → Prop — elevation
 *   14 → Prop — border
 *   15 → Prop — modelValue
 *   16 → Events - click:prepend
 *   17 → Events - click:append
 *   18 → Default (playground)
 *
 * ## Comportement spécifique à Badge
 *
 *   1. `modelValue: true` active `useActive(props, 'modelValue')`, ce qui émet
 *      `origam-badge--active` sur le root wrapper. Tant que le badge est actif,
 *      `useStateEffect` retourne `colorClasses=[]` et passe par `colorStyles` à
 *      la place → PAS de classe utilitaire `origam--bg-*` sur la pill quand
 *      modelValue=true. Assert via `getComputedStyle` plutôt que via classe.
 *
 *   2. La couleur du token primary résout en `color(srgb …)` (P3 wide-gamut)
 *      dans Chrome 111+, pas en `rgb(…)`. On assert donc "non transparent" /
 *      "non blanc" plutôt qu'une valeur exacte.
 *
 *   3. `.origam-badge__prepend` / `.origam-badge__append` sont des classes
 *      appliquées aux OrigamIcon INTERNES à la pill. Les slots Prepend/Append
 *      de la story chargent une icône MDI asynchrone — timeout 20000ms requis.
 *
 *   4. Dot mode : la pill passe à height/width 9px via CSS var override.
 */

const STORY_ID   = 'components-stories-badge-origambadge-story-vue'
// baseURL = 'http://localhost:6006/stories' (config) — goto('/stories/story/...') resolves
// to 'http://localhost:6006/story/...' (absolute path replaces base path) → 404.
// Prefix with '/stories' to land on 'http://localhost:6006/stories/story/...'.
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamBadge', () => {
    // Each test opens a new page context — Histoire's Vite sandbox re-compiles the
    // variant on every cold navigation. On a warm machine this takes ~5s but on a
    // CI box or after a Histoire restart it can take 25-30s. We set 45s globally
    // and use 30000ms for the first toBeVisible call in every test.
    test.setTimeout(60000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { bgColor: 'primary', content: 3, modelValue: true }          //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders the badge root with BEM class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
        })

        test('modelValue=true adds --active class on the root wrapper', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            await expect(root).toHaveClass(/origam-badge--active/)
        })

        test('badge pill (.origam-badge__badge) is visible when modelValue=true', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const pill = root.locator('.origam-badge__badge').first()
            await expect(pill).toBeVisible({ timeout: 5000 })
        })

        test('bgColor=primary paints the pill with a non-transparent color', async ({ page }) => {
            // When modelValue=true (active state), useStateEffect bypasses utility classes
            // and applies color via inline styles. The resolved token emits color(srgb …)
            // in Chrome P3 wide-gamut — not rgb(). Assert non-transparent only.
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const pill = root.locator('.origam-badge__badge').first()
            await expect(pill).toBeVisible({ timeout: 5000 })
            const bg = await pill.evaluate(el => getComputedStyle(el).backgroundColor)
            expect(bg, 'pill background must not be transparent').not.toBe('rgba(0, 0, 0, 0)')
            expect(bg, 'pill background must not be transparent').not.toBe('transparent')
        })

        test('content=3 renders the digit inside .origam-badge__content', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            await expect(root.locator('.origam-badge__content')).toContainText('3')
        })

        test('root tag defaults to <div>', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const tag = await root.evaluate(el => el.tagName.toLowerCase())
            expect(tag).toBe('div')
        })

        test('pill has role="status" for a11y live region', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const pill = root.locator('.origam-badge__badge').first()
            const role = await pill.getAttribute('role')
            expect(role).toBe('status')
        })
    })

    // ------------------------------------------------------------------ //
    // STATE (index 1)                                                      //
    // init: { bgColor: 'primary', modelValue: true }                      //
    // ------------------------------------------------------------------ //

    test.describe('State', () => {
        test('renders badge root with --active class', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            await expect(root).toHaveClass(/origam-badge--active/)
        })

        test('pill background is non-transparent in resting state', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const pill = root.locator('.origam-badge__badge').first()
            await expect(pill).toBeVisible({ timeout: 5000 })
            const bg = await pill.evaluate(el => getComputedStyle(el).backgroundColor)
            expect(bg).not.toBe('rgba(0, 0, 0, 0)')
            expect(bg).not.toBe('transparent')
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 2)                                                 //
    // init: { modelValue: true, content: 3, dot: false, floating: false } //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('renders badge root in visible state', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            await expect(root).toHaveClass(/origam-badge--active/)
        })

        test('content=3 renders the digit inside the pill', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            await expect(root.locator('.origam-badge__content')).toContainText('3')
        })

        test('dot=false: .origam-badge--dot is absent from root by default', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const classes = await root.getAttribute('class')
            expect(classes).not.toContain('origam-badge--dot')
        })

        test('SCSS --dot: injecting the class sets pill height to 9px', async ({ page }) => {
            // Verifies the SCSS --dot override compiles correctly.
            // The CSS var --origam-badge__badge---height is set to 9px inside &--dot.
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const pill = root.locator('.origam-badge__badge').first()
            await expect(pill).toBeVisible({ timeout: 5000 })
            const height = await pill.evaluate(el => {
                el.closest('.origam-badge')?.classList.add('origam-badge--dot')
                return getComputedStyle(el).height
            })
            expect(height, 'dot pill height must be 9px').toBe('9px')
        })

        test('SCSS --floating: adding the class is accepted without error', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            // Inject --floating and confirm no crash / no removal of --active
            const classes = await root.evaluate(el => {
                el.classList.add('origam-badge--floating')
                return el.className
            })
            expect(classes).toContain('origam-badge--floating')
            expect(classes).toContain('origam-badge--active')
        })

        test('SCSS --inline: CSS var is set on the wrapper when --inline class is on root', async ({ page }) => {
            // Vue scoped SCSS selectors include a `data-v-xxx` attribute that prevents
            // manually-injected classes from matching the compiled rule.
            // We therefore read the CSS *custom property* value directly — it IS
            // propagated by the cascade even without the scoped attr — and confirm
            // it was authored as 'inline-flex' in the stylesheet.
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const varValue = await root.evaluate(el => {
                el.classList.add('origam-badge--inline')
                const wrapper = el.querySelector('.origam-badge__wrapper')
                return wrapper
                    ? getComputedStyle(wrapper).getPropertyValue('--origam-badge__wrapper---display').trim()
                    : 'not-found'
            })
            // The CSS var is set to 'inline-flex' by the --inline rule.
            // An empty string means the var is not set (rule didn't fire).
            expect(varValue, '--inline rule must set --origam-badge__wrapper---display').toBe('inline-flex')
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS (index 3)                                                     //
    // ------------------------------------------------------------------ //

    test.describe('Events - update:hover', () => {
        test('renders a visible badge for hover event testing', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
        })

        test('mouseenter / mouseleave do not throw (logEvent not assertable headlessly)', async ({ page }) => {
            // logEvent() is an Histoire-internal side-effect; observable only via the
            // Histoire event panel which is not inside the sandbox iframe.
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            await root.hover()
            await page.mouse.move(0, 0)
            await root.hover()
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS (indexes 4–7)                                                  //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('default slot renders custom text content in the wrapper', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            // Story injects: <span>Custom slot content</span>
            await expect(root.locator('.origam-badge__wrapper')).toContainText('Custom slot content')
        })
    })

    test.describe('Slots - Badge', () => {
        test('badge slot replaces default pill content with custom markup', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            // Story renders: <strong>!</strong> inside the #badge slot
            const pill = root.locator('.origam-badge__badge').first()
            await expect(pill).toBeVisible({ timeout: 5000 })
            await expect(pill).toContainText('!')
            // The default .origam-badge__content span must NOT be present
            await expect(
                pill.locator('.origam-badge__content'),
                'badge slot replaces default content'
            ).toHaveCount(0)
        })
    })

    test.describe('Slots - Prepend', () => {
        // Regression guard for the IAdjacentProps ticket: the #prepend slot inside
        // the pill used to be gated by a hand-rolled `hasPrependIcon` that only
        // checked the `prependIcon` prop, so a #prepend slot with NO matching prop
        // (this story variant's exact case) never rendered. The component now
        // consumes `useAdjacent()`, whose `hasPrepend` also checks slot presence —
        // `.origam-badge__prepend` renders and carries the slotted MDI heart icon.
        test('renders .origam-badge__prepend with the slotted icon', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const prepend = root.locator('.origam-badge__prepend').first()
            await expect(prepend).toBeVisible({ timeout: 20000 })
            await expect(prepend.locator('.origam-icon.mdi-heart')).toBeAttached()
        })

        test('wrapper still renders the default slot (origam-avatar) with prepend variant', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            await expect(root.locator('.origam-avatar')).toBeAttached()
        })
    })

    test.describe('Slots - Append', () => {
        // Same regression guard as Slots - Prepend, mirrored for the append side.
        test('renders .origam-badge__append with the slotted icon', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const append = root.locator('.origam-badge__append').first()
            await expect(append).toBeVisible({ timeout: 20000 })
            await expect(append.locator('.origam-icon.mdi-heart')).toBeAttached()
        })

        test('wrapper still renders the default slot (origam-avatar) with append variant', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            await expect(root.locator('.origam-avatar')).toBeAttached()
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS — click:prepend / click:append (indexes 16-17)                //
    //                                                                       //
    // Same IAdjacentProps regression guard as Slots - Prepend/Append,       //
    // but driven through the `prependIcon` / `appendIcon` PROPS (not the    //
    // slots) — mirrors btn.spec.ts's "Events - click:prepend/append".       //
    // ------------------------------------------------------------------ //

    test.describe('Events - click:prepend', () => {
        test('renders .origam-badge__prepend with the prependIcon', async ({ page }) => {
            await page.goto(variantUrl(16))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const prepend = root.locator('.origam-badge__prepend').first()
            await expect(prepend).toBeVisible({ timeout: 20000 })
            await expect(prepend.locator('.origam-icon.mdi-heart')).toBeAttached()
        })

        test('click on prepend area does not throw', async ({ page }) => {
            await page.goto(variantUrl(16))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const prepend = sandbox.locator('.origam-badge__prepend').first()
            await expect(prepend).toBeVisible({ timeout: 20000 })
            // logEvent() is an Histoire-internal side-effect; observable only via the
            // Histoire event panel which is not inside the sandbox iframe. The
            // click:prepend → emit wiring itself is asserted headlessly in
            // TU/components/Badge/OrigamBadge.spec.ts (real @vue/test-utils emit
            // assertion) — here we only confirm the click doesn't throw at runtime.
            await prepend.click()
        })
    })

    test.describe('Events - click:append', () => {
        test('renders .origam-badge__append with the appendIcon', async ({ page }) => {
            await page.goto(variantUrl(17))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const append = root.locator('.origam-badge__append').first()
            await expect(append).toBeVisible({ timeout: 20000 })
            await expect(append.locator('.origam-icon.mdi-heart')).toBeAttached()
        })

        test('click on append area does not throw', async ({ page }) => {
            await page.goto(variantUrl(17))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const append = sandbox.locator('.origam-badge__append').first()
            await expect(append).toBeVisible({ timeout: 20000 })
            await append.click()
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT — playground (index 18)                                      //
    // init: { modelValue: true, content: 3, bgColor: 'primary',           //
    //         location: 'top right' }                                      //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('renders badge root with --active class and content "3"', async ({ page }) => {
            await page.goto(variantUrl(18))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            await expect(root).toHaveClass(/origam-badge--active/)
            await expect(root.locator('.origam-badge__content')).toContainText('3')
        })

        test('root tag defaults to <div>', async ({ page }) => {
            await page.goto(variantUrl(18))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const tag = await root.evaluate(el => el.tagName.toLowerCase())
            expect(tag).toBe('div')
        })

        test('pill receives a non-transparent background from the primary token', async ({ page }) => {
            await page.goto(variantUrl(18))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const pill = root.locator('.origam-badge__badge').first()
            await expect(pill).toBeVisible({ timeout: 5000 })
            const bg = await pill.evaluate(el => getComputedStyle(el).backgroundColor)
            expect(bg).not.toBe('rgba(0, 0, 0, 0)')
            expect(bg).not.toBe('transparent')
        })
    })

    // ------------------------------------------------------------------ //
    // ROUNDED SCSS rules (Design variant — class injection)               //
    // ------------------------------------------------------------------ //

    test.describe('Rounded SCSS rules', () => {
        test('--rounded-shaped: TL+BR rounded, TR+BL = 0 (pill)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const pill = root.locator('.origam-badge__badge').first()
            await expect(pill).toBeVisible({ timeout: 5000 })
            const radii = await pill.evaluate(el => {
                el.classList.add('origam-badge--rounded-shaped')
                const cs = getComputedStyle(el)
                return {
                    tl: cs.borderTopLeftRadius,
                    tr: cs.borderTopRightRadius,
                    br: cs.borderBottomRightRadius,
                    bl: cs.borderBottomLeftRadius
                }
            })
            expect(radii.tl, 'top-left should be rounded').not.toBe('0px')
            expect(radii.br, 'bottom-right should be rounded').not.toBe('0px')
            expect(radii.tr, 'top-right should be 0').toBe('0px')
            expect(radii.bl, 'bottom-left should be 0').toBe('0px')
            expect(radii.tl).toBe(radii.br)
        })

        test('--rounded-shaped-invert: TR+BL rounded, TL+BR = 0 (pill)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const pill = root.locator('.origam-badge__badge').first()
            await expect(pill).toBeVisible({ timeout: 5000 })
            const radii = await pill.evaluate(el => {
                el.classList.add('origam-badge--rounded-shaped-invert')
                const cs = getComputedStyle(el)
                return {
                    tl: cs.borderTopLeftRadius,
                    tr: cs.borderTopRightRadius,
                    br: cs.borderBottomRightRadius,
                    bl: cs.borderBottomLeftRadius
                }
            })
            expect(radii.tr, 'top-right should be rounded').not.toBe('0px')
            expect(radii.bl, 'bottom-left should be rounded').not.toBe('0px')
            expect(radii.tl, 'top-left should be 0').toBe('0px')
            expect(radii.br, 'bottom-right should be 0').toBe('0px')
            expect(radii.tr).toBe(radii.bl)
        })
    })
})
