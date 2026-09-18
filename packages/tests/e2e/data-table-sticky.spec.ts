import { expect, test } from '@playwright/test'

/**
 * SPEC — OrigamDataTable / OrigamDataTableHeaderCell, prop `sticky` (#840)
 *
 * ## Le défaut que ce spec encode
 *
 * `OrigamDataTableHeaderCell.vue` calculait le décalage d'empilement des
 * en-têtes sticky avec :
 *
 *     top: `calc(var(--origam-table-header-height) * ${y})`
 *
 * `--origam-table-header-height` n'était déclaré par AUCUNE feuille de
 * tokens (`grep -rn "table-header-height" packages/ds/src` ne trouvait que
 * cette ligne, en lecture) et le `var()` n'avait pas de repli.
 *
 * ⛔ Une référence `var()` irrésolvable n'échoue pas au parse, elle échoue au
 * COMPUTED-VALUE TIME : la déclaration `top: calc(…)` avait déjà gagné la
 * cascade, donc elle devenait `unset` — `auto` pour `top` — au lieu de céder
 * la place à une règle précédente. `position: sticky` avec `top: auto` ne
 * colle rien : l'élément suit le flux normal et défile avec le reste.
 *
 * ## Pourquoi Playwright et pas Vitest
 *
 * ⛔ Sous jsdom, `getComputedStyle` ne résout JAMAIS un `var()` — il renvoie
 * un `16px` fabriqué qui ressemble à une mesure. Le seul verdict valable ici
 * est un navigateur réel, contre le Histoire statique (voir CLAUDE.md racine,
 * "Running the full e2e suite").
 *
 * ## Le correctif
 *
 * `--origam-table__header-cell---height` (grammaire triple-tiret, famille
 * `table`, déjà utilisée deux lignes plus haut pour `padding-block` /
 * `border-bottom-width`), déclaré dans `light.css` / `dark.css` (+ jumeaux
 * SCSS) comme `calc()` sur le token `padding-block` EXISTANT et déjà
 * density-aware — donc jamais désynchronisé de lui — plus un repli
 * `44px` sur le `var()` lui-même (forme copiée sur `useRounded`).
 *
 * ⛔ Première mesure faite AVANT `document.fonts.ready` : 29.5 / 41.5 /
 * 53.5px, un contenu de 15.5px déduit par soustraction. Remesuré après
 * rechargement + attente des fonts (l'icône de tri vient de la fonte `mdi`,
 * chargée en asynchrone) : le contenu se stabilise à 18px, PAS 15.5 — un
 * écart de 2.5px reproductible sur les 3 rangs. Les valeurs ci-dessous sont
 * la seconde mesure, prise fonts chargées, dans le contexte RÉEL de
 * défilement (hauteur bornée sur `OrigamDataTable`, cf. piège suivant) :
 *
 * Valeurs mesurées en Chromium (Histoire statique, cette branche), story
 * `OrigamDataTable › Prop — sticky (scroll-then-stick)` :
 *
 *     compact       32px   (2 ×  6px padding-block + 2px border + 18px contenu)
 *     default       44px   (2 × 12px padding-block + 2px border + 18px contenu)
 *     comfortable   56px   (2 × 18px padding-block + 2px border + 18px contenu)
 *
 * ## Piège trouvé pendant la vérification — PAS de wrapper externe
 *
 * `OrigamTable.vue` pose `overflow-x: auto` sur `.origam-table__wrapper`
 * SANS jamais poser `overflow-y` explicitement. Par la règle CSS sur les
 * axes `overflow` dépareillés, le navigateur calcule alors `overflow-y:
 * auto` aussi — mesuré : `getComputedStyle(wrapper).overflowY === 'auto'`
 * même en dehors de `--fixed-header`. `.origam-table__wrapper` est donc
 * TOUJOURS l'ancre de défilement la plus proche pour `position: sticky`,
 * et un `<div style="overflow-y:auto">` posé PAR-DESSUS `<origam-data-table>`
 * ne l'atteint jamais : mesuré, le header suit alors le défilement au
 * pixel près (`after - before === scrollDelta`, aucun collage). Donner à
 * `OrigamDataTable` sa PROPRE `height`/`maxHeight` (comme `fixedHeader`)
 * rend `.origam-table__wrapper` réellement défilant et corrige le collage
 * (`after === before`, mesuré). Ce spec scrolle donc `.origam-table__wrapper`
 * directement — jamais un wrapper posé par le consommateur.
 *
 * ## A/B contre le commit parent
 *
 * Exécuté manuellement : ce spec échoue (top reste `auto`, le header défile)
 * sur `OrigamDataTableHeaderCell.vue` d'avant #840, et passe après. Voir le
 * rapport de livraison pour le détail des deux exécutions.
 *
 * ## Non vérifié par ce spec
 *
 * Le cas `y > 0` (plusieurs rangs d'en-tête, colonnes groupées via
 * `headers[].children`) — voir le rapport de livraison : la tentative de
 * construire un cas de test avec un en-tête groupé n'a pas produit de
 * deuxième `<tr>` dans le rendu (toutes les cellules ressortaient à
 * `rowspan="1"`/`colspan="1"` sur une seule ligne), ce qui a empêché toute
 * mesure du multiplicateur `y`. Ce point est distinct de #840 et n'est ni
 * corrigé ni classé ici.
 */

