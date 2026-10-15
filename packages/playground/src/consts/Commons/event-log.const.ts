/**
 * How many emits the events panel keeps, newest first. A hovered Card emits
 * `update:hover` on every enter/leave, so an unbounded log grows for as long
 * as the pointer moves; the oldest entries are dropped past this bound.
 */
export const EVENT_LOG_LIMIT = 100

/** The prefix of a v-model emit — `update:modelValue` writes back `modelValue`. */
export const UPDATE_EMIT_PREFIX = 'update:'
