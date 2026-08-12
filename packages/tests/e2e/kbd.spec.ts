import { expect, test } from '@playwright/test'

/**
 * OrigamKbd runtime probes — pattern canonique btn.spec.ts
 *
 * ADR-005 (`docs/internal/adr-005-variant-as-props-preset.md`) pilot: `variant`
 * is now a props PRESET (`KBD_VARIANT_PRESETS`, resolved via `useDefaults`),
 * not a CSS layer — the DS ships zero `--variant-*` SCSS rule.
 *
 * Variants dans OrigamKbd.story.vue (grep -nE '<Variant' …) :
 *   0 → Design      init: { variant: 'outlined' } — renders TWO
 *                    <origam-kbd variant="outlined" combination=['⌘','S']>
 *                    side by side: #1 the resolved preset as-is, #2 the
 *                    SAME variant with `bg-color="primary"` forced — proves
 *                    the explicit prop beats the preset (ADR-005 Q2).
 *   1 → Functional  init: { text: '⌘', separator: '+' }  (variant unset →
 *                    component's own `withDefaults` default 'outlined')
 *   2 → Slots - Default  (slot avec <origam-icon>)
 *   3 → Default     init: { text: '⌘', variant: 'outlined', separator: '+' }
 *
 * Structure du composant :
 *   <kbd class="origam-kbd origam-kbd--variant-{v} …">   ← class survives,
 *                                                           carries NO style
 *     <!-- combination → resolved surface (bg/border/elevation) applied
 *          directly to EACH nested key, suppressed on the root -->
 *     <kbd class="origam-kbd__key">…</kbd>
 *     <span class="origam-kbd__separator" aria-hidden="true">…</span>
 *     <!-- text → texte direct -->
 *     <!-- slot → slot default -->
 *   </kbd>
 *
 * Non-testable headless :
 *   - Rendu de police JetBrains Mono / Fira Code (chargement de font async)
 *   - v-contrast directif (couleur contrastée calculée en runtime selon le thème)
 */

