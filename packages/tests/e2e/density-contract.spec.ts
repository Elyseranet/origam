import { expect, test, type Page } from '@playwright/test'

/**
 * Regression spec — `density="comfortable"` MUST produce a taller box
 * than `density="compact"` on every component that exposes the prop.
 *
 * Pre-fix six components had both rungs hardcoded to the same `+8px`
 * value, making `comfortable` visually identical to `compact` (both
 * shrunk the padding the same amount). The fix sets:
 *   • comfortable → −8px  (gross via `padding − (−8)` formula)
 *   • compact     → +8px  (shrinks via `padding − 8`)
 * For components using `height + density` (BtnGroup) the signs flip:
 *   • comfortable → +8px, compact → −8px.
 *
 * The runtime contract here is component-agnostic: comfortable height
 * MUST be strictly greater than compact height.
 */

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const measureHeightAtDensity = async (
    page: Page,
    storyPath: string,
    variant: string,
    density: 'compact' | 'default' | 'comfortable',
    selector: string
): Promise<number> => {
    await page.goto(storyPath)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
    const sandbox = sandboxOf(page)
    const target = sandbox.locator(selector).first()
    await expect(target).toBeVisible({ timeout: 8000 })

    // Add the density modifier class directly so we don't have to
    // drive the HstSelect dropdown (custom DOM, brittle to e2e).
    await target.evaluate((el, d) => {
        const cls = el.className.replace(/origam-[a-z-]+--density-(compact|default|comfortable)/g, '')
        el.className = `${cls} origam-${el.className.match(/origam-[a-z-]+/)?.[0].replace('origam-', '')}--density-${d}`.trim()
    }, density)

    // Force the modifier with a more reliable approach: read the root class
    // prefix, drop any density modifier, append the requested one.
    await target.evaluate((el, d) => {
        const root = (el.className.match(/origam-[a-z-]+/) || ['origam-alert'])[0]
        el.classList.remove(`${root}--density-compact`, `${root}--density-default`, `${root}--density-comfortable`)
        el.classList.add(`${root}--density-${d}`)
    }, density)

    await page.waitForTimeout(120)
    const box = await target.boundingBox()
    return box?.height ?? 0
}

const ALERT_STORY = '/stories/story/components-stories-alert-origamalert-story-vue'
const BTN_GROUP_STORY = '/stories/story/components-stories-btn-origambtngroup-story-vue'
const BREADCRUMB_STORY = '/stories/story/components-stories-breadcrumb-origambreadcrumb-story-vue'

test('OrigamAlert — comfortable height > compact height', async ({ page }) => {
    const compact = await measureHeightAtDensity(page, ALERT_STORY, 'Default', 'compact', '.origam-alert')
    const comfortable = await measureHeightAtDensity(page, ALERT_STORY, 'Default', 'comfortable', '.origam-alert')
    console.log('[alert] compact=', compact, 'comfortable=', comfortable)
    expect(comfortable).toBeGreaterThan(compact)
})

test('OrigamBtnGroup — comfortable min-height > compact min-height', async ({ page }) => {
    const compact = await measureHeightAtDensity(page, BTN_GROUP_STORY, 'Prop — density', 'compact', '.origam-btn-group')
    const comfortable = await measureHeightAtDensity(page, BTN_GROUP_STORY, 'Prop — density', 'comfortable', '.origam-btn-group')
    console.log('[btn-group] compact=', compact, 'comfortable=', comfortable)
    expect(comfortable).toBeGreaterThan(compact)
})

test('OrigamBreadcrumb — comfortable height > compact height', async ({ page }) => {
    const compact = await measureHeightAtDensity(page, BREADCRUMB_STORY, 'Prop — density', 'compact', '.origam-breadcrumb')
    const comfortable = await measureHeightAtDensity(page, BREADCRUMB_STORY, 'Prop — density', 'comfortable', '.origam-breadcrumb')
    console.log('[breadcrumb] compact=', compact, 'comfortable=', comfortable)
    expect(comfortable).toBeGreaterThan(compact)
})
