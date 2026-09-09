import { expect, test } from '@playwright/test'

/**
 * SPEC — OrigamRow / OrigamCol, la gouttière de grille (#417)
 *
 * ## Ce que ce spec encode
 *
 * `gutters` était déclarée, exposée par DEUX contrôles de la story, et ne
 * faisait rien : `useUnsupportedProp` se contentait d'avertir. Pire, Row et
 * Col se contredisaient — mesuré avant correctif :
 *
 *     OrigamCol  padding-inline : 12px  (soit une gouttière de 24px)
 *     OrigamRow  margin-inline  : -4px  (soit une gouttière de 8px)
 *
 * Deux échelons d'écart. Le modèle de grille exige que la marge négative du
 * row annule EXACTEMENT le demi-padding extérieur des colonnes, sinon le
 * bord de la grille n'affleure pas son conteneur : ici la grille rentrait de
 * 8px de chaque côté.
 *
 * ## Le modèle, désormais porté par UNE variable
 *
 * `--origam-row---gutter` est la gouttière TOTALE entre deux colonnes.
 * Elle est HÉRITÉE : le row la pose, chaque col descendant la lit, sans
 * `provide`/`inject` ni prop à faire descendre.
 *
 *     col padding = gutter / 2        row margin = gutter / -2
 *
 * ## ⛔ Pourquoi ce spec assert des VALEURS et non des différences
 *
 * C'est la leçon du défaut jumeau corrigé dans le même lot : le test de
 * `density` d'`grids.spec.ts` n'assertait que « les trois valeurs diffèrent »
 * et restait vert sur `-12 / 0 / 4` alors que la progression correcte est
 * `-12 / -4 / +4` — un `calc()` invalide avait tué l'échelon du milieu, et
 * la distinction ne le voyait pas. On mesure donc ici les quatre valeurs
 * attendues, et la relation row/col, pas leur écart.
 *
 * ## Pourquoi Playwright et pas Vitest
 *
 * ⛔ jsdom ne résout jamais un `var()` et n'injecte jamais un `<style scoped>`
 * (CLAUDE.md, #398). Tout ce spec porte sur des `calc(var(…))`.
 */

const ROW_STORY_ID = 'components-stories-grids-origamrow-story-vue'
const ROW_PATH = '/stories/story/' + ROW_STORY_ID

/** gutter total → [padding col attendu, marge row attendue] */
const RUNGS: Array<[string, string, string]> = [
    ['none', '0px', '0px'],
    ['dense', '4px', '-4px'],
    ['default', '8px', '-8px'],
    ['comfortable', '12px', '-12px']
]

test.describe('OrigamRow — la gouttière pilote réellement la grille (#417)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${ROW_PATH}?variantId=${ROW_STORY_ID}-0`)
        await page.locator('iframe').first().waitFor({ state: 'attached' })
        await page.frameLocator('iframe').first().locator('.origam-row').first()
            .waitFor({ state: 'visible' })
    })

    test('les quatre échelons produisent les valeurs attendues, col et row accordés', async ({ page }) => {
        const frame = page.frameLocator('iframe').first()
        const row = frame.locator('.origam-row').first()

        // Construction ET mesure dans UN SEUL evaluate : Vue re-patche la
        // liste de classes du row réel entre deux étapes (piège alert.spec.ts).
        // On mesure donc des CLONES, qui portent le même attribut `data-v-*`
        // et reçoivent donc exactement le même CSS scopé.
        const measured = await row.evaluate((el, rungs: Array<[string, string, string]>) => {
            const col = el.querySelector('.origam-col')
            if (!col) return { error: 'aucune .origam-col dans la story' }

            const host = document.createElement('div')
            host.style.width = '900px'
            document.body.appendChild(host)

            const out: Record<string, { colPad: string, rowMargin: string, gutter: string }> = {}

            for (const [rung] of rungs) {
                const clone = el.cloneNode(true) as HTMLElement
                clone.className = clone.className
                    .split(/\s+/)
                    .filter((c) => !c.startsWith('origam-row--gutter-'))
                    .join(' ') + ` origam-row--gutter-${rung}`
                clone.removeAttribute('style')
                host.appendChild(clone)

                const clonedCol = clone.querySelector('.origam-col') as HTMLElement
                clonedCol.removeAttribute('style')

                out[rung] = {
                    colPad: getComputedStyle(clonedCol).paddingInlineStart,
                    rowMargin: getComputedStyle(clone).marginInlineStart,
                    gutter: getComputedStyle(clone).getPropertyValue('--origam-row---gutter').trim()
                }
            }

            host.remove()

            return out
        }, RUNGS)

        expect(measured).not.toHaveProperty('error')

        for (const [rung, expectedPad, expectedMargin] of RUNGS) {
            const row = (measured as Record<string, { colPad: string, rowMargin: string }>)[rung]

            expect(row.colPad, `échelon ${rung} — padding de la colonne`).toBe(expectedPad)
            expect(row.rowMargin, `échelon ${rung} — marge du row`).toBe(expectedMargin)

            // La relation qui fait tenir la grille : la marge du row annule
            // exactement le demi-padding extérieur des colonnes.
            expect(
                parseFloat(row.colPad) + parseFloat(row.rowMargin),
                `échelon ${rung} — le bord de la grille doit affleurer (col + row = 0)`
            ).toBe(0)
        }
    })

    test('une longueur libre pilote la gouttière sans passer par un échelon', async ({ page }) => {
        const frame = page.frameLocator('iframe').first()
        const row = frame.locator('.origam-row').first()

        const measured = await row.evaluate((el) => {
            const host = document.createElement('div')
            host.style.width = '900px'
            document.body.appendChild(host)

            const clone = el.cloneNode(true) as HTMLElement
            clone.removeAttribute('style')
            clone.style.setProperty('--origam-row---gutter', '30px')
            host.appendChild(clone)

            const clonedCol = clone.querySelector('.origam-col') as HTMLElement
            clonedCol.removeAttribute('style')

            const out = {
                colPad: getComputedStyle(clonedCol).paddingInlineStart,
                rowMargin: getComputedStyle(clone).marginInlineStart
            }

            host.remove()

            return out
        })

        expect(measured.colPad).toBe('15px')
        expect(measured.rowMargin).toBe('-15px')
    })
})
