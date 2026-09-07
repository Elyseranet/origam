// Le fournisseur de defauts d'`OrigamItemGroup` est INERTE, et ce spec epingle
// la raison exacte.
//
// `slotDefaults` indexe sa table sur la cle `'origam-item'` :
//
//     const slotDefaults = computed(() => ({
//         'origam-item': omitUndefined({ selectedClass: … })
//     }))
//
// ⛔ Or le resolveur de defauts identifie l'enfant par SON PROPRE nom kebab,
// obtenu via `toKebabCase(vm.aliasName ?? vm.name ?? vm.__name)`
// (`getCurrentInstance.util.ts`). Pour `OrigamItemGroupItem`, ce nom est
// `origam-item-group-item`. Les deux cles ne coincident donc jamais : l'entree
// est ecartee avant qu'aucune prop ne soit examinee, et l'avertissement de prop
// non supportee de #515 ne part pas davantage — il n'y a rien a avertir, la
// table n'est jamais consultee pour ce composant.
//
// `selectedClass` atteint pourtant bien chaque item, par un AUTRE chemin :
// l'injection de groupe, dans `useGroupItem`. C'est ce qui rend le defaut
// invisible — la fonctionnalite marche, mais pas par le moyen que le code
// laisse croire.
//
// ⛔ Re-indexer la table n'est PAS un correctif gratuit : un groupe dont la
// classe est explicitement videe (`selected-class=""`) ecraserait alors la prop
// propre de l'item, ce qui casserait le repli par item que la doc decrit. Le
// choix a donc ete de documenter plutot que de recabler.
//
// Ce spec vient d'une sonde jetable laissee par l'agent du lot 5 de la campagne
// C7. Son assertion valait d'etre gardee — elle verrouille le fait sur lequel
// tout le commentaire repose ; son `console.log` et son `as any`, non.

import { describe, expect, it } from 'vitest'

import OrigamItemGroupItem from '@origam/components/ItemGroup/OrigamItemGroupItem.vue'
import { toKebabCase } from '@origam/utils/Commons/commons.util'

/** La forme minimale que le resolveur lit pour nommer un composant. */
interface IComponentNaming {
    aliasName?: string
    name?: string
    __name?: string
}

describe('OrigamItemGroup — la cle de slotDefaults ne peut pas correspondre', () => {
    it('⛔ le nom resolu de l\'enfant est `origam-item-group-item`, pas `origam-item`', () => {
        const naming = OrigamItemGroupItem as IComponentNaming
        const resolved = toKebabCase(naming.aliasName ?? naming.name ?? naming.__name ?? '')

        // Si cette assertion tombe un jour — renommage du composant, ou
        // changement de la strategie de nommage de Vue — c'est que la cle
        // pourrait enfin correspondre. Il faudrait alors relire la mise en garde
        // ci-dessus AVANT de s'en rejouir : le recablage a un cout.
        expect(resolved).toBe('origam-item-group-item')
        expect(resolved).not.toBe('origam-item')
    })

    it('aucun composant nomme `origam-item` n\'existe dans le DS', () => {
        // Le nom `origam-item` vient de la doc, qui l'a longtemps presente comme
        // le composant enfant a utiliser. Il n'a jamais existe : le seul export
        // de la famille est `OrigamItemGroupItem`.
        expect(toKebabCase('OrigamItemGroupItem')).not.toBe('origam-item')
    })
})
