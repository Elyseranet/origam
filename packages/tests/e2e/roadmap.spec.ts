/**
 * roadmap — spec e2e (DS-first)
 *
 * Vérifie que la page /roadmap utilise bien les composants origam :
 * - La page charge sans erreur JS console
 * - Le H1 hero est rendu par OrigamTitle (.origam-title)
 * - Les deux liens d'ancrage du hero sont des OrigamBtn et atterrissent SOUS
 *   l'app bar fixe (et non dessous, cachés)
 * - Le panneau de statut partitionne les 19 items en deux colonnes
 * - Les vagues 1-3 livrées tiennent dans UN panneau à trois sous-listes
 * - Les 4 phases sont des <details> natifs, « short term » ouvert par défaut
 * - Les avatars des phases sont des OrigamAvatar
 * - Les composants Wave 4 sont rendus en OrigamCard
 * - Les boutons CTA sont des OrigamBtn
 * - Audit a11y axe-core : 0 violation critical/serious
 *
 * ⛔ Ce fichier a été réécrit en même temps que la refonte de la page
 * (wireframe validé par le propriétaire). Les assertions retirées et
 * pourquoi :
 *   - `[data-cy="roadmap-wave-table"]` × 3 — les vagues livrées ne sont plus
 *     modélisées en `<origam-table>`. Deux colonnes dont l'une ne portait
 *     qu'une icône de puce ne sont pas des données tabulaires : c'est une
 *     liste, et elle est désormais rendue comme telle, dans un seul panneau
 *     au lieu de trois cartes.
 *   - `[data-cy="roadmap-timeline"]` et `.origam-timeline-item` — les phases
 *     ne sont plus une frise mais quatre `<details>`/`<summary>` natifs. La
 *     frise affichait 38 items dépliés d'un bloc, 4 203 px sur 11 892.
 * Les deux remplacements sont assertés ci-dessous, donc la couverture ne
 * baisse pas : elle change de cible en même temps que la page.
 *
 * Run :
 *   pnpm -F @origam/tests exec playwright test \
 *     --config=playwright.marketing.config.ts roadmap.spec.ts --project=chromium
 */

import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const BASE = '/roadmap'

