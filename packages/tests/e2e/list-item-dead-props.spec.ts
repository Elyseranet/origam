import { expect, test } from '@playwright/test'

/**
 * SPEC — OrigamListItem, props `slim` et `color` (#436 / #440)
 *
 * ## Les deux défauts que ce spec encode
 *
 * **`slim`** — `listItemClasses` émettait bien `origam-list-item--slim`, mais
 * le bloc `<style scoped>` de `OrigamListItem.vue` ne contenait AUCUNE règle
 * `&--slim`. La classe atterrissait dans le DOM et n'était lue par personne :
 * padding inline identique avec et sans la prop. La story exposait pourtant une
 * case à cocher « Slim » et la doc annonçait « Reduced inner spacing ».
 *
 * **`color`** — l'interface étend `IColorProps`, mais le composant n'appelait
 * que `useBackgroundColor(toRef(props, 'bgColor'))`. Le canal d'avant-plan
 * n'était jamais consommé. Ce n'est pas une prop exotique : `<origam-list>` et
 * `<origam-list-group>` FORWARDENT tous deux `color` vers chaque
 * `<origam-list-item>` descendant via leur defaults provider — le réglage
 * arrivait sur une prop que la ligne jetait.
 *
 * ## Pourquoi Playwright et pas Vitest
 *
 * ⛔ Sous jsdom, `getComputedStyle` ne résout JAMAIS un `var()` : il renvoie une
 * valeur UA fabriquée qui ressemble à une mesure. Le padding de `--slim` et la
 * couleur résolue passent tous deux par un `var(--origam-…)`. Un test unitaire
 * sur ces propriétés serait vert sur le code cassé comme sur le code corrigé.
 * Les moitiés observables sous jsdom (classe émise, déclaration inline
 * présente) sont couvertes par
 * `TU/components/List/OrigamListItem.dead-props.spec.ts`.
 *
 * ## ⛔ Pourquoi mutation et mesure tiennent dans UN SEUL `evaluate`
 *
 * `origam-list-item--slim` est liée au `computed` `listItemClasses`. Le patron
 * d'`alert.spec.ts` — poser la classe puis assertir avec `toHaveCSS` — mesure
 * l'élément que Vue a re-patché entre les deux temps, pas celui qu'on a
 * modifié. La mesure doit être synchrone, dans le même tour que la
 * modification. Ne pas « simplifier » ce spec en le rescindant en deux étapes.
 *
 * ## Variants de la story OrigamListItem (index 0-based)
 *   0 → Design      (color, bgColor, density, size, rounded, elevation, …)
 *   1 → State       (hover / active)
 *   2 → Functional  (disabled, nav, slim, link, tag, href, value, activeClass)
 */

const STORY_ID = 'components-stories-list-origamlistitem-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID
const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

const DESIGN_VARIANT = 0
const FUNCTIONAL_VARIANT = 2

