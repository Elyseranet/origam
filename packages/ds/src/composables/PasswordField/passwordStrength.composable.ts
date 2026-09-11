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

import type { IPasswordStrength } from '../../interfaces'
import type { TPasswordStrengthLevel, TPasswordStrengthScore } from '../../types'

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
        return { score: 0, level: 'weak' }
    }

    let raw = 0
    if (v.length >= 8) raw += 1
    if (v.length >= 12) raw += 1
    if (/\d/.test(v)) raw += 1
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) raw += 1
    if (/[^A-Za-z0-9]/.test(v)) raw += 1

    // Clamp 0..4 so the bar never exceeds 4 segments.
    const score = (raw > 4 ? 4 : raw) as TPasswordStrengthScore

    let level: TPasswordStrengthLevel
    if (score <= 1) level = 'weak'
    else if (score === 2) level = 'fair'
    else if (score === 3) level = 'good'
    else level = 'strong'

    return { score, level }
}

// `DEFAULT_PASSWORD_REQUIREMENTS` lives in `src/consts/PasswordField/
// password-requirements.const.ts` per the global CLAUDE.md "Constants
// ONLY in src/consts/" rule. Re-import + re-export it here so existing
// `import { DEFAULT_PASSWORD_REQUIREMENTS } from '@/composables'`
// callsites keep resolving without a barrel-file change.
export { DEFAULT_PASSWORD_REQUIREMENTS } from '../../consts'
