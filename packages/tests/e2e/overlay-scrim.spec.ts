import { expect, test } from '@playwright/test'
import { selectHstOption, toggleHstCheckbox } from './_support/histoire-controls'

/**
 * OrigamOverlayScrim — e2e spec (recipe btn.spec.ts / avatar.spec.ts pattern)
 *
 * No dedicated spec existed for this component's own story before this file
 * (classeur: C1 rendu distinct / C5 emits assertés / C7 story+doc, gravité
 * majeur) — only indirect coverage via picker-overlay.spec.ts. Written
 * together with the `scrim=false` fix (see OrigamOverlayScrim.vue): the doc
 * promised "the backdrop renders transparent and consumes no clicks via the
 * pointer-events token", which was never implemented — `scrim=false` was
 * visually and functionally identical to `scrim=true` (a real C1 defect,
 * NOT the false positive the classeur flagged for the emit handlers
 * themselves — click/mouseenter/mouseleave were already correctly wired).
 *
 * ## Navigation
 *   Story controls (Design's `scrim` select) require the OUTER page +
 *   sidebar-link navigation, not direct `variantId` — `selectHstOption`
 *   drives the real Histoire control panel.
 *
 * ## Variant index map (OrigamOverlayScrim.story.vue, 0-based)
 *   0 → Design
 *   1 → Functional
 *   2 → Events - click
 *   3 → Events - mouseenter
 *   4 → Events - mouseleave
 *   5 → Default (playground)
 *
 * ⚠️ JAMAIS waitForLoadState('networkidle').
 */

const STORY_ID   = 'components-stories-overlay-origamoverlayscrim-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID
const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

const VIS = { timeout: 20000 }

test.describe('OrigamOverlayScrim', () => {
    test.setTimeout(60000)

    test('Design — renders a fixed backdrop with the default overlay background', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const scrim = sandbox.locator('.origam-scrim').first()
        await expect(scrim).toBeVisible(VIS)

        const style = await scrim.evaluate((el) => {
            const cs = getComputedStyle(el)
            return { position: cs.position, pointerEvents: cs.pointerEvents }
        })
        expect(style.position).toBe('fixed')
        expect(style.pointerEvents).toBe('auto')
        await expect(scrim).not.toHaveClass(/origam-scrim--transparent/)
    })

    /**
     * The fix under test: `scrim=false` must render a transparent,
     * click-through backdrop (doc-promised, previously dead — see the
     * long comment in OrigamOverlayScrim.vue's `isTransparent`).
     */
    test('Design — scrim=false is transparent AND click-through (C1 fix)', async ({ page }) => {
        await page.goto(STORY_PATH, { waitUntil: 'domcontentloaded' })
        await page.getByRole('link', { name: 'Design', exact: true }).click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const scrim = sandbox.locator('.origam-scrim').first()
        await expect(scrim).toBeVisible(VIS)

        // Resting state (scrim=true, default init-state): the scrim itself
        // is the hit-test target at its own top-left corner.
        const hitsBefore = await scrim.evaluate((el) => {
            const rect = el.getBoundingClientRect()
            return document.elementFromPoint(rect.left + 10, rect.top + 10) === el
        })
        expect(hitsBefore).toBe(true)

        await selectHstOption(page, 'Scrim', 'false (no scrim)')
        await expect(scrim).toHaveClass(/origam-scrim--transparent/)

        const after = await scrim.evaluate((el) => {
            const rect = el.getBoundingClientRect()
            const cs = getComputedStyle(el)
            return {
                bg: cs.backgroundColor,
                pointerEvents: cs.pointerEvents,
                hitsScrim: document.elementFromPoint(rect.left + 10, rect.top + 10) === el
            }
        })
        expect(after.bg).toBe('rgba(0, 0, 0, 0)')
        expect(after.pointerEvents).toBe('none')
        // Click-through, verified for real: the element under the pointer
        // is no longer the scrim once pointer-events:none applies.
        expect(after.hitsScrim).toBe(false)
    })

    test('Functional — clicking the scrim closes it (active toggles back to false)', async ({ page }) => {
        await page.goto(STORY_PATH, { waitUntil: 'domcontentloaded' })
        await page.getByRole('link', { name: 'Functional', exact: true }).click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await toggleHstCheckbox(page, 'Active')
        await page.waitForTimeout(300)

        const scrim = sandbox.locator('.origam-scrim').first()
        await expect(scrim).toBeVisible(VIS)

        const stateSpan = sandbox.locator('span', { hasText: 'active=' })
        await expect(stateSpan).toContainText('active=true')

        await scrim.click({ force: true })

        await expect(stateSpan).toContainText('active=false')
        await expect(sandbox.locator('.origam-scrim')).toHaveCount(0)
    })

    // logEvent() is Histoire-internal, not assertable from the outer page
    // (same convention as avatar.spec.ts / alert.spec.ts) — real handlers
    // are proven above via the click → active=false round-trip.
    test('Events - mouseenter / mouseleave — hovering the scrim does not throw', async ({ page }) => {
        await page.goto(variantUrl(3), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        // `mouseenterActive` starts `false` — the scrim only mounts once
        // the "Show scrim" button is clicked.
        await sandbox.locator('button', { hasText: 'Show scrim' }).click()

        const scrim = sandbox.locator('.origam-scrim').first()
        await expect(scrim).toBeVisible(VIS)

        await scrim.hover({ force: true })
        await page.mouse.move(0, 0)
    })

    test('Default (playground) — toggling active shows/hides the scrim, transparent class absent by default', async ({ page }) => {
        await page.goto(variantUrl(5), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-scrim')).toHaveCount(0)

        const toggleBtn = sandbox.locator('button', { hasText: 'Toggle scrim' })
        await toggleBtn.click()

        const scrim = sandbox.locator('.origam-scrim').first()
        await expect(scrim).toBeVisible(VIS)
        await expect(scrim).not.toHaveClass(/origam-scrim--transparent/)
    })
})
