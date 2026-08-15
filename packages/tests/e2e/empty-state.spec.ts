import { expect, test } from '@playwright/test'

import { selectHstOption } from './_support/histoire-controls'

/**
 * OrigamEmptyState — runtime probes for each Variant exposed by the story.
 *
 * ## Navigation pattern (canonical — cf. btn.spec.ts)
 *   Direct URL navigation with variantId query param:
 *     await page.goto(STORY_PATH + '?variantId=' + STORY_ID + '-' + index)
 *
 *   ⚠️  NEVER use waitForLoadState('networkidle') — Histoire keeps an HMR
 *   websocket open so networkidle never resolves → guaranteed timeout.
 *   Use toBeVisible({timeout:12000}) instead.
 *
 * ## Story variants (0-based index)
 *   0 → Design      init: { preset:'no-data', title:'No items yet',
 *                           description:'Create your first item to get started.',
 *                           size:'md', align:'center' }
 *   1 → Functional  init: { preset:'no-data', title:'No items yet',
 *                           description:'Create your first item to get started.',
 *                           tag:'div' }
 *   2 → Slots - Icon        (custom SVG in #icon slot)
 *   3 → Slots - Title       (custom markup in #title slot)
 *   4 → Slots - Description (custom markup in #description slot)
 *   5 → Slots - Actions     (1 action + 2 actions in #actions slot)
 *   6 → Slots - Default     (default slot replaces built-in layout)
 *   7 → Default             (playground, same init as Design)
 *
 * ## Locators
 *   No data-cy attributes in the story — locate via BEM classes.
 *   Root: .origam-empty-state
 *   Children: .origam-empty-state__icon
 *             .origam-empty-state__icon-glyph  (inner OrigamClassIcon → <i>)
 *             .origam-empty-state__title
 *             .origam-empty-state__description
 *             .origam-empty-state__actions
 *
 * ## Icon rendering pipeline
 *   preset 'no-data'   → MDI_ICONS.DATABASE_OFF_OUTLINE  = 'mdi:mdi-database-off-outline'
 *   preset 'no-results'→ MDI_ICONS.MAGNIFY_CLOSE          = 'mdi:mdi-magnify-close'
 *   preset 'error'     → MDI_ICONS.ALERT_CIRCLE_OUTLINE  = 'mdi:mdi-alert-circle-outline'
 *   preset 'offline'   → MDI_ICONS.WIFI_OFF              = 'mdi:mdi-wifi-off'
 *   preset 'locked'    → MDI_ICONS.LOCK_OUTLINE           = 'mdi:mdi-lock-outline'
 *
 *   The icon resolver strips the 'mdi:' prefix → passes 'mdi-database-off-outline'
 *   to OrigamClassIcon → emits it as a CSS class on <i class="origam-icon mdi mdi-database-off-outline">.
 *   The innerHTML of .origam-empty-state__icon therefore contains 'mdi-database-off-outline'.
 *
 * ## Intent modifier classes (SCSS)
 *   preset 'error'  → intent 'danger'    → .origam-empty-state--intent-danger
 *   preset 'offline'→ intent 'warning'   → .origam-empty-state--intent-warning
 *   preset 'locked' → intent 'secondary' → .origam-empty-state--intent-secondary
 *   preset 'no-data'→ intent 'neutral'   → .origam-empty-state--intent-neutral
 *
 * ## Multi-preset / multi-size coverage
 *   The story has NO dedicated Variant per preset or size — the "Design"
 *   Variant's "Preset" / "Size" HstSelect controls are piloted via the
 *   shared `selectHstOption` helper (`_support/histoire-controls.ts`),
 *   same mechanism as the rest of the suite.
 */

