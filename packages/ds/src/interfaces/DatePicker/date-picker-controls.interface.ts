import type { IActiveState } from '../Commons/state-effect.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'

import type { TDateMode } from '../../types/DatePicker/date-picker.type'
import type { TIcon } from '../../types/Icon/icon.type'

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

/** `<OrigamDatePickerControls>` renders its own fixed toolbar (month
 *  label, mode toggle, prev/next buttons) — no `<slot>` in its template. */
export interface IDatePickerControlsSlots {}
