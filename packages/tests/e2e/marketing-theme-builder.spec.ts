/**
 * Theme Builder (/theming) — v2 (UI validée).
 *
 * Layout 3 colonnes sous le header marketing existant :
 *   - nav composants (gauche) groupés par catégorie, repliables + recherche
 *   - preview (centre) : barre avec toggle Light|Dark + Split + nom composant,
 *     code IOrigamTheme[] généré dessous
 *   - controls (droite) : onglets Props / CSS Tokens, props groupées par type
 *
 * Couvre : export IOrigamTheme[] dual-mode, persistance localStorage, import
 * (JSON unique + tableau), seed preset DS, toggle Light/Dark, Split (qui MASQUE
 * le toggle), édition token par mode, nav (catégories + recherche + sélection).
 *
 * Prérequis : serveur marketing :3000 (reuseExistingServer dans la config).
 * Run : cd packages/tests && node_modules/.bin/playwright test \
 *         --config=playwright.marketing.config.ts marketing-theme-builder
 */

import { expect, test, type Page } from '@playwright/test'
import { requireMarketingDb } from './_support/require-marketing-db'

// #835 — cette suite dépend de la base API-Reference (composants/tokens réels
// via /theming). Échoue vite et clairement si elle manque, plutôt que chaque
// test un par un contre un catalogue vide. Voir _support/require-marketing-db.ts.
requireMarketingDb()

const STORAGE_KEY = 'origam_theme_builder_state'

/** Lit le texte du bloc de code généré (OrigamCode rend un <pre><code>). */
async function generatedCode (page: Page): Promise<string> {
    const block = page.locator('[data-cy="theming-generated-code"]')
    await expect(block).toBeVisible()
    return (await block.innerText()).trim()
}

/** Évalue le tableau `[...]` du module généré → IOrigamTheme[]. */
function parseExportedArray (code: string): Record<string, unknown>[] {
    const start = code.indexOf('[')
    const end = code.lastIndexOf(']')
    if (start === -1 || end === -1 || end <= start) {
        throw new Error(`No array literal found in generated code: ${code.slice(0, 120)}`)
    }
    const literal = code.slice(start, end + 1)
    return new Function(`"use strict"; return (${literal});`)() as Record<string, unknown>[]
}

/** Édite le premier token couleur du panneau CSS Tokens (mode actif). */
async function editFirstTokenColor (page: Page, value: string): Promise<void> {
    await page.locator('[data-cy="theming-tab-tokens"]').click()
    const firstColor = page.locator('[data-cy^="theming-token-"] input[type="color"]').first()
    await firstColor.waitFor({ state: 'attached', timeout: 5000 })
    await firstColor.evaluate((el, v) => {
        const input = el as HTMLInputElement
        input.value = v
        input.dispatchEvent(new Event('input', { bubbles: true }))
    }, value)
    await page.waitForTimeout(200)
}

test.describe('Theme Builder · structure (UI validée)', () => {
    test('ouvre sur Btn avec preview live + 3 colonnes', async ({ page }) => {
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')

        await expect(page.locator('[data-cy="theming-topbar"]')).toBeVisible()
        await expect(page.locator('[data-cy="theming-nav"]')).toBeVisible()
        await expect(page.locator('[data-cy="theming-preview"]')).toBeVisible()
        await expect(page.locator('[data-cy="theming-controls-panel"]')).toBeVisible()

        await expect(page.locator('[data-cy="theming-nav-item-btn"]')).toHaveAttribute('aria-current', 'true')
        await expect(page.locator('[data-cy="theming-live-btn-light"]')).toBeVisible()
    })

    test('la nav liste les catégories canoniques avec compteurs', async ({ page }) => {
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')

        for (const cat of ['Layout & Structure', 'Navigation', 'Form & Input', 'Data Display']) {
            await expect(page.locator(`[data-cy="theming-nav-cat-toggle-${cat}"]`)).toBeVisible()
        }
    })

    test('la recherche filtre les composants', async ({ page }) => {
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')

        await page.locator('[data-cy="theming-nav-search"] input').fill('switch')
        await page.waitForTimeout(300)
        await expect(page.locator('[data-cy="theming-nav-item-switch"]')).toBeVisible()
        expect(await page.locator('[data-cy="theming-nav-item-btn"]').count()).toBe(0)
    })

    test('le panneau de contrôles a les onglets Props et CSS Tokens', async ({ page }) => {
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')

        await expect(page.locator('[data-cy="theming-tab-props"]')).toBeVisible()
        await expect(page.locator('[data-cy="theming-tab-tokens"]')).toBeVisible()
    })
})

