import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/*
 * Real-browser verdict for `loadingText` (Card, ExpansionPanel) and for the
 * `eager` + `loadingText` cascade (ExpansionPanels).
 *
 * The unit specs pin the wiring on a DOM ATTRIBUTE (`aria-label`), which
 * jsdom reports faithfully. This spec answers what jsdom cannot: that the
 * whole chain holds in a real browser — prop -> `<origam-progress>`'s
 * `label` -> `t()` -> `aria-label`, and, for the plural, through
 * `<origam-defaults-provider>` and the ADR-005 theme-props resolver.
 *
 * ⛔ It navigates to STATIC Variants by index / title and never touches the
 * Histoire control panel: those widgets are custom DOM (an HstCheckbox
 * renders no `<input type="checkbox">` at all — verified by dumping every
 * `<input>` on the page), and driving them is the brittleness CLAUDE.md
 * warns about.
 *
 * ⛔ Never `waitForLoadState('networkidle')` here: Histoire keeps an HMR
 * websocket open, so it never resolves.
 */

const CARD = '/stories/story/components-stories-card-origamcard-story-vue'
const CARD_ID = 'components-stories-card-origamcard-story-vue'
const PANEL = '/stories/story/components-stories-expansionpanel-origamexpansionpanel-story-vue'
const PANEL_ID = 'components-stories-expansionpanel-origamexpansionpanel-story-vue'
const PANELS = '/stories/story/components-stories-expansionpanel-origamexpansionpanels-story-vue'
const PANELS_ID = 'components-stories-expansionpanel-origamexpansionpanels-story-vue'

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

test.describe('loadingText — the loading indicator announces what the prop names', () => {
    test('OrigamCard — default key vs custom key, side by side', async ({ page }) => {
        // Variant 21 = "Prop — loadingText": two cards, one without the prop.
        await page.goto(`${CARD}?variantId=${CARD_ID}-21`, { waitUntil: 'domcontentloaded' })

        const sandbox = sandboxOf(page)
        const loaders = sandbox.locator('.origam-card__loader [aria-label]')

        await expect(loaders).toHaveCount(2, { timeout: 20000 })
        await expect(loaders.nth(0)).toHaveAttribute('aria-label', 'Loading...', { timeout: 10000 })
        await expect(loaders.nth(1)).toHaveAttribute('aria-label', 'Loading items...', { timeout: 10000 })
    })

    test('OrigamExpansionPanel — default key vs custom key, side by side', async ({ page }) => {
        // Variant 11 = "Prop — loadingText".
        await page.goto(`${PANEL}?variantId=${PANEL_ID}-11`, { waitUntil: 'domcontentloaded' })

        const sandbox = sandboxOf(page)
        const loaders = sandbox.locator('.origam-expansion-panel__loader [aria-label]')

        await expect(loaders).toHaveCount(2, { timeout: 20000 })
        await expect(loaders.nth(0)).toHaveAttribute('aria-label', 'Loading...', { timeout: 10000 })
        await expect(loaders.nth(1)).toHaveAttribute('aria-label', 'Loading items...', { timeout: 10000 })
    })
})

test.describe('OrigamExpansionPanels — eager & loadingText cascade to the panels', () => {
    test('the group loadingText labels a panel that sets none, and is overridable', async ({ page }) => {
        await page.goto(`${PANELS}?variantId=${PANELS_ID}-13`, { waitUntil: 'domcontentloaded' })

        const sandbox = sandboxOf(page)
        const loaders = sandbox.locator('.origam-expansion-panel__loader [aria-label]')

        await expect(loaders).toHaveCount(2, { timeout: 20000 })
        // Panel 1 inherits the group's key, panel 2 overrides it.
        await expect(loaders.nth(0)).toHaveAttribute('aria-label', 'Loading items...', { timeout: 10000 })
        await expect(loaders.nth(1)).toHaveAttribute('aria-label', 'Loading...', { timeout: 10000 })
    })

    test('the group eager renders both collapsed panel bodies', async ({ page }) => {
        await page.goto(`${PANELS}?variantId=${PANELS_ID}-13`, { waitUntil: 'domcontentloaded' })

        const sandbox = sandboxOf(page)
        const panels = sandbox.locator('[data-cy="panels-cascade"] .origam-expansion-panel')

        await expect(panels).toHaveCount(2, { timeout: 20000 })
        await expect(sandbox.locator('.origam-expansion-panel-content__wrapper').first())
            .toContainText('rendered while the panel is collapsed', { timeout: 10000 })
    })
})
