import { computed, isRef, MaybeRef, ref, unref, watch } from 'vue'

import type { IMaskOptions, IResolvedMaskConfig, IUseMaskReturn } from '../../interfaces/Commons/mask.interface'

import type { TMask } from '../../types/TextField/text-field.type'

import { applyMask } from '../../utils/Commons/apply-mask.util'
import { resolveMaskConfig } from '../../utils/Commons/resolve-mask-config.util'
import { validatePattern } from '../../utils/Commons/validate-pattern.util'

/*********************************************************
 * useMask
 *
 * @description
 * Moteur de masque reactif : maintient `masked`, `unmasked`, `isValid` et
 * `complete` synchronises avec une chaine source (`modelValue`) et une
 * config de masque (possiblement polymorphe, resolue par
 * `resolveMaskConfig`). `modelValue` et `mask` sont tous deux acceptes en
 * `MaybeRef`, donc utilisables directement avec `props.modelValue`/
 * `props.mask`. Un changement de `mask` re-resout la config ET reformate
 * la valeur courante ; un changement de `modelValue` reformate seulement.
 *
 * @description
 * `isValid` sans config de masque est toujours `true` (rien a valider).
 * Avec config : vide et non requis → valide ; requis et incomplet →
 * invalide ; un `validator` present tranche pour le cas incomplet non
 * requis ; sinon la validite suit simplement `complete`.
 ********************************************************/
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
export type { IMaskOptions, IUseMaskReturn }