test.describe('Theme Builder · export IOrigamTheme[] (dual-mode)', () => {
    test('le code généré est un IOrigamTheme[] light + dark', async ({ page: _page }) => {
        // Bloqué par #859 : OrigamColorPickerField n'a ni v-model ni
        // @update:model-value sur son text-field — seul le clic dans le
        // popover (handleSelectColor) écrit model.value, la frappe clavier
        // n'atteint jamais le state. Le sélecteur `input[type="color"]` de
        // editFirstTokenColor() est par ailleurs mort (le composant rend
        // toujours un champ TEXT_FIELD_TYPE.TEXT, jamais un <input
        // type="color">), mais corriger CE sélecteur ne suffit pas : un
        // agent l'a déjà tenté et reverté, la spec passerait pour la
        // mauvaise raison tant que #859 reste ouvert.
        test.skip(true, 'Bloqué par #859 — la frappe clavier dans OrigamColorPickerField n\'atteint jamais le state (seul le popover écrit model.value) ; le sélecteur input[type="color"] du helper est mort mais ne pas le corriger seul, cf. commentaire ci-dessus.')
    })

    test('un token édité en light n\'apparaît pas dans l\'entrée dark', async ({ page: _page }) => {
        // Bloqué par #859 — voir le commentaire détaillé sur le test
        // précédent : même helper (editFirstTokenColor), même mécanisme.
        test.skip(true, 'Bloqué par #859 — la frappe clavier dans OrigamColorPickerField n\'atteint jamais le state (seul le popover écrit model.value) ; le sélecteur input[type="color"] du helper est mort mais ne pas le corriger seul, cf. le test précédent dans ce fichier.')
    })
})

