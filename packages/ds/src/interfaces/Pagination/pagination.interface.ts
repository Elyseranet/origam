import type { IBorderProps } from '../Commons/border.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { ISizeProps } from '../Commons/size.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

import type { TIcon } from '../../types/Icon/icon.type'

/**
 * Deliberately NOT `extends IAdjacentProps`. `IAdjacentProps` models a
 * single leading/trailing pair around one piece of content (`prependIcon`
 * / `appendIcon`); Pagination has FOUR fixed-purpose navigation icons
 * (first / prev / next / last), each a distinct semantic role rather than
 * a generic "start" / "end" slot. `prevIcon` / `nextIcon` are forwarded
 * as `prependIcon` / `appendIcon` props to the internal `<OrigamBtn>` nav
 * buttons (see `controls` computed in `OrigamPagination.vue`) — that's
 * `IBtnProps.IAdjacentProps` being consumed by the child, not a surface
 * this component itself exposes.
 */
export interface IPaginationProps extends ICommonsComponentProps, ITagProps, IColorProps, IBgColorProps, IBorderProps, IPaddingProps, IMarginProps, IElevationProps, ISizeProps, IDensityProps, Pick<ITypographyProps, 'fontSize' | 'fontWeight'> {
    start?: number
    modelValue?: number
    disabled?: boolean
    length?: number | string
    totalVisible?: number | string
    firstIcon?: TIcon
    prevIcon?: TIcon
    nextIcon?: TIcon
    lastIcon?: TIcon
    ariaLabel?: string
    pageAriaLabel?: string
    currentPageAriaLabel?: string
    firstAriaLabel?: string
    previousAriaLabel?: string
    nextAriaLabel?: string
    lastAriaLabel?: string
    ellipsis?: string
    showFirstLastPage?: boolean
    compact?: boolean
    pageText?: string
    ofText?: string
    /**
     * Toggle the "with info" mode — pagination then renders a left-side
     * range label `Showing {start}-{end} of {total}` next to the standard
     * list of page buttons. Requires `total` (and optionally `perPage`)
     * to compute meaningful start/end indices.
     */
    withInfo?: boolean
    /**
     * Total number of *items* (NOT pages). Drives the `withInfo` label —
     * "Showing 21-40 of {total}". When omitted while `withInfo` is true,
     * falls back to `length * perPage`.
     */
    total?: number | string
    /**
     * Number of items rendered on a single page. Used together with
     * `total` to compute the Showing N-M range. Defaults to 10 when
     * `withInfo` is enabled.
     */
    perPage?: number | string
    /** i18n key for the `withInfo` label. Receives `{0}=start`, `{1}=end`, `{2}=total`. */
    infoText?: string
    /**
     * Label rendered next to the prev chevron in `withInfo` mode.
     * Default falls back to the `origam.pagination.previous` i18n key
     * (`"Prev"` in English). Useful for setting a translated label
     * inline without touching the locale catalogue.
     */
    previousText?: string
    /**
     * Label rendered next to the next chevron in `withInfo` mode.
     * Default falls back to the `origam.pagination.next` i18n key
     * (`"Next"` in English).
     */
    nextText?: string
    /**
     * aria-label for the compact mode page number `<input>`. Falls back to
     * the `origam.pagination.aria_label.page_number` i18n key.
     *
     * @default 'origam.pagination.aria_label.page_number'
     */
    pageNumberAriaLabel?: string
}

/** Emits fired by `<OrigamPagination>` — current page v-model + the four
 *  navigation shortcuts (first / prev / next / last). */
export interface IPaginationEmits extends ICommonsComponentEmits {
    (e: 'first', value: number): void
    (e: 'prev', value: number): void
    (e: 'next', value: number): void
    (e: 'last', value: number): void
}

/**
 * Slot signatures for `<OrigamPagination>`. `first` / `prev` / `next` /
 * `last` receive the resolved `<OrigamBtn>` props bag spread as the
 * scope (`v-bind="{...controls.prev}"`, …) — a loose `Record` since the
 * bag mixes DS button props with internal wiring (`ref`, `onClick`,
 * `ellipsis`). Per-page overrides (`item-{key}` / `item`) are unscoped —
 * the template renders `<slot :name="…">` with no `v-bind`.
 */
export interface IPaginationSlots {
    info?: (data: { start: number, end: number, total: number }) => any
    first?: (props: Record<string, unknown>) => any
    prev?: (props: Record<string, unknown>) => any
    next?: (props: Record<string, unknown>) => any
    last?: (props: Record<string, unknown>) => any
    item?: () => any
    [key: `item-${string}`]: (() => any) | undefined
}
