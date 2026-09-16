import { expect, test } from '@playwright/test'

/**
 * SPEC — OrigamListItem, `density` : qui fait autorité sur la hauteur (#571)
 *
 * ## Le défaut encodé ici
 *
 * `OrigamListItem` émettait `origam-list-item--density-*` sans qu'AUCUNE règle
 * SCSS ne la lise. La hauteur ne venait que de `--origam-list---density`, posé
 * par la liste parente. Conséquence mesurable : une ligne SANS liste ancêtre
 * rendait 56px quelle que soit la valeur passée — la prop était décorative.
 *
 * L'arbitrage (#571) a retenu : **la ligne fait autorité, par REDÉCLARATION**
 * de la même custom property, jamais par ajout d'un second terme au `calc()`.
 *
 * ## ⛔ Pourquoi les valeurs sont épinglées en DUR, pas comparées entre elles
 *
 * Un test qui vérifie que trois densités DIFFÈRENT passe sur une progression
 * fausse. C'est exactement comme ça que la gouttière de `OrigamRow` est restée
 * morte pour tous les consommateurs alors que le classeur la notait
 * « conforme » : le test comparait -12 / 0 / +4 entre eux et ne voyait pas que
 * la marche du milieu devait valoir -4. Chaque attente ci-dessous est donc une
 * valeur absolue, dérivée du modèle documenté :
 *
 *     hauteur = max(rung + densité, 1.5rem)
 *     rung par défaut = 56px ; densité = 0 / -8px / +8px
 *
 * ## ⛔ Pourquoi Playwright et pas Vitest
 *
 * `min-height` passe par `var(--origam-list---density)`. Sous jsdom
 * `getComputedStyle` ne résout JAMAIS un `var()` : il fabrique une valeur UA
 * qui ressemble à une mesure, identique sur le code cassé et sur le code
 * corrigé. Seul un vrai navigateur tranche.
 *
 * ## Le témoin positif
 *
 * `row-standalone` AVANT le correctif rend 56px pour les trois densités. Le
 * premier bloc de ce spec est donc rouge sur le code d'avant #571 et vert
 * après — c'est ce qui distingue le câblage d'un no-op. Vérifié en rejouant
 * le spec contre le commit parent.
 *
 * ## Variants de la story OrigamListItem (index 0-based)
 *   0 → Design
 *   1 → Density     ← ce spec
 *   2 → State
 *   3 → Functional
 */

const STORY_ID = 'components-stories-list-origamlistitem-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID
const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

const DENSITY_VARIANT = 1

/** Rung par défaut de la ligne, sans densité. */
const RUNG = 56

type TRung = 'default' | 'compact' | 'comfortable'

const EXPECTED: Record<TRung, number> = {
    compact: RUNG - 8,      // 48
    default: RUNG,          // 56
    comfortable: RUNG + 8   // 64
}

/**
 * Pose les deux densités via les contrôles Histoire et mesure les deux lignes.
 *
 * ⛔ La mutation ET la mesure tiennent dans un seul `evaluate`. Les classes de
 * densité sont liées à un `computed` : sur deux temps, Vue re-patche la liste
 * de classes entre les deux et on finit par mesurer son élément, pas le sien
 * (le piège d'`alert.spec.ts`, qui a produit un faux « 40px » sur du code
 * correct pour la densité de `OrigamSwitch`, #553).
 */
