import { expect, test } from '@playwright/test'

/**
 * RECIPE — Pattern canonique pour les specs e2e origam / Histoire (réf. btn.spec.ts)
 *
 * ## 1. URL de navigation
 *
 *   Navigation DIRECTE avec le variantId en query param :
 *     await page.goto(STORY_PATH (= '/stories/story/' + STORY_ID) + '?variantId=' + VARIANT_ID)
 *
 *   Le variantId suit le pattern `<storyId>-<index>` où l'index correspond
 *   à la position du <Variant> dans le fichier story (0-based).
 *
 *   Pour trouver les vrais titres et leurs index :
 *     grep -E '<Variant' packages/stories/components/stories/{Name}/Origam{Name}.story.vue
 *   Puis vérifier l'ordre (0-based) → storyId-0, storyId-1, …
 *
 *   ⚠️  NE PAS utiliser waitForLoadState('networkidle') : Histoire garde un
 *   websocket HMR ouvert → networkidle ne résout JAMAIS → timeout garanti.
 *   Remplacer par :
 *     await expect(sandbox.locator('.{root-class}')).toBeVisible()
 *   ou en dernier recours : await page.waitForTimeout(ms).
 *
 * ## 2. Localisation du composant (pas de data-cy dans les stories canoniques)
 *
 *   L'iframe sandbox n'est présente qu'APRÈS le click ou la navigation avec variantId.
 *   Localiser via le sélecteur de classe BEM du composant :
 *     const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
 *     const btn     = sandbox.locator('.origam-btn').first()
 *
 *   Pour des éléments enfants :
 *     sandbox.locator('.origam-btn__prepend')
 *     sandbox.locator('.origam-btn__append')
 *     sandbox.locator('.origam-progress--circular')
 *
 * ## 3. Titres réels des Variants (Btn — état au 2026-06-28)
 *
 *   Index → Titre (tel que dans la sidebar Histoire)
 *     0  → Design         (props visuelles : variant, color, bgColor, size, …)
 *     1  → State          (hover / active surface)
 *     2  → Functional     (disabled, readonly, loading, block, slim, stacked, …)
 *     3  → Prop — color & bgColor
 *     4  → Prop — loading (interactive)
 *     5  → Events - click
 *     6  → Events - click:prepend
 *     7  → Events - click:append
 *     8  → Events - group:selected
 *     9  → Slots - Default
 *    10  → Slots - Prepend
 *    11  → Slots - Append
 *    12  → Slots - Loader
 *    13  → Slots - Wrapper
 *    14  → Default (playground)
 *    15  → Prop — variant (VRT matrix)
 *    16  → Prop — variant override (bgColor beats the preset) — ADR-005
 *           ticket #23, appended AFTER the VRT matrix on purpose (same
 *           index-stability constraint, see VRT.md).
 *
 *   ⚠️  Les titres StoryGroup visibles dans les #controls (Color, Sizing, Shape…)
 *   sont des fieldsets DANS la sidebar — PAS des Variants séparés. Ne pas les cibler.
 *
 * ## 4. Init-state par défaut
 *
 *   Design     : { color: 'white', bgColor: 'primary', text: 'Button' }
 *               → classes: origam-btn origam--bg-primary origam--text-md
 *               → background-color: rgb(124, 58, 237)
 *
 *   State      : { bgColor: 'primary' }
 *               → classes: origam-btn origam--bg-primary
 *
 *   Functional : { color: 'primary', enabled: false, kind: 'bool', … }
 *               → classes: origam-btn origam--color-primary
 *               → loading=false, disabled=false au départ
 *
 * ## 5. Contrôles Histoire (pilotage headless)
 *
 *   Les contrôles (HstSelect, HstCheckbox, HstText) sont dans le panneau droit
 *   de la fenêtre Histoire principale (pas dans le sandbox iframe).
 *   Pattern pour changer une valeur :
 *     await page.locator('[class*="histoire"] select, .htw-select').selectOption('value')
 *   En pratique c'est fragile — préférer tester l'init-state uniquement et
 *   naviguer vers un Variant dédié pour chaque état à couvrir.
 */

