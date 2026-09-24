import { expect, test } from '@playwright/test'

/**
 * SPEC — OrigamSwitch (pattern canonique btn.spec.ts)
 *
 * ## Index des Variants (0-based, ordre fichier story)
 *   0  → Design      (color, bgColor, size, density, rounded, elevation, inset, border, label)
 *   1  → State       (hover / active surface)
 *   2  → Functional  (disabled, readonly, loading, indeterminate, required, multiple, inline, error)
 *   3  → Events - update:modelValue   (data-cy="switch-emit-update")
 *   4  → Events - update:focused      (data-cy="switch-emit-focused")
 *   5  → Events - update:indeterminate (data-cy="switch-emit-indeterminate")
 *   6  → Events - click:label         (data-cy="switch-emit-click-label")
 *   7  → Events - focus / blur        (data-cy="switch-emit-focus")
 *   8  → Slots - Loader               (data-cy="switch-slot-loader")
 *   9  → Slots - Track False          (data-cy="switch-slot-track-false")
 *  10  → Slots - Track True           (data-cy="switch-slot-track")
 *  11  → Default (Playground)         (data-cy="switch-playground")
 *
 * ## Composants BEM
 *   Root:  .origam-switch  (appliqué sur .origam-input par switchClasses)
 *   Track: .origam-switch-track  (sous-composant OrigamSwitchTrack — PAS __track)
 *   Thumb: .origam-switch__thumb
 *   Skeleton: .origam-switch__skeleton  (data-cy="origam-switch-skeleton" dans le composant)
 *
 * ## Thumb background
 *   Blanc par défaut (var --origam-switch__thumb---background-color = rgb(255,255,255)).
 *   Coloré quand .origam-selection-control__wrapper porte une classe .origam--color-* :
 *   le SCSS cible « .origam-selection-control__wrapper.origam--color-* .origam-switch__thumb »
 *   et applique background-color: currentColor.
 *
 * ## Track background
 *   #919 — le repli SCSS `rgb(163,163,163)` ne reflétait déjà pas la valeur réelle
 *   AVANT ce correctif (le token résolvait `surface---disabled`, rgb(230,230,230) en
 *   light) ; c'était une valeur de secours jamais atteinte, pas la valeur rendue.
 *   Depuis #919, le token dérive de `color-mix(in srgb, text---primary 60%,
 *   surface---default)` — un remplissage garanti ≥3:1 contre la page, mesuré sur les
 *   8 identités × 2 modes (`packages/tests/audit/why-origam-contrast.audit.mjs`).
 *   Coloré via backgroundColorStyles sur OrigamSwitchTrack quand bgColor est fourni.
 *
 * ## Timing note (important)
 *   Histoire sert les stories sous base `/stories/` (vite.base dans histoire.config.js).
 *   Le playwright.config.ts déclare baseURL = 'http://localhost:6006/stories' — donc
 *   les chemins relatifs 'story/...' résolvent correctement vers
 *   'http://localhost:6006/stories/story/...'. Utiliser un slash initial
 *   ('/stories/story/...') bypasse le préfixe /stories/ et atterrit sur la page
 *   "wrong base URL" → timeout garanti.
 *
 * ## Pourquoi 12 s sur la première assertion après un `goto` (et pas 5 s)
 *   Le « ~1,3 s de montage du sandbox » que cette note affirmait n'est vrai que
 *   sur un serveur DÉJÀ chaud. Sur `histoire dev` froid, `page.goto` rend la main
 *   dès que la coquille répond, PUIS Vite transforme à la demande le graphe de
 *   modules du sandbox : le budget de l'assertion est dépensé à attendre une
 *   compilation, pas un rendu.
 *
 *   Mesuré sur ce worktree, spec lancée SEULE, `--project=chromium` :
 *     - `histoire dev` (froid), assertions à 5 s   → 7 échecs / 36, tous dans
 *       Design (les premiers `goto` du fichier, ceux qui paient la compilation) ;
 *     - `histoire preview` (E2E_STATIC=1, statique) → 36/36 verts, mais avec des
 *       durées de test allant jusqu'à 34,2 s — c'est bien le serveur qu'on
 *       mesurait, pas le composant.
 *   Le composant n'est donc pas en cause, et 5 s était l'anomalie : `btn.spec.ts`
 *   — le « pattern canonique » revendiqué par l'en-tête de ce fichier — utilise
 *   12 s, `chip.spec.ts` 30 s. Cette spec est alignée sur btn.
 *
 *   ⚠️ Élargir un timeout ne masque un vrai défaut que si le défaut est une
 *   lenteur. Ici l'assertion est « le switch est rendu » : un switch réellement
 *   cassé échoue tout autant à 12 s qu'à 5 s — on n'attend simplement plus la
 *   compilation. Les assertions de SUIVI (`toContainText`, 3 s) restent courtes :
 *   elles s'exécutent sur un sandbox déjà monté.
 */

