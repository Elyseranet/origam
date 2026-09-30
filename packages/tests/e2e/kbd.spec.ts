import { expect, test } from '@playwright/test'

/**
 * OrigamKbd runtime probes — pattern canonique btn.spec.ts
 *
 * Variants dans OrigamKbd.story.vue (grep -nE '<Variant' …) :
 *   0 → Design      init: { variant: 'outlined', combination: ['⌘', 'S'] }
 *   1 → Functional  init: { text: '⌘', separator: '+' }
 *   2 → Slots - Default  (slot avec <origam-icon>)
 *   3 → Prop — border (VRT matrix)
 *   4 → Prop — variant (preset matrix)   surface de mesure ADR-005 lot 2
 *   5 → Default     init: { text: '⌘', variant: 'outlined', separator: '+' }
 *
 * ⛔ CES INDEX SONT ORDINAUX. Ajouter une Variant AVANT « Default » decale
 * son `variantId` : l'en-tete ci-dessus a porte `3 → Default` alors que le
 * code allait deja chercher `variantUrl(4)`. Recompter a chaque ajout.
 *
 * Structure du composant :
 *   <kbd class="origam-kbd origam-kbd--variant-{v} …">
 *     <!-- combination → -->
 *     <kbd class="origam-kbd__key">…</kbd>
 *     <span class="origam-kbd__separator" aria-hidden="true">…</span>
 *     <!-- text → texte direct -->
 *     <!-- slot → slot default -->
 *   </kbd>
 *
 * Non-testable headless :
 *   - Rendu de police JetBrains Mono / Fira Code (chargement de font async)
 *   - v-contrast directif (couleur contrastée calculée en runtime selon le thème)
 *
 * ⛔ A/B CONTRE LE COMMIT PARENT — mesuré, et le détail compte.
 * `E2E_STATIC=1`, port isolé, DS ramené à l'état pré-conversion (`git checkout
 * <parent> -- packages/ds`), stories reconstruites, même spec :
 *
 *   après conversion : 22 passed, $? = 0
 *   avant conversion : 2 failed / 20 passed, $? = 1
 *
 * Les DEUX qui rougissent sont celles qui décrivent le changement :
 *   - « échanger la classe de variant ne change RIEN » — avant, la classe
 *     PORTAIT le style, donc l'échanger changeait le fond ;
 *   - « sur une combinaison, un bg-color peint LES TOUCHES » — avant, il
 *     peignait l'enveloppe.
 *
 * ⚠️ Les trois autres assertions du bloc « Preset de variant » passent DES DEUX
 * CÔTÉS, et c'est voulu : ce sont des garde-fous de NON-RÉGRESSION (les trois
 * variants se distinguent, la surface d'une combinaison est le `__key`, un
 * bg-color bat le variant en forme simple). Elles épinglent ce qui ne doit pas
 * bouger ; elles ne discriminent pas la conversion, et ne sont pas présentées
 * comme telles.
 *
 * La matrice complète — 3 variants x 2 formes x 8 identités x 2 modes — n'est
 * pas ici : Histoire est épinglé `data-theme="light"` et n'enregistre aucun
 * thème de marque, donc l'axe des identités y est immesurable. Elle vit dans
 * `pnpm -F @origam/tests audit:kbd-preset`.
 */

