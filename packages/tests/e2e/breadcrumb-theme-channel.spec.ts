import { expect, test } from '@playwright/test'

/**
 * VÉRIFICATION #607 — Breadcrumb : le canal de thème est-il réellement ouvert ?
 *
 * Ce spec ne teste pas une prop, il teste une propriété du CASCADE. Avant la
 * correction, les trois composants Breadcrumb redéclaraient dans leur bloc
 * `<style scoped>` des tokens déjà déclarés par light.css. Un sélecteur scopé
 * `.origam-breadcrumb-item[data-v-hash]` vaut (0,2,0) et bat `:root` à (0,1,0) :
 * poser le token dans un thème ne changeait RIEN à l'écran.
 *
 * ⛔ DEUX PIÈGES DE MESURE, TOUS DEUX RENCONTRÉS EN ÉCRIVANT CE SPEC.
 *
 * 1. MUTER PUIS MESURER NE MARCHE PAS ICI. Dans l'iframe `__sandbox`, un
 *    élément DÉJÀ rendu ne voit pas ses styles recalculés après une mutation :
 *    `getComputedStyle` renvoie l'ancienne valeur, y compris pour un
 *    `el.style.backgroundColor` posé en ligne, alors qu'un `<div>` créé dans le
 *    même document répond correctement (contrôle négatif). Le thème est donc
 *    injecté par `addInitScript` AVANT que le document ne charge — c'est aussi
 *    le scénario réel d'un thème.
 *
 * 2. ⛔ UN ÉLÉMENT-SONDE FABRIQUÉ À LA MAIN DONNE UN FAUX VERT. Une première
 *    version créait un `<span class="origam-breadcrumb-item">` pour le mesurer.
 *    Sans l'attribut `data-v-<hash>`, le sélecteur scopé NE MATCHE PAS : la
 *    sonde ne voyait que `:root` et le test passait AUSSI sur le code d'avant
 *    la correction — il ne prouvait rien. Vérifié en A/B. On mesure donc
 *    l'élément RÉEL rendu par Vue, jamais une copie.
 *
 * La preuve est un A/B : ce spec échoue sur le code d'avant la correction et
 * passe après. Les valeurs attendues ci-dessous sont celles de light.css ;
 * avant la correction ce sont les littéraux du bloc scopé qui sortaient.
 */

const HOST = 'components-stories-breadcrumb-origambreadcrumb-story-vue'
const ITEM = 'components-stories-breadcrumb-origambreadcrumbitem-story-vue'
const SANDBOX = 'iframe[src*="__sandbox"]'

/** Thème de test : pose les tokens dé-shadowés au niveau `:root`. */
const THEME = `:root, [data-theme="light"] {
    --origam-breadcrumb---background: rgb(1, 2, 3);
    --origam-breadcrumb---color: rgb(4, 5, 6);
    --origam-breadcrumb---border-radius: 13px;
    --origam-breadcrumb-item---background: rgb(11, 22, 33);
    --origam-breadcrumb-item---border-radius: 9px;
    --origam-breadcrumb-item---text-decoration: underline;
    --origam-breadcrumb-item---opacity: 0.42;
    --origam-breadcrumb-divider---background: rgb(44, 55, 66);
    --origam-breadcrumb-divider---border-radius: 7px;
}`

/** Injecte le thème dans CHAQUE document (page + iframe) avant son chargement. */
async function useTheme (page: import('@playwright/test').Page) {
    await page.addInitScript((css: string) => {
        const inject = () => {
            const s = document.createElement('style')
            s.setAttribute('data-test-theme', '')
            s.textContent = css
            document.head.appendChild(s)
        }
        if (document.head) inject()
        else document.addEventListener('DOMContentLoaded', inject, { once: true })
    }, THEME)
}

/** Mesure des customs properties sur l'élément RÉEL (jamais une sonde). */
async function measure (page: import('@playwright/test').Page, url: string, sel: string, names: string[]) {
    await page.goto(url)
    const el = page.frameLocator(SANDBOX).locator(sel).first()
    await el.waitFor({ state: 'visible' })

    return el.evaluate((node: HTMLElement, names: string[]) => {
        const cs = getComputedStyle(node)
        const out: Record<string, string> = {}
        for (const n of names) out[n] = cs.getPropertyValue(n).trim()
        return out
    }, names)
}

const ROOT_NAMES = ['--origam-breadcrumb---background', '--origam-breadcrumb---color', '--origam-breadcrumb---border-radius']
const ITEM_NAMES = ['--origam-breadcrumb-item---background', '--origam-breadcrumb-item---border-radius', '--origam-breadcrumb-item---text-decoration', '--origam-breadcrumb-item---opacity']
const DIV_NAMES = ['--origam-breadcrumb-divider---background', '--origam-breadcrumb-divider---border-radius']

