/**
 * `IPasswordRequirement` — descriptor for ONE rule shown in the
 * requirements checklist / tile grid of `<OrigamPasswordField>`.
 *
 * Each rule is rendered as either:
 *   - a `<li>` row (when `requirementsLayout="list"`, default), or
 *   - an `<OrigamChip>` tile (when `requirementsLayout="tiles"`).
 *
 * The `test()` function is evaluated reactively against the current
 * password value. When it returns `true`, the row/tile flips to its
 * "satisfied" state (success icon + intent="success").
 *
 * Distinct from the legacy `REQUIREMENT_*` const family, which is
 * regex-based and used by the popup-menu mode kept for backwards
 * compatibility. The new checklist/tiles API is value-agnostic and
 * lets consumers compose arbitrary predicates (entropy, dictionary
 * hits, breach lookups, etc.).
 */
export interface IPasswordRequirement {
    /** Stable id (used as `:key` and as `data-cy` suffix in stories). */
    id: string
    /** Human-readable label rendered next to the check/cross icon. */
    label: string
    /*********************************************************
     * Locale key resolved with `t()` instead of `label` (used by the DS defaults).
     ********************************************************/
    labelKey?: string
    /*********************************************************
     * Params for `labelKey` (e.g. `{count}`).
     ********************************************************/
    labelParams?: Record<string, string | number>
    /**
     * Predicate evaluated against the current password value.
     * Return `true` when the rule is satisfied.
     */
    test: (value: string) => boolean
}
