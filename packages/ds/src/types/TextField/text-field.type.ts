import type { BUILT_IN_PATTERN, PATTERN_VALIDATOR } from '../../enums/TextField/text-field.enum'
import type { IMaskOptions } from '../../interfaces/Commons/mask.interface'
import OrigamTextField from '../../components/TextField/OrigamTextField.vue'
import { MASK_TOKEN_KIND, TEXT_FIELD_TYPE } from '../../enums/TextField/text-field.enum'

export type TTextFieldType = `${TEXT_FIELD_TYPE}`

export type TOrigamTextField = InstanceType<typeof OrigamTextField>


/**
 * Discriminated union of every curated mask preset shipped
 * with origam. New presets must be added to
 * `BUILT_IN_PATTERN` AND `BUILT_IN_PATTERNS` (const map).
 */
export type TBuiltInPattern = typeof BUILT_IN_PATTERN[keyof typeof BUILT_IN_PATTERN]

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
export type TMaskTokenKind = `${MASK_TOKEN_KIND}`

/**
 * Built-in validator name (string) — recognised by
 * `validatePattern`.
 */
export type TPatternValidatorName = typeof PATTERN_VALIDATOR[keyof typeof PATTERN_VALIDATOR]

/**
 * User-supplied validator function — receives the UNMASKED
 * value and returns `true` if it passes business rules.
 */
export type TPatternValidatorFn = (unmasked: string) => boolean

/**
 * Validator passed to `useMask` / accepted by `resolveMaskConfig`.
 * Either a registered name, or an arbitrary function.
 */
export type TPatternValidator = TPatternValidatorName | TPatternValidatorFn
