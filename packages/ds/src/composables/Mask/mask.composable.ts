import { computed, isRef, MaybeRef, Ref, ref, unref, watch } from 'vue'

import type { IMaskOptions, IResolvedMaskConfig } from '../../interfaces'

import type { TMask } from '../../types'

import { applyMask, resolveMaskConfig, validatePattern } from '../../utils'

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

/**
 * Reactive mask engine — keeps `masked`, `unmasked`,
 * `isValid` and `complete` in sync with a source string
 * (`modelValue`) and a (possibly polymorphic) mask spec.
 *
 * Both the value and the mask are accepted as a `MaybeRef`
 * so the composable plays well with `props.modelValue` and
 * a static `props.mask` alike.
 *
 * Reactivity:
 *   - When `modelValue` changes → reformat + revalidate.
 *   - When `mask` changes      → re-resolve config, reformat
 *                                the current value.
 */
export function useMask (
    modelValue: MaybeRef<string | null | undefined>,
    mask: MaybeRef<TMask | undefined>
): IUseMaskReturn {
    const config = computed<IResolvedMaskConfig | null>(() => {
        return resolveMaskConfig(unref(mask) ?? null)
    })

    const masked = ref<string>('')
    const unmasked = ref<string>('')
    const complete = ref<boolean>(false)

    function recompute (raw: string | null | undefined): void {
        const cfg = config.value
        const source = raw ?? ''
        if (!cfg) {
            masked.value = source
            unmasked.value = source
            complete.value = false
            return
        }
        const r = applyMask(source, cfg.pattern)
        masked.value = r.masked
        unmasked.value = r.unmasked
        complete.value = r.complete
    }

    // Seed
    recompute(unref(modelValue))

    if (isRef(modelValue)) {
        watch(modelValue, (v) => recompute(v))
    }
    watch(config, () => recompute(unref(modelValue) ?? unmasked.value))

    const isValid = computed<boolean>(() => {
        const cfg = config.value
        if (!cfg) return true
        // empty + not required → considered valid
        if (!unmasked.value) return !cfg.required
        // not complete + required → invalid
        if (cfg.required && !complete.value) return false
        // not complete + not required → defer judgment to validator
        if (cfg.validator) {
            return validatePattern(unmasked.value, cfg.validator)
        }
        // no validator → valid iff complete OR not required
        return complete.value
    })

    function setRaw (raw: string): string {
        recompute(raw)
        return unmasked.value
    }

    return {
        masked,
        unmasked,
        isValid,
        complete,
        setRaw,
        config
    }
}

// Re-export for ergonomic import from a single path.
export type { IMaskOptions }
