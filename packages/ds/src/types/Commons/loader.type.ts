import type {
    IProgressCircularProps,
    IProgressLinearProps,
    ISkeletonProps
} from '../../interfaces'

/**
 * Loader kind — decides which renderer is mounted by the consumer
 * component when a loading state is active.
 */
export type TLoaderKind = 'line' | 'circular' | 'skeleton'

/**
 * Per-kind override config. Each kind extends the corresponding component's
 * Partial props so the consumer gets full IDE autocomplete for the right
 * override surface (e.g. `size: 32` is valid for circular but not for line).
 *
 * NOTE: when consumed via `useLoader`, the discriminant `type` is stripped
 * by destructuring. Downstream code receives `Omit<TLoaderConfig, 'type'>`,
 * which TS cannot narrow further — access optional fields like `modelValue`
 * defensively.
 */
export type TLoaderConfig =
    | ({ type: 'line' } & Partial<IProgressLinearProps>)
    | ({ type: 'circular' } & Partial<IProgressCircularProps>)
    | ({ type: 'skeleton' } & Partial<ISkeletonProps>)

/**
 * The full `loading` prop value accepted by every consumer component.
 *
 * | Input value                                    | Meaning                                                              |
 * |------------------------------------------------|----------------------------------------------------------------------|
 * | `false` / `undefined`                          | Not loading.                                                         |
 * | `true`                                         | Loading with the component's preferred kind, indeterminate.          |
 * | `42` (number, 0..100)                          | Loading with the component's preferred kind, determinate at 42 %.    |
 * | `{ type: 'line' \| 'circular' \| 'skeleton', … }` | Loading with explicit kind override and per-instance prop overrides. |
 */
export type TLoadingValue = boolean | number | TLoaderConfig
