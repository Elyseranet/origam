import { LOADER_KIND } from '../../enums/Commons/loader.enum'

import type { IProgressCircularProps } from '../../interfaces/Progress/progress-circular.interface'
import type { IProgressLinearProps } from '../../interfaces/Progress/progress-linear.interface'
import type { ISkeletonProps } from '../../interfaces/Skeleton/skeleton.interface'

/**
 * Loader kind — decides which renderer is mounted by the consumer
 * component when a loading state is active.
 */
export type TLoaderKind = `${LOADER_KIND}`

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
    | ({ type: `${LOADER_KIND.LINE}` } & Partial<IProgressLinearProps>)
    | ({ type: `${LOADER_KIND.CIRCULAR}` } & Partial<IProgressCircularProps>)
    | ({ type: `${LOADER_KIND.SKELETON}` } & Partial<ISkeletonProps>)

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

/*********************************************************
 * TControlLoaderConfig / TControlLoadingValue
 *
 * @description
 * Per-kind override config of a CONTROL (`OrigamBtn`, `OrigamSwitch`,
 * `OrigamField` and its derivatives). A control that is mid-action keeps its
 * label, its value and its input rendered: an action in flight is signalled
 * by an indicator (spinner / strip), never by a placeholder that stands in
 * for the control.
 *
 * @description
 * So the `skeleton` member of `TLoaderConfig` is REFUSED at compile time
 * here: `{ type: 'skeleton' }` is a type error on these components.
 * Skeleton placeholders stay available on the containers whose content
 * genuinely does not exist yet (Card, ExpansionPanel, DataTable).
 *
 * @description
 * `TControlLoadingValue` is the `loading` prop value a control accepts:
 * `TLoadingValue` minus the skeleton placeholder.
 ********************************************************/
export type TControlLoaderConfig = Exclude<TLoaderConfig, { type: `${LOADER_KIND.SKELETON}` }>

export type TControlLoadingValue = boolean | number | TControlLoaderConfig
