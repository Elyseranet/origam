import type { IBtnGroupProps } from './btn-group.interface'
import type { IBtnProps } from './btn.interface'
import type { ICommonsComponentEmits } from '../Commons/commons.interface'
import type {
    IGroupProps,
    IGroupProvide
} from '../Commons/group.interface'

export interface IBtnToggleProps extends IBtnGroupProps, IGroupProps {

}

/** Emits fired by `<OrigamBtnToggle>` — v-model on the active toggle index. */
export interface IBtnToggleEmits extends ICommonsComponentEmits {}

/** Slot signatures for `<OrigamBtnToggle>` — `default` exposes the
 *  group's own navigation/selection API so custom content can drive the
 *  toggle without re-injecting it; `item` overrides a single button.
 *  `selected` is bound unwrapped (template auto-unref of `IGroupProvide.selected`). */
export interface IBtnToggleSlots {
    default?: (data: { items: Array<IBtnProps>, selected: Readonly<Array<number>> } & Pick<IGroupProvide, 'isSelected' | 'next' | 'prev' | 'select'>) => any
    item?: (data: { item: IBtnProps, index: number }) => any
}
