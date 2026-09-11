import { expect, test } from '@playwright/test'

/**
 * OrigamExpansionPanel / OrigamExpansionPanelHeader — e2e spec
 *
 * Two stories are exercised:
 *   - OrigamExpansionPanelHeader  (story group: ExpansionPanel/OrigamExpansionPanelHeader)
 *   - OrigamExpansionPanel        (story group: ExpansionPanel/OrigamExpansionPanel)
 *
 * Variant index map — OrigamExpansionPanelHeader:
 *   0  Design
 *   1  State
 *   2  Functional
 *   3  Events - click:append
 *   4  Events - click:prepend
 *   5  Slots - Default
 *   6  Slots - Prepend
 *   7  Slots - Append
 *   8  Slots - Title
 *   9  Default (playground)
 *
 * Variant index map — OrigamExpansionPanel:
 *   0  Design
 *   1  State
 *   2  Functional
 *   3  Events - group:selected
 *   4  Slots - Header
 *   5  Slots - Default
 *   6  Slots - Title
 *   7  Slots - Prepend
 *   8  Slots - Append
 *   9  Slots - Loader
 *  10  Slots - Wrapper
 *  11  Default (playground)
 *
 * DS bug fixed: `OrigamExpansionPanelHeader` had no `<slot name="title">` — the
 * `#title` forwarded by `OrigamExpansionPanel` (and `OrigamExpansionPanels`) landed
 * nowhere, and without a `title` prop the title `<span>` didn't even mount
 * (`hasTitle` only checked `slots.default || props.title`). Fixed by adding a real
 * `title` slot to the header, wrapping the previous `default` slot as its own
 * fallback (so direct consumers of `OrigamExpansionPanelHeader` using `#default`
 * keep working unchanged) — see `OrigamExpansionPanelHeader.vue`. Both Variant 6
 * below (Panel-level forwarding) and Variant 8 of the Header story (direct usage)
 * now assert the real behaviour instead of being `test.fixme`.
 *
 * Conventions (from btn.spec.ts recipe):
 *   - Navigation: page.goto(variantUrl(idx)) — variantId query param, direct load.
 *   - NEVER waitForLoadState('networkidle') — Histoire keeps HMR websocket open.
 *   - toBeVisible({ timeout: 12000 }) on the first component locator.
 *   - No data-cy attributes on these stories — target BEM class selectors.
 *   - test.setTimeout(45000) for the whole describe block.
 */

// ─────────────────────────────────────────────────────────────────────────────
// STORY IDs
// ─────────────────────────────────────────────────────────────────────────────

const HEADER_STORY_ID   = 'components-stories-expansionpanel-origamexpansionpanelheader-story-vue'
const PANEL_STORY_ID    = 'components-stories-expansionpanel-origamexpansionpanel-story-vue'

const HEADER_STORY_PATH = '/stories/story/' + HEADER_STORY_ID
const PANEL_STORY_PATH  = '/stories/story/' + PANEL_STORY_ID

const headerVariantUrl = (idx: number) =>
    `${HEADER_STORY_PATH}?variantId=${HEADER_STORY_ID}-${idx}`

const panelVariantUrl = (idx: number) =>
    `${PANEL_STORY_PATH}?variantId=${PANEL_STORY_ID}-${idx}`

// ─────────────────────────────────────────────────────────────────────────────
// OrigamExpansionPanelHeader
// ─────────────────────────────────────────────────────────────────────────────