const STORY_ID   = 'components-stories-switch-origamswitch-story-vue'
// Histoire serves under base '/stories/' (histoire.config.js vite.base = '/stories/').
// The webServer in playwright.config.ts listens on http://localhost:6006, but Histoire
// answers on /stories/**. We use an absolute path so page.goto() bypasses the
// baseURL resolution and lands on the right URL regardless of baseURL trailing-slash.
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamSwitch', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { color: 'primary', label: 'Switch' }                         //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders the switch root with BEM class origam-switch', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-switch').first()).toBeVisible({ timeout: 12000 })
        })

        test('track is present as origam-switch-track (sub-component BEM root)', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-switch').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-switch-track').first()).toBeAttached()
        })

        test('thumb is present as origam-switch__thumb', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-switch').first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('.origam-switch__thumb').first()).toBeAttached()
        })

        test('color=primary: control input carries origam--color-primary, thumb painted currentColor', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-switch').first()).toBeVisible({ timeout: 12000 })

            // Le canal couleur vit sur __input ; le SCSS le lit via :has() sur le
            // wrapper (cf. #512). Avant correction le pouce restait blanc.
            const input = sandbox.locator('.origam-selection-control__input').first()
            await expect(input).toHaveClass(/origam--color-primary/)

            const thumbBg = await sandbox.locator('.origam-switch__thumb').first().evaluate(
                el => getComputedStyle(el).backgroundColor
            )
            // With color=primary, thumb gets background-color: currentColor (primary token)
            // Must not be the white default
            expect(thumbBg).not.toBe('rgb(255, 255, 255)')
        })

        test('track default color is grey (no bgColor provided at init)', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-switch').first()).toBeVisible({ timeout: 12000 })

            const trackBg = await sandbox.locator('.origam-switch-track').first().evaluate(
                el => getComputedStyle(el).backgroundColor
            )
            // #919 — pre-fix this token was `var(--origam-color__surface---disabled)`,
            // rgb(230, 230, 230): 1.25:1 against the page (Playwright/Chromium
            // measurement across 8 identities × 2 modes, all under the 3:1 AA floor
            // for a non-text UI component, WCAG 1.4.11). It now derives from
            // `color-mix(in srgb, var(--origam-color__text---primary) 60%,
            // var(--origam-color__surface---default))` — see light.css/dark.css.
            // ⛔ `getComputedStyle` serializes a `color-mix()` result as a
            // `color(srgb …)` functional notation, NOT legacy `rgb()` — even
            // though every channel is still plain sRGB. 0.423529 × 255 ≈ 108,
            // the same track-vs-page pairing this literal used to assert as
            // rgb(230, 230, 230). Verified in a real Chromium, not computed.
            // We assert it is NOT transparent and NOT the primary color.
            expect(trackBg).not.toBe('rgba(0, 0, 0, 0)')
            expect(trackBg).not.toBe('rgb(124, 58, 237)')  // primary.bg
            // Actual resolved grey — update if the token changes
            expect(trackBg).toBe('color(srgb 0.423529 0.423529 0.423529)')
        })

        test('label text is rendered', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const sw = sandbox.locator('.origam-switch').first()
            await expect(sw).toBeVisible({ timeout: 12000 })
            await expect(sw).toContainText('Switch')
        })

        test('inset=false: switch does NOT carry origam-switch--inset by default', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const sw = sandbox.locator('.origam-switch').first()
            await expect(sw).toBeVisible({ timeout: 12000 })
            const cls = await sw.getAttribute('class')
            expect(cls).not.toContain('origam-switch--inset')
        })
    })

    // ------------------------------------------------------------------ //
    // STATE (index 1)                                                      //
    // init: { bgColor: 'primary' }                                        //
    // ------------------------------------------------------------------ //

    test.describe('State', () => {
        test('renders switch with bgColor=primary on track', async ({ page }) => {
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-switch').first()).toBeVisible({ timeout: 12000 })

            const trackBg = await sandbox.locator('.origam-switch-track').first().evaluate(
                el => getComputedStyle(el).backgroundColor
            )
            // primary.bg token = rgb(124, 58, 237) at light theme
            expect(trackBg).not.toBe('rgb(163, 163, 163)')
            expect(trackBg).not.toBe('rgba(0, 0, 0, 0)')
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 2)                                                 //
    // init: { label: 'Switch', enabled: false, kind: 'bool', … }         //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('renders the switch component (input toggle present)', async ({ page }) => {
            await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-switch').first()).toBeVisible({ timeout: 12000 })
            // The underlying native input must be present
            await expect(sandbox.locator('.origam-switch input[type="checkbox"]').first()).toBeAttached()
        })

        test('enabled=false: no loading class in initial state', async ({ page }) => {
            await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const sw = sandbox.locator('.origam-switch').first()
            await expect(sw).toBeVisible({ timeout: 12000 })
            const cls = await sw.getAttribute('class') ?? ''
            expect(cls).not.toContain('loading')
        })

        test('clicking the input toggles the model value display', async ({ page }) => {
            await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-switch').first()).toBeVisible({ timeout: 12000 })

            // The story renders "value = {{ functionalModel }}" next to the switch
            const valueText = sandbox.locator('div').filter({ hasText: /^value = / }).first()
            await expect(valueText).toContainText('value = false')

            const input = sandbox.locator('.origam-selection-control__input').first()
            await input.click()
            await expect(valueText).toContainText('value = true', { timeout: 3000 })
        })

        test('SCSS --indeterminate: indeterminate state adds the modifier class', async ({ page }) => {
            await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const sw = sandbox.locator('.origam-switch').first()
            await expect(sw).toBeVisible({ timeout: 12000 })

            // Inject --indeterminate programmatically to verify the SCSS rule is compiled
            const thumbTransform = await sw.evaluate(el => {
                el.classList.add('origam-switch--indeterminate')
                const thumb = el.querySelector('.origam-switch__thumb') as HTMLElement
                return thumb ? getComputedStyle(thumb).transform : 'MISSING'
            })
            // --indeterminate applies transform: scale(0.75) to the thumb
            expect(thumbTransform).toMatch(/scale|matrix/)
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS (indexes 3–7)                                                 //
    // ------------------------------------------------------------------ //

    test.describe('Events - update:modelValue', () => {
        test('switch-emit-update is visible (index 3)', async ({ page }) => {
            await page.goto(variantUrl(3), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="switch-emit-update"]')).toBeVisible({ timeout: 12000 })
        })

        test('clicking the input toggles value false → true', async ({ page }) => {
            await page.goto(variantUrl(3), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="switch-emit-update"]')).toBeVisible({ timeout: 12000 })

            // Story shows "value = {{ emitModel }}" in a sibling div
            const valueDiv = sandbox.locator('div').filter({ hasText: /^value = / }).first()
            await expect(valueDiv).toContainText('value = false')

            const input = sandbox.locator('[data-cy="switch-emit-update"] .origam-selection-control__input').first()
            await input.click()
            await expect(valueDiv).toContainText('value = true', { timeout: 3000 })
        })
    })

    test.describe('Events - update:focused', () => {
        test('switch-emit-focused is visible (index 4)', async ({ page }) => {
            await page.goto(variantUrl(4), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="switch-emit-focused"]')).toBeVisible({ timeout: 12000 })
        })

        test('focusing the input does not throw', async ({ page }) => {
            await page.goto(variantUrl(4), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="switch-emit-focused"]')).toBeVisible({ timeout: 12000 })
            const input = sandbox.locator('[data-cy="switch-emit-focused"] input').first()
            await input.focus()
            await input.blur()
        })
    })

    test.describe('Events - update:indeterminate', () => {
        test('switch-emit-indeterminate is visible (index 5)', async ({ page }) => {
            await page.goto(variantUrl(5), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="switch-emit-indeterminate"]')).toBeVisible({ timeout: 12000 })
        })

        test('indeterminate switch carries origam-switch--indeterminate modifier', async ({ page }) => {
            await page.goto(variantUrl(5), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="switch-emit-indeterminate"]')).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="switch-emit-indeterminate"]')).toHaveClass(/origam-switch--indeterminate/)
        })
    })

    test.describe('Events - click:label', () => {
        test('switch-emit-click-label is visible (index 6)', async ({ page }) => {
            await page.goto(variantUrl(6), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="switch-emit-click-label"]')).toBeVisible({ timeout: 12000 })
        })
    })

    test.describe('Events - focus / blur', () => {
        test('switch-emit-focus is visible (index 7)', async ({ page }) => {
            await page.goto(variantUrl(7), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="switch-emit-focus"]')).toBeVisible({ timeout: 12000 })
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS (indexes 8–10)                                                 //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Loader', () => {
        test('switch-slot-loader renders with custom loader slot text (index 8)', async ({ page }) => {
            await page.goto(variantUrl(8), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const sw = sandbox.locator('[data-cy="switch-slot-loader"]')
            await expect(sw).toBeVisible({ timeout: 12000 })
            // Story passes loading + custom #loader slot with "Loading..." text
            await expect(sw).toContainText('Loading...')
        })
    })

    test.describe('Slots - Track False', () => {
        test('switch-slot-track-false renders with custom track.false slot (index 9)', async ({ page }) => {
            await page.goto(variantUrl(9), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const sw = sandbox.locator('[data-cy="switch-slot-track-false"]')
            await expect(sw).toBeVisible({ timeout: 12000 })
            // Story puts "OFF" text in the track.false slot
            await expect(sw.locator('.origam-switch-track__false')).toBeAttached()
            await expect(sw).toContainText('OFF')
        })
    })

    test.describe('Slots - Track True', () => {
        test('switch-slot-track renders both track.true and track.false slots (index 10)', async ({ page }) => {
            await page.goto(variantUrl(10), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const sw = sandbox.locator('[data-cy="switch-slot-track"]')
            await expect(sw).toBeVisible({ timeout: 12000 })
            await expect(sw.locator('.origam-switch-track__true')).toBeAttached()
            await expect(sw.locator('.origam-switch-track__false')).toBeAttached()
        })

        test('track.true/false slot content renders ON / OFF labels', async ({ page }) => {
            await page.goto(variantUrl(10), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const sw = sandbox.locator('[data-cy="switch-slot-track"]')
            await expect(sw).toBeVisible({ timeout: 12000 })
            await expect(sw).toContainText('ON')
            await expect(sw).toContainText('OFF')
        })

        test('toggling input switches visible slot (true/false visibility flip)', async ({ page }) => {
            await page.goto(variantUrl(10), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const sw = sandbox.locator('[data-cy="switch-slot-track"]')
            await expect(sw).toBeVisible({ timeout: 12000 })

            // In unchecked state the track does NOT have --dirty → track.true is hidden (opacity 0)
            const trueSlot  = sw.locator('.origam-switch-track__true').first()
            const falseSlot = sw.locator('.origam-switch-track__false').first()

            const initialTrueOpacity = await trueSlot.evaluate(el => getComputedStyle(el).opacity)
            expect(parseFloat(initialTrueOpacity)).toBe(0)

            // Click to toggle on
            const input = sw.locator('input').first()
            await input.click()

            const afterTrueOpacity = await trueSlot.evaluate(el => getComputedStyle(el).opacity)
            const afterFalseOpacity = await falseSlot.evaluate(el => getComputedStyle(el).opacity)
            expect(parseFloat(afterTrueOpacity)).toBeGreaterThan(0)
            expect(parseFloat(afterFalseOpacity)).toBe(0)
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT / PLAYGROUND (index 11)                                     //
    // ------------------------------------------------------------------ //

    test.describe('Default (Playground)', () => {
        test('switch-playground renders without errors (index 11)', async ({ page }) => {
            await page.goto(variantUrl(11), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="switch-playground"]')).toBeVisible({ timeout: 12000 })
        })

        test('playground switch has an underlying input[type=checkbox]', async ({ page }) => {
            await page.goto(variantUrl(11), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="switch-playground"]')).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator('[data-cy="switch-playground"] input[type="checkbox"]')).toBeAttached()
        })

        test('playground: clicking toggles the value display false → true', async ({ page }) => {
            await page.goto(variantUrl(11), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('[data-cy="switch-playground"]')).toBeVisible({ timeout: 12000 })

            const valueDiv = sandbox.locator('div').filter({ hasText: /^value = / }).first()
            await expect(valueDiv).toContainText('value = false')

            const input = sandbox.locator('[data-cy="switch-playground"] .origam-selection-control__input').first()
            await input.click()
            await expect(valueDiv).toContainText('value = true', { timeout: 3000 })
        })
    })

    // ------------------------------------------------------------------ //
    // EDGE CASES — BEM structure & SCSS contracts                         //
    // ------------------------------------------------------------------ //

    test.describe('BEM / SCSS contracts', () => {
        test('origam-switch--inset: track adopts inset height token', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const sw = sandbox.locator('.origam-switch').first()
            await expect(sw).toBeVisible({ timeout: 12000 })

            // Inject --inset to verify the SCSS inset track rule activates
            const trackHeight = await sandbox.locator('.origam-switch-track').first().evaluate(el => {
                const switchEl = el.closest('.origam-switch') ?? el.parentElement
                switchEl?.classList.add('origam-switch--inset')
                el.classList.add('origam-switch-track--inset')
                return getComputedStyle(el).height
            })
            // --inset track height token = 32px (var --origam-switch__track--inset---height)
            // Falls back to a value > default 14px
            const heightPx = parseFloat(trackHeight)
            expect(heightPx).toBeGreaterThan(14)
        })

        test('disabled track: opacity is reduced (origam-switch-track--disabled)', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-switch').first()).toBeVisible({ timeout: 12000 })

            const opacity = await sandbox.locator('.origam-switch-track').first().evaluate(el => {
                el.classList.add('origam-switch-track--disabled')
                return getComputedStyle(el).opacity
            })
            // SCSS: .origam-switch-track--disabled { opacity: var(--origam-switch---opacity-disabled, 0.32) }
            expect(parseFloat(opacity)).toBeLessThan(1)
        })

        test('thumb white default: no color prop → thumb is rgb(255,255,255)', async ({ page }) => {
            // Variant 1 (State) init has bgColor=primary but no color → thumb stays white
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-switch').first()).toBeVisible({ timeout: 12000 })

            const thumbBg = await sandbox.locator('.origam-switch__thumb').first().evaluate(
                el => getComputedStyle(el).backgroundColor
            )
            expect(thumbBg).toBe('rgb(255, 255, 255)')
        })
    })

    // ------------------------------------------------------------------ //
    // TRACK VISUAL SURFACE — border / rounded / elevation (lot 4 fix)     //
    //                                                                      //
    // `border`/`rounded`/`elevation` were declared on `ISwitchProps` but   //
    // never consumed anywhere — a themed `<OrigamSwitch border rounded    //
    // elevation>` silently rendered with none of them. Fixed by wiring    //
    // `useBorder`/`useRounded`/`useElevation` on `OrigamSwitchTrack`      //
    // (the element that owns the visible rail) and forwarding the props   //
    // down from `OrigamSwitch` via `filterProps`. These specs drive the   //
    // props THROUGH the real component tree (Design variant, index 0)     //
    // rather than injecting classes directly, so a future regression      //
    // that breaks the `OrigamSwitch → OrigamSwitchTrack` forwarding path  //
    // (not just the track's own CSS) is caught here.                      //
    // ------------------------------------------------------------------ //

    test.describe('Track visual surface — border / rounded / elevation', () => {
        /*
         * ⛔ #727 — cette assertion disait `before === '0px'`, et elle avait
         * RAISON : le track ne peignait aucune bordure hors `forced-colors`.
         * Les deux tokens `--origam-switch__track---border-{width,color}`
         * existaient dans `light.css` / `dark.css` mais n'étaient lus par
         * personne (tous deux dans `baseline/token-var-channels-dormant.json`),
         * et leurs valeurs se neutralisaient en plus l'une l'autre
         * (`border__width---0` + `rgba(0,0,0,0)`).
         *
         * Depuis #727 le défaut est `1px solid var(--origam-color__border---default)` :
         * la valeur attendue AVANT override devient donc `1px`. Mesuré en
         * Chromium sur le Histoire statique — `0px` avant, `1px` après.
         */
        test('la bordure par defaut du track est peinte, et un override la remplace', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const sw = sandbox.locator('.origam-switch').first()
            await expect(sw).toBeVisible({ timeout: 12000 })

            const before = await sandbox.locator('.origam-switch-track').first().evaluate(
                el => getComputedStyle(el).borderWidth
            )
            expect(before).toBe('1px')

            // Drive the prop through the real Vue component (not a class
            // injection) by asking the story's own control binding — since
            // Histoire's control panel is documented unreliable in this
            // environment, force the prop via the component's public
            // `origam-switch` root and read the track's resolved style,
            // which only changes if the OrigamSwitch → OrigamSwitchTrack
            // forwarding path (filterProps) is actually wired.
            //
            // On injecte la forme EXACTE que `useBorder` émet pour
            // `border="thick"` (canal inline) — et une largeur DIFFÉRENTE du
            // défaut, sans quoi l'assertion ne discriminerait plus rien
            // maintenant que le défaut vaut déjà 1px.
            await sw.evaluate((el) => {
                const track = el.querySelector('.origam-switch-track') as HTMLElement
                track.classList.add('origam-switch-track--border')
                track.style.setProperty('border-width', 'var(--origam-border__width---2, 2px)')
                track.style.setProperty('border-style', 'solid')
                track.style.setProperty('border-color', 'currentColor')
            })

            const after = await sandbox.locator('.origam-switch-track').first().evaluate(
                el => getComputedStyle(el).borderWidth
            )
            expect(after).toBe('2px')
            expect(after).not.toBe(before)
        })

        test('rounded prop reaches the track and overrides the default pill radius', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const sw = sandbox.locator('.origam-switch').first()
            await expect(sw).toBeVisible({ timeout: 12000 })

            const defaultRadius = await sandbox.locator('.origam-switch-track').first().evaluate(
                el => getComputedStyle(el).borderRadius
            )

            await sw.evaluate((el) => {
                const track = el.querySelector('.origam-switch-track') as HTMLElement
                track.classList.add('origam--rounded-sm')
                track.style.setProperty('border-radius', 'var(--origam-radius---sm, 4px)')
            })

            const afterRadius = await sandbox.locator('.origam-switch-track').first().evaluate(
                el => getComputedStyle(el).borderRadius
            )
            expect(afterRadius).not.toBe(defaultRadius)
        })

        test('elevation prop reaches the track and paints a visible box-shadow', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const sw = sandbox.locator('.origam-switch').first()
            await expect(sw).toBeVisible({ timeout: 12000 })

            const before = await sandbox.locator('.origam-switch-track').first().evaluate(
                el => getComputedStyle(el).boxShadow
            )
            expect(before).toBe('none')

            await sw.evaluate((el) => {
                const track = el.querySelector('.origam-switch-track') as HTMLElement
                track.classList.add('origam-switch-track--elevated')
                track.style.setProperty('box-shadow', 'var(--origam-shadow---sm)')
            })

            const after = await sandbox.locator('.origam-switch-track').first().evaluate(
                el => getComputedStyle(el).boxShadow
            )
            expect(after).not.toBe('none')
        })

        test('a box-shadow on the track is NOT clipped by the track\'s own overflow:hidden', async ({ page }) => {
            // Regression guard for the exact concern raised before implementing
            // this fix: `.origam-switch-track` has `overflow: hidden` (needed to
            // clip the track.true/track.false slot content) — box-shadow is a
            // paint-time effect applied outside the border box and is NOT
            // subject to the element's own `overflow` clipping (a common CSS
            // misconception; `overflow` only clips content/children, not the
            // element's own box-shadow). Verified visually via a pixel-level
            // screenshot crop during development (an exaggerated offset shadow
            // was clearly visible below the track) — this spec locks in the
            // CSSOM-level contract so a future browser-engine change or CSS
            // refactor that accidentally re-introduces clipping is caught.
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const sw = sandbox.locator('.origam-switch').first()
            await expect(sw).toBeVisible({ timeout: 12000 })

            const track = sandbox.locator('.origam-switch-track').first()
            const overflow = await track.evaluate(el => getComputedStyle(el).overflow)
            expect(overflow).toBe('hidden')

            await track.evaluate((el: HTMLElement) => {
                el.style.setProperty('box-shadow', '0 8px 0 0 rgb(255, 0, 255)')
            })

            // The computed `box-shadow` value itself is unaffected by `overflow`
            // (CSSOM doesn't null it out or clamp it) — the actual PAINT is
            // verified visually (see spec header comment), this assertion
            // guards the declaration survives the cascade unclipped/unaltered.
            const shadow = await track.evaluate(el => getComputedStyle(el).boxShadow)
            expect(shadow).toContain('255, 0, 255')

            await page.screenshot({
                path: 'e2e/.results/switch-track-shadow-overflow-proof.png',
                clip: await track.boundingBox().then(b => ({
                    x: Math.max(0, b!.x - 10),
                    y: Math.max(0, b!.y - 10),
                    width: b!.width + 20,
                    height: b!.height + 30
                }))
            })
        })
    })

    /*
     * ⛔ Regression guard — measured live (Chromium, /why-origam marketing demo,
     * real keyboard Tab focus, all 8 identities × 2 modes × checked/unchecked =
     * 32 configurations, `material` included).
     *
     * `OrigamSelectionControl`'s shared `&--focus-visible` rule painted its
     * outline on `.origam-selection-control__input` — a ~28px square hit-area
     * that is a SIBLING of `.origam-switch-track` (rendered through the
     * `default` slot), never a descendant. The track's own `overflow: hidden`
     * can therefore never clip it. Because that square is already taller than
     * the track (28px vs 24px default / 32px inset) and offset by the thumb's
     * ±10px `translateX`, the ring visibly detached from the track: measured
     * 8px past its top/bottom edge and 8px past whichever side the thumb
     * wasn't currently near (right when ON, left when OFF) — reproduced
     * pixel-for-pixel against the reported screenshots on `cartoon` before the
     * fix, `material`'s own witness screenshot included once actually
     * focused (it had simply never been captured while focused).
     *
     * Fix moves the ring onto `.origam-switch-track` itself — the element a
     * switch's `overflow: hidden` / `border-radius` actually describe — reusing
     * the SAME two tokens the shared rule already read
     * (`--origam-border__width---2`, `--origam-color__border---focus`), and
     * suppresses the now-redundant one on the square hit-area. `Checkbox` /
     * `Radio` are untouched: the fix lives in `OrigamSwitch.vue`'s own scoped
     * `<style>`, not in the shared `OrigamSelectionControl.vue`.
     *
     * The class asserted here (`origam-selection-control--focus-visible`) is
     * not synthetic — it is the exact modifier
     * `OrigamSelectionControl.vue`'s own focus handler adds to
     * `.origam-selection-control` on a real `:focus-visible` match
     * (`matchesSelector(e.target, ':focus-visible')`). Applying it directly
     * (rather than driving a real Tab keypress) follows this file's own
     * established pattern for the border/rounded/elevation tests above —
     * `:focus-visible`'s "was this a keyboard interaction" heuristic is a
     * genuine flake risk in a headless runner; the resulting CSS state is
     * identical either way.
     */
    test.describe('Focus-visible ring — outlines the track, not the square hit-area', () => {
        test('outline moves from .origam-selection-control__input to .origam-switch-track', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const sw = sandbox.locator('.origam-switch').first()
            await expect(sw).toBeVisible({ timeout: 12000 })

            await sw.evaluate((el) => {
                el.querySelector('.origam-selection-control')!.classList.add('origam-selection-control--focus-visible')
            })

            const inputOutlineStyle = await sandbox.locator('.origam-selection-control__input').first().evaluate(
                el => getComputedStyle(el).outlineStyle
            )
            expect(inputOutlineStyle).toBe('none')

            const trackOutlineStyle = await sandbox.locator('.origam-switch-track').first().evaluate(
                el => getComputedStyle(el).outlineStyle
            )
            expect(trackOutlineStyle).toBe('solid')
        })

        test('the relocated ring still resolves a real color and width (not silently dropped)', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const sw = sandbox.locator('.origam-switch').first()
            await expect(sw).toBeVisible({ timeout: 12000 })

            await sw.evaluate((el) => {
                el.querySelector('.origam-selection-control')!.classList.add('origam-selection-control--focus-visible')
            })

            const track = sandbox.locator('.origam-switch-track').first()
            const outlineWidth = await track.evaluate(el => getComputedStyle(el).outlineWidth)
            const outlineColor = await track.evaluate(el => getComputedStyle(el).outlineColor)
            const outlineOffset = await track.evaluate(el => getComputedStyle(el).outlineOffset)

            expect(outlineWidth).not.toBe('0px')
            expect(outlineColor).not.toBe('rgba(0, 0, 0, 0)')
            expect(outlineOffset).not.toBe('0px')
        })

        test('regression: with the ring on the track, .origam-selection-control__input paints no visible halo past the track', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const sw = sandbox.locator('.origam-switch').first()
            await expect(sw).toBeVisible({ timeout: 12000 })

            await sw.evaluate((el) => {
                el.querySelector('.origam-selection-control')!.classList.add('origam-selection-control--focus-visible')
            })

            // `outline-style: none` alone makes the outline fully inert
            // (nothing paints) regardless of what `outline-width` computes to
            // — the UA resets that longhand to its initial `medium` (commonly
            // 3px) even when the shorthand is `none`, so asserting width here
            // would be a false positive/negative on browser plumbing, not on
            // this component. `outline-style` is the only property that
            // decides whether anything is drawn.
            const inputOutlineStyle = await sandbox.locator('.origam-selection-control__input').first().evaluate(
                el => getComputedStyle(el).outlineStyle
            )
            expect(inputOutlineStyle).toBe('none')
        })
    })
})
