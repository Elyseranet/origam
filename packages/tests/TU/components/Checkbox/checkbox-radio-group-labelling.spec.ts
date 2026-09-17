import { OrigamCheckboxGroup, OrigamRadioGroup } from '@origam/components'
import { createOrigam } from '@origam/origam'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

/**
 * #814 — l'auto-reference d'`aria-labelledby` sur les groupes de selection.
 *
 * ## Pourquoi ce fichier existe en plus du spec e2e
 *
 * Le cas qui produit l'auto-reference demande la prop `label` ET le slot
 * `#label` surcharge EN MEME TEMPS. Aucune variante de story ne combine les
 * deux, donc `e2e/checkbox-radio-group-a11y.spec.ts` ne peut pas l'atteindre.
 * Ce qui se mesure ici, ce sont des attributs et une resolution d'id — du
 * ressort de jsdom, contrairement a tout ce qui passe par `var()` en CSS.
 *
 * ## Mesure AVANT le correctif
 *
 * ```
 * CheckboxGroup, prop label + slot #label surcharge
 *     aria-labelledby="checkbox-group-v-0"  porte par <div role=group>
 *     -> resout vers : <div class="origam-selection-control-group">
 *     -> AUTO-REFERENCE : true
 * RadioGroup : identique.
 * ```
 *
 * Le groupe se nommait avec son propre contenu : l'`<origam-label>` ne rendait
 * plus rien, donc le seul porteur restant de l'id partage etait le groupe.
 *
 * Et dans le rendu PAR DEFAUT (prop `label`, slot par defaut), le meme id etait
 * porte DEUX fois — `<label>` et `<div role=group>` — ce qui est invalide en
 * HTML, meme si `getElementById` renvoyait le `<label>` (premier dans l'ordre
 * du document) et que le nom calcule etait correct.
 *
 * ⛔ Le releve d'origine annoncait TROIS porteurs, dont la racine. Mesure :
 * DEUX. La racine porte le `styleId` de l'`<origam-input>`, pas l'id du
 * consommateur (#790).
 */

const ITEMS = [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]

const GROUPS = [
    ['OrigamCheckboxGroup', OrigamCheckboxGroup],
    ['OrigamRadioGroup', OrigamRadioGroup]
] as const

interface IProbe {
    duplicatedIds: Array<[string, number]>
    labelledBy: string | null
    resolvesToSelf: boolean | null
    resolvesTo: string | null
}

function probe (root: Element): IProbe {
    const doc = root.ownerDocument as Document
    const carriers = [...(root.id ? [root] : []), ...root.querySelectorAll('[id]')]
    const counts: Record<string, number> = {}
    for (const el of carriers) counts[el.id] = (counts[el.id] ?? 0) + 1

    const group = root.querySelector('[role="group"]')
    const ref = group?.getAttribute('aria-labelledby') ?? null
    const target = ref ? doc.getElementById(ref) : null

    return {
        duplicatedIds: Object.entries(counts).filter(([, n]) => n > 1) as Array<[string, number]>,
        labelledBy: ref,
        resolvesTo: target ? target.className : null,
        resolvesToSelf: target && group ? (target === group || group.contains(target)) : null
    }
}

function mountGroup (Cmp: unknown, slots?: Record<string, string>) {
    return mount(Cmp as never, {
        props: { items: ITEMS, label: 'Mon libelle' } as never,
        ...(slots ? { slots } : {}),
        global: { plugins: [createOrigam()] },
        attachTo: document.body
    })
}

describe('#814 — nommage des groupes de selection', () => {
    for (const [name, Cmp] of GROUPS) {
        it(`${name} — rendu par defaut : aucun id duplique, le nom vise un wrapper dedie`, () => {
            const w = mountGroup(Cmp)
            const r = probe(w.element as Element)

            // TEMOIN POSITIF : ce cas produisait DEJA un nom correct avant le
            // correctif (l'id resolvait vers le `<label>`) et doit continuer.
            expect(r.labelledBy).toBeTruthy()
            expect(r.resolvesToSelf).toBe(false)

            // CE QUE CE COMMIT CORRIGE : l'id etait porte deux fois.
            expect(r.duplicatedIds).toEqual([])
            w.unmount()
        })

        it(`${name} — prop label + slot #label surcharge : plus d'auto-reference`, () => {
            const w = mountGroup(Cmp, { label: '<strong>Libelle maison</strong>' })
            const r = probe(w.element as Element)

            expect(r.labelledBy).toBeTruthy()
            // AVANT : true — le groupe se nommait avec son propre contenu.
            expect(r.resolvesToSelf).toBe(false)
            expect(r.duplicatedIds).toEqual([])
            w.unmount()
        })

        it(`${name} — sans libelle : aucun aria-labelledby (pas de nom fabrique, #622)`, () => {
            const w = mount(Cmp as never, {
                props: { items: ITEMS } as never,
                global: { plugins: [createOrigam()] },
                attachTo: document.body
            })
            expect(probe(w.element as Element).labelledBy).toBeNull()
            w.unmount()
        })
    }
})
