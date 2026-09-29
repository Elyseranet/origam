/**
 * components — spec e2e (DS-first)
 *
 * Vérifie que /components et /components/{slug} fonctionnent correctement :
 * - /components charge sans erreur JS console
 * - /components affiche des OrigamCard cliquables vers /components/*
 * - /components/btn charge avec Props OrigamTable non vide
 * - /components/btn affiche la section composants liés (BtnGroup/BtnToggle)
 * - Zéro HTML brut interdit (pas de h1..h6, ul/li natifs au niveau page)
 * - Audit a11y axe-core : 0 violation critical/serious (exclusion .origam-code__code)
 *
 * Run :
 *   pnpm exec playwright test components.spec.ts \
 *     --config=playwright.marketing.config.ts
 *   (depuis packages/tests/)
 */

import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('/components — catalogue', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/components')
        await page.waitForLoadState('networkidle')
    })

    test('la page se charge avec status 200 et sans erreur JS console', async ({ page }) => {
        const errors: string[] = []
        page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
        await page.goto('/components')
        await page.waitForLoadState('networkidle')
        const critical = errors.filter(e =>
            !e.includes('favicon') && !e.includes('DevTools') && !e.includes('404')
        )
        expect(critical).toHaveLength(0)

        await expect(page.locator('[data-cy="page-components"]')).toBeVisible()
    })

    test('le h1 hero est rendu par OrigamTitle (.origam-title)', async ({ page }) => {
        const heroTitle = page.locator('#components-title')
        await expect(heroTitle).toBeVisible()
        await expect(heroTitle).toHaveClass(/origam-title/)
    })

    test('le badge hero est un OrigamChip (.origam-chip)', async ({ page }) => {
        const badge = page.locator('[data-cy="components-hero-badge"]')
        await expect(badge).toBeVisible()
        await expect(badge).toHaveClass(/origam-chip/)
    })

    test('les cards de composants sont des OrigamCard et ont un lien vers /components/*', async ({ page }) => {
        const cardLinks = page.locator('[data-cy^="components-card-"]')
        const count = await cardLinks.count()
        expect(count).toBeGreaterThan(10)

        const firstCardLink = cardLinks.first()
        const firstCard = firstCardLink.locator('.origam-card').first()
        await expect(firstCard).toHaveClass(/origam-card/)

        const href = await firstCardLink.evaluate((el) => (el as HTMLAnchorElement).href)
        expect(href).toMatch(/\/components\/[a-z]/)
    })

    test('le catalogue est groupé par catégorie avec des OrigamTitle h3', async ({ page }) => {
        const categoryTitles = page.locator('.components-category__title')
        const count = await categoryTitles.count()
        expect(count).toBeGreaterThanOrEqual(5)
        for (let i = 0; i < count; i++) {
            await expect(categoryTitles.nth(i)).toHaveClass(/origam-title/)
        }
    })

    test('la grid de composants est présente dans chaque catégorie', async ({ page }) => {
        const grids = page.locator('.components-category__grid')
        const count = await grids.count()
        expect(count).toBeGreaterThanOrEqual(5)
    })

    test('les chips famille sont des OrigamChip sur les composants avec famille', async ({ page }) => {
        const familyChips = page.locator('.components-catalog-card__family-chip')
        const count = await familyChips.count()
        expect(count).toBeGreaterThan(0)
        for (let i = 0; i < Math.min(count, 5); i++) {
            await expect(familyChips.nth(i)).toHaveClass(/origam-chip/)
        }
    })

    test('audit a11y axe-core /components — 0 violation critical/serious', async ({ page }) => {
        const results = await new AxeBuilder({ page })
            .include('[data-cy="page-components"]')
            .exclude('.origam-code__code')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze()
        const critical = results.violations.filter(v =>
            v.impact === 'critical' || v.impact === 'serious'
        )
        if (critical.length > 0) {
            console.error('A11y violations:', JSON.stringify(critical.map(v => ({
                id: v.id,
                impact: v.impact,
                description: v.description,
                nodes: v.nodes.length
            })), null, 2))
        }
        expect(critical).toHaveLength(0)
    })
})

