import type { IMaskOptions } from '../../interfaces'

import type { TBuiltInPattern } from './built-in-pattern.type'

/**
 * Accepted value for the `OrigamTextField.mask` prop and the
 * `useMask` first arg. Either a built-in preset key, a raw
 * pattern string (with `#`, `A`, `*`, literals), or a full
 * options object.
 */
export type TMask = TBuiltInPattern | string | IMaskOptions | null

/**
 * Token kinds recognised by the in-house token-walker.
 *
 * - `digit`    : consumer slot, accepts `[0-9]` only.    (`#`)
 * - `letter`   : consumer slot, accepts `[a-zA-Z]` only. (`A`)
 * - `any`      : consumer slot, accepts any character.   (`*`)
 * - `literal`  : emitted as-is, does NOT consume the
 *                input character.
 */
export type TMaskTokenKind = 'digit' | 'letter' | 'any' | 'literal'
