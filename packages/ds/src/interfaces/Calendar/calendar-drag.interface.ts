/**
 * Internal implementation detail of `<OrigamCalendar>`'s click + drag-select
 * wiring — NOT part of the component's public props/emits/slots surface.
 * Deliberately not re-exported from `src/interfaces/index.ts`: nothing
 * outside `OrigamCalendar.vue` consumes these shapes.
 */

/** In-progress month-view drag-select range (day granularity). */
export interface IDragMonthState {
    startDate: Date
    endDate: Date
}

/** In-progress week/day-view drag-select range (minute granularity within a day). */
export interface IDragSlotState {
    day: Date
    startMin: number
    endMin: number
}
