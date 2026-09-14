import { expect, test } from '@playwright/test'

/**
 * SPEC — le rôle ARIA de `<origam-list>` décrit ce que la liste EST (#424)
 *
 * ## Ce que ce spec épingle
 *
 * La racine posait `role="listbox"` inconditionnellement. Un listbox est un
 * widget de SÉLECTION : il promet des enfants `option` porteurs
 * d'`aria-selected`, et un lecteur d'écran l'annonce ainsi. Une liste de
 * navigation, une liste à subheaders et séparateurs, la liste d'items d'un
 * `<origam-menu>` ne sont rien de tout ça.
 *
 *   mode liste      → racine `role="list"`,    lignes `role="listitem"`
 *   mode sélection  → racine `role="listbox"`, lignes `role="option"`
 *
 * ⛔ On vérifie le rôle EXACT dans CHAQUE mode, jamais qu'il « a changé » —
 * un test qui constate une différence passerait au vert sur deux rôles tous
 * les deux faux.
 *
 * ## Pourquoi un spec navigateur en plus des TU
 *
 * Les TU (`TU/components/List/OrigamList.roles.spec.ts`) montent la liste
 * seule. Ils ne peuvent rien dire des DEUX consommateurs réels qui héritent
 * du changement :
 *
 *   • `<origam-select>` est un vrai combobox : `aria-haspopup="listbox"`,
 *     `aria-controls` pointant sur la racine de la liste et
 *     `aria-activedescendant` sur l'id d'une option. Si sa liste retombait en
 *     `role="list"`, les deux références désigneraient des rôles qui ne les
 *     acceptent pas — le contrat combobox serait rompu sans qu'aucun test
 *     unitaire ne bouge.
 *   • `<origam-menu>` ne demande aucune sélection : sa liste doit
 *     précisément CESSER de s'annoncer listbox.
 *
 * C'est la vérification que le coordinateur a demandé de traiter comme le
 * cœur du travail, et elle n'existe qu'ici.
 */

const SELECT_ID = 'components-stories-select-origamselect-story-vue'
const MENU_ID = 'components-stories-menu-origammenu-story-vue'
const LIST_ID = 'components-stories-list-origamlist-story-vue'

const url = (storyId: string, idx: number) =>
    `/stories/story/${storyId}?variantId=${storyId}-${idx}`

/** Design, la première Variant de chaque story. */
const DESIGN = 0

