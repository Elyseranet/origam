import { expect, test } from '@playwright/test'

/**
 * SPEC — OrigamRow, la règle de gouttière entre deux rows adjacents (#417)
 *
 * ## Le défaut que ce spec encode
 *
 * Le bloc `<style scoped>` d'`OrigamRow.vue` portait un reliquat Vuetify :
 *
 *     + .v-row {
 *         margin-block-start: calc((var(--origam-row---margin-block-start) + var(--origam-row---density)) * -1);
 *     }
 *
 * `.v-row` n'existe NULLE PART dans ce design system — vérifiable par
 * `grep -r "v-row" packages/ds/src`. Le sélecteur ne matchait donc jamais, et
 * la règle qu'il porte est justement celle qui annule la gouttière négative
 * entre deux rows empilés : chaque row porte une marge de bloc négative
 * (`gutter / -2`), si bien que deux rows successifs se CHEVAUCHENT d'une
 * gouttière entière au lieu de se toucher.
 *
 * Le défaut est visible dans la story elle-même, qui le contourne à la main :
 * la variante « Prop — density » écrit `style="margin-top: 8px"` sur les
 * deuxième et troisième rows — exactement les 8px que la règle morte devait
 * rendre inutiles.
 *
 * ## Pourquoi Playwright et pas Vitest
 *
 * ⛔ `<style scoped>` n'est JAMAIS injecté dans le `document.head` de jsdom
 * (cf. CLAUDE.md, #398), et la déclaration passe par un `var()` que jsdom ne
 * résout pas. Une assertion unitaire sur `margin-top` mesurerait une valeur UA
 * fabriquée, identique avant et après correctif.
 *
 * ## Ce qui est mesuré
 *
 * Deux `.origam-row` rendus côte à côte, sans marge inline de contournement :
 * la marge haute du SECOND doit compenser la marge négative du modèle, donc
 * valoir l'opposé exact de celle d'un row isolé.
 *
 * Les valeurs suivent la gouttière par défaut (`comfortable`, 24px) : un row
 * isolé porte `-12px`, un row adjacent `+12px`. Le spec les dérive de la
 * variable plutôt que de les figer, pour ne pas re-graver un nombre que le
 * modèle de grille possède déjà.
 *
 * La construction du DOM et la mesure tiennent dans UN SEUL `evaluate` — cf.
 * le piège documenté d'`alert.spec.ts`. Les rows sont des CLONES d'un row
 * réellement rendu : le clone conserve l'attribut `data-v-*` du scoped CSS,
 * donc les règles s'appliquent exactement comme sur l'original.
 */

const ROW_STORY_ID = 'components-stories-grids-origamrow-story-vue'
const ROW_PATH = '/stories/story/' + ROW_STORY_ID

test.describe('OrigamRow — la gouttière entre rows adjacents (#417)', () => {
    test('la marge haute du second row compense la marge négative', async ({ page }) => {
        await page.goto(`${ROW_PATH}?variantId=${ROW_STORY_ID}-0`)
        await page.locator('iframe').first().waitFor({ state: 'attached' })

        const frame = page.frameLocator('iframe').first()
        const row = frame.locator('.origam-row').first()
        await row.waitFor({ state: 'visible' })

        const measured = await row.evaluate((el) => {
            const host = document.createElement('div')
            host.style.width = '600px'
            document.body.appendChild(host)

            const first = el.cloneNode(true) as HTMLElement
            const second = el.cloneNode(true) as HTMLElement

            // Les variantes de la story contournent le défaut avec une marge
            // inline ; on la retire pour mesurer la règle CSS elle-même.
            for (const clone of [first, second]) {
                clone.style.removeProperty('margin-top')
                clone.style.removeProperty('margin-block-start')
                host.appendChild(clone)
            }

            const gutter = getComputedStyle(first).getPropertyValue('--origam-row---gutter').trim()
            const isolated = getComputedStyle(first).marginTop
            const adjacent = getComputedStyle(second).marginTop

            host.remove()

            return { gutter, isolated, adjacent }
        })

        // Le row isolé garde sa gouttière négative : c'est le modèle de la grille.
        const half = parseFloat(measured.gutter) / 2

        expect(parseFloat(measured.isolated), JSON.stringify(measured)).toBe(-half)

        // Le row qui SUIT un autre row doit la compenser, sinon les deux
        // se chevauchent d'une gouttière entière.
        expect(parseFloat(measured.adjacent), JSON.stringify(measured)).toBe(half)
        expect(parseFloat(measured.isolated) + parseFloat(measured.adjacent)).toBe(0)
    })
})
