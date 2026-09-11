import type { TPasswordStrengthLevel, TPasswordStrengthScore } from '../../types'

/**
 * Result returned by `computeStrength()` and consumed by
 * `<OrigamPasswordField>` to drive the strength bar UI.
 *
 * - `score` (0..4) — number of bar segments that should fill, mapped
 *   1:1 to a discrete colour token via `level`.
 * - `level` — colour-tier identifier (`weak | fair | good | strong`)
 *   that resolves to `--origam-password-field__strength---bg-{level}`.
 *
 * The split between `score` and `level` lets consumers display either
 * dimension independently — e.g. a `score >= 2` gate without caring
 * about the colour tier, or a `level === 'strong'` "great password"
 * confirmation badge.
 */
export interface IPasswordStrength {
    score: TPasswordStrengthScore
    level: TPasswordStrengthLevel
}
