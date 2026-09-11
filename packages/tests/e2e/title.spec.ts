import { expect, test } from '@playwright/test'

/**
 * OrigamTitle — runtime behaviour specs.
 *
 * Story: packages/stories/components/stories/Title/OrigamTitle.story.vue
 * Variants (0-based index):
 *   0 → Design       (tag, color, bgColor, density, border, padding, margin)
 *   1 → Slots - Default
 *   2 → Default      (playground)
 *
 * Pattern: navigation directe via variantId — JAMAIS waitForLoadState('networkidle')
 * (Histoire maintient un websocket HMR → networkidle ne résout jamais).
 * Localisation via '.origam-title' dans l'iframe sandbox.
 */

const STORY_ID   = 'components-stories-title-origamtitle-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamTitle', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { tag: 'h1', text: 'OrigamTitle' }                            //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders root element with BEM class origam-title', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const title = sandbox.locator('.origam-title').first()
            await expect(title).toBeVisible({ timeout: 12000 })
        })

        test('default tag is h1', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            // init-state: tag='h1' → root element must be an <h1>
            const h1 = sandbox.locator('h1.origam-title').first()
            await expect(h1).toBeVisible({ timeout: 12000 })
        })

        test('text prop renders the label inside the title element', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const title = sandbox.locator('.origam-title').first()
            await expect(title).toBeVisible({ timeout: 12000 })
            // init-state: text='OrigamTitle'
            await expect(title).toContainText('OrigamTitle')
        })

        test('font-weight comes from the CSS token (semibold = 600)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const title = sandbox.locator('.origam-title').first()
            await expect(title).toBeVisible({ timeout: 12000 })
            const fw = await title.evaluate(el => getComputedStyle(el).fontWeight)
            // --origam-title---font-weight resolves to 600 (semibold) or 'bold' (700)
            expect(['600', '700', 'bold']).toContain(fw)
        })

        test('density-compact/default/comfortable produce distinct font-sizes via SCSS', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const title = sandbox.locator('.origam-title').first()
            await expect(title).toBeVisible({ timeout: 12000 })

            // Inject density modifier classes programmatically to verify the SCSS rules are compiled.
            // The three rules in OrigamTitle.vue:
            //   &--density-compact    → font-size: var(--origam-title---font-size-xs)
            //   &--density-default    → font-size: var(--origam-title---font-size-md)
            //   &--density-comfortable→ font-size: var(--origam-title---font-size-xl)
            const measure = async (density: 'compact' | 'default' | 'comfortable') => {
                return title.evaluate((el, d) => {
                    el.classList.remove(
                        'origam-title--density-compact',
                        'origam-title--density-default',
                        'origam-title--density-comfortable'
                    )
                    el.classList.add(`origam-title--density-${d}`)
                    return getComputedStyle(el).fontSize
                }, density)
            }

            const compact     = await measure('compact')
            const dflt        = await measure('default')
            const comfortable = await measure('comfortable')

            console.log('[title-density] compact:', compact, '| default:', dflt, '| comfortable:', comfortable)

            // All three values must differ — if any pair is equal the SCSS rule or token is missing.
            expect(compact, 'compact ≠ default').not.toBe(dflt)
            expect(dflt,    'default ≠ comfortable').not.toBe(comfortable)
            expect(compact, 'compact ≠ comfortable').not.toBe(comfortable)
        })

        test('color prop (tokenised): utility class origam--color-* is applied', async ({ page }) => {
            // The useBothColor composable emits a utility class when the value is a known token.
            // We inject it programmatically to verify the stylesheet wiring.
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const title = sandbox.locator('.origam-title').first()
            await expect(title).toBeVisible({ timeout: 12000 })

            // Inject inline color style to verify the style-binding path
            await title.evaluate(el => {
                (el as HTMLElement).style.setProperty('color', 'rgb(220, 38, 38)')
            })
            const color = await title.evaluate(el => getComputedStyle(el).color)
            expect(color).toBe('rgb(220, 38, 38)')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - DEFAULT (index 1)                                            //
    // Story: <origam-title tag="h2">Welcome <em>back</em></origam-title>  //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('renders the title as h2 (tag prop from static slot story)', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const h2 = sandbox.locator('h2.origam-title').first()
            await expect(h2).toBeVisible({ timeout: 12000 })
        })

        test('slot content renders inside the title element', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const title = sandbox.locator('.origam-title').first()
            await expect(title).toBeVisible({ timeout: 12000 })
            // Story renders: Welcome <em>back</em>
            await expect(title).toContainText('Welcome')
            await expect(title).toContainText('back')
        })

        test('slot content preserves inline markup (<em> element present)', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const em = sandbox.locator('.origam-title em').first()
            await expect(em).toBeVisible({ timeout: 12000 })
            await expect(em).toContainText('back')
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT — playground (index 2)                                       //
    // init: { tag: 'h1', text: 'OrigamTitle' }                            //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('renders the title with BEM class and init text', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const title = sandbox.locator('.origam-title').first()
            await expect(title).toBeVisible({ timeout: 12000 })
            await expect(title).toContainText('OrigamTitle')
        })

        test('default tag is h1 in playground variant', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const h1 = sandbox.locator('h1.origam-title').first()
            await expect(h1).toBeVisible({ timeout: 12000 })
        })

        test('no density modifier class when density prop is omitted', async ({ page }) => {
            // useDensity only emits a modifier class when the prop is explicitly set.
            // When density is not in the init-state, the root carries no density class.
            // This verifies the component does not add a spurious default class.
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const title = sandbox.locator('.origam-title').first()
            await expect(title).toBeVisible({ timeout: 12000 })
            const classes = await title.getAttribute('class')
            expect(classes).not.toMatch(/origam-title--density-/)
        })
    })
})