const STORY_ID   = 'components-stories-kbd-origamkbd-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamKbd', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { variant: 'outlined', combination: ['⌘', 'S'] }             //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders the kbd root with BEM class origam-kbd', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
        })

        test('renders a <kbd> element', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            const tag = await kbd.evaluate(el => el.tagName.toLowerCase())
            expect(tag).toBe('kbd')
        })

        test('variant=outlined adds origam-kbd--variant-outlined class', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            await expect(kbd).toHaveClass(/origam-kbd--variant-outlined/)
        })

        test('combination prop adds origam-kbd--combination class', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            await expect(kbd).toHaveClass(/origam-kbd--combination/)
        })

        test('combination renders one nested <kbd class="origam-kbd__key"> per key', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            // combination: ['⌘', 'S'] → 2 keys
            const keys = kbd.locator('.origam-kbd__key')
            await expect(keys).toHaveCount(2)
            await expect(keys.nth(0)).toContainText('⌘')
            await expect(keys.nth(1)).toContainText('S')
        })

        test('combination renders (n-1) separators with aria-hidden', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            // 2 keys → 1 separator
            const separators = kbd.locator('.origam-kbd__separator')
            await expect(separators).toHaveCount(1)
            // separator is aria-hidden for assistive tech
            const ariaHidden = await separators.first().getAttribute('aria-hidden')
            expect(ariaHidden).toBe('true')
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 1)                                                 //
    // init: { text: '⌘', separator: '+' }                                 //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('text prop renders content directly inside <kbd>', async ({ page }) => {
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            await expect(kbd).toContainText('⌘')
        })

        test('text-only kbd has no origam-kbd--combination class', async ({ page }) => {
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            const cls = await kbd.evaluate(el => el.className)
            expect(cls).not.toContain('origam-kbd--combination')
        })

        test('text-only kbd contains no nested kbd__key elements', async ({ page }) => {
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            const keys = kbd.locator('.origam-kbd__key')
            await expect(keys).toHaveCount(0)
        })

        test('outlined variant (default) box-shadow is not none', async ({ page }) => {
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            // Default variant is 'outlined' per withDefaults.
            // The SCSS rule applies a box-shadow for outlined/filled — must be non-none.
            const shadow = await kbd.evaluate(el => getComputedStyle(el).boxShadow)
            expect(shadow).not.toBe('none')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - DEFAULT (index 2)                                            //
    // Renders <origam-icon> inside <origam-kbd>                           //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('slot content renders inside the kbd element', async ({ page }) => {
            await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
        })

        test('slot renders an origam-icon child (not raw text)', async ({ page }) => {
            await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            const icon = kbd.locator('.origam-icon').first()
            await expect(icon).toBeVisible()
        })

        test('slot kbd contains no origam-kbd__key children', async ({ page }) => {
            await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            // When slot is provided, combination branch is skipped
            const keys = kbd.locator('.origam-kbd__key')
            await expect(keys).toHaveCount(0)
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT / PLAYGROUND (index 3)                                       //
    // init: { text: '⌘', variant: 'outlined', separator: '+' }           //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('renders the kbd root', async ({ page }) => {
            await page.goto(variantUrl(5), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
        })

        // ⛔ Lot tokens (2026-09-10) — this assertion encoded the BUG: the
        // outlined variant used to ignore its 5 dormant per-variant tokens
        // (`--origam-kbd--outlined---background-color`,
        // `--origam-kbd__filled/tonal---background-color`, …, declared in
        // light.css/dark.css, never read anywhere in the SCSS) and fell back
        // to a hardcoded `var(--origam-color__surface---raised, #fff)`
        // instead — a solid fill for a variant whose OWN declared token is
        // `rgba(0, 0, 0, 0)` (transparent), the same convention `OrigamChip`
        // already uses for its outlined variant. Now that the SCSS reads the
        // real per-variant token, the default (`variant="outlined"`)
        // playground IS transparent by design — asserting the opposite was
        // asserting the pre-fix defect.
        test('variant=outlined resolves the transparent background token (by design)', async ({ page }) => {
            await page.goto(variantUrl(5), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            const bg = await kbd.evaluate(el => getComputedStyle(el).backgroundColor)
            expect(bg).toBe('rgba(0, 0, 0, 0)')
        })

        /*
         * ⛔ CE TEST A ETE INVERSE PAR ADR-005 LOT 2, ET C'EST LE POINT.
         *
         * Il pilotait `filled` en REMPLACANT la classe
         * `origam-kbd--variant-outlined` par `origam-kbd--variant-filled`, et
         * attendait que le fond change. Cela ne marchait que parce que le DS
         * livrait un bloc SCSS par variant : la classe PORTAIT le style.
         *
         * Le variant est desormais un preset de PROPS et le DS n'attache plus
         * aucune regle a cette classe — echanger la classe ne peut donc plus
         * rien changer. On assertait la mecanique que l'ADR existe pour
         * supprimer ; on asserte maintenant sa disparition, ce qui est
         * exactement le point (c) de la definition de fini d'ADR-005 D7 : « la
         * classe emise ne porte aucun style du DS ».
         *
         * Le vrai rendu de `filled` est mesure depuis la Variant dediee, en
         * passant le PROP — voir « Preset de variant » plus bas.
         */
        test('echanger la classe de variant ne change RIEN — le DS n\'y attache aucune regle', async ({ page }) => {
            await page.goto(variantUrl(5), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            // Mutation ET lecture dans le MEME `evaluate` : une classe liee a
            // un `computed` (kbdClasses) est re-patchee par Vue entre deux
            // aller-retours (piege `alert.spec.ts` du CLAUDE.md).
            const measured = await kbd.evaluate((el) => {
                const before = getComputedStyle(el).backgroundColor
                ;(el as HTMLElement).className = el.className
                        .replace('origam-kbd--variant-outlined', 'origam-kbd--variant-filled')
                return { before, after: getComputedStyle(el).backgroundColor }
            })
            expect(measured.after).toBe(measured.before)
        })

        test('has a non-zero font-size from the token', async ({ page }) => {
            await page.goto(variantUrl(5), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            const fontSize = await kbd.evaluate(el => parseFloat(getComputedStyle(el).fontSize))
            expect(fontSize).toBeGreaterThan(0)
        })

        test('variant=outlined produces a visible border', async ({ page }) => {
            await page.goto(variantUrl(5), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const kbd = sandbox.locator('.origam-kbd').first()
            await expect(kbd).toBeVisible({ timeout: 12000 })
            const borderWidth = await kbd.evaluate(el => parseFloat(getComputedStyle(el).borderTopWidth))
            expect(borderWidth).toBeGreaterThan(0)
        })
    })

    // ------------------------------------------------------------------ //
    // PRESET DE VARIANT (index 4) — ADR-005 lot 2                         //
    // ------------------------------------------------------------------ //

    /*
     * Les trois points de la definition de fini d'ADR-005 D7 :
     *   (a) le preset s'applique ;
     *   (b) un prop explicite le bat ;
     *   (c) la classe emise ne porte aucun style du DS.
     *
     * (c) est couvert par « echanger la classe ne change RIEN » plus haut.
     *
     * ⛔ Ces tests lisent le rendu par PROP, jamais en echangeant une classe.
     * La matrice complete — 3 variants x 2 formes x 8 identites x 2 modes,
     * avec le diff avant/apres — vit dans
     * `pnpm -F @origam/tests audit:kbd-preset`, parce que Histoire est
     * epingle `data-theme="light"` et n'enregistre aucun theme de marque :
     * l'axe des identites y est immesurable.
     */
    test.describe('Preset de variant', () => {
        const PRESET_VARIANT = 4

        test('(a) le preset peint chaque variant differemment, en forme SIMPLE', async ({ page }) => {
            await page.goto(variantUrl(PRESET_VARIANT), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="kbd-single-outlined"]')).toBeVisible({ timeout: 12000 })

            const read = async (cy: string) => sandbox.locator(`[data-cy="${cy}"]`)
                    .evaluate((el) => getComputedStyle(el).backgroundColor)

            const outlined = await read('kbd-single-outlined')
            const filled = await read('kbd-single-filled')
            const tonal = await read('kbd-single-tonal')

            // `outlined` est transparent PAR DESIGN — son token propre vaut
            // `rgba(0, 0, 0, 0)`, comme l'outlined de Chip.
            expect(outlined).toBe('rgba(0, 0, 0, 0)')
            expect(filled).not.toBe(outlined)
            expect(tonal).not.toBe(outlined)
            expect(tonal).not.toBe(filled)
        })

        test('(a) en forme COMBINAISON la surface est le __key, pas l\'enveloppe', async ({ page }) => {
            await page.goto(variantUrl(PRESET_VARIANT), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('[data-cy="kbd-combo-filled"]')
            await expect(host).toBeVisible({ timeout: 12000 })

            const measured = await host.evaluate((el) => {
                const key = el.querySelector('.origam-kbd__key') as HTMLElement
                return {
                    wrapper: getComputedStyle(el).backgroundColor,
                    key: getComputedStyle(key).backgroundColor,
                    keyBorder: parseFloat(getComputedStyle(key).borderTopWidth)
                }
            })

            // L'enveloppe ne peint pas ; la touche peint et garde sa bordure.
            expect(measured.wrapper).toBe('rgba(0, 0, 0, 0)')
            expect(measured.key).not.toBe('rgba(0, 0, 0, 0)')
            expect(measured.keyBorder).toBeGreaterThan(0)
        })

        test('(b) un bg-color du site d\'appel bat le preset', async ({ page }) => {
            await page.goto(variantUrl(PRESET_VARIANT), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="kbd-single-outlined"]')).toBeVisible({ timeout: 12000 })

            const presetOnly = await sandbox.locator('[data-cy="kbd-single-outlined"]')
                    .evaluate((el) => getComputedStyle(el).backgroundColor)
            const overridden = await sandbox.locator('[data-cy="kbd-override-single"]')
                    .evaluate((el) => getComputedStyle(el).backgroundColor)

            // Le preset d'outlined est transparent ; le prop doit peindre.
            expect(presetOnly).toBe('rgba(0, 0, 0, 0)')
            expect(overridden).not.toBe('rgba(0, 0, 0, 0)')
        })

        test('(b) sur une combinaison, un bg-color du site d\'appel peint LES TOUCHES', async ({ page }) => {
            await page.goto(variantUrl(PRESET_VARIANT), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const host = sandbox.locator('[data-cy="kbd-override-combo"]')
            await expect(host).toBeVisible({ timeout: 12000 })

            const measured = await host.evaluate((el) => {
                const key = el.querySelector('.origam-kbd__key') as HTMLElement
                return {
                    wrapper: getComputedStyle(el).backgroundColor,
                    key: getComputedStyle(key).backgroundColor
                }
            })

            const plainTonalKey = await sandbox.locator('[data-cy="kbd-combo-tonal"]').evaluate(
                (el) => getComputedStyle(el.querySelector('.origam-kbd__key') as HTMLElement).backgroundColor
            )

            expect(measured.wrapper).toBe('rgba(0, 0, 0, 0)')
            expect(measured.key).not.toBe(plainTonalKey)
        })
    })
})
