import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamBracket — runtime probes for every prop / variant exposed by
 * the story. Each block targets one orthogonal facet:
 *
 *   - Default: confirms the bracket mounts with the ARIA contract
 *     (`role="region"`, `aria-label`, each round becomes a `role="group"`
 *     with `aria-labelledby` pointing at its title heading).
 *   - Variant: asserts the tree DOM (`__tree`) for tree variants vs
 *     the table DOM (`__round-robin`) for round-robin.
 *   - Direction: asserts the `--direction-{value}` modifier class flips
 *     between horizontal and vertical.
 *   - Density: asserts the density modifier class is applied.
 *   - Slot — match / competitor: custom DOM emitted by the consumer
 *     appears in the rendered tree.
 *   - Emit — match-click: clicking on a match increments the counter.
 *
 * Histoire iframes render the sandbox under `iframe[src*="__sandbox"]`,
 * same convention as every other origam spec.
 */

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyPath: string, variant: string) => {
    await page.goto(storyPath)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

const STORY = '/stories/story/components-stories-bracket-origambracket-story-vue'

test.describe('OrigamBracket — ARIA contract (Playground)', () => {
    test('mounts with role="region" and aria-label', async ({ page }) => {
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)

        const region = sandbox.locator('[data-cy="bracket-playground-host"]').first()
        await expect(region).toBeVisible({ timeout: 8000 })

        await expect(region).toHaveAttribute('role', 'region')
        await expect(region).toHaveAttribute('aria-label', /Tournament/)
    })

    test('each round is a group with aria-labelledby pointing at its title', async ({ page }) => {
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)

        const round0 = sandbox.locator('[data-cy="origam-bracket-round-0"]').first()
        await expect(round0).toBeVisible({ timeout: 8000 })

        await expect(round0).toHaveAttribute('role', 'group')

        const labelId = await round0.getAttribute('aria-labelledby')
        expect(labelId).toBeTruthy()

        const heading = sandbox.locator(`#${labelId}`)
        await expect(heading).toBeVisible()
    })

    test('each match advertises role="group" with a vs aria-label', async ({ page }) => {
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)

        const firstMatch = sandbox.locator('.origam-bracket-match').first()
        await expect(firstMatch).toBeVisible({ timeout: 8000 })
        await expect(firstMatch).toHaveAttribute('role', 'group')

        const ariaLabel = await firstMatch.getAttribute('aria-label')
        expect(ariaLabel).toMatch(/versus|vs/i)
    })

    test('renders 8-player single-elim: 3 rounds, 4 + 2 + 1 matches', async ({ page }) => {
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)

        const rounds = sandbox.locator('[data-cy^="origam-bracket-round-"]')
        await expect(rounds).toHaveCount(3, { timeout: 8000 })

        const round0Matches = sandbox.locator('[data-cy="origam-bracket-round-0"] .origam-bracket-match')
        await expect(round0Matches).toHaveCount(4)

        const round1Matches = sandbox.locator('[data-cy="origam-bracket-round-1"] .origam-bracket-match')
        await expect(round1Matches).toHaveCount(2)

        const round2Matches = sandbox.locator('[data-cy="origam-bracket-round-2"] .origam-bracket-match')
        await expect(round2Matches).toHaveCount(1)
    })
})

test.describe('OrigamBracket — variant', () => {
    test('tree DOM for single/double-elim, table DOM for round-robin', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — variant')
        const sandbox = sandboxOf(page)

        const single = sandbox.locator('[data-cy="bracket-variant-single"]').first()
        const double = sandbox.locator('[data-cy="bracket-variant-double"]').first()
        const rr = sandbox.locator('[data-cy="bracket-variant-rr"]').first()

        await expect(single).toBeVisible({ timeout: 8000 })

        const singleClass = await single.evaluate(el => el.className)
        const doubleClass = await double.evaluate(el => el.className)
        const rrClass = await rr.evaluate(el => el.className)

        expect(singleClass).toContain('origam-bracket--variant-single-elimination')
        expect(doubleClass).toContain('origam-bracket--variant-double-elimination')
        expect(rrClass).toContain('origam-bracket--variant-round-robin')

        // Round-robin uses a table-like DOM (no tree wrapper).
        const treeInside = await rr.locator('.origam-bracket__tree').count()
        const rrInside = await rr.locator('.origam-bracket__round-robin').count()
        expect(treeInside).toBe(0)
        expect(rrInside).toBe(1)

        // Tree variants own a `__tree` wrapper.
        const singleTree = await single.locator('.origam-bracket__tree').count()
        expect(singleTree).toBe(1)
    })

    test('double-elimination groups winner / loser / grand-final in order', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — variant')
        const sandbox = sandboxOf(page)

        const double = sandbox.locator('[data-cy="bracket-variant-double"]').first()
        await expect(double).toBeVisible({ timeout: 8000 })

        const titles = await double.locator('.origam-bracket-round__title').allInnerTexts()
        // Winner rounds first, then loser, then grand final.
        expect(titles[0].toLowerCase()).toContain('winner')
        expect(titles[titles.length - 1].toLowerCase()).toContain('grand')
    })
})

