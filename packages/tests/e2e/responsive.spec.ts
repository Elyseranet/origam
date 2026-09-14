import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamResponsive — runtime probes.
 *
 * Classeur "divers" (2026-09-01) flagged this component with NO dedicated
 * e2e spec at all — "bug trouvé par lecture du SCSS, pas par un test". This
 * file closes that hole AND pins the defect found while reading the SCSS
 * (see the last describe block below).
 *
 * Variants are reached via their dedicated titles — never via the HstSelect
 * picker dropdown (custom DOM, brittle).
 */

const STORY = '/stories/story/components-stories-responsive-origamresponsive-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, title: string): Promise<void> => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(400)
}

test.describe('OrigamResponsive — Design (mount + aspect ratio)', () => {
    test('mounts the root + content wrapper, and no sizer child remains', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)

        const root = sandbox.locator('.origam-responsive').first()
        await expect(root).toBeVisible({ timeout: 8000 })
        await expect(root.locator('.origam-responsive__content')).toContainText('preview')

        // #709 — the `__sizer` child is GONE. The ratio is held by the native
        // `aspect-ratio` property on the root itself, so there is no second
        // element whose height has to be cancelled by a pull-back margin.
        await expect(root.locator('.origam-responsive__sizer')).toHaveCount(0)
    })

    test('aspectRatio 16/9 drives the ROOT height, not a sizer child', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)

        const root = sandbox.locator('.origam-responsive').first()
        await expect(root).toBeVisible({ timeout: 8000 })

        // #709 — this test used to measure the sizer's resolved
        // `padding-bottom` and it PASSED on broken code: the sizer computed
        // the right number all along, it just never reached the root box,
        // because `__content`'s opposite `margin-block-start` cancelled it in
        // this column flex container. Measuring the sizer proved the
        // arithmetic and missed the defect entirely. Measure the box the user
        // actually sees.
        const measured = await root.evaluate((el) => {
            const r = el.getBoundingClientRect()

            return { width: r.width, height: r.height, ratio: getComputedStyle(el).aspectRatio }
        })

        expect(measured.ratio).not.toBe('auto')

        const expectedHeight = measured.width * (9 / 16)

        expect(measured.height).toBeGreaterThan(expectedHeight - 1)
        expect(measured.height).toBeLessThan(expectedHeight + 1)
    })
})

/**
 * The `OrigamResponsive — Functional (inline mode)` block lived here until
 * #703. It asserted that `inline=true` painted `display: inline-flex` — and
 * it PASSED, because `inline-flex` is exactly what the prop produced. What
 * it never measured is the consequence: `inline-flex` resolves the root's
 * width shrink-to-fit, and the ratio is held by a `__sizer` whose height is
 * a `padding-block-end` in PERCENT of that width. Width 0 -> height 0, on
 * all three consumers. The prop was removed; the lock now lives in
 * `packages/tests/TU/components/Responsive/responsive-inline-removed-703.spec.ts`.
 */

test.describe('OrigamResponsive — Slots', () => {
    test('#default renders the passed content', async ({ page }) => {
        await openVariant(page, 'Slots - Default')
        const sandbox = sandboxOf(page)

        await expect(sandbox.getByText('Default slot content')).toBeVisible({ timeout: 8000 })
    })

    test('#additional renders outside #default', async ({ page }) => {
        await openVariant(page, 'Slots - Additional')
        const sandbox = sandboxOf(page)

        await expect(sandbox.getByText('main media')).toBeVisible({ timeout: 8000 })
        await expect(sandbox.getByText('LIVE')).toBeVisible()
    })
})