async function measure (page, rowDensity: TRung | null, listDensity: TRung | null) {
    return page.evaluate(({ rowDensity, listDensity }) => {
        const doc = document.querySelector('iframe')?.contentDocument ?? document

        const inList = doc.querySelector('[data-test="row-in-list"]') as HTMLElement | null
        const standalone = doc.querySelector('[data-test="row-standalone"]') as HTMLElement | null
        if (!inList || !standalone) {
            throw new Error('SPEC CASSÉ : les deux lignes du Variant Density sont introuvables')
        }

        /*
         * On écrit la classe directement plutôt que de piloter le HstSelect :
         * le picker d'Histoire est du DOM custom et fragile (règle maison).
         * La classe est le contrat que le composant émet — c'est elle que la
         * règle SCSS lit.
         */
        const setRung = (el: Element, base: string, rung: string | null) => {
            for (const c of [...el.classList]) {
                if (c.startsWith(`${base}--density-`)) el.classList.remove(c)
            }
            if (rung) el.classList.add(`${base}--density-${rung}`)
        }

        const list = inList.closest('.origam-list')
        if (!list) throw new Error('SPEC CASSÉ : la ligne "in-list" n\'a pas de .origam-list ancêtre')

        setRung(list, 'origam-list', listDensity)
        setRung(inList, 'origam-list-item', rowDensity)
        setRung(standalone, 'origam-list-item', rowDensity)

        const read = (el: HTMLElement) => ({
            minHeight: getComputedStyle(el).minHeight,
            token: getComputedStyle(el).getPropertyValue('--origam-list---density').trim(),
            height: Math.round(el.getBoundingClientRect().height)
        })

        return {
            inList: read(inList),
            standalone: read(standalone),
            standaloneHasListAncestor: Boolean(standalone.closest('.origam-list'))
        }
    }, { rowDensity, listDensity })
}

test.describe('OrigamListItem — `density` (#571)', () => {
    test.setTimeout(45000)

    test.beforeEach(async ({ page }) => {
        await page.goto(variantUrl(DENSITY_VARIANT))
        await page.waitForTimeout(600)
    })

    /*
     * ⛔ LE CŒUR DU TICKET. Avant #571 ces trois mesures valaient 56px toutes
     * les trois : la classe était émise et rien ne la lisait.
     */
    test('hors liste, la ligne honore sa propre densité', async ({ page }) => {
        for (const rung of ['compact', 'default', 'comfortable'] as TRung[]) {
            const m = await measure(page, rung, null)

            expect(
                m.standaloneHasListAncestor,
                'TÉMOIN : la ligne "standalone" ne doit avoir AUCUNE liste ancêtre, sinon ce test mesure autre chose'
            ).toBe(false)

            expect(m.standalone.token, `token --origam-list---density en ${rung}`)
                .toBe(rung === 'default' ? '0px' : rung === 'compact' ? '-8px' : '8px')

            expect(m.standalone.minHeight, `hauteur hors liste en ${rung}`)
                .toBe(`${EXPECTED[rung]}px`)
        }
    })

    /*
     * La promesse sur laquelle l'arbitrage a été rendu : à l'intérieur d'une
     * liste, le câblage ne doit RIEN changer. Une liste `compact` avec une
     * ligne `compact` vaut 48px — pas 40px, qui serait le -8px compté deux
     * fois (câblage par ajout d'un second terme, explicitement écarté).
     */
    test('dans une liste, redéclarer la même densité ne double pas la marche', async ({ page }) => {
        const m = await measure(page, 'compact', 'compact')

        expect(m.inList.token, 'token résolu sur la ligne').toBe('-8px')
        expect(m.inList.minHeight, 'liste compact + ligne compact').toBe('48px')
        expect(m.inList.minHeight, 'un double comptage donnerait 40px').not.toBe('40px')
    })

    /* Sans densité propre, la ligne hérite de sa liste — comportement inchangé. */
    test('sans densité propre, la ligne hérite de la liste', async ({ page }) => {
        for (const rung of ['compact', 'default', 'comfortable'] as TRung[]) {
            const m = await measure(page, null, rung)

            expect(m.inList.minHeight, `ligne sans densité dans une liste ${rung}`)
                .toBe(`${EXPECTED[rung]}px`)
        }
    })

    /* La ligne l'emporte sur sa liste quand les deux sont posées — c'est l'arbitrage. */
    test('la ligne l\'emporte sur sa liste', async ({ page }) => {
        const m = await measure(page, 'comfortable', 'compact')

        expect(m.inList.token, 'la valeur de la ligne gagne, elle est plus proche').toBe('8px')
        expect(m.inList.minHeight, 'liste compact + ligne comfortable').toBe('64px')
    })
})
