import type {
    ICommonsComponentEmits,
    ICommonsComponentProps
} from '../Commons/commons.interface'
import type { IMenuProps } from '../Menu/menu.interface'

export interface IContextualMenuProps extends ICommonsComponentProps, IMenuProps {

}

/*********************************************************
 * Événements
 *
 * @description
 * `<OrigamContextualMenu>` émet exactement un événement : le
 * `update:modelValue` que son propre `useVModel(props, 'modelValue')`
 * envoie à l'ouverture et à la fermeture. Il ne ré-émet PAS les autres
 * événements du `<OrigamMenu>` interne.
 ********************************************************/
export interface IContextualMenuEmits extends ICommonsComponentEmits {}

/*********************************************************
 * Slots — passthrough dynamique
 *
 * @description
 * Le template itère `v-for="(_, name) in $slots"` et forwarde TELS QUELS
 * les slots nommés que le consommateur fournit, vers le `<OrigamMenu>`
 * interne. La signature d'index est la seule déclaration honnête de cette
 * surface : une interface VIDE prétendrait que le composant n'accepte aucun
 * slot — faux pour tout consommateur qui en passe un ; et réutiliser
 * `IMenuSlots` sous-documenterait, puisqu'un nom de slot que Menu ne
 * documente pas atteint quand même le DOM.
 *
 * @description
 * La signature d'index est volontairement lâche. Elle n'apporte aucune
 * sécurité de type par slot — c'est inhérent à un passthrough dynamique, ce
 * n'est pas un raccourci. Pour les formes de slots qui atteignent
 * réellement le DOM en aval, lire `IMenuSlots` dans
 * `interfaces/Menu/menu.interface.ts`.
 ********************************************************/
export interface IContextualMenuSlots {
    [name: string]: ((props: any) => any) | undefined
}
