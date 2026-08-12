/**
 * Visual variants applied to elevation-driven components (Btn, Card, Chip…).
 * Mirrors the Vuetify / origam-design-system taxonomy so consumers can swap
 * design systems without re-learning the API.
 */
export enum VARIANT {
    TEXT = 'text',
    FLAT = 'flat',
    ELEVATED = 'elevated',
    TONAL = 'tonal',
    OUTLINED = 'outlined',
    PLAIN = 'plain',
    /**
     * Glassmorphism — translucent tint of the current text color plus a
     * `backdropBlur` (`IBackdropProps`, ADR-005 Q1). Browsers without
     * `backdrop-filter` support simply render without the blur (no
     * `@supports` fallback rule — `useBackdrop` degrades gracefully on its
     * own, see `backdrop.composable.ts`). Pairs cleanly with
     * `color="primary"` etc. — the variant only owns the chrome, not the
     * foreground color.
     */
    GHOST = 'ghost'
}

/**
 * Visual variants specific to text input controls (TextField, NumberField,
 * PasswordField, etc.). Distinct from `VARIANT` because the rendering
 * conventions for inputs (filled / underlined / solo) differ from those of
 * action surfaces (elevated / tonal / outlined).
 */
export enum VARIANT_INPUT {
    UNDERLINED = 'underlined',
    FILLED = 'filled',
    SOLO = 'solo',
    OUTLINED = 'outlined',
    PLAIN = 'plain'
}
