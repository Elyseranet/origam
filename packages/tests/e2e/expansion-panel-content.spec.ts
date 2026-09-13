import { expect, test } from '@playwright/test'
import { selectHstOption } from './_support/histoire-controls'

/**
 * OrigamExpansionPanelContent — e2e spec.
 *
 * #C7 (lot mineur C2/C8/C7, 2026-09-13) — the component had a solid doc
 * (fixed from a 261-byte stub in commit ad0a1fb7) but was exercised only
 * INDIRECTLY through OrigamExpansionPanel/OrigamExpansionPanels specs;
 * `find packages/tests -iname '*expansion-panel-content*'` returned
 * nothing before this file. Root CLAUDE.md's "test-as-you-build" rule
 * requires a matching spec per story.
 *
 * Variant index map (OrigamExpansionPanelContent story):
 *   0  Design
 *   1  Functional
 *   2  Slots - Default
 *   3  Slots - Loader
 *   4  Default (playground)
 *
 * Methodological trap already documented in the classeur for this exact
 * component: the surrounding `OrigamExpandY` transition delays style
 * resolution — asserting on the content right after a header click can
 * observe a mid-transition value. Playwright's `toBeVisible` /
 * `toContainText` auto-retry (default 5s+ polling) already absorbs this,
 * same recipe as expansion-panel.spec.ts — no manual `waitForTimeout`
 * needed for VISIBILITY assertions. Where an assertion is NOT auto-
 * retrying (a one-shot `evaluate` read), an explicit wait is used instead.
 */

const STORY_ID = 'components-stories-expansionpanel-origamexpansionpanelcontent-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamExpansionPanelContent — Design (index 0)', () => {
    test.setTimeout(45000)

    test('content prop renders inside the panel once expanded', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const header = sandbox.locator('.origam-expansion-panel-header').first()
        await expect(header).toBeVisible({ timeout: 12000 })

        await header.click()
        const content = sandbox.locator('.origam-expansion-panel-content').first()
        await expect(content).toBeVisible({ timeout: 8000 })
        await expect(content).toContainText('Lorem ipsum body.')
    })

    test('content region carries role="region" and aria-labelledby pointing at the real header id', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const header = sandbox.locator('.origam-expansion-panel-header').first()
        await expect(header).toBeVisible({ timeout: 12000 })
        await header.click()

        const content = sandbox.locator('.origam-expansion-panel-content').first()
        await expect(content).toBeVisible({ timeout: 8000 })
        await expect(content).toHaveAttribute('role', 'region')

        const headerId = await header.getAttribute('id')
        const labelledBy = await content.getAttribute('aria-labelledby')
        expect(headerId).toBeTruthy()
        expect(labelledBy).toBe(headerId)
    })

    test('collapsed: the host region is present but CSS-hidden (v-show), and its body has never lazily mounted', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        // The region host itself mounts immediately (it is the `<component>`
        // gated by `v-show="isSelected"`, not `v-if`) — verified hidden via
        // computed style, not absent.
        const content = sandbox.locator('.origam-expansion-panel-content').first()
        await expect(content).toBeHidden()

        // The lazy BODY inside it (useLazy's `hasContent`) is the part that
        // has genuinely never mounted before the first expand.
        const wrapper = content.locator('.origam-expansion-panel-content__wrapper')
        await expect(wrapper).toBeEmpty()
    })
})

test.describe('OrigamExpansionPanelContent — Functional (index 1)', () => {
    test.setTimeout(45000)

    // `eager` (useLazy) only changes WHEN the body mounts into the DOM — it
    // stays `v-show`-gated by `isSelected` regardless (OrigamExpansionPanelContent.vue:5).
    // Without eager the region is entirely absent before the first expand
    // (proven by the Design-variant "collapsed content is lazily unmounted"
    // test above); WITH eager it is present but `display: none` until expanded.
    test('eager mounts the content into the DOM before any expand (still hidden until expanded)', async ({ page }) => {
        await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        // Toggle "Eager (no lazy mount)" — HstCheckbox in the right-hand panel.
        await page.getByRole('checkbox', { name: 'Eager (no lazy mount)' }).click()

        const content = sandbox.locator('.origam-expansion-panel-content').first()
        await expect(content).toHaveCount(1)
        await expect(content).toBeHidden()

        const header = sandbox.locator('.origam-expansion-panel-header').first()
        await header.click()

        await expect(content).toBeVisible({ timeout: 8000 })
        await expect(content).toContainText('Functional variant body.')
    })

    test('loading renders the progress indicator instead of the body, once expanded', async ({ page }) => {
        await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })

        await page.getByRole('checkbox', { name: 'Eager (no lazy mount)' }).click()
        await page.getByRole('checkbox', { name: 'Loading' }).click()

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const header = sandbox.locator('.origam-expansion-panel-header').first()
        await header.click()

        const content = sandbox.locator('.origam-expansion-panel-content').first()
        await expect(content).toBeVisible({ timeout: 8000 })
        await expect(content.locator('.origam-progress')).toBeVisible({ timeout: 8000 })
    })
})

test.describe('OrigamExpansionPanelContent — Slots', () => {
    test.setTimeout(45000)

    test('Slots - Default renders custom markup, not the content prop', async ({ page }) => {
        await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const header = sandbox.locator('.origam-expansion-panel-header').first()
        await expect(header).toBeVisible({ timeout: 12000 })
        await header.click()

        const content = sandbox.locator('.origam-expansion-panel-content').first()
        await expect(content).toBeVisible({ timeout: 8000 })
        await expect(content.locator('li')).toHaveCount(3)
        await expect(content.locator('li').first()).toHaveText('Item one')
    })

    test('Slots - Loader replaces the built-in renderer while loading', async ({ page }) => {
        await page.goto(variantUrl(3), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const header = sandbox.locator('.origam-expansion-panel-header').first()
        await expect(header).toBeVisible({ timeout: 12000 })
        await header.click()

        const content = sandbox.locator('.origam-expansion-panel-content').first()
        await expect(content).toBeVisible({ timeout: 8000 })
        await expect(content).toContainText('Loading...')
        // The built-in origam-progress renderer must NOT also be present —
        // the custom #loader slot replaces it entirely.
        await expect(content.locator('.origam-progress')).toHaveCount(0)
    })
})

test.describe('OrigamExpansionPanelContent — Default (playground, index 4)', () => {
    test.setTimeout(45000)

    test('color / rounded / border props are forwarded and produce a distinct class', async ({ page }) => {
        await page.goto(variantUrl(4), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const header = sandbox.locator('.origam-expansion-panel-header').first()
        await expect(header).toBeVisible({ timeout: 12000 })
        await header.click()

        const content = sandbox.locator('.origam-expansion-panel-content').first()
        await expect(content).toBeVisible({ timeout: 8000 })

        await selectHstOption(page, 'Rounded', 'large (radius.xl / 16px)')

        await expect(content).toHaveClass(/origam--rounded-xl|origam-expansion-panel-content--rounded/)
    })
})