test.describe('OrigamListItem — props mortes (#436 / #440)', () => {
    test.setTimeout(45000)

    test('`slim` réduit réellement le padding inline de la ligne', async ({ page }) => {
        await page.goto(variantUrl(FUNCTIONAL_VARIANT), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        const row = sandbox.locator('.origam-list-item').first()
        await expect(row).toBeVisible({ timeout: 12000 })

        const measured = await row.evaluate((el) => {
            const read = (e: HTMLElement) => {
                const cs = getComputedStyle(e)
                return {
                    tokenStart: cs.getPropertyValue('--origam-list-item---padding-inline-start').trim(),
                    tokenEnd: cs.getPropertyValue('--origam-list-item---padding-inline-end').trim(),
                    start: cs.paddingInlineStart,
                    end: cs.paddingInlineEnd
                }
            }

            el.classList.remove('origam-list-item--slim')
            const off = read(el)

            el.classList.add('origam-list-item--slim')
            const on = read(el)

            return { off, on }
        })

        /*
         * ⛔ Valeurs ATTENDUES, pas une simple différence.
         *
         * Un lot voisin a livré un test vert sur un défaut réel parce qu'il
         * vérifiait seulement que trois mesures diffèrent : la gouttière de
         * `origam-row` était morte (`calc(-4px + 0)` invalide, déclaration
         * jetée) et les valeurs différaient quand même. On épingle donc les
         * nombres exacts.
         *
         * Le token d'espacement de la ligne : 16px (`--origam-space---4`) au
         * repos, 8px (`--origam-space---2`) en `slim`. C'est le seul terme que
         * `slim` touche.
         */
        expect(measured.off.tokenStart, 'token padding-inline-start au repos').toBe('16px')
        expect(measured.off.tokenEnd, 'token padding-inline-end au repos').toBe('16px')
        expect(measured.on.tokenStart, 'token padding-inline-start slim').toBe('8px')
        expect(measured.on.tokenEnd, 'token padding-inline-end slim').toBe('8px')

        /*
         * Le padding rendu, lui, additionne indentation et densité :
         *
         *     padding-inline-start = token + indent + densité
         *
         * Dans ce Variant la ligne est dans un `<origam-list>` que le thème
         * origam met en `density: 'compact'` (-8px), sans indentation :
         * 16 - 8 = 8px au repos, 8 - 8 = 0px en slim. On épingle les deux ET
         * l'écart, qui doit valoir exactement la marche de token (8px) — c'est
         * ce qui prouve que `slim` ne touche QUE ce terme.
         */
        expect(measured.off.start, 'padding-inline-start rendu au repos').toBe('8px')
        expect(measured.off.end, 'padding-inline-end rendu au repos').toBe('8px')
        expect(measured.on.start, 'padding-inline-start rendu en slim').toBe('0px')
        expect(measured.on.end, 'padding-inline-end rendu en slim').toBe('0px')

        expect(
            parseFloat(measured.off.start) - parseFloat(measured.on.start),
            'slim retire exactement une marche de 8px'
        ).toBe(8)

        /*
         * ⛔ C'est ce bloc qui échoue sur le code d'avant #440 : sans règle
         * `&--slim`, le token reste à 16px et le padding rendu à 8px des deux
         * côtés, avec et sans la classe. Mesuré : « Expected: not "8px" ».
         */
    })

    test('le canal d\'avant-plan atteint réellement la surface visible de la ligne', async ({ page }) => {
        await page.goto(variantUrl(DESIGN_VARIANT), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        const row = sandbox.locator('.origam-list-item').first()
        await expect(row).toBeVisible({ timeout: 12000 })

        /*
         * Les DEUX moitiés du canal d'avant-plan, mesurées dans un navigateur
         * réel sur la ligne rendue :
         *
         *   • la classe utilitaire `.origam--color-primary` résout un token et
         *     produit une couleur ;
         *   • la déclaration inline `color:` — celle que `useBothColor` pousse
         *     sur le canal foreground (voir #514 : sur ce canal l'inline est
         *     émis EN PLUS de la classe, exprès) — l'emporte, et le titre en
         *     hérite parce qu'aucune règle scoped ne déclare `color` sur
         *     `&__title`.
         *
         * Le TU compagnon prouve que le composant émet bien ces deux choses
         * pour `color="primary"` ; ce test-ci prouve qu'une fois émises, elles
         * peignent. Ensemble ils couvrent la chaîne complète — ce que ni l'un
         * ni l'autre ne peut faire seul (jsdom ne résout aucun `var()`).
         */
        const measured = await row.evaluate((el) => {
            const title = el.querySelector('.origam-list-item__title') as HTMLElement
            const base = getComputedStyle(title).color

            el.classList.add('origam--color-primary')
            const viaClass = getComputedStyle(title).color
            el.classList.remove('origam--color-primary')

            el.style.setProperty('color', 'rgb(109, 40, 217)')
            const viaInline = getComputedStyle(title).color
            el.style.removeProperty('color')

            return { base, viaClass, viaInline }
        })

        expect(measured.viaClass, 'la classe utilitaire résout une couleur').not.toBe(measured.base)
        expect(measured.viaInline, 'la déclaration inline peint le titre').toBe('rgb(109, 40, 217)')
    })
})
