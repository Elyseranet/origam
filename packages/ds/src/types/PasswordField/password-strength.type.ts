/**
 * `TPasswordStrengthLevel` — discrete bucket emitted by the
 * `computeStrength()` heuristic from
 * `composables/PasswordField/passwordStrength.composable.ts`.
 *
 * The value also doubles as a CSS modifier on the strength-bar segments
 * (`origam-password-field__strength-segment--{level}`) and as the lookup
 * key into the `--origam-password-field__strength---bg-{level}` token.
 */
export type TPasswordStrengthLevel = 'weak' | 'fair' | 'good' | 'strong'

/**
 * `TPasswordStrengthScore` — integer 0..4 returned by `computeStrength()`.
 * Drives how many segments of the bar are filled (0 = empty, 4 = full).
 */
export type TPasswordStrengthScore = 0 | 1 | 2 | 3 | 4