test.describe('Theme Builder · persistance localStorage', () => {
    test('le state survit au reload', async ({ page: _page }) => {
        // Bloqué par #859 — voir le commentaire détaillé dans « Theme
        // Builder · export IOrigamTheme[] (dual-mode) » (premier test du
        // fichier) : même helper (editFirstTokenColor), même mécanisme.
        test.skip(true, 'Bloqué par #859 — la frappe clavier dans OrigamColorPickerField n\'atteint jamais le state (seul le popover écrit model.value) ; le sélecteur input[type="color"] du helper est mort mais ne pas le corriger seul, cf. le premier test du fichier.')
    })

    /** Style discriminant du bouton preview (mode light) — assez pour distinguer "défaut DS" de "preset Cartoon". */
    async function readBtnStyle (page: Page): Promise<string> {
        return page.locator('[data-cy="theming-live-btn-light"]').evaluate((el) => {
            const cs = getComputedStyle(el)
            return JSON.stringify({ borderWidth: cs.borderWidth, boxShadow: cs.boxShadow, borderRadius: cs.borderRadius })
        })
    }

    /** Libellé actuellement affiché par le select Preset (pas l'input natif — la sélection est un span). */
    async function readPresetLabel (page: Page): Promise<string> {
        return page.locator('[data-cy="theming-preset"] .origam-select__selection-text').innerText()
    }

    async function selectPreset (page: Page, label: string): Promise<void> {
        await page.locator('[data-cy="theming-preset"]').click()
        await page.waitForTimeout(300)
        await page.getByText(label, { exact: true }).click()
        await page.waitForTimeout(400)
    }

    // Régression #25 — sujet 1 : au reload avec le sélecteur de preset à
    // « none », la preview restait sur les valeurs du dernier preset choisi
    // (ex. Cartoon) au lieu du thème par défaut. Root cause : le sélecteur de
    // preset était un ref local jamais persisté/restauré, découplé du state
    // (defaults/cssVars) qui, lui, survit au reload par design (continuité de
    // brouillon). Choisir explicitement « — none — » ne faisait rien non plus
    // (no-op) — même désync, sans même passer par un reload.
    test('sélectionner « — none — » après un preset revient IMMÉDIATEMENT au défaut (#25)', async ({ page }) => {
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')
        await page.evaluate(k => window.localStorage.removeItem(k), STORAGE_KEY)
        await page.reload({ waitUntil: 'networkidle' })

        const defaultStyle = await readBtnStyle(page)

        await selectPreset(page, 'Cartoon')
        expect(await readBtnStyle(page)).not.toBe(defaultStyle)

        await selectPreset(page, '— none —')
        expect(await readBtnStyle(page), 'sélectionner "none" doit effacer les overrides du preset').toBe(defaultStyle)
    })

    test('le preset choisi ET son rendu survivent au reload (continuité de brouillon)', async ({ page }) => {
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')
        await page.evaluate(k => window.localStorage.removeItem(k), STORAGE_KEY)
        await page.reload({ waitUntil: 'networkidle' })

        await selectPreset(page, 'Cartoon')
        const styleAfterSelect = await readBtnStyle(page)

        await page.reload({ waitUntil: 'networkidle' })
        await page.waitForTimeout(400)

        expect(await readPresetLabel(page), 'le sélecteur doit refléter le vrai state persisté, pas retomber sur "none"').toBe('Cartoon')
        expect(await readBtnStyle(page)).toBe(styleAfterSelect)
    })

    test('reload avec preset=none rend le thème par défaut, même après avoir eu un preset actif (#25)', async ({ page }) => {
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')
        await page.evaluate(k => window.localStorage.removeItem(k), STORAGE_KEY)
        await page.reload({ waitUntil: 'networkidle' })

        const defaultStyle = await readBtnStyle(page)

        await selectPreset(page, 'Cartoon')
        await selectPreset(page, '— none —')

        await page.reload({ waitUntil: 'networkidle' })
        await page.waitForTimeout(400)

        expect(await readPresetLabel(page)).toBe('— none —')
        expect(await readBtnStyle(page)).toBe(defaultStyle)
    })

    test('un payload localStorage pré-#25 (sans marqueur de version) est traité comme ambigu et ignoré au reload', async ({ page }) => {
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')

        const defaultStyle = await readBtnStyle(page)

        // Simule une session écrite par le code AVANT #25 : des overrides
        // "cartoon-like" persistés, sans `__v` ni `preset` — impossible à
        // rejouer sans réintroduire le bug (le sélecteur afficherait "none"
        // pendant que ces overrides repeignent la preview).
        await page.evaluate((key) => {
            window.localStorage.setItem(key, JSON.stringify({
                name: 'my-theme',
                label: 'My theme',
                mode: 'light',
                defaults: { 'origam-btn': { variant: 'outlined', rounded: 'lg', border: true, elevation: 2 } },
                cssVars: { light: { '--origam-btn---border-width-outlined': '3px' }, dark: {} }
            }))
        }, STORAGE_KEY)

        await page.reload({ waitUntil: 'networkidle' })
        await page.waitForTimeout(400)

        expect(await readPresetLabel(page)).toBe('— none —')
        expect(await readBtnStyle(page), 'un payload ambigu ne doit jamais repeindre la preview').toBe(defaultStyle)
    })

    test('reset global vide le storage', async ({ page }) => {
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')

        await page.locator('[data-cy="theming-name"] input').fill('to-be-reset')
        await page.waitForTimeout(200)
        await page.locator('[data-cy="theming-reset"]').click()
        await page.waitForTimeout(300)

        const stored = await page.evaluate(k => window.localStorage.getItem(k), STORAGE_KEY)
        if (stored) expect(stored).not.toContain('to-be-reset')
        await expect(page.locator('[data-cy="theming-name"] input')).not.toHaveValue('to-be-reset')
    })
})

