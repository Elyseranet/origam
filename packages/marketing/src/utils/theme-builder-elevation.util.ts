/**
 * theme-builder-elevation.util — shadow composer (Contrôle 4, `elevation-field.html`).
 *
 * Both "Autre" sub-modes write straight into the single `elevation` prop:
 *  - Option A (depth 0-24)  → a numeric Material-style value, already
 *    supported by `elevationToToken()` in `useElevation`.
 *  - Option B (full shadow) → a free-form `box-shadow` string, detected by
 *    `isCustomBoxShadow()` (verified live in
 *    `packages/ds/src/composables/Commons/elevation.composable.ts`, PR #210)
 *    and emitted verbatim — no more silent `parseInt` fallback to `none`.
 *
 * `isCustomBoxShadow` itself is imported from the DS (`origam/utils`), not
 * re-implemented — single source of truth for what "looks like a shadow".
 */
import type { IThemeBuilderShadowLayer } from '~/interfaces/theme-builder.interface'

/** A sane default single layer, matching the wireframe's État C bis defaults. */
export function createDefaultShadowLayer (): IThemeBuilderShadowLayer {
    return { x: 0, y: 4, blur: 10, spread: 0, color: '#000000', opacity: 35, inset: false }
}

/** `#rrggbb` + opacity(0-100) → `rgba(r, g, b, a)`. */
function hexToRgba (hex: string, opacityPct: number): string {
    const clean = hex.replace('#', '')
    const full = clean.length === 3
        ? clean.split('').map(c => c + c).join('')
        : clean.padEnd(6, '0').slice(0, 6)
    const r = parseInt(full.slice(0, 2), 16) || 0
    const g = parseInt(full.slice(2, 4), 16) || 0
    const b = parseInt(full.slice(4, 6), 16) || 0
    const a = Math.min(100, Math.max(0, opacityPct)) / 100
    return `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(2))})`
}

/** Serialise one shadow layer into a single `box-shadow` layer string. */
export function serializeShadowLayer (layer: IThemeBuilderShadowLayer): string {
    const inset = layer.inset ? 'inset ' : ''
    const color = layer.color.startsWith('#') ? hexToRgba(layer.color, layer.opacity) : layer.color
    return `${inset}${layer.x}px ${layer.y}px ${layer.blur}px ${layer.spread}px ${color}`
}

/** Serialise a full (possibly multi-layer) shadow — comma-joined layers, DS-compatible. */
export function serializeShadowLayers (layers: IThemeBuilderShadowLayer[]): string {
    return layers.map(serializeShadowLayer).join(', ')
}

/** Serialise the "Option A" quick depth slider (0-24) — a bare numeric string. */
export function serializeElevationDepth (depth: number): string {
    return String(Math.min(24, Math.max(0, Math.round(depth))))
}
