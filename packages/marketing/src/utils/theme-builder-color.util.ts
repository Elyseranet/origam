/**
 * theme-builder-color.util — intent/custom classification for the Color
 * control (Contrôle 1, `color-field.html`), shared by `color`, `accentColor`
 * and (embedded) `borderColor`.
 */
import { THEME_BUILDER_INTENT_VALUES } from '~/consts/theme-builder-controls.const'
import type { IThemeBuilderColorState } from '~/interfaces/theme-builder.interface'

/** Whether a raw prop value is one of the 8 real `TIntent` values. */
export function isThemeBuilderIntentValue (value: unknown): value is string {
    return typeof value === 'string' && THEME_BUILDER_INTENT_VALUES.has(value)
}

/** Whether a string looks like a hex color (`#abc` / `#aabbcc`). */
export function isThemeBuilderHexColor (value: unknown): value is string {
    return typeof value === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
}

/**
 * Classify a raw prop value (or `undefined`/`''` for "not edited yet") into
 * an editor state. Any non-intent, non-empty string is treated as a custom
 * color (hex/rgb/hsl/var(...) — the DS `TColor` union accepts all of them).
 */
export function resolveThemeBuilderColorState (rawValue: unknown): IThemeBuilderColorState {
    if (rawValue === undefined || rawValue === null || rawValue === '') {
        return { mode: 'inherit' }
    }
    if (isThemeBuilderIntentValue(rawValue)) {
        return { mode: 'intent', intent: rawValue }
    }
    if (typeof rawValue === 'string') {
        return { mode: 'custom', custom: rawValue }
    }
    return { mode: 'inherit' }
}
