import { KEYBOARD_VALUES } from '../../enums/Commons/hotkey.enum'

/**
 * Keys whose NATIVE default action changes the selection of a radio group.
 *
 * Measured in Chromium on a bare `<input type="radio">` group (no JS at all):
 *
 * ```
 * ArrowRight / ArrowDown  -> moves focus AND checks the next radio (wraps)
 * ArrowLeft  / ArrowUp    -> moves focus AND checks the previous radio (wraps)
 * Space                   -> checks the focused radio when it is not already
 * Home / End / Enter      -> no-ops
 * ```
 *
 * All of the above are cancelable from a `keydown` listener — verified: with
 * `preventDefault()` on every `Arrow*`, focus and `:checked` both stayed put.
 * That is what lets `readonly` keep the group REACHABLE (focus visible,
 * announced) while staying inert, instead of dropping it out of the tab order.
 *
 * ⚠️ `Space` is `' '` in `KeyboardEvent.key`, NOT `'Space'` — that is
 * `KeyboardEvent.code`. `KEYBOARD_VALUES.SPACE` is the `code` spelling and
 * would never match here.
 */
export const RATING_FIELD_MUTATING_KEYS: string[] = [
    KEYBOARD_VALUES.UP,
    KEYBOARD_VALUES.DOWN,
    KEYBOARD_VALUES.LEFT,
    KEYBOARD_VALUES.RIGHT,
    KEYBOARD_VALUES.HOME,
    KEYBOARD_VALUES.END,
    KEYBOARD_VALUES.EMPTY
]

/** Selector matching the radios a keyboard user can actually reach inside the
 *  group — `:disabled` radios are excluded by the browser from both the tab
 *  order and the arrow cycle, so `Home` / `End` must skip them too. */
export const RATING_FIELD_ENABLED_RADIO_SELECTOR = 'input[type="radio"]:not(:disabled)'

/** Root BEM block, used to walk up from a focused radio to its group. */
export const RATING_FIELD_ROOT_SELECTOR = '.origam-rating-field'
