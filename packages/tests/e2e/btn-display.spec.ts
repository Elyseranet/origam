import { expect, test } from '@playwright/test'
import { fillHstText } from './_support/histoire-controls'

/**
 * SPEC — OrigamBtn : le root doit être `inline-block`, pas `inline` (#933)
 *
 * ## Le défaut encodé ici
 *
 * `.origam-btn` ne déclarait AUCUN `display`. Le root retombait donc sur le
 * défaut UA du tag rendu. Une boîte `inline` ignore `height`, `min-width` et
 * le padding vertical, et s'étale sur toute sa ligne : mesuré en Chromium sur
 * `/why-origam`, le CTA « Build your own identity » (`<origam-btn
 * variant="text" href="/theming">` dans un `<p>`) rendait **984 × 15 px** au
 * lieu de **199 × 28 px**, et cela sous les 8 identités.
 *
 * Le composant n'avait l'air correct que par accident : sur 181 instances de
 * `.origam-btn` relevées sur 8 pages marketing, 178 ont un parent
 * `display: flex` ou `grid`, qui *blockifie* l'enfant.
 *
 * ## ⛔ Pourquoi ce spec passe par `href` — un `<button>` ne prouve RIEN ici
 *
 * Première version de ce spec : navigation sur le Variant Design, déplacement
 * du bouton dans un parent block, assertion `display === 'inline-block'`.
 * **Verte contre le commit parent, donc sans valeur.** Le Variant Design rend
 * un `<button>`, dont le défaut UA de Chromium est déjà `inline-block` : le
 * test mesurait le navigateur, pas la règle.
 *
 * Le seul tag qui distingue les deux mondes est celui que `useLink` produit
 * dès qu'on passe `href` — `<a>`, défaut UA `inline`
 * (`link.composable.ts:90`, `isLink ? 'a' : props.tag`). C'est aussi
 * exactement la forme du CTA cassé sur le site.
 *
 * ## ⛔ Pourquoi Playwright et pas Vitest
 *
 * Le `<style scoped>` d'un SFC n'est JAMAIS injecté dans le `document.head`
 * de jsdom : `getComputedStyle` y mesure un monde où la règle n'existe pas,
 * et rend la même chose sur le code cassé et sur le code corrigé.
 *
 * ## Le témoin positif
 *
 * Rejoué contre le commit parent, le premier test rend `display: inline` et
 * une largeur égale à celle du conteneur. Le second test, lui, est vert des
 * deux côtés **par construction** : c'est le témoin de NON-régression, il
 * affirme que les 178 instances saines ne bougent pas.
 *
 * ## Variants de la story OrigamBtn (index 0-based)
 *   0 → Design
 *   1 → State
 *   2 → Functional   ← ce spec (expose le contrôle « Href (tag=a) »)
 */

const STORY_ID = 'components-stories-btn-origambtn-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID
const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

const FUNCTIONAL_VARIANT = 2

/** Largeur du conteneur block dans lequel on replace le bouton. */
const BOX_WIDTH = 900

/**
 * Amène le Variant Functional à rendre un `<a class="origam-btn">`, puis
 * déplace l'élément RENDU PAR VUE dans un parent au `display` demandé et
 * mesure.
 *
 * ⛔ Le déplacement et la mesure tiennent dans un seul `evaluate` : déplacer
 * un nœud force une invalidation de layout complète, et rester dans le même
 * tour évite que Vue re-patche l'élément entre les deux (piège
 * d'`alert.spec.ts`, #553).
 *
 * ⛔ On déplace l'élément existant, on n'en fabrique pas un : une sonde
 * construite à la main ne porte pas le `data-v-<hash>` du scoped, donc le
 * sélecteur `.origam-btn[data-v-…]` ne la matcherait jamais — elle passerait
 * sur le code d'avant le correctif.
 */
async function measureInParent (page: import('@playwright/test').Page, parentDisplay: string) {
    return page.evaluate(({ parentDisplay, boxWidth }) => {
        const doc = document.querySelector('iframe')?.contentDocument
        if (!doc) throw new Error('SPEC CASSÉ : iframe sandbox introuvable')

        const btn = doc.querySelector('.origam-btn') as HTMLElement | null
        if (!btn) throw new Error('SPEC CASSÉ : aucun .origam-btn dans le sandbox')

        const box = doc.createElement('div')
        box.style.display = parentDisplay
        box.style.width = `${boxWidth}px`
        box.style.textAlign = 'start'
        btn.parentElement!.insertBefore(box, btn)
        box.appendChild(btn)

        const r = btn.getBoundingClientRect()

        return {
            tag: btn.tagName,
            display: getComputedStyle(btn).display,
            width: Math.round(r.width),
            boxWidth: Math.round(box.getBoundingClientRect().width),
            scoped: [...btn.attributes].some((a) => a.name.startsWith('data-v-'))
        }
    }, { parentDisplay, boxWidth: BOX_WIDTH })
}

test.describe('OrigamBtn — display du root (#933)', () => {
    test('rendu en `<a>` dans un parent BLOCK, le bouton reste à la largeur de son contenu', async ({ page }) => {
        await page.goto(variantUrl(FUNCTIONAL_VARIANT))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-btn')).toBeVisible()

        // `href` non vide ⇒ `useLink` rend un `<a>`, dont le défaut UA est
        // `inline` — le seul tag qui distingue le code cassé du code corrigé.
        await fillHstText(page, 'Href (tag=a)', '/theming')
        await expect(sandbox.locator('a.origam-btn')).toBeVisible()

        const m = await measureInParent(page, 'block')

        expect(m.tag, 'le spec doit mesurer un <a>, sinon il ne prouve rien').toBe('A')
        expect(m.scoped, 'le bouton mesuré doit porter le data-v- du scoped').toBe(true)
        expect(m.boxWidth).toBe(BOX_WIDTH)

        // Valeur absolue : c'est LA déclaration ajoutée par #933.
        expect(m.display).toBe('inline-block')

        // Une boîte inline aurait pris toute la ligne. Le libellé du Variant
        // Functional (« Button ») tient très largement sous la moitié.
        expect(m.width).toBeLessThan(BOX_WIDTH / 2)
    })

    test('dans un parent FLEX, la valeur calculée reste `block` — aucune instance existante ne bouge', async ({ page }) => {
        await page.goto(variantUrl(FUNCTIONAL_VARIANT))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-btn')).toBeVisible()

        await fillHstText(page, 'Href (tag=a)', '/theming')
        await expect(sandbox.locator('a.origam-btn')).toBeVisible()

        const m = await measureInParent(page, 'flex')

        // Blockification du flex item : `inline-block` → `block`, c'est-à-dire
        // la valeur que TOUTES les instances du catalogue calculaient déjà.
        expect(m.display).toBe('block')
    })
})
