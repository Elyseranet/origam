/**
 * Interaction role for state-aware color resolution.
 *
 * Used by `useColorEffect` / `useStateEffect` (and their helpers) to pick
 * the right token rung / math-derivation for a given visual state:
 *
 *   • `default`  → resting bgColor (no transformation)
 *   • `hover`    → cascading `var(bgHover, color-mix(bg, black 20%))`
 *   • `active`   → cascading `var(bgActive, color-mix(bg, black 30%))`
 *
 * ⛔ There is deliberately NO `disabled` member — #823. Disabled is an
 * OPACITY VEIL in this DS, never a token swap: both composables compute
 * `bgRole` from `isHover` / `isActive` alone and read `isDisabled` only to
 * keep the dependency wired. A `disabled` rung would resolve
 * `--origam-color__feedback--{intent}---bgDisabled` / `---fgDisabled`,
 * which NO sheet declares for the four `feedback` intents (`action.*` has
 * them, `feedback.*` does not — see `docs/integrations/theming-authoring.md`).
 * A `var()` that fails at computed-value time does not fall back: the
 * declaration has already won the cascade, becomes `unset`, and ERASES the
 * surface instead of yielding it (the #813 / #568 mechanism).
 */
export enum BG_FG_ROLE {
    DEFAULT = 'default',
    HOVER = 'hover',
    ACTIVE = 'active'
}
