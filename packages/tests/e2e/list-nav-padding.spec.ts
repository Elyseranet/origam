import { expect, test } from '@playwright/test'

/**
 * SPEC — `nav` : la gouttière intérieure de la liste et de la ligne (#934)
 *
 * ## Le défaut encodé ici
 *
 * `.origam-list--nav` déclarait `--origam-list---padding-inline: 8px` et
 * `.origam-list-item--nav` déclarait `--origam-list-item---padding-inline: 8px`.
 * **Aucun de ces deux noms n'est lu nulle part.** Une custom property n'est
 * PAS un raccourci : `--x---padding-inline` n'alimente pas
 * `--x---padding-inline-start` / `-end`, qui sont les seuls noms que les deux
 * règles de base consomment. Les deux déclarations étaient donc inertes et la
 * feuille de tokens continuait de gagner (`var(--origam-space---0)` = 0 pour
 * la liste).
 *
 * Effet mesuré sur le menu de la barre de navigation du site marketing, sous
 * les 8 identités : gouttière de liste `0px/0px`, donc des lignes à ras bord
 * du menu — et, sous les identités à grand rayon (material, glass, cartoon),
 * une pastille de survol **rognée par le rayon du menu** (`overflow: auto` sur
 * `.origam-menu__content`). 172px de ligne dans 180px de menu avant, 156px
 * après.
 *
 * ## ⛔ Pourquoi des valeurs absolues
 *
 * Un test qui vérifie seulement que « avec nav ≠ sans nav » passerait sur
 * n'importe quelle valeur fausse. Les attentes ci-dessous sont dérivées du
 * modèle documenté :
 *
 *   liste :  padding-inline-start/end = var(--origam-list---padding-inline-start, 0)
 *            feuille  → var(--origam-space---0) = 0px
 *            --nav    → var(--origam-space---2) = 8px
 *
 *   ligne :  padding-inline-end = calc(var(--origam-list-item---padding-inline-end, 16px)
 *                                      + var(--origam-list---density, 0px))
 *            feuille  → var(--origam-space---4) = 16px
 *            --nav    → var(--origam-space---2) = 8px
 *
 * On lit la custom property ELLE-MÊME en plus du longhand résolu : c'est
 * exactement le canal qui était cassé (la propriété portait un autre nom, donc
 * la lecture rendait la valeur de la feuille).
 *
 * ## ⛔ Pourquoi Playwright et pas Vitest
 *
 * `padding-inline-*` passe par `var()`, et le `<style scoped>` d'un SFC n'est
 * jamais injecté dans le `document.head` de jsdom. `getComputedStyle` y
 * fabrique une valeur UA identique sur le code cassé et sur le code corrigé.
 *
 * ## Le témoin positif
 *
 * Avant le correctif, les deux blocs `--nav` ci-dessous rendent la valeur de
 * la feuille (0px pour la liste, 16px pour la ligne). Rejoué contre le commit
 * parent, ce spec est rouge.
 *
 * ## Variants de la story OrigamList (index 0-based)
 *   0 → Design
 *   1 → Functional   ← ce spec (expose le contrôle `nav`)
 */

const STORY_ID = 'components-stories-list-origamlist-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID
const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

const FUNCTIONAL_VARIANT = 1

/** `--origam-space---2`, la valeur que les deux blocs `--nav` visent. */
const NAV_GUTTER = '8px'
/** `--origam-space---0`, ce que la feuille déclare pour la liste. */
const LIST_SHEET_GUTTER = '0px'
/** `--origam-space---4`, ce que la feuille déclare pour la ligne. */
const ITEM_SHEET_GUTTER = '16px'

/**
 * Pose (ou retire) la classe `--nav` et mesure, dans le MÊME `evaluate`.
 *
 * ⛔ La classe est liée à un `computed` : sur deux temps, Vue la re-patche
 * entre la mutation et la mesure et on finit par mesurer son élément, pas le
 * sien (piège d'`alert.spec.ts`, faux « 40px » sur du code correct, #553).
 */
async function measure (page: import('@playwright/test').Page, nav: boolean) {
    return page.evaluate((withNav) => {
        const doc = document.querySelector('iframe')?.contentDocument
        if (!doc) throw new Error('SPEC CASSÉ : iframe sandbox introuvable')

        const list = doc.querySelector('.origam-list') as HTMLElement | null
        const item = doc.querySelector('.origam-list-item') as HTMLElement | null
        if (!list || !item) throw new Error('SPEC CASSÉ : liste ou ligne introuvable dans le sandbox')

        list.classList.toggle('origam-list--nav', withNav)
        item.classList.toggle('origam-list-item--nav', withNav)

        const listCs = getComputedStyle(list)
        const itemCs = getComputedStyle(item)

        return {
            listVar: listCs.getPropertyValue('--origam-list---padding-inline-start').trim(),
            listStart: listCs.paddingInlineStart,
            listEnd: listCs.paddingInlineEnd,
            itemVar: itemCs.getPropertyValue('--origam-list-item---padding-inline-end').trim(),
            itemEnd: itemCs.paddingInlineEnd,
            // Preuve que l'on mesure les éléments rendus par Vue, pas une sonde
            // fabriquée : sans `data-v-*`, le sélecteur scopé ne matcherait pas.
            scoped: [...list.attributes].some((a) => a.name.startsWith('data-v-'))
                && [...item.attributes].some((a) => a.name.startsWith('data-v-'))
        }
    }, nav)
}

test.describe('nav — gouttière intérieure (#934)', () => {
    test('`.origam-list--nav` pose bien les deux longhands lus par la règle de base', async ({ page }) => {
        await page.goto(variantUrl(FUNCTIONAL_VARIANT))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-list').first()).toBeVisible()

        const off = await measure(page, false)
        expect(off.scoped, 'les éléments mesurés doivent porter leur data-v-').toBe(true)
        expect(off.listVar).toBe(LIST_SHEET_GUTTER)
        expect(off.listStart).toBe(LIST_SHEET_GUTTER)
        expect(off.listEnd).toBe(LIST_SHEET_GUTTER)

        const on = await measure(page, true)
        expect(on.listVar).toBe(NAV_GUTTER)
        expect(on.listStart).toBe(NAV_GUTTER)
        expect(on.listEnd).toBe(NAV_GUTTER)
    })

    test('`.origam-list-item--nav` pose bien sa gouttière au lieu du nom mort', async ({ page }) => {
        await page.goto(variantUrl(FUNCTIONAL_VARIANT))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-list-item').first()).toBeVisible()

        const off = await measure(page, false)
        expect(off.itemVar).toBe(ITEM_SHEET_GUTTER)

        const on = await measure(page, true)
        expect(on.itemVar).toBe(NAV_GUTTER)
        // Le longhand résolu passe par un `calc()` qui ajoute la densité de la
        // liste. On vérifie donc que la ligne a bien RÉTRÉCI de 8px exactement.
        const delta = parseFloat(off.itemEnd) - parseFloat(on.itemEnd)
        expect(delta).toBe(8)
    })
})
