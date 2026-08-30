import type { IBorderProps } from '../Commons/border.interface'
import type { IChipProps } from '../Chip/chip.interface'
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

import type {
    TFile,
    TFileFieldDisplay,
    TFileSize
} from '../../types/FileField/file-field.type'

export interface IFileFieldProps extends ICommonsComponentProps, IColorProps, IDensityProps, IFieldProps, IInputProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IElevationProps {
    chips?: boolean
    counter?: boolean
    counterSizeString?: string
    counterString?: string
    placeholder?: string
    persistentPlaceholder?: boolean
    persistentCounter?: boolean
    multiple?: boolean
    showSize?: TFileSize
    modelValue?: TFile
    chipProps?: IChipProps
    maxFileSize?: number
    dragndrop?: boolean
    dragndropIcon?: string
    fileIcon?: string
    removeIcon?: string
    downloadIcon?: string
    downloadable?: boolean
    progress?: Array<number>
    dropzoneTitle?: string
    dropzoneSubtitle?: string
    maxFileSizeErrorString?: string
    /**
     * How a multi-file selection is rendered:
     *   - `'list'`     (default) — vertical card stack under the field.
     *   - `'chips'`    — each file as a closable `<OrigamChip>` inline.
     *   - `'counter'`  — single text "{n} files" + an `<OrigamCounter>`.
     *
     * Single-file selection ignores this prop and always shows the file
     * name with a paperclip prepend.
     */
    display?: TFileFieldDisplay
    /**
     * Render the field as a large outlined drop-zone instead of an inline
     * input. Equivalent to (and aliased by) the legacy `dragndrop` prop —
     * keep both for backward-compat. When `true`, the wrapper accepts
     * native drag-and-drop events, paints a `--dragging` modifier on
     * dragover, and falls back to a click-to-browse interaction.
     */
    dropzone?: boolean
}

export interface IFileFieldEmits extends IFieldEmits, IInputEmits {
    (e: 'click:control', value: MouseEvent): void
    (e: 'mousedown:control', value: MouseEvent): void
    (e: 'click:remove', value: { file: File, index: number }): void
    (e: 'click:download', value: { file: File, index: number }): void
    (e: 'drop', value: { files: Array<File>, event: DragEvent }): void
    (e: 'error:max-size', value: { files: Array<File>, maxFileSize: number, message: Array<string> }): void
}

export interface IFileFieldSlots extends IFieldSlots, Omit<IInputSlots, 'default'> {
    counter?: (data: { counter: string, value: string | number, max?: string | number }) => any
    field?: (data: { id: string, isDisabled: boolean, isDirty: boolean, isValid: boolean | undefined, isReadonly: boolean }) => any
    dropzone?: (data: { isDragging: boolean, browse: () => void }) => any
    item?: (data: { file: File, index: number, progress: number, remove: () => void, download: () => void }) => any
    chip?: (data: { fileNames: string, totalBytes: number, totalBytesReadable: string, props: Record<string, any> }) => any
    selection?: () => any
}
