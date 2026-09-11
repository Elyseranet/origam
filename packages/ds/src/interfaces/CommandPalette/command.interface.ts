import type { TIcon } from '../../types'

/**
 * A single command/action exposed by `OrigamCommandPalette`.
 *
 * Commands are registered either declaratively through the
 * `commands` prop on `<OrigamCommandPalette>` OR programmatically
 * via the `useCommand().register(cmd)` composable. The composable
 * route is preferred when commands need to spawn from feature code
 * that owns the side-effect (router push, store mutation, …).
 */
export interface ICommand {
    /**
     * Stable identifier. Used as the v-for key, the ARIA
     * `aria-activedescendant` target and as the dedup key in the
     * registry — registering twice with the same `id` overwrites
     * the previous entry instead of duplicating it.
     */
    id: string
    /** Visible primary label. Drives the default fuzzy-match input. */
    label: string
    /** Secondary line shown under the label (optional). */
    description?: string
    /** Optional prepend icon. */
    icon?: TIcon
    /**
     * Keyboard shortcut hint rendered through `<OrigamKbd>` next to
     * the action. Display-only — it does NOT bind a global listener.
     * (To bind a shortcut globally, use the `hotkey` prop on the
     * palette OR the `useHotkey` composable on the call site.)
     */
    kbd?: ReadonlyArray<string>
    /**
     * Group label (e.g. "Navigation", "Settings"). Commands sharing
     * the same group render under the same subheader. Commands
     * without a group fall back to a default bucket rendered first.
     */
    group?: string
    /**
     * Extra search terms that should match the command (e.g.
     * `['preferences', 'config']` for a "Settings" entry).
     */
    keywords?: ReadonlyArray<string>
    /**
     * Handler invoked when the command is selected. May be async — the
     * palette awaits the returned promise before closing (when
     * `closeOnSelect` is `true`).
     */
    perform: () => void | Promise<void>
    /** Disabled commands stay visible but cannot be selected. */
    disabled?: boolean
}
