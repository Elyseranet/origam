/*
 * #614 — OrigamInlineEdit : Confirmer / Annuler doivent etre ATTEIGNABLES
 * puis ACTIONNABLES au clavier seul.
 *
 * ⛔ POURQUOI CE FICHIER EXISTE
 * Le ticket accusait `nested-interactive`. La mesure dit autre chose :
 * `confirmOnBlur` (actif par defaut) ecoutait `@blur` sur le CHAMP et
 * confirmait sans regarder ou partait le focus. Un seul `Tab` sortait donc
 * du mode edition et DEMONTAIT les deux boutons avant que le focus puisse
 * les atteindre. Mesure Chromium d'avant correctif, story InlineEdit,
 * `showActions` actif :
 *
 *   entree en edition   activeElement = input    bouton Confirmer present
 *   Tab #1              activeElement = body     bouton Confirmer ABSENT
 *   Tab #2              activeElement = button.origam-inline-edit__display
 *
 * La souris n'y echappait que grace au `@mousedown.prevent` pose sur chaque
 * bouton ; le clavier n'avait aucun equivalent.
 *
 * ⛔ CE QUE CE FICHIER ASSERT
 * Les touches sont REELLEMENT enfoncees (`page.keyboard.press`) et c'est le
 * RESULTAT qui est assert — `document.activeElement`, la valeur committee,
 * le mode edition — jamais la simple presence d'un gestionnaire.
 *
 * A/B : ce fichier ROUGIT sur le commit parent (voir l'entete de la PR).
 */
import { expect, test, type Page } from '@playwright/test'

import { toggleHstCheckbox } from './_support/histoire-controls'

const STORY = '/stories/story/components-stories-inlineedit-origaminlineedit-story-vue'

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

/**
 * Identifiant lisible de `document.activeElement` DANS le sandbox.
 *
 * Le `data-cy` le plus proche en remontant, parce que le `<input>` natif
 * n'en porte pas : `data-cy="origam-inline-edit-input"` est pose sur le
 * `<OrigamTextField>` qui l'enveloppe. Sans cette remontee, un focus
 * parfaitement correct sur le champ se lit `"input"` et ressemble a un
 * defaut.
 */
const activeId = (page: Page) => sandboxOf(page).locator('body').evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el) return 'null'
    if (el === document.body) return 'body'
    const owner = el.closest('[data-cy]')
    if (owner) return owner.getAttribute('data-cy') as string
    return el.tagName.toLowerCase()
})

const editState = (page: Page) => sandboxOf(page).locator('body').evaluate(() => ({
    editing: !!document.querySelector('[data-cy="origam-inline-edit-input"]'),
    confirmBtn: !!document.querySelector('[data-cy="origam-inline-edit-action-confirm"]'),
    cancelBtn: !!document.querySelector('[data-cy="origam-inline-edit-action-cancel"]'),
    // `<output class="story-state">` de la story : la valeur REELLEMENT
    // committee dans le v-model du parent, pas le brouillon interne.
    committed: (document.querySelector('.story-state')?.textContent ?? '').trim()
}))

/** Ouvre la Variant Functional, active `showActions`, entre en edition. */
const enterEdit = async (page: Page) => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText('Functional', { exact: true }).first().click()
    await page.waitForTimeout(1200)
    await page.getByRole('checkbox', { name: 'Show Actions', exact: true }).waitFor({ timeout: 20_000 })
    await toggleHstCheckbox(page, 'Show Actions')
    await page.waitForTimeout(500)
    await sandboxOf(page).locator('[data-cy="origam-inline-edit-display"]').first().click()
    await page.waitForTimeout(600)

    // Point de depart garanti : le champ a bien le focus.
    expect(await activeId(page)).toBe('origam-inline-edit-input')
}

const typeDraft = async (page: Page, value: string) => {
    await sandboxOf(page).locator('[data-cy="origam-inline-edit-input"] input').first().fill(value)
    await page.waitForTimeout(150)
}

