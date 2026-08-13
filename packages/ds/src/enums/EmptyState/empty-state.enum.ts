/**
 * Closed enum of valid `preset` values for `<OrigamEmptyState>`.
 *
 * Mirrors `TEmptyStatePreset` but exposes a runtime value usable in
 * iteration (`Object.values(EMPTY_STATE_PRESET)`), in stories, and in
 * defensive `switch` blocks. Members are kebab-cased to match the
 * string literal type — the goal is interchangeability with the type,
 * not stylistic uniformity with the rest of the enums folder.
 */
export enum EMPTY_STATE_PRESET {
    NO_DATA = 'no-data',
    NO_RESULTS = 'no-results',
    ERROR = 'error',
    OFFLINE = 'offline',
    LOCKED = 'locked'
}