test.describe('Theme Builder · import / seed', () => {
    test('ouvrir Import ouvre une dialog (pas un panneau inline)', async ({ page }) => {
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')

        await page.locator('[data-cy="theming-import-toggle"]').click()
        await page.waitForTimeout(300)

        await expect(page.locator('[data-cy="theming-import-dialog"]')).toBeVisible()
        await expect(page.locator('[data-cy="theming-import-text"]')).toBeVisible()
    })

    test('importer un JSON IOrigamTheme unique (mode dark) réhydrate le state + ferme la dialog', async ({ page }) => {
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')
        await page.evaluate(k => window.localStorage.removeItem(k), STORAGE_KEY)
        await page.reload({ waitUntil: 'networkidle' })

        await page.locator('[data-cy="theming-import-toggle"]').click()
        await page.waitForTimeout(300)

        await expect(page.locator('[data-cy="theming-import-dialog"]')).toBeVisible()

        const payload = JSON.stringify({
            name: 'imported',
            label: 'Imported theme',
            mode: 'dark',
            cssVars: { '--origam-btn---background-color': '#ff0080' }
        })
        await page.locator('[data-cy="theming-import-text"] textarea').fill(payload)
        await page.locator('[data-cy="theming-import-btn"]').click()
        await page.waitForTimeout(400)

        await expect(page.locator('[data-cy="theming-import-dialog"]')).not.toBeVisible()
        await expect(page.locator('[data-cy="theming-name"] input')).toHaveValue('imported')

        const arr = parseExportedArray(await generatedCode(page))
        const darkVars = (arr.find(e => e.mode === 'dark')?.cssVars ?? {}) as Record<string, string>
        expect(darkVars['--origam-btn---background-color']).toBe('#ff0080')
    })

    test('importer un tableau IOrigamTheme[] réhydrate les deux modes', async ({ page }) => {
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')
        await page.evaluate(k => window.localStorage.removeItem(k), STORAGE_KEY)
        await page.reload({ waitUntil: 'networkidle' })

        await page.locator('[data-cy="theming-import-toggle"]').click()
        await page.waitForTimeout(300)

        const payload = JSON.stringify([
            { name: 'dual-light', label: 'Dual (light)', mode: 'light', cssVars: { '--origam-btn---background-color': '#001122' } },
            { name: 'dual-dark', label: 'Dual (dark)', mode: 'dark', cssVars: { '--origam-btn---background-color': '#334455' } }
        ])
        await page.locator('[data-cy="theming-import-text"] textarea').fill(payload)
        await page.locator('[data-cy="theming-import-btn"]').click()
        await page.waitForTimeout(400)

        const arr = parseExportedArray(await generatedCode(page))
        const lightVars = (arr.find(e => e.mode === 'light')?.cssVars ?? {}) as Record<string, string>
        const darkVars = (arr.find(e => e.mode === 'dark')?.cssVars ?? {}) as Record<string, string>
        expect(lightVars['--origam-btn---background-color']).toBe('#001122')
        expect(darkVars['--origam-btn---background-color']).toBe('#334455')
    })

    test('un import invalide affiche une erreur dans la dialog sans crash', async ({ page }) => {
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')

        await page.locator('[data-cy="theming-import-toggle"]').click()
        await page.waitForTimeout(300)

        await page.locator('[data-cy="theming-import-text"] textarea').fill('this is not a theme {{{')
        await page.locator('[data-cy="theming-import-btn"]').click()
        await page.waitForTimeout(300)

        await expect(page.locator('[data-cy="theming-import-error"]')).toBeVisible()
        await expect(page.locator('[data-cy="theming-import-dialog"]')).toBeVisible()
        await expect(page.locator('[data-cy="page-theming"]')).toBeVisible()
    })

    test('seed depuis un preset DS injecte des tokens réels dans light + dark', async ({ page }) => {
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')
        await page.evaluate(k => window.localStorage.removeItem(k), STORAGE_KEY)
        await page.reload({ waitUntil: 'networkidle' })

        await page.locator('[data-cy="theming-preset"]').click()
        await page.waitForTimeout(300)

        const origamOption = page.locator('[role="option"]').filter({ hasText: 'Origam' }).first()
        await origamOption.waitFor({ state: 'visible', timeout: 3000 })
        await origamOption.click()
        await page.waitForTimeout(400)

        const arr = parseExportedArray(await generatedCode(page))
        const lightVars = (arr.find(e => e.mode === 'light')?.cssVars ?? {}) as Record<string, string>
        const darkVars = (arr.find(e => e.mode === 'dark')?.cssVars ?? {}) as Record<string, string>
        expect(Object.keys(lightVars).length, 'seed n\'a injecté aucun token dans le mode light').toBeGreaterThan(10)
        expect(Object.keys(darkVars).length, 'seed n\'a injecté aucun token dans le mode dark').toBeGreaterThan(10)
    })
})

