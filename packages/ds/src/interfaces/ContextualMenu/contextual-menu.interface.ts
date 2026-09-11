import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IMenuProps } from '../Menu/menu.interface'

export interface IContextualMenuProps extends ICommonsComponentProps, IMenuProps {

}

export interface IContextualMenuEmits {}

/*********************************************************
 * Slots — passthrough dynamique, signature d'index OBLIGATOIRE
 *
 * @description
 * ⛔ NE PAS remettre `IContextualMenuSlots {}` ici. Une interface vide
 * ne compile pas sur ce composant : le template fait
 * `v-for="(_, name) in $slots"` et indexe donc `$slots` avec une chaine.
 * Sans signature d'index, `vue-tsc` leve :
 *
 *     OrigamContextualMenu.vue(19,6): error TS7053 — Element implicitly
 *     has an 'any' type because expression of type 'string' can't be used
 *     to index type 'IContextualMenuSlots'.
 *
 * @description
 * Avant que `defineSlots` ne soit pose sur ce composant, `$slots` etait
 * non type et l'indexation dynamique passait. La typer l'a rendue
 * verifiable — et donc refusable. C'est le typage qui a revele le trou,
 * pas qui l'a cree.
 *
 * @description
 * La signature est volontairement lache : c'est inherent a un passthrough
 * dynamique, pas un raccourci. `<OrigamContextualMenu>` forwarde TEL QUEL
 * n'importe quel slot nomme vers le `<OrigamMenu>` interne, y compris des
 * noms que Menu ne documente pas. Une interface vide serait donc doublement
 * fausse : incompilable, et menteuse sur la surface acceptee. Pour les
 * formes de slots qui atteignent reellement le DOM en aval, lire
 * `IMenuSlots` dans `interfaces/Menu/menu.interface.ts`.
 *
 * @description
 * ⛔ ET RETIRER LA SIGNATURE NE REPARE RIEN — ca fait seulement cesser
 * `vue-tsc` de regarder. Comme il verifie tout le paquet en une passe,
 * ce seul fichier bloquait la porte type-check pour TOUT le catalogue,
 * pas seulement pour ce composant : les six lots du chantier
 * `defineEmits`/`defineSlots` etaient bloques par cette unique ligne.
 *
 * @description
 * Cette forme a ete trouvee DEUX FOIS INDEPENDAMMENT — par le
 * coordinateur et par un agent du lot 5 — a l'identique, signature
 * comprise. Ce n'est pas une preference : c'est la seule qui compile.
 ********************************************************/
export interface IContextualMenuSlots {
    [name: string]: ((props: any) => any) | undefined
}

