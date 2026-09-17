import { expect, test } from '@playwright/test'

/**
 * #814 — `OrigamCheckboxGroup` / `OrigamRadioGroup` : le groupe est nomme, et
 * plus aucun id n'est porte deux fois.
 *
 * ## Ce qui etait MESURE AVANT le correctif (Chromium, Histoire construit)
 *
 * ```
 * CheckboxGroup « Default »      <label id="checkbox-group-v-2">  +  <div role=group id="checkbox-group-v-2">
 *                                ids DUPLIQUES : [["checkbox-group-v-2", 2]]
 *                                aria-labelledby -> label   (premier dans l'ordre du document)
 *                                arbre ARIA : group "Notifications"          <- deja correct
 * CheckboxGroup « Slots - Label » aucun aria-labelledby
 *                                arbre ARIA : - group:                       <- groupe SANS NOM
 * RadioGroup    « Slots - Label » idem : - group:                            <- groupe SANS NOM
 * ```
 *
 * ⛔ Le releve d'origine annoncait TROIS porteurs du meme id — racine,
 * `<origam-label>`, `<origam-selection-control-group>`. Mesure : il y en avait
 * DEUX. La racine porte `origam-input-v-3`, c'est-a-dire le `styleId` de
 * l'`<origam-input>`, jamais l'id du consommateur (#790). Un releve a la
 * lecture seule s'est trompe d'un tiers, exactement comme sur #790 ou trois
 * entrees sur cinq etaient fausses.
 *
 * ⛔ L'auto-reference annoncee est REELLE mais n'est PAS atteignable depuis une
 * variante de story : il faut la prop `label` ET le slot `#label` surcharge en
 * meme temps. Ce cas est couvert par le spec jsdom
 * `TU/components/Checkbox/checkbox-radio-group-labelling.spec.ts`, qui mesure
 * la resolution de l'id — pas par ce fichier.
 *
 * ## Temoin positif — OBLIGATOIRE
 *
 * `group "Notifications"` et `group "Custom-rendered options"` fonctionnaient
 * DEJA avant ce changement et doivent continuer. Ils sont lus ici par le meme
 * moteur, dans la meme page, que les deux groupes qui n'avaient pas de nom.
 * Sans ce temoin, « le groupe n'a pas de nom » et « ma sonde ne lit rien »
 * seraient indiscernables.
 *
 * ## ⛔ La porte a11y ne dit rien ici
 *
 * Elle ne balaye que 36 stories sur 218. `OrigamCheckboxGroup` et
 * `OrigamRadioGroup` sont TOUS DEUX dans `UNSWEPT_STORIES` — verifie, pas
 * suppose. Son vert ne prouvait donc rien sur ces deux composants, d'ou cette
 * mesure directe.
 *
 * ## NON mesure ici
 *
 * Le rendu par un lecteur d'ecran reel (« annonce » reste une deduction de
 * l'arbre ARIA tant que rien n'est enregistre) · le comportement en
 * `readonly` / `disabled` · le nombre de consommateurs.
 */

const CBG = 'components-stories-checkbox-origamcheckboxgroup-story-vue'
const RG = 'components-stories-radio-origamradiogroup-story-vue'

/** Variante 6 = « Default » (prop `label`) · variante 5 = « Slots - Label ». */
const V_DEFAULT = 6
const V_SLOT_LABEL = 5

const url = (id: string, idx: number) => `/stories/story/${id}?variantId=${id}-${idx}`

const CASES = [
    { id: CBG, cmp: 'OrigamCheckboxGroup', idx: V_DEFAULT, name: 'Notifications', witness: 'Email', role: 'checkbox' },
    { id: CBG, cmp: 'OrigamCheckboxGroup', idx: V_SLOT_LABEL, name: 'Un label entierement custom', witness: 'Email', role: 'checkbox' },
    { id: RG, cmp: 'OrigamRadioGroup', idx: V_DEFAULT, name: 'Custom-rendered options', witness: 'Alpha (slot)', role: 'radio' },
    { id: RG, cmp: 'OrigamRadioGroup', idx: V_SLOT_LABEL, name: 'Custom label *', witness: 'Alpha', role: 'radio' }
] as const

test.describe('#814 — nommage des groupes de selection', () => {
    test.setTimeout(45000)

    for (const c of CASES) {
        test(`${c.cmp} #${c.idx} — le groupe porte le nom « ${c.name} »`, async ({ page }) => {
            await page.goto(url(c.id, c.idx))
            const frame = page.frameLocator('iframe[src*="__sandbox"]')
            const group = frame.locator('[role="group"]').first()
            await expect(group).toBeVisible({ timeout: 30000 })

            // --- TEMOIN POSITIF ------------------------------------------------
            // Le nom propre de chaque controle resolvait deja avant ce changement
            // et resout toujours. Si cette assertion tombe en meme temps que
            // celle du groupe, c'est le lecteur qui est casse, pas le produit.
            await expect(frame.getByRole(c.role, { name: c.witness }).first())
                .toHaveAccessibleName(c.witness)

            // --- CE QUE CE COMMIT CORRIGE --------------------------------------
            await expect(group).toHaveAccessibleName(c.name)
        })

        test(`${c.cmp} #${c.idx} — aucun id porte deux fois`, async ({ page }) => {
            await page.goto(url(c.id, c.idx))
            const frame = page.frameLocator('iframe[src*="__sandbox"]')
            const group = frame.locator('[role="group"]').first()
            await expect(group).toBeVisible({ timeout: 30000 })

            // Mesure restreinte a la racine du composant : le chrome de Histoire
            // duplique `origam-app-v-0` pour ses propres raisons, hors perimetre.
            const dupes = await frame.locator('.origam-input').first().evaluate((root: HTMLElement) => {
                const counts: Record<string, number> = {}
                for (const el of [root, ...root.querySelectorAll('[id]')]) {
                    if (el.id) counts[el.id] = (counts[el.id] ?? 0) + 1
                }

                return Object.entries(counts).filter(([, n]) => n > 1)
            })

            expect(dupes).toEqual([])
        })
    }
})
