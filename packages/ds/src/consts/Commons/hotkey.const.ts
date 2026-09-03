import { KEYBOARD_MODIFIERS_KEY } from "../../enums"
import { TKeyboardModifiers } from '../../types/Commons/hotkey.type'

export const KEYBOARD_MODIFIERS: TKeyboardModifiers[] = [KEYBOARD_MODIFIERS_KEY.CONTROL, KEYBOARD_MODIFIERS_KEY.SHIFT, KEYBOARD_MODIFIERS_KEY.ALT, KEYBOARD_MODIFIERS_KEY.META, KEYBOARD_MODIFIERS_KEY.COMMAND]

/**
 * Default window (ms) a multi-group hotkey SEQUENCE (`'g-then-i'`) waits
 * for the next group before resetting to its first group. Overridable per
 * call via `IHotkeyOptions.sequenceTimeout`.
 */
export const HOTKEY_SEQUENCE_TIMEOUT = 1000

/**
 * `navigator.userAgent` marker used to decide whether `cmd` / `meta`
 * should map onto `metaKey` (macOS) or fall back to `ctrlKey`
 * (everything else).
 */
export const MACINTOSH_UA_TOKEN = 'Macintosh'

/**
 * Emitted when `useHotkey` is called outside a Vue `setup()` context: no
 * `onBeforeUnmount` hook can be registered, so the caller owns the
 * returned cleanup function.
 */
export const HOTKEY_NO_AUTO_CLEANUP_WARNING = "Can't cleanup"

/**
 * Centralized key alias mapping for consistent key normalization across the hotkey system.
 *
 * This maps various user-friendly aliases to canonical key names that match
 * KeyboardEvent.key values (in lowercase) where possible.
 */
export const KEYBOARD_ALIASES: Record<string, string> = {
    // Modifier aliases (from vue-use, other libraries, and current implementation)
    control: 'ctrl',
    command: 'cmd',
    option: 'alt',

    // Arrow key aliases (common abbreviations)
    up: 'arrowup',
    down: 'arrowdown',
    left: 'arrowleft',
    right: 'arrowright',

    // Other common key aliases
    esc: 'escape',
    spacebar: ' ',
    space: ' ',
    return: 'enter',
    del: 'delete',

    minus: '-',
    hyphen: '-'
}