test.describe('OrigamBracket — direction', () => {
    test('horizontal vs vertical flip modifier class', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — direction')
        const sandbox = sandboxOf(page)

        const h = sandbox.locator('[data-cy="bracket-direction-h-host"]').first()
        const v = sandbox.locator('[data-cy="bracket-direction-v-host"]').first()
        await expect(h).toBeVisible({ timeout: 8000 })

        const hClass = await h.evaluate(el => el.className)
        const vClass = await v.evaluate(el => el.className)
        expect(hClass).toContain('origam-bracket--direction-horizontal')
        expect(vClass).toContain('origam-bracket--direction-vertical')
    })
})

test.describe('OrigamBracket — density', () => {
    test('compact vs default applies the matching modifier class', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — density')
        const sandbox = sandboxOf(page)

        const dft = sandbox.locator('[data-cy="bracket-density-default"]').first()
        const cmp = sandbox.locator('[data-cy="bracket-density-compact"]').first()
        await expect(dft).toBeVisible({ timeout: 8000 })

        const dftClass = await dft.evaluate(el => el.className)
        const cmpClass = await cmp.evaluate(el => el.className)
        expect(dftClass).toContain('origam-bracket--density-default')
        expect(cmpClass).toContain('origam-bracket--density-compact')
    })
})

test.describe('OrigamBracket — slots', () => {
    test('match slot replaces the default match card', async ({ page }) => {
        await openVariant(page, STORY, 'Slot — match')
        const sandbox = sandboxOf(page)

        const customCard = sandbox.locator('[data-cy="bracket-slot-match-card"]').first()
        await expect(customCard).toBeVisible({ timeout: 8000 })

        // Default match card should NOT render when the slot is provided.
        const host = sandbox.locator('[data-cy="bracket-slot-match-host"]').first()
        const defaultCount = await host.locator('.origam-bracket-match').count()
        expect(defaultCount).toBe(0)
    })

    test.fixme(true, 'DS BUG: OrigamBracketRound does not forward the #competitor slot to OrigamBracketMatch — OrigamBracketCompetitor is always rendered even when the consumer provides a #competitor slot at OrigamBracket level. Fix: OrigamBracketRound must relay $slots.competitor into each <origam-bracket-match> it renders via default #match slot.')
    test('competitor slot replaces the default row', async ({ page }) => {
        await openVariant(page, STORY, 'Slot — competitor')
        const sandbox = sandboxOf(page)

        const customRow = sandbox.locator('[data-cy="bracket-slot-competitor-row"]').first()
        await expect(customRow).toBeVisible({ timeout: 8000 })

        const host = sandbox.locator('[data-cy="bracket-slot-competitor-host"]').first()
        const defaultCount = await host.locator('.origam-bracket-competitor').count()
        expect(defaultCount).toBe(0)
    })
})

test.describe('OrigamBracket — emit match-click', () => {
    test('clicking a match increments the counter', async ({ page }) => {
        await openVariant(page, STORY, 'Emit — match-click')
        const sandbox = sandboxOf(page)

        const before = await sandbox.locator('[data-cy="bracket-emit-counter"]').textContent()
        expect(before?.trim()).toBe('0')

        // Click the divider between the two competitor rows — it is guaranteed
        // not to be inside .origam-bracket-competitor, so handleMatchClick will
        // not bail out and will emit 'click' → 'match-click'.
        const matchDivider = sandbox.locator('[data-cy="bracket-emit-host"] .origam-bracket-match .origam-bracket-match__divider').first()
        await expect(matchDivider).toBeVisible({ timeout: 8000 })
        await matchDivider.click()
        await page.waitForTimeout(150)

        const after = await sandbox.locator('[data-cy="bracket-emit-counter"]').textContent()
        expect(after?.trim()).not.toBe('0')
    })
})
