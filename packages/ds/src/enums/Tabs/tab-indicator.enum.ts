/**
 * Active-tab indicator style of `<OrigamTabs>`.
 *
 * Renamed from `TAB_VARIANT` (ADR-005, Q4) — the value is a behavioural
 * discriminant, not a style preset: `'underline'` mounts an extra DOM
 * element (`.origam-tab__indicator`, cf. `OrigamTab.vue`'s
 * `hasIndicator`), which no set of prop values can express.
 */
export enum TAB_INDICATOR {
    DEFAULT = 'default',
    PILLS = 'pills',
    UNDERLINE = 'underline'
}
