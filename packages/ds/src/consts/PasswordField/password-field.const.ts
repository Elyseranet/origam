import type { IPasswordRequirement } from '../../interfaces/PasswordField/password-requirement.interface'

/**
 * `DEFAULT_PASSWORD_REQUIREMENTS` — used when the consumer passes
 * `requirements: true` to `<OrigamPasswordField>` (no explicit array).
 *
 * Mirrors the legacy `need*` flag set but exposed as composable
 * predicates so the new inline checklist UI can iterate them
 * generically.
 *
 * Intentionally not localised here — labels are picked up via the
 * `t()` helper at render time when consumers want i18n. The defaults
 * carry English strings so a bare `requirements: true` still renders
 * something sensible.
 *
 * Co-located with the rest of the project's constants (`src/consts/`)
 * per the global CLAUDE.md "Constants ONLY in `src/consts/`" rule.
 */
export const DEFAULT_PASSWORD_REQUIREMENTS: IPasswordRequirement[] = [
    {
        id: 'min-length',
        label: 'At least 8 characters',
        test: (v: string) => (v ?? '').length >= 8
    },
    {
        id: 'uppercase',
        label: 'At least 1 uppercase letter',
        test: (v: string) => /[A-Z]/.test(v ?? '')
    },
    {
        id: 'number',
        label: 'At least 1 number',
        test: (v: string) => /\d/.test(v ?? '')
    },
    {
        id: 'special',
        label: 'At least 1 special character',
        test: (v: string) => /[^A-Za-z0-9]/.test(v ?? '')
    }
]

/**
 * Password strength requirement descriptors used by `<OrigamPasswordField>`.
 *
 * Each entry exposes:
 *   - `key`     — internal identifier matched by `infos[key]` and the
 *                 `validation.must_contains` locale interpolation.
 *   - `message` — human-readable label for the validation message
 *                 ("must contain a number", etc.).
 *   - `icon`    — single-character glyph rendered inside the requirements
 *                 popup tile.
 *   - `reg`     — regex evaluated against the current input value.
 *
 * The minimum length is the only parametric requirement, exposed as a
 * factory so the message / icon / regex can interpolate the configured
 * length per-instance.
 */

export const REQUIREMENT_MIN_LENGTH = (length: number) => ({
    key: 'minLength',
    message: `${length} characters`,
    icon: `+${length}`,
    reg: new RegExp(`(.{${length},})`)
})

export const REQUIREMENT_TINY = {
    key: 'tiny',
    message: 'a tiny',
    icon: 'a',
    reg: /(?=.*[a-z])/
} as const

export const REQUIREMENT_UPPERCASE = {
    key: 'uppercase',
    message: 'a uppercase',
    icon: 'A',
    reg: /(?=.*[A-Z])/
} as const

export const REQUIREMENT_NUMBER = {
    key: 'number',
    message: 'a number',
    icon: '1',
    reg: /(?=.*[0-9])/
} as const

export const REQUIREMENT_SPECIAL = {
    key: 'special',
    message: 'a special character (!@#$%)',
    icon: '@',
    reg: /(?=.*[^a-zA-Z0-9\s])/
} as const
