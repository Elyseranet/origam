import type {
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IDimensionProps,
    IElevationProps,
    IEvent,
    IMarginProps,
    IPaddingProps,
    IRoundedProps
} from '../../interfaces'

import type {
    TCalendarNavigate,
    TCalendarTimeFormat,
    TCalendarView,
    TIntent
} from '../../types'

/**
 * Props for `<OrigamCalendar>`. Two-way bindings on `view` and
 * `currentDate` so the parent can sync with router state or persist
 * across page reloads without owning a watcher.
 *
 * The full cross-cutting surface (color, bgColor, rounded, elevation,
 * border, density, dimension, padding, margin) is inherited from the
 * Commons interfaces and consumed via the standard composables, so the
 * calendar paints / sizes / spaces like any other origam component.
 */
export interface ICalendarComponentProps
    extends ICommonsComponentProps,
        IColorProps,
        IBgColorProps,
        IRoundedProps,
        IElevationProps,
        IBorderProps,
        IDensityProps,
        IDimensionProps,
        IPaddingProps,
        IMarginProps {
    /** Active view mode. v-model:view. */
    view?: TCalendarView
    /** Anchor date. v-model:currentDate. */
    currentDate?: Date | string
    /** Event list. Recurring events are expanded internally. */
    events?: Array<IEvent>
    /**
     * First weekday rendered as the leftmost column. `1` (Monday) for
     * EU/ISO, `0` (Sunday) for US. Default `1`.
     */
    firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    /** Clock format for time labels. Default `'24h'`. */
    timeFormat?: TCalendarTimeFormat
    /** BCP 47 locale tag — drives weekday / month names. */
    locale?: string
    /** Enable drag-select on the grid. Default `true`. */
    selectable?: boolean
    /**
     * Which property of `IEvent` to read for colouring. Default
     * `'category'`. Setting to `'color'` makes the calendar use the
     * direct override exclusively.
     */
    eventColorKey?: 'category' | 'color' | string
    /**
     * Map category string → intent / CSS colour. Skip the prop to
     * fall back to the neutral surface for all categories.
     */
    categoryColors?: Record<string, TIntent | string>
    /** Tint Saturday + Sunday in month / week views. Default `true`. */
    weekendHighlight?: boolean
    /**
     * Render a leading ISO week-number column. Useful for project /
     * billing calendars. Default `false`.
     */
    showWeekNumbers?: boolean
    /** First hour rendered in week / day views. Default `0`. */
    dayStartHour?: number
    /** Last hour rendered in week / day views. Default `24`. */
    dayEndHour?: number
    /**
     * Minutes per row in the timeline. `30` for half-hour granularity
     * (default), `15` for fine-grained drag-create, `60` for compact.
     */
    slotDuration?: number
    /** Lower navigation bound. The toolbar disables `<` past this. */
    minDate?: Date | string
    /** Upper navigation bound. The toolbar disables `>` past this. */
    maxDate?: Date | string
    /**
     * Cells to grey out. Accepts an array (Dates or ISO strings) or a
     * predicate when the disabling rule is too dynamic to enumerate.
     */
    disabledDates?: Array<Date | string> | ((d: Date) => boolean)
}

/**
 * Default values applied by `<OrigamCalendar>` and consumed by the
 * composable. Kept here as a single source of truth for the
 * "non-undefined" prop surface — the SFC still inlines the literals
 * inside `withDefaults` (cf. CLAUDE.md rule), this interface is for
 * the composable to type its merged options.
 */
export interface IResolvedCalendarOptions {
    view: TCalendarView
    currentDate: Date
    events: Array<IEvent>
    firstDayOfWeek: number
    timeFormat: TCalendarTimeFormat
    locale: string
    selectable: boolean
    eventColorKey: string
    categoryColors: Record<string, TIntent | string>
    weekendHighlight: boolean
    showWeekNumbers: boolean
    dayStartHour: number
    dayEndHour: number
    slotDuration: number
    minDate: Date | null
    maxDate: Date | null
    disabledDatesPredicate: (date: Date) => boolean
}

/**
 * Emits surfaced by `<OrigamCalendar>`. Mirrors the doc — every
 * payload is plain serialisable data (Date instances + the original
 * event reference) so consumers can forward them through a Pinia
 * action or a websocket without unwrapping refs.
 */
export interface ICalendarEmits {
    (e: 'update:view', view: TCalendarView): void
    (e: 'update:currentDate', date: Date): void
    (e: 'event-click', event: IEvent, originalDOMEvent: MouseEvent): void
    (e: 'date-click', date: Date): void
    (e: 'range-select', start: Date, end: Date): void
    (e: 'create-event-request', start: Date, end: Date): void
    (e: 'view-change', view: TCalendarView): void
    (e: 'navigate', direction: TCalendarNavigate): void
}

/**
 * Slot signatures. The default toolbar can be replaced wholesale via
 * `#header`, individual day cells via `#day` / `#dayHeader`, and the
 * event card via `#event`. Empty agenda state via `#empty`.
 */
export interface ICalendarSlots {
    header?: (bindings: ICalendarHeaderSlotBindings) => any
    event?: (bindings: ICalendarEventSlotBindings) => any
    day?: (bindings: ICalendarDaySlotBindings) => any
    dayHeader?: (bindings: { date: Date }) => any
    empty?: (bindings: { view: TCalendarView }) => any
}

/** Bindings handed to the `#event` slot — one per visible event. */
export interface ICalendarEventSlotBindings {
    event: IEvent
    view: TCalendarView
    isPast: boolean
    isToday: boolean
}

/** Bindings handed to the `#day` slot — one per cell in month view. */
export interface ICalendarDaySlotBindings {
    date: Date
    events: Array<IEvent>
    isToday: boolean
    isPast: boolean
    isOutside: boolean
    isWeekend: boolean
    isDisabled: boolean
}

/** Bindings handed to the `#header` slot — full toolbar replacement. */
export interface ICalendarHeaderSlotBindings {
    view: TCalendarView
    title: string
    canPrev: boolean
    canNext: boolean
    setView: (next: TCalendarView) => void
    navigate: (direction: TCalendarNavigate) => void
}

/** Composable options — strict version of the props after defaulting. */
export interface IUseCalendarOptions {
    events: () => Array<IEvent>
    view: () => TCalendarView
    currentDate: () => Date
    firstDayOfWeek: () => number
    slotDuration: () => number
    dayStartHour: () => number
    dayEndHour: () => number
    minDate?: () => Date | null
    maxDate?: () => Date | null
    locale?: () => string
}
