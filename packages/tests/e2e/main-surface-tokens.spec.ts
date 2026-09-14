import { expect, test } from '@playwright/test'

/**
 * SPEC — OrigamMain, canal de thème `background-color` / `color` (#414, critère C2)
 *
 * ## Le défaut que ce spec encode
 *
 * `light.css` (lignes 739-740) et `dark.css` (738-739), plus leurs jumeaux
 * `_light.scss` / `_dark.scss`, DÉCLARENT deux tokens de surface pour le
 * composant :
 *
 *     --origam-main---background-color: var(--origam-color__surface---default);
 *     --origam-main---color:            var(--origam-color__text---primary);
 *
 * `OrigamMain.vue` n'en lisait AUCUN des deux. Les 13 autres tokens
 * `--origam-main---*` sont bien consommés par le bloc `<style scoped>` ; ces
 * deux-là étaient orphelins. Conséquence concrète : un thème de marque qui
 * repeint la surface de la région principale via le canal prévu pour ça
 * n'obtenait rien, sans erreur ni avertissement — un token déclaré que
 * personne ne lit est silencieux par construction.
 *
 * ## Pourquoi Playwright et pas Vitest
 *
 * ⛔ Sous jsdom, `getComputedStyle` ne résout JAMAIS un `var()` (cf. CLAUDE.md,
 * #398) : il renvoie une valeur UA fabriquée qui ressemble à une mesure. Une
 * assertion unitaire sur `background-color` passerait au vert sur le code cassé
 * comme sur le code corrigé. Seul un vrai navigateur tranche.
 *
 * ## Ce qui est mesuré
 *
 * 1. Au repos, le `<main>` peint la valeur à laquelle le token résout — et
 *    pas `rgba(0, 0, 0, 0)` (transparent), qui était le rendu avant le
 *    correctif.
 * 2. Poser une autre valeur sur le token repeint réellement l'élément : c'est
 *    ce qu'un thème fait. La mutation ET la mesure tiennent dans UN SEUL
 *    `evaluate` — cf. le piège documenté d'`alert.spec.ts`, Vue re-patchant
 *    l'élément entre deux étapes.
 */

const STORY_ID = 'components-stories-main-origammain-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

test.describe('OrigamMain — les tokens de surface sont lus (#414)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${STORY_PATH}?variantId=${STORY_ID}-0`)
        await page.locator('iframe').first().waitFor({ state: 'attached' })
    })

    test('le token background-color est effectivement peint, pas transparent', async ({ page }) => {
        const frame = page.frameLocator('iframe').first()
        const main = frame.locator('.origam-main').first()
        await main.waitFor({ state: 'visible' })

        const measured = await main.evaluate((el) => {
            const styles = getComputedStyle(el)

            return {
                background: styles.backgroundColor,
                token: styles.getPropertyValue('--origam-main---background-color').trim(),
                color: styles.color,
                colorToken: styles.getPropertyValue('--origam-main---color').trim()
            }
        })

        // Le token est bien déclaré : c'est ce qui rendait le défaut invisible.
        expect(measured.token, 'le token background-color doit être déclaré').not.toBe('')
        expect(measured.colorToken, 'le token color doit être déclaré').not.toBe('')

        // …et il doit maintenant être PEINT.
        expect(measured.background, 'le <main> doit peindre son token de surface').not.toBe('rgba(0, 0, 0, 0)')
        expect(measured.background).toMatch(/^rgba?\(/)
        expect(measured.color).toMatch(/^rgba?\(/)
    })

    test('changer le token repeint la surface — le canal de thème est vivant', async ({ page }) => {
        const frame = page.frameLocator('iframe').first()
        const main = frame.locator('.origam-main').first()
        await main.waitFor({ state: 'visible' })

        // Mutation ET mesure dans le MÊME evaluate (cf. switch-density.spec.ts).
        //
        // ⛔ …mais la mesure doit ATTENDRE. `.origam-main` porte
        // `transition-property: all` avec `transition-duration: 0.2s` (mesuré),
        // et `getComputedStyle` renvoie la valeur EN COURS D'ANIMATION : une
        // lecture synchrone juste après la mutation rend encore la couleur de
        // DÉPART, à l'identique sur code cassé et sur code correct. Mesuré :
        // lecture synchrone `rgb(255,255,255)`, lecture à +1200 ms
        // `rgb(3,3,3)` sur la même mutation. Variante du piège
        // `alert.spec.ts` — même conclusion (ne pas scinder l'evaluate), mais
        // il faut en plus laisser la transition se terminer.
        const measured = await main.evaluate(async (el) => {
            const before = getComputedStyle(el).backgroundColor

            el.style.setProperty('--origam-main---background-color', 'rgb(7, 11, 13)')
            el.style.setProperty('--origam-main---color', 'rgb(23, 29, 31)')

            const settleMs = (parseFloat(getComputedStyle(el).transitionDuration) || 0) * 1000 + 250
            await new Promise((resolve) => setTimeout(resolve, settleMs))

            const after = getComputedStyle(el)

            return {
                before,
                settleMs,
                background: after.backgroundColor,
                color: after.color,
                token: after.getPropertyValue('--origam-main---background-color').trim()
            }
        })

        expect(measured.background, JSON.stringify(measured)).toBe('rgb(7, 11, 13)')
        expect(measured.color).toBe('rgb(23, 29, 31)')
        expect(measured.background).not.toBe(measured.before)
    })
})
