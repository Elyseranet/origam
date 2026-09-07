import { expect, test, type Page } from '@playwright/test'

import { selectHstOption } from './_support/histoire-controls'

/**
 * #550 (critere C1) — verdict NAVIGATEUR sur deux props qui etaient
 * declarees et jamais lues.
 *
 * Les tests unitaires jsdom du meme lot (`TU/components/Audio/audio-tag.spec.ts`,
 * `TU/components/DataTable/data-table-rows-dead-props.spec.ts`) prouvent que la
 * balise change et que la classe / la declaration inline sont EMISES. Ils ne
 * peuvent pas prouver que la couleur est effectivement PEINTE : sous jsdom,
 * `getComputedStyle` ne resout jamais un `var()` et rend un defaut fabrique
 * (cf. CLAUDE.md #398). Seul un vrai navigateur tranche — c'est l'objet de ce
 * spec.
 *
 * Les Variants sont atteints par leur titre, jamais par le selecteur HstSelect
 * du picker (DOM custom, fragile).
 */

const AUDIO_STORY = '/stories/story/components-stories-audio-origamaudio-story-vue'
const ROWS_STORY = '/stories/story/components-stories-datatable-origamdatatablerows-story-vue'

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, story: string, title: string): Promise<void> => {
    await page.goto(story)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(400)
}

test.describe('OrigamAudio — la prop `tag` change la balise racine (#550)', () => {
    test('le controle Tag de la Variant Functional substitue la balise', async ({ page }) => {
        await openVariant(page, AUDIO_STORY, 'Functional')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="origam-audio"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        // Avant : `<article>` en dur dans le template, le controle ne
        // pouvait rien changer.
        expect(await host.evaluate((node) => node.tagName)).toBe('ARTICLE')

        await selectHstOption(page, 'Tag', 'div')
        await page.waitForTimeout(400)

        const after = sandbox.locator('[data-cy="origam-audio"]').first()
        await expect(after).toBeVisible({ timeout: 8000 })
        expect(await after.evaluate((node) => node.tagName)).toBe('DIV')
    })
})

test.describe('OrigamDataTableRows — la prop `color` peint la ligne de chargement (#550)', () => {
    test('deux intents donnent deux couleurs calculees distinctes', async ({ page }) => {
        await openVariant(page, ROWS_STORY, 'Design')
        const sandbox = sandboxOf(page)

        const row = sandbox.locator('.origam-data-table-rows--loading').first()
        await expect(row).toBeVisible({ timeout: 8000 })

        // ⛔ La mutation du controle et la lecture ne peuvent pas etre
        // separees par un `toHaveCSS` : celui-ci sonde pendant 5 s et
        // finirait par mesurer un rendu que Vue a re-patche entre-temps
        // (cf. CLAUDE.md, « le motif alert.spec.ts »). On lit ici APRES
        // que le controle a fini de s'appliquer, en une seule evaluation.
        const readColor = () =>
            sandbox
                .locator('.origam-data-table-rows--loading')
                .first()
                .evaluate((node) => getComputedStyle(node as HTMLElement).color)

        // La Variant demarre sur `color: 'primary'`.
        const primary = await readColor()

        await selectHstOption(page, 'Loader & empty row color', 'Success')
        await page.waitForTimeout(500)
        const success = await readColor()

        // Chacune doit etre une couleur reelle, pas une chaine vide.
        expect(primary).toMatch(/^rgba?\(/)
        expect(success).toMatch(/^rgba?\(/)

        // Le test de mutation vit ici : avant le cablage, la prop
        // n'atteignait aucune declaration et les deux lectures etaient
        // rigoureusement identiques.
        expect(primary).not.toBe(success)
    })
})
