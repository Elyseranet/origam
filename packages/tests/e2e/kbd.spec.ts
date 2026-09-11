import { expect, test } from '@playwright/test'

/**
 * OrigamKbd runtime probes — pattern canonique btn.spec.ts
 *
 * Variants dans OrigamKbd.story.vue (grep -nE '<Variant' …) :
 *   0 → Design      init: { variant: 'outlined', combination: ['⌘', 'S'] }
 *   1 → Functional  init: { text: '⌘', separator: '+' }
 *   2 → Slots - Default  (slot avec <origam-icon>)
 *   3 → Default     init: { text: '⌘', variant: 'outlined', separator: '+' }
 *
 * Structure du composant :
 *   <kbd class="origam-kbd origam-kbd--variant-{v} …">
 *     <!-- combination → -->
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
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
        })

        test('renders a <kbd> element', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            const tag = await kbd.evaluate(el => el.tagName.toLowerCase())
            expect(tag).toBe('kbd')
        })

        test('variant=outlined adds origam-kbd--variant-outlined class', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            await expect(kbd).toHaveClass(/origam-kbd--variant-outlined/)
        })

        test('combination prop adds origam-kbd--combination class', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            await expect(kbd).toHaveClass(/origam-kbd--combination/)
        })

        test('combination renders one nested <kbd class="origam-kbd__key"> per key', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
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
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
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
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            await expect(kbd).toContainText('⌘')
        })

        test('text-only kbd has no origam-kbd--combination class', async ({ page }) => {
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            const cls = await kbd.evaluate(el => el.className)
            expect(cls).not.toContain('origam-kbd--combination')
        })

        test('text-only kbd contains no nested kbd__key elements', async ({ page }) => {
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            const keys = kbd.locator('.origam-kbd__key')
            await expect(keys).toHaveCount(0)
        })

        test('outlined variant (default) box-shadow is not none', async ({ page }) => {
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
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
            await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
        })

        test('slot renders an origam-icon child (not raw text)', async ({ page }) => {
            await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            const icon = kbd.locator('.origam-icon').first()
            await expect(icon).toBeVisible()
        })

        test('slot kbd contains no origam-kbd__key children', async ({ page }) => {
            await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
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
            await page.goto(variantUrl(4), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
        })

        // ⛔ Lot tokens (2026-09-10) — this assertion encoded the BUG: the
        // outlined variant used to ignore its 5 dormant per-variant tokens
        // (`--origam-kbd--outlined---background-color`,
        // `--origam-kbd__filled/tonal---background-color`, …, declared in
        // light.css/dark.css, never read anywhere in the SCSS) and fell back
        // to a hardcoded `var(--origam-color__surface---raised, #fff)`
        // instead — a solid fill for a variant whose OWN declared token is
        // `rgba(0, 0, 0, 0)` (transparent), the same convention `OrigamChip`
        // already uses for its outlined variant. Now that the SCSS reads the
        // real per-variant token, the default (`variant="outlined"`)
        // playground IS transparent by design — asserting the opposite was
        // asserting the pre-fix defect.
        test('variant=outlined resolves the transparent background token (by design)', async ({ page }) => {
            await page.goto(variantUrl(4), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            const bg = await kbd.evaluate(el => getComputedStyle(el).backgroundColor)
            expect(bg).toBe('rgba(0, 0, 0, 0)')
        })

        test('variant=filled resolves a non-transparent background from its own token', async ({ page }) => {
            await page.goto(variantUrl(4), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            // Mutate the class AND read the computed style in the SAME
            // `evaluate` — a class bound to Vue's `computed` (kbdClasses)
            // gets re-patched between two separate round-trips (see the
            // repo-wide `alert.spec.ts` pattern warning).
            const bg = await kbd.evaluate(el => {
                (el as HTMLElement).className = el.className.replace('origam-kbd--variant-outlined', 'origam-kbd--variant-filled')
                return getComputedStyle(el).backgroundColor
            })
            expect(bg).not.toBe('rgba(0, 0, 0, 0)')
            expect(bg).not.toBe('transparent')
        })

        test('has a non-zero font-size from the token', async ({ page }) => {
            await page.goto(variantUrl(4), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            const fontSize = await kbd.evaluate(el => parseFloat(getComputedStyle(el).fontSize))
            expect(fontSize).toBeGreaterThan(0)
        })

        test('variant=outlined produces a visible border', async ({ page }) => {
            await page.goto(variantUrl(4), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            const borderWidth = await kbd.evaluate(el => parseFloat(getComputedStyle(el).borderTopWidth))
            expect(borderWidth).toBeGreaterThan(0)
        })
    })
})
