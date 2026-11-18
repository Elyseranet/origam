import type { ICommand } from './command.interface'
import type { TCommandPaletteFilter } from '../../types/CommandPalette/command-palette.type'
import type { IAttachProps } from '../Commons/attach.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { ITypographyProps } from '../Commons/typography.interface'
import type { TIcon } from '../../types/Icon/icon.type'

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

export interface ICommandPaletteProps extends ICommonsComponentProps, Pick<ITypographyProps, 'fontSize'>, IAttachProps {
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
    /*********************************************************
     * filter (#1184)
     *
     * @description
     * Comment `commands` est filtré selon la requête. `true` (défaut) : fuzzy match intégré, qui garde les sous-séquences et re-trie par score.
     * @description
     * `false` : `commands` affichées telles quelles, dans l'ordre fourni (liste déjà filtrée/classée par un serveur ou un moteur plein-texte, alimentée via l'event `query`).
     * @description
     * Fonction `(commands, query) => commands` : affiche ce qu'elle renvoie, dans son ordre. Dans les deux modes non défaut, la liste est plate (sans en-tête de groupe) tant que la requête est non vide, aucun match n'est surligné, et `commands` est honorée même vide (pas de repli sur le registre `useCommand()`).
     ********************************************************/
    filter?: TCommandPaletteFilter
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
    searchIcon?: TIcon
    loadingIcon?: TIcon
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
    'search-icon'?: () => any
    loading?: () => any
    footer?: () => any
}