test.describe('roadmap — DS-first', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(BASE)
        await page.waitForLoadState('networkidle')
    })

    test('la page se charge sans erreur JS console', async ({ page }) => {
        const errors: string[] = []
        page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
        await page.goto(BASE)
        await page.waitForLoadState('networkidle')
        const criticalErrors = errors.filter(e =>
            !e.includes('favicon') && !e.includes('DevTools')
        )
        expect(criticalErrors).toHaveLength(0)
    })

    test('le h1 hero est rendu par OrigamTitle (.origam-title)', async ({ page }) => {
        const heroTitle = page.locator('#roadmap-title')
        await expect(heroTitle).toBeVisible()
        await expect(heroTitle).toHaveClass(/origam-title/)
    })

    test('les titres de section sont des OrigamTitle (h2)', async ({ page }) => {
        const sectionTitles = page.locator(
            '#roadmap-status-title, #roadmap-delivered-title, #roadmap-phases-title, #roadmap-wave4-title, #roadmap-cta-title'
        )
        const count = await sectionTitles.count()
        expect(count).toBeGreaterThanOrEqual(4)
        for (let i = 0; i < count; i++) {
            await expect(sectionTitles.nth(i)).toHaveClass(/origam-title/)
        }
    })

    /*
     * Les deux liens d'ancrage du hero. L'assertion qui compte n'est pas
     * « le lien existe » mais « la cible est LISIBLE après le saut » : l'app
     * bar du site est en `position: fixed`, et sans `scroll-margin` le titre
     * visé atterrit à `top: 0`, donc entièrement sous la barre. Mesuré avant
     * correctif : `top: 0` sous une barre de 56 px. Le seuil ci-dessous est
     * la hauteur de barre, pas une marge de confort arbitraire.
     */
    test('les liens d\'ancrage du hero amènent leur cible sous l\'app bar fixe', async ({ page }) => {
        const bar = page.locator('.origam-app-bar').first()
        const barBox = await bar.boundingBox()
        const barHeight = barBox?.height ?? 0
        expect(barHeight).toBeGreaterThan(0)

        const jumps: Array<[string, string]> = [
            ['roadmap-hero-status-link', '#roadmap-status-title'],
            ['roadmap-hero-phases-link', '#roadmap-phases-title']
        ]

        for (const [cy, target] of jumps) {
            await page.goto(BASE)
            await page.waitForLoadState('networkidle')

            const link = page.locator(`[data-cy="${cy}"]`)
            await expect(link).toHaveClass(/origam-btn/)
            await link.click()
            await page.waitForTimeout(800)

            const box = await page.locator(target).boundingBox()
            expect(box).not.toBeNull()
            expect(box!.y).toBeGreaterThanOrEqual(barHeight)
        }
    })

    /*
     * Le panneau de statut : les 19 items d'origine sont TOUS conservés, mais
     * partitionnés en deux colonnes au lieu d'une liste plate. Le test somme
     * les deux colonnes plutôt que d'épingler 11 et 8 séparément — le partage
     * bouge à chaque mesure (une ligne passe de `done: false` à `done: true`),
     * le total ne bouge que si un item est réellement ajouté ou retiré.
     */
    test('le panneau de statut partitionne les 19 items en deux colonnes', async ({ page }) => {
        const panel = page.locator('[data-cy="roadmap-status-panel"]')
        await expect(panel).toBeVisible()
        await expect(panel).toHaveClass(/origam-sheet/)

        const live = page.locator('[data-cy="roadmap-status-live"] > li')
        const pending = page.locator('[data-cy="roadmap-status-pending"] > li')

        const liveCount = await live.count()
        const pendingCount = await pending.count()

        expect(liveCount).toBeGreaterThan(0)
        expect(pendingCount).toBeGreaterThan(0)
        expect(liveCount + pendingCount).toBe(19)
    })

    test('la date de mesure est rendue en pastille, pas noyée dans la prose', async ({ page }) => {
        const statusPill = page.locator('[data-cy="roadmap-status-measured"]')
        const overviewPill = page.locator('[data-cy="roadmap-overview-measured"]')

        await expect(statusPill).toBeVisible()
        await expect(statusPill).toHaveClass(/origam-chip/)
        await expect(overviewPill).toBeVisible()
        await expect(overviewPill).toHaveClass(/origam-chip/)
    })

    test('la section statut contient des OrigamIcon', async ({ page }) => {
        const statusSection = page.locator('[data-cy="roadmap-status"]')
        await expect(statusSection).toBeVisible()
        const icons = statusSection.locator('.origam-icon')
        const count = await icons.count()
        expect(count).toBeGreaterThan(0)
    })

    test('le bloc overview affiche 6 stats livrées (OrigamCard)', async ({ page }) => {
        const cards = page.locator('[data-cy="roadmap-overview"] .roadmap-overview__card')
        await expect(cards).toHaveCount(6)
        // Valeur exacte comptee dans l'arbre source du DS (96 dossiers sous
        // packages/ds/src/components/), et non un plancher arrondi. Elle est
        // pilotee par ROADMAP_OVERVIEW_STATS[0] dans
        // packages/marketing/src/consts/roadmap.const.ts : les deux bougent
        // ensemble ou ce test rougit.
        await expect(page.locator('.roadmap-overview__value').first()).toHaveText('96')
    })

    /*
     * La grille de chiffres a des colonnes EXPLICITES, pas `auto-fit`. Avec
     * `auto-fit, minmax(160px, 1fr)` à 1440 px, les 6 tuiles se casaient en
     * 5 + 1 et le « 3 » (token_tiers) restait seul sur sa ligne. 6 se divise
     * par 3 et par 2, donc aucun reste à aucun palier. Le test mesure les
     * positions réelles plutôt que la déclaration CSS : c'est l'orphelin qui
     * est le défaut, pas la propriété.
     */
    test('la grille de chiffres ne laisse aucune tuile orpheline', async ({ page }) => {
        const items = page.locator('[data-cy="roadmap-overview"] > li')
        await expect(items).toHaveCount(6)

        const tops: number[] = []
        for (let i = 0; i < 6; i++) {
            const box = await items.nth(i).boundingBox()
            tops.push(Math.round(box!.y))
        }

        const rows = new Map<number, number>()
        for (const top of tops) rows.set(top, (rows.get(top) ?? 0) + 1)

        const perRow = [...rows.values()]
        expect(perRow.length).toBe(2)
        expect(new Set(perRow).size).toBe(1)
    })

    /*
     * Les vagues 1-3 tiennent dans UN panneau. La vague 4 n'y est plus : elle
     * avait sa section dédiée 200 px plus bas, avec plus de détail. Le test
     * vérifie les deux moitiés de cette décision — trois sous-listes ici, et
     * aucune duplication du nom d'un composant de la vague 4 dans ce panneau.
     */
    test('les vagues livrées tiennent dans un panneau à trois sous-listes', async ({ page }) => {
        const panel = page.locator('[data-cy="roadmap-delivered-waves"]')
        await expect(panel).toBeVisible()
        await expect(panel).toHaveClass(/origam-sheet/)

        const waves = panel.locator('.roadmap-delivered__wave')
        await expect(waves).toHaveCount(3)

        for (let i = 0; i < 3; i++) {
            const items = waves.nth(i).locator('.roadmap-delivered__wave-item')
            expect(await items.count()).toBeGreaterThan(0)
        }

        // OrigamQRCode n'appartient qu'à la vague 4 : sa présence ici
        // signalerait le retour du doublon que la refonte a supprimé.
        await expect(panel.getByText('OrigamQRCode')).toHaveCount(0)
    })

    /*
     * Les phases sont des <details> NATIFS — pas OrigamExpansionPanel, qui
     * réimplémente la divulgation en JS + ARIA (`role="region"`,
     * `aria-controls`) là où l'élément natif la donne gratuitement, au
     * clavier et sans JS. Écart au skill `origam` assumé et documenté dans
     * la PR ; le skill `semantic-html` le prescrit explicitement.
     */
    test('les 4 phases sont des <details> natifs', async ({ page }) => {
        const phases = page.locator('[data-cy^="roadmap-phase-"]')
        await expect(phases).toHaveCount(4)

        for (let i = 0; i < 4; i++) {
            const tag = await phases.nth(i).evaluate(el => el.tagName)
            expect(tag).toBe('DETAILS')
            await expect(phases.nth(i).locator('> summary')).toHaveCount(1)
        }
    })

    test('seule la phase « short term » est ouverte par défaut', async ({ page }) => {
        const open = await page.locator('[data-cy^="roadmap-phase-"]')
            .evaluateAll(els => els
                .filter(el => (el as HTMLDetailsElement).open)
                .map(el => (el as HTMLElement).dataset.cy))

        expect(open).toEqual(['roadmap-phase-short-term'])
    })

    /*
     * Rien n'est coupé ni raccourci par le repli : chaque item garde son
     * titre ET sa description complète, y compris dans une phase fermée. Le
     * test lit le DOM d'une phase FERMÉE — `<details>` masque son contenu
     * sans le retirer, donc `textContent` reste lisible.
     */
    test('une phase fermée conserve chaque item, titre et description', async ({ page }) => {
        const mid = page.locator('[data-cy="roadmap-phase-mid-term"]')
        await expect(mid).toHaveJSProperty('open', false)

        const items = mid.locator('.roadmap-phases__item')
        await expect(items).toHaveCount(16)

        for (let i = 0; i < 16; i++) {
            const title = await items.nth(i).locator('.roadmap-phases__item-title').textContent()
            const desc = await items.nth(i).locator('.roadmap-phases__item-desc').textContent()
            expect((title ?? '').trim().length).toBeGreaterThan(0)
            expect((desc ?? '').trim().length).toBeGreaterThan(0)
        }
    })

    /*
     * Cible clavier et cible tactile. `<summary>` est focusable nativement,
     * Entrée l'actionne, et la zone doit atteindre 44 px de haut — le seuil
     * WCAG 2.5.5 que le brief impose.
     */
    test('un summary est actionnable au clavier et fait au moins 44 px', async ({ page }) => {
        const summary = page.locator('[data-cy="roadmap-phase-long-term"] > summary')
        const box = await summary.boundingBox()
        expect(box!.height).toBeGreaterThanOrEqual(44)

        const details = page.locator('[data-cy="roadmap-phase-long-term"]')
        await expect(details).toHaveJSProperty('open', false)

        await summary.focus()
        await page.keyboard.press('Enter')
        await expect(details).toHaveJSProperty('open', true)

        await page.keyboard.press('Enter')
        await expect(details).toHaveJSProperty('open', false)
    })

    test('le summary annonce le nombre d\'items de sa phase', async ({ page }) => {
        const counts = page.locator('.roadmap-phases__summary-count')
        await expect(counts).toHaveCount(4)
        for (let i = 0; i < 4; i++) {
            await expect(counts.nth(i)).toHaveText(/\d+/)
        }
    })

    test('les avatars des phases sont des OrigamAvatar (.origam-avatar)', async ({ page }) => {
        await page.locator('[data-cy="roadmap-phases"]').scrollIntoViewIfNeeded()
        await page.waitForTimeout(300)
        const avatars = page.locator('.roadmap-phases__item-avatar')
        const count = await avatars.count()
        expect(count).toBeGreaterThan(0)
        for (let i = 0; i < count; i++) {
            await expect(avatars.nth(i)).toHaveClass(/origam-avatar/)
        }
    })

    test('la grille Wave 4 (livrée) contient 15 OrigamCard (.origam-card)', async ({ page }) => {
        const grid = page.locator('[data-cy="roadmap-wave4-grid"]')
        await expect(grid).toBeVisible()
        const cards = page.locator('.roadmap-wave4__card')
        const count = await cards.count()
        expect(count).toBe(15)
        for (let i = 0; i < count; i++) {
            await expect(cards.nth(i)).toHaveClass(/origam-card/)
        }
    })

    test('les avatars Wave 4 sont des OrigamAvatar (.origam-avatar)', async ({ page }) => {
        await page.locator('[data-cy="roadmap-wave4"]').scrollIntoViewIfNeeded()
        const avatars = page.locator('.roadmap-wave4__avatar')
        const count = await avatars.count()
        expect(count).toBe(15)
        for (let i = 0; i < count; i++) {
            await expect(avatars.nth(i)).toHaveClass(/origam-avatar/)
        }
    })

    /*
     * Le composant s'appelle OrigamAudio — `packages/ds/src/components/Audio/
     * OrigamAudio.vue`, enregistré `<origam-audio>`. La page a annoncé
     * « OrigamSound » pendant toute la vie de la vague 4 : un import qui
     * échouerait. Ce test épingle le nom pour qu'il ne revienne pas.
     */
    test('la vague 4 nomme OrigamAudio, jamais OrigamSound', async ({ page }) => {
        const grid = page.locator('[data-cy="roadmap-wave4-grid"]')
        await expect(grid.getByText('OrigamAudio', { exact: true })).toHaveCount(1)
        await expect(page.getByText('OrigamSound')).toHaveCount(0)
    })

    test('les boutons CTA sont des OrigamBtn (.origam-btn)', async ({ page }) => {
        await page.locator('[data-cy="roadmap-cta"]').scrollIntoViewIfNeeded()
        const btns = page.locator('[data-cy="roadmap-cta-github"], [data-cy="roadmap-cta-changelog"]')
        const count = await btns.count()
        expect(count).toBe(2)
        for (let i = 0; i < count; i++) {
            await expect(btns.nth(i)).toHaveClass(/origam-btn/)
        }
    })

    test('le badge hero est un OrigamChip (.origam-chip)', async ({ page }) => {
        const badge = page.locator('[data-cy="roadmap-hero-badge"]')
        await expect(badge).toBeVisible()
        await expect(badge).toHaveClass(/origam-chip/)
    })

    test('audit a11y axe-core — 0 violation critical/serious', async ({ page }) => {
        const results = await new AxeBuilder({ page })
            .include('[data-cy="page-roadmap"]')
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

    /*
     * Une phase OUVERTE doit passer axe aussi : le `<h3>` vit à l'intérieur
     * du `<summary>` (content model : phrasing + heading content), et la
     * grille d'items est une `<ul>` dont chaque `<li>` porte un avatar
     * `aria-hidden`. C'est l'état que 100 % des lecteurs voient en arrivant.
     */
    test('audit a11y — phases ouvertes', async ({ page }) => {
        await page.locator('[data-cy^="roadmap-phase-"] > summary')
            .evaluateAll(els => els.forEach(el => {
                (el.parentElement as HTMLDetailsElement).open = true
            }))
        await page.waitForTimeout(300)

        const results = await new AxeBuilder({ page })
            .include('[data-cy="roadmap-phases"]')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze()
        const critical = results.violations.filter(v =>
            v.impact === 'critical' || v.impact === 'serious'
        )
        if (critical.length > 0) {
            console.error('A11y violations (open phases):', JSON.stringify(critical.map(v => ({
                id: v.id,
                impact: v.impact,
                nodes: v.nodes.length
            })), null, 2))
        }
        expect(critical).toHaveLength(0)
    })
})
