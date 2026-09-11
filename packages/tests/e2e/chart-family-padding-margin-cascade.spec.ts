import { expect, test, type Page } from '@playwright/test'

/**
 * Famille Chart (lot C2) — OrigamChart{Bullet,Polar,PolarBar,Sankey,
 * Sunburst,Variwide} + OrigamCardHeader.
 *
 * MESURE, PAS SOUHAIT — canal du thème : la cascade CSS empêchait la forme
 * d'échelle de `padding`/`margin` (`padding="4"`) de peindre quoi que ce
 * soit, alors que la classe utilitaire (`.origam--p-4`) était bien émise.
 *
 * Cause établie, pas supposée : chaque composant déclarait sa valeur par
 * défaut de padding (et, pour CardHeader, de margin aussi) dans une règle
 * SCSS scopée du composant lui-même — ex. `OrigamChartBullet.vue` :
 * `padding: var(--origam-chart---padding, 12px)`. Le compilateur scoped de
 * Vue ajoute `[data-v-hash]` à cette règle, portant sa spécificité à
 * (0,2,0) — contre (0,1,0) pour `.origam--p-4`. L'utilitaire perd la
 * cascade quel que soit l'ordre de chargement des feuilles.
 *
 * Fix : chaque déclaration par défaut concernée est passée sous `:where(&)`
 * dans le SCSS source, ce qui — vérifié via `@vue/compiler-sfc` — ramène la
 * spécificité de CETTE règle précise à (0,0,0), sans toucher au reste du
 * bloc ni à la cascade globale du DS (pas de `@layer`, pas de
 * `!important`).
 *
 * jsdom ne résout JAMAIS `var()` (#398, confirmé projet) et ne charge même
 * pas le `<style scoped>` du SFC dans `document.head` — ce test ne peut
 * donc être écrit qu'ici, contre un navigateur réel (Chromium via
 * Playwright, Histoire statique). Voir aussi
 * `chart-c2-padding-margin-channel.spec.ts` (Vitest) pour la preuve,
 * fiable sous jsdom, que la classe utilitaire est bien ÉMISE — ce fichier
 * prouve qu'elle PEINT.
 *
 * La mutation de classe porte sur l'élément RÉELLEMENT rendu par Vue à
 * l'intérieur de l'iframe `__sandbox` de Histoire (il porte le vrai
 * `[data-v-hash]`) — pas un élément fabriqué à la main, qui ne matcherait
 * aucun sélecteur scopé et masquerait le défaut (piège documenté :
 * `.origam-breadcrumb-item` sans `data-v-<hash>`).
 */

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyUrl: string, title: string) => {
    await page.goto(storyUrl)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(500)
}

/**
 * Valeur ABSOLUE et non un simple écart : `.origam--p-4` / `.origam--m-4`
 * résolvent `var(--origam-space---4)`, déclaré à `16px` dans
 * `primitive.css`. Un test qui vérifierait seulement que deux rendus
 * diffèrent passerait sur un canal totalement mort dans le mauvais sens.
 */
const SCALE_4_PX = '16px'

const CHART_CASES: Array<[name: string, story: string, dataCy: string]> = [
    ['OrigamChartBullet', '/stories/story/components-stories-chart-origamchartbullet-story-vue', 'origam-chart-bullet'],
    ['OrigamChartPolar', '/stories/story/components-stories-chart-origamchartpolar-story-vue', 'origam-chart-polar'],
    ['OrigamChartPolarBar', '/stories/story/components-stories-chart-origamchartpolarbar-story-vue', 'origam-chart-polar-bar'],
    ['OrigamChartSankey', '/stories/story/components-stories-chart-origamchartsankey-story-vue', 'origam-chart-sankey'],
    ['OrigamChartSunburst', '/stories/story/components-stories-chart-origamchartsunburst-story-vue', 'origam-chart-sunburst'],
    ['OrigamChartVariwide', '/stories/story/components-stories-chart-origamchartvariwide-story-vue', 'origam-chart-variwide']
]

test.describe('famille Chart (lot C2) — padding="4" peint 16px (cascade :where)', () => {
    for (const [name, story, dataCy] of CHART_CASES) {
        test(`${name} : .origam--p-4 gagne la cascade sur la regle scopee du composant`, async ({ page }) => {
            await openVariant(page, story, 'Design')
            const host = sandboxOf(page).locator(`[data-cy="${ dataCy }"]`).first()
            await expect(host).toBeVisible({ timeout: 8000 })

            const before = await host.evaluate((el) => getComputedStyle(el).paddingTop)

            const painted = await host.evaluate((el) => {
                el.classList.add('origam--p-4')

                return getComputedStyle(el).paddingTop
            })

            // Contre-épreuve : le defaut EXISTE avant l'ajout de la classe
            // (sinon l'assertion positive ne prouverait rien).
            expect(before).not.toBe(SCALE_4_PX)
            expect(painted).toBe(SCALE_4_PX)
        })
    }

    // Bullet/Sankey/Variwide ne destructuraient MEME PAS `marginClasses` de
    // `useMargin()` avant ce lot — le canal classe lui-meme etait mort, pas
    // seulement ecrase par la cascade. Ce test couvre donc les deux
    // defauts a la fois pour ces trois-la (et confirme la non-regression
    // sur Polar/PolarBar/Sunburst, qui avaient deja le cablage).
    for (const [name, story, dataCy] of CHART_CASES) {
        test(`${name} : .origam--m-4 gagne la cascade`, async ({ page }) => {
            await openVariant(page, story, 'Design')
            const host = sandboxOf(page).locator(`[data-cy="${ dataCy }"]`).first()
            await expect(host).toBeVisible({ timeout: 8000 })

            const painted = await host.evaluate((el) => {
                el.classList.add('origam--m-4')

                return getComputedStyle(el).marginTop
            })

            expect(painted).toBe(SCALE_4_PX)
        })
    }
})

test.describe('OrigamCardHeader (lot C2) — padding="4"/margin="4" peignent 16px (cascade :where)', () => {
    const CARD_HEADER_STORY = '/stories/story/components-stories-card-origamcardheader-story-vue'

    test('.origam--p-4 gagne la cascade sur les 4 longhand padding-* scopes', async ({ page }) => {
        await openVariant(page, CARD_HEADER_STORY, 'Design')
        const host = sandboxOf(page).locator('.origam-card-header').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        const painted = await host.evaluate((el) => {
            el.classList.add('origam--p-4')

            return getComputedStyle(el).paddingTop
        })

        expect(painted).toBe(SCALE_4_PX)
    })

    test('.origam--m-4 gagne la cascade sur les 4 longhand margin-* scopes', async ({ page }) => {
        await openVariant(page, CARD_HEADER_STORY, 'Design')
        const host = sandboxOf(page).locator('.origam-card-header').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        const painted = await host.evaluate((el) => {
            el.classList.add('origam--m-4')

            return getComputedStyle(el).marginTop
        })

        expect(painted).toBe(SCALE_4_PX)
    })
})
