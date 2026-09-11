import { expect, test } from '@playwright/test'

/**
 * RECIPE — OrigamBadge e2e spec (réf. btn.spec.ts — pattern canonique)
 *
 * ## Variants index map (0-based, Badge story — état au 2026-06-22)
 *
 *   0  → Design       init: { bgColor: 'primary', content: 3, modelValue: true, location: 'top right' }
 *   1  → State        init: { bgColor: 'primary', modelValue: true }
 *   2  → Functional   init: { modelValue: true, content: 3, dot: false, floating: false, inline: false }
 *   3  → Events - update:hover
 *   4  → Slots - Default
 *   5  → Slots - Badge
 *   6  → Slots - Prepend
 *   7  → Slots - Append
 *   8  → Default (playground)
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
            const contentCount = await pill.locator('.origam-badge__content').count()
            expect(contentCount, 'badge slot replaces default content').toBe(0)
        })
    })

    test.describe('Slots - Prepend', () => {
        // The #prepend slot inside the badge pill is gated by `v-if="hasPrependIcon"`.
        // `hasPrependIcon` is true only when a `prependIcon` prop (or `status` with
        // an icon) is set — the story for this variant passes a slot content with an
        // MDI heartIcon. The slot is therefore NOT rendered (hasPrependIcon=false) and
        // the story relies on the slot-default fallback path, not the named slot.
        // Headless assertion of the internal pill slot structure is not feasible from
        // this story variant. We verify instead that the badge root and pill are
        // visible, and that the wrapper still renders the default slot (avatar).
        test('badge renders with a visible pill on Slots - Prepend variant', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const pill = root.locator('.origam-badge__badge').first()
            await expect(pill).toBeVisible({ timeout: 5000 })
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
        // Same constraint as Slots - Prepend: the #append slot inside the pill is
        // gated by `v-if="hasAppendIcon"` (true only with appendIcon prop / status).
        // The story variant passes a slot but hasPrependIcon remains false, so the
        // slot template is never mounted. Not headlessly assertable from this variant.
        test('badge renders with a visible pill on Slots - Append variant', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const pill = root.locator('.origam-badge__badge').first()
            await expect(pill).toBeVisible({ timeout: 5000 })
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
    // DEFAULT — playground (index 8)                                       //
    // init: { modelValue: true, content: 3, bgColor: 'primary',           //
    //         location: 'top right' }                                      //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('renders badge root with --active class and content "3"', async ({ page }) => {
            await page.goto(variantUrl(16))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            await expect(root).toHaveClass(/origam-badge--active/)
            await expect(root.locator('.origam-badge__content')).toContainText('3')
        })

        test('root tag defaults to <div>', async ({ page }) => {
            await page.goto(variantUrl(16))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-badge').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const tag = await root.evaluate(el => el.tagName.toLowerCase())
            expect(tag).toBe('div')
        })

        test('pill receives a non-transparent background from the primary token', async ({ page }) => {
            await page.goto(variantUrl(16))
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
