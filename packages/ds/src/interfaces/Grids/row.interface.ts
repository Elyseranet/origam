import type { IAlignProps } from '../Commons/align.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentProps,
    ICommonsComponentSlots,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IJustifyProps } from '../Commons/justify.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'

import type {
    TFlexDirection,
    TRowGutter
} from '../../types/Grids/row.type'

export interface IRowProps extends ICommonsComponentProps, ITagProps, IPaddingProps, IMarginProps, IBorderProps, IColorProps, IBgColorProps, IDensityProps, IAlignProps, IJustifyProps {
    /*********************************************************
     * gutters
     *
     * @description
     * Gouttiere de la grille : l'espace TOTAL entre deux colonnes voisines.
     * Chaque `<origam-col>` descendant en pose la moitie en padding de
     * chaque cote, et le row en retire la moitie en marge negative, pour
     * que le bord exterieur de la grille affleure son conteneur.
     *
     * @description
     * Accepte un echelon nomme (`'none'` · `'dense'` · `'default'` ·
     * `'comfortable'`, adosses aux tokens
     * `--origam-row--gutter-{echelon}---gap`) ou une longueur libre : un
     * nombre, interprete en px, ou toute longueur CSS.
     *
     * @default 'comfortable' (24px, via `--origam-row---gutter`)
     ********************************************************/
    gutters?: TRowGutter
    direction?: TFlexDirection
}

export interface IRowEmits {}

export interface IRowSlots extends ICommonsComponentSlots {}