const STORY_ID   = 'components-stories-kbd-origamkbd-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamKbd', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { variant: 'outlined', combination: ['⌘', 'S'] }             //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders the kbd root with BEM class origam-kbd', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
        })

        test('renders a <kbd> element', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            const tag = await kbd.evaluate(el => el.tagName.toLowerCase())
            expect(tag).toBe('kbd')
        })

        test('variant=outlined adds origam-kbd--variant-outlined class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            await expect(kbd).toHaveClass(/origam-kbd--variant-outlined/)
        })

        test('combination prop adds origam-kbd--combination class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            await expect(kbd).toHaveClass(/origam-kbd--combination/)
        })

        test('combination renders one nested <kbd class="origam-kbd__key"> per key', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            // combination: ['⌘', 'S'] → 2 keys
            const keys = kbd.locator('.origam-kbd__key')
            await expect(keys).toHaveCount(2)
            await expect(keys.nth(0)).toContainText('⌘')
            await expect(keys.nth(1)).toContainText('S')
        })

        test('combination renders (n-1) separators with aria-hidden', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            // 2 keys → 1 separator
            const separators = kbd.locator('.origam-kbd__separator')
            await expect(separators).toHaveCount(1)
            // separator is aria-hidden for assistive tech
            const ariaHidden = await separators.first().getAttribute('aria-hidden')
            expect(ariaHidden).toBe('true')
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 1)                                                 //
    // init: { text: '⌘', separator: '+' }                                 //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('text prop renders content directly inside <kbd>', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            await expect(kbd).toContainText('⌘')
        })

        test('text-only kbd has no origam-kbd--combination class', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            const cls = await kbd.evaluate(el => el.className)
            expect(cls).not.toContain('origam-kbd--combination')
        })

        test('text-only kbd contains no nested kbd__key elements', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            const keys = kbd.locator('.origam-kbd__key')
            await expect(keys).toHaveCount(0)
        })

        test('outlined variant (default) box-shadow is not none', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            // Default variant is 'outlined' per withDefaults.
            // The SCSS rule applies a box-shadow for outlined/filled — must be non-none.
            const shadow = await kbd.evaluate(el => getComputedStyle(el).boxShadow)
            expect(shadow).not.toBe('none')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - DEFAULT (index 2)                                            //
    // Renders <origam-icon> inside <origam-kbd>                           //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('slot content renders inside the kbd element', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
        })

        test('slot renders an origam-icon child (not raw text)', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            const icon = kbd.locator('.origam-icon').first()
            await expect(icon).toBeVisible()
        })

        test('slot kbd contains no origam-kbd__key children', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            // When slot is provided, combination branch is skipped
            const keys = kbd.locator('.origam-kbd__key')
            await expect(keys).toHaveCount(0)
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT / PLAYGROUND (index 3)                                       //
    // init: { text: '⌘', variant: 'outlined', separator: '+' }           //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('renders the kbd root', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
        })

        test('has non-transparent background-color from token', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            const bg = await kbd.evaluate(el => getComputedStyle(el).backgroundColor)
            expect(bg).not.toBe('rgba(0, 0, 0, 0)')
            expect(bg).not.toBe('transparent')
        })

        test('has a non-zero font-size from the token', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            const fontSize = await kbd.evaluate(el => parseFloat(getComputedStyle(el).fontSize))
            expect(fontSize).toBeGreaterThan(0)
        })

        test('variant=outlined produces a visible border', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            const borderWidth = await kbd.evaluate(el => parseFloat(getComputedStyle(el).borderTopWidth))
            expect(borderWidth).toBeGreaterThan(0)
        })
    })

    // ------------------------------------------------------------------ //
    // ADR-005 — variant = props preset, not a CSS layer (index 0)          //
    //                                                                      //
    // Design variant renders TWO <origam-kbd variant="outlined"> side by   //
    // side (see OrigamKbd.story.vue): #1 the resolved preset as-is, #2 the //
    // SAME variant with `bg-color="primary"` set explicitly. Per ADR-005   //
    // Q2, the explicit prop must win — this is the model's headline test,  //
    // and it requires NO Histoire control interaction (both examples are   //
    // static markup in the story), which is why it is exercised here      //
    // rather than by driving the HstSelect variant picker.                //
    // ------------------------------------------------------------------ //

    test.describe('ADR-005 — variant preset tier', () => {
        test('an explicit bg-color beats the resolved variant preset', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            // Both demo figures render `:combination="['⌘', 'S']"` — the ROOT
            // `.origam-kbd` is always transparent by design (surface moves to
            // `__key`, see `surfaceStyles` in OrigamKbd.vue), so the paint
            // must be read off the KEY, not the root.
            const keys = sandbox.locator('.origam-kbd__key')
            await expect(keys.first()).toBeVisible({ timeout: 12000 })

            const presetBg = await keys.nth(0).evaluate(el => getComputedStyle(el).backgroundColor)
            const overriddenBg = await keys.nth(2).evaluate(el => getComputedStyle(el).backgroundColor)

            // The override paints a DIFFERENT color than the bare preset —
            // proves `bgColor="primary"` was not swallowed by `variant`.
            expect(overriddenBg).not.toBe(presetBg)
            expect(overriddenBg).not.toBe('rgba(0, 0, 0, 0)')
        })

        test('the DS ships zero CSS rule targeting .origam-kbd--variant-* (D3)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })

            // Scan every loaded stylesheet reachable from the sandbox frame
            // for a selector mentioning `.origam-kbd--variant-` SPECIFICALLY
            // (scoped to Kbd — other, not-yet-migrated DS components such as
            // Btn still ship their OWN `--variant-*` rules on purpose, and
            // the sandbox iframe loads every component's CSS globally, so an
            // unscoped substring match would false-positive on THEIR rules).
            // None should exist for Kbd — the class is a pure override hook
            // (D3), styling now comes exclusively from resolved props
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
                            && (rule as CSSStyleRule).selectorText.includes('.origam-kbd--variant-')) {
                            found = true
                        }
                    }
                }
                return found
            })
            expect(hasVariantRule).toBe(false)
        })

        test('combination root has no surface (transparent bg) while each key does', async ({ page }) => {
            // Regression guard for the props-preset migration: the old SCSS
            // relied on a CSS custom-property cascade (root class → var →
            // inherited by nested __key) to paint each key while hiding the
            // ROOT's own background. Props/inline-styles do NOT cascade —
            // OrigamKbd.vue now applies the resolved surface directly to
            // each __key and suppresses it on the root. This test catches a
            // regression where the whole combination group would get a
            // background box drawn around it.
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })

            const rootBg = await kbd.evaluate(el => getComputedStyle(el).backgroundColor)
            expect(rootBg).toBe('rgba(0, 0, 0, 0)')

            const keys = kbd.locator('.origam-kbd__key')
            await expect(keys).toHaveCount(2)
            for (const idx of [0, 1]) {
                const keyBg = await keys.nth(idx).evaluate(el => getComputedStyle(el).backgroundColor)
                expect(keyBg).not.toBe('rgba(0, 0, 0, 0)')
            }
        })
    })
})