const STORY_ID = 'components-stories-datatable-origamdatatable-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID
const STICKY_VARIANT_TITLE = 'Prop — sticky (scroll-then-stick)'

const TABLE_SELECTOR = '[data-cy="data-table-sticky-container"]'
const WRAPPER_SELECTOR = `${TABLE_SELECTOR} .origam-table__wrapper`
const HEADER_CELL_SELECTOR = 'th.origam-data-table-header-cell'

test.describe('OrigamDataTable — prop sticky (#840)', () => {
    test.setTimeout(45000)

    test('le top calculé est une longueur réelle, jamais "auto"', async ({ page }) => {
        await page.goto(STORY_PATH, { waitUntil: 'domcontentloaded' })
        await page.getByText(STICKY_VARIANT_TITLE, { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const th = sandbox.locator(HEADER_CELL_SELECTOR).first()
        await expect(th).toBeVisible({ timeout: 8000 })

        const top = await th.evaluate((el) => getComputedStyle(el).top)
        expect(top).not.toBe('auto')
        expect(top).toBe('0px')
    })

    /*
     * ⛔ Le nom de token doit apparaître dans l'attribut `style` — pas dans
     * une règle de feuille — puisque `getFixedStyles` produit un `:style`
     * Vue inline. Une régression qui réintroduirait l'ancien nom orphelin
     * (`--origam-table-header-height`) romprait ce test avant même
     * d'atteindre la mesure de `top`.
     */
    test('le style inline référence le token déclaré, jamais l\'ancien nom orphelin', async ({ page }) => {
        await page.goto(STORY_PATH, { waitUntil: 'domcontentloaded' })
        await page.getByText(STICKY_VARIANT_TITLE, { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const th = sandbox.locator(HEADER_CELL_SELECTOR).first()
        await expect(th).toBeVisible({ timeout: 8000 })

        const styleAttr = await th.getAttribute('style')
        expect(styleAttr).toContain('--origam-table__header-cell---height')
        expect(styleAttr).not.toContain('--origam-table-header-height')
    })

    test('l\'en-tête reste collé au défilement du wrapper interne de la table (avant: défile hors champ)', async ({ page }) => {
        await page.goto(STORY_PATH, { waitUntil: 'domcontentloaded' })
        await page.getByText(STICKY_VARIANT_TITLE, { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // ⛔ PAS un wrapper posé par le consommateur — `.origam-table__wrapper`
        // lui-même, seul ancêtre de défilement que `position: sticky` voit
        // réellement (cf. en-tête du fichier).
        const wrapper = sandbox.locator(WRAPPER_SELECTOR)
        const th = sandbox.locator(HEADER_CELL_SELECTOR).first()
        await expect(th).toBeVisible({ timeout: 8000 })

        const before = await th.evaluate((el) => el.getBoundingClientRect().top)

        // Mutation ET mesure dans le MÊME evaluate — pas de reactivité Vue
        // en jeu ici (un scroll ne repasse pas par le render), mais on garde
        // la discipline "un seul tour" par cohérence avec le reste du dépôt.
        const after = await wrapper.evaluate((el) => {
            el.scrollTop = 150
            const th = el.querySelector('th.origam-data-table-header-cell') as HTMLElement
            return th.getBoundingClientRect().top
        })

        // Avant #840 : `after` ≈ `before - 150` (le header défile avec le
        // corps). Après #840 : `after` === `before` (il reste collé).
        expect(Math.abs(after - before)).toBeLessThan(1)
    })

    test('les 3 rangs de densité produisent 3 hauteurs de cellule distinctes et cohérentes avec padding-block', async ({ page }) => {
        await page.goto(STORY_PATH, { waitUntil: 'domcontentloaded' })
        await page.getByText(STICKY_VARIANT_TITLE, { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const th = sandbox.locator(HEADER_CELL_SELECTOR).first()
        await expect(th).toBeVisible({ timeout: 8000 })

        // ⛔ L'icône de tri vient de la fonte `mdi`, chargée en asynchrone —
        // mesurer avant qu'elle soit prête donne une hauteur de contenu
        // plus basse et FAUSSE (voir en-tête du fichier). `document.fonts.ready`
        // lève l'ambiguïté avant la toute première mesure.
        await th.evaluate((el) => el.ownerDocument.fonts.ready)

        const densityLabel = page.locator('label:has-text("Density") div.htw-cursor-pointer')

        const measure = async (optionLabel: string) => {
            await densityLabel.click()
            await page.getByText(optionLabel, { exact: true }).click()
            await page.waitForTimeout(200)
            return th.evaluate((el) => el.getBoundingClientRect().height)
        }

        const compact = await measure('Compact')
        const comfortable = await measure('Comfortable')
        const defaultHeight = await measure('Default')

        // Mesuré en Chromium sur cette branche, fonts chargées (voir en-tête du fichier).
        expect(compact).toBeCloseTo(32, 0)
        expect(defaultHeight).toBeCloseTo(44, 0)
        expect(comfortable).toBeCloseTo(56, 0)

        // Cohérence interne : chaque rang doit être strictement croissant.
        expect(compact).toBeLessThan(defaultHeight)
        expect(defaultHeight).toBeLessThan(comfortable)
    })
})
