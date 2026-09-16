// PROBE #614 — clavier REEL, Chromium. Fichier jetable.
import { expect, test, type Page } from '@playwright/test'

import { toggleHstCheckbox } from './_support/histoire-controls'

const STORY = '/stories/story/components-stories-inlineedit-origaminlineedit-story-vue'

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const active = (page: Page) => sandboxOf(page).locator('body').evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el) return 'null'
    const cls = String(el.className || '').split(' ').filter(c => c.startsWith('origam')).slice(0, 2).join('.')
    return `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}${el.getAttribute('data-cy') ? `[${el.getAttribute('data-cy')}]` : ''}`
})

const state = (page: Page) => sandboxOf(page).locator('body').evaluate(() => ({
    editing: !!document.querySelector('[data-cy="origam-inline-edit-input"]'),
    displaying: !!document.querySelector('[data-cy="origam-inline-edit-display"]'),
    confirmBtn: !!document.querySelector('.origam-inline-edit__action-btn--confirm'),
    displayText: (document.querySelector('[data-cy="origam-inline-edit-display"]')?.textContent ?? '').trim(),
    inputValue: (document.querySelector('[data-cy="origam-inline-edit-input"] input') as HTMLInputElement | null)?.value ?? null
}))

const enterEdit = async (page: Page) => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText('Functional', { exact: true }).first().click()
    await page.waitForTimeout(600)
    await toggleHstCheckbox(page, 'Show Actions', true)
    await page.waitForTimeout(400)
    await sandboxOf(page).locator('[data-cy="origam-inline-edit-display"]').first().click()
    await page.waitForTimeout(600)
}

test('PROBE #614 — Tab depuis le champ atteint-il Confirmer ?', async ({ page }) => {
    await enterEdit(page)
    console.log('apres entree en edition : active =', await active(page), JSON.stringify(await state(page)))

    for (let i = 1; i <= 3; i++) {
        await page.keyboard.press('Tab')
        await page.waitForTimeout(350)
        console.log(`Tab #${i} : active =`, await active(page), JSON.stringify(await state(page)))
    }
    expect(true).toBe(true)
})

test('PROBE #614 — actionner Confirmer au clavier (Entree)', async ({ page }) => {
    await enterEdit(page)
    const sandbox = sandboxOf(page)
    await sandbox.locator('[data-cy="origam-inline-edit-input"] input').first().fill('valeur-clavier')
    await page.waitForTimeout(200)
    console.log('avant Tab :', await active(page), JSON.stringify(await state(page)))

    await page.keyboard.press('Tab')
    await page.waitForTimeout(400)
    console.log('apres Tab :', await active(page), JSON.stringify(await state(page)))

    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    console.log('apres Entree :', await active(page), JSON.stringify(await state(page)))
    expect(true).toBe(true)
})
