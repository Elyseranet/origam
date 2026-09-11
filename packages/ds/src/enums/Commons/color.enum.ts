/**
 * Interaction role for state-aware color resolution.
 *
 * Used by `useColorEffect` (and its helpers) to pick the right token
 * rung / math-derivation for a given visual state:
 *
 *   • `default`  → resting bgColor (no transformation)
 *   • `hover`    → cascading `var(bgHover, color-mix(bg, black 20%))`
 *   • `active`   → cascading `var(bgActive, color-mix(bg, black 30%))`
 *   • `disabled` → resting `bgDisabled` token (per-intent)
 */
export enum BG_FG_ROLE {
    DEFAULT = 'default',
    HOVER = 'hover',
    ACTIVE = 'active',
    DISABLED = 'disabled'
}