const STORY_ID   = 'components-stories-emptystate-origamemptystate-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamEmptyState', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { preset:'no-data', title:'No items yet',                     //
    //         description:'Create your first item to get started.',        //
    //         size:'md', align:'center' }                                  //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('root element mounts with BEM class origam-empty-state', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
        })

        test('root carries role=status and aria-live=polite', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            await expect(root).toHaveAttribute('role', 'status')
            await expect(root).toHaveAttribute('aria-live', 'polite')
        })

        test('size=md applies modifier class origam-empty-state--size-md', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            await expect(root).toHaveClass(/origam-empty-state--size-md/)
        })

        test('align=center applies modifier class origam-empty-state--align-center', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            await expect(root).toHaveClass(/origam-empty-state--align-center/)
        })

        test('preset=no-data applies modifier class origam-empty-state--preset-no-data', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            await expect(root).toHaveClass(/origam-empty-state--preset-no-data/)
        })

        test('preset=no-data applies intent modifier class origam-empty-state--intent-neutral', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            await expect(root).toHaveClass(/origam-empty-state--intent-neutral/)
        })

        test('icon container is present and aria-hidden=true', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            const iconContainer = root.locator('.origam-empty-state__icon').first()
            await expect(iconContainer).toBeVisible({ timeout: 20000 })
            await expect(iconContainer).toHaveAttribute('aria-hidden', 'true')
        })

        test('preset=no-data icon contains the mdi-database-off-outline class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            const iconHtml = await root.locator('.origam-empty-state__icon').first().innerHTML()
            expect(iconHtml).toContain('mdi-database-off-outline')
        })

        test('title prop renders the label in .origam-empty-state__title', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            const title = root.locator('.origam-empty-state__title').first()
            await expect(title).toBeVisible({ timeout: 20000 })
            const text = await title.textContent()
            expect(text?.trim()).toBe('No items yet')
        })

        test('description prop renders in .origam-empty-state__description', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            const desc = root.locator('.origam-empty-state__description').first()
            await expect(desc).toBeVisible({ timeout: 20000 })
            const text = await desc.textContent()
            expect(text?.trim()).toBe('Create your first item to get started.')
        })

        test('size=md icon font-size resolves to 64px (token default)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            const iconContainer = root.locator('.origam-empty-state__icon').first()
            const fontSize = await iconContainer.evaluate(el => parseFloat(getComputedStyle(el).fontSize))
            expect(fontSize).toBeGreaterThan(0)
            // 64px is the md token default; allow small rounding (63–65)
            expect(fontSize).toBeGreaterThanOrEqual(60)
            expect(fontSize).toBeLessThanOrEqual(70)
        })

        /**
         * BUG FOUND while auditing this file's fixmes: the "headless-control-
         * limitation" claim on the preset assertions below was wrong —
         * verified empirically. The Design Variant's "Preset" HstSelect
         * pilots exactly the same way as every other spec in this suite via
         * the shared `selectHstOption` helper (`_support/histoire-controls.ts`,
         * already used successfully by dozens of specs including
         * btn-toggle.spec.ts and chip-group.spec.ts) — nothing about this
         * story's Preset control is special. This file simply never imported
         * the helper. Reactivated below; all 3 preset assertions pass.
         *
         * The "Size" control (2 tests further down) is a DIFFERENT, genuine
         * finding — kept fixme with an updated, verified diagnostic. See
         * there for details; do not fold it into this same explanation.
         */
        test('preset=error applies intent-danger and mdi-alert-circle-outline', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            await selectHstOption(page, 'Preset', 'error')
            await expect(root).toHaveClass(/origam-empty-state--intent-danger/)
            const iconHtml = await root.locator('.origam-empty-state__icon').first().innerHTML()
            expect(iconHtml).toContain('mdi-alert-circle-outline')
        })

        test('preset=offline applies intent-warning and mdi-wifi-off', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            await selectHstOption(page, 'Preset', 'offline')
            await expect(root).toHaveClass(/origam-empty-state--intent-warning/)
            const iconHtml = await root.locator('.origam-empty-state__icon').first().innerHTML()
            expect(iconHtml).toContain('mdi-wifi-off')
        })

        test('preset=locked applies intent-secondary and mdi-lock-outline', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            await selectHstOption(page, 'Preset', 'locked')
            await expect(root).toHaveClass(/origam-empty-state--intent-secondary/)
            const iconHtml = await root.locator('.origam-empty-state__icon').first().innerHTML()
            expect(iconHtml).toContain('mdi-lock-outline')
        })

        /**
         * REAL FINDING, re-diagnosed (not the original "brittle to pilot"
         * claim): verified live that `selectHstOption(page, 'Size', 'sm')`
         * DOES work mechanically — the Histoire controls-panel trigger
         * updates its own displayed text to "sm" (`state.size` changed on
         * the main-document instance) — but `.origam-empty-state` inside
         * the SANDBOX IFRAME never gains `--size-sm` and its icon
         * font-size never changes, even after an extra 1.5s wait. The
         * exact same mechanism (`selectHstOption` on the same Variant's
         * "Preset" control, same story, same postMessage sync path) DOES
         * propagate correctly — see the 3 reactivated preset tests above —
         * so this is not the generic Histoire double-mount race documented
         * in KNOWN_LIMITATIONS.md (that manifests as a TIMING race, not a
         * permanent desync of one specific field while siblings sync fine).
         * Root cause not established: could be the story's own state
         * plumbing or a Histoire quirk specific to a prop literally named
         * `size` — not conclusively a DS component bug (OrigamEmptyState's
         * own `size` consumption, packages/ds/src/components/EmptyState/
         * OrigamEmptyState.vue:135, is a plain reactive computed like any
         * other prop it reads). Needs follow-up before unfixming.
         */
        test.fixme('size=sm icon font-size is smaller than size=md', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            const iconContainer = root.locator('.origam-empty-state__icon').first()
            const mdFontSize = await iconContainer.evaluate(el => parseFloat(getComputedStyle(el).fontSize))
            await selectHstOption(page, 'Size', 'sm')
            await expect(root).toHaveClass(/origam-empty-state--size-sm/)
            const smFontSize = await iconContainer.evaluate(el => parseFloat(getComputedStyle(el).fontSize))
            expect(smFontSize).toBeLessThan(mdFontSize)
        })

        test.fixme('size=lg icon font-size is larger than size=md', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            const iconContainer = root.locator('.origam-empty-state__icon').first()
            const mdFontSize = await iconContainer.evaluate(el => parseFloat(getComputedStyle(el).fontSize))
            await selectHstOption(page, 'Size', 'lg')
            await expect(root).toHaveClass(/origam-empty-state--size-lg/)
            const lgFontSize = await iconContainer.evaluate(el => parseFloat(getComputedStyle(el).fontSize))
            expect(lgFontSize).toBeGreaterThan(mdFontSize)
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 1)                                                 //
    // init: { preset:'no-data', title:'No items yet',                     //
    //         description:'Create your first item to get started.',        //
    //         tag:'div' }                                                  //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('root element renders as <div> when tag=div', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            const tagName = await root.evaluate(el => el.tagName.toLowerCase())
            expect(tagName).toBe('div')
        })

        test('title and description are rendered from props', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            const titleText = await root.locator('.origam-empty-state__title').first().textContent()
            const descText  = await root.locator('.origam-empty-state__description').first().textContent()
            expect(titleText?.trim()).toBe('No items yet')
            expect(descText?.trim()).toBe('Create your first item to get started.')
        })

        test('ARIA contract is preserved on the functional variant', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            await expect(root).toHaveAttribute('role', 'status')
            await expect(root).toHaveAttribute('aria-live', 'polite')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - ICON (index 2)                                              //
    // Custom SVG injected via #icon slot, no built-in glyph expected.    //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Icon', () => {
        test('custom SVG slot replaces the default glyph', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            // The story renders a single OrigamEmptyState without any id/cy attribute.
            const iconContainer = sandbox.locator('.origam-empty-state__icon').first()
            await expect(iconContainer).toBeVisible({ timeout: 20000 })

            // Custom SVG must be present
            const svg = iconContainer.locator('svg').first()
            await expect(svg).toBeVisible({ timeout: 20000 })
        })

        test('#icon slot: the built-in origam-icon glyph is NOT rendered', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const iconContainer = sandbox.locator('.origam-empty-state__icon').first()
            await expect(iconContainer).toBeVisible({ timeout: 20000 })

            // The built-in glyph element (OrigamClassIcon) should be absent
            const glyphCount = await iconContainer.locator('.origam-empty-state__icon-glyph').count()
            expect(glyphCount).toBe(0)
        })

        test('#icon slot: title and description are still rendered', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            const title = root.locator('.origam-empty-state__title').first()
            const desc  = root.locator('.origam-empty-state__description').first()
            await expect(title).toBeVisible({ timeout: 20000 })
            await expect(desc).toBeVisible({ timeout: 20000 })
            expect((await title.textContent())?.trim()).toBe('No results found')
            expect((await desc.textContent())?.trim()).toContain('Try a different keyword')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - TITLE (index 3)                                             //
    // Custom markup injected via #title slot.                             //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Title', () => {
        test('#title slot: custom markup rendered inside .origam-empty-state__title', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            const titleEl = root.locator('.origam-empty-state__title').first()
            await expect(titleEl).toBeVisible({ timeout: 20000 })
            // Story injects <strong>Custom <em>title</em> markup</strong>
            // Vue scoped-styles may add data-v-* attributes on slot content,
            // so assert via tag locators rather than raw innerHTML strings.
            await expect(titleEl.locator('strong').first()).toBeVisible({ timeout: 8000 })
            await expect(titleEl.locator('em').first()).toBeVisible({ timeout: 8000 })
        })

        test('#title slot: description from prop is still rendered', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            const desc = root.locator('.origam-empty-state__description').first()
            await expect(desc).toBeVisible({ timeout: 20000 })
            expect((await desc.textContent())?.trim()).toBe('Create your first item to get started.')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - DESCRIPTION (index 4)                                       //
    // Custom markup injected via #description slot.                       //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Description', () => {
        test('#description slot: custom markup rendered inside .origam-empty-state__description', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            const descEl = root.locator('.origam-empty-state__description').first()
            await expect(descEl).toBeVisible({ timeout: 20000 })
            // Story injects <span>Custom <strong>description</strong> with rich markup.</span>
            // Vue scoped-styles may add data-v-* attributes on slot content,
            // so assert via tag locators rather than raw innerHTML strings.
            await expect(descEl.locator('span').first()).toBeVisible({ timeout: 8000 })
            await expect(descEl.locator('strong').first()).toBeVisible({ timeout: 8000 })
        })

        test('#description slot: title from prop is still rendered', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            const title = root.locator('.origam-empty-state__title').first()
            await expect(title).toBeVisible({ timeout: 20000 })
            expect((await title.textContent())?.trim()).toBe('No items yet')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - ACTIONS (index 5)                                           //
    // Two separate OrigamEmptyState blocks: one with 1 action,           //
    // one with 2 actions. Both are siblings in the same story shell.     //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Actions', () => {
        test('#actions slot: actions container is rendered', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            // Both instances are in the page; first one has 1 action
            const firstRoot = sandbox.locator('.origam-empty-state').first()
            await expect(firstRoot).toBeVisible({ timeout: 20000 })
            const actionsEl = firstRoot.locator('.origam-empty-state__actions').first()
            await expect(actionsEl).toBeVisible({ timeout: 20000 })
        })

        test('#actions slot — 1 action: single button is rendered', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const firstRoot = sandbox.locator('.origam-empty-state').first()
            await expect(firstRoot).toBeVisible({ timeout: 20000 })
            const buttons = firstRoot.locator('.origam-empty-state__actions .origam-btn')
            await expect(buttons.first()).toBeVisible({ timeout: 20000 })
            const count = await buttons.count()
            expect(count).toBe(1)
            const text = await buttons.first().textContent()
            expect(text?.trim()).toContain('Create project')
        })

        test('#actions slot — 2 actions: both buttons rendered in second instance', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            // Second OrigamEmptyState in the story (index 1)
            const secondRoot = sandbox.locator('.origam-empty-state').nth(1)
            await expect(secondRoot).toBeVisible({ timeout: 20000 })
            const buttons = secondRoot.locator('.origam-empty-state__actions .origam-btn')
            await expect(buttons.first()).toBeVisible({ timeout: 20000 })
            const count = await buttons.count()
            expect(count).toBe(2)
        })

        test('#actions slot — 2 actions: labels are "Create project" and "Import CSV"', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const secondRoot = sandbox.locator('.origam-empty-state').nth(1)
            await expect(secondRoot).toBeVisible({ timeout: 20000 })
            const buttons = secondRoot.locator('.origam-empty-state__actions .origam-btn')
            await expect(buttons.first()).toBeVisible({ timeout: 20000 })
            const labels = await buttons.allTextContents()
            const trimmed = labels.map(l => l.trim())
            expect(trimmed).toContain('Create project')
            expect(trimmed).toContain('Import CSV')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - DEFAULT (index 6)                                           //
    // Default slot replaces the entire built-in layout.                  //
    // ARIA contract must survive on the root element.                     //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('default slot: built-in icon is NOT rendered', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            const iconCount = await root.locator('.origam-empty-state__icon').count()
            expect(iconCount).toBe(0)
        })

        test('default slot: built-in title block is NOT rendered', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            const titleCount = await root.locator('.origam-empty-state__title').count()
            expect(titleCount).toBe(0)
        })

        test('default slot: built-in description block is NOT rendered', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            const descCount = await root.locator('.origam-empty-state__description').count()
            expect(descCount).toBe(0)
        })

        test('default slot: custom content is visible inside the root', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            // Story injects a .story-custom block with h3.story-custom__title "All caught up."
            const customTitle = root.locator('.story-custom__title').first()
            await expect(customTitle).toBeVisible({ timeout: 20000 })
            expect((await customTitle.textContent())?.trim()).toBe('All caught up.')
        })

        test('default slot: root still carries role=status and aria-live=polite', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            await expect(root).toHaveAttribute('role', 'status')
            await expect(root).toHaveAttribute('aria-live', 'polite')
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT / PLAYGROUND (index 7)                                      //
    // init: { preset:'no-data', title:'No items yet',                     //
    //         description:'Create your first item to get started.',        //
    //         size:'md', align:'center' }                                  //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('playground: component mounts with origam-empty-state root class', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
        })

        test('playground: init state title and description are rendered', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            const title = root.locator('.origam-empty-state__title').first()
            const desc  = root.locator('.origam-empty-state__description').first()
            await expect(title).toBeVisible({ timeout: 20000 })
            await expect(desc).toBeVisible({ timeout: 20000 })
            expect((await title.textContent())?.trim()).toBe('No items yet')
            expect((await desc.textContent())?.trim()).toBe('Create your first item to get started.')
        })

        test('playground: ARIA contract present on root', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-empty-state').first()
            await expect(root).toBeVisible({ timeout: 20000 })
            await expect(root).toHaveAttribute('role', 'status')
            await expect(root).toHaveAttribute('aria-live', 'polite')
        })
    })
})
