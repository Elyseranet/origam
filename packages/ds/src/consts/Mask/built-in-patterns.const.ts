import type { IMaskOptions } from '../../interfaces'

import { BUILT_IN_PATTERN, PATTERN_VALIDATOR } from '../../enums'

import type { TBuiltInPattern } from '../../types'

/**
 * Curated mask presets — name → `{ pattern, validator }`.
 *
 * Naming convention: lowercase identifiers (`phone:fr`,
 * `creditcard`, `date:iso`), matching the public string
 * literals exposed via `TBuiltInPattern`.
 *
 * The `pattern` strings use the token-walker syntax:
 *   `#` digit · `A` letter · `*` any · everything else
 *   is a literal copied verbatim.
 */
export const BUILT_IN_PATTERNS: Record<TBuiltInPattern, IMaskOptions> = {
    [BUILT_IN_PATTERN.PHONE_FR]: {
        pattern: '## ## ## ## ##',
        validator: null
    },
    [BUILT_IN_PATTERN.PHONE_US]: {
        pattern: '(###) ###-####',
        validator: null
    },
    [BUILT_IN_PATTERN.PHONE_INTERNATIONAL]: {
        pattern: '+## ## ## ## ## ##',
        validator: null
    },
    [BUILT_IN_PATTERN.IBAN]: {
        // IBAN max length is 34, FR is 27, EN is 22.
        // Pattern accepts up to 34 alphanumeric chars in
        // 4-char blocks. The `validator` enforces the
        // mod-97 checksum on the unmasked value.
        pattern: '**** **** **** **** **** **** ****  **',
        validator: PATTERN_VALIDATOR.IBAN
    },
    [BUILT_IN_PATTERN.SIRET]: {
        pattern: '### ### ### #####',
        validator: null
    },
    [BUILT_IN_PATTERN.CREDIT_CARD]: {
        pattern: '#### #### #### ####',
        validator: PATTERN_VALIDATOR.LUHN
    },
    [BUILT_IN_PATTERN.DATE_ISO]: {
        pattern: '####-##-##',
        validator: PATTERN_VALIDATOR.DATE_ISO
    },
    [BUILT_IN_PATTERN.DATE_FR]: {
        pattern: '##/##/####',
        validator: PATTERN_VALIDATOR.DATE_FR
    },
    [BUILT_IN_PATTERN.DATE_US]: {
        pattern: '##/##/####',
        validator: PATTERN_VALIDATOR.DATE_US
    },
    [BUILT_IN_PATTERN.TIME]: {
        pattern: '##:##',
        validator: null
    },
    [BUILT_IN_PATTERN.TIME_12H]: {
        pattern: '##:## AA',
        validator: null
    },
    [BUILT_IN_PATTERN.POSTCODE_FR]: {
        pattern: '#####',
        validator: null
    },
    [BUILT_IN_PATTERN.POSTCODE_US]: {
        pattern: '#####',
        validator: null
    }
}

/**
 * Set of registered preset keys — used by
 * `resolveMaskConfig` to discriminate string-key vs raw
 * pattern.
 */
export const BUILT_IN_PATTERN_KEYS = new Set<string>(Object.keys(BUILT_IN_PATTERNS))
