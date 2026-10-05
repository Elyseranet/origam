import type {
  IComponentCssVar,
  IComponentEmitRow, IComponentExposed,
  IComponentPropRow,
  IComponentSlotRow, IComponentTokens
} from "~/interfaces/components-catalog.interface";
import type { IComposableParam } from "~/interfaces/composables-catalog.interface";
import type { IDirectiveArgRow, IDirectiveModifierRow } from "~/interfaces/directive-doc.interface";
import type { IUtilParam, IUtilReturn } from "~/interfaces/utils-catalog.interface";
import type {
  ICommonsComponentEmits,
  ICommonsComponentProps,
  ICommonsComponentSlots
} from "../../../ds/src/interfaces";

export interface IRowListProps extends ICommonsComponentProps {
  // TODO Type a unifié, ce n'est pas normal qu'il soit tous pratiquement identique et qu'on est a chaque fois une interface differente.
  items: Array<IComponentPropRow | IComponentEmitRow | IComponentSlotRow | IComponentExposed | IComponentCssVar | IComponentTokens | IComposableParam | IDirectiveArgRow | IDirectiveModifierRow | IUtilParam | IUtilReturn>
  itemName?: string
  itemRequired?: string
  itemType?: string
  itemValue?: string
  itemDsKey?: string
  itemDsFallback?: string
}

export interface IRowListEmits extends ICommonsComponentEmits {

}

export interface IRowListSlots extends ICommonsComponentSlots {
  item: (props: { item: IComponentPropRow | IComponentEmitRow | IComponentSlotRow | IComponentExposed | IComponentCssVar | IComponentTokens | IComposableParam | IDirectiveArgRow | IDirectiveModifierRow | IUtilParam | IUtilReturn }) => any
  title: (props: { title: string}) => any
  required: (props: { required: boolean}) => any
  type: (props: { type: any}) => any
  value: (props: { value: any}) => any
  description: (props: { key: string, fallback: string}) => any
}