import type { IActiveProps } from '../Commons/active.interface'
import type { IBackdropProps } from '../Commons/backdrop.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type { IBtnProps } from './btn.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IHoverProps } from '../Commons/hover.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISizeProps } from '../Commons/size.interface'
import type { IVariantProps } from '../Commons/variant.interface'

/*********************************************************
 * IBtnGroupProps
 *
 * @description
 * ⛔ `variant` — VARIANTE VISUELLE DE LA SURFACE DU GROUPE, qui doit lire
 * « le bouton du theme, entier » : un `origam-btn: { variant: 'tonal' }`
 * themee peint la meme surface translucide sur le groupe qu'elle peindrait
 * sur un bouton isole, au lieu d'un defaut plat que chaque enfant
 * repeindrait ensuite de son cote — c'est ce qui produisait le « toggle
 * blanc plat ». La prop vient d'`IVariantProps`.
 *
 * @description
 * ⛔ C'EST UN PRESET DE PROPS, PAS UNE COUCHE CSS (ADR-005 D1, converti par
 * le lot 4 / #1027). La table est `BTN_GROUP_VARIANT_PRESETS`
 * (`consts/Btn/btn-group.const.ts`), appliquee par le resolveur au rang le
 * plus FAIBLE : prop du site d'appel > defaut de theme pour le composant >
 * defaut global > PRESET > `withDefaults`. La classe
 * `origam-btn-group--variant-{valeur}` reste emise sans qu'aucune regle du
 * DS ne s'y attache (garde `no-variant-css`).
 *
 * @description
 * ⚠️ CETTE PROP N'ETAIT DOCUMENTEE NULLE PART. Elle portait 11 lignes de
 * selecteur `&--variant-*` dans `OrigamBtnGroup.vue`, alors que
 * `packages/docs/components/Btn/OrigamBtnGroup.md` ne contenait pas UNE
 * occurrence de la chaine `variant` et qu'aucune Variant de story ne
 * l'exposait. C'est le motif que le `CLAUDE.md` documente — « un defaut
 * qu'aucune Variant n'expose ne peut etre attrape par personne » — et il est
 * comble dans le meme lot que la conversion.
 *
 * @description
 * ⛔ ELLE EST AUSSI FORWARDEE AUX ENFANTS, sans condition, par le bloc
 * `slotDefaults` du composant : chaque `<origam-btn>` descendant recoit la
 * VALEUR du variant au rang 2 (defaut de composant) et resout ensuite sa
 * PROPRE table `BTN_VARIANT_PRESETS` au rang 4. Les deux canaux sont
 * distincts et tous deux necessaires — voir la note sur
 * `BTN_GROUP_VARIANT_PRESETS`.
 *
 * @description
 * `IBackdropProps` entre dans l'`extends` parce que le resolveur IGNORE
 * toute cle de preset absente de `rawProps` : sans elle, le
 * `backdropFilter` du preset `ghost` serait silencieusement inerte.
 ********************************************************/
export interface IBtnGroupProps extends ITagProps, ICommonsComponentProps, IRoundedProps, IBorderProps, IBackdropProps, IDensityProps, IElevationProps, IColorProps, IBgColorProps, IMarginProps, IPaddingProps, IHoverProps, IActiveProps, IVariantProps, ISizeProps {
    divided?: boolean
    items?: Array<IBtnProps>
}

export interface IBtnGroupEmits {}

/** Slot signatures for `<OrigamBtnGroup>`. */
export interface IBtnGroupSlots {
    /** Overrides the whole auto-generated `<origam-btn>` list. */
    default?: () => any
    /** One call per item — overrides a single button. */
    item?: (data: { item: IBtnProps, index: number }) => any
}
