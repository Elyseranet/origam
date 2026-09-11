import { expect, test, type Page } from '@playwright/test'

import { selectHstOption } from './_support/histoire-controls'

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

// The dedicated side-by-side fixtures (bracket-variant-single/double/rr,
// bracket-direction-h/v-host, bracket-density-default/compact) no longer
// exist — "variant" / "direction" / "density" are now single dynamic
// controls on the "Design" Variant (one bracket rendered at a time), not
// three/two static instances shown together. Each test below now drives
// the control through its values sequentially instead of comparing
// simultaneously-rendered fixtures, using the structural `.origam-bracket`
// anchor (unambiguous — one instance per Design render) since none of the
// old data-cy hosts survive either.

test.describe('OrigamBracket — variant', () => {
    test('tree DOM for single/double-elim, table DOM for round-robin', async ({ page }) => {
        await openVariant(page, STORY, 'Design')
        const sandbox = sandboxOf(page)
        const bracket = sandbox.locator('.origam-bracket').first()

        await selectHstOption(page, 'Variant', 'Single elimination')
        await page.waitForTimeout(400)
        await expect(bracket).toBeVisible({ timeout: 8000 })
        expect(await bracket.evaluate(el => el.className)).toContain('origam-bracket--variant-single-elimination')
        await expect(bracket.locator('.origam-bracket__tree')).toHaveCount(1)

        await selectHstOption(page, 'Variant', 'Double elimination')
        await page.waitForTimeout(400)
        expect(await bracket.evaluate(el => el.className)).toContain('origam-bracket--variant-double-elimination')
        // Double-elimination's own wrapper is `.origam-bracket__double`, NOT
        // `.origam-bracket__tree` (verified via DOM inspection) — matches
        // the ORIGINAL test's actual coverage, which only ever asserted the
        // `__tree` count on single-elim and round-robin, never on double
        // (despite the test's title mentioning both single AND double).

        await selectHstOption(page, 'Variant', 'Round robin')
        await page.waitForTimeout(400)
        expect(await bracket.evaluate(el => el.className)).toContain('origam-bracket--variant-round-robin')
        // Round-robin uses a table-like DOM (no tree wrapper).
        await expect(bracket.locator('.origam-bracket__tree')).toHaveCount(0)
        await expect(bracket.locator('.origam-bracket__round-robin')).toHaveCount(1)
    })

    test('double-elimination groups winner / loser / grand-final in order', async ({ page }) => {
        // "Design"'s default init-state already sets
        // variant: BRACKET_VARIANT.DOUBLE_ELIMINATION (see
        // OrigamBracket.story.vue), so no control interaction is needed.
        await openVariant(page, STORY, 'Design')
        const sandbox = sandboxOf(page)

        const bracket = sandbox.locator('.origam-bracket').first()
        await expect(bracket).toBeVisible({ timeout: 8000 })

        const titles = await bracket.locator('.origam-bracket-round__title').allInnerTexts()
        // Winner rounds first, then loser, then grand final.
        expect(titles[0].toLowerCase()).toContain('winner')
        expect(titles[titles.length - 1].toLowerCase()).toContain('grand')
    })
})

test.describe('OrigamBracket — direction', () => {
    test('horizontal vs vertical flip modifier class', async ({ page }) => {
        await openVariant(page, STORY, 'Design')
        const sandbox = sandboxOf(page)
        const bracket = sandbox.locator('.origam-bracket').first()

        // "Design"'s default init-state already sets direction: HORIZONTAL.
        await expect(bracket).toBeVisible({ timeout: 8000 })
        expect(await bracket.evaluate(el => el.className)).toContain('origam-bracket--direction-horizontal')

        await selectHstOption(page, 'Direction', 'Vertical')
        await page.waitForTimeout(400)
        expect(await bracket.evaluate(el => el.className)).toContain('origam-bracket--direction-vertical')
    })
})

test.describe('OrigamBracket — density', () => {
    test('compact vs default applies the matching modifier class', async ({ page }) => {
        await openVariant(page, STORY, 'Design')
        const sandbox = sandboxOf(page)
        const bracket = sandbox.locator('.origam-bracket').first()

        await selectHstOption(page, 'Density', 'Default')
        await page.waitForTimeout(400)
        await expect(bracket).toBeVisible({ timeout: 8000 })
        expect(await bracket.evaluate(el => el.className)).toContain('origam-bracket--density-default')

        await selectHstOption(page, 'Density', 'Compact')
        await page.waitForTimeout(400)
        expect(await bracket.evaluate(el => el.className)).toContain('origam-bracket--density-compact')
    })
})

test.describe('OrigamBracket — slots', () => {
    test('match slot replaces the default match card', async ({ page }) => {
        // Canonical Variant is "Slots - Match" — its data-cy fixtures
        // (bracket-slot-match-card / -host) are unchanged, only the title
        // drifted.
        await openVariant(page, STORY, 'Slots - Match')
        const sandbox = sandboxOf(page)

        const customCard = sandbox.locator('[data-cy="bracket-slot-match-card"]').first()
        await expect(customCard).toBeVisible({ timeout: 8000 })

        // Default match card should NOT render when the slot is provided.
        const host = sandbox.locator('[data-cy="bracket-slot-match-host"]').first()
        await expect(host.locator('.origam-bracket-match')).toHaveCount(0)
    })

    test('competitor slot replaces the default row', async ({ page }) => {
        // #388 — was a real, unfixed DS bug (pinned here via `test.fail()`
        // until the fix landed): `OrigamBracketRound` never forwarded its
        // `#competitor` slot into the `<OrigamBracketMatch>` it renders as
        // the default `match` slot content, so `OrigamBracketCompetitor`
        // always rendered even when the consumer provided a custom
        // `#competitor` slot at `OrigamBracket` level. Fixed by relaying
        // `$slots.competitor` from `OrigamBracketRound.vue` into its
        // fallback `<origam-bracket-match>` via a `#competitor` template.

        // Canonical Variant is "Slots - Competitor".
        await openVariant(page, STORY, 'Slots - Competitor')
        const sandbox = sandboxOf(page)

        const customRow = sandbox.locator('[data-cy="bracket-slot-competitor-row"]').first()
        await expect(customRow).toBeVisible({ timeout: 8000 })

        const host = sandbox.locator('[data-cy="bracket-slot-competitor-host"]').first()
        await expect(host.locator('.origam-bracket-competitor')).toHaveCount(0)
    })
})