test.describe('/components/btn — page détail', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/components/btn')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(500)
    })

    test('la page se charge sans erreur JS console', async ({ page }) => {
        const errors: string[] = []
        page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
        await page.goto('/components/btn')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(500)
        const critical = errors.filter(e =>
            !e.includes('favicon') && !e.includes('DevTools') && !e.includes('404')
        )
        expect(critical).toHaveLength(0)
    })

    test('le titre hero contient OrigamTitle avec le nom du composant', async ({ page }) => {
        const heroTitle = page.locator('#component-title')
        await expect(heroTitle).toBeVisible()
        await expect(heroTitle).toHaveClass(/origam-title/)
        const text = await heroTitle.textContent()
        expect(text?.trim().toLowerCase()).toContain('btn')
    })

    test('le hero affiche le bouton import copier du composant', async ({ page }) => {
        const importBtn = page.locator('[data-cy="component-import-btn-btn"]')
        await expect(importBtn).toBeVisible()
        const text = await importBtn.textContent()
        expect(text).toContain('OrigamBtn')
    })

    test('la prop-list Props est non vide (dl > .prop-list__item)', async ({ page }) => {
        const propsSection = page.locator('[data-cy="component-props"]')
        await expect(propsSection).toBeVisible()

        const propList = page.locator('[data-cy="component-props-table"]')
        await expect(propList).toBeVisible()

        const propRows = propList.locator('.prop-list__item')
        const count = await propRows.count()
        expect(count).toBeGreaterThan(5)
    })

    test('la prop-list Emits est présente et non vide', async ({ page }) => {
        const emitsList = page.locator('[data-cy="component-emits-table"]')
        await expect(emitsList).toBeVisible()

        const emitRows = emitsList.locator('.prop-list__item')
        const count = await emitRows.count()
        expect(count).toBeGreaterThanOrEqual(1)
    })

    test('la prop-list Slots est présente et non vide', async ({ page }) => {
        const slotsList = page.locator('[data-cy="component-slots-table"]')
        await expect(slotsList).toBeVisible()

        const slotRows = slotsList.locator('.prop-list__item')
        const count = await slotRows.count()
        expect(count).toBeGreaterThanOrEqual(1)
    })

    test('la section Anatomy est présente avec SVG + légende property-list', async ({ page }) => {
        const anatomySection = page.locator('[data-cy="component-anatomy"]')
        await expect(anatomySection).toBeVisible()

        const anatomySvg = anatomySection.locator('svg[role="img"]')
        await expect(anatomySvg).toBeVisible()

        const legendList = page.locator('[data-cy="component-anatomy-table"]')
        await expect(legendList).toBeVisible()
        const items = legendList.locator('.component-anatomy__legend-item')
        const count = await items.count()
        expect(count).toBeGreaterThanOrEqual(4)
    })

    test('la prop-list Exposed Members est présente et liste defineExpose()', async ({ page }) => {
        const exposedSection = page.locator('[data-cy="component-exposed"]')
        await expect(exposedSection).toBeVisible()

        const exposedList = page.locator('[data-cy="component-exposed-table"]')
        await expect(exposedList).toBeVisible()

        const rows = exposedList.locator('.prop-list__item')
        const count = await rows.count()
        expect(count).toBeGreaterThanOrEqual(1)
    })

    test('la prop-list CSS Variables est présente avec les vars --origam-btn', async ({ page }) => {
        const cssVarsSection = page.locator('[data-cy="component-css-vars"]')
        await expect(cssVarsSection).toBeVisible()

        const cssVarsList = page.locator('[data-cy="component-css-vars-table"]')
        await expect(cssVarsList).toBeVisible()

        const rows = cssVarsList.locator('.prop-list__item')
        const count = await rows.count()
        expect(count).toBeGreaterThanOrEqual(5)
    })

    test('la section Accessibility est présente avec rôles ARIA et navigation clavier', async ({ page }) => {
        const a11ySection = page.locator('[data-cy="component-a11y"]')
        await expect(a11ySection).toBeVisible()

        const roleChips = a11ySection.locator('.component-a11y__role-chip')
        const chipCount = await roleChips.count()
        expect(chipCount).toBeGreaterThanOrEqual(1)
    })

    test('la section Design Tokens est présente avec le tableau DTCG', async ({ page }) => {
        const tokensSection = page.locator('[data-cy="component-tokens"]')
        await expect(tokensSection).toBeVisible()

        const tokensTable = page.locator('[data-cy="component-tokens-table"]')
        await expect(tokensTable).toBeVisible()

        /*
         * ⛔ `.prop-list__item`, PAS `tbody tr`.
         *
         * Ce test comptait des `tbody tr` et rendait donc TOUJOURS 0, quelle
         * que soit la donnee : la section n'a jamais contenu de `<table>`.
         * C'est un `<dl class="prop-list">` dont chaque ligne est un
         * `<div class="prop-list__item">` — verifie, zero occurrence de
         * `<table>`, `<tbody>` ou `<tr>` dans tout le bloc.
         *
         * Le defaut etait donc dans l'assertion, pas dans le produit ni dans
         * les fixtures : mesure en base sur un seed frais, `btn` porte bien
         * 8 lignes de `kind_extra.tokens.excerpt`, et 127 des 218 composants
         * en ont au moins une.
         *
         * Un test qui cherche une forme inexistante echoue sur du code
         * correct — et il a masque une fonctionnalite qui marchait.
         */
        const rows = tokensTable.locator('.prop-list__item')
        const count = await rows.count()
        expect(count, `la section tokens rend ${ count } ligne(s) pour btn — la base en contient 8`).toBeGreaterThanOrEqual(3)
    })

    test('le playground est présent et son bouton live répond aux changements de contrôle', async ({ page }) => {
        const playgroundSection = page.locator('[data-cy="component-playground"]')
        await expect(playgroundSection).toBeVisible()

        const preview = page.locator('[data-cy="playground-preview"]')
        await expect(preview).toBeVisible()

        const generatedCode = page.locator('[data-cy="playground-generated-code"]')
        await expect(generatedCode).toBeVisible()
        await expect(generatedCode).toHaveClass(/origam-code/)

        const liveBtn = page.locator('[data-cy="playground-live-btn"]')
        await expect(liveBtn).toBeVisible()
        await expect(liveBtn).toHaveClass(/origam-btn/)

        const initialCodeText = await generatedCode.textContent()

        const disabledCtrl = page.locator('[data-cy="playground-ctrl-disabled"]')
        await expect(disabledCtrl).toBeVisible()
        const switchEl = disabledCtrl.locator('.origam-switch input[type="checkbox"]')
        if (await switchEl.count() > 0) {
            await switchEl.check({ force: true })
            await page.waitForTimeout(200)
            const updatedCodeText = await generatedCode.textContent()
            expect(updatedCodeText).not.toBe(initialCodeText)
        }
    })

    test('la section Composants liés contient BtnGroup et BtnToggle', async ({ page }) => {
        const familySection = page.locator('[data-cy="component-family"]')
        await expect(familySection).toBeVisible()

        const btnGroupLink = page.locator('[data-cy="component-family-card-btn-group"]')
        await expect(btnGroupLink).toBeVisible()
        await expect(btnGroupLink.locator('.origam-card').first()).toHaveClass(/origam-card/)

        const btnToggleLink = page.locator('[data-cy="component-family-card-btn-toggle"]')
        await expect(btnToggleLink).toBeVisible()
        await expect(btnToggleLink.locator('.origam-card').first()).toHaveClass(/origam-card/)
    })

    test('les cards famille ont un href vers /components/{slug}', async ({ page }) => {
        const btnGroupLink = page.locator('[data-cy="component-family-card-btn-group"]')
        await expect(btnGroupLink).toBeVisible()
        const btnGroupCard = btnGroupLink.locator('.origam-card').first()
        await expect(btnGroupCard).toHaveClass(/origam-card/)
        const href = await btnGroupLink.evaluate((el) => (el as HTMLAnchorElement).href)
        expect(href).toContain('/components/btn-group')
    })

    test('la section Examples est présente avec OrigamCode', async ({ page }) => {
        const examplesSection = page.locator('[data-cy="component-examples"]')
        await expect(examplesSection).toBeVisible()

        const codeBlocks = examplesSection.locator('.origam-code')
        const count = await codeBlocks.count()
        expect(count).toBeGreaterThanOrEqual(1)
    })

    test('le lien breadcrumb "Components" renvoie vers /components', async ({ page }) => {
        const breadcrumbLink = page.locator('[data-cy="component-breadcrumb-catalog"]')
        await expect(breadcrumbLink).toBeVisible()
        const href = await breadcrumbLink.getAttribute('href')
        expect(href).toBe('/components')
    })

    test('le ToC flottant liste les nouvelles sections enrichies', async ({ page }) => {
        const toc = page.locator('[data-cy="component-toc"]')
        await expect(toc).toBeVisible()

        const tocLinks = toc.locator('.component-toc__link')
        const count = await tocLinks.count()
        expect(count).toBeGreaterThanOrEqual(8)

        const labels = await tocLinks.allTextContents()
        const normalized = labels.map(l => l.trim().toLowerCase())
        expect(normalized.some(l => l.includes('anatomy') || l.includes('anatomie'))).toBeTruthy()
        expect(normalized.some(l => l.includes('playground'))).toBeTruthy()
        expect(normalized.some(l => l.includes('css'))).toBeTruthy()
    })

    test('audit a11y axe-core /components/btn — 0 violation critical/serious', async ({ page }) => {
        const results = await new AxeBuilder({ page })
            .include(`[data-cy="page-component-btn"]`)
            .exclude('.origam-code__code')
            .exclude('[data-cy="component-playground"]')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze()
        const critical = results.violations.filter(v =>
            v.impact === 'critical' || v.impact === 'serious'
        )
        if (critical.length > 0) {
            console.error('A11y violations:', JSON.stringify(critical.map(v => ({
                id: v.id,
                impact: v.impact,
                description: v.description,
                nodes: v.nodes.length
            })), null, 2))
        }
        expect(critical).toHaveLength(0)
    })
})

