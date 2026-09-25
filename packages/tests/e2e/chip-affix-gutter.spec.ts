import { expect, test } from '@playwright/test'

/**
 * #957 — `OrigamChip` : la gouttière entre les zones `prepend` / `append` et
 * le libellé.
 *
 * ## Le défaut épinglé ici
 *
 * `__close` possédait ses deux canaux de marge depuis toujours ; `__prepend`
 * et `__append` n'en avaient AUCUN. Une puce avec icône rendait donc son
 * icône collée au texte — écart mesuré 0 px, `margin-inline-end: 0px`,
 * `gap: normal`, sur les 8 identités — et aucun thème ne pouvait corriger
 * l'espacement puisque le canal n'existait pas.
 *
 * ## Les deux moitiés du critère
 *
 * 1. **Puce AVEC libellé** → gouttière de 6 px, et un écart géométrique
 *    strictement positif entre le bord de l'affixe et le bord du contenu.
 * 2. **Puce SANS libellé** (icône seule) → gouttière NULLE. C'est le contrôle
 *    négatif, et c'est lui qui interdit la correction naïve : `__content` n'a
 *    pas de `v-if`, donc une puce icône-seule rend quand même un
 *    `<div class="origam-chip__content">` vide, et une marge inconditionnelle
 *    y accrocherait un fantôme de 6 px sur 217 emplacements.
 *
 * Le discriminant est `:empty` (mesuré en Chromium : le nœud texte vide que
 * Vue émet pour `{{ text }}` satisfait `:empty`), consommé via
 * `:has(+ …)` côté `prepend` — l'élément dont il dépend est son frère SUIVANT
 * — et via un simple `+` côté `append`.
 *
 * ## A/B contre `HEAD~1`
 *
 * Les quatre tests de gouttière positive échouent sur le commit parent
 * (`0px` au lieu de `6px`, écart géométrique 0). Les deux contrôles négatifs
 * passent avant ET après — c'est leur rôle : ils prouvent que la correction
 * n'a pas ajouté de fantôme, pas qu'elle a eu lieu.
 *
 * ## Navigation
 *
 * Voir le RECIPE en tête de `chip.spec.ts`. Les ids de variant sont
 * POSITIONNELS ; les deux fixtures icône-seule ont donc été ajoutées DANS les
 * variants existants « Slots - Prepend » (10) et « Slots - Append » (11)
 * plutôt que dans de nouveaux variants, pour ne décaler aucun index.
 */

const STORY_ID = 'components-stories-chip-origamchip-story-vue'

const sandboxUrl = (idx: number) =>
    `/stories/__sandbox.html?storyId=${STORY_ID}&variantId=${STORY_ID}-${idx}`

/** Index du variant « Slots - Prepend ». */
const VARIANT_SLOTS_PREPEND = 10
/** Index du variant « Slots - Append ». */
const VARIANT_SLOTS_APPEND = 11

/** La valeur par défaut du canal, reprise de `__close---margin-inline-start`. */
const EXPECTED_GUTTER = '6px'

