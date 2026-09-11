import { KEYBOARD_MODIFIERS_KEY } from "../../enums"
import { TKeyboardModifiers } from "../../types"

export const KEYBOARD_MODIFIERS: TKeyboardModifiers[] = [KEYBOARD_MODIFIERS_KEY.CONTROL, KEYBOARD_MODIFIERS_KEY.SHIFT, KEYBOARD_MODIFIERS_KEY.ALT, KEYBOARD_MODIFIERS_KEY.META, KEYBOARD_MODIFIERS_KEY.COMMAND]

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
