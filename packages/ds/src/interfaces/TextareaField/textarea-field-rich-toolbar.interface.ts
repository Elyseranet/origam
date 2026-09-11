import type {
    TTextareaToolbarCommand,
    TTextareaToolbarPosition
} from '../../types/TextareaField/textarea-field-rich-toolbar.type'

import type { ITextareaRichActiveState } from './textarea-field-rich.interface'

/**
 * Props for the internal `<OrigamTextareaFieldRichToolbar>` sub-component. Kept
 * private to the package (exposed via the `OrigamTextareaField` slots)
 * so we can iterate on the API without breaking external consumers.
 */
export interface ITextareaFieldRichToolbarProps {
    items: ReadonlyArray<TTextareaToolbarCommand>
    active: ITextareaRichActiveState
    position?: TTextareaToolbarPosition
    disabled?: boolean
}

/**
 * Emits the toolbar surfaces upwards. `format` carries the command id
 * and, for link insertion, the URL the user typed.
 */
export interface ITextareaFieldRichToolbarEmits {
    (e: 'format', command: TTextareaToolbarCommand, value?: string): void
}

/*********************************************************
 * ITextareaFieldRichToolbarSlots
 *
 * @description
 * `<OrigamTextareaFieldRichToolbar>` renders its own fixed button row
 * (plus the link popover) — no `<slot>` in its template.
 ********************************************************/
export interface ITextareaFieldRichToolbarSlots {}

/**
 * Public payload exposed by the `#toolbar` slot of `OrigamTextareaField`.
 * Consumers can render a fully custom toolbar while still reusing the
 * core formatting machinery.
 */
export interface ITextareaToolbarSlotProps {
    format: (command: TTextareaToolbarCommand, value?: string) => void
    isFormat: (command: TTextareaToolbarCommand) => boolean
    items: ReadonlyArray<TTextareaToolbarCommand>
    active: ITextareaRichActiveState
}
