import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISizeProps } from '../Commons/size.interface'

import type {
    TIcon,
    TIconComponent
} from '../../types/Icon/icon.type'

export interface IIconProps {
    icon?: TIcon
}

/*********************************************************
 * IIconComponentProps
 *
 * @description
 * Surface de props partagee par <OrigamIcon> et ses quatre feuilles de
 * rendu : ClassIcon, ComponentIcon, LigatureIcon, SvgIcon.
 *
 * PAS de prop disabled ici, et c'est delibere. Elle y a ete declaree puis
 * retiree : aucun des cinq composants ne la lisait, et une icone est un
 * element de rendu, pas un element interactif — il n'y a rien a desactiver.
 *
 * Un etat desactive se peint sur le controle qui PORTE l'icone (bouton,
 * champ, item de liste), dont l'icone herite opacite et curseur. C'est
 * aussi ce qui empeche un meme controle d'afficher deux traitements
 * desactives divergents.
 ********************************************************/
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
