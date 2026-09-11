/**
 * Built-in mask pattern keys recognised by `useMask` /
 * `resolveMaskConfig`. The value is the canonical lookup
 * key inside `BUILT_IN_PATTERNS`.
 *
 * Custom patterns are passed as raw strings; this enum
 * lists only the curated, "blessed" presets.
 */
export const BUILT_IN_PATTERN = {
    PHONE_FR: 'phone:fr',
    PHONE_US: 'phone:us',
    PHONE_INTERNATIONAL: 'phone:international',
    IBAN: 'iban',
    SIRET: 'siret',
    CREDIT_CARD: 'creditcard',
    DATE_ISO: 'date:iso',
    DATE_FR: 'date:fr',
    DATE_US: 'date:us',
    TIME: 'time',
    TIME_12H: 'time:12h',
    POSTCODE_FR: 'postcode:fr',
    POSTCODE_US: 'postcode:us'
} as const

/**
 * Built-in validator keys. A validator works on the
 * UNMASKED value (no separators) and asserts a semantic
 * constraint that the token-walker cannot express on its
 * own (Luhn checksum, IBAN mod-97, real-calendar dates …).
 */
export const PATTERN_VALIDATOR = {
    LUHN: 'luhn',
    IBAN: 'iban',
    DATE_ISO: 'date:iso',
    DATE_FR: 'date:fr',
    DATE_US: 'date:us'
} as const
