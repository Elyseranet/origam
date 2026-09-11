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
