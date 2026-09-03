/**
 * `passwordStrength.composable.ts`
 *
 * Pure-function helper used by `<OrigamPasswordField>` to compute a
 * 0..4 strength score from a password value, plus a default rule set
 * for the inline checklist mode.
 *
 * Heuristic (deliberately simple — no third-party `zxcvbn` dependency):
 *   +1 length ≥ 8
 *   +1 length ≥ 12
 *   +1 contains a digit
 *   +1 contains an uppercase letter AND a lowercase letter
 *   +1 contains a non-alphanumeric character
 * Then clamped to 0..4 and mapped to a discrete level:
 *   0       → weak (empty / very short)
 *   1       → weak
 *   2       → fair
 *   3       → good
 *   4 / 5+  → strong
 *
 * Why score *and* level: the score drives how many of the 4 segments
 * fill, the level drives the colour token (`--origam-password-field
 * __strength---bg-{level}`).
 */

import {
    PASSWORD_MIN_LENGTH,
    PASSWORD_PATTERN_DIGIT,
    PASSWORD_PATTERN_LOWERCASE,
    PASSWORD_PATTERN_SPECIAL,
    PASSWORD_PATTERN_UPPERCASE,
    PASSWORD_STRENGTH_LEVEL_BY_SCORE,
    PASSWORD_STRENGTH_MAX_SCORE,
    PASSWORD_STRONG_LENGTH
} from '../../consts/PasswordField/password-field.const'

import { PASSWORD_STRENGTH_LEVEL } from '../../enums'
import type { IPasswordStrength } from '../../interfaces/PasswordField/password-strength.interface'
import type { TPasswordStrengthScore } from '../../types/PasswordField/password-field.type'

/**
 * Compute the strength of a password string. Pure — no side effects,
 * safe to call inside a `computed()` block.
 */

/*********************************************************
 * computeStrength
 ********************************************************/
export function computeStrength (value: string | null | undefined): IPasswordStrength {
    const v = (value ?? '').toString()

    if (v.length === 0) {
        return { score: 0, level: PASSWORD_STRENGTH_LEVEL.WEAK }
    }

    let raw = 0
    if (v.length >= PASSWORD_MIN_LENGTH) raw += 1
    if (v.length >= PASSWORD_STRONG_LENGTH) raw += 1
    if (PASSWORD_PATTERN_DIGIT.test(v)) raw += 1
    if (PASSWORD_PATTERN_LOWERCASE.test(v) && PASSWORD_PATTERN_UPPERCASE.test(v)) raw += 1
    if (PASSWORD_PATTERN_SPECIAL.test(v)) raw += 1

    // Clamp so the bar never exceeds its segment count.
    const score = (raw > PASSWORD_STRENGTH_MAX_SCORE ? PASSWORD_STRENGTH_MAX_SCORE : raw) as TPasswordStrengthScore

    return { score, level: PASSWORD_STRENGTH_LEVEL_BY_SCORE[score] }
}

// `DEFAULT_PASSWORD_REQUIREMENTS` lives in `src/consts/PasswordField/
// password-requirements.const.ts` per the global CLAUDE.md "Constants
// ONLY in src/consts/" rule. Re-import + re-export it here so existing
// `import { DEFAULT_PASSWORD_REQUIREMENTS } from '@/composables'`
// callsites keep resolving without a barrel-file change.
export { DEFAULT_PASSWORD_REQUIREMENTS } from '../../consts/PasswordField/password-field.const'
