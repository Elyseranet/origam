import type { IBtnGroupProps, ICommonsComponentEmits, IGroupProps } from '../../interfaces'

export interface IBtnToggleProps extends IBtnGroupProps, IGroupProps {

}

/** Emits fired by `<OrigamBtnToggle>` — v-model on the active toggle index. */
export interface IBtnToggleEmits extends ICommonsComponentEmits {}
