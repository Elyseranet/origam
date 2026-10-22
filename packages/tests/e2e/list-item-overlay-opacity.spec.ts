import { expect, test, type Locator, type Page } from '@playwright/test'

/**
 * SPEC — OrigamListItem, opacité de l'overlay actif lue par jeton (#1230)
 *
 * L'overlay d'une ligne active valait `calc(0.12 * 1)` (0.16 au survol) en dur :
 * aucun thème ne pouvait régler ni supprimer le voile. Désormais
 * `--origam-list-item---overlay-opacity-active[-hover]`, déclarés à 0.12 / 0.16
 * dans les feuilles (rendu par défaut inchangé).
 *
 * ⛔ Sous jsdom `getComputedStyle` ne résout pas `var()` : mesure en navigateur.
 * La classe `--active` est posée dans UN `evaluate` (elle est liée à un
 * `computed`), avec `transition: none` sur l'overlay pour ne pas lire une
 * valeur en cours d'animation. Le jeton est posé par `addInitScript`, avant
 * le rendu, comme le ferait un thème.
 */

// Variant « Events - click » (index 4) : ligne `link`, donc cliquable, donc overlay rendu.
const STORY_ID = 'components-stories-list-origamlistitem-story-vue'
const url = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-4`

async function open (page: Page, tokens: string) {
    if (tokens) {
        await page.addInitScript((css) => {
            document.addEventListener('DOMContentLoaded', () => {
                const s = document.createElement('style')
                s.textContent = `html:root:root{${css}}`
                document.head.append(s)
            })
        }, tokens)
    }
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    const row = page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-list-item').first()
    await expect(row).toBeVisible({ timeout: 12000 })
    await row.evaluate((el) => {
        el.classList.add('origam-list-item--active')
        ;(el.querySelector('.origam-list-item__overlay') as HTMLElement).style.transition = 'none'
    })
    return row
}

const overlayOpacity = (row: Locator) => row.evaluate((el) =>
    getComputedStyle(el.querySelector('.origam-list-item__overlay') as HTMLElement).opacity)

test.describe('OrigamListItem — jeton d\'opacité de l\'overlay actif (#1230)', () => {
    test.setTimeout(45000)

    test('sans jeton posé : 0.12 au repos, 0.16 au survol (défaut inchangé)', async ({ page }) => {
        const row = await open(page, '')
        expect(await overlayOpacity(row)).toBe('0.12')
        await row.hover()
        expect(await overlayOpacity(row)).toBe('0.16')
    })

    test('jetons posés : l\'overlay suit, et 0 neutralise le voile', async ({ page }) => {
        const row = await open(page, '--origam-list-item---overlay-opacity-active:0;--origam-list-item---overlay-opacity-active-hover:0.5')
        expect(await overlayOpacity(row)).toBe('0')
        await row.hover()
        expect(await overlayOpacity(row)).toBe('0.5')
    })
})