test.describe('OrigamSelect — le contrat combobox tient (mode sélection)', () => {
    test.setTimeout(45000)

    test('la liste du dropdown reste un listbox, ses lignes restent des options', async ({ page }) => {
        await page.goto(url(SELECT_ID, DESIGN), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        const field = sandbox.locator('.origam-field').first()
        await expect(field).toBeVisible({ timeout: 12000 })
        await field.click()

        const listbox = sandbox.locator('.origam-list').first()
        await expect(listbox).toBeVisible({ timeout: 12000 })

        /*
         * `<origam-select>` passe `:selected` ET un `:select-strategy`
         * explicite — les deux signaux du mode sélection. Le rôle attendu est
         * donc `listbox`, exactement comme avant le changement.
         */
        await expect(listbox).toHaveAttribute('role', 'listbox')

        const rows = sandbox.locator('.origam-list .origam-list-item')
        await expect(rows.first()).toBeVisible({ timeout: 12000 })

        const roles = await rows.evaluateAll((els) => els.map((e) => e.getAttribute('role')))
        expect(roles.length).toBeGreaterThan(0)
        expect(new Set(roles)).toEqual(new Set([ 'option' ]))

        /*
         * L'état requis par le rôle `option`, présent sur chaque ligne.
         */
        const selected = await rows.evaluateAll((els) => els.map((e) => e.getAttribute('aria-selected')))
        for (const value of selected) expect([ 'true', 'false' ]).toContain(value)
    })

    test('aria-controls du combobox designe bien un element portant role=listbox', async ({ page }) => {
        await page.goto(url(SELECT_ID, DESIGN), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        const field = sandbox.locator('.origam-field').first()
        await expect(field).toBeVisible({ timeout: 12000 })
        await field.click()

        await expect(sandbox.locator('.origam-list').first()).toBeVisible({ timeout: 12000 })

        /*
         * La chaîne complète, résolue dans le document réel : l'élément que
         * `aria-controls` désigne existe, et il porte `listbox`. C'est
         * précisément ce qu'une racine retombée en `role="list"` casserait,
         * en silence.
         */
        const resolved = await sandbox.locator('[aria-controls]').first().evaluate((el) => {
            const id = el.getAttribute('aria-controls')
            const target = id ? el.ownerDocument.getElementById(id) : null

            return {
                id,
                found: Boolean(target),
                role: target?.getAttribute('role') ?? null,
                optionCount: target ? target.querySelectorAll('[role="option"]').length : 0
            }
        })

        expect(resolved.found, `aria-controls="${resolved.id}" doit designer un element existant`).toBe(true)
        expect(resolved.role).toBe('listbox')
        expect(resolved.optionCount).toBeGreaterThan(0)
    })
})

test.describe('OrigamMenu — la liste d\'items cesse de se dire listbox (mode liste)', () => {
    test.setTimeout(45000)

    test('la liste du menu s\'annonce list, ses lignes listitem', async ({ page }) => {
        await page.goto(url(MENU_ID, DESIGN), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        const activator = sandbox.locator('.origam-btn').first()
        await expect(activator).toBeVisible({ timeout: 12000 })
        await activator.click()

        const content = sandbox.locator('.origam-menu__content').first()
        await expect(content).toBeVisible({ timeout: 12000 })

        const list = content.locator('.origam-list').first()
        await expect(list).toBeVisible({ timeout: 12000 })

        /*
         * `<origam-menu>` ne passe ni `selected` ni `selectStrategy` : ses
         * items sont des gestionnaires de clic, pas des valeurs de sélection.
         * Avant le correctif cette liste s'annonçait « list box, N items »
         * sans qu'aucune sélection n'existe.
         */
        await expect(list).toHaveAttribute('role', 'list')

        const rows = content.locator('.origam-list-item')
        await expect(rows.first()).toBeVisible({ timeout: 12000 })

        const measured = await rows.evaluateAll((els) => els.map((e) => ({
            role: e.getAttribute('role'),
            ariaSelected: e.getAttribute('aria-selected')
        })))

        expect(measured.length).toBeGreaterThan(0)
        for (const row of measured) {
            /*
             * `listitem` sur une ligne du menu ; `null` sur celle qui sert
             * d'activateur de groupe (elle n'est pas une ligne de la liste).
             * Aucune ne doit être `option`.
             */
            expect([ 'listitem', null ]).toContain(row.role)
            expect(row.ariaSelected, 'aucun aria-selected hors du mode selection').toBeNull()
        }
    })
})

test.describe('OrigamList — les deux modes sur la story de la liste elle-meme', () => {
    test.setTimeout(45000)

    test('la Variant Design, qui ne demande aucune selection, s\'annonce list', async ({ page }) => {
        await page.goto(url(LIST_ID, DESIGN), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        const list = sandbox.locator('.origam-list').first()
        await expect(list).toBeVisible({ timeout: 12000 })
        await expect(list).toHaveAttribute('role', 'list')

        const roles = await sandbox.locator('.origam-list-item')
            .evaluateAll((els) => els.map((e) => e.getAttribute('role')))
        expect(roles.length).toBeGreaterThan(0)
        expect(new Set(roles)).toEqual(new Set([ 'listitem' ]))
    })

    test('la Variant « Events - update:selected », qui lie une selection, s\'annonce listbox', async ({ page }) => {
        // Index 2 dans OrigamList.story.vue — la première Variant qui passe
        // `selected`, donc la première à entrer en mode selection.
        await page.goto(url(LIST_ID, 2), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        const list = sandbox.locator('.origam-list').first()
        await expect(list).toBeVisible({ timeout: 12000 })
        await expect(list).toHaveAttribute('role', 'listbox')

        const roles = await sandbox.locator('.origam-list-item')
            .evaluateAll((els) => els.map((e) => e.getAttribute('role')))
        expect(roles.length).toBeGreaterThan(0)
        expect(new Set(roles)).toEqual(new Set([ 'option' ]))
    })
})
