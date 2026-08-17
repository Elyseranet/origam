import type { ComputedRef, Ref } from 'vue'

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

/**
 * Backing store of `useCommand`'s process-wide singleton registry.
 *
 * Module-scoped rather than provide/inject on purpose: commands are
 * spawned from anywhere — feature code, plugins, background services —
 * without coupling to a Vue tree.
 */
export interface ICommandRegistry {
    /** Live array of registered commands. Dedup by id is enforced at write time. */
    items: Ref<Array<ICommand>>
    /** Whether the global palette singleton is currently open. */
    isOpen: Ref<boolean>
}

/** Public API returned by `useCommand`. */
export interface IUseCommandReturn {
    /**
     * Register a command. Returns an `unregister()` closure so callers
     * can drop the entry imperatively. When called from inside a Vue
     * effect scope, the entry is auto-unregistered on scope dispose
     * (component unmount, route leave, …) via `tryOnScopeDispose`.
     */
    register: (cmd: ICommand) => () => void
    /** Drop the entry with the matching `id`. No-op if unknown. */
    unregister: (id: string) => void
    /**
     * Reactive read-only view of every registered command, deduplicated
     * by id.
     */
    commands: ComputedRef<ReadonlyArray<ICommand>>
    /** Open the global palette singleton. */
    open: () => void
    /** Close the global palette singleton. */
    close: () => void
    /** Reactive open/close state of the global palette singleton. */
    isOpen: Ref<boolean>
}

/**
 * Output of `fuzzyMatch` — the matched item carries its score so callers
 * can short-circuit a re-sort on cached input.
 */
export interface IFuzzyMatchResult<T> {
    /** Original item passed in. */
    item: T
    /** Higher = better fit. `0` is the floor for a successful match. */
    score: number
}