test.describe('/components/btn-group — page sous-composant', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/components/btn-group')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(500)
    })

    test('la page se charge avec le nom BtnGroup', async ({ page }) => {
        await expect(page.locator('[data-cy="page-component-btn-group"]')).toBeVisible()
        const heroTitle = page.locator('#component-title')
        await expect(heroTitle).toBeVisible()
        const text = await heroTitle.textContent()
        expect(text?.trim().toLowerCase()).toContain('btngroup')
    })

    test('le lien breadcrumb parent pointe vers /components/btn', async ({ page }) => {
        const parentLink = page.locator('[data-cy="component-breadcrumb-parent-btn"]')
        await expect(parentLink).toBeVisible()
        const href = await parentLink.getAttribute('href')
        expect(href).toBe('/components/btn')
    })
})

test.describe('/components/unknown-slug — fallback 404', () => {
    test('la page affiche le fallback not-found sans crash', async ({ page }) => {
        await page.goto('/components/this-slug-does-not-exist-xyz')
        await page.waitForLoadState('networkidle')

        const notFound = page.locator('[data-cy="component-not-found"]')
        await expect(notFound).toBeVisible()

        const backBtn = page.locator('[data-cy="component-not-found-back"]')
        await expect(backBtn).toBeVisible()
        await expect(backBtn).toHaveClass(/origam-btn/)
    })
})
