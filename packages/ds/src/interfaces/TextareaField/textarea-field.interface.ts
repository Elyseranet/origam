import type { IAdjacentInnerProps } from '../Commons/adjacent.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type { IColorProps } from '../Commons/color.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type {
    IFieldEmits,
    IFieldProps,
    IFieldSlots
} from '../Field/field.interface'
import type {
    IInputEmits,
    IInputProps,
    IInputSlots
} from '../Input/input.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ITextareaToolbarSlotProps } from './textarea-field-rich-toolbar.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

import type {
    TTextareaMode,
    TTextareaOutput
} from '../../types/TextareaField/textarea-field.type'
import type {
    TTextareaToolbarCommand,
    TTextareaToolbarPosition
} from '../../types/TextareaField/textarea-field-rich-toolbar.type'

export interface ITextareaFieldProps extends ICommonsComponentProps, IColorProps, IDensityProps, IFieldProps, IInputProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IElevationProps, IAdjacentInnerProps, Pick<ITypographyProps, 'fontSize' | 'fontWeight' | 'lineHeight' | 'letterSpacing'> {
    autoGrow?: boolean
    autofocus?: boolean
    counter?: boolean | number | string
    counterValue?: number | ((e: any) => number)
    persistentClear?: boolean
    prefix?: string
    placeholder?: string
    persistentPlaceholder?: boolean
    persistentCounter?: boolean
    noResize?: boolean
    rows?: number | string
    maxRows?: number | string
    suffix?: string
    modelModifiers?: string | boolean
    /**
     * Render mode. `'plain'` (default) keeps the legacy `<textarea>` element.
     * `'rich'` swaps it for a `contenteditable` surface + rich toolbar.
     */
    mode?: TTextareaMode
    /**
     * When `mode="rich"`, format of the value emitted via `update:modelValue`.
     * `'html'` (default) emits sanitised HTML, `'markdown'` emits a
     * conservative CommonMark subset.
     */
    output?: TTextareaOutput
    /**
     * Ordered list of toolbar commands to display in rich mode. Pass
     * `false` to hide the toolbar entirely.
     */
    toolbar?: ReadonlyArray<TTextareaToolbarCommand> | false
    /**
     * Position of the toolbar relative to the editing surface in rich mode.
     */
    toolbarPosition?: TTextareaToolbarPosition
}

/**
 * Aggregate emits for `<OrigamTextareaField>` — re-exports field/input events
 * plus the height update event (auto-grow) and control click events.
 */
export interface ITextareaFieldEmits extends IFieldEmits, IInputEmits {
    (e: 'update:height', height: number): void
    (e: 'click:control', event: MouseEvent): void
    (e: 'mousedown:control', event: MouseEvent): void
    /**
     * Emitted when a rich-text toolbar command is applied — either via a
     * toolbar click or a keyboard shortcut. `value` carries the URL for
     * link insertion; undefined otherwise.
     */
    (e: 'format', command: TTextareaToolbarCommand, value?: string): void
}

/**
 * Slot signatures for `<OrigamTextareaField>`. Extends field and input slots
 * with the counter slot and the optional field override slot.
 */
export interface ITextareaFieldSlots extends IFieldSlots, Omit<IInputSlots, 'default'> {
    counter?: (data: { counter: string, max?: string | number, value: string | number }) => any
    field?: (data: { id: string, isDisabled: boolean, isDirty: boolean, isValid: boolean | undefined, isReadonly: boolean }) => any
    /** Replace the rich-text toolbar entirely (rich mode only). */
    toolbar?: (data: ITextareaToolbarSlotProps) => any
    /** Replace a single toolbar button (rich mode only). */
    'toolbar-item'?: (data: {
        command: TTextareaToolbarCommand
        label: string
        icon: string
        isActive: boolean
        onClick: () => void
    }) => any
}
