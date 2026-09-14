import { computed, type ComputedRef } from 'vue'
import { LOADER_KIND } from '../../enums'
import type { ILoaderProps, IResolvedLoader } from '../../interfaces/Commons/loader.interface'
import type { TLoaderConfig, TLoaderKind } from '../../types/Commons/loader.type'
import { getCurrentInstanceName } from '../../utils/Commons/getCurrentInstance.util'

export type { IResolvedLoader } from '../../interfaces/Commons/loader.interface'

/*********************************************************
 * useLoader
 *
 * @description
 * Resout la prop polymorphe `loading` (`boolean | number | TLoaderConfig`)
 * en un descripteur normalise : `loaderClasses` (`{name}--loading`),
 * `isLoading` (booleen), et `loaderConfig` (kind, `modelValue`,
 * `indeterminate`, `overrides`) que le composant utilise pour monter le
 * bon renderer. `defaultKind` est choisi par CHAQUE consommateur —
 * `'circular'` pour Btn, `'line'` pour Card, etc. — utilise quand
 * `loading` est `true`/un nombre plutot qu'un objet `{ type }`.
 *
 * @description
 * Determinisme derive de la FORME de la valeur, pas d'un flag explicite :
 * `loading={true}` → indetermine ; `loading={42}` → determine a 42 ;
 * `loading={{ type: 'line', modelValue: 42 }}` → determine ; `loading=
 * {{ type: 'line' }}` (sans `modelValue`) → indetermine. Un objet SANS
 * `type` est traite comme "pas d'objet reconnu" et retombe sur l'etat
 * inactif.
 ********************************************************/
export function useLoader (
    props: ILoaderProps,
    defaultKind: TLoaderKind = LOADER_KIND.CIRCULAR,
    name = getCurrentInstanceName()
): {
    loaderClasses: ComputedRef<Record<string, boolean>>
    isLoading: ComputedRef<boolean>
    loaderConfig: ComputedRef<IResolvedLoader>
} {
    const isLoading = computed(() => {
        const v = props.loading
        if (v === false || v === undefined || v === null) return false
        return true
    })

    const loaderClasses = computed(() => ({
        [`${name}--loading`]: isLoading.value
    }))

    const loaderConfig = computed<IResolvedLoader>(() => {
        const v = props.loading

        // `true` → use defaultKind, indeterminate.
        if (v === true) {
            return {
                isActive: true,
                kind: defaultKind,
                modelValue: undefined,
                indeterminate: true,
                overrides: {} as never
            }
        }

        // number → use defaultKind, determinate at the given value.
        if (typeof v === 'number') {
            return {
                isActive: true,
                kind: defaultKind,
                modelValue: v,
                indeterminate: false,
                overrides: {} as never
            }
        }

        // object → explicit kind + per-instance overrides.
        if (v && typeof v === 'object' && 'type' in v) {
            const { type, ...rest } = v as TLoaderConfig
            // determinate iff `modelValue` provided in override
            const mv = (rest as { modelValue?: number }).modelValue
            return {
                isActive: true,
                kind: type,
                modelValue: typeof mv === 'number' ? mv : undefined,
                indeterminate: typeof mv !== 'number',
                overrides: rest as Omit<TLoaderConfig, 'type'>
            }
        }

        // false / undefined / null → no loading.
        return {
            isActive: false,
            kind: defaultKind,
            modelValue: undefined,
            indeterminate: true,
            overrides: {} as never
        }
    })

    return { loaderClasses, isLoading, loaderConfig }
}
