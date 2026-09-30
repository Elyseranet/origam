/****************************************************************************
 * data-table-group-attr-leak.spec.ts — #371 (point 1)
 *
 * @description
 * Verdict NAVIGATEUR REEL sur le constat central du ticket #371 : le code
 * source d'une closure etait serialise en attribut DOM sur chaque ligne
 * d'en-tete de groupe de `<OrigamDataTable>`.
 *
 * @description
 * Mecanisme. `<OrigamDataTableRows>` rend le fallback du slot
 * `#group-header` en v-bindant un objet de props sur
 * `<origam-data-table-group-header-row>`. Toute cle que
 * `IDataTableGroupHeaderRowProps` ne declare PAS tombe dans `$attrs`, et
 * Vue la pose en ATTRIBUT DOM sur la racine du composant — un `<tr>`. Une
 * FONCTION y est convertie par `toString()`, donc son corps source atterrit
 * dans le HTML livre.
 *
 * @description
 * MESURE AVANT CORRECTIF (#548, `groupHeaderSlotProps()` v-binde
 * directement sur le composant), rejouee dans ce worktree en re-cassant la
 * ligne 64 de `OrigamDataTableRows.vue` — attributs reellement rendus :
 *   isgroupopen="(group) => { … }"    (le scenario du ticket)
 *   isexpanded="(item) => { … }"      (une seconde fuite, non rapportee)
 *
 * @description
 * Pourquoi un vrai navigateur et pas seulement jsdom. La serialisation
 * d'attribut est un comportement de Vue, que jsdom reproduit fidelement
 * (`data-table-rows-group-header-attrs.spec.ts` en est la contrepartie TU,
 * et elle est rouge sans le correctif). Mais le ticket decrit le HTML
 * LIVRE ; seul un rendu Chromium contre le Histoire statique tranche sur ce
 * que le consommateur recoit vraiment.
 *
 * @description
 * ⛔ La Variant `Prop — groupBy` que cette spec visite a du etre CREEE pour
 * elle : avant #371, aucune des 30 Variants de la story ne rendait de ligne
 * d'en-tete de groupe. C'est la raison pour laquelle le defaut a survecu si
 * longtemps — il n'existait aucun site de rendu ou le voir.
 ***************************************************************************/

import { expect, test } from '@playwright/test'

const STORY_PATH = '/stories/story/components-stories-datatable-origamdatatable-story-vue'

const GROUP_HEADER_ROW = 'tr.origam-data-table-group-header-row'

async function gotoGroupByVariant (page: import('@playwright/test').Page) {
    await page.goto(STORY_PATH)
    await page.waitForLoadState('networkidle')
    await page.getByText('Prop — groupBy', { exact: true }).first().click()
    await page.waitForTimeout(800)

    return page.frameLocator('iframe[src*="__sandbox"]')
}

test.describe('OrigamDataTable — aucune closure serialisee dans le DOM des lignes de groupe (#371)', () => {
    test('la Variant groupBy rend bien des lignes d\'en-tete de groupe', async ({ page }) => {
        const sandbox = await gotoGroupByVariant(page)

        // Controle POSITIF du harnais : sans ce site de rendu, les deux tests
        // suivants passeraient au vert sur du code casse, faute d'element a
        // inspecter.
        await expect(sandbox.locator(GROUP_HEADER_ROW).first()).toBeVisible({ timeout: 5000 })

        const count = await sandbox.locator(GROUP_HEADER_ROW).count()
        expect(count, 'les items de la Variant se groupent en 3 equipes').toBeGreaterThanOrEqual(3)
    })

    test('aucun attribut d\'une ligne d\'en-tete de groupe ne contient de source de closure', async ({ page }) => {
        const sandbox = await gotoGroupByVariant(page)
        await expect(sandbox.locator(GROUP_HEADER_ROW).first()).toBeVisible({ timeout: 5000 })

        const offenders = await sandbox.locator(GROUP_HEADER_ROW).first().evaluate((_el, selector) => {
            const found: Array<string> = []

            for (const row of Array.from(document.querySelectorAll(selector))) {
                for (const attr of Array.from(row.attributes)) {
                    if (attr.value.includes('=>') || attr.value.includes('function')) {
                        found.push(`${attr.name}="${attr.value.slice(0, 80)}"`)
                    }
                }
            }

            return found
        }, GROUP_HEADER_ROW)

        expect(offenders, 'une fonction fuite en attribut DOM — cf. l\'en-tete de ce fichier').toEqual([])
    })

    test('le HTML rendu de la table ne contient aucun des noms de props du scope de slot en attribut', async ({ page }) => {
        const sandbox = await gotoGroupByVariant(page)
        await expect(sandbox.locator(GROUP_HEADER_ROW).first()).toBeVisible({ timeout: 5000 })

        // Les cinq cles que le scope de slot `#group-header` porte
        // volontairement et que `IDataTableGroupHeaderRowProps` ne declare
        // PAS. Vue minuscule les noms d'attribut, d'ou la forme attendue.
        const LEAKED = ['isgroupopen', 'isexpanded', 'toggleexpand', 'toggleselect', 'internalitem']

        const present = await sandbox.locator(GROUP_HEADER_ROW).first().evaluate((_el, args) => {
            const [selector, names] = args as [string, Array<string>]

            return names.filter((name) => {
                return Array.from(document.querySelectorAll(selector)).some((row) => row.hasAttribute(name))
            })
        }, [GROUP_HEADER_ROW, LEAKED] as [string, Array<string>])

        expect(present, 'ces cles appartiennent au scope de slot, pas au DOM').toEqual([])
    })
})