test.describe('#614 — Confirmer / Annuler au clavier', () => {
    test('un Tab depuis le champ atteint Confirmer, un second atteint Annuler', async ({ page }) => {
        await enterEdit(page)

        await page.keyboard.press('Tab')
        await page.waitForTimeout(300)

        // ⛔ L'assertion du defaut : avant correctif, `body` — les boutons
        // avaient deja ete demontes par le confirm-au-blur.
        expect(await activeId(page)).toBe('origam-inline-edit-action-confirm')
        expect(await editState(page)).toMatchObject({ editing: true, confirmBtn: true, cancelBtn: true })

        await page.keyboard.press('Tab')
        await page.waitForTimeout(300)

        expect(await activeId(page)).toBe('origam-inline-edit-action-cancel')
        expect((await editState(page)).editing).toBe(true)
    })

    test('Entree sur Confirmer commite, et le focus revient sur l\'affichage', async ({ page }) => {
        await enterEdit(page)
        await typeDraft(page, 'valeur-clavier')

        await page.keyboard.press('Tab')
        await page.waitForTimeout(300)
        expect(await activeId(page)).toBe('origam-inline-edit-action-confirm')

        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)

        const after = await editState(page)
        expect(after.editing).toBe(false)
        expect(after.committed).toBe('valeur-clavier')

        // Le focus ne doit pas retomber sur `body` : le point d'insertion
        // du clavier serait perdu et la tabulation repartirait du debut.
        expect(await activeId(page)).toBe('origam-inline-edit-display')
    })

    test('Entree sur Annuler ANNULE — elle ne confirme pas', async ({ page }) => {
        await enterEdit(page)
        const before = (await editState(page)).committed
        await typeDraft(page, 'ne-doit-jamais-etre-commite')

        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        await page.waitForTimeout(300)
        expect(await activeId(page)).toBe('origam-inline-edit-action-cancel')

        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)

        const after = await editState(page)
        expect(after.editing).toBe(false)
        // Avant correctif : "ne-doit-jamais-etre-commite". Le `keydown`
        // du bouton remontait dans `handleKeyDown` du champ, qui prenait
        // la branche `confirmOnEnter`.
        expect(after.committed, 'Annuler ne doit rien commiter').toBe(before)
    })

    test('Espace sur Annuler abandonne le brouillon, et le focus revient sur l\'affichage', async ({ page }) => {
        await enterEdit(page)
        const before = (await editState(page)).committed
        await typeDraft(page, 'jete-a-la-poubelle')

        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        await page.waitForTimeout(300)
        expect(await activeId(page)).toBe('origam-inline-edit-action-cancel')

        await page.keyboard.press('Space')
        await page.waitForTimeout(500)

        const after = await editState(page)
        expect(after.editing).toBe(false)
        expect(after.committed).toBe(before)
        expect(await activeId(page)).toBe('origam-inline-edit-display')
    })

    test('confirmOnBlur SURVIT : tabuler hors du composant commite toujours', async ({ page }) => {
        await enterEdit(page)
        await typeDraft(page, 'sortie-par-tabulation')

        // champ -> Confirmer -> Annuler -> DEHORS
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        await page.waitForTimeout(500)

        const after = await editState(page)
        expect(after.editing, 'sortir du composant doit toujours quitter le mode edition').toBe(false)
        expect(after.committed, 'et commiter — c\'est ce que promet confirmOnBlur').toBe('sortie-par-tabulation')

        // Le focus est parti de lui-meme : on ne le rapatrie pas.
        expect(await activeId(page)).not.toBe('origam-inline-edit-display')
    })

    test('Echap depuis le champ annule toujours (raccourci preexistant)', async ({ page }) => {
        await enterEdit(page)
        const before = (await editState(page)).committed
        await typeDraft(page, 'annule-par-echap')

        await page.keyboard.press('Escape')
        await page.waitForTimeout(400)

        const after = await editState(page)
        expect(after.editing).toBe(false)
        expect(after.committed).toBe(before)
    })
})
