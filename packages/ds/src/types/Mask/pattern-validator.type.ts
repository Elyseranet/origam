import type { PATTERN_VALIDATOR } from '../../enums'

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