test.describe('OrigamChip — gouttière prepend / append (#957)', () => {
    test.setTimeout(60000)

    // ------------------------------------------------------------------ //
    // PREPEND — puce AVEC libellé : la gouttière existe                   //
    // ------------------------------------------------------------------ //

    test('prepend + libellé : margin-inline-end = 6px et écart géométrique > 0', async ({ page }) => {
        await page.goto(sandboxUrl(VARIANT_SLOTS_PREPEND), { waitUntil: 'domcontentloaded' })

        const chip = page.locator('.origam-chip').first()
        await expect(chip).toBeVisible({ timeout: 30000 })
        await expect(chip).toContainText('With prepend')

        const prepend = chip.locator('.origam-chip__prepend')
        await expect(prepend).toBeVisible()

        // Le canal lui-même. `margin-inline-end` est un longhand : pas de
        // substitution différée, `getComputedStyle` le résout (contrairement à
        // un shorthand comme `margin`, qui rend `""` dès qu'un var() traîne).
        await expect(prepend).toHaveCSS('margin-inline-end', EXPECTED_GUTTER)

        // Et le résultat GÉOMÉTRIQUE — c'est ce que l'utilisateur voit. Une
        // marge correcte mais annulée par un `gap`/`padding` négatif ailleurs
        // ne passerait pas cette seconde assertion.
        const gap = await chip.evaluate((el) => {
            const affix = el.querySelector('.origam-chip__prepend')!.getBoundingClientRect()
            const content = el.querySelector('.origam-chip__content')!.getBoundingClientRect()

            return Math.round(content.left - affix.right)
        })

        expect(gap).toBe(6)
    })

    // ------------------------------------------------------------------ //
    // PREPEND — puce SANS libellé : contrôle négatif, aucun fantôme       //
    // ------------------------------------------------------------------ //

    test('prepend sans libellé : aucune gouttière fantôme', async ({ page }) => {
        await page.goto(sandboxUrl(VARIANT_SLOTS_PREPEND), { waitUntil: 'domcontentloaded' })

        const chip = page.locator('[data-cy="chip-prepend-only"]')
        await expect(chip).toBeVisible({ timeout: 30000 })

        // La prémisse du contrôle : le contenu est bien rendu (pas de `v-if`)
        // ET il est bien vide au sens de `:empty`. Sans cette vérification, un
        // `__content` absent ferait passer le test pour la mauvaise raison.
        const premise = await chip.evaluate((el) => {
            const content = el.querySelector('.origam-chip__content')

            return {
                contentRendered: content !== null,
                matchesEmpty: content ? content.matches(':empty') : null
            }
        })

        expect(premise.contentRendered).toBe(true)
        expect(premise.matchesEmpty).toBe(true)

        await expect(chip.locator('.origam-chip__prepend')).toHaveCSS('margin-inline-end', '0px')
    })

    // ------------------------------------------------------------------ //
    // APPEND — puce AVEC libellé : la gouttière existe                    //
    // ------------------------------------------------------------------ //

    test('append + libellé : margin-inline-start = 6px et écart géométrique > 0', async ({ page }) => {
        await page.goto(sandboxUrl(VARIANT_SLOTS_APPEND), { waitUntil: 'domcontentloaded' })

        const chip = page.locator('.origam-chip').first()
        await expect(chip).toBeVisible({ timeout: 30000 })
        await expect(chip).toContainText('With append')

        const append = chip.locator('.origam-chip__append')
        await expect(append).toBeVisible()
        await expect(append).toHaveCSS('margin-inline-start', EXPECTED_GUTTER)

        const gap = await chip.evaluate((el) => {
            const affix = el.querySelector('.origam-chip__append')!.getBoundingClientRect()
            const content = el.querySelector('.origam-chip__content')!.getBoundingClientRect()

            return Math.round(affix.left - content.right)
        })

        expect(gap).toBe(6)
    })

    // ------------------------------------------------------------------ //
    // APPEND — puce SANS libellé : contrôle négatif                       //
    // ------------------------------------------------------------------ //

    test('append sans libellé : aucune gouttière fantôme', async ({ page }) => {
        await page.goto(sandboxUrl(VARIANT_SLOTS_APPEND), { waitUntil: 'domcontentloaded' })

        const chip = page.locator('[data-cy="chip-append-only"]')
        await expect(chip).toBeVisible({ timeout: 30000 })

        const premise = await chip.evaluate((el) => {
            const content = el.querySelector('.origam-chip__content')

            return {
                contentRendered: content !== null,
                matchesEmpty: content ? content.matches(':empty') : null
            }
        })

        expect(premise.contentRendered).toBe(true)
        expect(premise.matchesEmpty).toBe(true)

        await expect(chip.locator('.origam-chip__append')).toHaveCSS('margin-inline-start', '0px')
    })

    // ------------------------------------------------------------------ //
    // LE CANAL EST RÉELLEMENT THÉMABLE                                    //
    // ------------------------------------------------------------------ //
    //
    // Le défaut d'origine n'était pas « une valeur mal réglée » mais « le
    // canal n'existe pas » : un thème n'avait AUCUN moyen d'agir. Ces deux
    // tests le prouvent en poussant le token et en remesurant. La mutation et
    // la lecture tiennent dans un seul `evaluate` (règle switch-density : Vue
    // re-patche entre deux étapes), et elles portent sur l'élément muté
    // lui-même, pas sur un descendant.

    test('le token prepend est vivant : 6px → 20px', async ({ page }) => {
        await page.goto(sandboxUrl(VARIANT_SLOTS_PREPEND), { waitUntil: 'domcontentloaded' })

        const chip = page.locator('.origam-chip').first()
        await expect(chip).toBeVisible({ timeout: 30000 })

        const measured = await chip.evaluate((el) => {
            const affix = el.querySelector('.origam-chip__prepend') as HTMLElement
            const before = getComputedStyle(affix).marginInlineEnd

            el.setAttribute('style', '--origam-chip__prepend---margin-inline-end: 20px')

            return { before, after: getComputedStyle(affix).marginInlineEnd }
        })

        expect(measured.before).toBe(EXPECTED_GUTTER)
        expect(measured.after).toBe('20px')
    })

    test('le token append est vivant : 6px → 20px', async ({ page }) => {
        await page.goto(sandboxUrl(VARIANT_SLOTS_APPEND), { waitUntil: 'domcontentloaded' })

        const chip = page.locator('.origam-chip').first()
        await expect(chip).toBeVisible({ timeout: 30000 })

        const measured = await chip.evaluate((el) => {
            const affix = el.querySelector('.origam-chip__append') as HTMLElement
            const before = getComputedStyle(affix).marginInlineStart

            el.setAttribute('style', '--origam-chip__append---margin-inline-start: 20px')

            return { before, after: getComputedStyle(affix).marginInlineStart }
        })

        expect(measured.before).toBe(EXPECTED_GUTTER)
        expect(measured.after).toBe('20px')
    })
})