test.describe('Breadcrumb — canal de thème (#607)', () => {
    test('root : sans thème, la valeur vient de light.css (et non du bloc scopé)', async ({ page }) => {
        const m = await measure(page, `/stories/story/${HOST}?variantId=${HOST}-0`, '.origam-breadcrumb', ROOT_NAMES)

        // light.css : background = rgba(0, 0, 0, 0). Le bloc scopé disait
        // `transparent` — c'est la sérialisation qui distingue les deux sources.
        expect(m['--origam-breadcrumb---background']).toBe('rgba(0, 0, 0, 0)')
        expect(m['--origam-breadcrumb---border-radius']).toBe('0px')
    })

    test('root : sous thème, les trois tokens portent la valeur du thème', async ({ page }) => {
        await useTheme(page)
        const m = await measure(page, `/stories/story/${HOST}?variantId=${HOST}-0`, '.origam-breadcrumb', ROOT_NAMES)

        expect(m['--origam-breadcrumb---background']).toBe('rgb(1, 2, 3)')
        expect(m['--origam-breadcrumb---color']).toBe('rgb(4, 5, 6)')
        expect(m['--origam-breadcrumb---border-radius']).toBe('13px')
    })

    test('item : sous thème, les tokens dé-shadowés portent la valeur du thème', async ({ page }) => {
        await useTheme(page)
        const m = await measure(page, `/stories/story/${ITEM}?variantId=${ITEM}-0`, '.origam-breadcrumb-item', ITEM_NAMES)

        expect(m['--origam-breadcrumb-item---background']).toBe('rgb(11, 22, 33)')
        expect(m['--origam-breadcrumb-item---border-radius']).toBe('9px')
        expect(m['--origam-breadcrumb-item---text-decoration']).toBe('underline')
        expect(m['--origam-breadcrumb-item---opacity']).toBe('0.42')
    })

    test('divider : sous thème, les tokens dé-shadowés portent la valeur du thème', async ({ page }) => {
        await useTheme(page)
        const m = await measure(page, `/stories/story/${HOST}?variantId=${HOST}-0`, '.origam-breadcrumb-divider', DIV_NAMES)

        expect(m['--origam-breadcrumb-divider---background']).toBe('rgb(44, 55, 66)')
        expect(m['--origam-breadcrumb-divider---border-radius']).toBe('7px')
    })

    test('rounded : le modificateur rend toujours 24px (aucun pixel ne bouge)', async ({ page }) => {
        const m = await measure(page, `/stories/story/${HOST}?variantId=${HOST}-0`, '.origam-breadcrumb', ['--origam-breadcrumb---border-radius-rounded'])

        // Le token valait {radius.sm} (4px) et n'était JAMAIS lu ; le modificateur
        // codait en dur var(--origam-radius---2xl, 24px). Repointé sur 2xl puis
        // câblé : 24px reste 24px, et le crochet de theming existe enfin.
        expect(m['--origam-breadcrumb---border-radius-rounded']).toBe('24px')
    })

    test('rounded : le token est désormais thémable', async ({ page }) => {
        await page.addInitScript((css: string) => {
            const inject = () => {
                const s = document.createElement('style')
                s.textContent = css
                document.head.appendChild(s)
            }
            if (document.head) inject()
            else document.addEventListener('DOMContentLoaded', inject, { once: true })
        }, ':root, [data-theme="light"] { --origam-breadcrumb---border-radius-rounded: 5px; }')

        const m = await measure(page, `/stories/story/${HOST}?variantId=${HOST}-0`, '.origam-breadcrumb', ['--origam-breadcrumb---border-radius-rounded'])
        expect(m['--origam-breadcrumb---border-radius-rounded']).toBe('5px')
    })

    test('divider : la couleur vient du token secondary, plus de inherit', async ({ page }) => {
        const m = await measure(page, `/stories/story/${HOST}?variantId=${HOST}-0`, '.origam-breadcrumb-divider', ['--origam-breadcrumb-divider---color'])

        // ⛔ Lire une custom property rend sa VALEUR DÉCLARÉE (chaîne `var()`
        // résolue jusqu'au littéral), pas une couleur utilisée : on compare donc
        // `#525252`, pas `rgb(82, 82, 82)`.
        // {color.text.secondary} = neutral-600 = #525252. Avant : inherit → #171717.
        expect(m['--origam-breadcrumb-divider---color']).toBe('#525252')
    })

    test('item : la couleur vient du token primary, plus de inherit', async ({ page }) => {
        // ⛔ Mesuré depuis la story HOST, pas ITEM : la variante 0 d'ITEM pose
        // `color: 'primary'` EN PROP, donc `useStateEffect` écrit une déclaration
        // inline et on mesurerait la prop, pas la valeur de thème par défaut.
        const m = await measure(page, `/stories/story/${HOST}?variantId=${HOST}-0`, '.origam-breadcrumb-item', ['--origam-breadcrumb-item---color'])

        // {color.text.primary} = neutral-900 = #171717 — même couleur qu'avant au
        // repos, mais elle ne descend plus d'un ancêtre : elle vient du token.
        expect(m['--origam-breadcrumb-item---color']).toBe('#171717')
    })

    test('non-régression : sans thème, les valeurs par défaut sont inchangées', async ({ page }) => {
        const m = await measure(page, `/stories/story/${ITEM}?variantId=${ITEM}-0`, '.origam-breadcrumb-item', [
            ...ITEM_NAMES,
            '--origam-breadcrumb-item---transition-timing-function'
        ])

        // Exactement ce que rendait le code d'avant, primitives résolues.
        expect(m['--origam-breadcrumb-item---opacity']).toBe('1')
        expect(m['--origam-breadcrumb-item---border-radius']).toBe('0px')
        expect(m['--origam-breadcrumb-item---text-decoration']).toBe('none')
        expect(m['--origam-breadcrumb-item---transition-timing-function']).toBe('cubic-bezier(0.4, 0, 0.2, 1)')
    })
})
