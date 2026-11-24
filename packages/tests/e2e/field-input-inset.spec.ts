import { expect, test, type Page } from '@playwright/test'

/**
 * #1280 — (1) le <input>/<textarea> natif garde le padding UA (1px 2px) : le texte
 * demarre 2 px apres le retrait du champ. (2) min-height de `.origam-field__input`
 * comptait une ligne de 1.5rem, sans egard pour `--origam-input---line-height`.
 * Mesure en navigateur reel (jsdom ne resout pas var()).
 */
const STORIES: Record<string, string> = {
    textfield: 'components-stories-textfield-origamtextfield-story-vue',
    numberfield: 'components-stories-numberfield-origamnumberfield-story-vue',
    select: 'components-stories-select-origamselect-story-vue',
    textarea: 'components-stories-textareafield-origamtextareafield-story-vue',
}
const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')
const open = (page: Page, id: string) =>
    page.goto(`/stories/story/${id}?variantId=${id}-0`, { waitUntil: 'domcontentloaded' })

for (const [name, id] of Object.entries(STORIES)) {
    for (const mode of ['light', 'dark']) {
        test(`${name} ${mode} — le texte natif n'a aucun padding propre`, async ({ page }) => {
            await open(page, id)
            const native = sandboxOf(page).locator('.origam-field__input input, .origam-field__input textarea').first()
            await expect(native).toBeAttached({ timeout: 8000 })
            const pad = await native.evaluate((el, m) => {
                document.documentElement.setAttribute('data-mode', m)
                const s = getComputedStyle(el)
                return [s.paddingLeft, s.paddingRight]
            }, mode)
            expect(pad).toEqual(['0px', '0px'])
        })
    }
}

for (const dens of ['0px', '-8px']) {
    test(`min-height suit --origam-input---line-height (densite ${dens})`, async ({ page }) => {
        await open(page, STORIES.textfield)
        const box = sandboxOf(page).locator('.origam-field__input').first()
        await expect(box).toBeVisible({ timeout: 8000 })
        const r = await box.evaluate((el, d) => {
            el.style.setProperty('--origam-input---density', d)
            el.style.setProperty('--origam-input__control---height', '0px')
            el.style.setProperty('--origam-input---line-height', '3')
            const s = getComputedStyle(el)
            const fs = parseFloat(getComputedStyle(document.documentElement).fontSize)
            return { min: parseFloat(s.minHeight), pt: parseFloat(s.paddingTop), pb: parseFloat(s.paddingBottom), fs }
        }, dens)
        expect(r.min).toBeCloseTo(3 * r.fs + r.pt + r.pb, 1)
    })
}
