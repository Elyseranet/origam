/**
 * Discrete strength bucket emitted by `computeStrength()`. Doubles as
 * the CSS modifier on the strength-bar segments
 * (`origam-password-field__strength-segment--{level}`) and as the
 * lookup key into `--origam-password-field__strength---bg-{level}`.
 */
export enum PASSWORD_STRENGTH_LEVEL {
    WEAK = 'weak',
    FAIR = 'fair',
    GOOD = 'good',
    STRONG = 'strong'
}