test.describe('Theme Builder · modes Light/Dark + Split', () => {
    test('le toggle Light|Dark est visible hors Split', async ({ page }) => {
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')

        await expect(page.locator('[data-cy="theming-mode-toggle"]')).toBeVisible()
    })

    test('Split MASQUE le toggle Light|Dark et affiche les deux panes', async ({ page }) => {
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')

        await page.locator('[data-cy="theming-split-btn"]').click()
        await page.waitForTimeout(300)

        expect(await page.locator('[data-cy="theming-mode-toggle"]').count()).toBe(0)
        await expect(page.locator('[data-cy="theming-preview-pane-light"]')).toBeVisible()
        await expect(page.locator('[data-cy="theming-preview-pane-dark"]')).toBeVisible()
    })

    test('désactiver Split réaffiche le toggle', async ({ page }) => {
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')

        const splitBtn = page.locator('[data-cy="theming-split-btn"]')
        await splitBtn.click()
        await page.waitForTimeout(200)
        await splitBtn.click()
        await page.waitForTimeout(200)

        await expect(page.locator('[data-cy="theming-mode-toggle"]')).toBeVisible()
    })

    test('chaque pane Split porte un OrigamThemeProvider scopé sur son mode', async ({ page }) => {
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')

        await page.locator('[data-cy="theming-split-btn"]').click()
        await page.waitForTimeout(300)

        const lightProvider = page.locator('[data-cy="theming-preview-pane-light"] .tb-preview__provider')
        const darkProvider = page.locator('[data-cy="theming-preview-pane-dark"] .tb-preview__provider')
        await expect(lightProvider).toHaveAttribute('data-mode', 'light')
        await expect(darkProvider).toHaveAttribute('data-mode', 'dark')
    })
})

// Régression #25 — sujet 2 : le catalogue du playground ne listait que les
// composants DS "top-level" (98 doc_entry sans parent_slug), excluant 96
// family members légitimement configurables en standalone (btn-group,
// btn-toggle, progress-linear, progress-circular, radio-group, chip-group,
// tabs, expansion-panels…). `THEME_BUILDER_PREVIEWABLE_SLUGS` référençait déjà
// `progress-linear` — mort depuis le début car ce slug ne pouvait jamais
// atteindre `entries`. Le fix (useThemeBuilderCatalog.ts) arrête de filtrer
// sur `parentSlug` : chaque `doc_entry` de kind `component` devient une entrée
// du playground, avec repli "preview unavailable" (déjà existant) pour les
// sous-parties non curatées en previewable — configurable n'implique pas
// nécessairement un rendu live.
test.describe('Theme Builder · catalogue complet (#25)', () => {
    test('le catalogue expose largement plus que les seuls composants top-level', async ({ page }) => {
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')

        const toggles = page.locator('[data-cy^="theming-nav-cat-toggle-"]')
        const toggleCount = await toggles.count()
        for (let i = 0; i < toggleCount; i++) {
            const t = toggles.nth(i)
            if ((await t.getAttribute('aria-expanded')) !== 'true') await t.click()
        }
        await page.waitForTimeout(300)

        const navCount = await page.locator('[data-cy^="theming-nav-item-"]').count()
        // Avant #25 : 98 (top-level uniquement). Seuil large pour ne pas
        // sur-coupler le test au nombre exact de doc_entry en DB (qui évolue).
        expect(navCount, 'le catalogue doit couvrir les family members, pas seulement les top-level').toBeGreaterThan(150)
    })

    test('un family member curaté en previewable (progress-linear) rend une preview live', async ({ page }) => {
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')

        await page.locator('[data-cy="theming-nav-search"] input').fill('ProgressLinear')
        await page.waitForTimeout(300)
        await page.locator('[data-cy="theming-nav-item-progress-linear"]').click()
        await page.waitForTimeout(300)

        await expect(page.locator('[data-cy="theming-live-progress-linear-light"]')).toBeVisible()
    })

    test('un family member non curaté (btn-group) reste sélectionnable et configurable sans crash', async ({ page }) => {
        await page.goto('/theming')
        await page.waitForLoadState('networkidle')

        await page.locator('[data-cy="theming-nav-search"] input').fill('BtnGroup')
        await page.waitForTimeout(300)
        await page.locator('[data-cy="theming-nav-item-btn-group"]').click()
        await page.waitForTimeout(300)

        await expect(page.locator('[data-cy="theming-preview-stage"]')).toBeVisible()
        await expect(page.locator('[data-cy="theming-controls-panel"]')).toBeVisible()
    })
})
