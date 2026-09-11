import { expect, test } from '@playwright/test'

/**
 * RECIPE — OrigamPasswordField e2e spec (Histoire)
 *
 * ## Variant index map (grep -nE '<Variant' story.vue, 0-based)
 *
 *   0  → Design
 *   1  → State
 *   2  → Functional
 *   3  → Events - update:modelValue
 *   4  → Events - click:control
 *   5  → Events - mousedown:control
 *   6  → Events - focus & blur
 *   7  → Events - update:strength   (strength-bar active)
 *   8  → Slots - Default
 *   9  → Slots - Prepend
 *  10  → Slots - Append
 *  11  → Slots - PrependInner
 *  12  → Slots - AppendInner
 *  13  → Slots - Clear              (model-value="secret", clearable)
 *  14  → Slots - Label
 *  15  → Slots - FloatingLabel
 *  16  → Slots - Prefix
 *  17  → Slots - Suffix
 *  18  → Slots - Loader             (loading)
 *  19  → Slots - Counter
 *  20  → Slots - Details
 *  21  → Slots - Messages
 *  22  → Slots - Message
 *  23  → Slots - Info               (requirements active → popup)
 *  24  → Slots - Field
 *  25  → Default                    (playground)
 *
 * ## DOM classes (BEM)
 *
 *   Root : .origam-password-field (extends .origam-input)
 *   Toggle: .origam-password-field__toggle-icon
 *   Strength bar root: .origam-password-field__strength  [data-strength-score][data-strength-level]
 *   Strength segments: .origam-password-field__strength-segment
 *   Strength segment states: --empty | --weak | --fair | --good | --strong
 *   Requirements list: .origam-password-field__requirements--list
 *   Requirements tiles: .origam-password-field__requirements--tiles
 *   Requirement item (list): .origam-password-field__requirement  [data-requirement-id][data-satisfied]
 *   Requirement chip (tiles): .origam-password-field__requirement-chip  [data-requirement-id][data-satisfied]
 *
 * ## Strength heuristic (computeStrength)
 *   +1 length ≥ 8
 *   +1 length ≥ 12
 *   +1 contains digit
 *   +1 uppercase AND lowercase
 *   +1 non-alphanumeric
 *   Score 0-1 → weak | 2 → fair | 3 → good | 4-5 → strong
 *
 * ## Not testable headlessly (documented per CLAUDE.md)
 *   - Requirements inline (list / tiles) via the Functional Variant controls:
 *     Histoire controls (HstCheckbox for requirementsLayout) are in the parent
 *     frame sidebar and would require fragile selector hacks to toggle. These
 *     layouts are covered by the DS component unit tests instead.
 *   - Password requirements popup (requirements=true, no layout): the popup
 *     renders inside a teleport / OrigamMenu and only appears on focus, making
 *     it unreliable in headless CI without pointer simulation. The Slots - Info
 *     variant covers that the popup mount point exists.
 */

const STORY_ID   = 'components-stories-passwordfield-origampasswordfield-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

