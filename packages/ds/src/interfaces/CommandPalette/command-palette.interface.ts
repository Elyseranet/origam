import type { ICommand } from './command.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

/**
 * A hotkey is either a single combination (`['meta', 'k']`) or an
 * array of alternatives — every entry being a list of normalised key
 * tokens compatible with `useHotkey` (e.g. `[['meta', 'k'], ['ctrl', 'k']]`).
 *
 * The component normalises a single-combination input (`['meta', 'k']`)
 * to the multi-combination shape (`[['meta', 'k']]`) before installing
 * the listeners so consumers can pass either form interchangeably.
 */
export type TCommandPaletteHotkey = ReadonlyArray<string> | ReadonlyArray<ReadonlyArray<string>>

export interface ICommandPaletteProps extends ICommonsComponentProps, ITypographyProps {
    /** v-model — whether the palette is open. */
    modelValue?: boolean
    /**
     * Global hotkey(s) that toggle the palette open. Defaults to
     * `[['meta', 'k'], ['ctrl', 'k']]` (⌘K / Ctrl+K). Pass `null`
     * to disable the global listener entirely.
     */
    hotkey?: TCommandPaletteHotkey | null
    /**
     * Static command list. When omitted, the palette renders commands
     * registered via the `useCommand()` global registry instead.
     */
    commands?: ReadonlyArray<ICommand>
    /** Placeholder of the search input (already-translated string). */
    placeholder?: string
    /** Empty-state message when no command matches the query. */
    emptyText?: string
    /** Max height of the result list. Number → px. */
    maxHeight?: number | string
    /** Width of the palette dialog. Number → px. */
    width?: number | string
    /** Display a loader inside the result list (use during async fetches). */
    loading?: boolean
    /** Close the palette automatically when a command is selected. */
    closeOnSelect?: boolean
    /** Close when the user presses Escape. */
    closeOnEscape?: boolean
    /** Close when the user clicks the backdrop. */
    closeOnBackdrop?: boolean
}

export interface ICommandPaletteEmits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'select', command: ICommand): void
    (e: 'query', text: string): void
}

export interface ICommandPaletteSlotProps {
    command: ICommand
    isActive: boolean
}

export interface ICommandPaletteSlots {
    item?: (props: ICommandPaletteSlotProps) => any
    empty?: () => any
    footer?: () => any
}
