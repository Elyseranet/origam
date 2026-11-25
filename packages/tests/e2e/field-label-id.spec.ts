import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * SPEC — OrigamField : le label ne reprend pas l'`id` de l'input (#1149)
 *
 * `OrigamField` recopiait la prop `id` sur ses deux `<origam-label>` (statique +
 * flottant) via `filterProps` : trois elements partageaient le meme `id`, et
 * `label[for]` pointait vers le premier dans l'ordre du DOM — un label, pas l'input.
 * Verifie sur plusieurs familles de champs (tous passent par OrigamField), DOM + axe.
 */

const FIELDS: Array<[string, string]> = [
    ['Field', 'components-stories-field-origamfield-story-vue'],
    ['TextField', 'components-stories-textfield-origamtextfield-story-vue'],
    ['TextareaField', 'components-stories-textareafield-origamtextareafield-story-vue'],
    ['Select', 'components-stories-select-origamselect-story-vue'],
    ['NumberField', 'components-stories-numberfield-origamnumberfield-story-vue'],
    ['PasswordField', 'components-stories-passwordfield-origampasswordfield-story-vue']
]

for (const [name, storyId] of FIELDS) {
    test.describe(`${name} — ids uniques (#1149)`, () => {
        test.setTimeout(60000)

        test('[rouge avant] aucun id duplique, label[for] pointe sur le controle', async ({ page }) => {
            await page.goto(`/stories/story/${storyId}?variantId=${storyId}-0`, { waitUntil: 'domcontentloaded' })
            const sb = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sb.locator('label.origam-field__label').first()).toBeAttached({ timeout: 15000 })

            const r = await sb.locator('body').evaluate(() => {
                const counts: Record<string, number> = {}
                document.querySelectorAll('.origam-field [id], .origam-field[id]').forEach((e) => { counts[e.id] = (counts[e.id] ?? 0) + 1 })
                const dups = Object.entries(counts).filter(([, n]) => n > 1).map(([id]) => id)
                const labels = [...document.querySelectorAll('label.origam-field__label[for]')]
                const badFor = labels.filter((l) => {
                    const t = document.getElementById(l.getAttribute('for') as string)
                    return !t || t.tagName === 'LABEL'
                }).length
                return { dups, labels: labels.length, badFor }
            })
            expect(r.labels).toBeGreaterThan(0)
            expect(r.dups).toEqual([])
            expect(r.badFor).toBe(0)
        })
    })
}

test('axe duplicate-id : zero violation sur TextField', async ({ page }) => {
    test.setTimeout(60000)
    const id = 'components-stories-textfield-origamtextfield-story-vue'
    await page.goto(`/stories/story/${id}?variantId=${id}-0`, { waitUntil: 'domcontentloaded' })
    const sb = page.frameLocator('iframe[src*="__sandbox"]')
    await expect(sb.locator('label.origam-field__label').first()).toBeAttached({ timeout: 15000 })
    const res = await new AxeBuilder({ page }).withRules(['duplicate-id', 'duplicate-id-aria']).analyze()
    // Le wrapper `origam-app` du bac a sable duplique son propre id (hors perimetre) : on ne garde que les noeuds du champ.
    const nodes = res.violations.flatMap((v) => v.nodes.map((n) => `${v.id} ${n.html}`)).filter((h) => h.includes('origam-field') || h.includes('origam-label') || h.includes('input-v-'))
    expect(nodes).toEqual([])
})
