import { expect, test, type Page } from '@playwright/test'

import { toggleHstCheckbox } from './_support/histoire-controls'

/**
 * #396 — un groupe de cases a cocher DOIT accumuler, dans un vrai navigateur.
 *
 * Le verdict de jsdom ne suffit pas ici : le symptome rapporte est visuel
 * (« chaque clic ecrase le precedent »), et le mainteneur a explicitement mis
 * en doute la STORY plutot que le composant. Ce spec clique donc reellement,
 * a la souris, dans la story servie — et mesure ce que l'utilisateur voit :
 * combien de cases restent cochees.
 *
 * Il couvre les deux stories concernees :
 *   - Checkbox/OrigamCheckboxGroup   (le composant de groupe dedie)
 *   - SelectionControl/OrigamSelectionControlGroup (le primitif sous-jacent)
 *
 * ⛔ Le test epingle les DEUX sens, et c'est deliberé : accumulation quand le
 * mode multiple est actif, exclusion mutuelle quand il ne l'est pas. Sans
 * cette seconde moitie, un futur « correctif » qui forcerait le mode multiple
 * partout — et casserait donc le mode exclusif — passerait inapercu.
 */

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storySlug: string, variant: string) => {
    await page.goto(`/stories/story/${ storySlug }`)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

const CHECKBOX_GROUP = 'components-stories-checkbox-origamcheckboxgroup-story-vue'
const SELECTION_GROUP = 'components-stories-selectioncontrol-origamselectioncontrolgroup-story-vue'

const checkedCount = async (page: Page) => {
    return sandboxOf(page).locator('input[type="checkbox"]:checked').count()
}

test.describe('#396 — <origam-checkbox-group> accumule sous la souris', () => {
    test('cocher deux options en laisse DEUX cochees', async ({ page }) => {
        await openVariant(page, CHECKBOX_GROUP, 'Events - update:modelValue')

        const inputs = sandboxOf(page).locator('input[type="checkbox"]')

        await expect(inputs).toHaveCount(3)
        expect(await checkedCount(page)).toBe(0)

        await inputs.nth(0).click()
        await expect(inputs.nth(0)).toBeChecked()

        await inputs.nth(1).click()

        // Le coeur du defaut : avant correction, cocher la seconde decochait
        // la premiere — sans erreur, sans avertissement.
        await expect(inputs.nth(0)).toBeChecked()
        await expect(inputs.nth(1)).toBeChecked()
        expect(await checkedCount(page)).toBe(2)
    })

    test('decocher n\'enleve que la case cliquee', async ({ page }) => {
        await openVariant(page, CHECKBOX_GROUP, 'Events - update:modelValue')

        const inputs = sandboxOf(page).locator('input[type="checkbox"]')

        await inputs.nth(0).click()
        await inputs.nth(1).click()
        expect(await checkedCount(page)).toBe(2)

        await inputs.nth(0).click()
        await expect(inputs.nth(0)).not.toBeChecked()
        await expect(inputs.nth(1)).toBeChecked()
        expect(await checkedCount(page)).toBe(1)
    })
})

test.describe('#396 — <origam-selection-control-group>, les deux modes', () => {
    test('mode multiple (variante Design, modele tableau sans `multiple`) : accumule', async ({ page }) => {
        await openVariant(page, SELECTION_GROUP, 'Design')

        const inputs = sandboxOf(page).locator('input[type="checkbox"]')

        await expect(inputs).toHaveCount(3)

        await inputs.nth(0).click()
        await inputs.nth(1).click()

        // `multiple` n'est pas passee : l'auto-detection lit la forme tableau
        // du modele et active le mode multiple. C'est la voie documentee.
        await expect(inputs.nth(0)).toBeChecked()
        await expect(inputs.nth(1)).toBeChecked()
        expect(await checkedCount(page)).toBe(2)
    })

    test('variante Functional : accumule par defaut (`multiple` desormais a true)', async ({ page }) => {
        await openVariant(page, SELECTION_GROUP, 'Functional')

        const inputs = sandboxOf(page).locator('input[type="checkbox"]')

        await expect(inputs).toHaveCount(3)

        await inputs.nth(0).click()
        await inputs.nth(1).click()

        // C'est ce que la story affichait FAUSSEMENT comme casse : elle partait
        // de `multiple: false` sur un modele tableau et un type checkbox.
        expect(await checkedCount(page)).toBe(2)
    })

    test('variante Functional, controle Multiple decoche : exclusion mutuelle', async ({ page }) => {
        await openVariant(page, SELECTION_GROUP, 'Functional')

        await toggleHstCheckbox(page, 'Multiple')
        await page.waitForTimeout(300)

        const inputs = sandboxOf(page).locator('input[type="checkbox"]')

        await inputs.nth(0).click()
        await inputs.nth(1).click()

        // Attendu, pas subi : `multiple: false` veut dire « une seule ».
        expect(await checkedCount(page)).toBe(1)
        await expect(inputs.nth(1)).toBeChecked()
    })
})
