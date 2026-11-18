import { expect, test, type Page } from '@playwright/test'

/**
 * #1222 — `variant="text"` actif doit pouvoir peindre un fond.
 *
 * Avant le correctif, `&--variant-text` posait `background-color: transparent !important`
 * sans bloc `--active` : aucun jeton ne pouvait peindre l'etat actif.
 * Mesure en vrai navigateur (jsdom ne resout pas `var()`), le jeton est injecte
 * AVANT le chargement du document (addInitScript, vaut aussi pour l'iframe Histoire).
 * Variant "State" (index 1) : deux Btn text, repos et actif.
 */
const STORY_ID = 'components-stories-btn-origambtn-story-vue'
const URL = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-1`
const TOKEN_VALUE = 'rgb(12, 34, 56)'

const btn = (page: Page, cy: string) =>
    page.frameLocator('iframe[src*="__sandbox"]').locator(`[data-cy="${cy}"]`)

const open = async (page: Page, withToken: boolean) => {
    if (withToken) {
        await page.addInitScript(`document.addEventListener('DOMContentLoaded', () => {
            const s = document.createElement('style')
            s.textContent = ':root{--origam-btn---background-color-text-active:${TOKEN_VALUE}}'
            document.head.appendChild(s)
        })`)
    }
    await page.goto(URL)
    await expect(btn(page, 'btn-state-text-active')).toBeVisible()
}

const read = (page: Page, cy: string) =>
    btn(page, cy).evaluate(el => getComputedStyle(el).backgroundColor)

test.describe('OrigamBtn variant=text — etat actif', () => {
    test('sans jeton : repos ET actif restent transparents (pas de regression)', async ({ page }) => {
        await open(page, false)
        await expect.poll(() => read(page, 'btn-state-text-rest')).toBe('rgba(0, 0, 0, 0)')
        await expect.poll(() => read(page, 'btn-state-text-active')).toBe('rgba(0, 0, 0, 0)')
    })

    test('avec le jeton : l\'actif peint la valeur du jeton, le repos reste transparent', async ({ page }) => {
        await open(page, true)
        // transition-property inclut `background` : on poll jusqu'a la fin de la transition.
        await expect.poll(() => read(page, 'btn-state-text-active')).toBe(TOKEN_VALUE)
        expect(await read(page, 'btn-state-text-rest')).toBe('rgba(0, 0, 0, 0)')
    })
})