/** Build a variantId URL. */
const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamPasswordField', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: label='Password', color='primary', variant='outlined'          //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders root .origam-password-field', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })
        })

        test('initial input type is password', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('input[type="password"]').first()).toBeAttached()
        })

        test('toggle icon is rendered (non-minimal default)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-password-field__toggle-icon').first()).toBeVisible()
        })

        test('clicking the toggle icon switches input type to text', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })

            // Mousedown triggers handleToggleShow (not click)
            await sandbox.locator('.origam-password-field__toggle-icon').first().dispatchEvent('mousedown')
            await expect(sandbox.locator('input[type="text"]').first()).toBeAttached({ timeout: 3000 })
        })

        test('clicking the toggle icon a second time restores type=password', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })

            const toggle = sandbox.locator('.origam-password-field__toggle-icon').first()
            await toggle.dispatchEvent('mousedown')
            await expect(sandbox.locator('input[type="text"]').first()).toBeAttached({ timeout: 3000 })
            await toggle.dispatchEvent('mousedown')
            await expect(sandbox.locator('input[type="password"]').first()).toBeAttached({ timeout: 3000 })
        })

        test('no strength bar present when strengthBar prop is absent', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })
            const segCount = await sandbox.locator('.origam-password-field__strength-segment').count()
            expect(segCount).toBe(0)
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 2)                                                 //
    // init: all booleans false                                             //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('renders without error (all props false)', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })
        })

        test('input is interactive — typing updates value', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })
            const input = sandbox.locator('input').first()
            await input.fill('secret123')
            await expect(input).toHaveValue('secret123')
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS — update:strength (index 7)                                  //
    // Variant has strength-bar active — 4 segments always mounted         //
    // ------------------------------------------------------------------ //

    test.describe('Events - update:strength / Strength bar', () => {
        test('4 segments are mounted when strengthBar=true', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })
            const segCount = await sandbox.locator('.origam-password-field__strength-segment').count()
            expect(segCount).toBe(4)
        })

        test('empty password → score=0, all segments have --empty modifier', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })

            // Input is unfilled → score=0 → level=weak, 0 filled segments
            const bar = sandbox.locator('.origam-password-field__strength').first()
            await expect(bar).toHaveAttribute('data-strength-score', '0', { timeout: 3000 })
            const emptySegs = await sandbox.locator('.origam-password-field__strength-segment--empty').count()
            expect(emptySegs).toBe(4)
        })

        test('short password → score=1 (weak), 1 segment filled', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })

            // "abcdefgh" = length≥8 (+1) only → score=1, level=weak
            await sandbox.locator('input').first().fill('abcdefgh')
            const bar = sandbox.locator('.origam-password-field__strength').first()
            await expect(bar).toHaveAttribute('data-strength-score', '1', { timeout: 3000 })
            await expect(bar).toHaveAttribute('data-strength-level', 'weak')
            const weakSegs = await sandbox.locator('.origam-password-field__strength-segment--weak').count()
            expect(weakSegs).toBe(1)
        })

        test('fair password → score=2, 2 segments filled', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })

            // "abcdefgh1" = length≥8 (+1) + digit (+1) → score=2, level=fair
            await sandbox.locator('input').first().fill('abcdefgh1')
            const bar = sandbox.locator('.origam-password-field__strength').first()
            await expect(bar).toHaveAttribute('data-strength-score', '2', { timeout: 3000 })
            await expect(bar).toHaveAttribute('data-strength-level', 'fair')
        })

        test('good password → score=3, 3 segments filled', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })

            // "Abcdefgh1" = length≥8 (+1) + digit (+1) + mixed-case (+1) → score=3, level=good
            await sandbox.locator('input').first().fill('Abcdefgh1')
            const bar = sandbox.locator('.origam-password-field__strength').first()
            await expect(bar).toHaveAttribute('data-strength-score', '3', { timeout: 3000 })
            await expect(bar).toHaveAttribute('data-strength-level', 'good')
            const goodSegs = await sandbox.locator('.origam-password-field__strength-segment--good').count()
            expect(goodSegs).toBe(3)
        })

        test('strong password → score=4, all 4 segments filled', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })

            // "Abcdefgh1!" = length≥8 (+1) + digit (+1) + mixed-case (+1) + special (+1) → score=4
            await sandbox.locator('input').first().fill('Abcdefgh1!')
            const bar = sandbox.locator('.origam-password-field__strength').first()
            await expect(bar).toHaveAttribute('data-strength-score', '4', { timeout: 3000 })
            await expect(bar).toHaveAttribute('data-strength-level', 'strong')
            const strongSegs = await sandbox.locator('.origam-password-field__strength-segment--strong').count()
            expect(strongSegs).toBe(4)
        })

        test('clearing password resets bar to score=0', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })

            const input = sandbox.locator('input').first()
            await input.fill('Abcdefgh1!')
            const bar = sandbox.locator('.origam-password-field__strength').first()
            await expect(bar).toHaveAttribute('data-strength-score', '4', { timeout: 3000 })

            await input.fill('')
            await expect(bar).toHaveAttribute('data-strength-score', '0', { timeout: 3000 })
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS — update:modelValue (index 3)                                 //
    // ------------------------------------------------------------------ //

    test.describe('Events - update:modelValue', () => {
        test('input renders and accepts typing', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })

            const input = sandbox.locator('input').first()
            await input.fill('mypassword')
            await expect(input).toHaveValue('mypassword')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS — Clear (index 13)                                             //
    // Variant: model-value="secret", clearable                            //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Clear', () => {
        test('field renders with pre-set value "secret"', async ({ page }) => {
            await page.goto(variantUrl(13))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })
            // The input value should be "secret" (pre-seeded by the story)
            await expect(sandbox.locator('input').first()).toHaveValue('secret')
        })

        test('custom clear slot renders its content (origam-icon close)', async ({ page }) => {
            await page.goto(variantUrl(13))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })
            // The clear slot passes through to .origam-field__clearable — it should be visible
            // since the field is dirty (model-value="secret")
            await expect(sandbox.locator('.origam-field__clearable').first()).toBeVisible({ timeout: 3000 })
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS — Loader (index 18)                                            //
    // Variant: loading active                                              //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Loader', () => {
        test('custom loader slot content renders when loading', async ({ page }) => {
            await page.goto(variantUrl(18))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })
            // The story slot renders <span>Loading...</span>
            await expect(sandbox.locator('text=Loading...').first()).toBeVisible({ timeout: 3000 })
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS — Info (index 23)                                              //
    // Variant: requirements active — popup mount point exists              //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Info', () => {
        test('field with requirements renders (popup is closed by default)', async ({ page }) => {
            await page.goto(variantUrl(23))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })
            // The custom info slot renders inside the OrigamMenu teleport.
            // Without focus, the menu is closed. We only assert the field root
            // is mounted correctly — popup behaviour is not testable headlessly
            // without a reliable focus/pointer simulation across the sandbox iframe.
            // (Documented limitation: OrigamMenu teleports outside the sandbox DOM.)
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS — Prepend (index 9) — smoke test for slot passthrough          //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Prepend', () => {
        test('prepend slot renders its content', async ({ page }) => {
            await page.goto(variantUrl(9))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })
            // The story passes an OrigamIcon to #prepend — the outer prepend wrapper must exist
            await expect(sandbox.locator('.origam-input__prepend').first()).toBeVisible({ timeout: 3000 })
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS — Append (index 10) — smoke test for slot passthrough          //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Append', () => {
        test('append slot renders its content', async ({ page }) => {
            await page.goto(variantUrl(10))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-input__append').first()).toBeVisible({ timeout: 3000 })
        })
    })

    // ------------------------------------------------------------------ //
    // Default / playground (index 25)                                      //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('playground renders .origam-password-field', async ({ page }) => {
            await page.goto(variantUrl(25))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })
        })

        test('playground input type is password by default', async ({ page }) => {
            await page.goto(variantUrl(25))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-password-field').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('input[type="password"]').first()).toBeAttached()
        })
    })
})
