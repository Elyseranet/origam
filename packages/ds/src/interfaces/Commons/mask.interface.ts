import type { Ref } from 'vue'

import type {
    TMaskTokenKind,
    TPatternValidator
} from '../../types/TextField/text-field.type'

/**
 * Configuration object accepted by `useMask` / the
 * `OrigamTextField.mask` prop in its long form.
 *
 * - `pattern`   — token-walker template. `#` = digit,
 *                 `A` = letter, `*` = any char, anything
 *                 else is a literal preserved verbatim.
 * - `validator` — optional secondary check on the UNMASKED
 *                 value (e.g. Luhn for credit cards).
 * - `required`  — when `true`, `isValid` is `false` until
 *                 every consumer token is filled.
 */
export interface IMaskOptions {
    pattern: string
    validator?: TPatternValidator | null
    required?: boolean
}

/**
 * Resolved config returned by `resolveMaskConfig` after
 * normalising a string / preset key / IMaskOptions input.
 * `pattern` is always a raw template string at this layer.
 */
export interface IResolvedMaskConfig {
    pattern: string
    validator: TPatternValidator | null
    required: boolean
}

/**
 * Output shape of `applyMask`. `masked` is the formatted
 * display string (literals interleaved); `unmasked` is the
 * raw user-provided characters (consumer slots only).
 */
export interface IMaskApplyResult {
    masked: string
    unmasked: string
    complete: boolean
}

/**
 * Token emitted by the pattern parser. `consumer` flags
 * whether the token consumes one character from the input
 * (`#`, `A`, `*`) or is a literal kept verbatim.
 */
export interface IMaskToken {
    kind: TMaskTokenKind
    char: string
    consumer: boolean
}

/**
 * Public return shape of `useMask`.
 */
export interface IUseMaskReturn {
    masked: Ref<string>
    unmasked: Ref<string>
    isValid: Ref<boolean>
    complete: Ref<boolean>
    /**
     * Imperatively re-run the formatter on a raw value
     * (used by paste / external sync). Returns the new
     * `unmasked` so callers can keep their model in sync.
     */
    setRaw: (raw: string) => string
    /**
     * Currently resolved config (pattern + validator +
     * required). `null` when no mask is active.
     */
    config: Ref<IResolvedMaskConfig | null>
}
