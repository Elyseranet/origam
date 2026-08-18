import type {
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IDimensionProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ISizeProps,
    ITagProps
} from '../../interfaces'

import type { TIcon, TIconComponent } from '../../types'

export interface IIconProps {
    icon?: TIcon
}

/**
 * Surface de props partagée par `<OrigamIcon>` et ses quatre feuilles de
 * rendu (`ClassIcon`, `ComponentIcon`, `LigatureIcon`, `SvgIcon`).
 *
 * ⚠️ PAS de prop `disabled` ici, et c'est délibéré. Elle y a été déclarée
 * puis retirée : aucun des cinq composants ne la lisait, et une icône est
 * un élément de rendu, pas un élément interactif — il n'y a rien à
 * désactiver. Un état désactivé se peint sur le contrôle qui PORTE l'icône
 * (bouton, champ, item de liste), pas sur l'icône elle-même, qui hérite
 * alors naturellement de son opacité et de son curseur.
 */
export interface IIconComponentProps extends IIconProps, IColorProps, IBgColorProps, ICommonsComponentProps, ITagProps, ISizeProps, IPaddingProps, IMarginProps, IBorderProps, IDimensionProps, IRoundedProps {
}

/** Slot signatures shared by `<OrigamIcon>` and `<OrigamComponentIcon>` —
 *  a single unscoped `default` slot holding the icon glyph / fallback. */
export interface IIconComponentSlots {
    default?: () => any
}

export interface IIconAliases {
    [name: string]: TIcon
}

export interface IIconSet {
    component: TIconComponent
}
