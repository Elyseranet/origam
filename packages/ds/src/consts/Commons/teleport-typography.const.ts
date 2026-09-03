/**
 * Element the field's REAL typography is measured from, resolved within
 * the field component's root.
 *
 * `.origam-field` is the one element every `<origam-text-field>`-based
 * field renders with a plain, unconditional `font-size` — the raw
 * `<input>` is NOT a safe measurement point (see `useTeleportTypography`
 * for why).
 */
export const TELEPORT_TYPOGRAPHY_MEASURE_SELECTOR = '.origam-field'

/**
 * {@link TELEPORT_TYPOGRAPHY_MEASURE_SELECTOR}'s OWN unstyled
 * `font-size` — the value `.origam-field` shows with zero consuming-app
 * CSS involved.
 *
 * When the measured size still equals this, nothing diverges and the
 * bridge stays a no-op, so every teleported surface keeps its own
 * historical default instead of being forced to this size on every open.
 */
export const TELEPORT_TYPOGRAPHY_NEUTRAL_FONT_SIZE = '16px'