const STORY_ID   = 'components-stories-btn-origambtn-story-vue'
// Histoire serves under /stories/ (histoire.config.js base: '/stories/').
// Use absolute path /stories/story/... which resolves against origin only.
const STORY_PATH = '/stories/story/' + STORY_ID

/** Raccourci : construit l'URL d'un Variant par son index. */
const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

/**
 * Certaines variantes (en particulier les variantes Events avec icônes MDI)
 * déclenchent un chargement de polices asynchrone qui peut prendre 10-15s
 * sur un navigateur headless à froid. Le timeout global Playwright par défaut
 * (30s) est insuffisant pour ces variantes + le overhead de navigation.
 * On fixe le timeout global de ce fichier à 45s.
 */
test.describe('OrigamBtn', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { color: 'white', bgColor: 'primary', text: 'Button' }        //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders the btn root with BEM class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
        })

        test('bgColor=primary applies the utility class origam--bg-primary', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            await expect(btn).toHaveClass(/origam--bg-primary/)
        })

        test('bgColor=primary produces a non-transparent background from the token', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            const bg = await btn.evaluate(el => getComputedStyle(el).backgroundColor)
            // Must NOT be transparent or the browser default (gray).
            // The primary token resolves to a non-transparent color.
            expect(bg).not.toBe('rgba(0, 0, 0, 0)')
            expect(bg).not.toBe('transparent')
            // Background must come from the token — not an inline hex.
            // rgb(124, 58, 237) is the origam primary at the time of writing;
            // we assert it is NOT gray (230,230,230) which is the CSS fallback.
            expect(bg).not.toBe('rgb(230, 230, 230)')
        })

        test('text prop renders the label inside the btn', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            await expect(btn.locator('.origam-btn__content')).toContainText('Button')
        })

        test('default size class is applied (size-default)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            await expect(btn).toHaveClass(/origam-btn--size-default/)
        })

        test('default density class is applied (density-default)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            await expect(btn).toHaveClass(/origam-btn--density-default/)
        })
    })

    // ------------------------------------------------------------------ //
    // STATE (index 1)                                                      //
    // init: { bgColor: 'primary' }                                        //
    // ------------------------------------------------------------------ //

    test.describe('State', () => {
        test('renders with bgColor=primary in resting state', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            await expect(btn).toHaveClass(/origam--bg-primary/)
        })

        test('resting state: overlay opacity is 0 (no hover/active)', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            const overlayOpacity = await btn.locator('.origam-btn__overlay').evaluate(
                el => getComputedStyle(el).opacity
            )
            // In resting state the overlay has opacity 0
            expect(parseFloat(overlayOpacity)).toBe(0)
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 2)                                                 //
    // init: { color: 'primary', enabled: false (loading=false) }          //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('renders btn with color=primary utility class', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            await expect(btn).toHaveClass(/origam--color-primary/)
        })

        test('enabled=false: no loading class in initial state', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            const classes = await btn.getAttribute('class')
            expect(classes).not.toContain('origam-btn--loading')
        })

        test('disabled=false: pointer-events are auto in initial state', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            const ptrEvents = await btn.evaluate(el => getComputedStyle(el).pointerEvents)
            expect(ptrEvents).toBe('auto')
        })

        test('SCSS --disabled: adding the class disables pointer events', async ({ page }) => {
            // The SCSS rule `.origam-btn--disabled { pointer-events: none }` is scoped.
            // We inject the class programmatically into the sandbox DOM to verify the
            // rule is compiled and applied — this tests the stylesheet, not the prop logic.
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            const ptrEvents = await btn.evaluate(el => {
                el.classList.add('origam-btn--disabled')
                return getComputedStyle(el).pointerEvents
            })
            expect(ptrEvents).toBe('none')
        })

        test('SCSS --loading: adding the class disables pointer events', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            const ptrEvents = await btn.evaluate(el => {
                el.classList.add('origam-btn--loading')
                return getComputedStyle(el).pointerEvents
            })
            expect(ptrEvents).toBe('none')
        })

        test('SCSS --block: adding the class makes btn flex full-width', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            const display = await btn.evaluate(el => {
                el.classList.add('origam-btn--block')
                return getComputedStyle(el).display
            })
            expect(display).toBe('flex')
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS (indexes 5–8)                                                 //
    // ------------------------------------------------------------------ //

    test.describe('Events - click', () => {
        test('renders a clickable button labelled "Click me"', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            await expect(btn).toContainText('Click me')
        })

        test('click does not throw (logEvent side-effect is not assertable headlessly)', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            // Three clicks — no error = success. logEvent() is an Histoire-internal
            // side-effect that cannot be observed from the outer page.
            await btn.click()
            await btn.click()
            await btn.click()
        })
    })

    test.describe('Events - click:prepend', () => {
        test('renders btn with a prepend slot area', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            // Prepend slot wrapper must be present (icon rendered inside)
            await expect(btn.locator('.origam-btn__prepend')).toBeAttached()
        })

        test('click on prepend area does not throw', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const prepend = sandbox.locator('.origam-btn__prepend').first()
            // Variant 6 with MDI icon can take up to ~15s on cold Playwright context
            await expect(prepend).toBeVisible({ timeout: 20000 })
            await prepend.click()
        })
    })

    test.describe('Events - click:append', () => {
        // Variant 7 (Events - click:append) loads the MDI ARROW_RIGHT icon asynchronously.
        // In a cold Playwright context, the sandbox takes ~10-12s to mount all icon fonts
        // and render the component. We use a 20s timeout for this variant only.
        test('renders btn with an append slot area', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 20000 })
            await expect(btn.locator('.origam-btn__append')).toBeAttached()
        })

        test('click on append area does not throw', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const append = sandbox.locator('.origam-btn__append').first()
            await expect(append).toBeVisible({ timeout: 20000 })
            await append.click()
        })
    })

    test.describe('Events - group:selected', () => {
        test('renders a standard btn (group context not available standalone)', async ({ page }) => {
            await page.goto(variantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS (indexes 9–13)                                                 //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('default slot renders custom content ("Custom content")', async ({ page }) => {
            await page.goto(variantUrl(9))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            // Story renders: <strong>Custom</strong> content
            await expect(btn).toContainText('Custom')
            await expect(btn).toContainText('content')
        })
    })

    test.describe('Slots - Prepend', () => {
        test('prepend slot renders an origam-icon inside the prepend area', async ({ page }) => {
            await page.goto(variantUrl(10))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            await expect(btn.locator('.origam-btn__prepend .origam-icon')).toBeAttached()
        })
    })

    test.describe('Slots - Append', () => {
        test('append slot renders an origam-icon inside the append area', async ({ page }) => {
            await page.goto(variantUrl(11))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            await expect(btn.locator('.origam-btn__append .origam-icon')).toBeAttached()
        })
    })

    test.describe('Slots - Loader', () => {
        /**
         * Story: <origam-btn loading text="Button"><template #loader><span>Loading...</span></template></origam-btn>
         *
         * The `#loader` slot is ONLY rendered when loading kind = 'skeleton'
         * (via `isSkeletonLoading`). For the default `loading=true` (boolean → kind='circular'),
         * the component renders a circular overlay progress instead — the slot content
         * is NOT mounted. The circular progress lives as `.origam-btn__progress` outside
         * the OrigamLoader, not inside the slot.
         *
         * Therefore: the custom "Loading..." span is NOT visible for this story variant.
         * The test asserts the loading state via the circular progress.
         */
        test('loading=true mounts a circular progress overlay', async ({ page }) => {
            await page.goto(variantUrl(12))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            await expect(btn).toHaveClass(/origam-btn--loading/)
            await expect(btn).toHaveClass(/origam-btn--loader-circular/)
            await expect(btn.locator('.origam-progress--circular')).toBeAttached()
        })

        test('loading=true: pointer-events are disabled on the btn', async ({ page }) => {
            await page.goto(variantUrl(12))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            const ptrEvents = await btn.evaluate(el => getComputedStyle(el).pointerEvents)
            expect(ptrEvents).toBe('none')
        })
    })

    test.describe('Slots - Wrapper', () => {
        test('wrapper slot replaces btn inner content with custom markup', async ({ page }) => {
            await page.goto(variantUrl(13))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            // Story renders: <span>Wrapper</span><strong>content</strong>
            await expect(btn).toContainText('Wrapper')
            await expect(btn).toContainText('content')
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT — playground (index 14)                                      //
    // init: { color: 'primary', text: 'Button' }                          //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('renders a btn with color=primary and text "Button"', async ({ page }) => {
            await page.goto(variantUrl(14))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            await expect(btn).toHaveClass(/origam--color-primary/)
            await expect(btn).toContainText('Button')
        })

        test('is a native <button> element by default (tag=button)', async ({ page }) => {
            await page.goto(variantUrl(14))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            const tag = await btn.evaluate(el => el.tagName.toLowerCase())
            expect(tag).toBe('button')
        })
    })

    // ------------------------------------------------------------------ //
    // ROUNDED — SCSS asymmetric corner shapes                              //
    // Tested via class injection against the Design variant.              //
    // Note: the story does not have a dedicated Rounded variant; the      //
    // "Rounded" control lives in Design's #controls panel. We verify the  //
    // SCSS rules by injecting the modifier classes programmatically.      //
    // ------------------------------------------------------------------ //

    test.describe('Rounded SCSS rules', () => {
        test('--rounded-shaped: TL+BR rounded, TR+BL = 0', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            const radii = await btn.evaluate(el => {
                el.classList.add('origam-btn--rounded-shaped')
                const cs = getComputedStyle(el)
                return {
                    tl: cs.borderTopLeftRadius,
                    tr: cs.borderTopRightRadius,
                    br: cs.borderBottomRightRadius,
                    bl: cs.borderBottomLeftRadius
                }
            })
            expect(radii.tl, 'top-left should be rounded').not.toBe('0px')
            expect(radii.br, 'bottom-right should be rounded').not.toBe('0px')
            expect(radii.tr, 'top-right should be 0').toBe('0px')
            expect(radii.bl, 'bottom-left should be 0').toBe('0px')
            expect(radii.tl).toBe(radii.br)
        })

        test('--rounded-shaped-invert: TR+BL rounded, TL+BR = 0', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 12000 })
            const radii = await btn.evaluate(el => {
                el.classList.add('origam-btn--rounded-shaped-invert')
                const cs = getComputedStyle(el)
                return {
                    tl: cs.borderTopLeftRadius,
                    tr: cs.borderTopRightRadius,
                    br: cs.borderBottomRightRadius,
                    bl: cs.borderBottomLeftRadius
                }
            })
            expect(radii.tr, 'top-right should be rounded').not.toBe('0px')
            expect(radii.bl, 'bottom-left should be rounded').not.toBe('0px')
            expect(radii.tl, 'top-left should be 0').toBe('0px')
            expect(radii.br, 'bottom-right should be 0').toBe('0px')
            expect(radii.tr).toBe(radii.bl)
        })
    })

    // ------------------------------------------------------------------ //
    // VARIANT = PROPS PRESET (ADR-005, ticket #23)                         //
    //                                                                      //
    // These three tests used to LOCK the pre-migration bug: they asserted //
    // `background-color: transparent !important` was present in the      //
    // compiled stylesheet for `.origam-btn--variant-outlined` /           //
    // `--variant-text`. That is exactly the mechanism that made a themed  //
    // `outlined` button ignore any `bgColor` (docs/internal/adr-005-      //
    // variant-as-props-preset.md, "The symptom that motivated the         //
    // audit"). `variant` is now a PROPS PRESET resolved by `useDefaults`  //
    // as its WEAKEST tier (ADR-005 Q2) — the DS ships ZERO CSS rule       //
    // matching `--variant-*` (D3). These tests assert the NEW contract:   //
    // (a) no such CSS rule exists at all, (b) the preset still applies    //
    // its OWN props (e.g. `outlined`'s border) when nothing overrides     //
    // them, (c) an explicit `bgColor` at the call site paints regardless  //
    // of `variant` — the ticket's headline fix.                           //
    // ------------------------------------------------------------------ //

    test.describe('Variant = props preset (ADR-005)', () => {
        test('--variant-outlined / --variant-text: the DS ships ZERO CSS rule for either class', async ({ page }) => {
            // D3: the class survives purely as a consumer override hook —
            // asserted here by proving NO stylesheet rule in the whole
            // document targets it, not even for an unrelated property.
            await page.goto(variantUrl(15))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const matrix = sandbox.locator('[data-cy="btn-variant-matrix"]')
            await expect(matrix).toBeVisible({ timeout: 12000 })
            const btn = sandbox.locator('[data-cy="btn-variant-outlined"]')
            const found = await btn.evaluate(el => {
                const targets = ['.origam-btn--variant-outlined', '.origam-btn--variant-text']
                for (const sheet of document.styleSheets) {
                    try {
                        for (const rule of sheet.cssRules) {
                            const selector = (rule as CSSStyleRule).selectorText
                            if (selector && targets.some(t => selector.includes(t))) {
                                return selector
                            }
                        }
                    } catch { /* unreadable cross-origin stylesheet — skip */ }
                }
                return null
            })
            expect(found, 'no CSS rule should target --variant-outlined or --variant-text').toBeNull()
        })

        test('variant="outlined" alone (no bgColor): the preset still applies a solid border', async ({ page }) => {
            // The preset's OWN props (border / borderStyle / borderColor)
            // still take effect via `useDefaults`'s weakest tier when
            // nothing overrides them — this is NOT the bug, `outlined`
            // keeping its border with no bgColor set is correct.
            await page.goto(variantUrl(15))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('[data-cy="btn-variant-outlined"]')
            await expect(btn).toBeVisible({ timeout: 12000 })
            const borderStyle = await btn.evaluate(el => getComputedStyle(el).borderTopStyle)
            expect(borderStyle).toBe('solid')
        })

        test('variant="outlined" + bgColor="primary": bgColor paints (ADR-005 Q2 — the headline fix)', async ({ page }) => {
            // THE bug this ticket fixes: pre-migration, `&--variant-outlined
            // { background-color: transparent !important }` swallowed any
            // `bgColor` unconditionally. `bgColor` is now a call-site prop
            // (tier 1) and the preset's `bgColor: 'transparent'` is tier 3
            // (weakest) — tier 1 wins, so this paints.
            await page.goto(variantUrl(16))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const matrix = sandbox.locator('[data-cy="btn-variant-override-matrix"]')
            await expect(matrix).toBeVisible({ timeout: 12000 })

            const only   = sandbox.locator('[data-cy="btn-ovr-outlined-only"]')
            const withBg = sandbox.locator('[data-cy="btn-ovr-outlined-bgcolor"]')
            await expect(only).toBeVisible()
            await expect(withBg).toBeVisible()

            const bgOnly   = await only.evaluate(el => getComputedStyle(el).backgroundColor)
            const bgWithBg = await withBg.evaluate(el => getComputedStyle(el).backgroundColor)

            // The "…+bgColor" button paints an actually different, opaque
            // colour from its "…only" sibling — the preset's transparent no
            // longer wins unconditionally.
            expect(bgWithBg).not.toBe(bgOnly)
            expect(bgWithBg).not.toBe('rgba(0, 0, 0, 0)')
            expect(bgWithBg).not.toBe('transparent')
            // Matches the origam primary token used elsewhere in this file
            // (see the recipe comment's "Design" init-state note).
            expect(bgWithBg).toBe('rgb(124, 58, 237)')
        })

        test('variant="text" + bgColor="primary": bgColor paints (same fix, different preset)', async ({ page }) => {
            await page.goto(variantUrl(16))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const matrix = sandbox.locator('[data-cy="btn-variant-override-matrix"]')
            await expect(matrix).toBeVisible({ timeout: 12000 })

            const only   = sandbox.locator('[data-cy="btn-ovr-text-only"]')
            const withBg = sandbox.locator('[data-cy="btn-ovr-text-bgcolor"]')
            await expect(only).toBeVisible()
            await expect(withBg).toBeVisible()

            const bgOnly   = await only.evaluate(el => getComputedStyle(el).backgroundColor)
            const bgWithBg = await withBg.evaluate(el => getComputedStyle(el).backgroundColor)

            expect(bgWithBg).not.toBe(bgOnly)
            expect(bgWithBg).toBe('rgb(124, 58, 237)')
        })
    })
})
