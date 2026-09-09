import { expect, test } from '@playwright/test'

/**
 * SPEC — OrigamBottomNav, préfixe de tokens et alias de dépréciation (#384)
 *
 * ## Le défaut
 *
 * Le composant s'appelle `origam-bottom-nav`, mais ses 35 variables étaient
 * déclarées et lues sous `--origam-bottom-bar---*`. La grammaire du DS est
 * `--origam-{composant}---{propriété}` : un auteur de thème qui la suivait
 * et écrivait `--origam-bottom-nav---background` n'obtenait **rien**, sans
 * erreur ni avertissement.
 *
 * ## La réparation, et pourquoi elle ne casse personne
 *
 * Les tokens portent désormais le bon préfixe. L'ancien reste accepté une
 * version, non pas par un bloc d'alias — un token déclaré au `:root` empêche
 * tout `var()` d'atteindre son repli (CLAUDE.md, `@property`) — mais en
 * plaçant l'ancien nom EN TÊTE de la nouvelle déclaration :
 *
 *     --origam-bottom-nav---background: var(--origam-bottom-bar---background, <valeur>);
 *
 * L'ancien nom n'est déclaré nulle part, donc le repli est atteignable : si
 * personne ne le pose, la valeur réelle s'applique ; si un consommateur le
 * pose, il gagne. C'est exactement la sémantique attendue d'un alias de
 * dépréciation, et quatre thèmes de marque du site marketing (`apple`,
 * `ecom`, `editorial`, `material`) en dépendent aujourd'hui.
 *
 * ## Ce qui est mesuré
 *
 * 1. Le nouveau préfixe peint réellement (c'était le défaut).
 * 2. L'ancien préfixe continue de gagner (c'est la promesse de l'alias).
 *
 * ⛔ Playwright et non Vitest : jsdom ne résout jamais un `var()`, et toute
 * cette mécanique EST une chaîne de `var()`.
 */

const STORY_ID = 'components-stories-bottomnav-origambottomnav-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

test.describe('OrigamBottomNav — préfixe de tokens (#384)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${STORY_PATH}?variantId=${STORY_ID}-0`)
        await page.locator('iframe').first().waitFor({ state: 'attached' })
        await page.frameLocator('iframe').first().locator('.origam-bottom-nav').first()
            .waitFor({ state: 'visible' })
    })

    test('le préfixe --origam-bottom-nav peint, et --origam-bottom-bar reste honoré', async ({ page }) => {
        const nav = page.frameLocator('iframe').first().locator('.origam-bottom-nav').first()

        // ⛔ On mesure un CLONE, pas la barre de la story. La variante
        // « Design » passe une `color`/`bgColor`, et `useStateEffect` la
        // sort en `background-color` dans la règle `#id{…}` de `useStyle` —
        // une règle d'ID, qui bat la règle scopée portant le `var()`. Sur
        // l'élément d'origine on mesurerait donc toujours la couleur du
        // prop (`rgb(124, 58, 237)`), jamais le canal de token. Le clone
        // porte le même `data-v-*` (donc le même CSS scopé) mais pas le même
        // id, ce qui laisse le `var()` seul en piste.
        //
        // Construction, mutation et mesure dans UN SEUL evaluate, et on
        // laisse la transition finir : la barre transitionne `color`, donc
        // une lecture synchrone rendrait la valeur de départ (même piège que
        // main-surface-tokens.spec.ts).
        const measured = await nav.evaluate(async (el) => {
            const host = document.createElement('div')
            document.body.appendChild(host)

            const clone = el.cloneNode(true) as HTMLElement
            clone.removeAttribute('id')
            clone.removeAttribute('style')
            host.appendChild(clone)

            const settle = async () => {
                const ms = (parseFloat(getComputedStyle(clone).transitionDuration) || 0) * 1000 + 250
                await new Promise((resolve) => setTimeout(resolve, ms))
            }

            await settle()
            const before = getComputedStyle(clone).backgroundColor

            // 1. le nouveau préfixe, celui qui ne faisait rien avant
            clone.style.setProperty('--origam-bottom-nav---background', 'rgb(5, 55, 105)')
            await settle()
            const viaNewPrefix = getComputedStyle(clone).backgroundColor

            // 2. l'ancien préfixe, sur un état PROPRE — sinon on mesurerait
            //    la couleur littérale posée en 1, qui ne référence plus
            //    l'ancien nom et masquerait donc l'alias.
            clone.style.removeProperty('--origam-bottom-nav---background')
            clone.style.setProperty('--origam-bottom-bar---background', 'rgb(9, 99, 199)')
            await settle()
            const viaLegacyPrefix = getComputedStyle(clone).backgroundColor

            host.remove()

            return { before, viaNewPrefix, viaLegacyPrefix }
        })

        expect(measured.viaNewPrefix, JSON.stringify(measured)).toBe('rgb(5, 55, 105)')
        expect(measured.viaNewPrefix).not.toBe(measured.before)
        expect(measured.viaLegacyPrefix, JSON.stringify(measured)).toBe('rgb(9, 99, 199)')
    })
})
