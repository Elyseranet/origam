import { BUILT_IN_PATTERN_KEYS, BUILT_IN_PATTERNS } from '../../consts'

import type { IMaskOptions, IResolvedMaskConfig } from '../../interfaces'

import type { TBuiltInPattern, TMask } from '../../types'

/**
 * Normalise the polymorphic `mask` prop / arg into a fully
 * resolved `{ pattern, validator, required }` object.
 *
 * - `null | undefined | ''` → returns `null`. Callers treat
 *   this as "no masking".
 * - `string`                → either a registered built-in
 *                             key (looked up) or a raw
 *                             pattern (used verbatim).
 * - `IMaskOptions`          → consumed as-is, with `required`
 *                             defaulting to `false`.
 */
export function resolveMaskConfig (
    mask: TMask | undefined
): IResolvedMaskConfig | null {
    if (mask == null || mask === '') return null

    if (typeof mask === 'string') {
        if (BUILT_IN_PATTERN_KEYS.has(mask)) {
            const preset = BUILT_IN_PATTERNS[mask as TBuiltInPattern]
            return {
                pattern: preset.pattern,
                validator: preset.validator ?? null,
                required: preset.required ?? false
            }
        }
        return {pattern: mask, validator: null, required: false}
    }

    const opts = mask as IMaskOptions
    return {
        pattern: opts.pattern,
        validator: opts.validator ?? null,
        required: opts.required ?? false
    }
}