/**
 * SPEC — tokens `inherit` = guaranteed-invalid, même défaut que #429
 *
 * ## Le défaut (trouvé en lisant la feuille de tokens, pas par un test)
 *
 * `light.css` / `dark.css` déclaraient `--origam-responsive---{flex,height,
 * max-height,min-height,min-width,width}`, `--origam-responsive__content---margin` et
 * `--origam-responsive__sizer---{flex,padding-block-end,transition}` à la
 * valeur `inherit`. Pour une CUSTOM PROPERTY (pas la propriété CSS finale),
 * `inherit` signifie « hérite CETTE MÊME custom property de mon parent » —
 * et comme aucun ancêtre ne la déclare, la valeur est *guaranteed-invalid*
 * (même mécanisme, déjà mesuré et documenté dans ce dépôt sur
 * `OrigamMediaController` #429 : `--…__time---color: inherit` →
 * `getPropertyValue` rend `""`).
 *
 * Conséquence : `height: var(--origam-responsive---height)` était TOUJOURS
 * invalide au calcul, donc TOUJOURS retombé sur la valeur initiale de
 * `height` (`auto`) — pas sur « la hauteur du parent » comme le nom
 * `inherit` le laissait croire. Le rendu par défaut n'a jamais été faux
 * (retomber sur `auto` est un défaut raisonnable), mais le canal de thème
 * était mort : rien à surcharger, `IOrigamTheme.vars` compris.
 *
 * ## Le correctif
 *
 * Chaque token reçoit la valeur LITTÉRALE réelle qu'il produisait déjà —
 * l'initiale CSS de la propriété qui le consomme (`auto`, `none`,
 * `0 1 auto`, `0`) — donc zéro pixel ne bouge, mesuré ci-dessous.
 *
 * ## Mise à jour #709
 *
 * Les quatre tokens `--origam-responsive__sizer---*` cités plus haut
 * n'existent plus : la migration vers `aspect-ratio` a supprimé l'élément
 * `__sizer` lui-même, donc les tokens qui le stylaient. Les tokens RACINE
 * testés ci-dessous sont inchangés — c'est bien eux que ce bloc couvre.
 */
test.describe('OrigamResponsive — tokens déclarés, pas `inherit` (dead custom property)', () => {
    test('les tokens dimensionnels sont déclarés à une valeur réelle, pas guaranteed-invalid', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)

        const root = sandbox.locator('.origam-responsive').first()
        await expect(root).toBeVisible({ timeout: 8000 })

        const declared = await root.evaluate((el) => {
            const cs = getComputedStyle(el)
            const names = [
                '--origam-responsive---flex',
                '--origam-responsive---height',
                '--origam-responsive---max-height',
                '--origam-responsive---min-height',
                '--origam-responsive---min-width',
                '--origam-responsive---width'
            ]
            return Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(n).trim()]))
        })

        for (const [name, value] of Object.entries(declared)) {
            expect(value, `${name} doit être déclaré (une "inherit" guaranteed-invalid rend ""）`).not.toBe('')
        }

        expect(declared['--origam-responsive---flex']).toBe('0 1 auto')
        expect(declared['--origam-responsive---height']).toBe('auto')
        expect(declared['--origam-responsive---max-height']).toBe('none')
        expect(declared['--origam-responsive---min-height']).toBe('auto')
        expect(declared['--origam-responsive---min-width']).toBe('auto')
        expect(declared['--origam-responsive---width']).toBe('auto')
    })

    test('le rendu par défaut ne bouge pas — mêmes valeurs calculées qu\'avant le correctif', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)

        const root = sandbox.locator('.origam-responsive').first()
        await expect(root).toBeVisible({ timeout: 8000 })

        const painted = await root.evaluate((el) => {
            const cs = getComputedStyle(el)
            return {
                flexGrow: cs.flexGrow,
                flexShrink: cs.flexShrink,
                flexBasis: cs.flexBasis,
                maxHeight: cs.maxHeight,
                minHeight: cs.minHeight,
                minWidth: cs.minWidth
            }
        })

        // Valeurs mesurées AVANT le correctif (guaranteed-invalid → valeurs
        // initiales de chaque propriété) — identiques après, seul le canal
        // de thème a changé.
        expect(painted.flexGrow).toBe('0')
        expect(painted.flexShrink).toBe('1')
        expect(painted.flexBasis).toBe('auto')
        expect(painted.maxHeight).toBe('none')
        expect(painted.minHeight).toBe('0px')
        expect(painted.minWidth).toBe('0px')
    })

    test('le canal de thème est désormais vivant : surcharger le token change bien la hauteur rendue', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)

        const root = sandbox.locator('.origam-responsive').first()
        await expect(root).toBeVisible({ timeout: 8000 })

        const heightBefore = await root.evaluate((el) => getComputedStyle(el).height)

        await root.evaluate((el) => {
            el.style.setProperty('--origam-responsive---height', '77px')
        })

        const heightAfter = await root.evaluate((el) => getComputedStyle(el).height)

        expect(heightAfter).toBe('77px')
        expect(heightAfter).not.toBe(heightBefore)
    })
})
