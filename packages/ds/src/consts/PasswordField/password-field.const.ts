import { PASSWORD_STRENGTH_LEVEL } from '../../enums/PasswordField/password-field.enum'

import type { IPasswordRequirement } from '../../interfaces/PasswordField/password-requirement.interface'
import type {
    TPasswordStrengthLevel,
    TPasswordStrengthScore
} from '../../types/PasswordField/password-field.type'

/*********************************************************
 * PASSWORD_MIN_LENGTH / PASSWORD_STRONG_LENGTH
 *
 * @description
 * Length thresholds of the `computeStrength()` heuristic. `MIN` is also
 * the length the default `min-length` requirement below checks, so the
 * checklist and the strength bar can never drift apart.
 ********************************************************/
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_STRONG_LENGTH = 12

/*********************************************************
 * PASSWORD_PATTERN_DIGIT / PASSWORD_PATTERN_LOWERCASE /
 * PASSWORD_PATTERN_UPPERCASE / PASSWORD_PATTERN_SPECIAL
 *
 * @description
 * Character-class probes shared by `computeStrength()` and the default
 * requirement checklist. None carries the `g` flag, so the same object
 * is safe to `.test()` repeatedly (a sticky/global regex would carry
 * `lastIndex` between calls).
 ********************************************************/
export const PASSWORD_PATTERN_DIGIT = /\d/
export const PASSWORD_PATTERN_LOWERCASE = /[a-z]/
export const PASSWORD_PATTERN_UPPERCASE = /[A-Z]/
export const PASSWORD_PATTERN_SPECIAL = /[^A-Za-z0-9]/

/*********************************************************
 * PASSWORD_STRENGTH_MAX_SCORE
 *
 * @description
 * Highest score `computeStrength()` can return — also the number of
 * segments the strength bar paints, so the two are the same number by
 * construction rather than by coincidence.
 ********************************************************/
export const PASSWORD_STRENGTH_MAX_SCORE = 4

/*********************************************************
 * PASSWORD_STRENGTH_LEVEL_BY_SCORE
 *
 * @description
 * Score → colour-tier mapping. Replaces the chain of bare numeric
 * comparisons the heuristic used to carry: the whole 0..4 domain is
 * enumerated here, so an added score rung cannot silently fall through
 * to the wrong tier.
 ********************************************************/
export const PASSWORD_STRENGTH_LEVEL_BY_SCORE: Record<TPasswordStrengthScore, TPasswordStrengthLevel> = {
    0: PASSWORD_STRENGTH_LEVEL.WEAK,
    1: PASSWORD_STRENGTH_LEVEL.WEAK,
    2: PASSWORD_STRENGTH_LEVEL.FAIR,
    3: PASSWORD_STRENGTH_LEVEL.GOOD,
    4: PASSWORD_STRENGTH_LEVEL.STRONG
}

/*********************************************************
 * DEFAULT_PASSWORD_REQUIREMENTS
 *
 * @description
 * Used when the consumer passes `requirements: true` to
 * `<OrigamPasswordField>` (no explicit array).
 *
 * @description
 * Mirrors the legacy `need*` flag set but exposed as composable
 * predicates so the new inline checklist UI can iterate them
 * generically.
 *
 * @description
 * Intentionally not localised here — labels are picked up via the
 * `t()` helper at render time when consumers want i18n. The defaults
 * carry English strings so a bare `requirements: true` still renders
 * something sensible.
 *
 * @description
 * Co-located with the rest of the project's constants (`src/consts/`)
 * per the global CLAUDE.md "Constants ONLY in `src/consts/`" rule.
 ********************************************************/
export const DEFAULT_PASSWORD_REQUIREMENTS: IPasswordRequirement[] = [
    {
        id: 'min-length',
        label: '',
        labelKey: 'origam.password_field.requirement_min_length',
        labelParams: {count: PASSWORD_MIN_LENGTH},
        test: (v: string) => (v ?? '').length >= PASSWORD_MIN_LENGTH
    },
    {
        id: 'uppercase',
        label: '',
        labelKey: 'origam.password_field.requirement_uppercase',
        test: (v: string) => PASSWORD_PATTERN_UPPERCASE.test(v ?? '')
    },
    {
        id: 'number',
        label: '',
        labelKey: 'origam.password_field.requirement_number',
        test: (v: string) => PASSWORD_PATTERN_DIGIT.test(v ?? '')
    },
    {
        id: 'special',
        label: '',
        labelKey: 'origam.password_field.requirement_special',
        test: (v: string) => PASSWORD_PATTERN_SPECIAL.test(v ?? '')
    }
]

/*********************************************************
 * REQUIREMENT_MIN_LENGTH / REQUIREMENT_TINY / REQUIREMENT_UPPERCASE /
 * REQUIREMENT_NUMBER / REQUIREMENT_SPECIAL
 *
 * @description
 * Password strength requirement descriptors used by `<OrigamPasswordField>`.
 *
 * @description
 * Each entry exposes:
 *   - `key`     — internal identifier matched by `infos[key]` and the
 *                 `validation.must_contains` locale interpolation.
 *   - `message` — human-readable label for the validation message
 *                 ("must contain a number", etc.).
 *   - `icon`    — single-character glyph rendered inside the requirements
 *                 popup tile.
 *   - `reg`     — regex evaluated against the current input value.
 *
 * @description
 * The minimum length is the only parametric requirement, exposed as a
 * factory so the message / icon / regex can interpolate the configured
 * length per-instance.
 ********************************************************/

/*********************************************************
 * Length shown / enforced when `requirements` is on and no `minLength` is given.
 ********************************************************/
export const DEFAULT_MIN_LENGTH = 8

export const REQUIREMENT_MIN_LENGTH = (length: number) => ({
    key: 'minLength',
    messageKey: 'origam.password_field.message_min_length',
    count: length,
    icon: `+${length}`,
    reg: new RegExp(`(.{${length},})`)
})

export const REQUIREMENT_TINY = {
    key: 'tiny',
    messageKey: 'origam.password_field.message_tiny',
    icon: 'a',
    reg: /(?=.*[a-z])/
} as const

export const REQUIREMENT_UPPERCASE = {
    key: 'uppercase',
    messageKey: 'origam.password_field.message_uppercase',
    icon: 'A',
    reg: /(?=.*[A-Z])/
} as const

export const REQUIREMENT_NUMBER = {
    key: 'number',
    messageKey: 'origam.password_field.message_number',
    icon: '1',
    reg: /(?=.*\d)/
} as const

export const REQUIREMENT_SPECIAL = {
    key: 'special',
    messageKey: 'origam.password_field.message_special',
    icon: '@',
    reg: /(?=.*[^a-zA-Z0-9\s])/
} as const
