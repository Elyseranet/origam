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