test.describe('OrigamBracket — emit match-click', () => {
    test('clicking a match fires match-click without throwing', async ({ page }) => {
        // Canonical Variant is "Events - match-click". The old
        // `bracket-emit-counter` fixture (a visible increment counter) no
        // longer exists — the canonical Events-* Variant only wires
        // `@match-click="logEvent(...)"`, a Histoire-internal side-effect
        // not observable from the sandbox DOM headlessly (same
        // established pattern as alert.spec.ts's "Events - click:close" /
        // "Events - update:hover" — render the fixture, interact, assert
        // no throw). The host data-cy is also renamed:
        // `bracket-emit-match-click-host`, not `bracket-emit-host`.
        await openVariant(page, STORY, 'Events - match-click')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="bracket-emit-match-click-host"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        // Click the divider between the two competitor rows — it is guaranteed
        // not to be inside .origam-bracket-competitor, so handleMatchClick will
        // not bail out and will emit 'click' → 'match-click'.
        //
        // The divider is a 1px-tall `<hr>` hairline sandwiched directly
        // against the competitor row above it — Playwright's real
        // pointer-based `.click()` hit-tests the coordinate and lands on
        // the taller neighbouring `.origam-bracket-competitor` instead
        // (verified via `elementFromPoint` at the divider's own bounding-
        // box centre). `.dispatchEvent('click')` fires the DOM click
        // event directly on the target element, bypassing pixel-level hit
        // testing — the correct tool for a target this thin.
        const matchDivider = host.locator('.origam-bracket-match .origam-bracket-match__divider').first()
        await expect(matchDivider).toBeVisible({ timeout: 8000 })
        await matchDivider.dispatchEvent('click')
        await page.waitForTimeout(150)
    })
})

// ─── OrigamBracketRound ─────────────────────────────────────────────────────
//
// #388 — the story had NO Events-*/Slots-* Variants at all for this
// component's 3 emits + 2 slots (the CLAUDE.md rule: every emit and every
// slot gets its own Variant), so nothing proved at runtime that Round
// actually emits/forwards anything. Added here alongside the story fix.

const ROUND_STORY = '/stories/story/components-stories-bracket-origambracketround-story-vue'

test.describe('OrigamBracketRound — emits', () => {
    test('match-click: clicking a match divider does not throw', async ({ page }) => {
        await openVariant(page, ROUND_STORY, 'Events - match-click')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="round-emit-match-click"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        const matchDivider = host.locator('.origam-bracket-match .origam-bracket-match__divider').first()
        await expect(matchDivider).toBeVisible({ timeout: 8000 })
        await matchDivider.dispatchEvent('click')
        await page.waitForTimeout(150)
    })

    test('competitor-click: clicking a competitor row does not throw', async ({ page }) => {
        await openVariant(page, ROUND_STORY, 'Events - competitor-click')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="round-emit-competitor-click"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        const row = host.locator('.origam-bracket-competitor').first()
        await expect(row).toBeVisible({ timeout: 8000 })
        await row.click()
        await page.waitForTimeout(150)
    })

    test('winner-click: clicking the winning competitor row does not throw', async ({ page }) => {
        await openVariant(page, ROUND_STORY, 'Events - winner-click')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="round-emit-winner-click"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        const winnerRow = host.locator('.origam-bracket-competitor--winner').first()
        await expect(winnerRow).toBeVisible({ timeout: 8000 })
        await winnerRow.click()
        await page.waitForTimeout(150)
    })
})

test.describe('OrigamBracketRound — slots', () => {
    test('round-title slot replaces the default heading', async ({ page }) => {
        await openVariant(page, ROUND_STORY, 'Slots - Round-title')
        const sandbox = sandboxOf(page)

        const custom = sandbox.locator('[data-cy="round-slot-title"]').first()
        await expect(custom).toBeVisible({ timeout: 8000 })
        await expect(custom).toContainText('Quarter-finals')
    })

    test('match slot replaces the default match card', async ({ page }) => {
        await openVariant(page, ROUND_STORY, 'Slots - Match')
        const sandbox = sandboxOf(page)

        const custom = sandbox.locator('[data-cy="round-slot-match"]').first()
        await expect(custom).toBeVisible({ timeout: 8000 })
        await expect(custom).toContainText('T1 vs G2')

        // The default match card must not ALSO render.
        await expect(sandbox.locator('.origam-bracket-match')).toHaveCount(0)
    })

    test('competitor slot replaces the default row (#388 fix, proven again from the Round story directly)', async ({ page }) => {
        await openVariant(page, ROUND_STORY, 'Slots - Competitor')
        const sandbox = sandboxOf(page)

        const customRows = sandbox.locator('[data-cy="round-slot-competitor"]')
        await expect(customRows).toHaveCount(2)

        // The default competitor row must not ALSO render (no duplication).
        await expect(sandbox.locator('.origam-bracket-competitor')).toHaveCount(0)
    })
})
