import type { IGradient, IGradientStop } from '../../interfaces/Commons/gradient.interface'
import type { TColor, TIntent } from '../../types'

import { intentTokenBase, isIntent } from './color.util'

// ════════════════════════════════════════════════════════════════════════════
// Gradient support — `useColor` / `useBackgroundColor` / `useTextColor`
// transversal enrichment.
//
// Public surface:
//   - isGradient(value)        — type guard, accepts string OR IGradient.
//   - resolveGradient(value)   — returns a CSS `background-image` value.
//   - gradientFromObject(g)    — builds the CSS function call from IGradient.
//
// The composable layer keeps the legacy intent / hex / transparent paths;
// gradient detection runs FIRST so a value like `linear-gradient(...)` is
// never warned as a "legacy raw color".
// ════════════════════════════════════════════════════════════════════════════

/**
 * Three accepted gradient-string prefixes (matches the CSS spec).
 * `repeating-` variants are detected via prefix-stripping below.
 */
const GRADIENT_FN_RE = /^\s*(repeating-)?(linear|radial|conic)-gradient\s*\(/i

/**
 * Preset name convention: `gradient-{slug}` resolves to the CSS variable
 * `var(--origam-gradient---{slug})` emitted by Style Dictionary from
 * `tokens/semantic/{light,dark}.json`.
 */
const PRESET_PREFIX = 'gradient-'

function isGradientString (value: string): boolean {
    return GRADIENT_FN_RE.test(value)
}

function isPresetString (value: string): boolean {
    return value.startsWith(PRESET_PREFIX) && value.length > PRESET_PREFIX.length
}

function isGradientObject (value: unknown): value is IGradient {
    if (value === null || typeof value !== 'object') return false
    const obj = value as Partial<IGradient>
    const hasShortForm = typeof obj.from === 'string' && typeof obj.to === 'string'
    const hasStops = Array.isArray(obj.stops) && obj.stops.length >= 2
    return hasShortForm || hasStops
}

/**
 * Type guard: does `value` carry gradient semantics?
 *
 *   - Direct CSS function string (`linear-gradient(...)`, …).
 *   - Preset name (`gradient-sunset`).
 *   - {@link IGradient} object.
 *
 * Returns `false` for intents, hex colors, transparent, null, undefined.
 */
export function isGradient (value: unknown): boolean {
    if (typeof value === 'string') {
        return isGradientString(value) || isPresetString(value)
    }
    return isGradientObject(value)
}

/**
 * Resolve a single colour stop:
 *   - intent → `var(--origam-color__action--{intent}---bg)` (or feedback)
 *   - raw    → the value itself (hex, rgb, transparent, …)
 */
function resolveStopColor (color: TIntent | string): string {
    if (isIntent(color)) {
        return `var(--origam-color__${intentTokenBase(color)}---bg)`
    }
    return color
}

/**
 * Normalise the `direction` field of {@link IGradient} into the CSS
 * directional prefix expected at the front of the function args.
 *
 *   • `135`         → `'135deg'`
 *   • `'to right'`  → `'to right'`
 *   • `undefined` (linear) → `'135deg'` (design-system default)
 *   • For radial: `undefined` → `'circle at center'`.
 */
function resolveDirection (
    type: 'linear' | 'radial' | 'conic',
    direction: number | string | undefined
): string {
    if (direction === undefined || direction === null || direction === '') {
        if (type === 'radial') return 'circle at center'
        if (type === 'conic') return 'from 0deg at 50% 50%'
        return '135deg'
    }
    if (typeof direction === 'number') return `${direction}deg`
    return direction
}

/**
 * Build the CSS gradient function call from a structured {@link IGradient}
 * descriptor. Pure — no side effects, no warning.
 *
 *   { from: 'primary', to: 'success' }
 *     → 'linear-gradient(135deg, var(--origam-color__action--primary---bg), var(--origam-color__feedback--success---bg))'
 *
 *   { type: 'radial', stops: [{ color: '#fff', position: 0 }, { color: '#000', position: 100 }] }
 *     → 'radial-gradient(circle at center, #fff 0%, #000 100%)'
 */
export function gradientFromObject (g: IGradient): string {
    const type: 'linear' | 'radial' | 'conic' = g.type ?? 'linear'
    const directionPart = resolveDirection(type, g.direction)

    let stopsPart = ''
    if (Array.isArray(g.stops) && g.stops.length >= 2) {
        stopsPart = g.stops
            .map((s: IGradientStop) => `${resolveStopColor(s.color)} ${s.position}%`)
            .join(', ')
    } else if (g.from && g.to) {
        const parts: string[] = [resolveStopColor(g.from)]
        if (g.via) parts.push(resolveStopColor(g.via))
        parts.push(resolveStopColor(g.to))
        stopsPart = parts.join(', ')
    } else {
        // Degenerate input — emit a single-color "gradient" so the consumer
        // sees SOMETHING render instead of a CSS syntax error. This branch
        // is exceedingly defensive — `isGradientObject` already requires
        // either from+to or 2+ stops.
        stopsPart = 'transparent, transparent'
    }

    return `${type}-gradient(${directionPart}, ${stopsPart})`
}

/**
 * Resolve any gradient-flavoured input into a CSS `background-image`
 * value (the `linear-gradient(…)` / `radial-gradient(…)` / preset
 * `var(--origam-gradient---*)` string).
 *
 * Caller is responsible for wrapping it in the right declaration —
 * either `background-image: <value>` (default) or the `background-clip:
 * text` triad when applied to a foreground.
 *
 * Returns an empty string for non-gradient inputs (so callers can use
 * the return value as a truthiness check).
 */
export function resolveGradient (value: TColor | IGradient): string {
    if (value === null || value === undefined || value === false) return ''
    if (typeof value === 'string') {
        if (isGradientString(value)) return value
        if (isPresetString(value)) {
            const slug = value.slice(PRESET_PREFIX.length)
            return `var(--origam-gradient---${slug})`
        }
        return ''
    }
    if (isGradientObject(value)) return gradientFromObject(value)
    return ''
}
