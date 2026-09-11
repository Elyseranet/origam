import type { IActiveState, ICommonsComponentProps } from "../../interfaces"

import type { TDateMode, TIcon } from "../../types"

export interface IDatePickerControlsProps extends ICommonsComponentProps {
    /**
     * Highlighted item(s) in the controls toolbar. Widened to include
     * `boolean | IActiveState` so that IDatePickerProps can extend both this
     * interface and IPickerProps (which via ISheetProps → IActiveProps declares
     * `active?: boolean | IActiveState`) without TS2320.
     */
    active?: string | Array<string> | boolean | IActiveState
    disabled?: boolean
    disabledMonth?: boolean
    disabledYear?: boolean
    disabledNext?: boolean
    disabledPrev?: boolean
    nextIcon?: TIcon
    prevIcon?: TIcon
    modeIcon?: TIcon
    text?: string,
    viewMode?: TDateMode
}

/** Emits fired by `<OrigamDatePickerControls>` — clicks on the five
 *  toolbar buttons (year / month / prev / next / text label).
 *  `event` is optional: the click handlers call `emits('click:prev')`
 *  etc. without forwarding the originating MouseEvent. */
export interface IDatePickerControlsEmits {
    (e: 'click:year', event?: MouseEvent): void
    (e: 'click:month', event?: MouseEvent): void
    (e: 'click:prev', event?: MouseEvent): void
    (e: 'click:next', event?: MouseEvent): void
    (e: 'click:text', event?: MouseEvent): void
}
