import { KEYBOARD_VALUES } from '../../enums/Commons/hotkey.enum'

/*********************************************************
 * RATING_FIELD_MUTATING_KEYS
 *
 * @description
 * Keys whose NATIVE default action changes the selection of a radio group.
 * Measured in Chromium on a bare `<input type="radio">` group, no JS at all:
 * `ArrowRight` / `ArrowDown` move focus AND check the next radio (wrapping),
 * `ArrowLeft` / `ArrowUp` do the same backwards, `Space` checks the focused
 * radio when it is not already checked, and `Home` / `End` / `Enter` are
 * no-ops.
 *
 * @description
 * All of the above are cancelable from a `keydown` listener — verified: with
 * `preventDefault()` on every `Arrow*`, focus and `:checked` both stayed put.
 * That is what lets `readonly` keep the group REACHABLE (focus visible,
 * announced) while staying inert, instead of dropping it out of the tab order.
 *
 * @description
 * ⚠️ `Space` is `' '` in `KeyboardEvent.key`, NOT `'Space'` — that spelling is
 * `KeyboardEvent.code`. `KEYBOARD_VALUES.SPACE` carries the `code` form and
 * would never match here; `KEYBOARD_VALUES.EMPTY` is the `key` one.
 ********************************************************/
export const RATING_FIELD_MUTATING_KEYS: string[] = [
    KEYBOARD_VALUES.UP,
    KEYBOARD_VALUES.DOWN,
    KEYBOARD_VALUES.LEFT,
    KEYBOARD_VALUES.RIGHT,
    KEYBOARD_VALUES.HOME,
    KEYBOARD_VALUES.END,
    KEYBOARD_VALUES.EMPTY
]

/*********************************************************
 * RATING_FIELD_ENABLED_RADIO_SELECTOR / RATING_FIELD_ROOT_SELECTOR
 *
 * @description
 * The radios a keyboard user can actually reach inside the group. `:disabled`
 * radios are excluded by the browser from both the tab order and the arrow
 * cycle, so `Home` / `End` must skip them too.
 *
 * @description
 * The root BEM block, used to walk up from a focused radio to its group.
 ********************************************************/
export const RATING_FIELD_ENABLED_RADIO_SELECTOR = 'input[type="radio"]:not(:disabled)'

export const RATING_FIELD_ROOT_SELECTOR = '.origam-rating-field'
