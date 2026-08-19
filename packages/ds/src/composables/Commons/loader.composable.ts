import { computed, type ComputedRef } from 'vue'
import { LOADER_KIND } from '../../enums'
import type { ILoaderProps, IResolvedLoader } from '../../interfaces/Commons/loader.interface'
import type { TLoaderConfig, TLoaderKind } from '../../types/Commons/loader.type'
import { getCurrentInstanceName } from '../../utils/Commons/getCurrentInstance.util'

export type { IResolvedLoader } from '../../interfaces/Commons/loader.interface'

/**
 * Resolve the polymorphic `loading` prop into a normalised descriptor.
 *
 * Accepts `boolean | number | TLoaderConfig` and produces:
 * - `loaderClasses` — backward-compatible class map containing
 *   `${name}--loading` when active.
 * - `isLoading` — boolean ref, true when any loading state is active.
 * - `loaderConfig` — full `IResolvedLoader` descriptor used by the
 *   consumer to mount the correct renderer with the correct props.
 *
 * @param props - The component props extending `ILoaderProps`.
 * @param defaultKind - Renderer to use when the user passes `true` or a
 *   number (i.e. when no `type` discriminant was provided). Each consumer
 *   picks its preferred kind: `'circular'` for Btn, `'line'` for Card, etc.
 * @param name - Override the kebab-case component name used to build the
 *   `${name}--loading` class. Defaults to `getCurrentInstanceName()`.
 */

/*********************************************************
 * useLoader
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
