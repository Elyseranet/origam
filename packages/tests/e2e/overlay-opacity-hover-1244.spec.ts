import { expect, test, type Locator, type Page } from '@playwright/test'

/**
 * SPEC — opacité d'overlay au survol lue par jeton (#1244)
 *
 * Deux valeurs restaient en dur : OrigamListItem (ligne `link`) 0.08, et
 * OrigamExpansionPanelHeader 0.04. Désormais
 * `--origam-list-item---overlay-opacity-hover` et
 * `--origam-expansion-panel__header---overlay-opacity-hover`, déclarés à ces
 * mêmes valeurs dans les feuilles (rendu par défaut inchangé).
 *
 * ⛔ Sous jsdom `getComputedStyle` ne résout pas `var()` : mesure en navigateur.
 * Le jeton est posé par `addInitScript`, avant le rendu, comme le ferait un
 * thème ; `transition: none` sur l'overlay évite de lire une valeur en cours
 * d'animation.
 */

const LIST_ID = 'components-stories-list-origamlistitem-story-vue'
const HEADER_ID = 'components-stories-expansionpanel-origamexpansionpanelheader-story-vue'

interface Target { url: string, row: string, overlay: string, token: string, def: string }

const TARGETS: Record<string, Target> = {
    list: {
        url: `/stories/story/${LIST_ID}?variantId=${LIST_ID}-4`,
        row: '.origam-list-item',
        overlay: '.origam-list-item__overlay',
        token: '--origam-list-item---overlay-opacity-hover',
        def: '0.08'
    },
    header: {
        url: `/stories/story/${HEADER_ID}?variantId=${HEADER_ID}-0`,
        row: '.origam-expansion-panel-header',
        overlay: '.origam-expansion-panel-header__overlay',
        token: '--origam-expansion-panel__header---overlay-opacity-hover',
        def: '0.04'
    }
}

async function open (page: Page, t: Target, tokens: string) {
    if (tokens) {
        await page.addInitScript((css) => {
            document.addEventListener('DOMContentLoaded', () => {
                const s = document.createElement('style')
                s.textContent = `html:root:root{${css}}`
                document.head.append(s)
            })
        }, tokens)
    }
    await page.goto(t.url, { waitUntil: 'domcontentloaded' })
    const row = page.frameLocator('iframe[src*="__sandbox"]').locator(t.row).first()
    await expect(row).toBeVisible({ timeout: 12000 })
    await row.evaluate((el, sel) => {
        (el.querySelector(sel) as HTMLElement).style.transition = 'none'
    }, t.overlay)
    return row
}

const hoverOpacity = async (row: Locator, sel: string) => {
    await row.hover()
    return row.evaluate((el, s) => getComputedStyle(el.querySelector(s) as HTMLElement).opacity, sel)
}

for (const [name, t] of Object.entries(TARGETS)) {
    test.describe(`${name} — jeton d'opacité de l'overlay au survol (#1244)`, () => {
        test.setTimeout(45000)

        test(`sans jeton posé : ${t.def} au survol (défaut inchangé)`, async ({ page }) => {
            const row = await open(page, t, '')
            expect(await hoverOpacity(row, t.overlay)).toBe(t.def)
        })

        test('jeton posé : l\'overlay suit', async ({ page }) => {
            const row = await open(page, t, `${t.token}:0.5`)
            expect(await hoverOpacity(row, t.overlay)).toBe('0.5')
        })
    })
}
