import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * #1331 / #1425 — le menu ouvert d'`<origam-select>` suit le pattern WAI-ARIA
 * combobox + listbox : UN seul `combobox` (la saisie), un overlay sans
 * `role="menu"`, des `option` sans contrôle interactif imbriqué, et le bouton
 * de fermeture d'une pastille nomme sa valeur. Verdict axe en navigateur réel.
 */
const STORY_ID = 'components-stories-select-origamselect-story-vue'
const STORY = resolve(dirname(fileURLToPath(import.meta.url)), '../../stories/components/stories/Select/OrigamSelect.story.vue')
const variantIndex = (title: string) =>
    [ ...readFileSync(STORY, 'utf8').matchAll(/<Variant\b[^>]*?\btitle\s*=\s*"([^"]*)"/gs) ].map((m) => m[1]).indexOf(title)

const CASES = [
    { name: 'single', variant: 'Items - subheader / divider', cy: 'select-grouped-items' },
    { name: 'multiple', variant: 'Multiple - closable chips', cy: 'select-closable-chips' }
]

for (const c of CASES) {
    test.describe(`OrigamSelect ARIA, menu ouvert — ${c.name}`, () => {
        test('axe : 0 serious/critical, un seul combobox, pas de role=menu', async ({ page }) => {
            await page.goto(`/stories/story/${STORY_ID}?variantId=${STORY_ID}-${variantIndex(c.variant)}`, { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await sandbox.locator(`[data-cy="${c.cy}"]`).first().locator('.origam-field').click()
            await expect(sandbox.locator('[role="option"]').first()).toBeVisible()

            const comboboxes = await sandbox.locator('[role="combobox"]').evaluateAll((els) => els.map((e) => e.tagName))
            expect(comboboxes).toEqual([ 'INPUT' ])
            await expect(sandbox.locator('[role="menu"]')).toHaveCount(0)

            // axe descend dans l'iframe du sandbox, là où vit le menu téléporté.
            const axe = await new AxeBuilder({ page }).analyze()
            const inSandbox = (v: { nodes: { target: unknown[] }[] }) => v.nodes.some((n) => n.target.length > 1 && String(n.target[0]).startsWith('iframe'))
            const bad = axe.violations.filter((v) => (v.impact === 'serious' || v.impact === 'critical') && inSandbox(v))
            expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
        })
    })
}

test('multiple : option sans contrôle interactif, fermeture de pastille nomme la valeur', async ({ page }) => {
    await page.goto(`/stories/story/${STORY_ID}?variantId=${STORY_ID}-${variantIndex('Multiple - closable chips')}`, { waitUntil: 'domcontentloaded' })
    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    await sandbox.locator('[data-cy="select-closable-chips"] .origam-field').click()
    const opts = sandbox.locator('[role="option"]')
    await expect(opts.first()).toBeVisible()
    // Cases décoratives : l'état est porté par aria-selected, pas par un <input> exposé.
    const exposed = await opts.locator('input, button').evaluateAll((els) => els.filter((e) => !e.closest('[aria-hidden="true"][inert]')).length)
    expect(exposed).toBe(0)
    const labels = await sandbox.locator('[data-cy="select-closable-chips"] .origam-chip__close').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))
    expect(labels).toEqual([ 'Remove France', 'Remove Germany' ])
})

test('multiple : un clic DANS la case (inert) bascule l\'option, et la listbox ne porte plus aria-live', async ({ page }) => {
    await page.goto(`/stories/story/${STORY_ID}?variantId=${STORY_ID}-${variantIndex('Multiple - closable chips')}`, { waitUntil: 'domcontentloaded' })
    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    await sandbox.locator('[data-cy="select-closable-chips"] .origam-field').click()
    await expect(sandbox.locator('[role="listbox"]')).not.toHaveAttribute('aria-live', /.+/)
    const spain = sandbox.locator('[role="option"]', { hasText: 'Spain' })
    await expect(spain).toHaveAttribute('aria-selected', 'false')
    const pos = await spain.evaluate((el) => {
        const r = el.getBoundingClientRect()
        const c = el.querySelector('.origam-checkbox-btn')!.getBoundingClientRect()
        return { x: c.left + c.width / 2 - r.left, y: c.top + c.height / 2 - r.top }
    })
    // Clic réel aux coordonnées du centre de la case (inert) : il doit atteindre la ligne d'option.
    await spain.click({ position: pos })
    await expect(spain).toHaveAttribute('aria-selected', 'true')
})

test('région live « aucun résultat » : texte de la locale, masquée visuellement mais dans l\'arbre d\'accessibilité', async ({ page }) => {
    // Libellé attendu lu dans la locale du DS (clé `origam.no_data_text`, celle de `noDataText`), jamais écrit en dur.
    const en = JSON.parse(readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../../ds/src/assets/locales/en.json'), 'utf8'))
    const noData: string = en.origam.no_data_text
    expect(noData).toBeTruthy()

    await page.goto(`/stories/story/${STORY_ID}?variantId=${STORY_ID}-${variantIndex('Multiple - closable chips')}`, { waitUntil: 'domcontentloaded' })
    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    const select = sandbox.locator('[data-cy="select-closable-chips"]')
    const live = select.locator('output.origam-select__announcement')

    // Menu fermé : vide.
    await expect(live).toHaveText('')

    // Menu ouvert avec résultats : vide.
    await select.locator('.origam-field').click()
    await expect(sandbox.locator('[role="option"]').first()).toBeVisible()
    await expect(live).toHaveText('')

    // Filtre sans résultat : le libellé de la locale.
    await select.locator('input').fill('zzzzzz')
    await expect(live).toHaveText(noData)

    // Masquée visuellement (1px, clip) mais ni display:none, ni visibility:hidden, ni aria-hidden.
    const state = await live.evaluate((el) => {
        const cs = getComputedStyle(el)
        const r = el.getBoundingClientRect()
        return {
            display: cs.display, visibility: cs.visibility, ariaHidden: el.closest('[aria-hidden="true"]') !== null,
            small: r.width <= 1 && r.height <= 1
        }
    })
    expect(state.display).not.toBe('none')
    expect(state.visibility).toBe('visible')
    expect(state.ariaHidden).toBe(false)
    expect(state.small).toBe(true)

    // Efface le filtre : de nouveau vide.
    await select.locator('input').fill('')
    await expect(live).toHaveText('')
})
