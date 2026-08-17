import type { IColorProps, ICommonsComponentProps, ITagProps } from '../../interfaces'
import type { TLoaderConfig, TLoaderKind, TLoadingValue } from '../../types'

export interface ILoaderProps extends ICommonsComponentProps, ITagProps, IColorProps {
    loading?: TLoadingValue
    loadingText?: string
}

/** Slot signatures for `<OrigamLoader>`. */
export interface ILoaderSlots {
    loader?: () => any
    default?: () => any
}

/**
 * Resolved loader state — what each consumer component reads to decide
 * which renderer to mount and with which props.
 *
 * @remarks
 * `overrides` is intentionally typed as `Omit<TLoaderConfig, 'type'>`. After
 * the discriminant `type` is destructured at runtime, TypeScript can no
 * longer narrow the union. Consumer components must access optional fields
 * defensively (e.g. `(overrides as { modelValue?: number }).modelValue`).
 */
export interface IResolvedLoader {
    /** Whether ANY loading state is active. */
    isActive: boolean
    /** Which renderer to use ('line' / 'circular' / 'skeleton'). */
    kind: TLoaderKind
    /** Determinate progress value (0..100) when the user passed a number; else undefined. */
    modelValue: number | undefined
    /** Indeterminate when `true`, determinate when a number was passed. */
    indeterminate: boolean
    /** Per-kind override props the consumer should v-bind on the renderer. */
    overrides: Omit<TLoaderConfig, 'type'>
}