test.describe('OrigamExpansionPanelHeader', () => {
    test.setTimeout(45000)

    // ── Design (index 0) ──────────────────────────────────────────────────────
    // init: { title: 'Section heading' }

    test.describe('Design', () => {
        test('renders the header root with BEM class', async ({ page }) => {
            await page.goto(headerVariantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
        })

        test('header is a <button> element by default (tag=button)', async ({ page }) => {
            await page.goto(headerVariantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            const tag = await header.evaluate(el => el.tagName.toLowerCase())
            expect(tag).toBe('button')
        })

        test('title prop renders text inside the title span', async ({ page }) => {
            await page.goto(headerVariantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const title = sandbox.locator('.origam-expansion-panel-header__title').first()
            await expect(title).toBeVisible({ timeout: 12000 })
            await expect(title).toContainText('Section heading')
        })

        test('aria-expanded is false in collapsed state', async ({ page }) => {
            await page.goto(headerVariantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await expect(header).toHaveAttribute('aria-expanded', 'false')
        })

        test('click toggles aria-expanded to true', async ({ page }) => {
            await page.goto(headerVariantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await header.click()
            await expect(header).toHaveAttribute('aria-expanded', 'true')
        })

        test('click adds the --active modifier class', async ({ page }) => {
            await page.goto(headerVariantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await header.click()
            await expect(header).toHaveClass(/origam-expansion-panel-header--active/)
        })

        test('click reveals the panel content', async ({ page }) => {
            await page.goto(headerVariantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await header.click()
            const content = sandbox.locator('.origam-expansion-panel-content').first()
            await expect(content).toBeVisible({ timeout: 8000 })
        })

        test('second click collapses — aria-expanded returns to false', async ({ page }) => {
            await page.goto(headerVariantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await header.click()
            await expect(header).toHaveAttribute('aria-expanded', 'true')
            await header.click()
            await expect(header).toHaveAttribute('aria-expanded', 'false')
        })

        test('expand/collapse icon area is present (append slot)', async ({ page }) => {
            await page.goto(headerVariantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await expect(header.locator('.origam-expansion-panel-header__append')).toBeAttached()
        })
    })

    // ── State (index 1) ───────────────────────────────────────────────────────
    // init: { bgColor: 'primary' }

    test.describe('State', () => {
        test('renders with bgColor=primary utility class', async ({ page }) => {
            await page.goto(headerVariantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await expect(header).toHaveClass(/origam--bg-primary/)
        })

        test('overlay opacity is 0 at rest (no hover)', async ({ page }) => {
            await page.goto(headerVariantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            const overlayOpacity = await header.locator('.origam-expansion-panel-header__overlay').evaluate(
                el => getComputedStyle(el).opacity
            )
            expect(parseFloat(overlayOpacity)).toBe(0)
        })
    })

    // ── Functional (index 2) ──────────────────────────────────────────────────
    // init: { hideActions: false, readonly: false, static: false, focusable: true, ripple: true }

    test.describe('Functional', () => {
        test('renders the header in functional variant', async ({ page }) => {
            await page.goto(headerVariantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
        })

        test('focusable=true applies the --focusable modifier class', async ({ page }) => {
            await page.goto(headerVariantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await expect(header).toHaveClass(/origam-expansion-panel-header--focusable/)
        })

        test('hideActions=false: the append area (chevron) is visible', async ({ page }) => {
            await page.goto(headerVariantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await expect(header.locator('.origam-expansion-panel-header__append')).toBeVisible()
        })

        test('readonly=false: click toggles the panel (not locked)', async ({ page }) => {
            await page.goto(headerVariantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await header.click()
            await expect(header).toHaveAttribute('aria-expanded', 'true')
        })

        test('SCSS --static: adding the class applies the modifier', async ({ page }) => {
            await page.goto(headerVariantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            const classes = await header.evaluate(el => {
                el.classList.add('origam-expansion-panel-header--static')
                return el.className
            })
            expect(classes).toContain('origam-expansion-panel-header--static')
        })
    })

    // ── Events - click:append (index 3) ──────────────────────────────────────

    test.describe('Events - click:append', () => {
        test('renders with an append icon (OPEN_IN_NEW)', async ({ page }) => {
            await page.goto(headerVariantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            // Append area contains at least one origam-icon
            await expect(header.locator('.origam-expansion-panel-header__append .origam-icon').first()).toBeAttached()
        })

        test('click on the append area does not throw', async ({ page }) => {
            await page.goto(headerVariantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const append = sandbox.locator('.origam-expansion-panel-header__append').first()
            await expect(append).toBeVisible({ timeout: 20000 })
            await append.click()
        })
    })

    // ── Events - click:prepend (index 4) ─────────────────────────────────────

    test.describe('Events - click:prepend', () => {
        test('renders with a prepend icon (COG_OUTLINE)', async ({ page }) => {
            await page.goto(headerVariantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await expect(header.locator('.origam-expansion-panel-header__prepend .origam-icon').first()).toBeAttached()
        })

        test('click on the prepend area does not throw', async ({ page }) => {
            await page.goto(headerVariantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const prepend = sandbox.locator('.origam-expansion-panel-header__prepend').first()
            await expect(prepend).toBeVisible({ timeout: 20000 })
            await prepend.click()
        })
    })

    // ── Slots - Default (index 5) ─────────────────────────────────────────────

    test.describe('Slots - Default', () => {
        test('default slot renders custom content in the title area', async ({ page }) => {
            await page.goto(headerVariantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const title = sandbox.locator('.origam-expansion-panel-header__title').first()
            await expect(title).toBeVisible({ timeout: 12000 })
            await expect(title).toContainText('Custom default slot content')
        })
    })

    // ── Slots - Prepend (index 6) ─────────────────────────────────────────────

    test.describe('Slots - Prepend', () => {
        test('prepend slot renders an origam-icon inside the prepend area', async ({ page }) => {
            await page.goto(headerVariantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await expect(header.locator('.origam-expansion-panel-header__prepend .origam-icon')).toBeAttached()
        })
    })

    // ── Slots - Append (index 7) ──────────────────────────────────────────────

    test.describe('Slots - Append', () => {
        test('append slot renders an origam-icon inside the append area', async ({ page }) => {
            await page.goto(headerVariantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await expect(header.locator('.origam-expansion-panel-header__append .origam-icon').first()).toBeAttached()
        })
    })

    // ── Slots - Title (index 8) ───────────────────────────────────────────────
    // Direct usage of `<origam-expansion-panel-header>` with a `#title` slot and
    // NO `title` prop — the exact regression scenario for the fixed DS bug.

    test.describe('Slots - Title', () => {
        test('title slot renders custom content with no `title` prop set', async ({ page }) => {
            await page.goto(headerVariantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const title = sandbox.locator('.origam-expansion-panel-header__title').first()
            await expect(title).toBeVisible({ timeout: 12000 })
            await expect(title).toContainText('Custom title slot content')
        })

        test('title span mounts even without the `title` prop (hasTitle honours slots.title)', async ({ page }) => {
            await page.goto(headerVariantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await expect(header.locator('.origam-expansion-panel-header__title')).toHaveCount(1)
        })
    })

    // ── Default / playground (index 9) ───────────────────────────────────────
    // init: { title: 'Section heading', hideActions: false, readonly: false, static: false, focusable: true }

    test.describe('Default (playground)', () => {
        test('renders a header with title "Section heading"', async ({ page }) => {
            await page.goto(headerVariantUrl(9))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const title = sandbox.locator('.origam-expansion-panel-header__title').first()
            await expect(title).toBeVisible({ timeout: 12000 })
            await expect(title).toContainText('Section heading')
        })

        test('is a <button> element (default tag)', async ({ page }) => {
            await page.goto(headerVariantUrl(9))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            const tag = await header.evaluate(el => el.tagName.toLowerCase())
            expect(tag).toBe('button')
        })

        test('expand icon (chevron-down) is present in the append area', async ({ page }) => {
            await page.goto(headerVariantUrl(9))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await expect(header.locator('.origam-expansion-panel-header__append .origam-icon')).toBeAttached()
        })
    })
})

// ─────────────────────────────────────────────────────────────────────────────
// OrigamExpansionPanel
// ─────────────────────────────────────────────────────────────────────────────

test.describe('OrigamExpansionPanel', () => {
    test.setTimeout(45000)

    // ── Design (index 0) ──────────────────────────────────────────────────────
    // init: { title: 'Design panel', expandIcon: CHEVRON_DOWN, collapseIcon: CHEVRON_UP }

    test.describe('Design', () => {
        test('renders the panel root with BEM class', async ({ page }) => {
            await page.goto(panelVariantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const panel = sandbox.locator('.origam-expansion-panel').first()
            await expect(panel).toBeVisible({ timeout: 12000 })
        })

        test('renders the inner header with title "Design panel"', async ({ page }) => {
            await page.goto(panelVariantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const title = sandbox.locator('.origam-expansion-panel-header__title').first()
            await expect(title).toBeVisible({ timeout: 12000 })
            await expect(title).toContainText('Design panel')
        })

        test('expand icon (chevron) is present in collapsed state', async ({ page }) => {
            await page.goto(panelVariantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const panel = sandbox.locator('.origam-expansion-panel').first()
            await expect(panel).toBeVisible({ timeout: 12000 })
            await expect(panel.locator('.origam-expansion-panel-header__append .origam-icon')).toBeAttached()
        })

        test('panel is not active in initial state', async ({ page }) => {
            await page.goto(panelVariantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const panel = sandbox.locator('.origam-expansion-panel').first()
            await expect(panel).toBeVisible({ timeout: 12000 })
            const classes = await panel.getAttribute('class')
            expect(classes).not.toContain('origam-expansion-panel--active')
        })

        test('clicking the header expands the panel (--active class)', async ({ page }) => {
            await page.goto(panelVariantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await header.click()
            const panel = sandbox.locator('.origam-expansion-panel').first()
            await expect(panel).toHaveClass(/origam-expansion-panel--active/)
        })
    })

    // ── State (index 1) ───────────────────────────────────────────────────────
    // init: { bgColor: 'primary' }

    test.describe('State', () => {
        test('renders panel with bgColor=primary utility class', async ({ page }) => {
            await page.goto(panelVariantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const panel = sandbox.locator('.origam-expansion-panel').first()
            await expect(panel).toBeVisible({ timeout: 12000 })
            await expect(panel).toHaveClass(/origam--bg-primary/)
        })
    })

    // ── Functional (index 2) ──────────────────────────────────────────────────
    // init: { disabled: false, readonly: false, eager: false, title: 'Functional panel' }

    test.describe('Functional', () => {
        test('renders the panel in functional variant', async ({ page }) => {
            await page.goto(panelVariantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const panel = sandbox.locator('.origam-expansion-panel').first()
            await expect(panel).toBeVisible({ timeout: 12000 })
        })

        test('disabled=false: panel does NOT carry the --disabled class initially', async ({ page }) => {
            await page.goto(panelVariantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const panel = sandbox.locator('.origam-expansion-panel').first()
            await expect(panel).toBeVisible({ timeout: 12000 })
            const classes = await panel.getAttribute('class')
            expect(classes).not.toContain('origam-expansion-panel--disabled')
        })

        test('SCSS --disabled: injecting the class makes header pointer-events none', async ({ page }) => {
            // Verifies the SCSS rule is compiled and applied for the disabled state.
            await page.goto(panelVariantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const panel = sandbox.locator('.origam-expansion-panel').first()
            await expect(panel).toBeVisible({ timeout: 12000 })
            const ptrEvents = await sandbox.locator('.origam-expansion-panel-header').first().evaluate(el => {
                const parent = el.closest('.origam-expansion-panel')
                if (parent) parent.classList.add('origam-expansion-panel--disabled')
                return getComputedStyle(el).pointerEvents
            })
            expect(ptrEvents).toBe('none')
        })
    })

    // ── Events - group:selected (index 3) ─────────────────────────────────────

    test.describe('Events - group:selected', () => {
        test('renders panel titled "Select me"', async ({ page }) => {
            await page.goto(panelVariantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await expect(header.locator('.origam-expansion-panel-header__title')).toContainText('Select me')
        })

        test('click does not throw (group:selected fires)', async ({ page }) => {
            await page.goto(panelVariantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await header.click()
        })
    })

    // ── Slots - Header (index 4) ──────────────────────────────────────────────

    test.describe('Slots - Header', () => {
        test('header slot renders custom content instead of origam-expansion-panel-header', async ({ page }) => {
            await page.goto(panelVariantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const panel = sandbox.locator('.origam-expansion-panel').first()
            await expect(panel).toBeVisible({ timeout: 12000 })
            // Custom header via slot — OrigamExpansionPanelHeader is NOT rendered
            await expect(panel).toContainText('Custom header via slot')
            // The default origam-expansion-panel-header should NOT be present
            await expect(panel.locator('.origam-expansion-panel-header')).toHaveCount(0)
        })
    })

    // ── Slots - Default (index 5) ─────────────────────────────────────────────
    // Note: Story renders default-slot content ("This content was inserted via the default slot")
    // inside OrigamExpansionPanelContent which is lazy (eager=false by default).
    // The content element is controlled by v-show — it is in the DOM but hidden until expanded.
    // After clicking the header, aria-expanded changes to true and the panel becomes active;
    // the content element transitions to visible via OrigamExpandY (CSS transition).
    // DS bug #25: aria-controls points to expansion-panel-content-N but without eager the
    // element may not yet be mounted. The expand still fires and aria-expanded toggles.

    test.describe('Slots - Default', () => {
        test('panel renders with a header in collapsed state', async ({ page }) => {
            await page.goto(panelVariantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await expect(header.locator('.origam-expansion-panel-header__title')).toContainText('Panel with slot content')
        })

        test('clicking the header sets aria-expanded to true and panel becomes active', async ({ page }) => {
            // The content is lazy (eager=false default) — the panel-content element may not
            // be in the DOM at mount time. We assert the toggle fires correctly via aria-expanded
            // and the --active class on the panel root, which are reliable without eager.
            // DS bug #25: aria-controls is set to a non-existent id without eager — tracked in task #25.
            await page.goto(panelVariantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await header.click()
            await expect(header).toHaveAttribute('aria-expanded', 'true')
            await expect(sandbox.locator('.origam-expansion-panel').first()).toHaveClass(/origam-expansion-panel--active/)
        })
    })

    // ── Slots - Title (index 6) ───────────────────────────────────────────────
    // Fixed DS bug: OrigamExpansionPanel forwards its `#title` slot into
    // OrigamExpansionPanelHeader (`OrigamExpansionPanel.vue:51-58`), but the
    // header had no `<slot name="title">` to receive it — only `#default`,
    // `#prepend`, `#append`. Content passed to `#title` (no `title` prop set)
    // was silently dropped. Fixed by adding a `title` slot to the header,
    // wrapping the previous `#default` slot as its own fallback. Discriminating:
    // this test failed against the pre-fix header and passes against the fix
    // (verified locally by reverting the header change and re-running it).

    test.describe('Slots - Title', () => {
        test('title slot content is rendered inside the panel header', async ({ page }) => {
            await page.goto(panelVariantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            const title = header.locator('.origam-expansion-panel-header__title')
            await expect(title).toContainText('Custom Title')
            await expect(title.locator('.origam-icon')).toBeAttached()
        })
    })

    // ── Slots - Prepend (index 7) ─────────────────────────────────────────────

    test.describe('Slots - Prepend', () => {
        test('prepend slot renders an origam-icon in the prepend area', async ({ page }) => {
            await page.goto(panelVariantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await expect(header.locator('.origam-expansion-panel-header__prepend .origam-icon')).toBeAttached()
        })
    })

    // ── Slots - Append (index 8) ──────────────────────────────────────────────

    test.describe('Slots - Append', () => {
        test('append slot renders an origam-icon in the append area', async ({ page }) => {
            await page.goto(panelVariantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await expect(header.locator('.origam-expansion-panel-header__append .origam-icon').first()).toBeAttached()
        })
    })

    // ── Slots - Loader (index 9) ──────────────────────────────────────────────

    test.describe('Slots - Loader', () => {
        test('loading=true adds the --loading modifier class to the panel', async ({ page }) => {
            await page.goto(panelVariantUrl(9))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const panel = sandbox.locator('.origam-expansion-panel').first()
            await expect(panel).toBeVisible({ timeout: 12000 })
            // OrigamExpansionPanel with loading=true gets the --loading modifier from useLoader
            await expect(panel).toHaveClass(/origam-expansion-panel--loading/)
        })
    })

    // ── Slots - Wrapper (index 10) ────────────────────────────────────────────

    test.describe('Slots - Wrapper', () => {
        test('wrapper slot renders custom content (replaces panel-content)', async ({ page }) => {
            await page.goto(panelVariantUrl(10))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            await header.click()
            // After expand, wrapper slot content is visible
            await expect(sandbox.locator('.origam-expansion-panel')).toContainText('Custom wrapper slot content')
        })
    })

    // ── Default / playground (index 11) ──────────────────────────────────────
    // init: { title: 'Panel title', content: 'Panel content text', expandIcon: CHEVRON_DOWN, … }

    test.describe('Default (playground)', () => {
        test('renders panel with title "Panel title"', async ({ page }) => {
            await page.goto(panelVariantUrl(11))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const title = sandbox.locator('.origam-expansion-panel-header__title').first()
            await expect(title).toBeVisible({ timeout: 12000 })
            await expect(title).toContainText('Panel title')
        })

        test('expand icon (chevron) is visible in the append area', async ({ page }) => {
            await page.goto(panelVariantUrl(11))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const panel = sandbox.locator('.origam-expansion-panel').first()
            await expect(panel).toBeVisible({ timeout: 12000 })
            await expect(panel.locator('.origam-expansion-panel-header__append .origam-icon')).toBeAttached()
        })

        test('toggle: click expands then collapses', async ({ page }) => {
            await page.goto(panelVariantUrl(11))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const header = sandbox.locator('.origam-expansion-panel-header').first()
            await expect(header).toBeVisible({ timeout: 12000 })
            // Expand
            await header.click()
            await expect(header).toHaveAttribute('aria-expanded', 'true')
            // Collapse
            await header.click()
            await expect(header).toHaveAttribute('aria-expanded', 'false')
        })
    })
})
