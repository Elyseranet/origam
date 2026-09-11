/**
 * Visual presets for `<OrigamEmptyState>`. Each preset bundles a
 * default icon + intent mapping so consumers do not need to wire those
 * by hand for the 95% case. The icon and intent can still be
 * overridden via the matching props when a one-off variation is
 * needed.
 *
 * - `no-data`     — generic "nothing to show yet" (empty collection).
 * - `no-results`  — search or filter returned nothing.
 * - `error`       — an operation failed; retry CTA is typical.
 * - `offline`     — connectivity issue; offline-mode CTA is typical.
 * - `locked`      — feature is gated (auth, plan, permissions).
 */
export type TEmptyStatePreset =
    | 'no-data'
    | 'no-results'
    | 'error'
    | 'offline'
    | 'locked'
