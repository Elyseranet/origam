import { expect, test } from '@playwright/test'

/**
 * SPEC — OrigamSwitch, prop `density` (#553)
 *
 * ## Le défaut que ce spec encode
 *
 * `OrigamSwitch.vue` lisait la variable de densité avec DEUX tirets :
 *
 *     min-width: calc(40px + 1.5 * var(--origam-selection-control--density, 0px));
 *
 * quand `OrigamSelectionControl.vue` la DÉCLARE avec TROIS :
 *
 *     &--density-compact { --origam-selection-control---density: -8px; }
 *
 * Les deux noms ne coïncidaient jamais et `OrigamSwitch` ne déclarait nulle part
 * sa propre version à deux tirets. Le repli `0px` s'appliquait donc toujours :
 * **la prop `density` n'avait aucun effet sur la taille du Switch**, 40px quelle
 * que soit la valeur. Aucune erreur, aucun avertissement — un `var()` avec repli
 * est silencieux par construction.
 *
 * Même classe de défaut que les 86 tokens morts de `list` (#550) : deux
 * grammaires pour un même nom.
 *
 * ## Pourquoi Playwright et pas Vitest
 *
 * ⛔ Sous jsdom, `getComputedStyle` ne résout JAMAIS un `var()` : il renvoie une
 * valeur UA fabriquée (`16px`) qui ressemble à une mesure. Un test unitaire sur
 * `min-width` passerait au vert sur le code cassé ET sur le code corrigé.
 *
 * ## ⛔ Pourquoi le swap de classe et la mesure sont dans UN SEUL `evaluate`
 *
 * Le patron d'`alert.spec.ts` — poser la classe dans le DOM puis assertir avec
 * `toHaveCSS` — ne tient pas ici. Vue **re-patche la liste de classes** de
 * `.origam-selection-control` entre le `evaluate` et l'assertion qui suit, parce
 * que cette liste est liée à `densityClasses`. Le `toHaveCSS`, qui repolle
 * pendant 5 s, finit par mesurer l'élément rendu par Vue, pas celui qu'on a
 * modifié — et renvoie systématiquement `40px`.
 *
 * Ce n'est pas un défaut du composant : c'est la réactivité qui fait son
 * travail. La mesure doit donc être **synchrone**, dans le même tour que la
 * modification. Vérifié : la même séquence en deux temps échoue, en un temps
 * passe, sur un code identique. Ne pas « simplifier » ce spec en le
 * rescindant en deux étapes.
 *
 * ## Le calcul attendu, tel que le SCSS l'écrit : `40px + 1.5 × densité`
 *
 *     default      0px  →  40px
 *     compact     -8px  →  28px
 *     comfortable  8px  →  52px
 *
 * Ce sont exactement les trois valeurs mesurées sur `OrigamSelectionControl`
 * après la correction du même typo par le lot 3 de #550.
 */

const STORY_ID = 'components-stories-switch-origamswitch-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID
const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

const DESIGN_VARIANT = 0

/** `40px + 1.5 × densité`, tel que le SCSS le calcule. */
const EXPECTED = {
    default: { densityVar: '0px', size: '40px' },
    compact: { densityVar: '-8px', size: '28px' },
    comfortable: { densityVar: '8px', size: '52px' }
} as const

test.describe('OrigamSwitch — prop density (#553)', () => {
    test.setTimeout(45000)

    test('la densité du thème descend jusqu\'à origam-selection-control', async ({ page }) => {
        await page.goto(variantUrl(DESIGN_VARIANT), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        const control = sandbox.locator('.origam-selection-control').first()
        await expect(control).toBeVisible({ timeout: 12000 })

        /*
         * ⛔ `compact`, PAS `default` — et c'est le point intéressant.
         *
         * `OrigamSwitch` déclare `density: DENSITY.DEFAULT` dans son
         * `withDefaults`, mais `origam.theme.ts` nomme `density: 'compact'` sur
         * `origam-switch` ET sur `origam-selection-control`. Le résolveur
         * ADR-005 écrit donc `compact` dans `instance.props` APRÈS le `setup()`,
         * et c'est cette valeur-là qui est rendue. Lire le `withDefaults` seul
         * mène à la mauvaise conclusion — le CLAUDE.md prévient exactement de ça.
         *
         * Conséquence directe sur #553 : le thème par défaut du DS demandait
         * déjà une densité `compact` sur le Switch, et cette demande n'avait
         * AUCUN effet visible. Ce n'était pas une prop exotique inutilisée,
         * c'était le réglage livré par défaut, silencieusement ignoré.
         */
        await expect(control).toHaveClass(/origam-selection-control--density-compact/)
    })

    test('les trois densités produisent trois tailles distinctes', async ({ page }) => {
        await page.goto(variantUrl(DESIGN_VARIANT), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        const wrapper = sandbox.locator('.origam-selection-control__wrapper').first()
        await expect(wrapper).toBeVisible({ timeout: 12000 })

        const measured = await wrapper.evaluate((el) => {
            const control = el.closest('.origam-selection-control') as HTMLElement
            const out: Record<string, { densityVar: string, minWidth: string, minHeight: string }> = {}

            for (const density of [ 'default', 'compact', 'comfortable' ]) {
                control.classList.remove(
                    'origam-selection-control--density-default',
                    'origam-selection-control--density-compact',
                    'origam-selection-control--density-comfortable'
                )
                control.classList.add(`origam-selection-control--density-${density}`)

                const computed = getComputedStyle(el)

                out[density] = {
                    densityVar: getComputedStyle(control).getPropertyValue('--origam-selection-control---density').trim(),
                    minWidth: computed.minWidth,
                    minHeight: computed.minHeight
                }
            }

            return out
        })

        for (const [ density, expected ] of Object.entries(EXPECTED)) {
            expect(measured[density].densityVar, `--…---density pour ${density}`).toBe(expected.densityVar)
            expect(measured[density].minWidth, `min-width pour ${density}`).toBe(expected.size)
            expect(measured[density].minHeight, `min-height pour ${density}`).toBe(expected.size)
        }

        /*
         * ⛔ C'est CETTE assertion qui échoue sur le code d'avant #553 : les
         * trois valeurs y sont identiques (40px), le repli `0px` s'appliquant
         * quelle que soit la densité. Vérifié par mutation : remettre le nom à
         * deux tirets fait tomber ce test, le remettre à trois le rétablit.
         */
        const sizes = Object.values(measured).map((m) => m.minWidth)

        expect(new Set(sizes).size, 'trois tailles distinctes attendues').toBe(3)
        expect(sizes).toEqual([ '40px', '28px', '52px' ])
    })
})
